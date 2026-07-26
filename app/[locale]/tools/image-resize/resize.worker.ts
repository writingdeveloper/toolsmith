import { detectEncoders } from "@/lib/image/convert-core";
import { resizeImage, type ResizeOptions } from "@/lib/image/resize-core";

export type WorkerRequest =
  | { kind: "detect"; id: number }
  | { kind: "resize"; id: number; file: File; options: ResizeOptions };

export type WorkerRequestPayload = WorkerRequest extends infer T
  ? T extends { id: number }
    ? Omit<T, "id">
    : never
  : never;

export type WorkerResponse =
  | { kind: "detect"; id: number; formats: string[] }
  | {
      kind: "resized";
      id: number;
      blob: Blob;
      width: number;
      height: number;
      sourceWidth: number;
      sourceHeight: number;
      /** 비율을 맞추느라 실제로 잘라 냈는가 */
      cropped: boolean;
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
    const result = await resizeImage(request.file, request.options);
    ctx.postMessage({
      kind: "resized",
      id: request.id,
      blob: result.blob,
      width: result.width,
      height: result.height,
      sourceWidth: result.sourceWidth,
      sourceHeight: result.sourceHeight,
      cropped: result.cropped,
    });
  } catch (error) {
    ctx.postMessage({
      kind: "failed",
      id: request.id,
      message: error instanceof Error ? error.message : "UNKNOWN",
    });
  }
};
