"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { FileDrop } from "@/components/FileDrop";
import { trackToolCompleted } from "@/lib/analytics";
import { fileStem, formatBytes, savingsPercent } from "@/lib/format";
import { fill } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries/en";
import { canEncodeWebm } from "@/lib/video/capabilities";
import type { ConvertProbe, ConvertTarget, Quality } from "@/lib/video/convert-core";
import type { WorkerRequest, WorkerRequestPayload, WorkerResponse } from "./convert.worker";

type Ui = Dictionary["tools"]["video-convert"]["ui"];
type Common = Dictionary["common"];
type Errors = Dictionary["mediaErrors"];

const MAX_EDGES = [0, 1920, 1280, 854, 640];
const QUALITIES: Quality[] = ["high", "balanced", "small"];

interface Result {
  url: string;
  name: string;
  before: number;
  after: number;
  width: number;
  height: number;
  reencoded: boolean;
  keptAudio: boolean;
}

function describeError(errors: Errors, message: string): string {
  switch (message) {
    case "UNSUPPORTED_CONTAINER":
      return errors.unsupportedContainer;
    case "NO_VIDEO_TRACK":
      return errors.noVideoTrack;
    case "UNSUPPORTED_CODEC":
      return errors.unsupportedCodec;
    case "TOO_LARGE":
      return errors.tooLarge;
    case "DECODE_FAILED":
      return errors.decodeFailed;
    case "ENCODE_FAILED":
      return errors.encodeFailed;
    default:
      return errors.generic;
  }
}

/** 확장자로 원본 상자를 본다 — 이미 MP4 인 파일에 "MP4 로 바꾸기" 는 말이 안 된다. */
function isAlreadyMp4(name: string): boolean {
  return /\.(mp4|m4v)$/i.test(name);
}

export function VideoConverter({ ui, common, errors }: { ui: Ui; common: Common; errors: Errors }) {
  const [broken, setBroken] = useState(false);
  const [webmOk, setWebmOk] = useState<boolean | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [probe, setProbe] = useState<ConvertProbe | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [target, setTarget] = useState<ConvertTarget>("mp4");
  const [maxEdge, setMaxEdge] = useState(0);
  const [quality, setQuality] = useState<Quality>("balanced");
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<Result | null>(null);
  const [failure, setFailure] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const workerRef = useRef<Worker | null>(null);
  const pendingRef = useRef(
    new Map<number, { resolve: (v: WorkerResponse) => void; reject: (e: Error) => void }>(),
  );
  const rpcId = useRef(0);

  useEffect(() => {
    canEncodeWebm().then(setWebmOk).catch(() => setWebmOk(false));
  }, []);

  /** 워커는 첫 파일이 들어올 때 만든다 — 그 전에 mp4box 를 받을 이유가 없다. */
  const ensureWorker = useCallback((): Worker | null => {
    if (workerRef.current) return workerRef.current;
    try {
      const worker = new Worker(new URL("./convert.worker.ts", import.meta.url));
      worker.onmessage = (event: MessageEvent<WorkerResponse>) => {
        const message = event.data;
        if (message.kind === "progress") {
          setProgress(message.ratio);
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

  useEffect(() => {
    if (!result) return;
    return () => URL.revokeObjectURL(result.url);
  }, [result]);

  const accept = useCallback(
    async (files: File[]) => {
      const next = files[0];
      if (!next) return;
      setFile(next);
      setProbe(null);
      setFileError(null);
      setResult(null);
      setFailure(null);
      // MOV 를 넣었으면 사람들이 원하는 것은 거의 언제나 MP4 다
      setTarget(isAlreadyMp4(next.name) ? "webm" : "mp4");

      try {
        const response = await callWorker({ kind: "inspect", file: next });
        if (response.kind !== "inspected") throw new Error("UNKNOWN");
        setProbe(response.probe);
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
    setProgress(0);
    setBusy(true);
    try {
      const response = await callWorker({
        kind: "convert",
        file,
        options: { target, maxEdge, quality },
      });
      if (response.kind !== "converted") throw new Error("UNKNOWN");
      const stem = fileStem(file.name);
      setResult({
        url: URL.createObjectURL(response.blob),
        name: fill(target === "mp4" ? ui.outputNameMp4 : ui.outputNameWebm, { stem }),
        before: response.stats.before,
        after: response.stats.after,
        width: response.stats.width,
        height: response.stats.height,
        reencoded: response.stats.reencoded,
        keptAudio: response.stats.keptAudio,
      });
      trackToolCompleted("video-convert");
    } catch (error) {
      setFailure(describeError(errors, error instanceof Error ? error.message : "UNKNOWN"));
    } finally {
      setBusy(false);
    }
  }, [callWorker, errors, file, maxEdge, quality, target, ui]);

  if (broken) {
    return (
      <div className="rounded-xl border border-border bg-panel p-6">
        <p className="font-medium text-warn">{common.workerUnsupportedTitle}</p>
        <p className="mt-2 text-sm text-muted">{common.workerUnsupportedHint}</p>
      </div>
    );
  }

  const mp4Blocked = Boolean(probe && !probe.canRemuxToMp4);
  const webmBlocked = webmOk === false;
  const blocked = target === "mp4" ? mp4Blocked : webmBlocked;

  return (
    <div className="space-y-6">
      <FileDrop
        accept="video/mp4,video/quicktime,.mp4,.mov,.m4v"
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
            {probe && ` · ${probe.width}×${probe.height} · ${probe.durationSec.toFixed(1)}${ui.seconds}`}
            {probe && !probe.hasAudio && ` · ${ui.noAudio}`}
            {!probe && !fileError && ` · ${ui.reading}`}
          </p>
          {fileError && <p className="mt-2 text-sm text-err">{fileError}</p>}
        </div>
      )}

      {probe && (
        <div className="space-y-4 rounded-xl border border-border bg-panel p-5">
          <fieldset className="space-y-2">
            <legend className="text-sm text-muted">{ui.targetLabel}</legend>
            <div className="flex flex-wrap gap-2">
              {(["mp4", "webm"] as const).map((value) => (
                <button
                  key={value}
                  type="button"
                  aria-pressed={target === value}
                  disabled={busy}
                  onClick={() => setTarget(value)}
                  className={`rounded-lg border px-4 py-2 text-sm font-medium ${
                    target === value ? "border-accent text-accent" : "border-border text-muted"
                  } disabled:opacity-50`}
                >
                  {value === "mp4" ? ui.targetMp4 : ui.targetWebm}
                </button>
              ))}
            </div>
          </fieldset>

          {/*
           * 이 도구에서 가장 중요한 문장. 두 갈래의 성격이 정반대라, 무엇을 고르든
           * 무슨 일이 벌어지는지 버튼을 누르기 전에 말한다.
           */}
          {target === "mp4" ? (
            <p className="text-sm text-ok">{ui.mp4Note}</p>
          ) : (
            <p className="text-sm text-warn">{ui.webmNote}</p>
          )}

          {target === "mp4" && isAlreadyMp4(file?.name ?? "") && (
            <p className="text-sm text-muted">{ui.alreadyMp4}</p>
          )}
          {target === "mp4" && mp4Blocked && <p className="text-sm text-err">{ui.mp4Unavailable}</p>}
          {target === "webm" && webmBlocked && (
            <p className="text-sm text-err">{ui.webmUnavailable}</p>
          )}

          {/* 해상도와 화질은 다시 인코딩할 때만 의미가 있다 — MP4 경로에서는 아예 숨긴다 */}
          {target === "webm" && !webmBlocked && (
            <div className="grid gap-4 sm:grid-cols-2">
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

              <label className="space-y-1.5">
                <span className="block text-sm text-muted">{ui.qualityLabel}</span>
                <select
                  value={quality}
                  disabled={busy}
                  onChange={(event) => setQuality(event.target.value as Quality)}
                  className="w-full rounded-lg border border-border bg-bg px-3 py-2 text-sm"
                >
                  {QUALITIES.map((value) => (
                    <option key={value} value={value}>
                      {value === "high"
                        ? ui.qualityHigh
                        : value === "balanced"
                          ? ui.qualityBalanced
                          : ui.qualitySmall}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          )}
        </div>
      )}

      {probe && (
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={run}
            disabled={busy || blocked}
            className="rounded-lg bg-accent px-5 py-2.5 text-sm font-medium text-accent-fg disabled:opacity-50"
          >
            {busy ? ui.working : fill(ui.run, { format: target === "mp4" ? "MP4" : "WebM" })}
          </button>
          {busy && (
            <span className="text-sm text-muted tabular-nums">{Math.round(progress * 100)}%</span>
          )}
        </div>
      )}

      {failure && (
        <p className="rounded-xl border border-border bg-panel p-4 text-sm text-err">{failure}</p>
      )}

      {result && (
        <div className="space-y-3 rounded-xl border border-border bg-panel p-5">
          <div className="flex flex-wrap items-center gap-4">
            <div className="min-w-0 flex-1">
              <p className="truncate font-medium">{result.name}</p>
              <p className="mt-1 text-sm text-muted tabular-nums">
                {formatBytes(result.before)} → <span className="text-fg">{formatBytes(result.after)}</span>{" "}
                <span className={savingsPercent(result.before, result.after) >= 0 ? "text-ok" : "text-warn"}>
                  ({savingsPercent(result.before, result.after) >= 0 ? "-" : "+"}
                  {Math.abs(savingsPercent(result.before, result.after))}%)
                </span>{" "}
                · {result.width}×{result.height}
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
          <p className="text-sm text-muted">
            {result.reencoded ? ui.resultReencoded : ui.resultLossless}
            {/* 원본에 소리가 없었으면 할 말이 없다 — "소리를 버렸다" 는 거짓말이 된다 */}
            {probe?.hasAudio && (result.keptAudio ? ` ${ui.audioKept}` : ` ${ui.audioDropped}`)}
          </p>
        </div>
      )}
    </div>
  );
}
