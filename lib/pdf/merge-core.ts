/**
 * PDF 읽기/병합 핵심. Worker 와 메인 스레드 양쪽에서 그대로 쓰인다.
 * 따라서 window / document 를 절대 참조하지 않는다.
 *
 * pdf-lib(MIT)은 실제로 PDF 를 만질 때만 지연 로드한다 — 파일이 들어오기 전에는
 * 네트워크로 나가지 않는다 (원칙 3번).
 */

export type PdfErrorCode = "ENCRYPTED" | "INVALID_PDF" | "NO_PAGES" | "TOO_LARGE";

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

export interface MergeResult {
  bytes: Uint8Array;
  pageCount: number;
}

/** pdf-lib 이 만드는 문서 하나의 상한. 브라우저 메모리를 지키기 위한 안전판. */
const MAX_TOTAL_BYTES = 512 * 1024 * 1024;

async function loadPdfLib() {
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
  if (name === "EncryptedPDFError" || /encrypted/i.test(message)) return new PdfError("ENCRYPTED");
  return new PdfError("INVALID_PDF");
}

async function load(bytes: Uint8Array) {
  const { PDFDocument } = await loadPdfLib();
  try {
    // updateMetadata: false — 원본의 수정일시를 우리가 건드리지 않는다.
    return await PDFDocument.load(bytes, { updateMetadata: false });
  } catch (error) {
    throw translate(error);
  }
}

/**
 * pdf-lib 의 파서는 관대해서, PDF 가 아닌 바이트도 `load` 는 통과시키고 나중에
 * `getPageCount()` 에서 TypeError 로 터진다. 그래서 load 만 감싸면 안 되고
 * 함수 본문 전체를 번역 경계로 둔다.
 */
async function guarded<T>(body: () => Promise<T>): Promise<T> {
  try {
    return await body();
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

    out.setProducer("toolsmith");
    out.setCreator("toolsmith");

    return { bytes: await out.save(), pageCount };
  });
}
