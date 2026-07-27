"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { FileDrop } from "@/components/FileDrop";
import { trackToolCompleted } from "@/lib/analytics";
import { hasWorkers } from "@/lib/capabilities";
import { fileStem, formatBytes } from "@/lib/format";
import { fill } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries/en";
import { toSrt, toVtt, type Cue } from "@/lib/subtitles/subtitle-core";
import {
  ENGINE_BYTES,
  MAX_LINES,
  MODEL_BYTES,
  TRANSLATE_LANGUAGES,
  estimateSeconds,
  parseSubtitles,
  type TranslateLanguage,
  type TranslateProgress,
} from "@/lib/translate/translate-core";
import { useCapability } from "@/lib/use-capability";
import type {
  WorkerRequest,
  WorkerRequestPayload,
  WorkerResponse,
} from "./subtitle-translate.worker";

type Ui = Dictionary["tools"]["subtitle-translate"]["ui"];
type Common = Dictionary["common"];

interface Loaded {
  name: string;
  cues: Cue[];
}

interface Result {
  cues: Cue[];
  seconds: number;
  calls: number;
  stopped: boolean;
  /** 내려받기 링크. **렌더 중에 만들지 않는다** — 그러면 다시 그릴 때마다 새 URL 이 샌다. */
  srt: string;
  vtt: string;
}

function textUrl(text: string): string {
  return URL.createObjectURL(new Blob([text], { type: "text/plain;charset=utf-8" }));
}

/**
 * 걸릴 시간을 사람 말로 적는다. 단위 낱말은 **사전이 갖는다** — 컴포넌트에
 * "분" 을 적으면 나머지 다섯 언어에서 한국어가 새어 나온다.
 */
function duration(seconds: number, ui: Ui): string {
  return seconds >= 60
    ? fill(ui.unitMinutes, { value: Math.round(seconds / 60) })
    : fill(ui.unitSeconds, { value: Math.round(seconds) });
}

export function SubtitleTranslator({
  ui,
  common,
  defaultTarget,
}: {
  ui: Ui;
  common: Common;
  defaultTarget: TranslateLanguage;
}) {
  const [broken, setBroken] = useState(false);
  const capable = useCapability(hasWorkers);
  const supported = capable === null ? null : capable && !broken;

  const [loaded, setLoaded] = useState<Loaded | null>(null);
  const [from, setFrom] = useState<TranslateLanguage>("en");
  const [to, setTo] = useState<TranslateLanguage>(defaultTarget);
  const [progress, setProgress] = useState<TranslateProgress | null>(null);
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const workerRef = useRef<Worker | null>(null);
  const pendingRef = useRef(
    new Map<number, { resolve: (v: WorkerResponse) => void; reject: (e: Error) => void }>(),
  );
  const rpcId = useRef(0);
  const resultRef = useRef<Result | null>(null);
  useEffect(() => {
    resultRef.current = result;
  }, [result]);

  const revoke = useCallback(() => {
    const previous = resultRef.current;
    if (!previous) return;
    for (const url of [previous.srt, previous.vtt]) URL.revokeObjectURL(url);
  }, []);

  const callWorker = useCallback((request: WorkerRequestPayload): Promise<WorkerResponse> => {
    const worker = workerRef.current;
    if (!worker) return Promise.reject(new Error("NO_WORKER"));
    const id = ++rpcId.current;
    return new Promise((resolve, reject) => {
      pendingRef.current.set(id, { resolve, reject });
      worker.postMessage({ ...request, id } as WorkerRequest);
    });
  }, []);

  useEffect(() => {
    if (!capable) return;
    const pending = pendingRef.current;
    let worker: Worker;
    try {
      worker = new Worker(new URL("./subtitle-translate.worker.ts", import.meta.url), {
        type: "module",
      });
    } catch {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setBroken(true);
      return;
    }
    workerRef.current = worker;
    worker.onmessage = (event: MessageEvent<WorkerResponse>) => {
      const message = event.data;
      if (message.kind === "progress") {
        setProgress(message.progress);
        return;
      }
      const entry = pendingRef.current.get(message.id);
      if (!entry) return;
      pendingRef.current.delete(message.id);
      if (message.kind === "failed") entry.reject(new Error(message.message));
      else entry.resolve(message);
    };
    return () => {
      worker.terminate();
      workerRef.current = null;
      pending.clear();
    };
  }, [capable]);

  useEffect(() => {
    return () => {
      const previous = resultRef.current;
      if (!previous) return;
      for (const url of [previous.srt, previous.vtt]) URL.revokeObjectURL(url);
    };
  }, []);

  const addFiles = useCallback(
    async (files: File[]) => {
      if (files.length === 0) return;
      setProgress(null);
      revoke();
      setResult(null);

      const file = files[0];
      const cues = parseSubtitles(await file.text());
      if (cues.length === 0) {
        setError(ui.errUnreadable);
        setLoaded(null);
        return;
      }
      setError(null);
      setLoaded({ name: file.name, cues });
    },
    [revoke, ui],
  );

  const run = useCallback(async () => {
    if (!loaded) return;
    setBusy(true);
    setError(null);
    try {
      const response = await callWorker({
        kind: "translate",
        cues: loaded.cues,
        options: { from, to },
      });
      if (response.kind !== "done") throw new Error("UNKNOWN");
      revoke();
      setResult({
        cues: response.cues,
        seconds: response.seconds,
        calls: response.calls,
        stopped: response.stopped,
        srt: textUrl(toSrt(response.cues)),
        vtt: textUrl(toVtt(response.cues)),
      });
      trackToolCompleted("subtitle-translate");
    } catch (caught) {
      const message = caught instanceof Error ? caught.message : "UNKNOWN";
      setError(
        message === "ENGINE_FAILED"
          ? ui.errEngine
          : message === "MODEL_FAILED"
            ? ui.errModel
            : message === "TOO_MANY_LINES"
              ? fill(ui.errTooManyLines, { lines: MAX_LINES })
              : message === "EMPTY"
                ? ui.errUnreadable
                : ui.errGeneric,
      );
    } finally {
      setBusy(false);
      setProgress(null);
    }
  }, [callWorker, from, loaded, revoke, to, ui]);

  const stop = useCallback(() => {
    workerRef.current?.postMessage({ kind: "stop" } as WorkerRequest);
  }, []);

  if (supported === false) {
    return (
      <div className="rounded-xl border border-border bg-panel p-6">
        <p className="font-medium text-warn">{common.workerUnsupportedTitle}</p>
        <p className="mt-2 text-sm text-muted">{common.workerUnsupportedHint}</p>
      </div>
    );
  }

  const stageText = progress
    ? progress.stage === "model"
      ? fill(ui.stageModel, { percent: Math.round(progress.ratio * 100) })
      : fill(ui.stageTranslating, { done: progress.done ?? 0, total: progress.total ?? 0 })
    : null;

  const stem = loaded ? fileStem(loaded.name) : "subtitles";
  const tooLong = loaded !== null && loaded.cues.length > MAX_LINES;

  return (
    <div className="space-y-6">
      <FileDrop
        accept=".srt,.vtt,text/vtt,application/x-subrip"
        onFiles={addFiles}
        label={ui.dropLabel}
        hint={ui.dropHint}
        cta={common.chooseFile}
        disabled={busy}
      />

      <div className="grid gap-4 rounded-xl border border-border bg-panel p-5 sm:grid-cols-2">
        <label className="space-y-1.5">
          <span className="block text-sm text-muted">{ui.fromLabel}</span>
          <select
            value={from}
            disabled={busy}
            onChange={(event) => setFrom(event.target.value as TranslateLanguage)}
            className="w-full rounded-lg border border-border bg-bg px-3 py-2 text-sm"
          >
            {TRANSLATE_LANGUAGES.map((value) => (
              <option key={value} value={value}>
                {ui.languageNames[value]}
              </option>
            ))}
          </select>
        </label>

        <label className="space-y-1.5">
          <span className="block text-sm text-muted">{ui.toLabel}</span>
          <select
            value={to}
            disabled={busy}
            onChange={(event) => setTo(event.target.value as TranslateLanguage)}
            className="w-full rounded-lg border border-border bg-bg px-3 py-2 text-sm"
          >
            {TRANSLATE_LANGUAGES.map((value) => (
              <option key={value} value={value}>
                {ui.languageNames[value]}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="space-y-1 text-sm text-muted" data-notes>
        <p>
          {fill(ui.downloadNote, { size: formatBytes(ENGINE_BYTES + MODEL_BYTES) })} {ui.cachedNote}
        </p>
        {/* 실패 모드를 미리 말한다 — 관용구에서 미끄러진다 */}
        <p className="text-warn" data-quality-note>
          {ui.qualityNote}
        </p>
      </div>

      {loaded && (
        <div className="space-y-3">
          <p className="text-sm text-muted tabular-nums" data-loaded>
            {fill(ui.loadedSummary, {
              lines: loaded.cues.length,
              estimate: duration(estimateSeconds(loaded.cues), ui),
            })}
          </p>
          {tooLong && (
            <p className="text-sm text-err">{fill(ui.errTooManyLines, { lines: MAX_LINES })}</p>
          )}
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={run}
              disabled={busy || tooLong || from === to}
              className="rounded-lg bg-accent px-5 py-2.5 text-sm font-medium text-accent-fg disabled:opacity-50"
            >
              {busy ? ui.working : ui.run}
            </button>
            {busy && (
              <button
                type="button"
                onClick={stop}
                data-stop
                className="rounded-lg border border-border px-4 py-2 text-sm font-medium"
              >
                {ui.stop}
              </button>
            )}
            <span className="min-w-0 truncate text-sm text-muted">{loaded.name}</span>
          </div>
          {from === to && <p className="text-sm text-muted">{ui.sameLanguage}</p>}
        </div>
      )}

      {stageText && <p className="text-sm text-muted tabular-nums">{stageText}</p>}
      {error && <p className="text-sm text-err">{error}</p>}

      {result && (
        <div className="space-y-4 rounded-xl border border-border p-4">
          <p className="text-xs text-muted tabular-nums" data-summary>
            {fill(ui.resultSummary, {
              lines: result.cues.length,
              calls: result.calls,
              seconds: result.seconds.toFixed(1),
            })}
            {result.stopped ? ` · ${ui.stoppedNote}` : ""}
          </p>

          <ul className="max-h-80 space-y-2 overflow-y-auto text-sm" data-cues>
            {result.cues.map((cue, index) => (
              <li key={index} className="flex gap-3">
                <span className="shrink-0 tabular-nums text-muted">
                  {Math.floor(cue.start / 60)}:{String(Math.floor(cue.start % 60)).padStart(2, "0")}
                </span>
                <span>{cue.text}</span>
              </li>
            ))}
          </ul>

          <div className="flex flex-wrap gap-3">
            <a
              href={result.srt}
              download={`${stem}.${to}.srt`}
              className="rounded-lg border border-border px-4 py-2 text-sm font-medium"
            >
              {ui.downloadSrt}
            </a>
            <a
              href={result.vtt}
              download={`${stem}.${to}.vtt`}
              className="rounded-lg border border-border px-4 py-2 text-sm font-medium"
            >
              {ui.downloadVtt}
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
