"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { FileDrop } from "@/components/FileDrop";
import { trackToolCompleted } from "@/lib/analytics";
import { fileStem, formatBytes } from "@/lib/format";
import { fill } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries/en";
import type { AudioFormat } from "@/lib/video/audio-core";
import { canRunAudioTools } from "@/lib/video/capabilities";
import type { WorkerRequest, WorkerRequestPayload, WorkerResponse } from "./extract.worker";

type Ui = Dictionary["tools"]["audio-extract"]["ui"];
type Common = Dictionary["common"];
type Errors = Dictionary["mediaErrors"];

interface Info {
  durationSec: number;
  channels: number;
  sampleRate: number;
}

interface Result {
  url: string;
  name: string;
  size: number;
  format: AudioFormat;
}

function describeError(errors: Errors, message: string): string {
  switch (message) {
    case "UNSUPPORTED_CONTAINER":
      return errors.unsupportedContainer;
    case "NO_AUDIO_TRACK":
      return errors.noAudioTrack;
    case "UNSUPPORTED_CODEC":
      return errors.unsupportedCodec;
    case "TOO_LARGE":
      return errors.tooLarge;
    case "DECODE_FAILED":
      return errors.decodeFailed;
    default:
      return errors.generic;
  }
}

export function AudioExtractor({ ui, common, errors }: { ui: Ui; common: Common; errors: Errors }) {
  const [supported, setSupported] = useState<boolean | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [info, setInfo] = useState<Info | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [format, setFormat] = useState<AudioFormat>("m4a");
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<Result | null>(null);
  const [failure, setFailure] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const workerRef = useRef<Worker | null>(null);
  const pendingRef = useRef(new Map<number, { resolve: (v: WorkerResponse) => void; reject: (e: Error) => void }>());
  const rpcId = useRef(0);

  /** 워커는 첫 파일이 들어올 때 만든다 — 그 전에 mp4box 를 받을 이유가 없다. */
  const ensureWorker = useCallback((): Worker | null => {
    if (workerRef.current) return workerRef.current;
    try {
      const worker = new Worker(new URL("./extract.worker.ts", import.meta.url));
      worker.onmessage = (event: MessageEvent<WorkerResponse>) => {
        const message = event.data;
        if (message.kind === "progress") {
          setProgress(message.ratio);
          return;
        }
        const entry = pendingRef.current.get(message.id);
        if (!entry) return;
        pendingRef.current.delete(message.id);
        if (message.kind === "failed") entry.reject(new Error(message.message));
        else entry.resolve(message);
      };
      workerRef.current = worker;
      return worker;
    } catch {
      setSupported(false);
      return null;
    }
  }, []);

  const callWorker = useCallback(
    (request: WorkerRequestPayload): Promise<WorkerResponse> => {
      const worker = ensureWorker();
      if (!worker) return Promise.reject(new Error("NO_WORKER"));
      const id = ++rpcId.current;
      return new Promise((resolve, reject) => {
        pendingRef.current.set(id, { resolve, reject });
        worker.postMessage({ ...request, id } as WorkerRequest);
      });
    },
    [ensureWorker],
  );

  useEffect(() => {
    let alive = true;
    canRunAudioTools().then((ok) => {
      if (alive) setSupported(ok);
    });
    const pending = pendingRef.current;
    return () => {
      alive = false;
      workerRef.current?.terminate();
      workerRef.current = null;
      pending.clear();
    };
  }, []);

  useEffect(() => {
    if (!result) return;
    return () => URL.revokeObjectURL(result.url);
  }, [result]);

  const accept = useCallback(
    async (files: File[]) => {
      const next = files[0];
      if (!next) return;
      setFile(next);
      setInfo(null);
      setFileError(null);
      setResult(null);
      setFailure(null);

      try {
        const response = await callWorker({ kind: "inspect", file: next });
        if (response.kind !== "inspected") throw new Error("UNKNOWN");
        setInfo({
          durationSec: response.durationSec,
          channels: response.channels,
          sampleRate: response.sampleRate,
        });
      } catch (error) {
        setFileError(describeError(errors, error instanceof Error ? error.message : "UNKNOWN"));
      }
    },
    [callWorker, errors],
  );

  const run = useCallback(async () => {
    if (!file) return;
    setResult(null);
    setFailure(null);
    setProgress(0);
    setBusy(true);
    try {
      const response = await callWorker({ kind: "extract", file, format });
      if (response.kind !== "extracted") throw new Error("UNKNOWN");
      setResult({
        url: URL.createObjectURL(response.blob),
        name: fill(format === "m4a" ? ui.outputNameM4a : ui.outputNameWav, {
          stem: fileStem(file.name),
        }),
        size: response.blob.size,
        format: response.stats.format,
      });
      trackToolCompleted("audio-extract");
    } catch (error) {
      setFailure(describeError(errors, error instanceof Error ? error.message : "UNKNOWN"));
    } finally {
      setBusy(false);
    }
  }, [callWorker, errors, file, format, ui]);

  if (supported === false) {
    return (
      <div className="rounded-xl border border-border bg-panel p-6">
        <p className="font-medium text-warn">{ui.unsupportedTitle}</p>
        <p className="mt-2 text-sm text-muted">{ui.unsupportedHint}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <FileDrop
        accept="video/mp4,video/quicktime,audio/mp4,.mp4,.mov,.m4v,.m4a"
        multiple={false}
        onFiles={accept}
        label={ui.dropLabel}
        hint={ui.dropHint}
        cta={common.chooseFile}
        disabled={busy}
      />

      {file && (
        <div className="rounded-xl border border-border bg-panel p-5">
          <p className="truncate font-medium">{file.name}</p>
          <p className="mt-1 text-sm text-muted">
            {formatBytes(file.size)}
            {info &&
              ` · ${info.durationSec.toFixed(1)}${ui.seconds} · ${fill(ui.channels, {
                n: info.channels,
              })} · ${(info.sampleRate / 1000).toFixed(1)}kHz`}
            {!info && !fileError && ` · ${ui.reading}`}
          </p>
          {fileError && <p className="mt-2 text-sm text-err">{fileError}</p>}
        </div>
      )}

      {info && (
        <div className="space-y-3 rounded-xl border border-border bg-panel p-5">
          <label className="flex items-start gap-3">
            <input
              type="radio"
              name="format"
              value="m4a"
              aria-label={ui.formatM4a}
              checked={format === "m4a"}
              disabled={busy}
              onChange={() => setFormat("m4a")}
              className="mt-1 accent-accent"
            />
            <span>
              <span className="block text-sm font-medium">{ui.formatM4a}</span>
              <span className="block text-sm text-muted">{ui.formatM4aHint}</span>
            </span>
          </label>

          <label className="flex items-start gap-3">
            <input
              type="radio"
              name="format"
              value="wav"
              aria-label={ui.formatWav}
              checked={format === "wav"}
              disabled={busy}
              onChange={() => setFormat("wav")}
              className="mt-1 accent-accent"
            />
            <span>
              <span className="block text-sm font-medium">{ui.formatWav}</span>
              <span className="block text-sm text-muted">{ui.formatWavHint}</span>
            </span>
          </label>
        </div>
      )}

      {info && (
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={run}
            disabled={busy}
            className="rounded-lg bg-accent px-5 py-2.5 text-sm font-medium text-accent-fg disabled:opacity-50"
          >
            {busy ? ui.working : ui.run}
          </button>
          {busy && format === "wav" && (
            <span className="text-sm text-muted tabular-nums">{Math.round(progress * 100)}%</span>
          )}
        </div>
      )}

      {failure && <p className="rounded-xl border border-border bg-panel p-4 text-sm text-err">{failure}</p>}

      {result && (
        <div className="flex flex-wrap items-center gap-4 rounded-xl border border-border bg-panel p-5">
          <div className="min-w-0 flex-1">
            <p className="truncate font-medium">{result.name}</p>
            <p className="mt-1 text-sm text-muted">
              {formatBytes(result.size)}
              {result.format === "m4a" && ` · ${ui.losslessNote}`}
            </p>
          </div>
          <a
            href={result.url}
            download={result.name}
            className="rounded-lg bg-accent px-5 py-2.5 text-sm font-medium text-accent-fg"
          >
            {common.download}
          </a>
        </div>
      )}
    </div>
  );
}
