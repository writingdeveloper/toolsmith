"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { FileDrop } from "@/components/FileDrop";
import { canRunPdfTools } from "@/lib/capabilities";
import { fileStem, formatBytes } from "@/lib/format";
import { PdfError } from "@/lib/pdf/document";
import { parsePageRanges } from "@/lib/pdf/split-core";
import type { WorkerRequest, WorkerRequestPayload, WorkerResponse } from "./split.worker";

type Mode = "extract" | "pages";

interface Result {
  url: string;
  name: string;
  detail: string;
}

function describeError(message: string): string {
  switch (message) {
    case "ENCRYPTED":
      return "암호로 보호된 PDF 입니다";
    case "NO_PAGES":
      return "페이지가 없는 PDF 입니다";
    case "TOO_LARGE":
      return "512MB 를 넘습니다";
    case "INVALID_PDF":
      return "PDF 로 읽을 수 없습니다";
    case "BAD_RANGE":
      return "페이지 번호를 이해하지 못했습니다";
    case "RANGE_OUT_OF_BOUNDS":
      return "이 PDF 에 없는 페이지입니다";
    default:
      return "처리에 실패했습니다";
  }
}

export function PdfSplitter() {
  const [supported, setSupported] = useState<boolean | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState<number | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [mode, setMode] = useState<Mode>("extract");
  const [spec, setSpec] = useState("");
  const [result, setResult] = useState<Result | null>(null);
  const [failure, setFailure] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const workerRef = useRef<Worker | null>(null);
  const pendingRef = useRef(new Map<number, { resolve: (v: WorkerResponse) => void; reject: (e: Error) => void }>());
  const rpcId = useRef(0);

  /** 워커는 첫 파일이 들어올 때 만든다 — 그 전에는 pdf-lib 을 받을 이유가 없다. */
  const ensureWorker = useCallback((): Worker | null => {
    if (workerRef.current) return workerRef.current;
    try {
      const worker = new Worker(new URL("./split.worker.ts", import.meta.url));
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

  const accept = useCallback(
    async (files: File[]) => {
      const next = files[0];
      if (!next) return;
      setFile(next);
      setPageCount(null);
      setFileError(null);
      setResult(null);
      setFailure(null);

      try {
        const response = await callWorker({ kind: "inspect", file: next });
        if (response.kind !== "inspected") throw new Error("UNKNOWN");
        setPageCount(response.pageCount);
      } catch (error) {
        setPageCount(null);
        setFileError(describeError(error instanceof Error ? error.message : "UNKNOWN"));
      }
    },
    [callWorker],
  );

  /** 입력하는 즉시 몇 쪽이 잡히는지 보여준다. 여기서는 pdf-lib 을 부르지 않는다. */
  const selection = useMemo(() => {
    if (pageCount === null || !spec.trim()) return { indices: [] as number[], error: null as string | null };
    try {
      return { indices: parsePageRanges(spec, pageCount), error: null };
    } catch (error) {
      return {
        indices: [] as number[],
        error: describeError(error instanceof PdfError ? error.code : "UNKNOWN"),
      };
    }
  }, [spec, pageCount]);

  const run = useCallback(async () => {
    if (!file || pageCount === null) return;
    setResult(null);
    setFailure(null);
    setBusy(true);

    const stem = fileStem(file.name);
    try {
      if (mode === "extract") {
        const response = await callWorker({ kind: "extract", file, indices: selection.indices });
        if (response.kind !== "extracted") throw new Error("UNKNOWN");
        setResult({
          url: URL.createObjectURL(response.blob),
          name: `${stem}-추출.pdf`,
          detail: `${response.pageCount}페이지 · ${formatBytes(response.blob.size)}`,
        });
      } else {
        const response = await callWorker({ kind: "split", file, stem });
        if (response.kind !== "split") throw new Error("UNKNOWN");
        setResult({
          url: URL.createObjectURL(response.blob),
          name: `${stem}-낱장.zip`,
          detail: `PDF ${response.count}개 · ${formatBytes(response.blob.size)}`,
        });
      }
    } catch (error) {
      setFailure(describeError(error instanceof Error ? error.message : "UNKNOWN"));
    } finally {
      setBusy(false);
    }
  }, [callWorker, file, mode, pageCount, selection.indices]);

  if (supported === false) {
    return (
      <div className="rounded-xl border border-border bg-panel p-6">
        <p className="font-medium text-warn">이 브라우저에서는 PDF 분할을 실행할 수 없습니다.</p>
        <p className="mt-2 text-sm text-muted">
          Web Worker 를 지원하는 최신 Chrome, Edge, Firefox, Safari 에서 열어 주세요.
        </p>
      </div>
    );
  }

  const ready = pageCount !== null;
  const canRun = ready && !busy && (mode === "pages" || selection.indices.length > 0);

  return (
    <div className="space-y-6">
      <FileDrop
        accept="application/pdf,.pdf"
        multiple={false}
        onFiles={accept}
        label="PDF 를 여기에 놓으세요"
        hint="한 개씩 처리합니다 — 원하는 페이지만 뽑거나, 모든 페이지를 낱장으로 쪼갭니다"
        disabled={busy}
      />

      {file && (
        <div className="rounded-xl border border-border bg-panel p-5">
          <p className="truncate font-medium">{file.name}</p>
          <p className="mt-1 text-sm text-muted">
            {formatBytes(file.size)}
            {pageCount !== null && ` · ${pageCount}페이지`}
            {pageCount === null && !fileError && " · 읽는 중…"}
          </p>
          {fileError && <p className="mt-2 text-sm text-err">{fileError}</p>}
        </div>
      )}

      {ready && (
        <div className="space-y-4 rounded-xl border border-border bg-panel p-5">
          <div className="space-y-3">
            <label className="flex items-start gap-3">
              <input
                type="radio"
                name="mode"
                value="extract"
                aria-label="페이지 범위 추출"
                checked={mode === "extract"}
                disabled={busy}
                onChange={() => setMode("extract")}
                className="mt-1 accent-accent"
              />
              <span>
                <span className="block text-sm font-medium">페이지 범위 추출</span>
                <span className="block text-sm text-muted">고른 페이지만 모아 PDF 한 개로</span>
              </span>
            </label>

            <label className="flex items-start gap-3">
              <input
                type="radio"
                name="mode"
                value="pages"
                aria-label="모든 페이지를 낱장으로"
                checked={mode === "pages"}
                disabled={busy}
                onChange={() => setMode("pages")}
                className="mt-1 accent-accent"
              />
              <span>
                <span className="block text-sm font-medium">모든 페이지를 낱장으로</span>
                <span className="block text-sm text-muted">
                  {pageCount}개의 한 장짜리 PDF 를 ZIP 하나로 묶어 드립니다
                </span>
              </span>
            </label>
          </div>

          {mode === "extract" && (
            <label className="block space-y-1.5 border-t border-border pt-4">
              <span className="block text-sm text-muted">추출할 페이지</span>
              <input
                type="text"
                value={spec}
                aria-label="추출할 페이지"
                disabled={busy}
                onChange={(event) => setSpec(event.target.value)}
                placeholder={`예: 1-3, 5, 8-  (전체 ${pageCount}쪽)`}
                className="w-full rounded-lg border border-border bg-bg px-3 py-2 text-sm"
              />
              <span className="block text-sm">
                {selection.error && <span className="text-err">{selection.error}</span>}
                {!selection.error && selection.indices.length > 0 && (
                  <span className="text-muted">{selection.indices.length}쪽 선택됨</span>
                )}
                {!selection.error && selection.indices.length === 0 && (
                  <span className="text-muted">뽑을 페이지를 적어 주세요</span>
                )}
              </span>
            </label>
          )}
        </div>
      )}

      {ready && (
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={run}
            disabled={!canRun}
            className="rounded-lg bg-accent px-5 py-2.5 text-sm font-medium text-accent-fg disabled:opacity-50"
          >
            {busy ? "처리 중…" : mode === "extract" ? "추출하기" : "낱장으로 쪼개기"}
          </button>
        </div>
      )}

      {failure && <p className="rounded-xl border border-border bg-panel p-4 text-sm text-err">{failure}</p>}

      {result && (
        <div className="flex flex-wrap items-center gap-4 rounded-xl border border-border bg-panel p-5">
          <div className="min-w-0 flex-1">
            <p className="truncate font-medium">{result.name}</p>
            <p className="mt-1 text-sm text-muted">{result.detail}</p>
          </div>
          <a
            href={result.url}
            download={result.name}
            className="rounded-lg bg-accent px-5 py-2.5 text-sm font-medium text-accent-fg"
          >
            다운로드
          </a>
        </div>
      )}
    </div>
  );
}
