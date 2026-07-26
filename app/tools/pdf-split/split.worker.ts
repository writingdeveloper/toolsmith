import { inspectPdf } from "@/lib/pdf/document";
import { extractPages, splitToPages, zipFiles } from "@/lib/pdf/split-core";

export type WorkerRequest =
  | { kind: "inspect"; id: number; file: File }
  | { kind: "extract"; id: number; file: File; indices: number[] }
  | { kind: "split"; id: number; file: File; stem: string };

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
  | { kind: "inspected"; id: number; pageCount: number; width: number; height: number }
  | { kind: "extracted"; id: number; blob: Blob; pageCount: number }
  | { kind: "split"; id: number; blob: Blob; count: number }
  | { kind: "failed"; id: number; message: string };

// DOM lib 의 window.postMessage 시그니처와 충돌하지 않도록 좁혀서 캐스팅한다.
const ctx = self as unknown as {
  onmessage: ((event: MessageEvent<WorkerRequest>) => void) | null;
  postMessage(message: WorkerResponse): void;
};

async function bytesOf(file: File): Promise<Uint8Array> {
  return new Uint8Array(await file.arrayBuffer());
}

/** 001, 002 … — ZIP 안에서 이름순 정렬이 곧 페이지 순서가 되도록 자리수를 맞춘다. */
function pad(value: number, width: number): string {
  return String(value).padStart(width, "0");
}

ctx.onmessage = async (event) => {
  const request = event.data;

  try {
    if (request.kind === "inspect") {
      const info = await inspectPdf(await bytesOf(request.file));
      ctx.postMessage({ kind: "inspected", id: request.id, ...info });
      return;
    }

    if (request.kind === "extract") {
      const bytes = await extractPages(await bytesOf(request.file), request.indices);
      ctx.postMessage({
        kind: "extracted",
        id: request.id,
        blob: new Blob([bytes as BlobPart], { type: "application/pdf" }),
        pageCount: request.indices.length,
      });
      return;
    }

    const parts = await splitToPages(await bytesOf(request.file));
    const width = String(parts.length).length;
    const zip = await zipFiles(
      parts.map((part) => ({
        name: `${request.stem}-${pad(part.index + 1, width)}.pdf`,
        bytes: part.bytes,
      })),
    );
    ctx.postMessage({
      kind: "split",
      id: request.id,
      blob: new Blob([zip as BlobPart], { type: "application/zip" }),
      count: parts.length,
    });
  } catch (error) {
    ctx.postMessage({
      kind: "failed",
      id: request.id,
      message: error instanceof Error ? error.message : "UNKNOWN",
    });
  }
};
