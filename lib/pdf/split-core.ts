/**
 * PDF 분할. 공통 토대는 lib/pdf/document.ts 에 있다.
 * window / document 를 참조하지 않는다 (워커·메인 양쪽에서 쓰인다).
 */

import { guarded, load, loadPdfLib, MAX_TOTAL_BYTES, PdfError, stamp } from "./document";

export interface SplitPart {
  /** 0-based 원본 페이지 번호 */
  index: number;
  bytes: Uint8Array;
}

/**
 * "1-3, 5, 8-" 을 0-based 인덱스 배열로 바꾼다.
 *
 * 범위를 벗어난 번호를 **조용히 잘라내지 않는다.** 10쪽짜리에 "1-99" 를 넣은 사용자는
 * 99쪽이 있다고 착각하고 있는 것이므로, 잘라서 성공시키면 그 착각을 굳혀 준다.
 */
export function parsePageRanges(spec: string, pageCount: number): number[] {
  const tokens = spec
    .split(",")
    .map((token) => token.trim())
    .filter((token) => token.length > 0);
  if (tokens.length === 0) throw new PdfError("BAD_RANGE");

  const picked: number[] = [];
  const seen = new Set<number>();

  const take = (from: number, to: number) => {
    if (from < 1 || to < from) throw new PdfError("BAD_RANGE");
    if (to > pageCount) throw new PdfError("RANGE_OUT_OF_BOUNDS");
    for (let page = from; page <= to; page += 1) {
      if (seen.has(page)) continue;
      seen.add(page);
      picked.push(page - 1);
    }
  };

  for (const token of tokens) {
    let match = /^(\d+)$/.exec(token);
    if (match) {
      const page = Number(match[1]);
      take(page, page);
      continue;
    }
    match = /^(\d+)\s*-\s*(\d+)$/.exec(token);
    if (match) {
      take(Number(match[1]), Number(match[2]));
      continue;
    }
    match = /^(\d+)\s*-$/.exec(token); // "8-" → 8쪽부터 끝까지
    if (match) {
      take(Number(match[1]), pageCount);
      continue;
    }
    throw new PdfError("BAD_RANGE");
  }

  if (picked.length === 0) throw new PdfError("BAD_RANGE");
  return picked;
}

function guardSize(bytes: Uint8Array) {
  if (bytes.byteLength > MAX_TOTAL_BYTES) throw new PdfError("TOO_LARGE");
}

/** 고른 페이지만 뽑아 한 개의 PDF 로 만든다. 지정한 순서를 그대로 따른다. */
export async function extractPages(bytes: Uint8Array, indices: number[]): Promise<Uint8Array> {
  return guarded(async () => {
    guardSize(bytes);
    if (indices.length === 0) throw new PdfError("BAD_RANGE");

    const source = await load(bytes);
    const pageCount = source.getPageCount();
    if (pageCount === 0) throw new PdfError("NO_PAGES");
    if (indices.some((index) => index < 0 || index >= pageCount)) {
      throw new PdfError("RANGE_OUT_OF_BOUNDS");
    }

    const { PDFDocument } = await loadPdfLib();
    const out = await PDFDocument.create();
    const pages = await out.copyPages(source, indices);
    for (const page of pages) out.addPage(page);
    stamp(out);

    return out.save();
  });
}

/** 모든 페이지를 한 장짜리 PDF 로 쪼갠다. */
export async function splitToPages(bytes: Uint8Array): Promise<SplitPart[]> {
  return guarded(async () => {
    guardSize(bytes);

    const source = await load(bytes);
    const pageCount = source.getPageCount();
    if (pageCount === 0) throw new PdfError("NO_PAGES");

    const { PDFDocument } = await loadPdfLib();
    const parts: SplitPart[] = [];
    for (let index = 0; index < pageCount; index += 1) {
      const out = await PDFDocument.create();
      const [page] = await out.copyPages(source, [index]);
      out.addPage(page);
      stamp(out);
      parts.push({ index, bytes: await out.save() });
    }
    return parts;
  });
}

/**
 * 결과를 ZIP 하나로 묶는다. fflate(MIT)는 여기서만 지연 로드된다.
 * PDF 는 이미 압축된 스트림 덩어리라 다시 압축해봐야 시간만 먹는다 → level 0(저장).
 */
export async function zipFiles(files: { name: string; bytes: Uint8Array }[]): Promise<Uint8Array> {
  const { zipSync } = await import("fflate");
  const entries: Record<string, Uint8Array> = {};
  for (const file of files) entries[file.name] = file.bytes;
  return zipSync(entries, { level: 0 });
}
