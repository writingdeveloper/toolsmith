/**
 * 자막 번역 — 번역 모델을 브라우저 안에서 돌린다.
 *
 * 고르는 데 쓴 실측을 먼저 적는다(2026-07-26). 이 도구는 **후보 다섯을 다 재 보고**
 * 하나만 살아남았다.
 *
 * **1. 라이선스에서 둘이 떨어졌다.**
 *    - `docs/TOOLS.md` 가 지목했던 **TranslateGemma 4B** 는 원본 저장소가 **수동 승인
 *      게이트**(`gated: manual`)다. Gemma 약관은 받은 사람에게 사용 제한을 그대로
 *      넘기라고 요구하는데, 익명의 방문자 브라우저가 2.7GB 를 받아 가는 방식으로는
 *      그 조건을 지킬 수 없다. 크기도 최소 2.7GB(q4f16)로 자막 생성의 18배다.
 *    - **NLLB-200** 은 CC-BY-NC-4.0 이다. RMBG-1.4 를 물린 것과 같은 이유로 탈락.
 *
 * **2. 크기로 하나가 떨어졌다.** `opus-mt` 단일쌍 모델은 Apache-2.0 에 품질도 좋지만
 *    **방향마다 별도 모델**이고(fp32 446MB), 정작 **en→ko 는 ONNX 판이 없다**.
 *    다국어 판(`opus-mt-en-mul`, 112MB)은 싸지만 한국어가 아예 나오지 않는다
 *    (">>kor<< The meeting starts at three" → ".. hlanganning starting at three").
 *    **싸고 틀린 것은 후보가 아니다.**
 *
 * **3. 살아남은 것은 m2m100 418M(MIT)이다.** 100개 언어를 어느 방향으로든 한다.
 *    632MB · 여는 데 10초 · **줄당 1.5초**, 20줄을 이어 돌려도 느려지지 않는다.
 *
 * **4. 가장 위험했던 것은 라이브러리 버전이었다.** transformers.js **4.2.0 에서는
 *    q8 이 세션 생성부터 실패한다**(`MatMulNBits ... Missing required scale`).
 *    그것만 보고 "이 계열은 브라우저에서 안 된다" 고 결론 낼 뻔했다. 같은 파일이
 *    **3.7.6 에서는 3초에 열리고 제대로 번역한다.** 자막 생성은 4.2.0 을 쓰므로
 *    **이 도구만 3.7.6 에 묶여 있다** — 올리면 조용히 죽는다. 스펙이 이 버전을 못 박는다.
 *
 * **5. WebGPU 는 쓸 수 없다.** 3.7.6 에서는 세션이 열리지 않고, 4.2.0 에서는 열리되
 *    같은 낱말만 반복하며 무너진다("This This This…"). CPU 로만 간다.
 *
 * **6. 한꺼번에 넘기면 느려진다.** 20줄 기준 낱개 30.2초 vs 묶음 49.1초.
 *    한 줄씩 부르는 것은 게을러서가 아니라 그게 빨라서다.
 *
 * 품질은 정직하게 말해 둔다: 평범한 문장은 잘 하고 **관용구에서 미끄러진다**
 * ("let's wrap this up" → "이것을 마무리하자" 가 아니라 엉뚱한 쪽). 화면에 그대로 적는다.
 *
 * window / document 를 참조하지 않는다.
 */

import type { Cue } from "@/lib/subtitles/subtitle-core";

/**
 * **4.2.0 으로 올리지 말 것.** 위 4번 참고 — q8 세션이 열리지 않는다.
 * `tests/subtitle-translate.spec.ts` 가 이 값을 못 박는다.
 */
const TRANSFORMERS_VERSION = "3.7.6";
const TRANSFORMERS_URL = `https://cdn.jsdelivr.net/npm/@huggingface/transformers@${TRANSFORMERS_VERSION}`;

/** 가중치는 facebook/m2m100_418M(MIT)에서 왔다. */
const MODEL_ID = "Xenova/m2m100_418M";

/** q8 인코더 + 병합 디코더의 실제 크기. 화면에 그대로 적는다. */
export const MODEL_BYTES = 287_856_370 + 344_128_178;

/** transformers.js 자체(엔진 wasm 포함)의 실측 전송량. */
export const ENGINE_BYTES = 5_600_000;

/** 20줄 실측 평균. 남은 시간을 미리 말하는 데 쓴다. */
export const SECONDS_PER_LINE = 1.5;

/**
 * m2m100 이 아는 100개 중 실제로 쓰일 만한 것만 고른다.
 * 목록이 길면 고르기 어렵고, 짧으면 도구가 쓸모없어진다.
 */
export const TRANSLATE_LANGUAGES = [
  "en",
  "ko",
  "ja",
  "zh",
  "es",
  "de",
  "fr",
  "pt",
  "it",
  "ru",
  "ar",
  "hi",
  "id",
  "vi",
  "th",
  "tr",
  "pl",
  "nl",
] as const;
export type TranslateLanguage = (typeof TRANSLATE_LANGUAGES)[number];

export function isTranslateLanguage(value: string): value is TranslateLanguage {
  return (TRANSLATE_LANGUAGES as readonly string[]).includes(value);
}

/**
 * 한 번에 받는 줄 수 상한.
 *
 * **처음에 1000으로 두었다가 실파일을 보고 올렸다(2026-07-26).** 실제 장편 영화 자막은
 * 1332칸이었다 — 1000이면 진짜 영화를 거부한다. 상한은 터무니없는 입력을 막는 것이지
 * 정상적인 쓰임을 막는 것이 아니다. 얼마나 걸릴지는 **누르기 전에 숫자로 말하고**
 * 도중에 멈출 수 있으므로, 판단은 쓰는 사람이 한다.
 */
export const MAX_LINES = 3_000;

/**
 * UTF-8 이 아닌 자막 파일을 읽을 때 쓸 인코딩.
 *
 * **실제로 흔하다.** pysrt 의 테스트 코퍼스에 들어 있는 실파일 하나가 windows-1252 이고
 * (`É` = 0xC9 에서 UTF-8 디코딩이 깨진다), 한국어 자막은 CP949 인 경우가 아주 많다.
 * 그냥 UTF-8 로 읽으면 **조용히 깨진 글자**가 나온다 — 이 저장소가 가장 싫어하는 실패다.
 *
 * 어느 인코딩으로 읽을지는 **사용자가 고른 원문 언어**로 정한다. 추측하지 않고 이미
 * 물어본 것을 쓴다. 언어를 바꾸면 파일을 다시 읽는다.
 */
const LEGACY_ENCODING: Record<TranslateLanguage, string> = {
  en: "windows-1252",
  ko: "euc-kr",
  ja: "shift_jis",
  zh: "gb18030",
  es: "windows-1252",
  de: "windows-1252",
  fr: "windows-1252",
  pt: "windows-1252",
  it: "windows-1252",
  ru: "windows-1251",
  ar: "windows-1256",
  hi: "utf-8",
  id: "windows-1252",
  vi: "windows-1258",
  th: "windows-874",
  tr: "windows-1254",
  pl: "windows-1250",
  nl: "windows-1252",
};

export type TranslateStage = "model" | "translating";

export interface TranslateProgress {
  stage: TranslateStage;
  /** 0~1 */
  ratio: number;
  /** translating 단계에서만: 지금까지 끝낸 줄 수 */
  done?: number;
  total?: number;
}

export class TranslateError extends Error {
  constructor(
    message:
      | "ENGINE_FAILED"
      | "MODEL_FAILED"
      | "EMPTY"
      | "TOO_MANY_LINES"
      | "UNSUPPORTED_INPUT"
      | "TRANSLATE_FAILED",
  ) {
    super(message);
    this.name = "TranslateError";
  }
}

/* ── 자막 파일 읽기 ────────────────────────────────────────────────
 * 브라우저가 필요 없는 순수 계산이라 스펙이 직접 검사한다.
 * 쓰는 쪽(toSrt/toVtt)은 자막 생성이 이미 갖고 있으므로 다시 만들지 않는다. */

/**
 * `HH:MM:SS,mmm` 과 `HH:MM:SS.mmm` 을 모두 받는다. 시간 칸이 없는 `MM:SS,mmm` 도
 * 실제 파일에 흔하다.
 */
function parseStamp(text: string): number | null {
  const match = /^(?:(\d+):)?(\d+):(\d+)[,.](\d{1,3})$/.exec(text.trim());
  if (!match) return null;
  const [, hours, minutes, seconds, millis] = match;
  return (
    Number(hours ?? 0) * 3600 +
    Number(minutes) * 60 +
    Number(seconds) +
    Number(millis.padEnd(3, "0")) / 1000
  );
}

/**
 * 자막 본문에 섞여 있는 **표시**를 걷어낸다.
 *
 * **실파일을 보고 알았다(2026-07-26).** Elephants Dream 의 영어 SRT 는 85칸 중 9칸에
 * `<i>`, `<br>` 이 들어 있고, Sintel 의 VTT 에는 화자 표시 `<v Test>` 가 있다.
 * 걷어내지 않으면 **태그가 그대로 번역기로 들어가** 결과가 망가진다.
 *
 * 되살리지는 않는다. 번역하면 낱말 순서가 바뀌므로 `<i>` 를 원래 자리에 다시 놓는 것은
 * 불가능하고, 되는 척하는 것이 지우는 것보다 나쁘다. **대신 몇 칸을 건드렸는지 말한다.**
 *
 * 아는 태그만 지운다 — `<[^>]+>` 로 뭉뚱그리면 "a < b" 같은 진짜 글까지 먹는다.
 */
const TAG = /<\/?(?:i|b|u|s|v|c|ruby|rt|rp|lang|font)(?:\s[^>]*)?>|<\d{1,2}:\d{2}:\d{2}[.,]\d{1,3}>/gi;
const LINE_BREAK = /<br\s*\/?>/gi;
/** ASS·SSA 의 오버라이드 블록. `{\an8}` 처럼 위치를 지정한다. */
const OVERRIDE = /\{\\[^}]*\}/g;

function stripMarkup(text: string): string {
  return text
    .replace(LINE_BREAK, " ")
    .replace(TAG, "")
    .replace(OVERRIDE, "")
    .replace(/\s+/g, " ")
    .trim();
}

export interface ParsedSubtitles {
  cues: Cue[];
  /** 표시를 걷어낸 칸 수. 0이 아니면 화면에 그렇다고 적는다. */
  stripped: number;
  /** 실제로 읽는 데 쓴 인코딩. UTF-8 이 아니면 화면에 그렇다고 적는다. */
  encoding: string;
}

/**
 * SRT 와 VTT 를 같은 함수로 읽는다 — 둘의 차이는 밀리초 구분자와 머리글뿐이고,
 * 우리가 필요한 것은 `시간 --> 시간` 줄과 그 아래 글이다.
 *
 * 번호 줄, `WEBVTT` 머리글, `NOTE` 덩어리, 큐 이름은 모두 버린다.
 */
export function parseSubtitles(source: string): Cue[] {
  const lines = source.replace(/\r\n?/g, "\n").split("\n");
  const cues: Cue[] = [];

  for (let i = 0; i < lines.length; i += 1) {
    const arrow = lines[i].split("-->");
    if (arrow.length !== 2) continue;
    const start = parseStamp(arrow[0]);
    // VTT 는 끝 시각 뒤에 배치 설정(`align:start position:10%`)을 붙일 수 있다
    const end = parseStamp(arrow[1].trim().split(/\s+/)[0]);
    if (start === null || end === null) continue;

    const text: string[] = [];
    for (let j = i + 1; j < lines.length && lines[j].trim() !== ""; j += 1) {
      text.push(lines[j].trim());
      i = j;
    }
    const joined = text.join(" ").trim();
    if (joined.length > 0) cues.push({ start, end: Math.max(end, start + 0.2), text: joined });
  }

  return cues;
}

/**
 * 파일 바이트에서 자막 칸을 얻는다. **글자를 어떻게 읽을지부터 정해야 한다.**
 *
 * UTF-8 로 엄격하게 읽어 보고, 깨지면 고른 원문 언어에 맞는 옛 인코딩으로 읽는다.
 * 관대하게(`fatal: false`) 읽으면 깨진 글자가 조용히 섞여 들어오므로 그렇게 하지 않는다.
 */
export function readSubtitles(bytes: ArrayBuffer, language: TranslateLanguage): ParsedSubtitles {
  let source: string;
  let encoding = "utf-8";
  try {
    source = new TextDecoder("utf-8", { fatal: true }).decode(bytes);
  } catch {
    encoding = LEGACY_ENCODING[language];
    source = new TextDecoder(encoding).decode(bytes);
  }

  let stripped = 0;
  const cues: Cue[] = [];
  for (const cue of parseSubtitles(source)) {
    const text = stripMarkup(cue.text);
    // 표시만 있던 칸은 번역할 것이 없다 — 세지도 않는다(남지 않는 줄을 세면 숫자가 안 맞는다)
    if (text.length === 0) continue;
    if (text !== cue.text) stripped += 1;
    cues.push({ ...cue, text });
  }

  return { cues, stripped, encoding };
}

/** 남은 시간을 미리 말한다. 실제로 번역할 줄(같은 글은 한 번)만 센다. */
export function estimateSeconds(cues: Cue[]): number {
  return uniqueTexts(cues).length * SECONDS_PER_LINE;
}

/**
 * 같은 글이 여러 번 나오는 자막이 흔하다(반복되는 후렴, 화자 표시).
 * 한 번만 번역하고 나눠 쓴다 — 공짜로 빨라지는 유일한 지점이다.
 */
function uniqueTexts(cues: Cue[]): string[] {
  return [...new Set(cues.map((cue) => cue.text))];
}

/* ── 엔진 ───────────────────────────────────────────────────────── */

/* transformers.js 는 npm 의존성이 아니라 CDN 에서 온다 — 타입도 우리가 쓰는 만큼만 적는다. */
interface Translator {
  (
    text: string,
    options: Record<string, unknown>,
  ): Promise<Array<{ translation_text: string }>>;
}

interface TransformersModule {
  pipeline(task: string, model: string, options: Record<string, unknown>): Promise<Translator>;
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

/** 파이프라인은 하나만 만든다 — 두 번째 파일이 바로 시작하는 이유다. */
let pipelinePromise: Promise<Translator> | null = null;

async function openPipeline(onProgress?: (progress: TranslateProgress) => void) {
  if (pipelinePromise) return pipelinePromise;

  pipelinePromise = (async () => {
    let tf: TransformersModule;
    try {
      tf = await loadTransformers();
    } catch {
      throw new TranslateError("ENGINE_FAILED");
    }

    const loaded = new Map<string, number>();
    const report = (event: { file?: string; loaded?: number }) => {
      if (!event.file || typeof event.loaded !== "number") return;
      loaded.set(event.file, event.loaded);
      let sum = 0;
      for (const value of loaded.values()) sum += value;
      onProgress?.({ stage: "model", ratio: Math.min(1, sum / MODEL_BYTES) });
    };

    try {
      // device 는 wasm 으로 못 박는다 — WebGPU 는 위 5번 참고
      return await tf.pipeline("translation", MODEL_ID, {
        device: "wasm",
        dtype: "q8",
        progress_callback: report,
      });
    } catch {
      throw new TranslateError("MODEL_FAILED");
    }
  })().catch((error) => {
    pipelinePromise = null;
    throw error;
  });

  return pipelinePromise;
}

export interface TranslateOptions {
  from: TranslateLanguage;
  to: TranslateLanguage;
}

export interface TranslateResult {
  cues: Cue[];
  /** 번역에 실제로 걸린 초 */
  seconds: number;
  /** 실제로 모델을 부른 횟수. 같은 글은 한 번만 부른다. */
  calls: number;
  /** 결과가 무너져 원문을 그대로 둔 줄 수. 0이 아니면 화면에 그렇게 적는다. */
  failed: number;
}

/**
 * 모델이 무너졌는가.
 *
 * **실파일에서 나왔다(2026-07-26).** Elephants Dream 자막 85칸을 번역했더니
 * `No! Emo! It's a trap!` 이 `ᄏᄏᄏᄏ…` 250자로 나왔다. 짧은 감탄문에서 잘 생긴다.
 *
 * **생성 설정으로는 못 막는다.** `no_repeat_ngram_size: 3` 과 `repetition_penalty: 1.2` 를
 * 둘 다 재 봤는데 붕괴는 그대로면서 멀쩡하던 줄이 나빠졌다("똑같은" → "똑 같은, 딱 같은").
 * 그래서 **막는 대신 알아보고 버린다.** 못 한 줄은 원문을 남긴다 — 한국어 자막에 영어가
 * 한 줄 남아 있으면 사람이 바로 알아보지만, `ᄏᄏᄏ` 는 알아볼 수 없다.
 */
export function isCollapsed(text: string): boolean {
  const trimmed = text.trim();
  if (trimmed.length === 0) return true;
  // 같은 글자가 여덟 번 넘게 잇달아 나온다
  if (/(.)\1{7,}/u.test(trimmed)) return true;
  // 길이는 긴데 서로 다른 글자가 셋뿐이다
  return trimmed.length >= 24 && new Set(trimmed.replace(/\s+/g, "")).size <= 3;
}

/**
 * 이 줄에 허락할 최대 길이.
 *
 * 자막 한 줄의 번역이 원문의 몇 배가 될 이유가 없다. 묶어 두면 **무너졌을 때 피해가
 * 짧아진다** — 실측에서 같은 줄이 21.9초에서 2.4초로 줄었고, 멀쩡한 줄은 하나도
 * 달라지지 않았다.
 */
export function tokenBudget(text: string): number {
  return Math.min(256, Math.max(24, text.split(/\s+/).length * 5 + 12));
}

export async function translateCues(
  cues: Cue[],
  options: TranslateOptions,
  onProgress?: (progress: TranslateProgress) => void,
  shouldStop?: () => boolean,
): Promise<TranslateResult> {
  if (cues.length === 0) throw new TranslateError("EMPTY");
  if (cues.length > MAX_LINES) throw new TranslateError("TOO_MANY_LINES");

  const translate = await openPipeline(onProgress);

  const texts = uniqueTexts(cues);
  const done = new Map<string, string>();
  const started = Date.now();
  let failed = 0;

  onProgress?.({ stage: "translating", ratio: 0, done: 0, total: texts.length });

  for (const text of texts) {
    if (shouldStop?.()) break;
    try {
      /*
       * 한 줄씩 부른다. 묶어서 넘기면 오히려 느리다(20줄 기준 30.2초 vs 49.1초).
       */
      const output = await translate(text, {
        src_lang: options.from,
        tgt_lang: options.to,
        max_new_tokens: tokenBudget(text),
      });
      const translated = output[0]?.translation_text ?? "";
      if (isCollapsed(translated)) {
        // 무너진 결과는 내보내지 않는다. 원문을 남기면 사람이 바로 알아본다.
        done.set(text, text);
        failed += 1;
      } else {
        done.set(text, translated.trim());
      }
    } catch {
      throw new TranslateError("TRANSLATE_FAILED");
    }
    onProgress?.({
      stage: "translating",
      ratio: done.size / texts.length,
      done: done.size,
      total: texts.length,
    });
  }

  return {
    // 아직 못 한 줄은 원문을 그대로 둔다 — 중간에 멈춰도 파일이 온전하다
    cues: cues.map((cue) => ({ ...cue, text: done.get(cue.text) ?? cue.text })),
    seconds: (Date.now() - started) / 1000,
    calls: done.size,
    failed,
  };
}
