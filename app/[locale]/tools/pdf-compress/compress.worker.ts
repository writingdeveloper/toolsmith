import { compressPdf, type CompressOptions, type CompressResult } from "@/lib/pdf/compress-core";
import { inspectPdf } from "@/lib/pdf/document";

export type WorkerRequest =
  | { kind: "inspect"; id: number; file: File }
  | { kind: "compress"; id: number; file: File; options: CompressOptions };

/**
 * 유니온에 그냥 Omit 을 씌우면 공통 키만 남아 payload 가 사라진다.
 * 각 멤버에 분배되도록 조건부 타입을 거쳐야 한다.
 */
export type WorkerRequestPayload = WorkerRequest extends infer T
  ? T extends { id: number }
    ? Omit<T, "id">
    : never
  : never;

export type WorkerResponse =
  | { kind: "inspected"; id: number; pageCount: number }
  | {
      kind: "compressed";
      id: number;
      blob: Blob;
      stats: Omit<CompressResult, "bytes">;
    }
  | { kind: "failed"; id: number; message: string };

// DOM lib 의 window.postMessage 시그니처와 충돌하지 않도록 좁혀서 캐스팅한다.
const ctx = self as unknown as {
  onmessage: ((event: MessageEvent<WorkerRequest>) => void) | null;
  postMessage(message: WorkerResponse): void;
};

async function bytesOf(file: File): Promise<Uint8Array> {
  return new Uint8Array(await file.arrayBuffer());
}

ctx.onmessage = async (event) => {
  const request = event.data;

  try {
    if (request.kind === "inspect") {
      const { pageCount } = await inspectPdf(await bytesOf(request.file));
      ctx.postMessage({ kind: "inspected", id: request.id, pageCount });
      return;
    }

    const { bytes, ...stats } = await compressPdf(
      await bytesOf(request.file),
      request.options,
    );
    ctx.postMessage({
      kind: "compressed",
      id: request.id,
      blob: new Blob([bytes as BlobPart], { type: "application/pdf" }),
      stats,
    });
  } catch (error) {
    ctx.postMessage({
      kind: "failed",
      id: request.id,
      message: error instanceof Error ? error.message : "UNKNOWN",
    });
  }
};
