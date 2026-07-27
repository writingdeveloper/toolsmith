/**
 * 스템 분리 — 노래를 드럼·베이스·보컬·나머지로 가른다.
 *
 * 고르는 데 쓴 실측을 먼저 적는다(2026-07-26). 순서는 앞선 도구들과 같다:
 * **라이선스 → 크기 → 속도 → 품질.**
 *
 * **1. 라이선스에서 둘이 떨어졌다.**
 *    - **open-unmix 의 기본 모델 `umxl` 은 CC BY-NC-SA 4.0** 이다. 저장소가 스스로
 *      "the weights are only licensed for non-commercial use" 라고 적어 두었다.
 *      **기본값이 비상업**이라 문서를 안 읽고 집어들면 그대로 규칙 6 위반이다.
 *    - **Spleeter** 는 "The code of Spleeter is MIT-licensed" 라고만 적는다.
 *      **"코드" 만이다** — 가중치에 대한 명시적 허락이 없다. 세 번째로 만난 같은 함정이라
 *      이제는 문장을 그대로 인용해 둔다.
 *
 * **2. Demucs 는 단서가 없다.** "Demucs is released under the MIT license" — 코드와
 *    가중치 모두. 그래서 이것을 쓴다.
 *
 * **3. ONNX 내보내기를 고르는 것이 모델을 고르는 것만큼 중요했다.**
 *    처음 찾은 것(`arjune123/demucs-onnx`)은 **입력이 둘**이었다 — 파형과 함께 STFT
 *    스펙트로그램을 우리가 계산해 넣어야 하고, 출력도 스펙트로그램 도메인이라 역STFT 를
 *    직접 해야 했다. 문서도 없다. 소리가 **그럴듯하게 틀리는** 종류의 위험이다.
 *    `smank/htdemucs-onnx` 는 **STFT·iSTFT 가 그래프 안에 들어 있고** 계약이 적혀 있다:
 *    `mix [1,2,samples]` → `sources [1,stems,2,samples]`. 출처도 Demucs(Meta, MIT) +
 *    Mixxx 의 내보내기용 포크(MIT)로 이어진다.
 *
 * **4. 속도.** 세션 열기 2.0초, **7.8초 오디오에 15초**(CPU). 30초 미리듣기가 약 1분이다.
 *    그래서 이 도구는 처음부터 **미리듣기**다 — 노래 한 곡을 다 돌리면 10분이 넘는다.
 *
 * **5. 분리가 실제로 되는지 숫자로 확인했다.** 무엇을 넣었는지 아는 소리를 섞어
 *    (말소리 + 60Hz 사인 + 잡음 박) 각 스템과의 상관계수를 쟀다:
 *    보컬↔말소리 **0.999**, 베이스↔사인 **1.000**, 드럼↔박 **0.985**, 서로 간에는 ≈0.
 *    "돌았다" 는 아무것도 증명하지 않는다.
 *
 * window / document 를 참조하지 않는다.
 */

import { fetchModel, loadOrt, type OrtSession } from "@/lib/onnx/runtime";
import { decodeAudio } from "@/lib/subtitles/subtitle-core";
import { writeWav } from "@/lib/video/audio-core";

/** Demucs v4(htdemucs) 4스템. STFT·iSTFT 가 그래프에 포함된 내보내기다. */
const MODEL_URL = "https://huggingface.co/smank/htdemucs-onnx/resolve/main/htdemucs.onnx";

export const MODEL_BYTES = 304_321_552;

/** 그래프가 내놓는 순서. 바꾸면 이름표가 어긋난다 — 실측으로 확인한 순서다. */
export const STEM_NAMES = ["drums", "bass", "other", "vocals"] as const;
export type StemName = (typeof STEM_NAMES)[number];

/** Demucs 가 학습된 표본율. 바꿀 수 없다. */
const RATE = 44_100;

/**
 * 한 조각의 길이(표본). Demucs 가 학습된 7.8초 그대로다.
 * 그래프는 길이가 가변이지만 **학습된 길이를 벗어나면 품질이 조용히 나빠진다.**
 */
const SEGMENT = Math.round(RATE * 7.8);

/** 조각을 겹치는 비율. 참조 구현과 같은 값이다 — 이음매에서 소리가 튀지 않게 한다. */
const OVERLAP = 0.25;

/**
 * 한 번에 받는 길이 상한.
 *
 * **이 도구는 미리듣기다.** 7.8초에 15초가 걸리므로 30초면 약 1분이고, 노래 한 곡(3분)이면
 * 6분이 넘는다. 상한을 두고 **누르기 전에 얼마나 걸릴지 숫자로 말하는 쪽**을 골랐다.
 */
export const MAX_SECONDS = 30;

/** 7.8초당 15.1초 실측. 남은 시간을 미리 말하는 데 쓴다. */
export const SECONDS_PER_SECOND = 15.1 / 7.8;

export function estimateSeconds(durationSec: number): number {
  return Math.min(durationSec, MAX_SECONDS) * SECONDS_PER_SECOND;
}

export type StemStage = "decoding" | "model" | "separating";

export interface StemProgress {
  stage: StemStage;
  /** 0~1 */
  ratio: number;
}

export class StemError extends Error {
  constructor(
    message: "ENGINE_FAILED" | "MODEL_FAILED" | "NO_AUDIO" | "UNSUPPORTED_INPUT" | "SEPARATE_FAILED",
  ) {
    super(message);
    this.name = "StemError";
  }
}

/* ── 소리 다듬기 ────────────────────────────────────────────────
 * 브라우저가 필요 없는 순수 계산이라 스펙이 직접 검사한다. */

/**
 * 44.1kHz 스테레오로 맞춘다.
 *
 * 내려갈 때는 **창 안을 평균 낸다** — 건너뛰며 뽑으면 고음이 접혀 지직거린다.
 * 올라갈 때는 선형 보간이면 충분하다. 모노는 양쪽에 같은 소리를 넣는다.
 */
export function toStereo44k(channels: Float32Array[], sampleRate: number): Float32Array[] {
  const source = channels.length >= 2 ? [channels[0], channels[1]] : [channels[0], channels[0]];
  if (sampleRate === RATE) return source.map((c) => c.slice());

  const ratio = sampleRate / RATE;
  const frames = Math.floor((source[0]?.length ?? 0) / ratio);

  return source.map((input) => {
    const out = new Float32Array(frames);
    for (let i = 0; i < frames; i += 1) {
      const from = i * ratio;
      const to = from + ratio;
      if (ratio <= 1) {
        // 늘리는 쪽 — 선형 보간
        const a = Math.floor(from);
        const f = from - a;
        out[i] = (input[a] ?? 0) * (1 - f) + (input[a + 1] ?? input[a] ?? 0) * f;
      } else {
        // 줄이는 쪽 — 창 평균
        const start = Math.floor(from);
        const end = Math.min(input.length, Math.ceil(to));
        let sum = 0;
        for (let j = start; j < end; j += 1) sum += input[j] ?? 0;
        out[i] = end > start ? sum / (end - start) : 0;
      }
    }
    return out;
  });
}

/**
 * 조각의 시작 위치들. 마지막 조각이 끝을 넘지 않도록 당겨 붙인다.
 * 브라우저 없이 검사할 수 있도록 따로 뺐다.
 */
export function planSegments(length: number): number[] {
  if (length <= SEGMENT) return [0];
  const stride = Math.max(1, Math.round(SEGMENT * (1 - OVERLAP)));
  const starts: number[] = [];
  for (let at = 0; at + SEGMENT < length; at += stride) starts.push(at);
  starts.push(length - SEGMENT);
  return starts;
}

/**
 * 겹치는 자리를 부드럽게 잇는 가중치. 가운데가 1, 양 끝이 0 인 삼각형이다.
 * 그냥 이어 붙이면 이음매에서 소리가 툭 튄다.
 */
function fadeWindow(length: number): Float32Array {
  const w = new Float32Array(length);
  const half = length / 2;
  for (let i = 0; i < length; i += 1) {
    w[i] = (i < half ? i + 1 : length - i) / half;
  }
  return w;
}

/* ── 엔진 ───────────────────────────────────────────────────────── */

/**
 * **CPU(wasm) 로만 간다.**
 *
 * 다른 모델 도구들은 WebGPU 를 먼저 시도하고 안 되면 내려온다. 여기서는 그러지 않는다 —
 * 실측하고 결과를 숫자로 확인한 것이 wasm 경로뿐이기 때문이다. 재 보지 않은 길을
 * 기본값으로 두는 것은 이 저장소가 컷아웃에서 이미 데인 방식이다(같은 세션에 겹쳐 걸어
 * WebGPU 에서 멈췄다). 나중에 재 보고 더 빠르면 그때 바꾼다.
 */
let sessionPromise: Promise<OrtSession> | null = null;

async function openSession(onProgress?: (progress: StemProgress) => void) {
  if (sessionPromise) return sessionPromise;

  sessionPromise = (async () => {
    const ort = await loadOrt().catch(() => {
      throw new StemError("ENGINE_FAILED");
    });

    let model: ArrayBuffer;
    try {
      model = await fetchModel(MODEL_URL, MODEL_BYTES, (ratio) =>
        onProgress?.({ stage: "model", ratio }),
      );
    } catch {
      throw new StemError("MODEL_FAILED");
    }

    try {
      return await ort.InferenceSession.create(model, {
        executionProviders: ["wasm"],
        graphOptimizationLevel: "all",
      });
    } catch {
      throw new StemError("ENGINE_FAILED");
    }
  })().catch((error) => {
    sessionPromise = null;
    throw error;
  });

  return sessionPromise;
}

export interface StemResult {
  stems: Array<{ name: StemName; blob: Blob }>;
  /** 실제로 나눈 길이(초) */
  durationSec: number;
  /** 나누는 데 실제로 걸린 초 */
  seconds: number;
}

export async function separate(
  file: Blob,
  onProgress?: (progress: StemProgress) => void,
): Promise<StemResult> {
  onProgress?.({ stage: "decoding", ratio: 0 });
  const bytes = new Uint8Array(await file.arrayBuffer());

  let decoded: { channels: Float32Array[]; sampleRate: number };
  try {
    decoded = await decodeAudio(bytes, (ratio) => onProgress?.({ stage: "decoding", ratio }));
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    throw new StemError(message === "NO_AUDIO" ? "NO_AUDIO" : "UNSUPPORTED_INPUT");
  }

  const stereo = toStereo44k(decoded.channels, decoded.sampleRate);
  const length = Math.min(stereo[0].length, MAX_SECONDS * RATE);
  if (length === 0) throw new StemError("NO_AUDIO");

  const ort = await loadOrt();
  const session = await openSession(onProgress);

  const starts = planSegments(length);
  const window = fadeWindow(SEGMENT);

  // 스템 × 채널마다 합과 가중치를 따로 모은다. 겹친 자리는 나중에 나눠 준다.
  const stemCount = STEM_NAMES.length;
  const sums = Array.from({ length: stemCount * 2 }, () => new Float32Array(length));
  const weights = new Float32Array(length);

  const started = Date.now();
  onProgress?.({ stage: "separating", ratio: 0 });

  for (let s = 0; s < starts.length; s += 1) {
    const at = starts[s];
    // 마지막 조각이 짧으면 0 으로 채운다 — 모델은 길이가 일정할 때 가장 안전하다
    const chunk = new Float32Array(2 * SEGMENT);
    for (let c = 0; c < 2; c += 1) {
      for (let i = 0; i < SEGMENT; i += 1) chunk[c * SEGMENT + i] = stereo[c][at + i] ?? 0;
    }

    let output;
    try {
      output = await session.run({
        [session.inputNames[0]]: new ort.Tensor("float32", chunk, [1, 2, SEGMENT]),
      });
    } catch {
      throw new StemError("SEPARATE_FAILED");
    }

    const sources = output[session.outputNames[0]];
    const data = sources.data;
    for (let stem = 0; stem < stemCount; stem += 1) {
      for (let c = 0; c < 2; c += 1) {
        const target = sums[stem * 2 + c];
        const base = (stem * 2 + c) * SEGMENT;
        for (let i = 0; i < SEGMENT; i += 1) {
          const to = at + i;
          if (to >= length) break;
          target[to] += data[base + i] * window[i];
        }
      }
    }
    for (let i = 0; i < SEGMENT; i += 1) {
      const to = at + i;
      if (to >= length) break;
      weights[to] += window[i];
    }

    onProgress?.({ stage: "separating", ratio: (s + 1) / starts.length });
  }

  const stems = STEM_NAMES.map((name, stem) => {
    const channels = [0, 1].map((c) => {
      const sum = sums[stem * 2 + c];
      const out = new Float32Array(length);
      for (let i = 0; i < length; i += 1) out[i] = weights[i] > 0 ? sum[i] / weights[i] : 0;
      return out;
    });
    return { name, blob: writeWav(channels, RATE) };
  });

  return {
    stems,
    durationSec: length / RATE,
    seconds: (Date.now() - started) / 1000,
  };
}
