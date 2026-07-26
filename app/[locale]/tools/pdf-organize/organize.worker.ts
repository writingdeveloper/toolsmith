import { inspectPdf } from "@/lib/pdf/document";
import { organizePdf, type KeptPage } from "@/lib/pdf/organize-core";
import { renderThumbnails, type Thumbnail } from "@/lib/pdf/render-core";

export type WorkerRequest =
  | { kind: "thumbnails"; id: number; file: File }
  | { kind: "organize"; id: number; file: File; kept: KeptPage[] };

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
  | { kind: "thumbnails"; id: number; pages: Thumbnail[] }
  | { kind: "organized"; id: number; blob: Blob; pageCount: number }
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
    if (request.kind === "thumbnails") {
      const bytes = await bytesOf(request.file);
      /*
       * pdf.js 를 부르기 전에 pdf-lib 으로 한 번 연다.
       *
       * 두 가지를 얻는다. (1) 암호·손상 판정이 정확해진다 — pdf.js 는 암호 걸린 파일에
       * 사정이 다른 오류를 던져서 "읽을 수 없습니다" 로 잘못 안내하게 된다.
       * (2) 어차피 못 그릴 파일에 pdf.js(1.5MB)를 내려받지 않는다.
       */
      await inspectPdf(bytes);
      const pages = await renderThumbnails(bytes);
      ctx.postMessage({ kind: "thumbnails", id: request.id, pages });
      return;
    }

    const { bytes, pageCount } = await organizePdf(await bytesOf(request.file), request.kept);
    ctx.postMessage({
      kind: "organized",
      id: request.id,
      blob: new Blob([bytes as BlobPart], { type: "application/pdf" }),
      pageCount,
    });
  } catch (error) {
    ctx.postMessage({
      kind: "failed",
      id: request.id,
      message: error instanceof Error ? error.message : "UNKNOWN",
    });
  }
};
