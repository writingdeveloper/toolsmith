/** 모듈 워커여야 한다 — 엔진을 CDN 에서 동적 import 로 받는다. */

import {
  cutout,
  prepareImage,
  segment,
  type CutoutBackground,
  type Point,
  type SegmentProgress,
} from "@/lib/segment/segment-core";

export type WorkerRequest =
  | { kind: "prepare"; id: number; file: File }
  | { kind: "segment"; id: number; points: Point[] }
  | { kind: "cutout"; id: number; points: Point[]; background: CutoutBackground };

export type WorkerRequestPayload = WorkerRequest extends infer T
  ? T extends { id: number }
    ? Omit<T, "id">
    : never
  : never;

export type WorkerResponse =
  | { kind: "progress"; id: number; progress: SegmentProgress }
  | {
      kind: "prepared";
      id: number;
      width: number;
      height: number;
      runtime: "webgpu" | "wasm";
      seconds: number;
    }
  | {
      kind: "segmented";
      id: number;
      mask: Uint8ClampedArray;
      width: number;
      height: number;
      score: number;
    }
  | { kind: "cutout"; id: number; blob: Blob; width: number; height: number; coverage: number }
  | { kind: "failed"; id: number; message: string };

const ctx = self as unknown as {
  onmessage: ((event: MessageEvent<WorkerRequest>) => void) | null;
  postMessage(message: WorkerResponse): void;
};

ctx.onmessage = async (event) => {
  const request = event.data;
  try {
    if (request.kind === "prepare") {
      const result = await prepareImage(request.file, (progress) =>
        ctx.postMessage({ kind: "progress", id: request.id, progress }),
      );
      ctx.postMessage({ kind: "prepared", id: request.id, ...result });
      return;
    }
    if (request.kind === "segment") {
      const mask = await segment(request.points);
      ctx.postMessage({
        kind: "segmented",
        id: request.id,
        mask: mask.data,
        width: mask.width,
        height: mask.height,
        score: mask.score,
      });
      return;
    }
    const result = await cutout(request.points, request.background);
    ctx.postMessage({
      kind: "cutout",
      id: request.id,
      blob: result.blob,
      width: result.width,
      height: result.height,
      coverage: result.coverage,
    });
  } catch (error) {
    ctx.postMessage({
      kind: "failed",
      id: request.id,
      message: error instanceof Error ? error.message : "UNKNOWN",
    });
  }
};
