"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { FileDrop } from "@/components/FileDrop";
import { trackToolCompleted } from "@/lib/analytics";
import { canRunImageTools } from "@/lib/capabilities";
import { formatBytes, replaceExtension } from "@/lib/format";
import { fill } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries/en";
import {
  ENGINE_BYTES,
  MATTE_BACKGROUNDS,
  MATTE_MODELS,
  MODEL_BYTES,
  type MatteBackground,
  type MatteModel,
  type MatteProgress,
} from "@/lib/matting/matte-core";
import { useCapability } from "@/lib/use-capability";
import type { WorkerRequest, WorkerRequestPayload, WorkerResponse } from "./matte.worker";

type Ui = Dictionary["tools"]["remove-bg"]["ui"];
type Common = Dictionary["common"];

interface Result {
  url: string;
  size: number;
  width: number;
  height: number;
  name: string;
  runtime: "webgpu" | "wasm";
  coverage: number;
}

/** 전경이 이보다 작으면 사실상 아무것도 못 찾은 것이다. */
const EMPTY_COVERAGE = 0.002;

export function BackgroundRemover({ ui, common }: { ui: Ui; common: Common }) {
  const [broken, setBroken] = useState(false);
  const capable = useCapability(canRunImageTools);
  const supported = capable === null ? null : capable && !broken;

  const [file, setFile] = useState<File | null>(null);
  const [model, setModel] = useState<MatteModel>("fast");
  const [background, setBackground] = useState<MatteBackground>("transparent");
  const [progress, setProgress] = useState<MatteProgress | null>(null);
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
      // 모듈 워커여야 한다 — 엔진을 CDN 에서 동적 import 로 받기 때문이다.
      worker = new Worker(new URL("./matte.worker.ts", import.meta.url), { type: "module" });
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
    };
  }, []);

  const clearResult = useCallback(() => {
    if (resultRef.current) URL.revokeObjectURL(resultRef.current.url);
    setResult(null);
  }, []);

  const addFiles = useCallback(
    (files: File[]) => {
      if (files.length === 0) return;
      clearResult();
      setError(null);
      setProgress(null);
      setFile(files[0]);
    },
    [clearResult],
  );

  const run = useCallback(async () => {
    if (!file) return;
    setBusy(true);
    setError(null);
    clearResult();
    try {
      const response = await callWorker({ kind: "matte", file, options: { model, background } });
      if (response.kind !== "matted") throw new Error("UNKNOWN");
      setResult({
        url: URL.createObjectURL(response.blob),
        size: response.blob.size,
        width: response.width,
        height: response.height,
        name: replaceExtension(file.name, "png"),
        runtime: response.runtime,
        coverage: response.coverage,
      });
      trackToolCompleted("remove-bg");
    } catch (caught) {
      const message = caught instanceof Error ? caught.message : "UNKNOWN";
      setError(
        message === "ENGINE_FAILED"
          ? ui.errEngine
          : message === "MODEL_FAILED"
            ? ui.errModel
            : message === "UNSUPPORTED_INPUT"
              ? ui.errUnsupportedInput
              : ui.errGeneric,
      );
    } finally {
      setBusy(false);
      setProgress(null);
    }
  }, [background, callWorker, clearResult, file, model, ui]);

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
        : ui.stageMatting
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

      <div className="grid gap-4 rounded-xl border border-border bg-panel p-5 sm:grid-cols-2">
        <label className="space-y-1.5">
          <span className="block text-sm text-muted">{ui.modelLabel}</span>
          <select
            value={model}
            disabled={busy}
            onChange={(event) => setModel(event.target.value as MatteModel)}
            className="w-full rounded-lg border border-border bg-bg px-3 py-2 text-sm"
          >
            {MATTE_MODELS.map((value) => (
              <option key={value} value={value}>
                {fill(value === "fast" ? ui.modelFast : ui.modelFine, {
                  size: formatBytes(MODEL_BYTES[value]),
                })}
              </option>
            ))}
          </select>
        </label>

        <label className="space-y-1.5">
          <span className="block text-sm text-muted">{ui.backgroundLabel}</span>
          <select
            value={background}
            disabled={busy}
            onChange={(event) => setBackground(event.target.value as MatteBackground)}
            className="w-full rounded-lg border border-border bg-bg px-3 py-2 text-sm"
          >
            {MATTE_BACKGROUNDS.map((value) => (
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
      </div>

      {/*
       * 받을 양을 **누르기 전에** 말한다. Tier 2 는 Tier 1 과 달리 모델이 무거워서,
       * 이걸 숨기면 사용자는 왜 멈춰 있는지 모른 채 기다리게 된다.
       */}
      <p className="text-sm text-muted" data-download-note>
        {fill(ui.downloadNote, {
          size: formatBytes(ENGINE_BYTES + MODEL_BYTES[model]),
        })}{" "}
        {ui.cachedNote}
      </p>

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
        <div className="space-y-3 rounded-xl border border-border p-4">
          <div
            className="overflow-hidden rounded-lg"
            style={{
              // 투명한 곳이 보이도록 체크무늬를 깐다 — 흰 배경이면 결과를 못 알아본다.
              backgroundImage:
                "linear-gradient(45deg,#0002 25%,transparent 25%,transparent 75%,#0002 75%),linear-gradient(45deg,#0002 25%,transparent 25%,transparent 75%,#0002 75%)",
              backgroundSize: "16px 16px",
              backgroundPosition: "0 0, 8px 8px",
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={result.url}
              alt={ui.resultAlt}
              data-result
              className="mx-auto max-h-96 w-auto"
            />
          </div>
          <p className="text-xs text-muted tabular-nums" data-summary>
            {result.width}×{result.height} · {formatBytes(result.size)} ·{" "}
            {result.runtime === "webgpu" ? ui.runtimeWebgpu : ui.runtimeWasm}
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
