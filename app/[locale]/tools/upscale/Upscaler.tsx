"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ACCEPT } from "@/lib/tools";
import { SendTo } from "@/components/SendTo";
import { FileDrop } from "@/components/FileDrop";
import type { ChainCopy } from "@/lib/chain";
import { trackToolCompleted } from "@/lib/analytics";
import { canRunImageTools, hasWebGPU } from "@/lib/capabilities";
import { formatBytes, replaceExtension } from "@/lib/format";
import { fill } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries/en";
import { FORMAT_EXTENSION, FORMAT_LABEL, type OutputFormat } from "@/lib/image/convert-core";
import {
  ENGINE_BYTES,
  MAX_PIXELS,
  MODEL_BYTES,
  SCALES,
  estimateSeconds,
  type Scale,
  type UpscaleProgress,
} from "@/lib/upscale/upscale-core";
import { useCapability } from "@/lib/use-capability";
import type { WorkerRequest, WorkerRequestPayload, WorkerResponse } from "./upscale.worker";

type Ui = Dictionary["tools"]["upscale"]["ui"];
type Common = Dictionary["common"];

interface Result {
  url: string;
  size: number;
  width: number;
  height: number;
  name: string;
  runtime: "webgpu" | "wasm";
  seconds: number;
}

export function Upscaler({ chain, ui, common }: { chain: ChainCopy; ui: Ui; common: Common }) {
  const [broken, setBroken] = useState(false);
  const capable = useCapability(canRunImageTools);
  const supported = capable === null ? null : capable && !broken;

  /*
   * WebGPU 가 있는지는 **아무것도 받지 않고** 알 수 있다. 없으면 CPU 로도 돌지만
   * 눈에 띄게 느리므로 누르기 전에 그렇다고 말한다 — 규칙 4 의 "조용한 실패 금지" 는
   * 실패뿐 아니라 조용한 성능 절벽에도 해당한다.
   */
  const [gpu, setGpu] = useState<boolean | null>(null);
  useEffect(() => {
    let alive = true;
    hasWebGPU().then((value) => {
      if (alive) setGpu(value);
    });
    return () => {
      alive = false;
    };
  }, []);

  const [file, setFile] = useState<File | null>(null);
  const [source, setSource] = useState<{ width: number; height: number } | null>(null);
  const [scale, setScale] = useState<Scale>(4);
  const [formats, setFormats] = useState<OutputFormat[]>([]);
  const [format, setFormat] = useState<OutputFormat>("image/png");
  const [progress, setProgress] = useState<UpscaleProgress | null>(null);
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
      worker = new Worker(new URL("./upscale.worker.ts", import.meta.url), { type: "module" });
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
    callWorker({ kind: "detect" })
      .then((response) => {
        if (response.kind === "detect") setFormats(response.formats as OutputFormat[]);
      })
      .catch(() => setBroken(true));
    return () => {
      worker.terminate();
      workerRef.current = null;
      pending.clear();
    };
  }, [callWorker, capable]);

  useEffect(() => {
    return () => {
      if (resultRef.current) URL.revokeObjectURL(resultRef.current.url);
    };
  }, []);

  const clearResult = useCallback(() => {
    if (resultRef.current) URL.revokeObjectURL(resultRef.current.url);
    setResult(null);
  }, []);

  const addFiles = useCallback(
    async (files: File[]) => {
      if (files.length === 0) return;
      clearResult();
      setError(null);
      setProgress(null);
      setFile(files[0]);
      setSource(null);
      try {
        const bitmap = await createImageBitmap(files[0]);
        setSource({ width: bitmap.width, height: bitmap.height });
        bitmap.close();
      } catch {
        // 못 읽는 형식은 누른 뒤 워커가 제대로 알려 준다
      }
    },
    [clearResult],
  );

  const run = useCallback(async () => {
    if (!file) return;
    setBusy(true);
    setError(null);
    clearResult();
    try {
      const response = await callWorker({
        kind: "upscale",
        file,
        options: { scale, format, quality: 0.92 },
      });
      if (response.kind !== "upscaled") throw new Error("UNKNOWN");
      setResult({
        url: URL.createObjectURL(response.blob),
        size: response.blob.size,
        width: response.width,
        height: response.height,
        name: replaceExtension(file.name, FORMAT_EXTENSION[format]),
        runtime: response.runtime,
        seconds: response.seconds,
      });
      trackToolCompleted("upscale");
    } catch (caught) {
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
    } finally {
      setBusy(false);
      setProgress(null);
    }
  }, [callWorker, clearResult, file, format, scale, ui]);

  if (supported === false) {
    return (
      <div className="rounded-xl border border-border bg-panel p-6">
        <p className="font-medium text-warn">{common.workerUnsupportedTitle}</p>
        <p className="mt-2 text-sm text-muted">{common.workerUnsupportedHint}</p>
      </div>
    );
  }

  const tooLarge = source !== null && source.width * source.height > MAX_PIXELS;
  const outSize = source ? `${source.width * scale}×${source.height * scale}` : null;
  const estimate = source && !tooLarge ? Math.round(estimateSeconds(source.width, source.height)) : 0;

  const stageText = progress
    ? progress.stage === "engine"
      ? ui.stageEngine
      : progress.stage === "model"
        ? fill(ui.stageModel, { percent: Math.round(progress.ratio * 100) })
        : fill(ui.stageUpscaling, { tile: progress.tile ?? 1, tiles: progress.tiles ?? 1 })
    : null;

  return (
    <div className="space-y-6">
      <FileDrop
        accept={ACCEPT["upscale"]}
        onFiles={addFiles}
        label={ui.dropLabel}
        hint={fill(ui.dropHint, { max: (MAX_PIXELS / 1_000_000).toFixed(0) })}
        cta={common.chooseFile}
        disabled={busy}
      />

      <div className="grid gap-4 rounded-xl border border-border bg-panel p-5 sm:grid-cols-2">
        <label className="space-y-1.5">
          <span className="block text-sm text-muted">{ui.scaleLabel}</span>
          <select
            value={scale}
            disabled={busy}
            onChange={(event) => setScale(Number(event.target.value) as Scale)}
            className="w-full rounded-lg border border-border bg-bg px-3 py-2 text-sm"
          >
            {SCALES.map((value) => (
              <option key={value} value={value}>
                {fill(ui.scaleOption, { n: value })}
              </option>
            ))}
          </select>
        </label>

        <label className="space-y-1.5">
          <span className="block text-sm text-muted">{ui.formatLabel}</span>
          <select
            value={format}
            disabled={busy}
            onChange={(event) => setFormat(event.target.value as OutputFormat)}
            className="w-full rounded-lg border border-border bg-bg px-3 py-2 text-sm"
          >
            {formats.map((value) => (
              <option key={value} value={value}>
                {FORMAT_LABEL[value]}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="space-y-1 text-sm text-muted" data-notes>
        <p>
          {fill(ui.downloadNote, { size: formatBytes(ENGINE_BYTES + MODEL_BYTES) })} {ui.cachedNote}
        </p>
        {/*
         * 어느 실행기로 돌지는 아무것도 받기 전에 알 수 있다. 없으면 몇 분이 걸릴 수
         * 있으므로 누르기 전에 말한다.
         */}
        {gpu === false && (
          <p className="text-warn" data-cpu-warning>
            {estimate > 0 ? fill(ui.cpuNoticeWithEstimate, { seconds: estimate }) : ui.cpuNotice}
          </p>
        )}
        {gpu === true && <p data-gpu-notice>{ui.gpuNotice}</p>}
      </div>

      {source && (
        <p className="text-sm text-muted tabular-nums" data-preview>
          {tooLarge
            ? fill(ui.tooLargeNotice, {
                from: `${source.width}×${source.height}`,
                max: (MAX_PIXELS / 1_000_000).toFixed(0),
              })
            : fill(ui.preview, { from: `${source.width}×${source.height}`, to: outSize ?? "" })}
        </p>
      )}

      {file && (
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={run}
            disabled={busy || tooLarge}
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
        <div className="space-y-3 rounded-xl border border-border p-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={result.url} alt={ui.resultAlt} data-result className="mx-auto max-h-96 w-auto" />
          <p className="text-xs text-muted tabular-nums" data-summary>
            {result.width}×{result.height} · {formatBytes(result.size)} ·{" "}
            {result.runtime === "webgpu" ? ui.runtimeWebgpu : ui.runtimeWasm} ·{" "}
            {fill(ui.tookSeconds, { seconds: result.seconds.toFixed(1) })}
          </p>
          <a
            href={result.url}
            download={result.name}
            className="inline-block rounded-lg border border-border px-4 py-2 text-sm font-medium"
          >
            {common.download}
          </a>
        </div>
      )}

      {result && (
        <SendTo chain={chain} from="upscale" files={[{ url: result.url, name: result.name, pixels: result.width * result.height }]} />
      )}
    </div>
  );
}
