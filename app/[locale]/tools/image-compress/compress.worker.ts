import { convertImage, detectEncoders, type ConvertOptions } from "@/lib/image/convert-core";

export type WorkerRequest =
  | { kind: "detect"; id: number }
  | { kind: "compress"; id: number; file: File; options: ConvertOptions };

export type WorkerRequestPayload = WorkerRequest extends infer T
  ? T extends { id: number }
    ? Omit<T, "id">
    : never
  : never;

export type WorkerResponse =
  | { kind: "detect"; id: number; formats: string[] }
  | { kind: "compressed"; id: number; blob: Blob; width: number; height: number }
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
    const result = await convertImage(request.file, request.options);
    ctx.postMessage({
      kind: "compressed",
      id: request.id,
      blob: result.blob,
      width: result.width,
      height: result.height,
    });
  } catch (error) {
    ctx.postMessage({
      kind: "failed",
      id: request.id,
      message: error instanceof Error ? error.message : "UNKNOWN",
    });
  }
};
