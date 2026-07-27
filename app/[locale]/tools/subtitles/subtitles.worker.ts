/** 모듈 워커여야 한다 — transformers.js 를 CDN 에서 동적 import 로 받는다. */

import {
  transcribe,
  type Cue,
  type SubtitleOptions,
  type SubtitleProgress,
} from "@/lib/subtitles/subtitle-core";

export type WorkerRequest = {
  kind: "transcribe";
  id: number;
  file: File;
  options: SubtitleOptions;
};

export type WorkerRequestPayload = Omit<WorkerRequest, "id">;

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
    }
  | { kind: "failed"; id: number; message: string };

const ctx = self as unknown as {
  onmessage: ((event: MessageEvent<WorkerRequest>) => void) | null;
  postMessage(message: WorkerResponse): void;
};

ctx.onmessage = async (event) => {
  const request = event.data;
  try {
    const result = await transcribe(request.file, request.options, (progress) =>
      ctx.postMessage({ kind: "progress", id: request.id, progress }),
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
