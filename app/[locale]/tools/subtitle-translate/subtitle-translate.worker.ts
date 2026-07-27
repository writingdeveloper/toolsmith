/** 모듈 워커여야 한다 — transformers.js 를 CDN 에서 동적 import 로 받는다. */

import type { Cue } from "@/lib/subtitles/subtitle-core";
import {
  translateCues,
  type TranslateOptions,
  type TranslateProgress,
} from "@/lib/translate/translate-core";

export type WorkerRequest =
  | { kind: "translate"; id: number; cues: Cue[]; options: TranslateOptions }
  /** 이 도구는 10분 넘게 도는 일이 있다 — 멈출 길이 있어야 한다. */
  | { kind: "stop" };

export type WorkerRequestPayload = { kind: "translate"; cues: Cue[]; options: TranslateOptions };

export type WorkerResponse =
  | { kind: "progress"; id: number; progress: TranslateProgress }
  | { kind: "done"; id: number; cues: Cue[]; seconds: number; calls: number; stopped: boolean }
  | { kind: "failed"; id: number; message: string };

const ctx = self as unknown as {
  onmessage: ((event: MessageEvent<WorkerRequest>) => void) | null;
  postMessage(message: WorkerResponse): void;
};

/**
 * 멈춤 요청은 번역이 도는 **중에** 온다. 한 줄이 끝날 때마다 이 값을 보므로
 * 지금 돌고 있는 줄까지만 마치고 선다.
 */
let stopped = false;

ctx.onmessage = async (event) => {
  const request = event.data;
  if (request.kind === "stop") {
    stopped = true;
    return;
  }

  stopped = false;
  try {
    const result = await translateCues(
      request.cues,
      request.options,
      (progress) => ctx.postMessage({ kind: "progress", id: request.id, progress }),
      () => stopped,
    );
    ctx.postMessage({ kind: "done", id: request.id, ...result, stopped });
  } catch (error) {
    ctx.postMessage({
      kind: "failed",
      id: request.id,
      message: error instanceof Error ? error.message : "UNKNOWN",
    });
  }
};
