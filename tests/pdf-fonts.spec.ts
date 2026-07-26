import { expect, test } from "@playwright/test";
import { PDFJS_OPTIONS } from "../lib/pdf/pdfjs-options";

/**
 * pdf.js 를 워커에서 쓸 때의 트립와이어. 브라우저가 필요 없다.
 *
 * `disableFontFace` 가 빠지면 pdf.js 는 PDF 안에 박힌 글꼴을 `document.fonts` 에
 * 설치하려 든다. **워커에는 document 가 없으므로** 설치에 실패하고 대체 글꼴로 그리는데,
 * 그 글꼴에 한글·한자가 없으면 페이지가 통째로 **빈 네모**가 된다. 예외도 경고도 없고
 * 그림만 틀리므로, 라틴 문자만 쓰는 우리 픽스처로는 영원히 드러나지 않는다.
 *
 * 실제로 그랬다 — 2026-07-26 에 실물 한국어·일본어 PDF 를 넣기 전까지, 모든 테스트가
 * 통과하는 채로 이 결함이 살아 있었다. 이 파일은 그 플래그가 사라지는 것을 막는다.
 * 진짜 확인은 실물 문서로 한다(측정값은 docs/TOOLS.md).
 */
test("워커에서 그릴 때 글꼴을 경로로 직접 그린다", () => {
  expect(PDFJS_OPTIONS.disableFontFace).toBe(true);
});

test("cmap 과 표준 글꼴은 우리 서버가 아니라 CDN 에서 온다", () => {
  // 규칙 5 — 무거운 자산을 Vercel 에서 서빙하지 않는다
  expect(PDFJS_OPTIONS.cMapUrl).toMatch(/^https:\/\/cdn\.jsdelivr\.net\//);
  expect(PDFJS_OPTIONS.standardFontDataUrl).toMatch(/^https:\/\/cdn\.jsdelivr\.net\//);
});
