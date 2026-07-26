"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { FileDrop } from "@/components/FileDrop";
import { trackToolCompleted } from "@/lib/analytics";
import { fileStem, formatBytes, savingsPercent } from "@/lib/format";
import { fill } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries/en";
import { canRunVideoTools } from "@/lib/video/capabilities";
import type { WorkerRequest, WorkerRequestPayload, WorkerResponse } from "./compress.worker";

type Ui = Dictionary["tools"]["video-compress"]["ui"];
type Common = Dictionary["common"];
type Errors = Dictionary["mediaErrors"];

const MAX_EDGES = [0, 1920, 1280, 854];
/** 긴 변 기준 대략적인 목표 비트레이트(bps). 화면으로 보기에 무난한 선. */
const QUALITY = [
  { key: "high", bitrate: 4_000_000 },
  { key: "balanced", bitrate: 2_000_000 },
  { key: "small", bitrate: 900_000 },
] as const;

interface Info {
  width: number;
  height: number;
  durationSec: number;
  hasAudio: boolean;
}

interface Result {
  url: string;
  name: string;
  before: number;
  after: number;
  width: number;
  height: number;
  keptAudio: boolean;
}

function describeError(errors: Errors, message: string): string {
  switch (message) {
    case "UNSUPPORTED_CONTAINER":
      return errors.unsupportedContainer;
    case "NO_VIDEO_TRACK":
      return errors.noVideoTrack;
    case "UNSUPPORTED_CODEC":
      return errors.unsupportedCodec;
    case "TOO_LARGE":
      return errors.tooLarge;
    case "DECODE_FAILED":
      return errors.decodeFailed;
    case "ENCODE_FAILED":
      return errors.encodeFailed;
    default:
      return errors.generic;
  }
}

export function VideoCompressor({ ui, common, errors }: { ui: Ui; common: Common; errors: Errors }) {
  const [supported, setSupported] = useState<boolean | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [info, setInfo] = useState<Info | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [quality, setQuality] = useState<(typeof QUALITY)[number]["key"]>("balanced");
  const [maxEdge, setMaxEdge] = useState(1280);
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
      const worker = new Worker(new URL("./compress.worker.ts", import.meta.url));
      worker.onmessage = (event: MessageEvent<WorkerResponse>) => {
        const message = event.data;
        // 진행률은 응답이 아니라 중간 보고다 — 대기 중인 약속을 건드리지 않는다
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
    canRunVideoTools().then((ok) => {
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
          width: response.width,
          height: response.height,
          durationSec: response.durationSec,
          hasAudio: response.hasAudio,
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
      const bitrate = QUALITY.find((q) => q.key === quality)!.bitrate;
      const response = await callWorker({ kind: "compress", file, options: { maxEdge, bitrate } });
      if (response.kind !== "compressed") throw new Error("UNKNOWN");
      setResult({
        url: URL.createObjectURL(response.blob),
        name: fill(ui.outputName, { stem: fileStem(file.name) }),
        before: response.stats.before,
        after: response.stats.after,
        width: response.stats.width,
        height: response.stats.height,
        keptAudio: response.stats.keptAudio,
      });
      trackToolCompleted("video-compress");
    } catch (error) {
      setFailure(describeError(errors, error instanceof Error ? error.message : "UNKNOWN"));
    } finally {
      setBusy(false);
    }
  }, [callWorker, errors, file, maxEdge, quality, ui]);

  if (supported === false) {
    return (
      <div className="rounded-xl border border-border bg-panel p-6">
        <p className="font-medium text-warn">{ui.unsupportedTitle}</p>
        <p className="mt-2 text-sm text-muted">{ui.unsupportedHint}</p>
      </div>
    );
  }

  const saved = result ? savingsPercent(result.before, result.after) : 0;
  const shrank = result ? result.after < result.before : false;

  return (
    <div className="space-y-6">
      <FileDrop
        accept="video/mp4,video/quicktime,.mp4,.mov,.m4v"
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
            {info && ` · ${info.width}×${info.height} · ${info.durationSec.toFixed(1)}${ui.seconds}`}
            {info && !info.hasAudio && ` · ${ui.noAudio}`}
            {!info && !fileError && ` · ${ui.reading}`}
          </p>
          {fileError && <p className="mt-2 text-sm text-err">{fileError}</p>}
        </div>
      )}

      {info && (
        <div className="grid gap-4 rounded-xl border border-border bg-panel p-5 sm:grid-cols-2">
          <label className="space-y-1.5">
            <span className="block text-sm text-muted">{ui.qualityLabel}</span>
            <select
              value={quality}
              disabled={busy}
              onChange={(event) => setQuality(event.target.value as typeof quality)}
              className="w-full rounded-lg border border-border bg-bg px-3 py-2 text-sm"
            >
              {QUALITY.map((option) => (
                <option key={option.key} value={option.key}>
                  {ui.quality[option.key]}
                </option>
              ))}
            </select>
          </label>

          <label className="space-y-1.5">
            <span className="block text-sm text-muted">{ui.sizeLabel}</span>
            <select
              value={maxEdge}
              disabled={busy}
              onChange={(event) => setMaxEdge(Number(event.target.value))}
              className="w-full rounded-lg border border-border bg-bg px-3 py-2 text-sm"
            >
              {MAX_EDGES.map((px) => (
                <option key={px} value={px}>
                  {px === 0 ? ui.sizeOriginal : fill(ui.sizeMax, { px })}
                </option>
              ))}
            </select>
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
          {busy && (
            <span className="text-sm text-muted tabular-nums">
              {Math.round(progress * 100)}%
            </span>
          )}
        </div>
      )}

      {failure && <p className="rounded-xl border border-border bg-panel p-4 text-sm text-err">{failure}</p>}

      {result && (
        <div className="space-y-3 rounded-xl border border-border bg-panel p-5">
          <div className="flex flex-wrap items-center gap-4">
            <div className="min-w-0 flex-1">
              <p className="truncate font-medium">{result.name}</p>
              <p className="mt-1 text-sm text-muted">
                {formatBytes(result.before)} → <span className="text-fg">{formatBytes(result.after)}</span>{" "}
                {shrank && <span className="text-ok">(-{saved}%)</span>} · {result.width}×{result.height}
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
          {!shrank && <p className="text-sm text-warn">{ui.didNotShrink}</p>}
          {result.keptAudio && <p className="text-sm text-muted">{ui.audioKept}</p>}
        </div>
      )}
    </div>
  );
}
