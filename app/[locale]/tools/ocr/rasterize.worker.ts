/**
 * PDF 를 OCR 이 읽을 수 있는 그림으로 바꾼다.
 *
 * OCR 자체는 여기서 하지 않는다. tesseract.js 는 자기 워커를 직접 띄우므로 우리 워커
 * 안에서 또 부르면 워커가 겹친다 — 브라우저마다 지원이 갈리는 자리다. 무거운 일은
 * 어느 쪽이든 메인 스레드 밖에서 돌므로 규칙 7 은 지켜진다.
 */

import { inspectPdf } from "@/lib/pdf/document";
import { renderPagesForOcr } from "@/lib/pdf/render-core";

export type WorkerRequest = {
  kind: "rasterize";
  id: number;
  file: File;
  maxPages: number;
};

export type WorkerRequestPayload = Omit<WorkerRequest, "id">;

export type WorkerResponse =
  | { kind: "progress"; id: number; done: number; total: number }
  | { kind: "rasterized"; id: number; images: Blob[]; totalPages: number }
  | { kind: "failed"; id: number; message: string };

const ctx = self as unknown as {
  onmessage: ((event: MessageEvent<WorkerRequest>) => void) | null;
  postMessage(message: WorkerResponse): void;
};

ctx.onmessage = async (event) => {
  const request = event.data;
  try {
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
