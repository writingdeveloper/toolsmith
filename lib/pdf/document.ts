/**
 * PDF 도구 공통 토대. 병합·분할이 함께 쓴다.
 * Worker 와 메인 스레드 양쪽에서 그대로 쓰이므로 window / document 를 참조하지 않는다.
 *
 * pdf-lib(MIT)은 실제로 PDF 를 만질 때만 지연 로드한다 — 파일이 들어오기 전에는
 * 네트워크로 나가지 않는다 (원칙 3번).
 */

export type PdfErrorCode =
  | "ENCRYPTED"
  | "INVALID_PDF"
  | "NO_PAGES"
  | "TOO_LARGE"
  | "BAD_RANGE"
  | "RANGE_OUT_OF_BOUNDS";

export class PdfError extends Error {
  readonly code: PdfErrorCode;
  constructor(code: PdfErrorCode) {
    super(code);
    this.name = "PdfError";
    this.code = code;
  }
}

export interface PdfInfo {
  pageCount: number;
  /** 첫 페이지 크기(pt). 미리보기 없이도 세로/가로를 표시하기 위한 값 */
  width: number;
  height: number;
}

/** 한 번에 다룰 수 있는 총량. 브라우저 메모리를 지키기 위한 안전판. */
export const MAX_TOTAL_BYTES = 512 * 1024 * 1024;

export async function loadPdfLib() {
  return import("pdf-lib");
}

/**
 * pdf-lib 의 예외를 우리 코드로 번역한다.
 *
 * 암호화된 PDF 는 `ignoreEncryption: true` 로 "열리기는" 하지만 pdf-lib 은 복호화를
 * 하지 않는다 — 페이지를 복사해도 내용이 깨진 문서가 나온다. 그래서 조용히 통과시키지
 * 않고 여기서 끊는다 (원칙: 못 하는 것을 할 수 있다고 표시하지 않는다).
 */
function translate(error: unknown): PdfError {
  if (error instanceof PdfError) return error;
  const name = error instanceof Error ? error.name : "";
  const message = error instanceof Error ? error.message : String(error);

  /*
   * 두 라이브러리가 서로 다른 말로 같은 사정을 알린다.
   *   pdf-lib  → EncryptedPDFError / "…is encrypted."
   *   pdf.js   → PasswordException / "No password given"  ← 'encrypted' 라는 말이 없다
   * 후자를 놓치면 암호 걸린 파일에 "PDF 로 읽을 수 없습니다" 라고 잘못 안내하게 된다.
   */
  if (
    name === "EncryptedPDFError" ||
    name === "PasswordException" ||
    /encrypted|password/i.test(message)
  ) {
    return new PdfError("ENCRYPTED");
  }
  return new PdfError("INVALID_PDF");
}

/**
 * pdf-lib 의 파서는 관대해서, PDF 가 아닌 바이트도 `load` 는 통과시키고 나중에
 * `getPageCount()` 에서 TypeError 로 터진다. 그래서 load 만 감싸면 안 되고
 * 함수 본문 전체를 번역 경계로 둔다.
 */
export async function guarded<T>(body: () => Promise<T>): Promise<T> {
  try {
    return await body();
  } catch (error) {
    throw translate(error);
  }
}

export async function load(bytes: Uint8Array) {
  const { PDFDocument } = await loadPdfLib();
  try {
    // updateMetadata: false — 원본의 수정일시를 우리가 건드리지 않는다.
    return await PDFDocument.load(bytes, { updateMetadata: false });
  } catch (error) {
    throw translate(error);
  }
}

export async function inspectPdf(bytes: Uint8Array): Promise<PdfInfo> {
  return guarded(async () => {
    const doc = await load(bytes);
    const pageCount = doc.getPageCount();
    if (pageCount === 0) throw new PdfError("NO_PAGES");
    const { width, height } = doc.getPage(0).getSize();
    return { pageCount, width, height };
  });
}

/** 우리가 만든 문서에 붙이는 표식. 원본 메타데이터를 그대로 흉내내지 않는다. */
export function stamp(doc: { setProducer(v: string): void; setCreator(v: string): void }) {
  doc.setProducer("toolsmith");
  doc.setCreator("toolsmith");
}
