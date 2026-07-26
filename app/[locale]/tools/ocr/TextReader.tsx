"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { FileDrop } from "@/components/FileDrop";
import { trackToolCompleted } from "@/lib/analytics";
import { fileStem, formatBytes } from "@/lib/format";
import { fill } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries/en";
import {
  ENGINE_BYTES,
  LANGUAGE_BYTES,
  MAX_PAGES,
  OCR_LANGUAGES,
  readText,
  type OcrLanguage,
  type OcrProgress,
} from "@/lib/ocr/ocr-core";
import type { WorkerRequest, WorkerRequestPayload, WorkerResponse } from "./rasterize.worker";

type Ui = Dictionary["tools"]["ocr"]["ui"];
type Common = Dictionary["common"];
type PdfErrors = Dictionary["pdfErrors"];

interface Result {
  text: string;
  /** .txt 내려받기용. 렌더마다 만들면 그때마다 새는 URL 이 하나씩 생긴다. */
  url: string;
  pages: number;
  confidence: number;
  /** 상한에 걸려 뒤를 잘랐는가 */
  truncatedFrom: number | null;
}

function describeError(ui: Ui, errors: PdfErrors, message: string): string {
  switch (message) {
    case "ENCRYPTED":
      return errors.encrypted;
    case "NO_PAGES":
      return errors.noPages;
    case "INVALID_PDF":
      return errors.invalid;
    case "TOO_LARGE":
      return errors.tooLarge;
    case "ENGINE_FAILED":
      return ui.errEngine;
    case "TOO_MANY_PAGES":
      return fill(ui.errTooManyPages, { max: MAX_PAGES });
    default:
      return errors.generic;
  }
}

const isPdf = (file: File) => /\.pdf$/i.test(file.name) || file.type === "application/pdf";

export function TextReader({
  ui,
  common,
  errors,
  defaultLanguage,
}: {
  ui: Ui;
  common: Common;
  errors: PdfErrors;
  /** 보고 있는 언어판에 맞는 기본값. 한국어 페이지에 온 사람은 한국어 문서를 읽을 가능성이 높다. */
  defaultLanguage: OcrLanguage;
}) {
  const [broken, setBroken] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [language, setLanguage] = useState<OcrLanguage>(defaultLanguage);
  const [progress, setProgress] = useState<OcrProgress | null>(null);
  const [rasterizing, setRasterizing] = useState<{ done: number; total: number } | null>(null);
  const [result, setResult] = useState<Result | null>(null);
  const [failure, setFailure] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);

  const workerRef = useRef<Worker | null>(null);
  const pendingRef = useRef(
    new Map<number, { resolve: (v: WorkerResponse) => void; reject: (e: Error) => void }>(),
  );
  const rpcId = useRef(0);

  /** 워커는 PDF 가 들어올 때만 만든다 — 이미지만 읽는 사람은 pdf.js 를 받을 이유가 없다. */
  const ensureWorker = useCallback((): Worker | null => {
    if (workerRef.current) return workerRef.current;
    try {
      const worker = new Worker(new URL("./rasterize.worker.ts", import.meta.url));
      worker.onmessage = (event: MessageEvent<WorkerResponse>) => {
        const message = event.data;
        if (message.kind === "progress") {
          setRasterizing({ done: message.done, total: message.total });
          return;
        }
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

  const accept = useCallback((files: File[]) => {
    const next = files[0];
    if (!next) return;
    setFile(next);
    setResult(null);
    setFailure(null);
    setProgress(null);
    setRasterizing(null);
  }, []);

  const run = useCallback(async () => {
    if (!file) return;
    setResult(null);
    setFailure(null);
    setProgress(null);
    setRasterizing(null);
    setBusy(true);

    try {
      let images: Blob[];
      let truncatedFrom: number | null = null;

      if (isPdf(file)) {
        const response = await callWorker({ kind: "rasterize", file, maxPages: MAX_PAGES });
        if (response.kind !== "rasterized") throw new Error("UNKNOWN");
        images = response.images;
        // 잘렸다면 반드시 말한다 — 뒤가 없는 결과를 전부인 것처럼 주면 안 된다
        if (response.totalPages > images.length) truncatedFrom = response.totalPages;
      } else {
        images = [file];
      }
      setRasterizing(null);

      const read = await readText(images, language, setProgress);
      setResult({
        text: read.text,
        url: URL.createObjectURL(new Blob([read.text], { type: "text/plain;charset=utf-8" })),
        pages: read.pages.length,
        confidence: read.confidence,
        truncatedFrom,
      });
      trackToolCompleted("ocr");
    } catch (error) {
      setFailure(describeError(ui, errors, error instanceof Error ? error.message : "UNKNOWN"));
    } finally {
      setBusy(false);
    }
  }, [callWorker, errors, file, language, ui]);

  useEffect(() => {
    if (!result) return;
    return () => URL.revokeObjectURL(result.url);
  }, [result]);

  const copy = useCallback(async () => {
    if (!result) return;
    try {
      await navigator.clipboard.writeText(result.text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // 클립보드를 막아 둔 브라우저도 있다. 글은 화면에 그대로 있으니 손으로 고를 수 있다.
    }
  }, [result]);

  if (broken) {
    return (
      <div className="rounded-xl border border-border bg-panel p-6">
        <p className="font-medium text-warn">{common.workerUnsupportedTitle}</p>
        <p className="mt-2 text-sm text-muted">{common.workerUnsupportedHint}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <FileDrop
        accept="image/*,application/pdf,.pdf"
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
            {isPdf(file) && ` · ${fill(ui.pdfLimit, { max: MAX_PAGES })}`}
          </p>
        </div>
      )}

      {file && (
        <div className="space-y-4 rounded-xl border border-border bg-panel p-5">
          <label className="space-y-1.5">
            <span className="block text-sm text-muted">{ui.languageLabel}</span>
            <select
              value={language}
              disabled={busy}
              onChange={(event) => setLanguage(event.target.value as OcrLanguage)}
              className="w-full rounded-lg border border-border bg-bg px-3 py-2 text-sm sm:max-w-xs"
            >
              {OCR_LANGUAGES.map((code) => (
                <option key={code} value={code}>
                  {ui.languages[code]}
                </option>
              ))}
            </select>
          </label>

          {/*
           * 이 도구가 반드시 미리 말해야 하는 것. 다른 도구와 달리 **남의 CDN 에서
           * 몇 MB 를 받아야** 시작할 수 있다. 누르고 나서 알게 두지 않는다.
           */}
          <p className="text-sm text-warn">
            {fill(ui.downloadNote, {
              size: formatBytes(ENGINE_BYTES + LANGUAGE_BYTES[language]),
            })}
          </p>
          <p className="text-sm text-muted">{ui.cachedNote}</p>
        </div>
      )}

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
          {busy && (
            <span className="text-sm text-muted tabular-nums">
              {rasterizing
                ? fill(ui.stageRendering, { done: rasterizing.done, total: rasterizing.total })
                : progress?.stage === "reading"
                  ? fill(ui.stageReading, { page: progress.page ?? 1, pages: progress.pages ?? 1 })
                  : fill(ui.stageEngine, { percent: Math.round((progress?.ratio ?? 0) * 100) })}
            </span>
          )}
        </div>
      )}

      {failure && (
        <p className="rounded-xl border border-border bg-panel p-4 text-sm text-err">{failure}</p>
      )}

      {result && (
        <div className="space-y-3 rounded-xl border border-border bg-panel p-5">
          <div className="flex flex-wrap items-center gap-3">
            <p className="min-w-0 flex-1 text-sm text-muted tabular-nums">
              {fill(ui.resultSummary, {
                pages: result.pages,
                confidence: Math.round(result.confidence),
              })}
            </p>
            <button
              type="button"
              onClick={copy}
              className="rounded-lg border border-border px-4 py-2 text-sm font-medium"
            >
              {copied ? ui.copied : ui.copy}
            </button>
            {result.text.length > 0 && (
              <a
                href={result.url}
                download={`${fileStem(file?.name ?? "text")}.txt`}
                className="rounded-lg bg-accent px-5 py-2.5 text-sm font-medium text-accent-fg"
              >
                {common.download}
              </a>
            )}
          </div>

          {result.truncatedFrom !== null && (
            <p className="text-sm text-warn">
              {fill(ui.truncated, { total: result.truncatedFrom, max: MAX_PAGES })}
            </p>
          )}
          {result.text.length === 0 && <p className="text-sm text-warn">{ui.nothingFound}</p>}
          {/* 확신도가 낮으면 그렇다고 말한다. 틀린 글을 맞는 것처럼 주지 않는다. */}
          {result.text.length > 0 && result.confidence < 70 && (
            <p className="text-sm text-warn">{ui.lowConfidence}</p>
          )}

          <textarea
            readOnly
            value={result.text}
            aria-label={ui.resultLabel}
            className="h-80 w-full resize-y rounded-lg border border-border bg-bg p-3 font-mono text-sm"
          />
        </div>
      )}
    </div>
  );
}
