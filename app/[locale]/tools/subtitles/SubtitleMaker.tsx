"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { FileDrop } from "@/components/FileDrop";
import { trackToolCompleted } from "@/lib/analytics";
import { hasWorkers } from "@/lib/capabilities";
import { fileStem, formatBytes } from "@/lib/format";
import { fill } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries/en";
import {
  ENGINE_BYTES,
  MAX_SECONDS,
  MODEL_BYTES,
  SUBTITLE_LANGUAGES,
  SUBTITLE_MODELS,
  toSrt,
  toVtt,
  type Cue,
  type SubtitleLanguage,
  type SubtitleModel,
  type SubtitleProgress,
} from "@/lib/subtitles/subtitle-core";
import { useCapability } from "@/lib/use-capability";
import type { WorkerRequest, WorkerRequestPayload, WorkerResponse } from "./subtitles.worker";

type Ui = Dictionary["tools"]["subtitles"]["ui"];
type Common = Dictionary["common"];

interface Result {
  cues: Cue[];
  durationSec: number;
  runtime: "webgpu" | "wasm";
  seconds: number;
  /** 내려받기 링크. **렌더 중에 만들지 않는다** — 그러면 다시 그릴 때마다 새 URL 이 샌다. */
  srt: string;
  vtt: string;
  txt: string;
}

function textUrl(text: string): string {
  return URL.createObjectURL(new Blob([text], { type: "text/plain;charset=utf-8" }));
}

function clock(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${minutes}:${String(secs).padStart(2, "0")}`;
}

export function SubtitleMaker({
  ui,
  common,
  defaultLanguage,
}: {
  ui: Ui;
  common: Common;
  defaultLanguage: SubtitleLanguage;
}) {
  const [broken, setBroken] = useState(false);
  const capable = useCapability(hasWorkers);
  const supported = capable === null ? null : capable && !broken;

  const [file, setFile] = useState<File | null>(null);
  const [model, setModel] = useState<SubtitleModel>("fast");
  const [language, setLanguage] = useState<SubtitleLanguage>(defaultLanguage);
  const [progress, setProgress] = useState<SubtitleProgress | null>(null);
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
    for (const url of [previous.srt, previous.vtt, previous.txt]) URL.revokeObjectURL(url);
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
      worker = new Worker(new URL("./subtitles.worker.ts", import.meta.url), { type: "module" });
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
      for (const url of [previous.srt, previous.vtt, previous.txt]) URL.revokeObjectURL(url);
    };
  }, []);

  const addFiles = useCallback((files: File[]) => {
    if (files.length === 0) return;
    setError(null);
    setProgress(null);
    revoke();
    setResult(null);
    setFile(files[0]);
  }, [revoke]);

  const run = useCallback(async () => {
    if (!file) return;
    setBusy(true);
    setError(null);
    try {
      const response = await callWorker({ kind: "transcribe", file, options: { model, language } });
      if (response.kind !== "done") throw new Error("UNKNOWN");
      revoke();
      setResult({
        cues: response.cues,
        durationSec: response.durationSec,
        runtime: response.runtime,
        seconds: response.seconds,
        srt: textUrl(toSrt(response.cues)),
        vtt: textUrl(toVtt(response.cues)),
        txt: textUrl(response.text),
      });
      trackToolCompleted("subtitles");
    } catch (caught) {
      const message = caught instanceof Error ? caught.message : "UNKNOWN";
      setError(
        message === "ENGINE_FAILED"
          ? ui.errEngine
          : message === "MODEL_FAILED"
            ? ui.errModel
            : message === "NO_AUDIO"
              ? ui.errNoAudio
              : message === "TOO_LONG"
                ? fill(ui.errTooLong, { minutes: MAX_SECONDS / 60 })
                : message === "UNSUPPORTED_INPUT"
                  ? ui.errUnsupportedInput
                  : ui.errGeneric,
      );
    } finally {
      setBusy(false);
      setProgress(null);
    }
  }, [callWorker, file, language, model, revoke, ui]);

  if (supported === false) {
    return (
      <div className="rounded-xl border border-border bg-panel p-6">
        <p className="font-medium text-warn">{common.workerUnsupportedTitle}</p>
        <p className="mt-2 text-sm text-muted">{common.workerUnsupportedHint}</p>
      </div>
    );
  }

  const stageText = progress
    ? progress.stage === "decoding"
      ? ui.stageDecoding
      : progress.stage === "model"
        ? fill(ui.stageModel, { percent: Math.round(progress.ratio * 100) })
        : ui.stageTranscribing
    : null;

  const stem = file ? fileStem(file.name) : "subtitles";

  return (
    <div className="space-y-6">
      <FileDrop
        accept="video/mp4,video/quicktime,audio/mp4,audio/x-m4a,audio/wav,audio/mpeg,.mp3"
        onFiles={addFiles}
        label={ui.dropLabel}
        hint={fill(ui.dropHint, { minutes: MAX_SECONDS / 60 })}
        cta={common.chooseFile}
        disabled={busy}
      />

      <div className="grid gap-4 rounded-xl border border-border bg-panel p-5 sm:grid-cols-2">
        <label className="space-y-1.5">
          <span className="block text-sm text-muted">{ui.modelLabel}</span>
          <select
            value={model}
            disabled={busy}
            onChange={(event) => setModel(event.target.value as SubtitleModel)}
            className="w-full rounded-lg border border-border bg-bg px-3 py-2 text-sm"
          >
            {SUBTITLE_MODELS.map((value) => (
              <option key={value} value={value}>
                {fill(value === "fast" ? ui.modelFast : ui.modelAccurate, {
                  size: formatBytes(MODEL_BYTES[value]),
                })}
              </option>
            ))}
          </select>
        </label>

        <label className="space-y-1.5">
          <span className="block text-sm text-muted">{ui.languageLabel}</span>
          <select
            value={language}
            disabled={busy}
            onChange={(event) => setLanguage(event.target.value as SubtitleLanguage)}
            className="w-full rounded-lg border border-border bg-bg px-3 py-2 text-sm"
          >
            {SUBTITLE_LANGUAGES.map((value) => (
              <option key={value} value={value}>
                {value === "auto" ? ui.languageAuto : ui.languageNames[value]}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="space-y-1 text-sm text-muted" data-notes>
        <p>
          {fill(ui.downloadNote, { size: formatBytes(ENGINE_BYTES + MODEL_BYTES[model]) })}{" "}
          {ui.cachedNote}
        </p>
        {/* 실패 모드를 미리 말한다 — 잡음이 심하면 같은 말을 반복하며 무너진다 */}
        <p className="text-warn" data-noise-note>
          {ui.noiseNote}
        </p>
      </div>

      {file && (
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={run}
            disabled={busy}
            className="rounded-lg bg-accent px-5 py-2.5 text-sm font-medium text-accent-fg disabled:opacity-50"
          >
            {busy ? ui.working : ui.run}
          </button>
          <span className="min-w-0 truncate text-sm text-muted">{file.name}</span>
        </div>
      )}

      {stageText && <p className="text-sm text-muted tabular-nums">{stageText}</p>}
      {error && <p className="text-sm text-err">{error}</p>}

      {result && (
        <div className="space-y-4 rounded-xl border border-border p-4">
          <p className="text-xs text-muted tabular-nums" data-summary>
            {fill(ui.resultSummary, {
              cues: result.cues.length,
              length: clock(result.durationSec),
              seconds: result.seconds.toFixed(1),
            })}{" "}
            · {result.runtime === "webgpu" ? ui.runtimeWebgpu : ui.runtimeWasm}
          </p>

          <ul className="max-h-80 space-y-2 overflow-y-auto text-sm" data-cues>
            {result.cues.map((cue, index) => (
              <li key={index} className="flex gap-3">
                <span className="shrink-0 tabular-nums text-muted">{clock(cue.start)}</span>
                <span>{cue.text}</span>
              </li>
            ))}
          </ul>

          <div className="flex flex-wrap gap-3">
            <a
              href={result.srt}
              download={`${stem}.srt`}
              className="rounded-lg border border-border px-4 py-2 text-sm font-medium"
            >
              {ui.downloadSrt}
            </a>
            <a
              href={result.vtt}
              download={`${stem}.vtt`}
              className="rounded-lg border border-border px-4 py-2 text-sm font-medium"
            >
              {ui.downloadVtt}
            </a>
            <a
              href={result.txt}
              download={`${stem}.txt`}
              className="rounded-lg border border-border px-4 py-2 text-sm font-medium"
            >
              {ui.downloadTxt}
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
