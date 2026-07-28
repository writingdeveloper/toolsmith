"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ACCEPT } from "@/lib/tools";
import { SendTo } from "@/components/SendTo";
import { FileDrop } from "@/components/FileDrop";
import type { ChainCopy } from "@/lib/chain";
import { trackToolCompleted } from "@/lib/analytics";
import { fileStem, formatBytes } from "@/lib/format";
import { fill } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries/en";
import { snapToKeyframe } from "@/lib/video/trim-core";
import type { WorkerRequest, WorkerRequestPayload, WorkerResponse } from "./trim.worker";

type Ui = Dictionary["tools"]["video-trim"]["ui"];
type Common = Dictionary["common"];
type Errors = Dictionary["mediaErrors"];

interface Info {
  width: number;
  height: number;
  durationSec: number;
  hasAudio: boolean;
  keyframes: number[];
}

interface Result {
  url: string;
  name: string;
  before: number;
  after: number;
  startSec: number;
  endSec: number;
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
    case "BAD_RANGE":
      return errors.badRange;
    case "TOO_LARGE":
      return errors.tooLarge;
    case "DECODE_FAILED":
      return errors.decodeFailed;
    default:
      return errors.generic;
  }
}

const seconds = (value: number) => Math.round(value * 10) / 10;

export function VideoTrimmer({ chain, ui, common, errors }: { chain: ChainCopy; ui: Ui; common: Common; errors: Errors }) {
  const [broken, setBroken] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [sourceUrl, setSourceUrl] = useState<string | null>(null);
  const [info, setInfo] = useState<Info | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [start, setStart] = useState(0);
  const [end, setEnd] = useState(0);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<Result | null>(null);
  const [failure, setFailure] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const workerRef = useRef<Worker | null>(null);
  const pendingRef = useRef(new Map<number, { resolve: (v: WorkerResponse) => void; reject: (e: Error) => void }>());
  const rpcId = useRef(0);

  /** 워커는 첫 파일이 들어올 때 만든다 — 그 전에 mp4box 를 받을 이유가 없다. */
  const ensureWorker = useCallback((): Worker | null => {
    if (workerRef.current) return workerRef.current;
    try {
      const worker = new Worker(new URL("./trim.worker.ts", import.meta.url));
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

  useEffect(() => {
    if (!sourceUrl) return;
    return () => URL.revokeObjectURL(sourceUrl);
  }, [sourceUrl]);

  const accept = useCallback(
    async (files: File[]) => {
      const next = files[0];
      if (!next) return;
      setFile(next);
      setSourceUrl(URL.createObjectURL(next));
      setInfo(null);
      setFileError(null);
      setResult(null);
      setFailure(null);

      try {
        const response = await callWorker({ kind: "inspect", file: next });
        if (response.kind !== "inspected") throw new Error("UNKNOWN");
        setInfo({
          width: response.width,
          height: response.height,
          durationSec: response.durationSec,
          hasAudio: response.hasAudio,
          keyframes: response.keyframes,
        });
        setStart(0);
        setEnd(seconds(response.durationSec));
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
        kind: "trim",
        file,
        options: { startSec: start, endSec: end },
      });
      if (response.kind !== "trimmed") throw new Error("UNKNOWN");
      setResult({
        url: URL.createObjectURL(response.blob),
        name: fill(ui.outputName, { stem: fileStem(file.name) }),
        before: response.stats.before,
        after: response.stats.after,
        startSec: response.stats.startSec,
        endSec: response.stats.endSec,
        keptAudio: response.stats.keptAudio,
      });
      trackToolCompleted("video-trim");
    } catch (error) {
      setFailure(describeError(errors, error instanceof Error ? error.message : "UNKNOWN"));
    } finally {
      setBusy(false);
    }
  }, [callWorker, end, errors, file, start, ui]);

  if (broken) {
    return (
      <div className="rounded-xl border border-border bg-panel p-6">
        <p className="font-medium text-warn">{common.workerUnsupportedTitle}</p>
        <p className="mt-2 text-sm text-muted">{common.workerUnsupportedHint}</p>
      </div>
    );
  }

  const snapped = info ? snapToKeyframe(info.keyframes, start) : 0;
  /** 요청한 지점과 실제 지점이 어긋나는가. 이 도구가 반드시 말해야 하는 사실이다. */
  const drifts = info ? Math.abs(snapped - start) > 0.05 : false;
  const validRange = end > snapped + 0.05;

  const grab = (which: "start" | "end") => {
    const at = seconds(videoRef.current?.currentTime ?? 0);
    if (which === "start") setStart(at);
    else setEnd(at);
  };

  return (
    <div className="space-y-6">
      <FileDrop
        accept={ACCEPT["video-trim"]}
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
            {info && ` · ${info.width}×${info.height} · ${info.durationSec.toFixed(1)}${ui.seconds}`}
            {info && !info.hasAudio && ` · ${ui.noAudio}`}
            {!info && !fileError && ` · ${ui.reading}`}
          </p>
          {fileError && <p className="mt-2 text-sm text-err">{fileError}</p>}
        </div>
      )}

      {info && sourceUrl && (
        <div className="space-y-4 rounded-xl border border-border bg-panel p-5">
          {/* 원본은 이미 이 기기 안에 있다 — 미리 보는 데 네트워크가 필요 없다 */}
          <video
            ref={videoRef}
            src={sourceUrl}
            controls
            preload="metadata"
            className="max-h-80 w-full rounded-lg bg-black"
          />

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="space-y-1.5">
              <span className="block text-sm text-muted">{ui.startLabel}</span>
              <div className="flex gap-2">
                <input
                  type="number"
                  min={0}
                  max={info.durationSec}
                  step={0.1}
                  value={start}
                  disabled={busy}
                  // 같은 <label> 안에 버튼도 있어서 암묵적 연결로는 무엇을 가리키는지 흐려진다
                  aria-label={ui.startLabel}
                  onChange={(event) => setStart(Number(event.target.value))}
                  className="w-full rounded-lg border border-border bg-bg px-3 py-2 text-sm tabular-nums"
                />
                <button
                  type="button"
                  onClick={() => grab("start")}
                  disabled={busy}
                  aria-label={`${ui.grabHere} · ${ui.startLabel}`}
                  className="shrink-0 rounded-lg border border-border px-3 py-2 text-sm"
                >
                  {ui.grabHere}
                </button>
              </div>
            </label>

            <label className="space-y-1.5">
              <span className="block text-sm text-muted">{ui.endLabel}</span>
              <div className="flex gap-2">
                <input
                  type="number"
                  min={0}
                  max={info.durationSec}
                  step={0.1}
                  value={end}
                  disabled={busy}
                  aria-label={ui.endLabel}
                  onChange={(event) => setEnd(Number(event.target.value))}
                  className="w-full rounded-lg border border-border bg-bg px-3 py-2 text-sm tabular-nums"
                />
                <button
                  type="button"
                  onClick={() => grab("end")}
                  disabled={busy}
                  aria-label={`${ui.grabHere} · ${ui.endLabel}`}
                  className="shrink-0 rounded-lg border border-border px-3 py-2 text-sm"
                >
                  {ui.grabHere}
                </button>
              </div>
            </label>
          </div>

          {/*
           * 이 도구에서 가장 중요한 문장. 버튼을 누르기 전에 실제 시작점을 말한다 —
           * 결과를 받고 나서 "왜 앞부분이 더 들어왔지" 하고 놀라게 두지 않는다.
           */}
          {drifts ? (
            <p className="text-sm text-warn">
              {fill(ui.snapped, { actual: snapped.toFixed(1), asked: start.toFixed(1) })}
            </p>
          ) : (
            <p className="text-sm text-muted">{ui.onKeyframe}</p>
          )}

          {!validRange && <p className="text-sm text-err">{errors.badRange}</p>}
        </div>
      )}

      {info && (
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={run}
            disabled={busy || !validRange}
            className="rounded-lg bg-accent px-5 py-2.5 text-sm font-medium text-accent-fg disabled:opacity-50"
          >
            {busy ? ui.working : ui.run}
          </button>
          {busy && <span className="text-sm text-muted tabular-nums">{Math.round(progress * 100)}%</span>}
        </div>
      )}

      {failure && <p className="rounded-xl border border-border bg-panel p-4 text-sm text-err">{failure}</p>}

      {result && (
        <div className="space-y-3 rounded-xl border border-border bg-panel p-5">
          <div className="flex flex-wrap items-center gap-4">
            <div className="min-w-0 flex-1">
              <p className="truncate font-medium">{result.name}</p>
              <p className="mt-1 text-sm text-muted tabular-nums">
                {formatBytes(result.after)} ·{" "}
                {fill(ui.resultRange, {
                  from: result.startSec.toFixed(1),
                  to: result.endSec.toFixed(1),
                  length: (result.endSec - result.startSec).toFixed(1),
                })}
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
            {ui.lossless}
            {result.keptAudio && ` ${ui.audioKept}`}
          </p>
        </div>
      )}

      {result && (
        <SendTo chain={chain} from="video-trim" files={[{ url: result.url, name: result.name }]} />
      )}
    </div>
  );
}
