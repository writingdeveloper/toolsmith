/**
 * 파일에서 읽을 글만 꺼낸다. **문서를 글로 바꾸는 유일한 곳이다.**
 *
 * 원래 `lib/summarize/summarize-core.ts` 안에 있었다. 2026-07-28 에 글 속 개인정보
 * 찾기(`/lab/pii`)가 **똑같은 일**을 필요로 하면서 여기로 갈랐다 — 베껴 두면
 * 아래 두 가지가 두 벌이 되고, 이 저장소에서 반복해서 데인 대로 언젠가 한 곳만
 * 고쳐진다. 둘 다 **실물 파일로만 드러난 것**이라 특히 그렇다.
 *
 *  - 속성값 안의 `>` (위키백과 실물 HTML)
 *  - NUL 이 유효한 UTF-8 이라 **엄격 디코딩이 실패하지 않는 것** (UTF-16 실파일)
 *
 * window / document 를 참조하지 않는다.
 */

export type DocumentTextErrorCode = "UNSUPPORTED_INPUT" | "NO_TEXT";

/**
 * 부르는 쪽이 제 오류 갈래로 옮겨 적는다.
 *
 * **여기서 도구별 오류 코드를 알지 않는다.** 요약은 `SummarizeError`, 개인정보 찾기는
 * 제 것을 쓴다 — 공용 모듈이 부르는 쪽의 사정을 알기 시작하면 공용이 아니게 된다.
 */
export class DocumentTextError extends Error {
  constructor(readonly code: DocumentTextErrorCode) {
    super(code);
    this.name = "DocumentTextError";
  }
}

/** 우리가 열 수 있다고 적어 둔 확장자. 능력 목록은 여기 하나뿐이다. */
export const ACCEPTED_EXTENSIONS = [".txt", ".md", ".html", ".htm", ".pdf"] as const;

/** 주석. **가장 먼저 지운다** — 안에 태그가 들어 있어 나중에 지우면 조각이 샌다. */
const COMMENT = /<!--[\s\S]*?-->/g;
/** 통째로 버릴 요소 — 안에 든 글은 문서의 내용이 아니다. */
const DROPPED = /<(script|style|noscript|template|nav|header|footer|aside)\b[^>]*>[\s\S]*?<\/\1>/gi;
/** 문단이 끊기는 자리. 지우기 전에 줄바꿈으로 바꿔 둬야 문장이 붙어 버리지 않는다. */
const BLOCK = /<\/(p|div|h[1-6]|li|tr|blockquote|section|article|pre)\s*>/gi;
/**
 * 태그 하나.
 *
 * **`<[^>]+>` 로는 안 된다(2026-07-27, 실물 위키백과로 확인).** 실제 페이지의 속성값
 * 안에는 `>` 가 들어 있다 — 위키백과는 `data-mw='{"parts":[…</span>…]}'` 처럼 JSON 을
 * 통째로 속성에 담는다. 첫 `>` 에서 끊으면 나머지가 본문인 척 새어 나온다
 * (`</span>"}'>`, `{{웹 인용 |url=…}}` 가 요약에 그대로 들어갔다).
 *
 * 그래서 따옴표로 묶인 구간은 통째로 건너뛴다.
 */
const TAG = /<[a-zA-Z!/][^>"']*(?:(?:"[^"]*"|'[^']*')[^>"']*)*>/g;

const ENTITY: Record<string, string> = {
  amp: "&",
  lt: "<",
  gt: ">",
  quot: '"',
  apos: "'",
  nbsp: " ",
  mdash: "—",
  ndash: "–",
  hellip: "…",
};

/**
 * HTML 에서 읽을 글만 꺼낸다.
 *
 * `DOMParser` 를 쓰지 않는다 — **워커에는 없다.** 그리고 우리는 문서를 그리려는 것이
 * 아니라 문장만 있으면 된다.
 */
export function extractHtml(source: string): string {
  return source
    .replace(COMMENT, " ")
    .replace(DROPPED, " ")
    .replace(BLOCK, "\n")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(TAG, " ")
    .replace(/&#(\d+);/g, (_, code: string) => String.fromCodePoint(Number(code)))
    .replace(/&#x([0-9a-f]+);/gi, (_, code: string) =>
      String.fromCodePoint(Number.parseInt(code, 16)),
    )
    .replace(/&([a-z]+);/gi, (whole, name: string) => ENTITY[name.toLowerCase()] ?? whole)
    .replace(/[ \t ]+/g, " ")
    .replace(/\s*\n\s*/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

/**
 * 바이트를 글자로 읽는다.
 *
 * **UTF-8 을 먼저 시도하면 안 된다(2026-07-27, 실파일로 확인).** UTF-16LE 로 저장된
 * 파일은 ASCII 사이에 NUL 이 낀 모양인데, NUL 은 **유효한 UTF-8** 이라 엄격 디코딩이
 * 실패하지 않고 **성공해 버린다.** 그 결과 `ÿþ  < p   a l i g n` 처럼 글자마다 빈칸이
 * 낀 쓰레기가 조용히 통과했다. 실패하지 않는 실패라 더 나쁘다.
 *
 * 그래서 BOM 을 먼저 보고, BOM 이 없어도 NUL 이 섞여 있으면 UTF-16 으로 본다 —
 * 정상적인 텍스트 파일에 NUL 이 있을 이유가 없다. 그 뒤에야 UTF-8 을 엄격하게 읽고,
 * 깨지면 windows-1252 로 내려간다.
 */
export function decodeText(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  if (bytes[0] === 0xff && bytes[1] === 0xfe) return decodeFrom(buffer, "utf-16le", 2);
  if (bytes[0] === 0xfe && bytes[1] === 0xff) return decodeFrom(buffer, "utf-16be", 2);
  if (bytes[0] === 0xef && bytes[1] === 0xbb && bytes[2] === 0xbf) {
    return decodeFrom(buffer, "utf-8", 3);
  }

  // BOM 이 없는 UTF-16. 앞부분만 봐도 충분하다 — 한 글자 걸러 NUL 이 온다.
  const head = bytes.subarray(0, 512);
  let zeros = 0;
  let odd = 0;
  for (let i = 0; i < head.length; i += 1) {
    if (head[i] !== 0) continue;
    zeros += 1;
    if (i % 2 === 1) odd += 1;
  }
  // 홀수 자리가 비어 있으면 낮은 바이트가 먼저 온 것이다(LE)
  if (zeros > head.length / 4) {
    return decodeFrom(buffer, odd * 2 > zeros ? "utf-16le" : "utf-16be", 0);
  }

  try {
    return new TextDecoder("utf-8", { fatal: true }).decode(buffer);
  } catch {
    return new TextDecoder("windows-1252").decode(buffer);
  }
}

function decodeFrom(buffer: ArrayBuffer, encoding: string, skip: number): string {
  return new TextDecoder(encoding).decode(buffer.slice(skip));
}

/**
 * 파일에서 글을 꺼낸다.
 *
 * **글자층이 없는 PDF 는 여기서 걸린다** — 스캔한 문서를 넣으면 아무 글도 안 나온다.
 * 그때는 지어내지 말고 `NO_TEXT` 로 세워서 OCR 도구로 보낸다.
 */
export async function readDocumentText(name: string, bytes: ArrayBuffer): Promise<string> {
  const lower = name.toLowerCase();
  const extension = ACCEPTED_EXTENSIONS.find((candidate) => lower.endsWith(candidate));
  if (!extension) throw new DocumentTextError("UNSUPPORTED_INPUT");

  let text: string;
  if (extension === ".pdf") {
    try {
      // `import.meta` 를 품은 모듈은 여기서만 부른다 — 갈라 둔 이유는 pdf-text.ts 참고
      const { readPdfText } = await import("./pdf-text");
      text = await readPdfText(bytes);
    } catch {
      throw new DocumentTextError("UNSUPPORTED_INPUT");
    }
  } else if (extension === ".html" || extension === ".htm" || extension === ".md") {
    /*
     * 마크다운도 같은 길로 보낸다. **마크다운은 HTML 을 그대로 품을 수 있고 실제로
     * 자주 품는다(2026-07-27, 실파일로 확인)** — transformers.js 의 README 는 첫머리가
     * 통째로 `<p align="center"><picture><source srcset=…>` 이다. 그대로 넘기면
     * 읽을 글의 앞자리를 배지 마크업이 차지한다.
     *
     * 코드 블록 안의 태그도 함께 지워지지만, 여기서는 그편이 낫다.
     */
    text = extractHtml(decodeText(bytes));
  } else {
    text = decodeText(bytes).replace(/\r\n/g, "\n").trim();
  }

  if (text.trim().length === 0) throw new DocumentTextError("NO_TEXT");
  return text;
}
