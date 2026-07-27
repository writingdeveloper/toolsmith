/** 모듈 워커여야 한다 — onnxruntime-web 을 CDN 에서 동적 import 로 받는다. */

import { separate, type StemName, type StemProgress } from "@/lib/stems/stems-core";

export type WorkerRequest = { kind: "separate"; id: number; file: File };
export type WorkerRequestPayload = { kind: "separate"; file: File };

export type WorkerResponse =
  | { kind: "progress"; id: number; progress: StemProgress }
  | {
      kind: "done";
      id: number;
      stems: Array<{ name: StemName; blob: Blob }>;
      durationSec: number;
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
    const result = await separate(request.file, (progress) =>
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
