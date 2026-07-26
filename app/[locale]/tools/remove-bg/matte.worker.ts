/**
 * 이 워커는 **모듈 워커**다(`{ type: "module" }`).
 *
 * 고전 워커에서는 `import()` 를 쓸 수 없는데, onnxruntime-web 을 jsDelivr 에서
 * 실행 시점에 받으려면 그게 필요하다. 워커를 만드는 쪽에서 type 을 빼면 엔진 로딩이
 * 통째로 실패한다 — 규칙 5 를 지키기 위한 조건이다.
 */

import {
  removeBackground,
  type MatteOptions,
  type MatteProgress,
} from "@/lib/matting/matte-core";

export type WorkerRequest = { kind: "matte"; id: number; file: File; options: MatteOptions };

export type WorkerRequestPayload = Omit<WorkerRequest, "id">;

export type WorkerResponse =
  | { kind: "progress"; id: number; progress: MatteProgress }
  | {
      kind: "matted";
      id: number;
      blob: Blob;
      width: number;
      height: number;
      runtime: "webgpu" | "wasm";
      coverage: number;
    }
  | { kind: "failed"; id: number; message: string };

const ctx = self as unknown as {
  onmessage: ((event: MessageEvent<WorkerRequest>) => void) | null;
  postMessage(message: WorkerResponse): void;
};

ctx.onmessage = async (event) => {
  const request = event.data;
  try {
    const result = await removeBackground(request.file, request.options, (progress) =>
      ctx.postMessage({ kind: "progress", id: request.id, progress }),
    );
    ctx.postMessage({
      kind: "matted",
      id: request.id,
      blob: result.blob,
      width: result.width,
      height: result.height,
      runtime: result.runtime,
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
