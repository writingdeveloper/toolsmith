/**
 * PDF 결과물을 실제로 파싱해서 들여다보는 도구. pdf-merge / pdf-split 스펙이 함께 쓴다.
 * "변환됐다"는 UI 문구는 아무것도 증명하지 않는다 — 여기서 바이트를 연다.
 */
import { expect, type Page } from "@playwright/test";
import { PDFArray, PDFDocument, PDFRawStream, decodePDFRawStream, type PDFPage } from "pdf-lib";

export interface PdfPageInfo {
  /** "200x400" — 페이지 크기 수열이 곧 순서의 지문이다 */
  size: string;
  /** 페이지 콘텐츠 스트림에서 뽑은 문자열. 빈 페이지가 아님을 증명한다 */
  text: string;
}

/** pdf-lib 은 텍스트를 `<4131> Tj` 형태의 16진 문자열로 쓴다. */
function textOf(doc: PDFDocument, page: PDFPage): string {
  const contents = page.node.Contents();
  if (!contents) return "";
  const streams =
    contents instanceof PDFArray
      ? contents.asArray().map((ref) => doc.context.lookup(ref))
      : [contents];

  let raw = "";
  for (const stream of streams) {
    if (!(stream instanceof PDFRawStream)) continue;
    raw += new TextDecoder().decode(decodePDFRawStream(stream).decode());
  }

  return [...raw.matchAll(/<([0-9A-Fa-f]+)>\s*Tj/g)]
    .map(([, hex]) => Buffer.from(hex, "hex").toString("latin1"))
    .join("");
}

/** 매직바이트를 확인한 뒤 페이지별 크기와 실제 내용을 돌려준다. */
export async function pagesOf(bytes: Buffer): Promise<PdfPageInfo[]> {
  expect(bytes.subarray(0, 5).toString("latin1")).toBe("%PDF-");
  const doc = await PDFDocument.load(bytes);
  return doc.getPages().map((page) => ({
    size: `${Math.round(page.getWidth())}x${Math.round(page.getHeight())}`,
    text: textOf(doc, page),
  }));
}

export interface Downloaded {
  name: string;
  mime: string;
  bytes: Buffer;
}

/** 페이지에 떠 있는 다운로드 링크의 실제 바이트를 가져온다. */
export async function downloadResult(page: Page): Promise<Downloaded> {
  const payload = await page.evaluate(async () => {
    const anchor = document.querySelector<HTMLAnchorElement>("a[download]");
    if (!anchor) return null;
    const blob = await (await fetch(anchor.href)).blob();
    return {
      name: anchor.download,
      mime: blob.type,
      bytes: [...new Uint8Array(await blob.arrayBuffer())],
    };
  });

  expect(payload).not.toBeNull();
  return { name: payload!.name, mime: payload!.mime, bytes: Buffer.from(payload!.bytes) };
}
