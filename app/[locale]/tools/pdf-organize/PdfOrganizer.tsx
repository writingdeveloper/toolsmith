"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { FileDrop } from "@/components/FileDrop";
import { trackToolCompleted } from "@/lib/analytics";
import { canRunPdfTools } from "@/lib/capabilities";
import { useCapability } from "@/lib/use-capability";
import { fileStem, formatBytes } from "@/lib/format";
import { fill } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries/en";
import { normalizeTurn } from "@/lib/pdf/organize-core";
import type { WorkerRequest, WorkerRequestPayload, WorkerResponse } from "./organize.worker";

type Ui = Dictionary["tools"]["pdf-organize"]["ui"];
type Common = Dictionary["common"];
type Errors = Dictionary["pdfErrors"];

/** 워커가 그려 준 썸네일. 파일을 새로 열 때만 바뀐다. */
interface Thumb {
  index: number;
  url: string;
}

/** 사용자가 손댄 내용. 썸네일과 같은 순서로 나란히 간다. */
interface Edit {
  turn: number;
  removed: boolean;
}

interface Result {
  url: string;
  name: string;
  detail: string;
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
    case "RANGE_OUT_OF_BOUNDS":
      return errors.outOfBounds;
    default:
      return errors.generic;
  }
}

export function PdfOrganizer({ ui, common, errors }: { ui: Ui; common: Common; errors: Errors }) {
  /** 워커를 못 만든 경우. 능력 판정(capable)과 원인이 달라 따로 둔다. */
  const [broken, setBroken] = useState(false);
  const capable = useCapability(canRunPdfTools);
  const supported = capable === null ? null : capable && !broken;
  const [file, setFile] = useState<File | null>(null);
  const [thumbs, setThumbs] = useState<Thumb[]>([]);
  const [edits, setEdits] = useState<Edit[]>([]);
  const [loading, setLoading] = useState(false);
  const [fileError, setFileError] = useState<string | null>(null);
  const [result, setResult] = useState<Result | null>(null);
  const [failure, setFailure] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const workerRef = useRef<Worker | null>(null);
  const pendingRef = useRef(new Map<number, { resolve: (v: WorkerResponse) => void; reject: (e: Error) => void }>());
  const rpcId = useRef(0);

  /** 워커는 첫 파일이 들어올 때 만든다 — 그 전에 pdf.js 를 받을 이유가 없다. */
  const ensureWorker = useCallback((): Worker | null => {
    if (workerRef.current) return workerRef.current;
    try {
      const worker = new Worker(new URL("./organize.worker.ts", import.meta.url));
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

  // 썸네일 objectURL 은 장수만큼 있다. 다른 파일을 열거나 떠날 때 통째로 회수한다.
  // 회전·삭제는 edits 만 건드리므로 여기에 걸리지 않는다.
  useEffect(() => {
    return () => thumbs.forEach((thumb) => URL.revokeObjectURL(thumb.url));
  }, [thumbs]);

  useEffect(() => {
    if (!result) return;
    return () => URL.revokeObjectURL(result.url);
  }, [result]);

  const accept = useCallback(
    async (files: File[]) => {
      const next = files[0];
      if (!next) return;
      setFile(next);
      setThumbs([]);
      setEdits([]);
      setFileError(null);
      setResult(null);
      setFailure(null);
      setLoading(true);

      try {
        const response = await callWorker({ kind: "thumbnails", file: next });
        if (response.kind !== "thumbnails") throw new Error("UNKNOWN");
        setThumbs(
          response.pages.map((page) => ({
            index: page.index,
            url: URL.createObjectURL(page.blob),
          })),
        );
        setEdits(response.pages.map(() => ({ turn: 0, removed: false })));
      } catch (error) {
        setFileError(describeError(errors, error instanceof Error ? error.message : "UNKNOWN"));
      } finally {
        setLoading(false);
      }
    },
    [callWorker, errors],
  );

  const turnPage = useCallback((at: number, delta: number) => {
    setResult(null);
    setEdits((prev) =>
      prev.map((edit, index) =>
        index === at ? { ...edit, turn: normalizeTurn(edit.turn + delta) } : edit,
      ),
    );
  }, []);

  const toggleRemoved = useCallback((at: number) => {
    setResult(null);
    setEdits((prev) =>
      prev.map((edit, index) => (index === at ? { ...edit, removed: !edit.removed } : edit)),
    );
  }, []);

  const turnAll = useCallback(() => {
    setResult(null);
    setEdits((prev) => prev.map((edit) => ({ ...edit, turn: normalizeTurn(edit.turn + 90) })));
  }, []);

  const resetAll = useCallback(() => {
    setResult(null);
    setEdits((prev) => prev.map(() => ({ turn: 0, removed: false })));
  }, []);

  const save = useCallback(async () => {
    if (!file) return;
    const kept = thumbs
      .map((thumb, index) => ({ index: thumb.index, turn: edits[index]?.turn ?? 0 }))
      .filter((_, index) => !edits[index]?.removed);
    if (kept.length === 0) return;

    setResult(null);
    setFailure(null);
    setBusy(true);
    try {
      const response = await callWorker({ kind: "organize", file, kept });
      if (response.kind !== "organized") throw new Error("UNKNOWN");
      setResult({
        url: URL.createObjectURL(response.blob),
        name: fill(ui.outputName, { stem: fileStem(file.name) }),
        detail: fill(ui.resultDetail, {
          pages: response.pageCount,
          size: formatBytes(response.blob.size),
        }),
      });
      trackToolCompleted("pdf-organize");
    } catch (error) {
      setFailure(describeError(errors, error instanceof Error ? error.message : "UNKNOWN"));
    } finally {
      setBusy(false);
    }
  }, [callWorker, edits, errors, file, thumbs, ui]);

  if (supported === false) {
    return (
      <div className="rounded-xl border border-border bg-panel p-6">
        <p className="font-medium text-warn">{common.workerUnsupportedTitle}</p>
        <p className="mt-2 text-sm text-muted">{common.workerUnsupportedHint}</p>
      </div>
    );
  }

  const keptCount = edits.filter((edit) => !edit.removed).length;
  const touched = edits.some((edit) => edit.removed || edit.turn !== 0);

  return (
    <div className="space-y-6">
      <FileDrop
        accept="application/pdf,.pdf"
        multiple={false}
        onFiles={accept}
        label={ui.dropLabel}
        hint={ui.dropHint}
        cta={common.chooseFile}
        disabled={busy || loading}
      />

      {file && (
        <div className="rounded-xl border border-border bg-panel p-5">
          <p className="truncate font-medium">{file.name}</p>
          <p className="mt-1 text-sm text-muted">
            {formatBytes(file.size)}
            {loading && ` · ${ui.rendering}`}
            {!loading && thumbs.length > 0 && ` · ${fill(ui.pageCount, { n: thumbs.length })}`}
          </p>
          {fileError && <p className="mt-2 text-sm text-err">{fileError}</p>}
        </div>
      )}

      {thumbs.length > 0 && (
        <>
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={turnAll}
              disabled={busy}
              className="rounded-lg border border-border px-4 py-2 text-sm font-medium disabled:opacity-50"
            >
              {ui.rotateAll}
            </button>
            {touched && (
              <button
                type="button"
                onClick={resetAll}
                disabled={busy}
                className="text-sm text-muted underline disabled:opacity-50"
              >
                {ui.resetAll}
              </button>
            )}
          </div>

          <ul
            aria-label={ui.gridLabel}
            className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4"
          >
            {thumbs.map((thumb, at) => {
              const edit = edits[at] ?? { turn: 0, removed: false };
              const label = thumb.index + 1;
              return (
                <li
                  key={thumb.index}
                  className={`rounded-xl border border-border bg-panel p-2 ${
                    edit.removed ? "opacity-40" : ""
                  }`}
                >
                  <div className="flex aspect-square items-center justify-center overflow-hidden rounded-lg bg-white">
                    {/* 워커가 그려 준 PNG 다. 회전은 다시 그리지 않고 화면에서만 돌린다. */}
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={thumb.url}
                      alt={fill(ui.pageAlt, { n: label })}
                      style={{ transform: `rotate(${edit.turn}deg)` }}
                      className="max-h-full max-w-full object-contain transition-transform"
                    />
                  </div>

                  <div className="mt-2 flex items-center justify-between gap-1">
                    <span className="text-xs text-muted tabular-nums">{label}</span>
                    <div className="flex gap-1">
                      <button
                        type="button"
                        aria-label={fill(ui.rotateLeft, { n: label })}
                        onClick={() => turnPage(at, -90)}
                        disabled={busy || edit.removed}
                        className="rounded-md border border-border px-2 py-1 text-xs disabled:opacity-30"
                      >
                        ↺
                      </button>
                      <button
                        type="button"
                        aria-label={fill(ui.rotateRight, { n: label })}
                        onClick={() => turnPage(at, 90)}
                        disabled={busy || edit.removed}
                        className="rounded-md border border-border px-2 py-1 text-xs disabled:opacity-30"
                      >
                        ↻
                      </button>
                      <button
                        type="button"
                        aria-label={fill(edit.removed ? ui.restorePage : ui.removePage, { n: label })}
                        onClick={() => toggleRemoved(at)}
                        disabled={busy}
                        className="rounded-md border border-border px-2 py-1 text-xs text-muted disabled:opacity-30"
                      >
                        {edit.removed ? "↩" : "✕"}
                      </button>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={save}
              disabled={busy || keptCount === 0}
              className="rounded-lg bg-accent px-5 py-2.5 text-sm font-medium text-accent-fg disabled:opacity-50"
            >
              {busy ? ui.saving : fill(ui.save, { n: keptCount })}
            </button>
            {keptCount === 0 && <span className="text-sm text-muted">{ui.needOne}</span>}
          </div>
        </>
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
            {common.download}
          </a>
        </div>
      )}
    </div>
  );
}
