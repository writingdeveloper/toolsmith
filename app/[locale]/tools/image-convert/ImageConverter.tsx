"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { FileDrop } from "@/components/FileDrop";
import { canRunImageTools } from "@/lib/capabilities";
import { formatBytes, replaceExtension, savingsPercent } from "@/lib/format";
import { fill } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries/en";
import {
  FORMAT_EXTENSION,
  FORMAT_LABEL,
  LOSSY_FORMATS,
  type ConvertOptions,
  type OutputFormat,
} from "@/lib/image/convert-core";
import type { WorkerRequest, WorkerRequestPayload, WorkerResponse } from "./convert.worker";

type Ui = Dictionary["tools"]["image-convert"]["ui"];
type Common = Dictionary["common"];

const MAX_EDGES = [0, 4000, 2000, 1200, 800];

interface Item {
  id: number;
  file: File;
  status: "queued" | "working" | "done" | "error";
  result?: { url: string; size: number; width: number; height: number; name: string };
  error?: string;
}

function describeError(ui: Ui, message: string): string {
  return message === "UNSUPPORTED_INPUT" ? ui.errUnsupportedInput : ui.errGeneric;
}

export function ImageConverter({ ui, common }: { ui: Ui; common: Common }) {
  const [supported, setSupported] = useState<boolean | null>(null);
  const [formats, setFormats] = useState<OutputFormat[]>([]);
  const [format, setFormat] = useState<OutputFormat>("image/jpeg");
  const [quality, setQuality] = useState(0.82);
  const [maxEdge, setMaxEdge] = useState(0);
  const [items, setItems] = useState<Item[]>([]);
  const [busy, setBusy] = useState(false);

  const workerRef = useRef<Worker | null>(null);
  const pendingRef = useRef(new Map<number, { resolve: (v: WorkerResponse) => void; reject: (e: Error) => void }>());
  const rpcId = useRef(0);
  const itemId = useRef(0);

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
    if (!canRunImageTools()) {
      setSupported(false);
      return;
    }

    let worker: Worker;
    try {
      worker = new Worker(new URL("./convert.worker.ts", import.meta.url));
    } catch {
      setSupported(false);
      return;
    }
    workerRef.current = worker;
    setSupported(true);

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
        setFormats(response.formats);
        // WebP 가 되면 기본값으로 쓴다 — 같은 화질에서 가장 작다.
        if (response.formats.includes("image/webp")) setFormat("image/webp");
        else if (response.formats.length > 0) setFormat(response.formats[0]);
      })
      .catch(() => setSupported(false));

    return () => {
      worker.terminate();
      workerRef.current = null;
      pendingRef.current.clear();
    };
  }, [callWorker]);

  // 언마운트 시 objectURL 회수
  const itemsRef = useRef(items);
  itemsRef.current = items;
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

  const convertAll = useCallback(async () => {
    const options: ConvertOptions = { format, quality, maxEdge };
    const targets = itemsRef.current;
    setBusy(true);

    for (const target of targets) {
      setItems((prev) =>
        prev.map((item) => (item.id === target.id ? { ...item, status: "working", error: undefined } : item)),
      );
      try {
        const response = await callWorker({ kind: "convert", file: target.file, options });
        if (response.kind !== "converted") throw new Error("UNKNOWN");
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
                name: replaceExtension(target.file.name, FORMAT_EXTENSION[options.format]),
              },
            };
          }),
        );
      } catch (error) {
        const message = error instanceof Error ? error.message : "UNKNOWN";
        setItems((prev) =>
          prev.map((item) =>
            item.id === target.id
              ? { ...item, status: "error", error: describeError(ui, message) }
              : item,
          ),
        );
      }
    }

    setBusy(false);
  }, [callWorker, format, quality, maxEdge, ui]);

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
        <p className="font-medium text-warn">{ui.unsupportedTitle}</p>
        <p className="mt-2 text-sm text-muted">{ui.unsupportedHint}</p>
      </div>
    );
  }

  const doneCount = items.filter((item) => item.status === "done").length;
  const isLossy = LOSSY_FORMATS.includes(format);

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
          <span className="block text-sm text-muted">{ui.formatLabel}</span>
          <select
            value={format}
            disabled={busy || formats.length === 0}
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

        <label className="space-y-1.5">
          <span className="block text-sm text-muted">
            {isLossy
              ? fill(ui.qualityLabel, { value: Math.round(quality * 100) })
              : ui.qualityLossless}
          </span>
          <input
            type="range"
            min={0.3}
            max={1}
            step={0.01}
            value={quality}
            disabled={busy || !isLossy}
            onChange={(event) => setQuality(Number(event.target.value))}
            className="w-full accent-accent disabled:opacity-40"
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
      </div>

      {items.length > 0 && (
        <>
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={convertAll}
              disabled={busy || formats.length === 0}
              className="rounded-lg bg-accent px-5 py-2.5 text-sm font-medium text-accent-fg disabled:opacity-50"
            >
              {busy ? ui.converting : fill(ui.convert, { n: items.length })}
            </button>
            {doneCount > 1 && (
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

          <ul className="divide-y divide-border rounded-xl border border-border">
            {items.map((item) => (
              <li key={item.id} className="flex flex-wrap items-center gap-3 p-4">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{item.file.name}</p>
                  <p className="text-xs text-muted">
                    {formatBytes(item.file.size)}
                    {item.result && (
                      <>
                        {" → "}
                        <span className="text-fg">{formatBytes(item.result.size)}</span>{" "}
                        <span
                          className={
                            savingsPercent(item.file.size, item.result.size) >= 0 ? "text-ok" : "text-warn"
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

                {item.status === "working" && (
                  <span className="text-sm text-muted">{ui.itemWorking}</span>
                )}
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
