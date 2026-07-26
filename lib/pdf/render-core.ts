/**
 * PDF 페이지를 그림으로 그린다. 어느 페이지를 지울지 고르려면 눈으로 봐야 한다.
 * window / document 를 참조하지 않는다 — OffscreenCanvas 로만 그리므로 워커에서 돈다.
 *
 * pdf.js(Apache-2.0)는 여기서만 지연 로드된다. 200KB 를 훌쩍 넘는 짐이라
 * 파일이 들어오기 전에는 절대 받지 않는다.
 */

import { guarded, PdfError } from "./document";

export interface Thumbnail {
  /** 0-based 페이지 번호 */
  index: number;
  /** 원본 페이지 크기(pt) — 회전 미리보기 계산에 쓴다 */
  width: number;
  height: number;
  /** 페이지에 이미 박혀 있는 회전값(도) */
  rotation: number;
  blob: Blob;
}

/** 썸네일 긴 변(px). 그리드에서 읽을 수 있으면서 메모리를 아끼는 선. */
const THUMB_EDGE = 260;

async function loadPdfJs() {
  const pdfjs = await import("pdfjs-dist");
  // 워커 안에서 다시 워커를 띄운다. 못 띄우면 pdf.js 가 같은 스레드로 조용히 넘어가는데,
  // 우리는 이미 워커 안이라 어느 쪽이든 메인 스레드는 막히지 않는다.
  pdfjs.GlobalWorkerOptions.workerSrc = new URL(
    "pdfjs-dist/build/pdf.worker.mjs",
    import.meta.url,
  ).toString();
  return pdfjs;
}

export async function renderThumbnails(bytes: Uint8Array): Promise<Thumbnail[]> {
  return guarded(async () => {
    const pdfjs = await loadPdfJs();
    // pdf.js 는 넘긴 버퍼를 가져가 버린다(detach). 원본은 뒤에서 pdf-lib 이 다시 쓴다.
    const task = pdfjs.getDocument({ data: bytes.slice() });
    const doc = await task.promise;
    if (doc.numPages === 0) throw new PdfError("NO_PAGES");

    const thumbnails: Thumbnail[] = [];
    for (let number = 1; number <= doc.numPages; number += 1) {
      const page = await doc.getPage(number);
      const base = page.getViewport({ scale: 1 });
      const scale = THUMB_EDGE / Math.max(base.width, base.height);
      const viewport = page.getViewport({ scale });

      const canvas = new OffscreenCanvas(Math.ceil(viewport.width), Math.ceil(viewport.height));
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new PdfError("INVALID_PDF");
      // PDF 의 배경은 투명이다. 깔아주지 않으면 어두운 테마에서 글자가 사라진다.
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      await page.render({
        canvas: canvas as unknown as HTMLCanvasElement,
        canvasContext: ctx as unknown as CanvasRenderingContext2D,
        viewport,
      }).promise;

      thumbnails.push({
        index: number - 1,
        width: base.width,
        height: base.height,
        rotation: page.rotate,
        blob: await canvas.convertToBlob({ type: "image/png" }),
      });
      page.cleanup();
    }

    // 로딩 태스크를 버려야 pdf.js 가 띄운 워커까지 함께 정리된다.
    await task.destroy();
    return thumbnails;
  });
}

/**
 * OCR 로 넘기기 위해 페이지를 **크게** 그린다.
 *
 * 썸네일(260px)로는 글자를 읽을 수 없다. tesseract 는 대략 300dpi 근처에서 가장 잘
 * 읽으므로 긴 변을 2000px 로 잡는다 — A4 세로면 약 170dpi 이고, 여기서 더 키우면
 * 정확도는 거의 안 오르는데 메모리와 시간만 늘어난다(2000×1500×4 = 12MB/장).
 *
 * PNG 가 아니라 JPEG 로 낸다. 글자만 있는 페이지도 2000px PNG 면 몇 MB 가 되는데,
 * 이 그림은 화면에 보여 줄 것이 아니라 곧바로 OCR 에 먹일 것이라 품질 0.9 로 충분하다.
 */
const OCR_EDGE = 2000;

export async function renderPagesForOcr(
  bytes: Uint8Array,
  maxPages: number,
  onProgress?: (done: number, total: number) => void,
): Promise<Blob[]> {
  return guarded(async () => {
    const pdfjs = await loadPdfJs();
    const task = pdfjs.getDocument({ data: bytes.slice() });
    const doc = await task.promise;
    if (doc.numPages === 0) throw new PdfError("NO_PAGES");

    const total = Math.min(doc.numPages, maxPages);
    const images: Blob[] = [];

    for (let number = 1; number <= total; number += 1) {
      const page = await doc.getPage(number);
      const base = page.getViewport({ scale: 1 });
      const scale = OCR_EDGE / Math.max(base.width, base.height);
      const viewport = page.getViewport({ scale });

      const canvas = new OffscreenCanvas(Math.ceil(viewport.width), Math.ceil(viewport.height));
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new PdfError("INVALID_PDF");
      // PDF 배경은 투명이다. 흰 바탕을 깔지 않으면 검은 글자가 검은 바탕에 놓인다.
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      await page.render({
        canvas: canvas as unknown as HTMLCanvasElement,
        canvasContext: ctx as unknown as CanvasRenderingContext2D,
        viewport,
      }).promise;

      images.push(await canvas.convertToBlob({ type: "image/jpeg", quality: 0.9 }));
      page.cleanup();
      onProgress?.(number, total);
    }

    await task.destroy();
    return images;
  });
}

/** 이 PDF 가 몇 장인지만 알아본다. "30장까지" 를 미리 말하려면 필요하다. */
export async function countPages(bytes: Uint8Array): Promise<number> {
  return guarded(async () => {
    const pdfjs = await loadPdfJs();
    const task = pdfjs.getDocument({ data: bytes.slice() });
    const doc = await task.promise;
    const total = doc.numPages;
    await task.destroy();
    return total;
  });
}
