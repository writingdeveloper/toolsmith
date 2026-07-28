/** 모듈 워커여야 한다 — transformers.js 를 CDN 에서 동적 import 로 받는다. */

import { findPii, PiiError, readDocument, type PiiProgress, type PiiSpan } from "@/lib/pii/pii-core";

export type WorkerRequest =
  /** 파일에서 글만 꺼낸다. 모델(874MB)은 아직 받지 않는다 — 규칙 2. */
  | { kind: "read"; id: number; name: string; bytes: ArrayBuffer }
  | { kind: "scan"; id: number; text: string };

/**
 * `id` 를 뺀 요청. `Omit<WorkerRequest, "id">` 로 만들면 안 된다 — 유니온에 걸면
 * 분배되지 않아 두 갈래의 교집합만 남는다.
 */
export type WorkerRequestPayload =
  | { kind: "read"; name: string; bytes: ArrayBuffer }
  | { kind: "scan"; text: string };

export type WorkerResponse =
  | { kind: "read"; id: number; text: string }
  | { kind: "progress"; id: number; progress: PiiProgress }
  | { kind: "done"; id: number; spans: PiiSpan[]; seconds: number }
  /** `chars` 는 상한·하한에 걸렸을 때만 온다 — 화면이 얼마나 넘었는지 적을 수 있어야 한다. */
  | { kind: "failed"; id: number; message: string; chars?: number };

const ctx = self as unknown as {
  onmessage: ((event: MessageEvent<WorkerRequest>) => void) | null;
  postMessage(message: WorkerResponse): void;
};

function fail(id: number, error: unknown): WorkerResponse {
  if (error instanceof PiiError) {
    return { kind: "failed", id, message: error.code, chars: error.chars };
  }
  return { kind: "failed", id, message: error instanceof Error ? error.message : "UNKNOWN" };
}

ctx.onmessage = async (event) => {
  const request = event.data;
  try {
    if (request.kind === "read") {
      const text = await readDocument(request.name, request.bytes);
      ctx.postMessage({ kind: "read", id: request.id, text });
      return;
    }
    const result = await findPii(request.text, (progress) =>
      ctx.postMessage({ kind: "progress", id: request.id, progress }),
    );
    ctx.postMessage({ kind: "done", id: request.id, ...result });
  } catch (error) {
    ctx.postMessage(fail(request.id, error));
  }
};
