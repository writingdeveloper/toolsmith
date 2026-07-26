"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { FileDrop } from "@/components/FileDrop";
import { trackToolCompleted } from "@/lib/analytics";
import { canRunImageTools } from "@/lib/capabilities";
import { formatBytes, replaceExtension, savingsPercent } from "@/lib/format";
import { fill } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries/en";
import {
  FORMAT_EXTENSION,
  FORMAT_LABEL,
  sourceFormat,
  type OutputFormat,
} from "@/lib/image/convert-core";
import { useCapability } from "@/lib/use-capability";
import type { WorkerRequest, WorkerRequestPayload, WorkerResponse } from "./compress.worker";

type Ui = Dictionary["tools"]["image-compress"]["ui"];
type Common = Dictionary["common"];

const MAX_EDGES = [0, 4000, 2000, 1600, 1200];

interface Item {
  id: number;
  file: File;
  status: "queued" | "working" | "done" | "error";
  result?: { url: string; size: number; width: number; height: number; name: string };
  error?: string;
}

/** 이 파일이 품질 조절로 실제로 줄어드는가. PNG 는 무손실이라 줄지 않는다. */
function shrinksWithQuality(file: File): boolean {
  const format = sourceFormat(file);
  return format !== null && format !== "image/png";
}

export function ImageCompressor({ ui, common }: { ui: Ui; common: Common }) {
  const [broken, setBroken] = useState(false);
  const capable = useCapability(canRunImageTools);
  const supported = capable === null ? null : capable && !broken;
  const [formats, setFormats] = useState<OutputFormat[]>([]);
  /** null = 원본 형식 유지 */
  const [format, setFormat] = useState<OutputFormat | null>(null);
  const [quality, setQuality] = useState(0.75);
  const [maxEdge, setMaxEdge] = useState(0);
  const [items, setItems] = useState<Item[]>([]);
  const [busy, setBusy] = useState(false);

  const workerRef = useRef<Worker | null>(null);
  const pendingRef = useRef(
    new Map<number, { resolve: (v: WorkerResponse) => void; reject: (e: Error) => void }>(),
  );
  const rpcId = useRef(0);
  const itemId = useRef(0);
  const itemsRef = useRef(items);
  useEffect(() => {
    itemsRef.current = items;
  }, [items]);

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
      worker = new Worker(new URL("./compress.worker.ts", import.meta.url));
    } catch {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setBroken(true);
      return;
    }
    workerRef.current = worker;
    worker.onmessage = (event: MessageEvent<WorkerResponse>) => {
      const message = event.data;
      const entry = pendingRef.current.get(message.id);
      if (!entry) return;
      pendingRef.current.delete(message.id);
      if (message.kind === "failed") entry.reject(new Error(message.message));
      else entry.resolve(message);
    };
    callWorker({ kind: "detect" })
      .then((response) => {
        if (response.kind !== "detect") return;
        setFormats(response.formats as OutputFormat[]);
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
      for (const item of itemsRef.current) {
        if (item.result) URL.revokeObjectURL(item.result.url);
      }
    };
  }, []);

  const addFiles = useCallback((files: File[]) => {
    setItems((prev) => [
      ...prev,
      ...files.map((file) => ({ id: ++itemId.current, file, status: "queued" as const })),
    ]);
  }, []);

  const reset = useCallback(() => {
    for (const item of itemsRef.current) {
      if (item.result) URL.revokeObjectURL(item.result.url);
    }
    setItems([]);
  }, []);

  const compressAll = useCallback(async () => {
    const targets = itemsRef.current;
    let succeeded = 0;
    setBusy(true);

    for (const target of targets) {
      // 형식을 고르지 않았으면 원본 그대로 낸다. 읽을 수만 있고 못 쓰는 형식(HEIC 등)은 JPG 로.
      const chosen = format ?? sourceFormat(target.file) ?? "image/jpeg";
      setItems((prev) =>
        prev.map((item) =>
          item.id === target.id ? { ...item, status: "working", error: undefined } : item,
        ),
      );
      try {
        const response = await callWorker({
          kind: "compress",
          file: target.file,
          options: { format: chosen, quality, maxEdge },
        });
        if (response.kind !== "compressed") throw new Error("UNKNOWN");
        succeeded += 1;
        const url = URL.createObjectURL(response.blob);
        setItems((prev) =>
          prev.map((item) => {
            if (item.id !== target.id) return item;
            if (item.result) URL.revokeObjectURL(item.result.url);
            return {
              ...item,
              status: "done",
              result: {
                url,
                size: response.blob.size,
                width: response.width,
                height: response.height,
                name: replaceExtension(target.file.name, FORMAT_EXTENSION[chosen]),
              },
            };
          }),
        );
      } catch (error) {
        const message = error instanceof Error ? error.message : "UNKNOWN";
        setItems((prev) =>
          prev.map((item) =>
            item.id === target.id
              ? {
                  ...item,
                  status: "error",
                  error: message === "UNSUPPORTED_INPUT" ? ui.errUnsupportedInput : ui.errGeneric,
                }
              : item,
          ),
        );
      }
    }

    if (succeeded > 0) trackToolCompleted("image-compress");
    setBusy(false);
  }, [callWorker, format, maxEdge, quality, ui]);

  const downloadAll = useCallback(() => {
    for (const item of itemsRef.current) {
      if (!item.result) continue;
      const anchor = document.createElement("a");
      anchor.href = item.result.url;
      anchor.download = item.result.name;
      anchor.click();
    }
  }, []);

  if (supported === false) {
    return (
      <div className="rounded-xl border border-border bg-panel p-6">
        <p className="font-medium text-warn">{common.workerUnsupportedTitle}</p>
        <p className="mt-2 text-sm text-muted">{common.workerUnsupportedHint}</p>
      </div>
    );
  }

  const done = items.filter((item) => item.status === "done");
  const before = done.reduce((sum, item) => sum + item.file.size, 0);
  const after = done.reduce((sum, item) => sum + (item.result?.size ?? 0), 0);
  /** 품질을 낮춰도 줄지 않는 파일이 섞여 있는가 — 말해 주지 않으면 도구가 고장난 줄 안다. */
  const lossless = items.some((item) => !shrinksWithQuality(item.file)) && format === null;

  return (
    <div className="space-y-6">
      <FileDrop
        accept="image/*,.heic,.heif"
        onFiles={addFiles}
        label={ui.dropLabel}
        hint={ui.dropHint}
        cta={common.chooseFile}
        disabled={busy}
      />

      <div className="grid gap-4 rounded-xl border border-border bg-panel p-5 sm:grid-cols-3">
        <label className="space-y-1.5">
          <span className="block text-sm text-muted">
            {fill(ui.qualityLabel, { value: Math.round(quality * 100) })}
          </span>
          <input
            type="range"
            min={0.3}
            max={0.95}
            step={0.01}
            value={quality}
            disabled={busy}
            onChange={(event) => setQuality(Number(event.target.value))}
            className="w-full accent-accent"
          />
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

        <label className="space-y-1.5">
          <span className="block text-sm text-muted">{ui.formatLabel}</span>
          <select
            value={format ?? ""}
            disabled={busy}
            onChange={(event) =>
              setFormat(event.target.value === "" ? null : (event.target.value as OutputFormat))
            }
            className="w-full rounded-lg border border-border bg-bg px-3 py-2 text-sm"
          >
            <option value="">{ui.formatKeep}</option>
            {formats.map((value) => (
              <option key={value} value={value}>
                {FORMAT_LABEL[value]}
              </option>
            ))}
          </select>
        </label>
      </div>

      {/* PNG 를 넣고 품질을 내렸는데 크기가 그대로면 도구가 고장난 줄 안다. 미리 말한다. */}
      {lossless && <p className="text-sm text-warn">{ui.losslessNote}</p>}

      {items.length > 0 && (
        <>
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={compressAll}
              disabled={busy}
              className="rounded-lg bg-accent px-5 py-2.5 text-sm font-medium text-accent-fg disabled:opacity-50"
            >
              {busy ? ui.working : fill(ui.run, { n: items.length })}
            </button>
            {done.length > 1 && (
              <button
                type="button"
                onClick={downloadAll}
                disabled={busy}
                className="rounded-lg border border-border px-5 py-2.5 text-sm font-medium disabled:opacity-50"
              >
                {common.downloadAll}
              </button>
            )}
            <button
              type="button"
              onClick={reset}
              disabled={busy}
              className="text-sm text-muted underline disabled:opacity-50"
            >
              {common.clear}
            </button>
          </div>

          {done.length > 0 && (
            <p className="rounded-xl border border-border bg-panel p-4 text-sm tabular-nums">
              {fill(ui.total, {
                n: done.length,
                before: formatBytes(before),
                after: formatBytes(after),
                percent: savingsPercent(before, after),
              })}
            </p>
          )}

          <ul className="divide-y divide-border rounded-xl border border-border">
            {items.map((item) => (
              <li key={item.id} className="flex flex-wrap items-center gap-3 p-4">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{item.file.name}</p>
                  <p className="text-xs text-muted tabular-nums">
                    {formatBytes(item.file.size)}
                    {item.result && (
                      <>
                        {" → "}
                        <span className="text-fg">{formatBytes(item.result.size)}</span>{" "}
                        <span
                          className={
                            savingsPercent(item.file.size, item.result.size) >= 0
                              ? "text-ok"
                              : "text-warn"
                          }
                        >
                          ({savingsPercent(item.file.size, item.result.size) >= 0 ? "-" : "+"}
                          {Math.abs(savingsPercent(item.file.size, item.result.size))}%)
                        </span>{" "}
                        · {item.result.width}×{item.result.height}
                      </>
                    )}
                  </p>
                </div>
                {item.status === "working" && <span className="text-sm text-muted">{ui.working}</span>}
                {item.status === "error" && <span className="text-sm text-err">{item.error}</span>}
                {item.status === "done" && item.result && (
                  <a
                    href={item.result.url}
                    download={item.result.name}
                    className="rounded-lg border border-border px-4 py-2 text-sm font-medium"
                  >
                    {common.download}
                  </a>
                )}
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
