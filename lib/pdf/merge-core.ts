/**
 * PDF 병합. 공통 토대는 lib/pdf/document.ts 에 있다.
 * window / document 를 참조하지 않는다 (워커·메인 양쪽에서 쓰인다).
 */

import { guarded, load, loadPdfLib, MAX_TOTAL_BYTES, PdfError, stamp } from "./document";

export interface MergeResult {
  bytes: Uint8Array;
  pageCount: number;
}

/**
 * 주어진 순서 그대로 이어 붙인다. 입력 순서가 곧 출력 순서다.
 */
export async function mergePdfs(sources: Uint8Array[]): Promise<MergeResult> {
  return guarded(async () => {
    if (sources.length === 0) throw new PdfError("NO_PAGES");
    const total = sources.reduce((sum, bytes) => sum + bytes.byteLength, 0);
    if (total > MAX_TOTAL_BYTES) throw new PdfError("TOO_LARGE");

    const { PDFDocument } = await loadPdfLib();
    const out = await PDFDocument.create();

    for (const bytes of sources) {
      const doc = await load(bytes);
      const pages = await out.copyPages(doc, doc.getPageIndices());
      for (const page of pages) out.addPage(page);
    }

    const pageCount = out.getPageCount();
    if (pageCount === 0) throw new PdfError("NO_PAGES");
    stamp(out);

    return { bytes: await out.save(), pageCount };
  });
}
