"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { FileDrop } from "@/components/FileDrop";
import { trackToolCompleted } from "@/lib/analytics";
import { canRunImageTools } from "@/lib/capabilities";
import { formatBytes, replaceExtension } from "@/lib/format";
import { fill } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries/en";
import {
  CUTOUT_BACKGROUNDS,
  ENGINE_BYTES,
  MAX_PIXELS,
  MODEL_BYTES,
  type CutoutBackground,
  type Point,
  type SegmentProgress,
} from "@/lib/segment/segment-core";
import { useCapability } from "@/lib/use-capability";
import type { WorkerRequest, WorkerRequestPayload, WorkerResponse } from "./cutout.worker";

type Ui = Dictionary["tools"]["cutout"]["ui"];
type Common = Dictionary["common"];

interface Mask {
  data: Uint8ClampedArray;
  width: number;
  height: number;
  score: number;
}

interface Result {
  url: string;
  size: number;
  name: string;
  coverage: number;
}

const EMPTY_COVERAGE = 0.0005;

export function Cutter({ ui, common }: { ui: Ui; common: Common }) {
  const [broken, setBroken] = useState(false);
  const capable = useCapability(canRunImageTools);
  const supported = capable === null ? null : capable && !broken;

  const [file, setFile] = useState<File | null>(null);
  const [source, setSource] = useState<{ width: number; height: number } | null>(null);
  const [ready, setReady] = useState(false);
  const [runtime, setRuntime] = useState<"webgpu" | "wasm" | null>(null);
  const [points, setPoints] = useState<Point[]>([]);
  const [include, setInclude] = useState(true);
  const [background, setBackground] = useState<CutoutBackground>("transparent");
  const [mask, setMask] = useState<Mask | null>(null);
  const [progress, setProgress] = useState<SegmentProgress | null>(null);
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const bitmapRef = useRef<ImageBitmap | null>(null);
  const workerRef = useRef<Worker | null>(null);
  const pendingRef = useRef(
    new Map<number, { resolve: (v: WorkerResponse) => void; reject: (e: Error) => void }>(),
  );
  const rpcId = useRef(0);
  const resultRef = useRef<Result | null>(null);
  useEffect(() => {
    resultRef.current = result;
  }, [result]);

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
      worker = new Worker(new URL("./cutout.worker.ts", import.meta.url), { type: "module" });
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
      if (resultRef.current) URL.revokeObjectURL(resultRef.current.url);
      bitmapRef.current?.close();
    };
  }, []);

  /** 그림 + 마스크 겹치기 + 찍은 점을 한 캔버스에 그린다. */
  const redraw = useCallback(() => {
    const canvas = canvasRef.current;
    const bitmap = bitmapRef.current;
    if (!canvas || !bitmap) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(bitmap, 0, 0);

    if (mask) {
      // 작은 마스크를 색칠해서 그림 위에 얹는다 — 무엇이 잡혔는지 바로 보여야 한다.
      const tint = new Uint8ClampedArray(new ArrayBuffer(mask.width * mask.height * 4));
      for (let i = 0; i < mask.width * mask.height; i += 1) {
        if (mask.data[i * 4] > 127) {
          tint[i * 4] = 56;
          tint[i * 4 + 1] = 132;
          tint[i * 4 + 2] = 255;
          tint[i * 4 + 3] = 110;
        }
      }
      const overlay = document.createElement("canvas");
      overlay.width = mask.width;
      overlay.height = mask.height;
      overlay.getContext("2d")?.putImageData(new ImageData(tint, mask.width, mask.height), 0, 0);
      ctx.imageSmoothingEnabled = true;
      ctx.drawImage(overlay, 0, 0, canvas.width, canvas.height);
    }

    const radius = Math.max(5, canvas.width / 110);
    for (const point of points) {
      ctx.beginPath();
      ctx.arc(point.x, point.y, radius, 0, Math.PI * 2);
      ctx.fillStyle = point.include ? "#22c55e" : "#ef4444";
      ctx.fill();
      ctx.lineWidth = Math.max(2, radius / 3);
      ctx.strokeStyle = "#ffffff";
      ctx.stroke();
    }
  }, [mask, points]);

  useEffect(() => {
    redraw();
  }, [redraw]);

  const addFiles = useCallback(async (files: File[]) => {
    if (files.length === 0) return;
    setError(null);
    setProgress(null);
    setPoints([]);
    setMask(null);
    setReady(false);
    setResult(null);
    setFile(files[0]);
    bitmapRef.current?.close();
    bitmapRef.current = null;
    try {
      const bitmap = await createImageBitmap(files[0]);
      bitmapRef.current = bitmap;
      setSource({ width: bitmap.width, height: bitmap.height });
    } catch {
      setSource(null);
    }
  }, []);

  const failure = useCallback(
    (caught: unknown) => {
      const message = caught instanceof Error ? caught.message : "UNKNOWN";
      setError(
        message === "ENGINE_FAILED"
          ? ui.errEngine
          : message === "MODEL_FAILED"
            ? ui.errModel
            : message === "TOO_LARGE"
              ? fill(ui.errTooLarge, { max: (MAX_PIXELS / 1_000_000).toFixed(0) })
              : message === "UNSUPPORTED_INPUT"
                ? ui.errUnsupportedInput
                : ui.errGeneric,
      );
    },
    [ui],
  );

  const prepare = useCallback(async () => {
    if (!file) return;
    setBusy(true);
    setError(null);
    try {
      const response = await callWorker({ kind: "prepare", file });
      if (response.kind !== "prepared") throw new Error("UNKNOWN");
      setRuntime(response.runtime);
      setReady(true);
    } catch (caught) {
      failure(caught);
    } finally {
      setBusy(false);
      setProgress(null);
    }
  }, [callWorker, failure, file]);

  const runSegment = useCallback(
    async (next: Point[]) => {
      if (next.length === 0) {
        setMask(null);
        return;
      }
      try {
        const response = await callWorker({ kind: "segment", points: next });
        if (response.kind !== "segmented") throw new Error("UNKNOWN");
        setMask({
          data: response.mask,
          width: response.width,
          height: response.height,
          score: response.score,
        });
      } catch (caught) {
        failure(caught);
      }
    },
    [callWorker, failure],
  );

  const onCanvasClick = useCallback(
    (event: React.MouseEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current;
      if (!canvas || !ready || busy) return;
      const rect = canvas.getBoundingClientRect();
      // 화면에서 줄여 보여 주므로 실제 화소 좌표로 되돌린다
      const x = ((event.clientX - rect.left) / rect.width) * canvas.width;
      const y = ((event.clientY - rect.top) / rect.height) * canvas.height;
      const next = [...points, { x, y, include }];
      setPoints(next);
      if (resultRef.current) URL.revokeObjectURL(resultRef.current.url);
      setResult(null);
      void runSegment(next);
    },
    [busy, include, points, ready, runSegment],
  );

  const undo = useCallback(() => {
    const next = points.slice(0, -1);
    setPoints(next);
    void runSegment(next);
  }, [points, runSegment]);

  const download = useCallback(async () => {
    if (!file || points.length === 0) return;
    setBusy(true);
    try {
      const response = await callWorker({ kind: "cutout", points, background });
      if (response.kind !== "cutout") throw new Error("UNKNOWN");
      if (resultRef.current) URL.revokeObjectURL(resultRef.current.url);
      setResult({
        url: URL.createObjectURL(response.blob),
        size: response.blob.size,
        name: replaceExtension(file.name, "png"),
        coverage: response.coverage,
      });
      trackToolCompleted("cutout");
    } catch (caught) {
      failure(caught);
    } finally {
      setBusy(false);
    }
  }, [background, callWorker, failure, file, points]);

  if (supported === false) {
    return (
      <div className="rounded-xl border border-border bg-panel p-6">
        <p className="font-medium text-warn">{common.workerUnsupportedTitle}</p>
        <p className="mt-2 text-sm text-muted">{common.workerUnsupportedHint}</p>
      </div>
    );
  }

  const stageText = progress
    ? progress.stage === "engine"
      ? ui.stageEngine
      : progress.stage === "model"
        ? fill(ui.stageModel, { percent: Math.round(progress.ratio * 100) })
        : ui.stageEncoding
    : null;

  return (
    <div className="space-y-6">
      <FileDrop
        accept="image/*"
        onFiles={addFiles}
        label={ui.dropLabel}
        hint={ui.dropHint}
        cta={common.chooseFile}
        disabled={busy}
      />

      <p className="text-sm text-muted" data-download-note>
        {fill(ui.downloadNote, { size: formatBytes(ENGINE_BYTES + MODEL_BYTES) })} {ui.cachedNote}
      </p>

      {file && !ready && (
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={prepare}
            disabled={busy}
            className="rounded-lg bg-accent px-5 py-2.5 text-sm font-medium text-accent-fg disabled:opacity-50"
          >
            {busy ? ui.preparing : ui.prepare}
          </button>
          <span className="min-w-0 truncate text-sm text-muted">{file.name}</span>
        </div>
      )}

      {stageText && <p className="text-sm text-muted tabular-nums">{stageText}</p>}
      {error && <p className="text-sm text-err">{error}</p>}

      {source && (
        <div className="space-y-3">
          {ready && (
            <p className="text-sm text-muted" data-hint>
              {points.length === 0 ? ui.clickHint : fill(ui.pointCount, { n: points.length })}
              {runtime && ` · ${runtime === "webgpu" ? ui.runtimeWebgpu : ui.runtimeWasm}`}
            </p>
          )}
          <canvas
            ref={canvasRef}
            width={source.width}
            height={source.height}
            onClick={onCanvasClick}
            data-canvas
            className={`w-full rounded-xl border border-border ${ready ? "cursor-crosshair" : ""}`}
          />
        </div>
      )}

      {ready && (
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex overflow-hidden rounded-lg border border-border text-sm">
            <button
              type="button"
              onClick={() => setInclude(true)}
              className={`px-4 py-2 ${include ? "bg-accent text-accent-fg" : ""}`}
            >
              {ui.modeInclude}
            </button>
            <button
              type="button"
              onClick={() => setInclude(false)}
              className={`px-4 py-2 ${include ? "" : "bg-accent text-accent-fg"}`}
            >
              {ui.modeExclude}
            </button>
          </div>

          <label className="flex items-center gap-2 text-sm text-muted">
            {ui.backgroundLabel}
            <select
              value={background}
              disabled={busy}
              onChange={(event) => setBackground(event.target.value as CutoutBackground)}
              className="rounded-lg border border-border bg-bg px-3 py-2 text-sm"
            >
              {CUTOUT_BACKGROUNDS.map((value) => (
                <option key={value} value={value}>
                  {value === "transparent"
                    ? ui.backgroundTransparent
                    : value === "white"
                      ? ui.backgroundWhite
                      : ui.backgroundBlack}
                </option>
              ))}
            </select>
          </label>

          <button
            type="button"
            onClick={download}
            disabled={busy || points.length === 0}
            className="rounded-lg bg-accent px-5 py-2.5 text-sm font-medium text-accent-fg disabled:opacity-50"
          >
            {busy ? ui.working : ui.cut}
          </button>
          <button
            type="button"
            onClick={undo}
            disabled={busy || points.length === 0}
            className="text-sm text-muted underline disabled:opacity-50"
          >
            {ui.undo}
          </button>
        </div>
      )}

      {result && (
        <div className="space-y-3 rounded-xl border border-border p-4">
          <div
            className="overflow-hidden rounded-lg"
            style={{
              backgroundImage:
                "linear-gradient(45deg,#0002 25%,transparent 25%,transparent 75%,#0002 75%),linear-gradient(45deg,#0002 25%,transparent 25%,transparent 75%,#0002 75%)",
              backgroundSize: "16px 16px",
              backgroundPosition: "0 0, 8px 8px",
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={result.url} alt={ui.resultAlt} data-result className="mx-auto max-h-96 w-auto" />
          </div>
          <p className="text-xs text-muted tabular-nums" data-summary>
            {formatBytes(result.size)}
          </p>
          {result.coverage < EMPTY_COVERAGE && (
            <p className="text-sm text-warn" data-empty>
              {ui.nothingFound}
            </p>
          )}
          <a
            href={result.url}
            download={result.name}
            className="inline-block rounded-lg border border-border px-4 py-2 text-sm font-medium"
          >
            {common.download}
          </a>
        </div>
      )}
    </div>
  );
}
