"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { FileDrop } from "@/components/FileDrop";
import { trackToolCompleted } from "@/lib/analytics";
import { hasWorkers } from "@/lib/capabilities";
import { fileStem, formatBytes } from "@/lib/format";
import { fill } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries/en";
import { ENGINE_BYTES } from "@/lib/onnx/runtime";
import {
  MAX_SECONDS,
  MODEL_BYTES,
  estimateSeconds,
  type StemName,
  type StemProgress,
} from "@/lib/stems/stems-core";
import { useCapability } from "@/lib/use-capability";
import type { WorkerRequest, WorkerRequestPayload, WorkerResponse } from "./stems.worker";

type Ui = Dictionary["tools"]["stems"]["ui"];
type Common = Dictionary["common"];

interface Result {
  /** 내려받기·미리듣기 링크. **렌더 중에 만들지 않는다** — 다시 그릴 때마다 새 URL 이 샌다. */
  stems: Array<{ name: StemName; url: string; size: number }>;
  durationSec: number;
  seconds: number;
}

export function StemSplitter({ ui, common }: { ui: Ui; common: Common }) {
  const [broken, setBroken] = useState(false);
  const capable = useCapability(hasWorkers);
  const supported = capable === null ? null : capable && !broken;

  const [file, setFile] = useState<File | null>(null);
  const [progress, setProgress] = useState<StemProgress | null>(null);
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
    for (const stem of resultRef.current?.stems ?? []) URL.revokeObjectURL(stem.url);
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
      worker = new Worker(new URL("./stems.worker.ts", import.meta.url), { type: "module" });
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
      for (const stem of resultRef.current?.stems ?? []) URL.revokeObjectURL(stem.url);
    };
  }, []);

  const addFiles = useCallback(
    (files: File[]) => {
      if (files.length === 0) return;
      setError(null);
      setProgress(null);
      revoke();
      setResult(null);
      setFile(files[0]);
    },
    [revoke],
  );

  const run = useCallback(async () => {
    if (!file) return;
    setBusy(true);
    setError(null);
    try {
      const response = await callWorker({ kind: "separate", file });
      if (response.kind !== "done") throw new Error("UNKNOWN");
      revoke();
      setResult({
        stems: response.stems.map((stem) => ({
          name: stem.name,
          url: URL.createObjectURL(stem.blob),
          size: stem.blob.size,
        })),
        durationSec: response.durationSec,
        seconds: response.seconds,
      });
      trackToolCompleted("stems");
    } catch (caught) {
      const message = caught instanceof Error ? caught.message : "UNKNOWN";
      setError(
        message === "ENGINE_FAILED"
          ? ui.errEngine
          : message === "MODEL_FAILED"
            ? ui.errModel
            : message === "NO_AUDIO"
              ? ui.errNoAudio
              : message === "UNSUPPORTED_INPUT"
                ? ui.errUnsupportedInput
                : ui.errGeneric,
      );
    } finally {
      setBusy(false);
      setProgress(null);
    }
  }, [callWorker, file, revoke, ui]);

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
        : fill(ui.stageSeparating, { percent: Math.round(progress.ratio * 100) })
    : null;

  const stem = file ? fileStem(file.name) : "audio";

  return (
    <div className="space-y-6">
      <FileDrop
        accept="video/mp4,video/quicktime,audio/mp4,audio/x-m4a,audio/wav,audio/mpeg,.mp3"
        onFiles={addFiles}
        label={ui.dropLabel}
        hint={fill(ui.dropHint, { seconds: MAX_SECONDS })}
        cta={common.chooseFile}
        disabled={busy}
      />

      <div className="space-y-1 text-sm text-muted" data-notes>
        <p>
          {fill(ui.downloadNote, { size: formatBytes(ENGINE_BYTES + MODEL_BYTES) })} {ui.cachedNote}
        </p>
        {/* 얼마나 걸릴지 미리 말한다 — 이 도구가 미리듣기인 이유다 */}
        <p className="text-warn" data-slow-note>
          {fill(ui.slowNote, {
            seconds: MAX_SECONDS,
            minutes: Math.ceil(estimateSeconds(MAX_SECONDS) / 60),
          })}
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
        <div className="space-y-4">
          <p className="text-xs text-muted tabular-nums" data-summary>
            {fill(ui.resultSummary, {
              length: result.durationSec.toFixed(1),
              seconds: result.seconds.toFixed(1),
            })}
          </p>

          <ul className="space-y-3" data-stems>
            {result.stems.map((track) => (
              <li key={track.name} className="rounded-xl border border-border bg-panel p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <span className="font-medium">{ui.stemNames[track.name]}</span>
                  <a
                    href={track.url}
                    download={`${stem}-${track.name}.wav`}
                    className="rounded-lg border border-border px-4 py-1.5 text-sm font-medium"
                  >
                    {formatBytes(track.size)} · {common.download}
                  </a>
                </div>
                <audio controls preload="none" src={track.url} className="mt-3 w-full" />
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
