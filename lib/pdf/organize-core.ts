/**
 * PDF 페이지 정리 — 남길 페이지를 고르고 회전을 준다.
 * 공통 토대는 lib/pdf/document.ts. window / document 를 참조하지 않는다.
 */

import { guarded, load, loadPdfLib, MAX_TOTAL_BYTES, PdfError, stamp } from "./document";

export interface KeptPage {
  /** 0-based 원본 페이지 번호 */
  index: number;
  /** 원본에 더할 회전량(도). 0 / 90 / 180 / 270 */
  turn: number;
}

export interface OrganizeResult {
  bytes: Uint8Array;
  pageCount: number;
}

/** 음수나 360 이상도 받아 0·90·180·270 중 하나로 접는다. */
export function normalizeTurn(turn: number): number {
  return ((Math.round(turn / 90) * 90) % 360 + 360) % 360;
}

/**
 * 남긴 순서 그대로 새 문서를 만든다.
 *
 * 회전은 **원본에 이미 박혀 있는 값에 더한다.** 스캔 문서는 /Rotate 90 을 달고 있는
 * 경우가 흔한데, 사용자가 화면에서 본 것은 그 회전이 적용된 모습이다. 덮어쓰면
 * 눈에 보이던 것과 다른 결과가 나온다.
 */
export async function organizePdf(bytes: Uint8Array, kept: KeptPage[]): Promise<OrganizeResult> {
  return guarded(async () => {
    if (bytes.byteLength > MAX_TOTAL_BYTES) throw new PdfError("TOO_LARGE");
    if (kept.length === 0) throw new PdfError("NO_PAGES");

    const source = await load(bytes);
    const total = source.getPageCount();
    if (total === 0) throw new PdfError("NO_PAGES");
    if (kept.some((page) => page.index < 0 || page.index >= total)) {
      throw new PdfError("RANGE_OUT_OF_BOUNDS");
    }

    const { PDFDocument, degrees } = await loadPdfLib();
    const out = await PDFDocument.create();
    const pages = await out.copyPages(
      source,
      kept.map((page) => page.index),
    );

    pages.forEach((page, at) => {
      const turn = normalizeTurn(kept[at].turn);
      if (turn !== 0) {
        page.setRotation(degrees(normalizeTurn(page.getRotation().angle + turn)));
      }
      out.addPage(page);
    });

    stamp(out);
    return { bytes: await out.save(), pageCount: out.getPageCount() };
  });
}
