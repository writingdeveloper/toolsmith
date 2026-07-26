import { inspectPdf, mergePdfs } from "@/lib/pdf/merge-core";

export type WorkerRequest =
  | { kind: "inspect"; id: number; file: File }
  | { kind: "merge"; id: number; files: File[] };

/**
 * 유니온에 그냥 Omit 을 씌우면 공통 키만 남아 file/files 가 사라진다.
 * 각 멤버에 분배되도록 조건부 타입을 거쳐야 한다.
 */
export type WorkerRequestPayload = WorkerRequest extends infer T
  ? T extends { id: number }
    ? Omit<T, "id">
    : never
  : never;

export type WorkerResponse =
  | { kind: "inspected"; id: number; pageCount: number; width: number; height: number }
  | { kind: "merged"; id: number; blob: Blob; pageCount: number }
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
      const info = await inspectPdf(await bytesOf(request.file));
      ctx.postMessage({ kind: "inspected", id: request.id, ...info });
      return;
    }

    const sources: Uint8Array[] = [];
    for (const file of request.files) sources.push(await bytesOf(file));
    const { bytes, pageCount } = await mergePdfs(sources);
    const blob = new Blob([bytes as BlobPart], { type: "application/pdf" });
    ctx.postMessage({ kind: "merged", id: request.id, blob, pageCount });
  } catch (error) {
    ctx.postMessage({
      kind: "failed",
      id: request.id,
      message: error instanceof Error ? error.message : "UNKNOWN",
    });
  }
};
