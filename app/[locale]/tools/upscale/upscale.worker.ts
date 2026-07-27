/**
 * 모듈 워커여야 한다(`{ type: "module" }`) — 고전 워커에서는 `import()` 를 쓸 수 없는데,
 * onnxruntime-web 을 jsDelivr 에서 실행 시점에 받으려면 그게 필요하다.
 * 배경 제거 워커와 같은 이유다.
 */

import { detectEncoders } from "@/lib/image/convert-core";
import {
  upscaleImage,
  type UpscaleOptions,
  type UpscaleProgress,
} from "@/lib/upscale/upscale-core";

export type WorkerRequest =
  | { kind: "detect"; id: number }
  | { kind: "upscale"; id: number; file: File; options: UpscaleOptions };

export type WorkerRequestPayload = WorkerRequest extends infer T
  ? T extends { id: number }
    ? Omit<T, "id">
    : never
  : never;

export type WorkerResponse =
  | { kind: "detect"; id: number; formats: string[] }
  | { kind: "progress"; id: number; progress: UpscaleProgress }
  | {
      kind: "upscaled";
      id: number;
      blob: Blob;
      width: number;
      height: number;
      sourceWidth: number;
      sourceHeight: number;
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
    if (request.kind === "detect") {
      ctx.postMessage({ kind: "detect", id: request.id, formats: await detectEncoders() });
      return;
    }
    const result = await upscaleImage(request.file, request.options, (progress) =>
      ctx.postMessage({ kind: "progress", id: request.id, progress }),
    );
    ctx.postMessage({
      kind: "upscaled",
      id: request.id,
      blob: result.blob,
      width: result.width,
      height: result.height,
      sourceWidth: result.sourceWidth,
      sourceHeight: result.sourceHeight,
      runtime: result.runtime,
      seconds: result.seconds,
    });
  } catch (error) {
    ctx.postMessage({
      kind: "failed",
      id: request.id,
      message: error instanceof Error ? error.message : "UNKNOWN",
    });
  }
};
