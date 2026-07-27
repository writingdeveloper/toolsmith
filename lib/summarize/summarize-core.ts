/**
 * 문서 요약 — 요약 모델을 브라우저 안에서 돌린다.
 *
 * 고르는 데 쓴 실측을 먼저 적는다(2026-07-27). 후보 넷을 **같은 실문서로** 재 봤다
 * (위키백과 6개 언어판 + 구텐베르크 셜록 홈즈).
 *
 * **1. `docs/TOOLS.md` 가 지목한 "LFM2.5 Summarizer" 는 존재하지 않는다.** 짐작으로
 *    적힌 칸이었다. 실재하는 것은 범용 `LFM2.5-350M` 이다. **후보 표를 믿지 말고
 *    먼저 있는지부터 확인할 것.**
 *
 * **2. Apache-2.0 후보 둘이 일 자체를 못 한다.** 이것이 이번 판정의 전부다.
 *    - **Qwen3-0.6B**(579MB): 서사문을 주면 **요약하지 않고 원문을 그대로 베낀다**
 *      ("To Sherlock Holmes she is always the woman. I have seldom heard him…" 이
 *      그대로 나온다). 문서를 구분자로 감싸 베끼기를 막으면 이번엔 내용이 무너진다
 *      ("Holmes was always the woman he was supposed to be"). 게다가 입력 **2,447토큰**
 *      에서 `memory access out of bounds` 로 죽고, **한 번 죽으면 세션이 통째로 죽어**
 *      뒤의 호출이 0.0초에 실패한다.
 *    - **granite-4.0-350m**(350MB, Apache-2.0): 똑같이 베낀다. 게다가 3배 느리다.
 *    - **Qwen2.5-0.5B**(786MB): q4f16 은 `To To To…` 로 완전히 무너지고, q4 는
 *      **한국어 문서를 영어로** 요약한 뒤 원문에 없는 내용을 붙인다.
 *
 * **3. 남은 것이 LFM2.5-350M 이다.** 요약을 학습 목표로 가진 모델이라 실제로 요약한다.
 *    255MB(q4f16)로 가장 작고, 6개 언어 문서 여섯 편 생성 합계 **12.8초**
 *    (Qwen3 는 32.2초). 입력 **10,363토큰을 3.4초**에 처리한다 — Qwen3 가 죽는 곳의 4배다.
 *
 * **4. 라이선스는 조건부다. 숨기지 않는다.** `LFM Open License v1.0` 은 카피레프트가
 *    아니지만 §5(b) 가 **연매출 $10M 를 넘는 주체의 상업적 사용을 라이선스에서 뺀다.**
 *    이 사이트는 그 문턱에서 한참 멀지만, **넘게 되면 모델을 갈아야 한다** — 그때
 *    조용히 위반하지 않도록 여기와 **도구 페이지 FAQ** 양쪽에 라이선스 이름과 그 조건을
 *    적어 두었다. 가중치는 우리가 서빙하지 않는다(브라우저가 HF CDN 에서 직접 받는다).
 *
 * **5. 버전이 또 판정을 뒤집었다. 이번엔 반대 방향이다.** transformers.js **3.7.6 에서는
 *    세션이 열리지 않고**(`열기 실패: 10288200`) **4.2.0 에서는 멀쩡히 돈다.** 자막
 *    번역은 정확히 그 반대다(4.2.0 에서 죽고 3.7.6 에서 산다). **두 도구의 버전을
 *    통일하려 들지 말 것.** 스펙이 양쪽 문자열을 다 못 박는다.
 *
 * **6. WebGPU 말고는 길이 없다.** 이 내보내기는 `GatherBlockQuantized` 를 쓰는데
 *    **wasm EP 에 구현이 없어** q4·q8 둘 다 세션이 안 열린다. CPU 로 도는 다른 후보를
 *    재 봤지만 Qwen3 q8/wasm 이 **0.9 tok/s**(한국어 문서 하나에 220초)라 쓸 수 없다.
 *    그래서 이 도구는 **WebGPU 가 없으면 아예 시작하지 않는다** — 규칙 3.
 *
 * 품질은 정직하게 말해 둔다. 실측에서 나온 것 셋:
 *  - **짧은 입력에서는 통째로 지어낸다.** 빈 입력에 "공중보건 캠페인" 요약을,
 *    `안녕` 한 낱말에 한국어 일기 세 줄을 지어냈다. 그래서 바닥을 둔다(MIN_TOKENS).
 *  - **다른 언어로 옮겨 달라고 하면 안 된다.** en→ko 는 없는 낱말로 무너지고
 *    ("광휄", "바리온 비빔백", "비록에 비록에"), ko→en 은 지시를 무시하고 한국어를 낸다.
 *    문서의 **제 언어로만** 요약한다 — 고르게 하지 않는 것이 정직하다.
 *  - **사실을 틀린다.** NADPH 를 "나트륨…" 으로 풀어 쓴 것을 봤다. 화면에 그대로 적는다.
 *
 * window / document 를 참조하지 않는다.
 */

/**
 * **3.7.6 으로 내리지 말 것.** 위 5번 참고 — 세션이 열리지 않는다.
 * 자막 번역(`lib/translate/translate-core.ts`)은 정반대로 3.7.6 에 묶여 있다.
 * `tests/summarize.spec.ts` 가 이 값을 못 박는다.
 */
const TRANSFORMERS_VERSION = "4.2.0";
const TRANSFORMERS_URL = `https://cdn.jsdelivr.net/npm/@huggingface/transformers@${TRANSFORMERS_VERSION}`;

/** 가중치는 LiquidAI/LFM2.5-350M 에서 왔다. 라이선스는 위 4번. */
const MODEL_ID = "onnx-community/LFM2.5-350M-ONNX";

/** q4f16 한 벌의 실측 전송량. 화면에 그대로 적는다. */
export const MODEL_BYTES = 255_000_000;

/** transformers.js 자체(엔진 wasm 포함)의 실측 전송량. */
export const ENGINE_BYTES = 5_600_000;

/**
 * 요약할 수 있는 가장 짧은 길이.
 *
 * 이 아래에서는 모델이 **없는 내용을 지어내 채운다**(위 품질 항목). 그리고 애초에
 * 이미 짧은 글을 요약해 봐야 얻을 것이 없다. 거부하고 그렇게 말한다.
 */
export const MIN_TOKENS = 200;

/**
 * 한 번에 받을 수 있는 가장 긴 길이.
 *
 * 실측: 15,592토큰 7.2초 · 25,876토큰 8.7초는 돌고, **41,102토큰에서 WebGPU 버퍼
 * 한계**(3.4GB > 2GB)에 걸려 죽는다. 이 기계보다 약한 GPU 를 생각해 넉넉히 아래로
 * 잡는다. 영어로 8만 자, 한국어로 2만 3천 자쯤 — A4 로 서른 장 안팎이다.
 *
 * **넘으면 자르지 않고 거부한다.** 앞부분만 요약해 놓고 문서 전체의 요약인 척하는 것이
 * 이 저장소가 가장 싫어하는 실패다.
 */
export const MAX_TOKENS = 16_000;

/**
 * 내보낼 최대 토큰.
 *
 * 실측에서 자연스럽게 끝난 요약이 58~353토큰이었다. 200 에 묶어 두었더니 한국어와
 * 스페인어가 문장 중간에서 잘렸다.
 */
const MAX_NEW_TOKENS = 384;

/**
 * 문서의 제 언어로 요약하라는 지시.
 *
 * 언어를 고르게 하지 않는 이유는 위 품질 항목 두 번째다.
 */
const SYSTEM_PROMPT =
  "Summarize the document the user gives you. " +
  "Write the summary in the same language as the document. " +
  "Write three to five sentences and nothing else.";

export type SummarizeErrorCode =
  | "NO_WEBGPU"
  | "ENGINE_FAILED"
  | "MODEL_FAILED"
  | "UNSUPPORTED_INPUT"
  | "NO_TEXT"
  | "TOO_SHORT"
  | "TOO_LONG";

export class SummarizeError extends Error {
  constructor(
    readonly code: SummarizeErrorCode,
    /** 상한·하한을 말할 때 쓸 숫자. 화면이 "얼마나 넘었는지" 를 적을 수 있어야 한다. */
    readonly tokens?: number,
  ) {
    super(code);
    this.name = "SummarizeError";
  }
}

/* ── 글을 꺼내기 ─────────────────────────────────────────────────── */

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
    .replace(/&#x([0-9a-f]+);/gi, (_, code: string) => String.fromCodePoint(Number.parseInt(code, 16)))
    .replace(/&([a-z]+);/gi, (whole, name: string) => ENTITY[name.toLowerCase()] ?? whole)
    .replace(/[ \t ]+/g, " ")
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
function decodeText(buffer: ArrayBuffer): string {
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
  if (zeros > head.length / 4) return decodeFrom(buffer, odd * 2 > zeros ? "utf-16le" : "utf-16be", 0);

  try {
    return new TextDecoder("utf-8", { fatal: true }).decode(buffer);
  } catch {
    return new TextDecoder("windows-1252").decode(buffer);
  }
}

function decodeFrom(buffer: ArrayBuffer, encoding: string, skip: number): string {
  return new TextDecoder(encoding).decode(buffer.slice(skip));
}

export interface LoadedDocument {
  text: string;
}

/**
 * 파일에서 글을 꺼낸다.
 *
 * **글자층이 없는 PDF 는 여기서 걸린다** — 스캔한 문서를 넣으면 아무 글도 안 나온다.
 * 그때는 지어내지 말고 `NO_TEXT` 로 세워서 OCR 도구로 보낸다.
 */
export async function readDocument(name: string, bytes: ArrayBuffer): Promise<LoadedDocument> {
  const lower = name.toLowerCase();
  const extension = ACCEPTED_EXTENSIONS.find((candidate) => lower.endsWith(candidate));
  if (!extension) throw new SummarizeError("UNSUPPORTED_INPUT");

  let text: string;
  if (extension === ".pdf") {
    try {
      // `import.meta` 를 품은 모듈은 여기서만 부른다 — 갈라 둔 이유는 pdf-text.ts 참고
      const { readPdfText } = await import("./pdf-text");
      text = await readPdfText(bytes);
    } catch (error) {
      if (error instanceof SummarizeError) throw error;
      throw new SummarizeError("UNSUPPORTED_INPUT");
    }
  } else if (extension === ".html" || extension === ".htm" || extension === ".md") {
    /*
     * 마크다운도 같은 길로 보낸다. **마크다운은 HTML 을 그대로 품을 수 있고 실제로
     * 자주 품는다(2026-07-27, 실파일로 확인)** — transformers.js 의 README 는 첫머리가
     * 통째로 `<p align="center"><picture><source srcset=…>` 이다. 그대로 넘기면
     * 요약할 글의 앞자리를 배지 마크업이 차지한다.
     *
     * 코드 블록 안의 태그도 함께 지워지지만, 요약에는 그편이 낫다.
     */
    text = extractHtml(decodeText(bytes));
  } else {
    text = decodeText(bytes).replace(/\r\n/g, "\n").trim();
  }

  if (text.trim().length === 0) throw new SummarizeError("NO_TEXT");
  return { text };
}

/* ── 얼마나 걸릴지 미리 말하기 ───────────────────────────────────── */

/** 한글·가나·한자. 이 글자들은 토큰당 글자수가 라틴 문자의 절반 아래다. */
const DENSE = /[぀-ヿ㐀-鿿가-힯]/g;

/**
 * 토큰 수를 어림한다. **토크나이저를 받기 전에** 쓴다.
 *
 * 실측한 토큰당 글자수: 영어 5.17 · 스페인어 3.80 · 독일어 3.76 · 포르투갈어 3.44 ·
 * 일본어 1.50 · 한국어 1.43. **언어에 따라 3.6배 벌어지므로** 글자수만으로 상한을
 * 정하면 어느 한쪽에서 반드시 틀린다. 조밀한 글자의 비율로 가른다.
 *
 * 어림은 넉넉한 쪽(토큰이 많은 쪽)으로 틀리게 잡는다 — 진짜 값은 토크나이저가 센다.
 */
export function estimateTokens(text: string): number {
  const dense = text.match(DENSE)?.length ?? 0;
  const ratio = text.length > 0 ? dense / text.length : 0;
  const perToken = ratio > 0.2 ? 1.4 : 3.4;
  return Math.ceil(text.length / perToken);
}

/** 실측: 문서 여섯 편이 1.4~10.9초. 넉넉하게 잡아 말한다. */
export const SECONDS_PER_RUN = 11;

/* ── 엔진 ───────────────────────────────────────────────────────── */

/* transformers.js 는 npm 의존성이 아니라 CDN 에서 온다 — 타입도 쓰는 만큼만 적는다. */
interface Tensor {
  dims: number[];
  slice(...ranges: Array<null | [number, number | null]>): Tensor;
}
interface Tokenizer {
  (text: string): { input_ids: Tensor };
  apply_chat_template(
    messages: Array<{ role: string; content: string }>,
    options: Record<string, unknown>,
  ): { input_ids: Tensor };
  batch_decode(ids: Tensor, options: Record<string, unknown>): string[];
}
interface CausalModel {
  generate(options: Record<string, unknown>): Promise<Tensor>;
}
interface TransformersModule {
  AutoTokenizer: { from_pretrained(model: string, options?: Record<string, unknown>): Promise<Tokenizer> };
  AutoModelForCausalLM: {
    from_pretrained(model: string, options: Record<string, unknown>): Promise<CausalModel>;
  };
  TextStreamer: new (tokenizer: Tokenizer, options: Record<string, unknown>) => unknown;
}

let transformersPromise: Promise<TransformersModule> | null = null;

async function loadTransformers(): Promise<TransformersModule> {
  if (!transformersPromise) {
    // URL 을 변수로 둔다 — 상수 문자열이면 번들러가 우리 번들로 끌어온다.
    const url = TRANSFORMERS_URL;
    transformersPromise = import(/* webpackIgnore: true */ /* @vite-ignore */ url)
      .then((loaded) => (loaded.default ?? loaded) as TransformersModule)
      .catch((error) => {
        transformersPromise = null;
        throw error;
      });
  }
  return transformersPromise;
}

/**
 * 이 브라우저가 이 도구를 돌릴 수 있는가.
 *
 * `navigator.gpu` 가 있는 것만으로는 모자란다 — 어댑터를 실제로 받아 봐야 한다.
 * (컷아웃에서 데인 것: 있다고 적혀 있는데 어댑터가 안 나오는 경우가 있다.)
 */
export async function hasWebGpu(): Promise<boolean> {
  const gpu = (globalThis.navigator as { gpu?: { requestAdapter(): Promise<unknown> } } | undefined)?.gpu;
  if (!gpu) return false;
  try {
    return (await gpu.requestAdapter()) !== null;
  } catch {
    return false;
  }
}

let tokenizerPromise: Promise<Tokenizer> | null = null;
let modelPromise: Promise<CausalModel> | null = null;

export interface SummarizeProgress {
  stage: "model" | "summarizing";
  ratio: number;
  /** 지금까지 나온 요약. 흘려 보여 주면 기다리는 시간이 짧게 느껴진다. */
  text?: string;
}

/**
 * 토크나이저만 먼저 연다. **모델(255MB)보다 500배 작고 0.5초에 열린다.**
 * 그래서 진짜 토큰 수를 세어 상한·하한을 판정한 다음에야 모델을 받는다 —
 * 너무 길거나 너무 짧은 문서에 255MB 를 받게 하지 않는다.
 */
async function openTokenizer(): Promise<Tokenizer> {
  if (!tokenizerPromise) {
    tokenizerPromise = (async () => {
      let tf: TransformersModule;
      try {
        tf = await loadTransformers();
      } catch {
        throw new SummarizeError("ENGINE_FAILED");
      }
      try {
        return await tf.AutoTokenizer.from_pretrained(MODEL_ID);
      } catch {
        throw new SummarizeError("MODEL_FAILED");
      }
    })().catch((error) => {
      tokenizerPromise = null;
      throw error;
    });
  }
  return tokenizerPromise;
}

async function openModel(onProgress?: (progress: SummarizeProgress) => void): Promise<CausalModel> {
  if (modelPromise) return modelPromise;

  modelPromise = (async () => {
    const tf = await loadTransformers();
    const loaded = new Map<string, number>();
    const report = (event: { file?: string; loaded?: number }) => {
      if (!event.file || typeof event.loaded !== "number") return;
      loaded.set(event.file, event.loaded);
      let sum = 0;
      for (const value of loaded.values()) sum += value;
      onProgress?.({ stage: "model", ratio: Math.min(1, sum / MODEL_BYTES) });
    };

    try {
      // device 는 webgpu 로 못 박는다 — wasm 에는 이 연산의 구현이 없다(위 6번)
      return await tf.AutoModelForCausalLM.from_pretrained(MODEL_ID, {
        device: "webgpu",
        dtype: "q4f16",
        progress_callback: report,
      });
    } catch {
      throw new SummarizeError("MODEL_FAILED");
    }
  })().catch((error) => {
    modelPromise = null;
    throw error;
  });

  return modelPromise;
}

export interface SummaryResult {
  summary: string;
  /** 문서가 실제로 몇 토큰이었는지 */
  tokens: number;
  /** 요약에 실제로 걸린 초 */
  seconds: number;
}

/**
 * 문서 하나를 요약한다.
 *
 * 순서가 중요하다: **토크나이저 → 판정 → 모델**. 255MB 는 이 문서를 정말 요약할 수
 * 있다고 확인한 뒤에만 받는다.
 */
export async function summarize(
  text: string,
  onProgress?: (progress: SummarizeProgress) => void,
): Promise<SummaryResult> {
  if (!(await hasWebGpu())) throw new SummarizeError("NO_WEBGPU");

  const document = text.trim();
  if (document.length === 0) throw new SummarizeError("NO_TEXT");

  const tokenizer = await openTokenizer();
  const messages = [
    { role: "system", content: SYSTEM_PROMPT },
    { role: "user", content: document },
  ];
  const inputs = tokenizer.apply_chat_template(messages, {
    add_generation_prompt: true,
    return_dict: true,
  }) as unknown as { input_ids: Tensor; attention_mask?: Tensor };
  const tokens = inputs.input_ids.dims.at(-1) ?? 0;

  if (tokens < MIN_TOKENS) throw new SummarizeError("TOO_SHORT", tokens);
  if (tokens > MAX_TOKENS) throw new SummarizeError("TOO_LONG", tokens);

  const model = await openModel(onProgress);
  const tf = await loadTransformers();

  let streamed = "";
  const streamer = new tf.TextStreamer(tokenizer, {
    skip_prompt: true,
    skip_special_tokens: true,
    callback_function: (piece: string) => {
      streamed += piece;
      onProgress?.({
        stage: "summarizing",
        ratio: Math.min(0.99, streamed.length / 600),
        text: streamed,
      });
    },
  });

  const started = performance.now();
  let ids: Tensor;
  try {
    ids = await model.generate({
      ...inputs,
      max_new_tokens: MAX_NEW_TOKENS,
      do_sample: false,
      streamer,
    });
  } catch {
    throw new SummarizeError("MODEL_FAILED");
  }
  const seconds = (performance.now() - started) / 1000;

  const fresh = ids.slice(null, [tokens, null]);
  const summary = tokenizer.batch_decode(fresh, { skip_special_tokens: true })[0]?.trim() ?? "";
  if (summary.length === 0) throw new SummarizeError("MODEL_FAILED");

  return { summary, tokens, seconds };
}
