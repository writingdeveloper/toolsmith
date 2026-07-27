/**
 * PDF 에서 글자층만 꺼낸다.
 *
 * **`summarize-core.ts` 에서 갈라 둔 이유가 있다.** 여기에는 `import.meta.url` 이 있고,
 * 그 한 줄 때문에 이 파일은 Playwright 의 Node 쪽에서 import 할 수 없다(`Cannot use
 * 'import.meta' outside a module`). 요약 코어는 순수 계산 부분을 스펙이 직접 부를 수
 * 있어야 하므로, 그것을 막는 것을 이쪽으로 내보냈다. `lib/pdf/pdfjs-options.ts` 와
 * `lib/pdf/render-core.ts` 가 갈라져 있는 것과 같은 이유다.
 *
 * window / document 를 참조하지 않는다.
 */

import { PDFJS_OPTIONS } from "@/lib/pdf/pdfjs-options";

export async function readPdfText(bytes: ArrayBuffer): Promise<string> {
  // pdf.js 는 PDF 가 들어온 순간에만 받는다 — 규칙 2
  const pdfjs = await import("pdfjs-dist");
  pdfjs.GlobalWorkerOptions.workerSrc = new URL(
    "pdfjs-dist/build/pdf.worker.mjs",
    import.meta.url,
  ).toString();

  const doc = await pdfjs.getDocument({ data: new Uint8Array(bytes), ...PDFJS_OPTIONS }).promise;
  const pages: string[] = [];
  for (let number = 1; number <= doc.numPages; number += 1) {
    const page = await doc.getPage(number);
    const content = await page.getTextContent();
    /*
     * 한 조각이 한 낱말일 수도, 한 줄일 수도 있다. `hasEOL` 이 줄 끝을 알려 준다.
     * 조각을 그냥 이어 붙이면 낱말이 서로 붙어 버려 토큰이 어긋난다.
     */
    let text = "";
    for (const item of content.items) {
      if (!("str" in item)) continue;
      text += item.str;
      if (item.hasEOL) text += "\n";
      else if (!item.str.endsWith(" ")) text += " ";
    }
    pages.push(text.replace(/[ \t]+/g, " ").replace(/\s*\n\s*/g, "\n").trim());
  }
  await doc.cleanup();
  return pages.filter(Boolean).join("\n\n");
}
