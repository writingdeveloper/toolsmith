/**
 * 글 속 개인정보 찾기 — 문서에서 이름·주소·번호를 짚어 내고 가린다.
 *
 * **이 사이트의 첫 Lab 도구다.** Tier 1·2 와 다른 것은 하나뿐이다 — 받을 것이
 * **874MB** 라 "누구나 쓸 수 있다" 고 말할 수 없다. 그래서 `/lab` 에 두고,
 * 누르기 전에 용량을 숫자로 말하고 사용자가 고르게 한다. 숨기는 것이 아니라
 * **감당할 수 있는 사람은 쓸 수 있게** 하는 것이 이 층의 목적이다.
 *
 * **왜 정규식이 아닌가.** 전화번호·주민번호는 정규식으로 잡히지만 **이름과 주소는
 * 모양이 없다.** "김민수" 와 "김치찌개" 를 가르는 것은 글자가 아니라 문맥이다.
 * 이 모델은 문장을 한 번에 읽고 각 토큰에 딱지를 붙인다(생성이 아니라 분류다).
 *
 * **모델.** `openai/privacy-filter` — **Apache-2.0**, 총 1.5B / 활성 50M.
 * 가중치에 걸린 제약이 없고 상업적 사용이 열려 있다(RMBG-1.4·Spleeter 와 다르다).
 * 발음 변환 같은 **뒤따라오는 의존성도 없다** — Kokoro 가 그 자리에서 죽었기 때문에
 * 이번에는 먼저 확인했다(`docs/TOOLS.md`).
 *
 * **런타임 버전은 4.2.0 이다.** 요약과 같고 자막 번역(3.7.6)과 다르다.
 * **통일하려 들지 말 것** — 어느 한쪽이 조용히 죽는다.
 *
 * window / document 를 참조하지 않는다.
 */

import { DocumentTextError, readDocumentText } from "@/lib/text/document-text";

/**
 * **3.7.6 으로 내리지 말 것.** 자막 번역만 그쪽에 묶여 있다.
 * `tests/pii.spec.ts` 가 이 값을 못 박는다.
 */
const TRANSFORMERS_VERSION = "4.2.0";
const TRANSFORMERS_URL = `https://cdn.jsdelivr.net/npm/@huggingface/transformers@${TRANSFORMERS_VERSION}`;

/** Apache-2.0. 근거는 파일 첫머리. */
export const MODEL_ID = "openai/privacy-filter";

/**
 * q4 한 벌의 실측 전송량. **화면에 그대로 적는다.**
 *
 * 우리 도구 중 가장 무겁다 — 자막 번역(632MB)보다 크고, 이것 때문에 Tier 2 가 아니라
 * Lab 이다. 이 숫자를 누르기 전에 말하지 않으면 이 층을 만든 의미가 없다.
 */
export const MODEL_BYTES = 874_000_000;

/** transformers.js 자체(엔진 wasm 포함)의 실측 전송량. 요약과 같은 번들이다. */
export const ENGINE_BYTES = 5_600_000;

/**
 * 한 번에 볼 수 있는 가장 긴 글.
 *
 * 모델의 문맥은 128k 로 넉넉하지만 **우리 쪽 한계가 먼저 온다** — 문서 하나를 통째로
 * 한 번에 넣으면 브라우저 탭이 오래 멈춘다. 넘으면 **자르지 않고 거부한다.**
 * 앞부분만 훑어 놓고 문서 전체를 검사한 척하는 것이 여기서는 특히 나쁘다 —
 * 놓친 개인정보를 "없다" 로 읽게 만든다.
 */
export const MAX_CHARS = 120_000;

/** 이보다 짧으면 굳이 874MB 를 받을 일이 아니다. 눈으로 읽는 편이 빠르다. */
export const MIN_CHARS = 40;

export type PiiErrorCode =
  | "NO_WEBGPU"
  | "ENGINE_FAILED"
  | "MODEL_FAILED"
  | "UNSUPPORTED_INPUT"
  | "NO_TEXT"
  | "TOO_SHORT"
  | "TOO_LONG";

export class PiiError extends Error {
  constructor(
    readonly code: PiiErrorCode,
    /** 상한·하한을 말할 때 쓸 숫자. 화면이 "얼마나 넘었는지" 를 적을 수 있어야 한다. */
    readonly chars?: number,
  ) {
    super(code);
    this.name = "PiiError";
  }
}

/* ── 글을 꺼내기 ─────────────────────────────────────────────────── */

export { ACCEPTED_EXTENSIONS } from "@/lib/text/document-text";

/** 공용 모듈의 오류를 이 도구의 갈래로 옮겨 적는다. */
export async function readDocument(name: string, bytes: ArrayBuffer): Promise<string> {
  try {
    return await readDocumentText(name, bytes);
  } catch (error) {
    if (error instanceof DocumentTextError) throw new PiiError(error.code);
    throw new PiiError("UNSUPPORTED_INPUT");
  }
}

/* ── 찾은 것 ─────────────────────────────────────────────────────── */

/**
 * 모델이 붙이는 딱지.
 *
 * **실물로 확인한 목록이다(2026-07-28).** `id2label` 을 직접 읽어 왔다 —
 * `private_person` · `private_address` · `private_phone` · `private_email` ·
 * `private_date` · `private_url` · `account_number` · `secret` 여덟이고,
 * 각각 BIOES(`B-`/`I-`/`E-`/`S-`) 접두사가 붙는다.
 *
 * **짐작으로 갈래를 만들지 않는다.** 처음엔 "식별번호·금융정보" 같은 칸을 지어 두었는데
 * 모델에는 그런 딱지가 없었다. 여덟을 그대로 쓰면 잘못 뭉갤 일이 없다.
 */
export const PII_KINDS = [
  "name",
  "address",
  "phone",
  "email",
  "date",
  "url",
  "account",
  "secret",
  "other",
] as const;

export type PiiKind = (typeof PII_KINDS)[number];

/** 모델의 딱지 → 우리 갈래. 못 알아본 것은 버리지 않고 `other` 로 남긴다. */
export function toKind(raw: string): PiiKind {
  const label = raw.replace(/^[BIESLU]-/, "").toLowerCase();
  switch (label) {
    case "private_person":
      return "name";
    case "private_address":
      return "address";
    case "private_phone":
      return "phone";
    case "private_email":
      return "email";
    case "private_date":
      return "date";
    case "private_url":
      return "url";
    case "account_number":
      return "account";
    case "secret":
      return "secret";
    default:
      return "other";
  }
}

export interface PiiSpan {
  kind: PiiKind;
  /** 원문에서의 자리. 가릴 때도, 화면에서 짚을 때도 이 값만 쓴다. */
  start: number;
  end: number;
  text: string;
  /** 모델이 준 확신도(0~1). 낮은 것을 걸러 낼 수 있어야 한다. */
  score: number;
}

/** 파이프라인이 돌려주는 한 덩어리. **문자 위치가 없다** — 아래 참고. */
export interface RawGroup {
  entity_group?: string;
  entity?: string;
  word?: string;
  score?: number;
}

/**
 * 모델이 준 덩어리를 원문의 **자리**로 옮긴다.
 *
 * **여기가 이 도구에서 가장 미묘한 곳이다(2026-07-28, 실물로 드러났다).**
 * transformers.js 의 token-classification 은 `start`/`end` 를 **주지 않는다.**
 * `aggregation_strategy: "simple"` 을 켜도 `{entity_group, score, word}` 뿐이다.
 * 처음엔 위치가 올 것으로 보고 짰는데, 개인정보가 가득한 계약서에서 **0건**이 나왔다 —
 * 위치 없는 항목을 전부 버리고 있었다. 모델은 26건을 확신도 0.9999 로 맞히고 있었고,
 * 화면만 "찾지 못했습니다" 라고 말했다. **가장 나쁜 종류의 조용한 실패다.**
 *
 * 그래서 우리가 찾는다. 덩어리는 문서 순서대로 오므로 **앞에서부터 훑으며** 마지막으로
 * 찾은 자리 뒤에서만 찾는다 — 같은 글자가 여러 번 나올 때 앞자리로 되돌아가지 않는다.
 *
 * 디코드된 낱말에는 **앞뒤 공백이 붙어 온다**(` Margaret Alvarez`). 그대로 찾으면
 * 어긋나므로 다듬어서 찾는다.
 */
export function locateSpans(text: string, groups: RawGroup[], minScore = 0.5): PiiSpan[] {
  const spans: PiiSpan[] = [];
  let cursor = 0;

  for (const group of groups) {
    const label = group.entity_group ?? group.entity ?? "";
    if (!label || label === "O") continue;
    const score = typeof group.score === "number" ? group.score : 1;
    if (score < minScore) continue;

    const needle = (group.word ?? "").trim();
    /*
     * **한 글자짜리는 버린다.** 실측(2026-07-28)에서 모델이 `Building 7` 의 `7` 을,
     * `Northwind` 의 뒤 조각을 각각 주소로 집었다. 혼자 있는 한 글자는 가려 놔도
     * 읽는 사람에게 알려 주는 것이 없고, 개수만 부풀려 **진짜 항목을 묻는다.**
     */
    if (needle.length < 2) continue;
    if (!needle) continue;

    const at = text.indexOf(needle, cursor);
    /*
     * 못 찾으면 **버린다.** 처음부터 다시 찾으면 문서 앞쪽의 엉뚱한 자리를 가리게 되고,
     * 그러면 가릴 때 관계없는 글자가 지워진다. 못 찾은 것을 조용히 옮겨 놓는 것보다
     * 빠뜨리는 편이 낫다 — 화면의 경고가 "놓칠 수 있다" 고 이미 말하고 있다.
     */
    if (at < 0) continue;

    const kind = toKind(label);
    const end = at + needle.length;
    const previous = spans[spans.length - 1];
    /*
     * 붙어 있는 같은 갈래는 하나로 본다. 실측에서 주소 하나가
     * `"4417 Cedar Hollow Road, Portland, Oregon"` 과 `"97218"` 둘로 쪼개져 나왔다 —
     * 그대로 두면 "주소 2곳" 이 된다.
     */
    if (
      previous &&
      previous.kind === kind &&
      at >= previous.end &&
      text.slice(previous.end, at).trim() === ""
    ) {
      previous.end = end;
      previous.text = text.slice(previous.start, end);
      previous.score = Math.min(previous.score, score);
    } else {
      spans.push({ kind, start: at, end, text: text.slice(at, end), score });
    }
    cursor = end;
  }

  return spans;
}

/**
 * 찾은 자리를 가린 글을 만든다.
 *
 * **뒤에서부터 바꾼다.** 앞에서부터 바꾸면 길이가 달라지면서 뒤쪽 좌표가 전부 밀린다.
 */
export function redact(text: string, spans: PiiSpan[], mask = "█"): string {
  let out = text;
  for (const span of [...spans].sort((a, b) => b.start - a.start)) {
    out = out.slice(0, span.start) + mask.repeat(Math.max(1, span.end - span.start)) + out.slice(span.end);
  }
  return out;
}

/** 갈래별 개수. 화면이 "이름 3곳 · 전화 2곳" 을 적을 수 있어야 한다. */
export function countByKind(spans: PiiSpan[]): Array<{ kind: PiiKind; count: number }> {
  const counts = new Map<PiiKind, number>();
  for (const span of spans) counts.set(span.kind, (counts.get(span.kind) ?? 0) + 1);
  return PII_KINDS.filter((kind) => counts.has(kind)).map((kind) => ({
    kind,
    count: counts.get(kind) ?? 0,
  }));
}

/* ── 엔진 ───────────────────────────────────────────────────────── */

/* transformers.js 는 npm 의존성이 아니라 CDN 에서 온다 — 타입도 쓰는 만큼만 적는다. */
type Classifier = (text: string, options?: Record<string, unknown>) => Promise<RawGroup[]>;
interface TransformersModule {
  pipeline(task: string, model: string, options: Record<string, unknown>): Promise<Classifier>;
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
  const gpu = (globalThis.navigator as { gpu?: { requestAdapter(): Promise<unknown> } } | undefined)
    ?.gpu;
  if (!gpu) return false;
  try {
    return (await gpu.requestAdapter()) !== null;
  } catch {
    return false;
  }
}

export interface PiiProgress {
  stage: "model" | "scanning";
  ratio: number;
}

let classifierPromise: Promise<Classifier> | null = null;

async function openClassifier(onProgress?: (progress: PiiProgress) => void): Promise<Classifier> {
  if (classifierPromise) return classifierPromise;

  classifierPromise = (async () => {
    let tf: TransformersModule;
    try {
      tf = await loadTransformers();
    } catch {
      throw new PiiError("ENGINE_FAILED");
    }

    const loaded = new Map<string, number>();
    try {
      return await tf.pipeline("token-classification", MODEL_ID, {
        /*
         * **wasm 으로 내려갈 수 없다.** 요약과 같은 자리다 — 이 크기의 모델을 단일
         * 스레드 wasm 으로 돌리면 끝나지 않는다. 그래서 `needs: "webgpu"` 이고,
         * WebGPU 가 없으면 시작조차 하지 않고 그렇게 말한다(규칙 3).
         */
        device: "webgpu",
        dtype: "q4",
        progress_callback: (event: { file?: string; loaded?: number }) => {
          if (!event.file || typeof event.loaded !== "number") return;
          loaded.set(event.file, event.loaded);
          let sum = 0;
          for (const value of loaded.values()) sum += value;
          onProgress?.({ stage: "model", ratio: Math.min(1, sum / MODEL_BYTES) });
        },
      });
    } catch {
      throw new PiiError("MODEL_FAILED");
    }
  })().catch((error) => {
    classifierPromise = null;
    throw error;
  });

  return classifierPromise;
}

export interface PiiResult {
  spans: PiiSpan[];
  seconds: number;
}

/**
 * 글에서 개인정보를 찾는다.
 *
 * **판정을 모델을 받기 전에 한다.** 너무 짧거나 너무 긴 글에 874MB 를 받게 하지 않는다 —
 * 요약에서 토크나이저를 먼저 연 것과 같은 이유이고, 여기서는 그 대가가 훨씬 크다.
 */
export async function findPii(
  text: string,
  onProgress?: (progress: PiiProgress) => void,
): Promise<PiiResult> {
  const length = text.trim().length;
  if (length < MIN_CHARS) throw new PiiError("TOO_SHORT", length);
  if (length > MAX_CHARS) throw new PiiError("TOO_LONG", length);
  if (!(await hasWebGpu())) throw new PiiError("NO_WEBGPU");

  const classify = await openClassifier(onProgress);
  onProgress?.({ stage: "scanning", ratio: 0 });

  const started = Date.now();
  let raw: RawGroup[];
  try {
    /*
     * **집계를 모델에 맡긴다.** BIOES 조각을 우리가 이어 붙이는 것보다 정확하다 —
     * 이쪽은 확신도까지 평균 내 준다. 대신 위치를 안 주므로 `locateSpans` 가 찾는다.
     */
    raw = await classify(text, { aggregation_strategy: "simple" });
  } catch {
    throw new PiiError("MODEL_FAILED");
  }
  const seconds = (Date.now() - started) / 1000;

  return { spans: locateSpans(text, raw), seconds };
}
