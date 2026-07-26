"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { FileDrop } from "@/components/FileDrop";
import { trackToolCompleted } from "@/lib/analytics";
import { canRunPdfTools } from "@/lib/capabilities";
import { formatBytes } from "@/lib/format";
import { fill } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries/en";
import type { WorkerRequestPayload, WorkerRequest, WorkerResponse } from "./merge.worker";

type Ui = Dictionary["tools"]["pdf-merge"]["ui"];
type Common = Dictionary["common"];
type Errors = Dictionary["pdfErrors"];

const OUTPUT_NAME = "merged.pdf";

interface Item {
  id: number;
  file: File;
  status: "reading" | "ready" | "error";
  pageCount?: number;
  error?: string;
}

interface Result {
  url: string;
  size: number;
  pageCount: number;
}

function describeError(errors: Errors, message: string): string {
  switch (message) {
    case "ENCRYPTED":
      return errors.encrypted;
    case "NO_PAGES":
      return errors.noPages;
    case "TOO_LARGE":
      return errors.tooLarge;
    case "INVALID_PDF":
      return errors.invalid;
    default:
      return errors.generic;
  }
}

export function PdfMerger({ ui, common, errors }: { ui: Ui; common: Common; errors: Errors }) {
  const [supported, setSupported] = useState<boolean | null>(null);
  const [items, setItems] = useState<Item[]>([]);
  const [result, setResult] = useState<Result | null>(null);
  const [busy, setBusy] = useState(false);
  const [failure, setFailure] = useState<string | null>(null);

  const workerRef = useRef<Worker | null>(null);
  const pendingRef = useRef(new Map<number, { resolve: (v: WorkerResponse) => void; reject: (e: Error) => void }>());
  const rpcId = useRef(0);
  const itemId = useRef(0);

  /**
   * 워커를 첫 파일이 들어올 때 만든다.
   *
   * PDF 도구는 시작할 때 워커에 물어볼 것이 없다(이미지 도구와 달리 인코더 감지가 필요
   * 없다). 그러니 워커 청크조차 받을 이유가 없다 — 규칙 2번을 가장 엄격하게 지키는 형태다.
   * 프로덕션 실측: 셸 529KB, PDF 를 넣은 뒤에야 +461KB. tests/pdf-merge.spec.ts 가 고정한다.
   */
  const ensureWorker = useCallback((): Worker | null => {
    if (workerRef.current) return workerRef.current;
    try {
      const worker = new Worker(new URL("./merge.worker.ts", import.meta.url));
      worker.onmessage = (event: MessageEvent<WorkerResponse>) => {
        const message = event.data;
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
    setSupported(canRunPdfTools());
    const pending = pendingRef.current;
    return () => {
      workerRef.current?.terminate();
      workerRef.current = null;
      pending.clear();
    };
  }, []);

  // 결과가 교체되거나 언마운트될 때 objectURL 을 회수한다.
  useEffect(() => {
    if (!result) return;
    return () => URL.revokeObjectURL(result.url);
  }, [result]);

  const clearResult = useCallback(() => {
    setResult(null);
    setFailure(null);
  }, []);

  const addFiles = useCallback(
    async (files: File[]) => {
      clearResult();
      const added: Item[] = files.map((file) => ({
        id: ++itemId.current,
        file,
        status: "reading" as const,
      }));
      setItems((prev) => [...prev, ...added]);

      // 파일이 들어온 순간에만 pdf-lib 이 내려온다. 페이지 수를 여기서 미리 읽어
      // 병합 버튼을 누르기 전에 못 읽는 파일을 걸러낸다.
      for (const entry of added) {
        try {
          const response = await callWorker({ kind: "inspect", file: entry.file });
          if (response.kind !== "inspected") throw new Error("UNKNOWN");
          setItems((prev) =>
            prev.map((item) =>
              item.id === entry.id ? { ...item, status: "ready", pageCount: response.pageCount } : item,
            ),
          );
        } catch (error) {
          const message = error instanceof Error ? error.message : "UNKNOWN";
          setItems((prev) =>
            prev.map((item) =>
              item.id === entry.id
                ? { ...item, status: "error", error: describeError(errors, message) }
                : item,
            ),
          );
        }
      }
    },
    [callWorker, clearResult, errors],
  );

  const move = useCallback(
    (id: number, delta: number) => {
      clearResult();
      setItems((prev) => {
        const index = prev.findIndex((item) => item.id === id);
        const target = index + delta;
        if (index < 0 || target < 0 || target >= prev.length) return prev;
        const next = [...prev];
        [next[index], next[target]] = [next[target], next[index]];
        return next;
      });
    },
    [clearResult],
  );

  const remove = useCallback(
    (id: number) => {
      clearResult();
      setItems((prev) => prev.filter((item) => item.id !== id));
    },
    [clearResult],
  );

  const reset = useCallback(() => {
    clearResult();
    setItems([]);
  }, [clearResult]);

  const merge = useCallback(async () => {
    const files = items.filter((item) => item.status === "ready").map((item) => item.file);
    if (files.length < 2) return;

    clearResult();
    setBusy(true);
    try {
      const response = await callWorker({ kind: "merge", files });
      if (response.kind !== "merged") throw new Error("UNKNOWN");
      setResult({
        url: URL.createObjectURL(response.blob),
        size: response.blob.size,
        pageCount: response.pageCount,
      });
      trackToolCompleted("pdf-merge");
    } catch (error) {
      const message = error instanceof Error ? error.message : "UNKNOWN";
      setFailure(describeError(errors, message));
    } finally {
      setBusy(false);
    }
  }, [callWorker, clearResult, errors, items]);

  if (supported === false) {
    return (
      <div className="rounded-xl border border-border bg-panel p-6">
        <p className="font-medium text-warn">{common.workerUnsupportedTitle}</p>
        <p className="mt-2 text-sm text-muted">{common.workerUnsupportedHint}</p>
      </div>
    );
  }

  const ready = items.filter((item) => item.status === "ready");
  const totalPages = ready.reduce((sum, item) => sum + (item.pageCount ?? 0), 0);

  return (
    <div className="space-y-6">
      <FileDrop
        accept="application/pdf,.pdf"
        onFiles={addFiles}
        label={ui.dropLabel}
        hint={ui.dropHint}
        cta={common.chooseFile}
        disabled={busy}
      />

      {items.length > 0 && (
        <>
          <ul
            aria-label={ui.listLabel}
            className="divide-y divide-border rounded-xl border border-border"
          >
            {items.map((item, index) => (
              <li key={item.id} className="flex flex-wrap items-center gap-3 p-4">
                <span className="w-6 shrink-0 text-sm text-muted tabular-nums">{index + 1}</span>

                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{item.file.name}</p>
                  <p className="text-xs text-muted">
                    {formatBytes(item.file.size)}
                    {item.status === "reading" && ` · ${ui.reading}`}
                    {item.status === "ready" && ` · ${fill(ui.pageCount, { n: item.pageCount ?? 0 })}`}
                  </p>
                </div>

                {item.status === "error" && <span className="text-sm text-err">{item.error}</span>}

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    aria-label={fill(ui.moveUp, { name: item.file.name })}
                    onClick={() => move(item.id, -1)}
                    disabled={busy || index === 0}
                    className="rounded-lg border border-border px-2.5 py-1.5 text-sm disabled:opacity-30"
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    aria-label={fill(ui.moveDown, { name: item.file.name })}
                    onClick={() => move(item.id, 1)}
                    disabled={busy || index === items.length - 1}
                    className="rounded-lg border border-border px-2.5 py-1.5 text-sm disabled:opacity-30"
                  >
                    ↓
                  </button>
                  <button
                    type="button"
                    aria-label={fill(ui.remove, { name: item.file.name })}
                    onClick={() => remove(item.id)}
                    disabled={busy}
                    className="rounded-lg border border-border px-2.5 py-1.5 text-sm text-muted disabled:opacity-30"
                  >
                    ✕
                  </button>
                </div>
              </li>
            ))}
          </ul>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={merge}
              disabled={busy || ready.length < 2}
              className="rounded-lg bg-accent px-5 py-2.5 text-sm font-medium text-accent-fg disabled:opacity-50"
            >
              {busy ? ui.merging : fill(ui.merge, { n: ready.length })}
            </button>
            {ready.length >= 2 && !busy && (
              <span className="text-sm text-muted">{fill(ui.totalPages, { n: totalPages })}</span>
            )}
            {ready.length === 1 && <span className="text-sm text-muted">{ui.needTwo}</span>}
            <button
              type="button"
              onClick={reset}
              disabled={busy}
              className="text-sm text-muted underline disabled:opacity-50"
            >
              {common.clear}
            </button>
          </div>
        </>
      )}

      {failure && (
        <p className="rounded-xl border border-border bg-panel p-4 text-sm text-err">{failure}</p>
      )}

      {result && (
        <div className="flex flex-wrap items-center gap-4 rounded-xl border border-border bg-panel p-5">
          <div className="min-w-0 flex-1">
            <p className="font-medium">{OUTPUT_NAME}</p>
            <p className="mt-1 text-sm text-muted">
              {fill(ui.resultDetail, {
                pages: result.pageCount,
                size: formatBytes(result.size),
              })}
            </p>
          </div>
          <a
            href={result.url}
            download={OUTPUT_NAME}
            className="rounded-lg bg-accent px-5 py-2.5 text-sm font-medium text-accent-fg"
          >
            {common.download}
          </a>
        </div>
      )}
    </div>
  );
}
