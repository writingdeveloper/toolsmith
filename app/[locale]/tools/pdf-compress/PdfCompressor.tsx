"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { FileDrop } from "@/components/FileDrop";
import { trackToolCompleted } from "@/lib/analytics";
import { canRunPdfTools } from "@/lib/capabilities";
import { useCapability } from "@/lib/use-capability";
import { fileStem, formatBytes, savingsPercent } from "@/lib/format";
import { fill } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries/en";
import type { WorkerRequest, WorkerRequestPayload, WorkerResponse } from "./compress.worker";

type Ui = Dictionary["tools"]["pdf-compress"]["ui"];
type Common = Dictionary["common"];
type Errors = Dictionary["pdfErrors"];

const MAX_EDGES = [0, 2400, 1600, 1200];

interface Result {
  url: string;
  name: string;
  before: number;
  after: number;
  images: number;
  rewritten: number;
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

export function PdfCompressor({ ui, common, errors }: { ui: Ui; common: Common; errors: Errors }) {
  /** 워커를 못 만든 경우. 능력 판정(capable)과 원인이 달라 따로 둔다. */
  const [broken, setBroken] = useState(false);
  const capable = useCapability(canRunPdfTools);
  const supported = capable === null ? null : capable && !broken;
  const [file, setFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState<number | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [quality, setQuality] = useState(0.7);
  const [maxEdge, setMaxEdge] = useState(1600);
  const [result, setResult] = useState<Result | null>(null);
  const [failure, setFailure] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const workerRef = useRef<Worker | null>(null);
  const pendingRef = useRef(new Map<number, { resolve: (v: WorkerResponse) => void; reject: (e: Error) => void }>());
  const rpcId = useRef(0);

  /** 워커는 첫 파일이 들어올 때 만든다 — 그 전에 pdf-lib 을 받을 이유가 없다. */
  const ensureWorker = useCallback((): Worker | null => {
    if (workerRef.current) return workerRef.current;
    try {
      const worker = new Worker(new URL("./compress.worker.ts", import.meta.url));
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
      setBroken(true);
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
    const pending = pendingRef.current;
    return () => {
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
      setPageCount(null);
      setFileError(null);
      setResult(null);
      setFailure(null);

      try {
        const response = await callWorker({ kind: "inspect", file: next });
        if (response.kind !== "inspected") throw new Error("UNKNOWN");
        setPageCount(response.pageCount);
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
    setBusy(true);
    try {
      const response = await callWorker({
        kind: "compress",
        file,
        options: { quality, maxEdge },
      });
      if (response.kind !== "compressed") throw new Error("UNKNOWN");
      setResult({
        url: URL.createObjectURL(response.blob),
        name: fill(ui.outputName, { stem: fileStem(file.name) }),
        ...response.stats,
      });
      trackToolCompleted("pdf-compress");
    } catch (error) {
      setFailure(describeError(errors, error instanceof Error ? error.message : "UNKNOWN"));
    } finally {
      setBusy(false);
    }
  }, [callWorker, errors, file, maxEdge, quality, ui]);

  if (supported === false) {
    return (
      <div className="rounded-xl border border-border bg-panel p-6">
        <p className="font-medium text-warn">{common.workerUnsupportedTitle}</p>
        <p className="mt-2 text-sm text-muted">{common.workerUnsupportedHint}</p>
      </div>
    );
  }

  const ready = pageCount !== null;
  const saved = result ? savingsPercent(result.before, result.after) : 0;
  /**
   * "우리가 사진을 압축해서 줄었다" 와 "다시 저장했더니 우연히 몇 % 줄었다" 는 다르다.
   * 후자에 절감률을 붙이면 하지 않은 일을 한 것처럼 보이게 된다.
   */
  const compressed = result ? result.rewritten > 0 && result.after < result.before : false;

  return (
    <div className="space-y-6">
      <FileDrop
        accept="application/pdf,.pdf"
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
            {pageCount !== null && ` · ${fill(ui.pageCount, { n: pageCount })}`}
            {pageCount === null && !fileError && ` · ${ui.reading}`}
          </p>
          {fileError && <p className="mt-2 text-sm text-err">{fileError}</p>}
        </div>
      )}

      {ready && (
        <div className="grid gap-4 rounded-xl border border-border bg-panel p-5 sm:grid-cols-2">
          <label className="space-y-1.5">
            <span className="block text-sm text-muted">
              {fill(ui.qualityLabel, { value: Math.round(quality * 100) })}
            </span>
            <input
              type="range"
              aria-label={ui.qualityAria}
              min={0.3}
              max={0.95}
              step={0.05}
              value={quality}
              disabled={busy}
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
      )}

      {ready && (
        <button
          type="button"
          onClick={run}
          disabled={busy}
          className="rounded-lg bg-accent px-5 py-2.5 text-sm font-medium text-accent-fg disabled:opacity-50"
        >
          {busy ? ui.working : ui.run}
        </button>
      )}

      {failure && <p className="rounded-xl border border-border bg-panel p-4 text-sm text-err">{failure}</p>}

      {result && (
        <div className="space-y-3 rounded-xl border border-border bg-panel p-5">
          <div className="flex flex-wrap items-center gap-4">
            <div className="min-w-0 flex-1">
              <p className="truncate font-medium">{result.name}</p>
              <p className="mt-1 text-sm text-muted">
                {formatBytes(result.before)} → <span className="text-fg">{formatBytes(result.after)}</span>{" "}
                {compressed && <span className="text-ok">(-{saved}%)</span>}
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

          {/* 하지 않은 일을 한 것처럼 말하지 않는다 */}
          {!compressed && (
            <p className="text-sm text-warn">
              {result.images === 0 ? ui.noImages : ui.alreadySmall}
            </p>
          )}
          {compressed && (
            <p className="text-sm text-muted">
              {fill(ui.rewroteImages, { n: result.rewritten, total: result.images })}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
