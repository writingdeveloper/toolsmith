/**
 * pdf.js 를 **워커에서** 쓸 때 반드시 필요한 설정.
 *
 * `disableFontFace: true` 가 핵심이다. pdf.js 는 기본적으로 PDF 안에 박힌 글꼴을
 * `document.fonts` 에 @font-face 로 설치한 뒤 캔버스에 그린다. **워커에는 document 가
 * 없다.** 그러면 글꼴을 설치하지 못한 채 대체 글꼴로 그리는데, 그 글꼴에 한글·한자가
 * 없으면 **빈 네모**가 나온다. 예외도 경고도 없이 그림만 틀린다.
 *
 * 2026-07-26 실물 문서로 확인했다. 한국어 슬라이드가 통째로 `□□□` 로 그려졌고,
 * OCR 은 그 네모를 충실히 읽어 `ㅁㅁㅁ` 을 내놓았다(일본어는 `HHHH`). 이 플래그를 켜면
 * pdf.js 가 글리프를 **경로로 직접 그려** 글꼴 설치 없이 제대로 나온다.
 *
 * 표준 14종 라틴 글꼴만 쓰는 PDF 는 이 문제를 드러내지 않는다 — 우리 픽스처가 전부
 * 그랬기 때문에 테스트가 전부 통과하는 채로 이 결함이 살아 있었다.
 *
 * cmap 과 표준 글꼴 데이터는 pdf.js 가 필요할 때만 조각으로 받는다(하나에 수 KB).
 * jsDelivr 에서 오므로 규칙 5 를 지킨다.
 */
const PDFJS_VERSION = "6.1.200";
const PDFJS_CDN = `https://cdn.jsdelivr.net/npm/pdfjs-dist@${PDFJS_VERSION}`;

export const PDFJS_OPTIONS = {
  cMapUrl: `${PDFJS_CDN}/cmaps/`,
  cMapPacked: true,
  standardFontDataUrl: `${PDFJS_CDN}/standard_fonts/`,
  disableFontFace: true,
} as const;
