/**
 * 자막 생성 — Whisper 를 브라우저 안에서 돌린다.
 *
 * Tier 2 에서 가장 무거운 도구다. 고르는 데 쓴 실측을 먼저 적는다(2026-07-26).
 *
 * **1. 모델.** Whisper 는 **Apache-2.0** 이고 99개 언어를 한다. Moonshine 은 MIT 이지만
 *    **영어 전용**이라 6개 언어 사이트에는 맞지 않는다 → 탈락.
 *
 * **2. 정밀도는 fp32 밖에 못 쓴다.** 이게 받을 양을 정한다.
 *    - q8(양자화): wasm·WebGPU 양쪽 다 **세션이 열리지 않는다**
 *      (`MatMulNBits ... Missing required scale`).
 *    - fp16: wasm 은 열리지 않고, WebGPU 는 tiny 가 문장을 흐트러뜨리며
 *      **base 는 완전히 깨진다**("We are. We are. We are…" 만 반복). 조용히 망가지는
 *      종류라 더 위험하다.
 *
 * **3. 속도는 걱정한 것보다 낫다.** 16초 음성 기준 WebGPU 1.6초, CPU 도 0.14× 수준이라
 *    5분 영상이면 1분 안쪽이다. base 는 인식은 빠른데 **로드(셰이더 컴파일)가 20초대**다.
 *
 * **4. 실패 모드가 있다.** 잡음이 심한 오래된 녹음에서는 같은 글자를 반복하며 무너진다
 *    (1948년 연설 실측: tiny 가 "아, 아, 아…" 만 뱉었다). 깨끗한 현대 음성에서는
 *    한국어도 잘 된다(16초에 오류 2건, base 는 1건). **녹음 품질 문제이지 언어 문제가
 *    아니다** — 표본 하나로 판단했으면 틀린 결론을 낼 뻔했다. 화면에 그대로 적는다.
 *
 * 엔진은 **transformers.js(Apache-2.0)를 CDN 에서** 받는다. 멜 스펙트로그램·토크나이저·
 * KV 캐시·타임스탬프가 그 안에 있다. onnxruntime-web 과 같은 이유로 npm 의존성에 두지
 * 않는다(규칙 5).
 *
 * window / document 를 참조하지 않는다.
 */

import { hasWebGPU } from "@/lib/capabilities";
import { readMp3, type Mp3Stream } from "@/lib/video/mp3-source";
import { MediaError, readMp4 } from "@/lib/video/mp4-source";

const TRANSFORMERS_VERSION = "4.2.0";
const TRANSFORMERS_URL = `https://cdn.jsdelivr.net/npm/@huggingface/transformers@${TRANSFORMERS_VERSION}`;

/** transformers.js 자체(엔진 wasm 포함)의 실측 전송량. */
export const ENGINE_BYTES = 5_600_000;

export type SubtitleModel = "fast" | "accurate";

export const SUBTITLE_MODELS: SubtitleModel[] = ["fast", "accurate"];

const MODEL_ID: Record<SubtitleModel, string> = {
  fast: "onnx-community/whisper-tiny",
  accurate: "onnx-community/whisper-base",
};

/** fp32 인코더 + 병합 디코더의 실제 크기. 화면에 그대로 적는다. */
export const MODEL_BYTES: Record<SubtitleModel, number> = {
  fast: 32_904_992 + 118_553_827,
  accurate: 82_468_078 + 208_521_528,
};

/** Whisper 가 아는 언어 중 이 사이트가 쓰는 것 + 자동. */
export const SUBTITLE_LANGUAGES = ["auto", "en", "ko", "ja", "es", "de", "pt"] as const;
export type SubtitleLanguage = (typeof SUBTITLE_LANGUAGES)[number];

/** transformers.js 가 받는 이름. `auto` 는 아예 넘기지 않는다(모델이 알아맞힌다). */
const WHISPER_LANGUAGE: Record<Exclude<SubtitleLanguage, "auto">, string> = {
  en: "english",
  ko: "korean",
  ja: "japanese",
  es: "spanish",
  de: "german",
  pt: "portuguese",
};

/** Whisper 가 받는 표본율. 바꿀 수 없다. */
const TARGET_RATE = 16_000;

/** 한 번에 받는 길이 상한. 넘으면 시작하지 않고 그렇다고 말한다. */
export const MAX_SECONDS = 20 * 60;

export type SubtitleStage = "decoding" | "model" | "transcribing";

export interface SubtitleProgress {
  stage: SubtitleStage;
  /** 0~1 */
  ratio: number;
}

export class SubtitleError extends Error {
  constructor(
    message:
      | "ENGINE_FAILED"
      | "MODEL_FAILED"
      | "NO_AUDIO"
      | "UNSUPPORTED_INPUT"
      | "TOO_LONG"
      | "TRANSCRIBE_FAILED",
  ) {
    super(message);
    this.name = "SubtitleError";
  }
}

/* ── 자막 파일 만들기 ─────────────────────────────────────────────
 * 브라우저가 필요 없는 순수 계산이라 스펙이 직접 검사한다. */

export interface Cue {
  /** 초 */
  start: number;
  end: number;
  text: string;
}

function stamp(seconds: number, millisSeparator: string): string {
  const total = Math.max(0, seconds);
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const secs = Math.floor(total % 60);
  const millis = Math.round((total - Math.floor(total)) * 1000);
  const pad = (value: number, width = 2) => String(value).padStart(width, "0");
  return `${pad(hours)}:${pad(minutes)}:${pad(secs)}${millisSeparator}${pad(millis, 3)}`;
}

export function toSrt(cues: Cue[]): string {
  return (
    cues
      .map(
        (cue, index) =>
          `${index + 1}\n${stamp(cue.start, ",")} --> ${stamp(cue.end, ",")}\n${cue.text}\n`,
      )
      .join("\n") + "\n"
  );
}

export function toVtt(cues: Cue[]): string {
  return (
    "WEBVTT\n\n" +
    cues
      .map((cue) => `${stamp(cue.start, ".")} --> ${stamp(cue.end, ".")}\n${cue.text}\n`)
      .join("\n")
  );
}

/**
 * 모델이 준 구간을 자막 칸으로 다듬는다.
 *
 * 마지막 구간의 끝이 비어 있는 경우가 있고(모델이 안 닫는다), 시작과 끝이 같거나
 * 뒤집힌 구간도 나온다. 그대로 쓰면 자막 프로그램이 열지 못한다.
 */
export function toCues(
  chunks: Array<{ timestamp: [number, number | null]; text: string }>,
  duration: number,
): Cue[] {
  const cues: Cue[] = [];
  for (let i = 0; i < chunks.length; i += 1) {
    const chunk = chunks[i];
    const text = chunk.text.trim();
    if (text.length === 0) continue;
    const start = chunk.timestamp[0] ?? 0;
    // 끝이 없으면 다음 구간의 시작, 그것도 없으면 전체 길이로 닫는다
    const fallback = chunks[i + 1]?.timestamp[0] ?? duration;
    const end = chunk.timestamp[1] ?? fallback;
    cues.push({ start, end: Math.max(end, start + 0.2), text });
  }
  return cues;
}

/* ── 소리 꺼내기 ───────────────────────────────────────────────── */

/** WAV 는 헤더가 단순해서 직접 읽는다. 워커에는 `decodeAudioData` 가 없다. */
function readWav(bytes: Uint8Array): { channels: Float32Array[]; sampleRate: number } | null {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const tag = (offset: number) =>
    String.fromCharCode(
      view.getUint8(offset),
      view.getUint8(offset + 1),
      view.getUint8(offset + 2),
      view.getUint8(offset + 3),
    );
  if (bytes.byteLength < 44 || tag(0) !== "RIFF" || tag(8) !== "WAVE") return null;

  let offset = 12;
  let channelCount = 0;
  let sampleRate = 0;
  let bits = 0;
  let format = 1;
  while (offset + 8 <= bytes.byteLength) {
    const id = tag(offset);
    const size = view.getUint32(offset + 4, true);
    const body = offset + 8;
    if (id === "fmt ") {
      format = view.getUint16(body, true);
      channelCount = view.getUint16(body + 2, true);
      sampleRate = view.getUint32(body + 4, true);
      bits = view.getUint16(body + 14, true);
    } else if (id === "data" && channelCount > 0) {
      const frames = Math.floor(size / ((bits / 8) * channelCount));
      const channels = Array.from({ length: channelCount }, () => new Float32Array(frames));
      for (let frame = 0; frame < frames; frame += 1) {
        for (let channel = 0; channel < channelCount; channel += 1) {
          const at = body + (frame * channelCount + channel) * (bits / 8);
          if (format === 3 && bits === 32) channels[channel][frame] = view.getFloat32(at, true);
          else if (bits === 16) channels[channel][frame] = view.getInt16(at, true) / 32768;
          else if (bits === 8) channels[channel][frame] = (view.getUint8(at) - 128) / 128;
        }
      }
      return { channels, sampleRate };
    }
    offset = body + size + (size % 2);
  }
  return null;
}

/** MP4/MOV/M4A 는 우리가 이미 가진 demux + WebCodecs 로 편다. */
/**
 * 잘라 둔 MP3 프레임을 브라우저 디코더에 먹인다.
 *
 * MP4 쪽과 모으는 방식이 같으므로 뒤처리는 `collect()` 가 함께 쓴다.
 */
async function decodeMp3(
  stream: Mp3Stream,
  onProgress?: (ratio: number) => void,
): Promise<{ channels: Float32Array[]; sampleRate: number }> {
  const planes: Float32Array[][] = [];
  let channelCount = stream.channels;
  let sampleRate = stream.sampleRate;
  let failure: unknown = null;
  let done = 0;

  const decoder = new AudioDecoder({
    output: (data) => {
      try {
        channelCount = data.numberOfChannels;
        sampleRate = data.sampleRate;
        const frame: Float32Array[] = [];
        for (let channel = 0; channel < channelCount; channel += 1) {
          const plane = new Float32Array(data.numberOfFrames);
          data.copyTo(plane, { planeIndex: channel, format: "f32-planar" });
          frame.push(plane);
        }
        planes.push(frame);
      } catch (error) {
        failure = error;
      } finally {
        data.close();
        done += 1;
        onProgress?.(Math.min(1, done / Math.max(1, stream.frames.length)));
      }
    },
    error: (error) => {
      failure = error;
    },
  });

  decoder.configure({
    codec: stream.codec,
    sampleRate: stream.sampleRate,
    numberOfChannels: stream.channels,
  });

  // MP3 는 프레임마다 독립이라 전부 key 다. 시각은 프레임 표본 수로 만든다.
  const perFrame = (stream.samplesPerFrame / stream.sampleRate) * 1_000_000;
  for (let index = 0; index < stream.frames.length; index += 1) {
    if (failure) break;
    decoder.decode(
      new EncodedAudioChunk({
        type: "key",
        timestamp: Math.round(index * perFrame),
        duration: Math.round(perFrame),
        data: stream.frames[index],
      }),
    );
    if (decoder.decodeQueueSize > 32) await new Promise((resolve) => setTimeout(resolve, 0));
  }

  await decoder.flush();
  decoder.close();
  if (failure || planes.length === 0) throw new SubtitleError("NO_AUDIO");
  return collect(planes, channelCount, sampleRate);
}

async function decodeMp4(
  bytes: Uint8Array,
  onProgress?: (ratio: number) => void,
): Promise<{ channels: Float32Array[]; sampleRate: number }> {
  const { audio } = await readMp4(bytes);
  if (!audio) throw new SubtitleError("NO_AUDIO");

  const planes: Float32Array[][] = [];
  let channelCount = audio.channels;
  let sampleRate = audio.sampleRate;
  let failure: unknown = null;
  let done = 0;

  const decoder = new AudioDecoder({
    output: (data) => {
      try {
        channelCount = data.numberOfChannels;
        sampleRate = data.sampleRate;
        const frame: Float32Array[] = [];
        for (let channel = 0; channel < channelCount; channel += 1) {
          const plane = new Float32Array(data.numberOfFrames);
          data.copyTo(plane, { planeIndex: channel, format: "f32-planar" });
          frame.push(plane);
        }
        planes.push(frame);
      } catch (error) {
        failure = error;
      } finally {
        data.close();
        done += 1;
        onProgress?.(Math.min(1, done / Math.max(1, audio.samples.length)));
      }
    },
    error: (error) => {
      failure = error;
    },
  });

  decoder.configure({
    codec: audio.codec,
    sampleRate: audio.sampleRate,
    numberOfChannels: audio.channels,
    description: audio.description,
  });

  for (const sample of audio.samples) {
    if (failure) break;
    decoder.decode(
      new EncodedAudioChunk({
        type: sample.key ? "key" : "delta",
        timestamp: sample.timestamp,
        duration: sample.duration,
        data: sample.data,
      }),
    );
    if (decoder.decodeQueueSize > 32) await new Promise((resolve) => setTimeout(resolve, 0));
  }

  await decoder.flush();
  decoder.close();
  if (failure || planes.length === 0) throw new SubtitleError("NO_AUDIO");

  return collect(planes, channelCount, sampleRate);
}

/** 디코더가 조각조각 낸 것을 채널마다 하나로 잇는다. MP3·MP4 가 함께 쓴다. */
function collect(
  planes: Float32Array[][],
  channelCount: number,
  sampleRate: number,
): { channels: Float32Array[]; sampleRate: number } {
  const total = planes.reduce((sum, frame) => sum + (frame[0]?.length ?? 0), 0);
  const channels = Array.from({ length: channelCount }, () => new Float32Array(total));
  let offset = 0;
  for (const frame of planes) {
    const length = frame[0]?.length ?? 0;
    for (let channel = 0; channel < channelCount; channel += 1) {
      channels[channel].set(frame[channel] ?? new Float32Array(length), offset);
    }
    offset += length;
  }
  return { channels, sampleRate };
}

/**
 * 여러 채널을 하나로 섞고 16kHz 로 내린다.
 *
 * 그냥 건너뛰며 뽑으면(최근접) 고음이 접혀 지직거린다. **창 안을 평균 내어** 내린다 —
 * 거친 저역통과 구실을 하고, 말소리에는 이걸로 충분하다.
 */
export function toMono16k(channels: Float32Array[], sampleRate: number): Float32Array {
  const frames = channels[0]?.length ?? 0;
  if (frames === 0) throw new SubtitleError("NO_AUDIO");

  const mono = new Float32Array(frames);
  for (let i = 0; i < frames; i += 1) {
    let sum = 0;
    for (const channel of channels) sum += channel[i] ?? 0;
    mono[i] = sum / channels.length;
  }
  if (sampleRate === TARGET_RATE) return mono;

  const ratio = sampleRate / TARGET_RATE;
  const outFrames = Math.max(1, Math.floor(frames / ratio));
  const out = new Float32Array(outFrames);
  for (let i = 0; i < outFrames; i += 1) {
    const from = Math.floor(i * ratio);
    const to = Math.min(frames, Math.max(from + 1, Math.floor((i + 1) * ratio)));
    let sum = 0;
    for (let j = from; j < to; j += 1) sum += mono[j];
    out[i] = sum / (to - from);
  }
  return out;
}

/**
 * 파일에서 소리를 꺼낸다. **스템 분리가 같은 함수를 쓴다** — 받는 형식 목록이 두 곳에서
 * 어긋나지 않도록 여기 한 곳에 둔다. 표본율과 채널은 **원본 그대로** 돌려준다
 * (자막은 16kHz 모노로 내리고, 스템 분리는 44.1kHz 스테레오가 필요하다).
 */
export async function decodeAudio(
  bytes: Uint8Array,
  onProgress?: (ratio: number) => void,
): Promise<{ channels: Float32Array[]; sampleRate: number }> {
  try {
    const wav = readWav(bytes);
    if (wav) return wav;
    // MP3 는 컨테이너가 없는 날 프레임 흐름이다 — 우리가 잘라서 넣는다(lib/video/mp3-source.ts)
    const mp3 = readMp3(bytes);
    if (mp3) return await decodeMp3(mp3, onProgress);
    return await decodeMp4(bytes, onProgress);
  } catch (error) {
    if (error instanceof SubtitleError) throw error;
    if (error instanceof MediaError) throw new SubtitleError("UNSUPPORTED_INPUT");
    throw new SubtitleError("UNSUPPORTED_INPUT");
  }
}

/* ── 엔진 ───────────────────────────────────────────────────────── */

/* transformers.js 는 npm 의존성이 아니라 CDN 에서 온다 — 타입도 우리가 쓰는 만큼만 적는다. */
interface Transcriber {
  (
    audio: Float32Array,
    options: Record<string, unknown>,
  ): Promise<{ text: string; chunks?: Array<{ timestamp: [number, number | null]; text: string }> }>;
  dispose?(): Promise<void>;
}

interface TransformersModule {
  pipeline(task: string, model: string, options: Record<string, unknown>): Promise<Transcriber>;
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

/** 파이프라인은 모델마다 하나만 만든다 — 두 번째 파일이 바로 시작하는 이유다. */
const pipelines = new Map<SubtitleModel, Promise<{ asr: Transcriber; runtime: "webgpu" | "wasm" }>>();

async function openPipeline(
  model: SubtitleModel,
  onProgress?: (progress: SubtitleProgress) => void,
) {
  const existing = pipelines.get(model);
  if (existing) return existing;

  const created = (async () => {
    let tf: TransformersModule;
    try {
      tf = await loadTransformers();
    } catch {
      throw new SubtitleError("ENGINE_FAILED");
    }

    const total = MODEL_BYTES[model];
    const loaded = new Map<string, number>();
    const report = (event: { file?: string; loaded?: number }) => {
      if (!event.file || typeof event.loaded !== "number") return;
      loaded.set(event.file, event.loaded);
      let sum = 0;
      for (const value of loaded.values()) sum += value;
      onProgress?.({ stage: "model", ratio: Math.min(1, sum / total) });
    };

    /*
     * **어느 장치로 갈지 먼저 물어보고 한 번만 연다.**
     *
     * "WebGPU 로 열어 보고 실패하면 wasm" 으로 짰다가 되돌렸다. 어댑터가 없는
     * 브라우저에서 그 시도는 **모델 151MB 를 다 받은 뒤에야** 실패하고, 그 다음 wasm
     * 으로 또 받는다. 실측에서 테스트 하나가 9분을 넘겼다. 어댑터가 있는지는
     * 아무것도 받지 않고 알 수 있으므로 그것부터 묻는다.
     */
    const device: "webgpu" | "wasm" = (await hasWebGPU()) ? "webgpu" : "wasm";
    try {
      const asr = await tf.pipeline("automatic-speech-recognition", MODEL_ID[model], {
        device,
        // fp32 만 실제로 동작한다 — 위 주석의 실측 참고
        dtype: "fp32",
        progress_callback: report,
      });
      return { asr, runtime: device };
    } catch {
      throw new SubtitleError("MODEL_FAILED");
    }
  })().catch((error) => {
    pipelines.delete(model);
    throw error;
  });

  pipelines.set(model, created);
  return created;
}

export interface SubtitleOptions {
  model: SubtitleModel;
  language: SubtitleLanguage;
}

export interface SubtitleResult {
  cues: Cue[];
  text: string;
  durationSec: number;
  runtime: "webgpu" | "wasm";
  /** 인식에 실제로 걸린 초 */
  seconds: number;
}

export async function transcribe(
  file: Blob,
  options: SubtitleOptions,
  onProgress?: (progress: SubtitleProgress) => void,
): Promise<SubtitleResult> {
  onProgress?.({ stage: "decoding", ratio: 0 });
  const bytes = new Uint8Array(await file.arrayBuffer());

  /*
   * **`decodeAudio` 를 부른다. 여기서 형식을 다시 고르지 않는다.**
   *
   * 예전에는 이 자리에 `readWav(bytes) ?? decodeMp4(...)` 가 따로 적혀 있었다. 그래서
   * `decodeAudio` 에 MP3 를 붙였을 때 **스템 분리에서는 열리고 자막 생성에서는 거부됐다**
   * (2026-07-27, 실제 연설 MP3 로 확인). 같은 판단이 두 곳에 있으면 한 곳만 고쳐진다 —
   * OCR 에서 PDF 만 줄이고 그림은 안 줄이던 것과 같은 실패다.
   */
  const decoded = await decodeAudio(bytes, (ratio) =>
    onProgress?.({ stage: "decoding", ratio }),
  );

  const audio = toMono16k(decoded.channels, decoded.sampleRate);
  const durationSec = audio.length / TARGET_RATE;
  if (durationSec > MAX_SECONDS) throw new SubtitleError("TOO_LONG");

  const { asr, runtime } = await openPipeline(options.model, onProgress);

  onProgress?.({ stage: "transcribing", ratio: 0 });
  const started = Date.now();
  let output;
  try {
    output = await asr(audio, {
      return_timestamps: true,
      // 30초를 넘는 소리는 잘라서 넣어야 한다. 겹치는 5초가 경계에서 말을 안 끊는다.
      chunk_length_s: 30,
      stride_length_s: 5,
      ...(options.language === "auto" ? {} : { language: WHISPER_LANGUAGE[options.language] }),
    });
  } catch {
    throw new SubtitleError("TRANSCRIBE_FAILED");
  }

  onProgress?.({ stage: "transcribing", ratio: 1 });
  return {
    cues: toCues(output.chunks ?? [], durationSec),
    text: output.text.trim(),
    durationSec,
    runtime,
    seconds: (Date.now() - started) / 1000,
  };
}
