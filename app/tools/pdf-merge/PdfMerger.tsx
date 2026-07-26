"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { FileDrop } from "@/components/FileDrop";
import { canRunPdfTools } from "@/lib/capabilities";
import { formatBytes } from "@/lib/format";
import type { WorkerRequestPayload, WorkerRequest, WorkerResponse } from "./merge.worker";

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

function describeError(message: string): string {
  switch (message) {
    case "ENCRYPTED":
      return "암호로 보호된 PDF 입니다";
    case "NO_PAGES":
      return "페이지가 없는 PDF 입니다";
    case "TOO_LARGE":
      return "합쳐서 512MB 를 넘습니다";
    case "INVALID_PDF":
      return "PDF 로 읽을 수 없습니다";
    default:
      return "처리에 실패했습니다";
  }
}

export function PdfMerger() {
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
   * 마운트 시점에 만들면 워커 청크가 곧바로 로드되고, 그와 함께 pdf-lib 까지 내려온다
   * (실측: tests/pdf-merge.spec.ts). PDF 도구는 시작할 때 워커에 물어볼 것이 없으므로
   * 생성을 미루는 편이 규칙 2번("버튼을 누르기 전엔 무거운 자산을 받지 않는다")에 맞다.
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
              item.id === entry.id ? { ...item, status: "error", error: describeError(message) } : item,
            ),
          );
        }
      }
    },
    [callWorker, clearResult],
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
    } catch (error) {
      const message = error instanceof Error ? error.message : "UNKNOWN";
      setFailure(describeError(message));
    } finally {
      setBusy(false);
    }
  }, [callWorker, clearResult, items]);

  if (supported === false) {
    return (
      <div className="rounded-xl border border-border bg-panel p-6">
        <p className="font-medium text-warn">이 브라우저에서는 PDF 병합을 실행할 수 없습니다.</p>
        <p className="mt-2 text-sm text-muted">
          Web Worker 를 지원하는 최신 Chrome, Edge, Firefox, Safari 에서 열어 주세요.
        </p>
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
        label="PDF 를 여기에 놓으세요"
        hint="두 개 이상 넣으면 위에서부터 순서대로 이어 붙입니다"
        disabled={busy}
      />

      {items.length > 0 && (
        <>
          <ul aria-label="병합할 파일" className="divide-y divide-border rounded-xl border border-border">
            {items.map((item, index) => (
              <li key={item.id} className="flex flex-wrap items-center gap-3 p-4">
                <span className="w-6 shrink-0 text-sm text-muted tabular-nums">{index + 1}</span>

                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{item.file.name}</p>
                  <p className="text-xs text-muted">
                    {formatBytes(item.file.size)}
                    {item.status === "reading" && " · 읽는 중…"}
                    {item.status === "ready" && ` · ${item.pageCount}페이지`}
                  </p>
                </div>

                {item.status === "error" && <span className="text-sm text-err">{item.error}</span>}

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    aria-label={`${item.file.name} 위로`}
                    onClick={() => move(item.id, -1)}
                    disabled={busy || index === 0}
                    className="rounded-lg border border-border px-2.5 py-1.5 text-sm disabled:opacity-30"
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    aria-label={`${item.file.name} 아래로`}
                    onClick={() => move(item.id, 1)}
                    disabled={busy || index === items.length - 1}
                    className="rounded-lg border border-border px-2.5 py-1.5 text-sm disabled:opacity-30"
                  >
                    ↓
                  </button>
                  <button
                    type="button"
                    aria-label={`${item.file.name} 제거`}
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
              {busy ? "병합 중…" : `${ready.length}개 병합하기`}
            </button>
            {ready.length >= 2 && !busy && (
              <span className="text-sm text-muted">합계 {totalPages}페이지</span>
            )}
            {ready.length === 1 && <span className="text-sm text-muted">PDF 가 두 개 이상 필요합니다</span>}
            <button
              type="button"
              onClick={reset}
              disabled={busy}
              className="text-sm text-muted underline disabled:opacity-50"
            >
              비우기
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
              {result.pageCount}페이지 · {formatBytes(result.size)}
            </p>
          </div>
          <a
            href={result.url}
            download={OUTPUT_NAME}
            className="rounded-lg bg-accent px-5 py-2.5 text-sm font-medium text-accent-fg"
          >
            다운로드
          </a>
        </div>
      )}
    </div>
  );
}
