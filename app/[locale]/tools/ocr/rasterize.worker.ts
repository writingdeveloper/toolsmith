/**
 * PDF 를 OCR 이 읽을 수 있는 그림으로 바꾼다.
 *
 * OCR 자체는 여기서 하지 않는다. tesseract.js 는 자기 워커를 직접 띄우므로 우리 워커
 * 안에서 또 부르면 워커가 겹친다 — 브라우저마다 지원이 갈리는 자리다. 무거운 일은
 * 어느 쪽이든 메인 스레드 밖에서 돌므로 규칙 7 은 지켜진다.
 */

import { normalizeForOcr } from "@/lib/ocr/ocr-core";
import { inspectPdf } from "@/lib/pdf/document";
import { renderPagesForOcr } from "@/lib/pdf/render-core";

export type WorkerRequest =
  | { kind: "rasterize"; id: number; file: File; maxPages: number }
  /**
   * 그림도 워커를 거친다. 큰 스캔은 줄여서 넣어야 읽히고(근거는 `OCR_EDGE`),
   * 줄이는 일 자체가 메인 스레드에서 할 일이 아니다 — 규칙 7.
   */
  | { kind: "normalize"; id: number; file: File };

export type WorkerRequestPayload =
  | { kind: "rasterize"; file: File; maxPages: number }
  | { kind: "normalize"; file: File };

export type WorkerResponse =
  | { kind: "progress"; id: number; done: number; total: number }
  | { kind: "rasterized"; id: number; images: Blob[]; totalPages: number }
  | { kind: "normalized"; id: number; image: Blob }
  | { kind: "failed"; id: number; message: string };

const ctx = self as unknown as {
  onmessage: ((event: MessageEvent<WorkerRequest>) => void) | null;
  postMessage(message: WorkerResponse): void;
};

ctx.onmessage = async (event) => {
  const request = event.data;
  try {
    if (request.kind === "normalize") {
      ctx.postMessage({
        kind: "normalized",
        id: request.id,
        image: await normalizeForOcr(request.file),
      });
      return;
    }

    const bytes = new Uint8Array(await request.file.arrayBuffer());
    // 그리기 전에 pdf-lib 으로 먼저 연다 — 암호 판정이 정확해지고,
    // 못 그릴 파일에 pdf.js 를 받지 않는다.
    const info = await inspectPdf(bytes);
    const images = await renderPagesForOcr(bytes, request.maxPages, (done, total) =>
      ctx.postMessage({ kind: "progress", id: request.id, done, total }),
    );
    ctx.postMessage({
      kind: "rasterized",
      id: request.id,
      images,
      totalPages: info.pageCount,
    });
  } catch (error) {
    ctx.postMessage({
      kind: "failed",
      id: request.id,
      message: error instanceof Error ? error.message : "UNKNOWN",
    });
  }
};
