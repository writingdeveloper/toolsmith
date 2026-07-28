"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { FileDrop } from "@/components/FileDrop";
import { hasWebGPU, hasWorkers } from "@/lib/capabilities";
import { formatBytes } from "@/lib/format";
import type { Dictionary } from "@/lib/i18n/dictionaries/en";
import { LAB } from "@/lib/lab";
import { countByKind, redact, type PiiProgress, type PiiSpan } from "@/lib/pii/pii-core";
import { useCapability } from "@/lib/use-capability";
import type { WorkerRequest, WorkerRequestPayload, WorkerResponse } from "./pii.worker";

type Copy = Dictionary["lab"]["entries"]["pii"];

/** 갈래마다 색을 다르게 준다 — 목록의 숫자와 본문의 표시가 눈으로 이어져야 한다. */
const TONE: Record<PiiSpan["kind"], string> = {
  name: "bg-accent/25 border-accent/50",
  address: "bg-ok/20 border-ok/50",
  phone: "bg-warn/25 border-warn/50",
  email: "bg-warn/20 border-warn/40",
  date: "bg-muted/20 border-muted/40",
  url: "bg-muted/25 border-muted/45",
  account: "bg-err/25 border-err/50",
  secret: "bg-err/30 border-err/60",
  other: "bg-muted/15 border-muted/30",
};

export function PiiFinder({ copy }: { copy: Copy }) {
  const [broken, setBroken] = useState(false);
  const workersOk = useCapability(hasWorkers);

  /*
   * 어댑터를 실제로 받아 봐야 안다. `navigator.gpu` 만 보고 도구를 내주면, 사람이
   * 874MB 를 받기 시작한 뒤에야 안 된다는 것을 알게 된다 — 규칙 3 은 그 전에 말하라는
   * 것이고, 이 도구에서는 그 대가가 특히 크다.
   */
  const [gpuOk, setGpuOk] = useState<boolean | null>(null);
  useEffect(() => {
    let alive = true;
    void hasWebGPU().then((ok) => {
      if (alive) setGpuOk(ok);
    });
    return () => {
      alive = false;
    };
  }, []);

  const supported = workersOk === null || gpuOk === null ? null : workersOk && gpuOk && !broken;

  const [text, setText] = useState("");
  const [fileName, setFileName] = useState<string | null>(null);
  const [progress, setProgress] = useState<PiiProgress | null>(null);
  const [spans, setSpans] = useState<PiiSpan[] | null>(null);
  const [seconds, setSeconds] = useState(0);
  const [masked, setMasked] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const workerRef = useRef<Worker | null>(null);
  const pendingRef = useRef(
    new Map<number, { resolve: (v: WorkerResponse) => void; reject: (e: Error) => void }>(),
  );
  const rpcId = useRef(0);

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
    if (!workersOk) return;
    const pending = pendingRef.current;
    let worker: Worker;
    try {
      worker = new Worker(new URL("./pii.worker.ts", import.meta.url), { type: "module" });
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
      if (message.kind === "failed") {
        const failure = new Error(message.message) as Error & { chars?: number };
        failure.chars = message.chars;
        entry.reject(failure);
      } else entry.resolve(message);
    };
    return () => {
      worker.terminate();
      workerRef.current = null;
      pending.clear();
    };
  }, [workersOk]);

  const describe = useCallback(
    (caught: unknown): string => {
      const message = caught instanceof Error ? caught.message : "UNKNOWN";
      const known = copy.errors[message as keyof typeof copy.errors];
      return known ?? message;
    },
    [copy],
  );

  const onFiles = useCallback(
    async (files: File[]) => {
      const file = files[0];
      if (!file) return;
      setError(null);
      setSpans(null);
      setMasked(false);
      setFileName(file.name);
      setBusy(true);
      try {
        const response = await callWorker({ kind: "read", name: file.name, bytes: await file.arrayBuffer() });
        if (response.kind === "read") setText(response.text);
      } catch (caught) {
        setText("");
        setError(describe(caught));
      } finally {
        setBusy(false);
      }
    },
    [callWorker, describe],
  );

  const scan = useCallback(async () => {
    setError(null);
    setSpans(null);
    setMasked(false);
    setBusy(true);
    setProgress({ stage: "model", ratio: 0 });
    try {
      const response = await callWorker({ kind: "scan", text });
      if (response.kind === "done") {
        setSpans(response.spans);
        setSeconds(response.seconds);
      }
    } catch (caught) {
      setError(describe(caught));
    } finally {
      setBusy(false);
      setProgress(null);
    }
  }, [callWorker, describe, text]);

  const counts = useMemo(() => (spans ? countByKind(spans) : []), [spans]);

  /** 원문을 조각으로 나눈다 — 찾은 자리만 표시가 붙는다. */
  const pieces = useMemo(() => {
    if (!spans || spans.length === 0) return null;
    const out: Array<{ text: string; span?: PiiSpan }> = [];
    let at = 0;
    for (const span of spans) {
      if (span.start > at) out.push({ text: text.slice(at, span.start) });
      out.push({ text: text.slice(span.start, span.end), span });
      at = span.end;
    }
    if (at < text.length) out.push({ text: text.slice(at) });
    return out;
  }, [spans, text]);

  const download = useCallback(() => {
    if (!spans) return;
    const blob = new Blob([redact(text, spans)], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${(fileName ?? "document").replace(/\.[^.]+$/, "")}-redacted.txt`;
    link.click();
    URL.revokeObjectURL(url);
  }, [fileName, spans, text]);

  if (supported === false) {
    return (
      <p className="rounded-xl border border-border bg-panel p-5 text-sm text-muted" data-unsupported>
        {copy.errors.NO_WEBGPU}
      </p>
    );
  }

  return (
    <div className="space-y-6">
      <FileDrop
        accept={LAB.pii.accept}
        multiple={false}
        onFiles={onFiles}
        label={copy.pickLabel}
        hint={LAB.pii.accept.replaceAll(".", "").replaceAll(",", " · ")}
        cta={copy.pickLabel}
        disabled={busy}
      />

      {fileName && !error && (
        <p className="text-sm text-muted" data-loaded>
          {fileName} — {text.length.toLocaleString()}
        </p>
      )}

      {text.length > 0 && (
        <button
          type="button"
          onClick={scan}
          disabled={busy}
          className="rounded-xl bg-accent px-5 py-2.5 text-sm font-medium text-accent-fg transition-opacity hover:opacity-90 disabled:opacity-50"
          data-scan
        >
          {busy ? copy.scanningLabel : copy.scanLabel}
        </button>
      )}

      {progress && (
        <div className="space-y-1" data-progress>
          <div className="h-1.5 overflow-hidden rounded-full bg-panel">
            <div
              className="h-full rounded-full bg-accent transition-[width]"
              style={{ width: `${Math.round(progress.ratio * 100)}%` }}
            />
          </div>
          <p className="text-xs text-muted">
            {progress.stage === "model"
              ? `${formatBytes(Math.round(progress.ratio * LAB.pii.bytes))} / ${formatBytes(LAB.pii.bytes)}`
              : copy.scanningLabel}
          </p>
        </div>
      )}

      {error && (
        <p className="rounded-xl border border-err/40 bg-panel p-4 text-sm text-err" data-error>
          {error}
        </p>
      )}

      {spans && (
        <section className="space-y-4" data-result>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
            <span className="font-medium">{copy.foundHeading}</span>
            {counts.length === 0 ? (
              <span className="text-muted" data-empty>
                {copy.emptyFound}
              </span>
            ) : (
              counts.map((entry) => (
                <span key={entry.kind} className="text-muted" data-count={entry.kind}>
                  {copy.kinds[entry.kind]} {entry.count}
                </span>
              ))
            )}
            <span className="text-xs text-muted">{seconds.toFixed(1)}s</span>
          </div>

          {counts.length > 0 && (
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => setMasked((value) => !value)}
                className="rounded-xl border border-border px-4 py-2 text-sm transition-colors hover:border-accent"
                data-mask
                aria-pressed={masked}
              >
                {copy.maskLabel}
              </button>
              <button
                type="button"
                onClick={download}
                className="rounded-xl border border-border px-4 py-2 text-sm transition-colors hover:border-accent"
                data-download
              >
                {copy.downloadLabel}
              </button>
            </div>
          )}

          {/*
            **목록만 주면 어디인지 못 찾는다.** "이름 3곳" 이라고 적어 두면 사용자는
            그 셋을 문서에서 다시 찾아야 한다. 원문 위에 그대로 짚어 준다.
          */}
          <pre
            className="max-h-[28rem] overflow-auto rounded-xl border border-border bg-panel p-4 text-sm leading-relaxed whitespace-pre-wrap"
            data-preview
          >
            {pieces
              ? pieces.map((piece, index) =>
                  piece.span ? (
                    <mark
                      key={index}
                      className={`rounded border px-0.5 ${TONE[piece.span.kind]} ${masked ? "text-transparent" : "text-fg"}`}
                      data-span={piece.span.kind}
                      title={copy.kinds[piece.span.kind]}
                    >
                      {masked ? "█".repeat(piece.text.length) : piece.text}
                    </mark>
                  ) : (
                    <span key={index}>{piece.text}</span>
                  ),
                )
              : text}
          </pre>

          <p className="text-xs leading-relaxed text-muted" data-caveat>
            {copy.caveat}
          </p>
        </section>
      )}

    </div>
  );
}
