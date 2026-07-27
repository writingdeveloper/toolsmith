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
 *
 * ── `wasmUrl` 이 빠져 있었다 (2026-07-26, 실물 스캔본으로 발견) ──────────────
 *
 * pdf.js 5 부터 **JBIG2 와 JPEG2000 디코더가 WebAssembly 로 옮겨갔다.** 어디서 받을지
 * 알려 주지 않으면 그 이미지들이 **예외 없이 새하얗게** 그려진다 — `disableFontFace`
 * 때와 똑같이, 오류는 없고 그림만 틀린다.
 *
 * 실측: `sandwich.pdf`(스캔본)·`jbig2.pdf`·`pike-jp2.pdf` 의 썸네일이 전부
 * `min=max=255` 인 백지였다. OCR 은 그 백지를 충실히 읽어 **확신도 0%** 를 내놨다.
 * 하필 이 셋이 **스캔 문서에서 가장 흔한 형식**이라, OCR 도구가 겨냥한 바로 그 파일들이
 * 조용히 실패하고 있었다. 우리 픽스처는 전부 우리가 만든 것이라 하나도 해당되지 않았다.
 *
 * 라이선스도 확인했다(규칙 6). "JBIG2 = jbig2dec = AGPL" 이 흔한 짐작이지만 **여기서는
 * 아니다** — pdf.js 의 JBIG2 는 PDFium(BSD-3) 기반에 Mozilla 가 Apache-2.0 으로 감쌌고,
 * OpenJPEG 은 BSD-2, qcms 는 MIT 다.
 */
const PDFJS_VERSION = "6.1.200";
const PDFJS_CDN = `https://cdn.jsdelivr.net/npm/pdfjs-dist@${PDFJS_VERSION}`;

/**
 * pdf.js 가 **속으로** 쓰는 임시 캔버스를 OffscreenCanvas 로 만든다.
 *
 * 우리가 `page.render` 에 넘기는 캔버스와 별개로, pdf.js 는 이미지를 풀고 마스크를
 * 합치느라 캔버스를 더 만든다. 기본값인 `DOMCanvasFactory` 는
 * `globalThis.document.createElement("canvas")` 를 부르는데 **워커에는 document 가 없다.**
 *
 * 그래서 비트맵이 든 PDF 가 워커에서 통째로 열리지 않았다
 * (`TypeError: Cannot read properties of undefined (reading 'createElement')`).
 * 실측(2026-07-26): 사진이 든 실제 PDF 와 스캔본이 여기서 죽었고, 화면에는
 * "PDF 로 읽을 수 없습니다" 만 떴다. 글자만 있는 PDF 는 멀쩡했다 —
 * **우리 픽스처가 대부분 그랬기 때문에 스펙이 전부 통과하는 채로 살아 있었다.**
 *
 * `BaseCanvasFactory` 는 밖으로 내보내지지 않으므로 같은 약속만 그대로 지킨다.
 */
interface CanvasAndContext {
  canvas: OffscreenCanvas | null;
  context: OffscreenCanvasRenderingContext2D | null;
}

export class OffscreenCanvasFactory {
  readonly #enableHWA: boolean;

  constructor({ enableHWA = false }: { enableHWA?: boolean } = {}) {
    this.#enableHWA = enableHWA;
  }

  create(width: number, height: number): CanvasAndContext {
    if (width <= 0 || height <= 0) throw new Error("Invalid canvas size");
    const canvas = new OffscreenCanvas(width, height);
    return {
      canvas,
      // pdf.js 가 이 캔버스를 자주 읽는다 — 읽기 최적화를 켜지 않으면 눈에 띄게 느려진다
      context: canvas.getContext("2d", { willReadFrequently: !this.#enableHWA }),
    };
  }

  reset(canvasAndContext: CanvasAndContext, width: number, height: number): void {
    if (!canvasAndContext.canvas) throw new Error("Canvas is not specified");
    if (width <= 0 || height <= 0) throw new Error("Invalid canvas size");
    canvasAndContext.canvas.width = width;
    canvasAndContext.canvas.height = height;
  }

  destroy(canvasAndContext: CanvasAndContext): void {
    if (!canvasAndContext.canvas) throw new Error("Canvas is not specified");
    canvasAndContext.canvas.width = 0;
    canvasAndContext.canvas.height = 0;
    canvasAndContext.canvas = null;
    canvasAndContext.context = null;
  }
}

export const PDFJS_OPTIONS = {
  cMapUrl: `${PDFJS_CDN}/cmaps/`,
  cMapPacked: true,
  standardFontDataUrl: `${PDFJS_CDN}/standard_fonts/`,
  // 그런 이미지가 실제로 나올 때만 받는다 — 평범한 PDF 는 한 바이트도 더 받지 않는다
  wasmUrl: `${PDFJS_CDN}/wasm/`,
  /*
   * **이것이 빠지면 위의 `wasmUrl` 이 모든 PDF 를 죽인다.** pdf.js 는 이 값을 안 주면
   * 스스로 정하는데, 그 판단이 `document.baseURI` 를 읽는다:
   *
   *   useWorkerFetch = ... && cMapUrl && cMapPacked && standardFontDataUrl && wasmUrl
   *                    && isValidFetchUrl(cMapUrl, document.baseURI) && …
   *
   * 넷이 모두 참일 때만 `document.baseURI` 까지 간다. 그동안 `wasmUrl` 이 없어서
   * **`&&` 가 그 앞에서 끊겨** 워커에서도 무사했던 것이다. `wasmUrl` 을 더한 순간
   * 거기까지 도달해 `ReferenceError: document is not defined` 가 나고, 화면에는
   * "PDF 로 읽을 수 없습니다" 만 뜬다. 기존 스펙 9건이 이것을 잡았다.
   *
   * `true` 로 못 박으면 pdf.js 가 그 계산을 아예 하지 않고, cmap·글꼴·wasm 을 워커
   * 안에서 fetch 로 가져온다. 우리 URL 은 절대경로에 CORS 가 열려 있어 그대로 된다.
   */
  useWorkerFetch: true,
  // 워커에는 document 가 없다 — 위 클래스의 주석 참고
  CanvasFactory: OffscreenCanvasFactory,
  disableFontFace: true,
} as const;
