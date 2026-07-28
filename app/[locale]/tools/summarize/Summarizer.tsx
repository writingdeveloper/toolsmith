"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ACCEPT } from "@/lib/tools";
import { FileDrop } from "@/components/FileDrop";
import { trackToolCompleted } from "@/lib/analytics";
import { hasWebGPU, hasWorkers } from "@/lib/capabilities";
import { formatBytes } from "@/lib/format";
import { fill } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries/en";
import {
  ENGINE_BYTES,
  MAX_TOKENS,
  MIN_TOKENS,
  MODEL_BYTES,
  SECONDS_PER_RUN,
  estimateTokens,
  type SummarizeProgress,
} from "@/lib/summarize/summarize-core";
import { useCapability } from "@/lib/use-capability";
import type { WorkerRequest, WorkerRequestPayload, WorkerResponse } from "./summarize.worker";

type Ui = Dictionary["tools"]["summarize"]["ui"];
type Common = Dictionary["common"];

interface Result {
  summary: string;
  tokens: number;
  seconds: number;
}

export function Summarizer({ ui, common }: { ui: Ui; common: Common }) {
  const [broken, setBroken] = useState(false);
  const workersOk = useCapability(hasWorkers);

  /*
   * **`navigator.gpu` 가 있는 것만으로는 모자란다.** 객체는 있는데 어댑터가 나오지
   * 않는 브라우저가 실제로 있다(테스트에 쓰는 헤드리스 셸이 그렇다). 그런 브라우저에
   * 이 도구를 통째로 내주면, 사람이 문서를 붙여 넣고 버튼을 누른 뒤에야 안 된다는 것을
   * 알게 된다 — 규칙 3 은 그 전에 말하라는 것이다.
   *
   * 어댑터를 묻는 것은 비동기라 `useCapability` 로는 안 된다. 판정이 나기 전까지는
   * `null` 로 두고 도구를 그대로 보여 준다 — 실측 1밀리초 안쪽이고, 서버가 그린 것과
   * 어긋나지도 않는다.
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
  const [progress, setProgress] = useState<SummarizeProgress | null>(null);
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);

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
      worker = new Worker(new URL("./summarize.worker.ts", import.meta.url), { type: "module" });
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
        // 상한·하한에 걸렸을 때 몇 토큰이었는지를 함께 나른다
        const failure = new Error(message.message) as Error & { tokens?: number };
        failure.tokens = message.tokens;
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
      const tokens = (caught as { tokens?: number })?.tokens ?? 0;
      switch (message) {
        case "NO_WEBGPU":
          return ui.errNoWebgpu;
        case "ENGINE_FAILED":
          return ui.errEngine;
        case "MODEL_FAILED":
          return ui.errModel;
        case "UNSUPPORTED_INPUT":
          return ui.errUnsupportedInput;
        case "NO_TEXT":
          return ui.errNoText;
        case "TOO_SHORT":
          return fill(ui.errTooShort, { minimum: MIN_TOKENS, tokens });
        case "TOO_LONG":
          return fill(ui.errTooLong, { maximum: MAX_TOKENS, tokens });
        default:
          return ui.errGeneric;
      }
    },
    [ui],
  );

  const addFiles = useCallback(
    async (files: File[]) => {
      if (files.length === 0) return;
      const file = files[0];
      setProgress(null);
      setError(null);
      setResult(null);
      setBusy(true);
      try {
        const response = await callWorker({
          kind: "read",
          name: file.name,
          bytes: await file.arrayBuffer(),
        });
        if (response.kind !== "read") throw new Error("UNKNOWN");
        setText(response.text);
        setFileName(file.name);
      } catch (caught) {
        setError(describe(caught));
      } finally {
        setBusy(false);
      }
    },
    [callWorker, describe],
  );

  const run = useCallback(async () => {
    setBusy(true);
    setError(null);
    setResult(null);
    setCopied(false);
    try {
      const response = await callWorker({ kind: "summarize", text });
      if (response.kind !== "done") throw new Error("UNKNOWN");
      setResult({
        summary: response.summary,
        tokens: response.tokens,
        seconds: response.seconds,
      });
      trackToolCompleted("summarize");
    } catch (caught) {
      setError(describe(caught));
    } finally {
      setBusy(false);
      setProgress(null);
    }
  }, [callWorker, describe, text]);

  const copy = useCallback(async () => {
    if (!result) return;
    await navigator.clipboard.writeText(result.summary);
    setCopied(true);
  }, [result]);

  const estimate = useMemo(() => estimateTokens(text.trim()), [text]);
  const tooShort = text.trim().length > 0 && estimate < MIN_TOKENS;
  const tooLong = estimate > MAX_TOKENS;

  if (supported === false) {
    return (
      <div className="rounded-xl border border-border bg-panel p-6">
        <p className="font-medium text-warn">{ui.errNoWebgpu}</p>
        <p className="mt-2 text-sm text-muted" data-no-webgpu>
          {ui.noWebgpuHint}
        </p>
      </div>
    );
  }

  const stageText = progress
    ? progress.stage === "model"
      ? fill(ui.stageModel, { percent: Math.round(progress.ratio * 100) })
      : ui.stageSummarizing
    : null;

  return (
    <div className="space-y-6">
      <FileDrop
        accept={ACCEPT["summarize"]}
        onFiles={addFiles}
        label={ui.dropLabel}
        hint={ui.dropHint}
        cta={common.chooseFile}
        disabled={busy}
      />

      <label className="block space-y-1.5">
        <span className="block text-sm text-muted">{ui.textLabel}</span>
        <textarea
          value={text}
          disabled={busy}
          onChange={(event) => {
            setText(event.target.value);
            setFileName(null);
          }}
          rows={10}
          placeholder={ui.textPlaceholder}
          data-document
          className="w-full rounded-lg border border-border bg-bg px-3 py-2 font-mono text-sm"
        />
      </label>

      <div className="space-y-1 text-sm text-muted" data-notes>
        <p>
          {fill(ui.downloadNote, { size: formatBytes(ENGINE_BYTES + MODEL_BYTES) })} {ui.cachedNote}
        </p>
        {/* 실패 모드를 미리 말한다 — 작은 모델은 사실을 틀린다 */}
        <p className="text-warn" data-quality-note>
          {ui.qualityNote}
        </p>
      </div>

      {text.trim().length > 0 && (
        <div className="space-y-3">
          <p className="text-sm text-muted tabular-nums" data-loaded>
            {fill(ui.loadedSummary, {
              tokens: estimate,
              seconds: SECONDS_PER_RUN,
            })}
            {fileName ? ` · ${fileName}` : ""}
          </p>
          {tooShort && (
            <p className="text-sm text-warn" data-too-short>
              {fill(ui.tooShortNote, { minimum: MIN_TOKENS })}
            </p>
          )}
          {tooLong && (
            <p className="text-sm text-err" data-too-long>
              {fill(ui.errTooLong, { maximum: MAX_TOKENS, tokens: estimate })}
            </p>
          )}
          <button
            type="button"
            onClick={run}
            disabled={busy || tooShort || tooLong}
            className="rounded-lg bg-accent px-5 py-2.5 text-sm font-medium text-accent-fg disabled:opacity-50"
          >
            {busy ? ui.working : ui.run}
          </button>
        </div>
      )}

      {stageText && <p className="text-sm text-muted tabular-nums">{stageText}</p>}
      {/* 나오는 대로 보여 준다 — 다 끝날 때까지 빈 화면을 보게 두지 않는다 */}
      {busy && progress?.text && (
        <p className="whitespace-pre-wrap rounded-xl border border-border bg-panel p-4 text-sm" data-streaming>
          {progress.text}
        </p>
      )}
      {error && <p className="text-sm text-err">{error}</p>}

      {result && (
        <div className="space-y-4 rounded-xl border border-border p-4">
          <p className="text-xs text-muted tabular-nums" data-summary>
            {fill(ui.resultSummary, {
              tokens: result.tokens,
              seconds: result.seconds.toFixed(1),
            })}
          </p>
          <p className="whitespace-pre-wrap text-sm" data-result>
            {result.summary}
          </p>
          <button
            type="button"
            onClick={copy}
            data-copy
            className="rounded-lg border border-border px-4 py-2 text-sm font-medium"
          >
            {copied ? ui.copied : ui.copy}
          </button>
        </div>
      )}
    </div>
  );
}
