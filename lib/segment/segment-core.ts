/**
 * 클릭 객체 컷아웃 — SlimSAM 을 브라우저 안에서 돌린다.
 *
 * 배경 제거(#17)와 하는 일이 비슷해 보이지만 성격이 반대다. 저쪽은 "눈에 띄는 것"
 * 하나를 모델이 알아서 고르고, 이쪽은 **사용자가 무엇을 남길지 가리킨다.** 그래서
 * 여러 물건이 있는 사진, 혹은 배경이 아니라 배경 속 물건 하나를 떼고 싶을 때 쓴다.
 *
 * **왜 두 조각으로 나뉘어 있나.** SAM 은 그림을 한 번 훑어 임베딩을 만드는 무거운
 * 인코더와, 그 임베딩에 클릭 좌표를 얹어 마스크를 내는 가벼운 디코더로 되어 있다.
 * 실측(CPU wasm 단일 스레드, 2026-07-26): **인코더 6.0초, 디코더 0.10초.**
 * 그림을 바꿀 때만 6초를 내고 클릭은 즉시 응답한다 — 이 구조가 아니면 클릭형 UI 를
 * 만들 수 없다. 그래서 워커가 임베딩을 들고 있는다.
 *
 * 라이선스: SlimSAM 도 원본 SAM 도 **Apache-2.0**.
 *
 * window / document 를 참조하지 않는다.
 */

import {
  createSession,
  fetchModel,
  loadOrt,
  type OnnxRuntimeKind,
  type OrtSession,
  type OrtTensor,
} from "@/lib/onnx/runtime";

export { ENGINE_BYTES } from "@/lib/onnx/runtime";

const BASE = "https://huggingface.co/Xenova/slimsam-77-uniform/resolve/main/onnx";
const ENCODER_URL = `${BASE}/vision_encoder_quantized.onnx`;
const DECODER_URL = `${BASE}/prompt_encoder_mask_decoder_quantized.onnx`;

export const ENCODER_BYTES = 8_882_165;
export const DECODER_BYTES = 4_903_810;
export const MODEL_BYTES = ENCODER_BYTES + DECODER_BYTES;

/** SAM 이 보는 크기. 모델이 고정으로 갖고 있어 바꿀 수 없다. */
const MODEL_EDGE = 1024;
/** 디코더가 내는 마스크의 크기(1024/4). */
const MASK_EDGE = 256;

/** ImageNet 정규화 — SAM 전처리 설정과 같아야 한다. */
const MEAN = [0.485, 0.456, 0.406];
const STD = [0.229, 0.224, 0.225];

/** 다룰 수 있는 원본 크기 상한. 인코더는 항상 1024 로 줄여 보므로 시간과 무관하고, 메모리 때문이다. */
export const MAX_PIXELS = 4_000_000;

export const CUTOUT_BACKGROUNDS = ["transparent", "white", "black"] as const;
export type CutoutBackground = (typeof CUTOUT_BACKGROUNDS)[number];

const BACKGROUND_RGB: Record<Exclude<CutoutBackground, "transparent">, [number, number, number]> = {
  white: [255, 255, 255],
  black: [0, 0, 0],
};

/** 사용자가 찍은 점. `include: false` 는 "여기는 빼라" 는 뜻이다. */
export interface Point {
  x: number;
  y: number;
  include: boolean;
}

export type SegmentStage = "engine" | "model" | "encoding";

export interface SegmentProgress {
  stage: SegmentStage;
  /** 0~1 */
  ratio: number;
}

export class SegmentError extends Error {
  constructor(
    message: "ENGINE_FAILED" | "MODEL_FAILED" | "UNSUPPORTED_INPUT" | "TOO_LARGE" | "SEGMENT_FAILED",
  ) {
    super(message);
    this.name = "SegmentError";
  }
}

let sessionsPromise: Promise<{
  encoder: OrtSession;
  decoder: OrtSession;
  runtime: OnnxRuntimeKind;
}> | null = null;

async function openSessions(onProgress?: (progress: SegmentProgress) => void) {
  if (!sessionsPromise) {
    sessionsPromise = (async () => {
      try {
        onProgress?.({ stage: "engine", ratio: 0 });
        await loadOrt();
        onProgress?.({ stage: "engine", ratio: 1 });
      } catch {
        throw new SegmentError("ENGINE_FAILED");
      }

      let encoderBytes: ArrayBuffer;
      let decoderBytes: ArrayBuffer;
      try {
        // 두 파일을 하나의 진행률로 보여 준다 — 사용자에게는 "모델 받는 중" 하나다.
        encoderBytes = await fetchModel(ENCODER_URL, ENCODER_BYTES, (ratio) =>
          onProgress?.({ stage: "model", ratio: (ratio * ENCODER_BYTES) / MODEL_BYTES }),
        );
        decoderBytes = await fetchModel(DECODER_URL, DECODER_BYTES, (ratio) =>
          onProgress?.({
            stage: "model",
            ratio: (ENCODER_BYTES + ratio * DECODER_BYTES) / MODEL_BYTES,
          }),
        );
      } catch {
        throw new SegmentError("MODEL_FAILED");
      }

      try {
        const encoder = await createSession(encoderBytes);
        const decoder = await createSession(decoderBytes);
        return { encoder: encoder.session, decoder: decoder.session, runtime: encoder.runtime };
      } catch {
        throw new SegmentError("MODEL_FAILED");
      }
    })().catch((error) => {
      sessionsPromise = null;
      throw error;
    });
  }
  return sessionsPromise;
}

/**
 * 그림을 어떻게 1024 상자 안에 넣을지.
 *
 * 긴 변을 1024 에 맞춰 줄이고 **오른쪽·아래를 0 으로 채운다.** 그래서 마스크도 같은
 * 상자로 나오고, 되돌릴 때 왼쪽 위 `maskW × maskH` 만 잘라 쓰면 된다. 화면이 클릭
 * 좌표를 옮길 때도 같은 배율을 써야 하므로 순수 함수로 뺐다.
 */
export interface SegmentPlan {
  scale: number;
  /** 1024 상자 안에서 그림이 실제로 차지하는 크기 */
  fitWidth: number;
  fitHeight: number;
  /** 256 마스크 안에서 그림이 차지하는 크기 */
  maskWidth: number;
  maskHeight: number;
}

export function planSegment(width: number, height: number): SegmentPlan {
  const scale = MODEL_EDGE / Math.max(width, height);
  const fitWidth = Math.round(width * scale);
  const fitHeight = Math.round(height * scale);
  return {
    scale,
    fitWidth,
    fitHeight,
    maskWidth: (fitWidth / MODEL_EDGE) * MASK_EDGE,
    maskHeight: (fitHeight / MODEL_EDGE) * MASK_EDGE,
  };
}

/** 워커가 그림 하나에 대해 들고 있는 것. 클릭마다 다시 만들지 않는다. */
interface Prepared {
  bitmap: ImageBitmap;
  plan: SegmentPlan;
  embeddings: OrtTensor;
  positional: OrtTensor;
  decoder: OrtSession;
  runtime: OnnxRuntimeKind;
}

let prepared: Prepared | null = null;

export interface PrepareResult {
  width: number;
  height: number;
  runtime: OnnxRuntimeKind;
  /** 인코더가 실제로 걸린 초 */
  seconds: number;
}

/** 그림 하나를 훑어 임베딩을 만든다. 이것이 이 도구에서 유일하게 오래 걸리는 일이다. */
export async function prepareImage(
  file: Blob,
  onProgress?: (progress: SegmentProgress) => void,
): Promise<PrepareResult> {
  const { encoder, decoder, runtime } = await openSessions(onProgress);

  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file);
  } catch {
    throw new SegmentError("UNSUPPORTED_INPUT");
  }

  if (bitmap.width * bitmap.height > MAX_PIXELS) {
    bitmap.close();
    throw new SegmentError("TOO_LARGE");
  }

  const started = Date.now();
  onProgress?.({ stage: "encoding", ratio: 0 });
  const plan = planSegment(bitmap.width, bitmap.height);

  const canvas = new OffscreenCanvas(MODEL_EDGE, MODEL_EDGE);
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) throw new SegmentError("SEGMENT_FAILED");
  ctx.drawImage(bitmap, 0, 0, plan.fitWidth, plan.fitHeight);
  const { data } = ctx.getImageData(0, 0, MODEL_EDGE, MODEL_EDGE);

  const pixels = MODEL_EDGE * MODEL_EDGE;
  const input = new Float32Array(3 * pixels);
  for (let i = 0; i < pixels; i += 1) {
    for (let c = 0; c < 3; c += 1) {
      input[c * pixels + i] = (data[i * 4 + c] / 255 - MEAN[c]) / STD[c];
    }
  }

  const ort = await loadOrt();
  let results: Record<string, OrtTensor>;
  try {
    results = await encoder.run({
      pixel_values: new ort.Tensor("float32", input, [1, 3, MODEL_EDGE, MODEL_EDGE]),
    });
  } catch {
    bitmap.close();
    throw new SegmentError("SEGMENT_FAILED");
  }

  if (prepared) prepared.bitmap.close();
  prepared = {
    bitmap,
    plan,
    embeddings: results.image_embeddings,
    positional: results.image_positional_embeddings,
    decoder,
    runtime,
  };

  onProgress?.({ stage: "encoding", ratio: 1 });
  return {
    width: bitmap.width,
    height: bitmap.height,
    runtime,
    seconds: (Date.now() - started) / 1000,
  };
}

/** 마스크 하나. 미리보기는 이 작은 것을 늘려 그린다 — 클릭마다 전체 크기를 만들지 않는다. */
export interface Mask {
  /** MASK_EDGE × MASK_EDGE 중 그림이 차지하는 부분만. 0 또는 255. */
  data: Uint8ClampedArray<ArrayBuffer>;
  width: number;
  height: number;
  /** 모델이 매긴 확신도(0~1). 세 후보 중 고른 것의 점수다. */
  score: number;
}

/**
 * 클릭한 점들로 마스크를 만든다.
 *
 * SAM 은 후보를 **세 개** 낸다(부분 / 부분+ / 전체). 어느 것이 맞는지는 모델도 모르므로
 * 함께 나오는 iou 점수가 가장 높은 것을 고른다. 점을 더 찍을수록 후보들이 좁혀진다.
 */
export async function segment(points: Point[]): Promise<Mask> {
  if (!prepared) throw new SegmentError("SEGMENT_FAILED");
  if (points.length === 0) throw new SegmentError("SEGMENT_FAILED");

  const { plan, decoder } = prepared;
  const ort = await loadOrt();

  // 클릭 좌표는 **1024 상자 기준**으로 옮겨서 준다
  const coords = new Float32Array(points.length * 2);
  const labels = new BigInt64Array(points.length);
  points.forEach((point, index) => {
    coords[index * 2] = point.x * plan.scale;
    coords[index * 2 + 1] = point.y * plan.scale;
    // BigInt 리터럴(1n)은 tsconfig target 이 낮아 못 쓴다 — BigInt() 로 만든다
    labels[index] = BigInt(point.include ? 1 : 0);
  });

  let results: Record<string, OrtTensor>;
  try {
    results = await decoder.run({
      image_embeddings: prepared.embeddings,
      image_positional_embeddings: prepared.positional,
      input_points: new ort.Tensor("float32", coords, [1, 1, points.length, 2]),
      input_labels: new ort.Tensor("int64", labels, [1, 1, points.length]),
    });
  } catch {
    throw new SegmentError("SEGMENT_FAILED");
  }

  const scores = results.iou_scores.data;
  let best = 0;
  for (let i = 1; i < scores.length; i += 1) {
    if (scores[i] > scores[best]) best = i;
  }

  const masks = results.pred_masks.data;
  const plane = MASK_EDGE * MASK_EDGE;
  const width = Math.round(plan.maskWidth);
  const height = Math.round(plan.maskHeight);
  const out = new Uint8ClampedArray(new ArrayBuffer(width * height * 4));
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      // SAM 이 내는 것은 로짓이다. 0 이 경계다.
      const value = masks[best * plane + y * MASK_EDGE + x] > 0 ? 255 : 0;
      const at = (y * width + x) * 4;
      out[at] = value;
      out[at + 1] = value;
      out[at + 2] = value;
      out[at + 3] = 255;
    }
  }

  return { data: out, width, height, score: scores[best] };
}

export interface CutoutResult {
  blob: Blob;
  width: number;
  height: number;
  /** 남긴 화소의 비율. 0 에 가까우면 아무것도 못 잡은 것이다. */
  coverage: number;
}

/** 고른 마스크를 원본 크기로 되돌려 오려 낸다. 내려받기를 누를 때만 부른다. */
export async function cutout(points: Point[], background: CutoutBackground): Promise<CutoutResult> {
  if (!prepared) throw new SegmentError("SEGMENT_FAILED");
  const mask = await segment(points);
  const { bitmap } = prepared;
  const { width, height } = bitmap;

  // 작은 마스크를 캔버스로 늘린다 — 브라우저가 보간해 주므로 경계가 계단지지 않는다.
  const small = new OffscreenCanvas(mask.width, mask.height);
  const smallCtx = small.getContext("2d");
  if (!smallCtx) throw new SegmentError("SEGMENT_FAILED");
  smallCtx.putImageData(new ImageData(mask.data, mask.width, mask.height), 0, 0);

  const canvas = new OffscreenCanvas(width, height);
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) throw new SegmentError("SEGMENT_FAILED");
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(small, 0, 0, width, height);
  const scaled = ctx.getImageData(0, 0, width, height).data;

  ctx.clearRect(0, 0, width, height);
  ctx.drawImage(bitmap, 0, 0);
  const image = ctx.getImageData(0, 0, width, height);
  const pixels = image.data;

  const fill = background === "transparent" ? null : BACKGROUND_RGB[background];
  let kept = 0;
  for (let i = 0; i < scaled.length; i += 4) {
    const alpha = scaled[i];
    if (alpha > 127) kept += 1;
    if (fill) {
      const ratio = alpha / 255;
      pixels[i] = pixels[i] * ratio + fill[0] * (1 - ratio);
      pixels[i + 1] = pixels[i + 1] * ratio + fill[1] * (1 - ratio);
      pixels[i + 2] = pixels[i + 2] * ratio + fill[2] * (1 - ratio);
      pixels[i + 3] = 255;
    } else {
      pixels[i + 3] = alpha;
    }
  }
  ctx.putImageData(image, 0, 0);

  const blob = await canvas.convertToBlob({ type: "image/png" });
  if (blob.type !== "image/png") throw new SegmentError("SEGMENT_FAILED");

  return { blob, width, height, coverage: kept / (width * height) };
}
