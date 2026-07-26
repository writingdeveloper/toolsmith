"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { FileDrop } from "@/components/FileDrop";
import { trackToolCompleted } from "@/lib/analytics";
import { fileStem, formatBytes } from "@/lib/format";
import { fill } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries/en";
import { canRunGifTools } from "@/lib/video/capabilities";
import { GIF_FPS_CHOICES, MAX_GIF_FRAMES, estimateFrames, gifTiming } from "@/lib/video/gif-timing";
import type { WorkerRequest, WorkerRequestPayload, WorkerResponse } from "./gif.worker";

type Ui = Dictionary["tools"]["video-to-gif"]["ui"];
type Common = Dictionary["common"];
type Errors = Dictionary["mediaErrors"];

/** GIF 는 화면 안에서 보는 물건이다 — 원본 해상도를 그대로 쓸 일이 거의 없다. */
const MAX_EDGES = [480, 360, 240, 0];

interface Info {
  width: number;
  height: number;
  durationSec: number;
}

interface Result {
  url: string;
  name: string;
  before: number;
  after: number;
  width: number;
  height: number;
  frameCount: number;
  fps: number;
  truncated: boolean;
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

export function GifMaker({ ui, common, errors }: { ui: Ui; common: Common; errors: Errors }) {
  const [supported, setSupported] = useState<boolean | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [info, setInfo] = useState<Info | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [fps, setFps] = useState<number>(15);
  const [maxEdge, setMaxEdge] = useState(480);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<Result | null>(null);
  const [failure, setFailure] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const workerRef = useRef<Worker | null>(null);
  const pendingRef = useRef(new Map<number, { resolve: (v: WorkerResponse) => void; reject: (e: Error) => void }>());
  const rpcId = useRef(0);

  /** 워커는 첫 파일이 들어올 때 만든다 — 그 전에 mp4box·gifenc 를 받을 이유가 없다. */
  const ensureWorker = useCallback((): Worker | null => {
    if (workerRef.current) return workerRef.current;
    try {
      const worker = new Worker(new URL("./gif.worker.ts", import.meta.url));
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
    canRunGifTools().then((ok) => {
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
      const response = await callWorker({ kind: "render", file, options: { fps, maxEdge } });
      if (response.kind !== "rendered") throw new Error("UNKNOWN");
      setResult({
        url: URL.createObjectURL(response.blob),
        name: fill(ui.outputName, { stem: fileStem(file.name) }),
        before: response.stats.before,
        after: response.stats.after,
        width: response.stats.width,
        height: response.stats.height,
        frameCount: response.stats.frameCount,
        fps: response.stats.fps,
        truncated: response.stats.truncated,
      });
      trackToolCompleted("video-to-gif");
    } catch (error) {
      setFailure(describeError(errors, error instanceof Error ? error.message : "UNKNOWN"));
    } finally {
      setBusy(false);
    }
  }, [callWorker, errors, file, fps, maxEdge, ui]);

  if (supported === false) {
    return (
      <div className="rounded-xl border border-border bg-panel p-6">
        <p className="font-medium text-warn">{ui.unsupportedTitle}</p>
        <p className="mt-2 text-sm text-muted">{ui.unsupportedHint}</p>
      </div>
    );
  }

  const timing = gifTiming(fps);
  const frames = info ? estimateFrames(info.durationSec, fps) : 0;
  const tooMany = frames > MAX_GIF_FRAMES;
  /** 요청한 fps 를 GIF 가 그대로 담지 못할 때만 실제 값을 밝힌다. */
  const roundedAway = Math.abs(timing.fps - fps) > 0.05;

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
            {!info && !fileError && ` · ${ui.reading}`}
          </p>
          {fileError && <p className="mt-2 text-sm text-err">{fileError}</p>}
        </div>
      )}

      {info && (
        <div className="space-y-4 rounded-xl border border-border bg-panel p-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="space-y-1.5">
              <span className="block text-sm text-muted">{ui.fpsLabel}</span>
              <select
                value={fps}
                disabled={busy}
                onChange={(event) => setFps(Number(event.target.value))}
                className="w-full rounded-lg border border-border bg-bg px-3 py-2 text-sm"
              >
                {GIF_FPS_CHOICES.map((n) => (
                  <option key={n} value={n}>
                    {fill(ui.fpsOption, { n })}
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

          <p className="text-sm text-muted">
            {fill(ui.framesEstimate, { n: frames })}
            {roundedAway && ` · ${fill(ui.fpsActual, { n: timing.fps.toFixed(1) })}`}
          </p>

          {tooMany && (
            <p className="text-sm text-warn">{fill(ui.tooManyFrames, { max: MAX_GIF_FRAMES })}</p>
          )}
        </div>
      )}

      {info && (
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={run}
            disabled={busy || tooMany}
            className="rounded-lg bg-accent px-5 py-2.5 text-sm font-medium text-accent-fg disabled:opacity-50"
          >
            {busy ? ui.working : ui.run}
          </button>
          {busy && <span className="text-sm text-muted tabular-nums">{Math.round(progress * 100)}%</span>}
        </div>
      )}

      {failure && <p className="rounded-xl border border-border bg-panel p-4 text-sm text-err">{failure}</p>}

      {result && (
        <div className="space-y-4 rounded-xl border border-border bg-panel p-5">
          <div className="flex flex-wrap items-center gap-4">
            <div className="min-w-0 flex-1">
              <p className="truncate font-medium">{result.name}</p>
              <p className="mt-1 text-sm text-muted">
                {formatBytes(result.after)} · {result.width}×{result.height} ·{" "}
                {fill(ui.resultFrames, { n: result.frameCount, fps: result.fps.toFixed(1) })}
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

          {result.truncated && (
            <p className="text-sm text-warn">
              {fill(ui.truncated, { n: result.frameCount })}
            </p>
          )}
          {result.after > result.before && <p className="text-sm text-muted">{ui.biggerNote}</p>}

          {/* eslint-disable-next-line @next/next/no-img-element -- blob: URL 이라 next/image 가 다룰 수 없다 */}
          <img
            src={result.url}
            alt={ui.previewAlt}
            className="max-h-96 w-auto max-w-full rounded-lg border border-border"
          />
        </div>
      )}
    </div>
  );
}
