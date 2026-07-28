"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ACCEPT } from "@/lib/tools";
import { SendTo } from "@/components/SendTo";
import { FileDrop } from "@/components/FileDrop";
import type { ChainCopy } from "@/lib/chain";
import { trackToolCompleted } from "@/lib/analytics";
import { canRunImageTools } from "@/lib/capabilities";
import { formatBytes, replaceExtension } from "@/lib/format";
import { fill } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries/en";
import {
  FORMAT_EXTENSION,
  FORMAT_LABEL,
  sourceFormat,
  type OutputFormat,
} from "@/lib/image/convert-core";
import {
  CROP_RATIOS,
  planResize,
  type CropRatio,
} from "@/lib/image/resize-core";
import { useCapability } from "@/lib/use-capability";
import type {
  WorkerRequest,
  WorkerRequestPayload,
  WorkerResponse,
} from "./resize.worker";

type Ui = Dictionary["tools"]["image-resize"]["ui"];
type Common = Dictionary["common"];

interface Item {
  id: number;
  file: File;
  /** 미리 잰 원본 크기. 누르기 전에 결과 크기를 말하려면 필요하다. */
  source?: { width: number; height: number };
  status: "queued" | "working" | "done" | "error";
  result?: {
    url: string;
    size: number;
    width: number;
    height: number;
    name: string;
  };
  error?: string;
}

export function ImageResizer({
  chain,
  ui,
  common,
}: {
  chain: ChainCopy;
  ui: Ui;
  common: Common;
}) {
  const [broken, setBroken] = useState(false);
  const capable = useCapability(canRunImageTools);
  const supported = capable === null ? null : capable && !broken;
  const [formats, setFormats] = useState<OutputFormat[]>([]);
  const [format, setFormat] = useState<OutputFormat | null>(null);
  const [width, setWidth] = useState(1080);
  const [crop, setCrop] = useState<CropRatio>("none");
  const [quality, setQuality] = useState(0.85);
  const [items, setItems] = useState<Item[]>([]);
  const [busy, setBusy] = useState(false);

  const workerRef = useRef<Worker | null>(null);
  const pendingRef = useRef(
    new Map<
      number,
      { resolve: (v: WorkerResponse) => void; reject: (e: Error) => void }
    >(),
  );
  const rpcId = useRef(0);
  const itemId = useRef(0);
  const itemsRef = useRef(items);
  useEffect(() => {
    itemsRef.current = items;
  }, [items]);

  const callWorker = useCallback(
    (request: WorkerRequestPayload): Promise<WorkerResponse> => {
      const worker = workerRef.current;
      if (!worker) return Promise.reject(new Error("NO_WORKER"));
      const id = ++rpcId.current;
      return new Promise((resolve, reject) => {
        pendingRef.current.set(id, { resolve, reject });
        worker.postMessage({ ...request, id } as WorkerRequest);
      });
    },
    [],
  );

  useEffect(() => {
    if (!capable) return;
    const pending = pendingRef.current;
    let worker: Worker;
    try {
      worker = new Worker(new URL("./resize.worker.ts", import.meta.url));
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
        if (response.kind === "detect")
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

  const addFiles = useCallback(async (files: File[]) => {
    const added = files.map((file) => ({
      id: ++itemId.current,
      file,
      status: "queued" as const,
    }));
    setItems((prev) => [...prev, ...added]);

    // 원본 크기를 미리 잰다 — 누르기 전에 "무엇이 나오는지" 를 말하기 위해서다.
    for (const entry of added) {
      try {
        const bitmap = await createImageBitmap(entry.file);
        const source = { width: bitmap.width, height: bitmap.height };
        bitmap.close();
        setItems((prev) =>
          prev.map((item) =>
            item.id === entry.id ? { ...item, source } : item,
          ),
        );
      } catch {
        // 못 읽는 형식(HEIC 등)은 누른 뒤 워커가 제대로 알려 준다
      }
    }
  }, []);

  const reset = useCallback(() => {
    for (const item of itemsRef.current) {
      if (item.result) URL.revokeObjectURL(item.result.url);
    }
    setItems([]);
  }, []);

  const runAll = useCallback(async () => {
    const targets = itemsRef.current;
    let succeeded = 0;
    setBusy(true);

    for (const target of targets) {
      const chosen = format ?? sourceFormat(target.file) ?? "image/jpeg";
      setItems((prev) =>
        prev.map((item) =>
          item.id === target.id
            ? { ...item, status: "working", error: undefined }
            : item,
        ),
      );
      try {
        const response = await callWorker({
          kind: "resize",
          file: target.file,
          options: { width, crop, format: chosen, quality },
        });
        if (response.kind !== "resized") throw new Error("UNKNOWN");
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
                name: replaceExtension(
                  target.file.name,
                  FORMAT_EXTENSION[chosen],
                ),
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
                  error:
                    message === "UNSUPPORTED_INPUT"
                      ? ui.errUnsupportedInput
                      : ui.errGeneric,
                }
              : item,
          ),
        );
      }
    }

    if (succeeded > 0) trackToolCompleted("image-resize");
    setBusy(false);
  }, [callWorker, crop, format, quality, ui, width]);

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
        <p className="mt-2 text-sm text-muted">
          {common.workerUnsupportedHint}
        </p>
      </div>
    );
  }

  const doneCount = items.filter((item) => item.status === "done").length;
  const first = items.find((item) => item.source);
  /** 첫 장으로 미리 보여 주는 결과 크기. 워커와 **같은 함수**로 계산한다. */
  const preview = first?.source
    ? planResize(first.source.width, first.source.height, { width, crop })
    : null;

  return (
    <div className="space-y-6">
      <FileDrop
        accept={ACCEPT["image-resize"]}
        onFiles={addFiles}
        label={ui.dropLabel}
        hint={ui.dropHint}
        cta={common.chooseFile}
        disabled={busy}
      />

      <div className="grid gap-4 rounded-xl border border-border bg-panel p-5 sm:grid-cols-4">
        <label className="space-y-1.5">
          <span className="block text-sm text-muted">{ui.widthLabel}</span>
          <input
            type="number"
            min={16}
            max={10000}
            step={10}
            value={width}
            disabled={busy}
            onChange={(event) => setWidth(Number(event.target.value))}
            className="w-full rounded-lg border border-border bg-bg px-3 py-2 text-sm tabular-nums"
          />
        </label>

        <label className="space-y-1.5">
          <span className="block text-sm text-muted">{ui.cropLabel}</span>
          <select
            value={crop}
            disabled={busy}
            onChange={(event) => setCrop(event.target.value as CropRatio)}
            className="w-full rounded-lg border border-border bg-bg px-3 py-2 text-sm"
          >
            {CROP_RATIOS.map((ratio) => (
              <option key={ratio} value={ratio}>
                {ratio === "none" ? ui.cropNone : ratio}
              </option>
            ))}
          </select>
        </label>

        <label className="space-y-1.5">
          <span className="block text-sm text-muted">
            {fill(ui.qualityLabel, { value: Math.round(quality * 100) })}
          </span>
          <input
            type="range"
            min={0.3}
            max={1}
            step={0.01}
            value={quality}
            disabled={busy}
            onChange={(event) => setQuality(Number(event.target.value))}
            className="w-full accent-accent"
          />
        </label>

        <label className="space-y-1.5">
          <span className="block text-sm text-muted">{ui.formatLabel}</span>
          <select
            value={format ?? ""}
            disabled={busy}
            onChange={(event) =>
              setFormat(
                event.target.value === ""
                  ? null
                  : (event.target.value as OutputFormat),
              )
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

      {/*
       * 누르기 전에 결과 크기를 말한다. 화면과 워커가 planResize 를 함께 부르므로
       * 여기 적힌 숫자와 파일 안의 숫자가 어긋날 수 없다.
       */}
      {preview && first?.source && (
        <p className="text-sm text-muted tabular-nums">
          {fill(ui.preview, {
            from: `${first.source.width}×${first.source.height}`,
            to: `${preview.width}×${preview.height}`,
          })}
          {preview.width === preview.sw &&
            width > preview.sw &&
            ` · ${ui.noUpscale}`}
        </p>
      )}

      {items.length > 0 && (
        <>
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={runAll}
              disabled={busy}
              className="rounded-lg bg-accent px-5 py-2.5 text-sm font-medium text-accent-fg disabled:opacity-50"
            >
              {busy ? ui.working : fill(ui.run, { n: items.length })}
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
              <li
                key={item.id}
                className="flex flex-wrap items-center gap-3 p-4"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">
                    {item.file.name}
                  </p>
                  <p className="text-xs text-muted tabular-nums">
                    {item.source &&
                      `${item.source.width}×${item.source.height} · `}
                    {formatBytes(item.file.size)}
                    {item.result && (
                      <>
                        {" → "}
                        <span className="text-fg">
                          {item.result.width}×{item.result.height}
                        </span>{" "}
                        · {formatBytes(item.result.size)}
                      </>
                    )}
                  </p>
                </div>
                {item.status === "working" && (
                  <span className="text-sm text-muted">{ui.working}</span>
                )}
                {item.status === "error" && (
                  <span className="text-sm text-err">{item.error}</span>
                )}
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

      <SendTo
        chain={chain}
        from="image-resize"
        files={items.flatMap((item) =>
          item.result
            ? [
                {
                  url: item.result.url,
                  name: item.result.name,
                  pixels: item.result.width * item.result.height,
                },
              ]
            : [],
        )}
      />
    </div>
  );
}
