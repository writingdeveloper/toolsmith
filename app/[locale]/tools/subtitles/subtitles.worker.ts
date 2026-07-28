/** 모듈 워커여야 한다 — transformers.js 를 CDN 에서 동적 import 로 받는다. */

import {
  transcribe,
  type Cue,
  type SubtitleOptions,
  type SubtitleProgress,
} from "@/lib/subtitles/subtitle-core";

export type WorkerRequest =
  | { kind: "transcribe"; id: number; file: File; options: SubtitleOptions }
  /**
   * 이 도구는 오래 걸릴 수 있다 — 받는 상한이 20분이고, 잡음이 심하면 모델이 같은
   * 말을 반복한다(FAQ 에 적어 둔 실측). 세울 길이 있어야 한다.
   */
  | { kind: "stop" };

export type WorkerRequestPayload = { kind: "transcribe"; file: File; options: SubtitleOptions };

export type WorkerResponse =
  | { kind: "progress"; id: number; progress: SubtitleProgress }
  | {
      kind: "done";
      id: number;
      cues: Cue[];
      text: string;
      durationSec: number;
      runtime: "webgpu" | "wasm";
      seconds: number;
      stopped: boolean;
    }
  | { kind: "failed"; id: number; message: string };

const ctx = self as unknown as {
  onmessage: ((event: MessageEvent<WorkerRequest>) => void) | null;
  postMessage(message: WorkerResponse): void;
};

/**
 * 멈춤 요청은 인식이 도는 **중에** 온다. 낱말이 나올 때마다 이 값을 보므로
 * 그 자리에서 선다.
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
    const result = await transcribe(
      request.file,
      request.options,
      (progress) => ctx.postMessage({ kind: "progress", id: request.id, progress }),
      () => stopped,
    );
    ctx.postMessage({ kind: "done", id: request.id, ...result });
  } catch (error) {
    ctx.postMessage({
      kind: "failed",
      id: request.id,
      message: error instanceof Error ? error.message : "UNKNOWN",
    });
  }
};
