import { convertImage, detectEncoders, type ConvertOptions, type OutputFormat } from "@/lib/image/convert-core";

export type WorkerRequest =
  | { kind: "detect"; id: number }
  | { kind: "convert"; id: number; file: File; options: ConvertOptions };

/**
 * 유니온에 그냥 Omit 을 씌우면 공통 키만 남아 file/options 가 사라진다.
 * 각 멤버에 분배되도록 조건부 타입을 거쳐야 한다.
 */
export type WorkerRequestPayload = WorkerRequest extends infer T
  ? T extends { id: number }
    ? Omit<T, "id">
    : never
  : never;

export type WorkerResponse =
  | { kind: "detect"; id: number; formats: OutputFormat[] }
  | { kind: "converted"; id: number; blob: Blob; width: number; height: number }
  | { kind: "failed"; id: number; message: string };

// DOM lib 의 window.postMessage 시그니처와 충돌하지 않도록 좁혀서 캐스팅한다.
const ctx = self as unknown as {
  onmessage: ((event: MessageEvent<WorkerRequest>) => void) | null;
  postMessage(message: WorkerResponse): void;
};

ctx.onmessage = async (event) => {
  const request = event.data;

  if (request.kind === "detect") {
    ctx.postMessage({ kind: "detect", id: request.id, formats: await detectEncoders() });
    return;
  }

  try {
    const { blob, width, height } = await convertImage(request.file, request.options);
    ctx.postMessage({ kind: "converted", id: request.id, blob, width, height });
  } catch (error) {
    ctx.postMessage({
      kind: "failed",
      id: request.id,
      message: error instanceof Error ? error.message : "UNKNOWN",
    });
  }
};
