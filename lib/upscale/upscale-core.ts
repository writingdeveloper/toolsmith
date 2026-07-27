/**
 * 이미지 업스케일 — Real-ESRGAN(realesr-general-x4v3)을 브라우저 안에서 돌린다.
 *
 * **모델 선택은 속도로 갈렸다.** 처음 본 것은 Swin2SR(Apache-2.0, ×4)인데, 실측 결과
 * CPU 에서 128×128 타일 하나에 9.7초였다 — 512×512 사진이면 160초다.
 * `realesr-general-x4v3` 은 같은 기계에서 512×512 에 16.5초 — **화소당 60배 빠르다.**
 * SRVGGNetCompact 라 층이 얕기 때문이고, 그래서 CPU 폴백이 실제로 쓸 만하다.
 *
 * WebGPU 로도 구제되지 않는다. 실측(RTX 40 노트북)에서 GPU 는 **약 3배** 빠를 뿐이라
 * Swin2SR 은 그래픽카드가 있어도 512×512 에 50초대다. 이쪽은 GPU 에서 4.8초다.
 *
 * 라이선스: **BSD-3-Clause**(Real-ESRGAN 상속, © Xintao Wang). 쓰는 ONNX 는 공식
 * v0.2.5.0 릴리스의 `.pth` 를 sha256 까지 적어 두고 변환한 재배포본이다.
 *
 * window / document 를 참조하지 않는다.
 */

import {
  createSession,
  fetchModel,
  loadOrt,
  type OnnxRuntimeKind,
  type OrtSession,
} from "@/lib/onnx/runtime";

export { ENGINE_BYTES } from "@/lib/onnx/runtime";

const MODEL_URL =
  "https://huggingface.co/CoderViking/realesr-general-x4v3-onnx/resolve/main/realesr-general-x4v3.onnx";

export const MODEL_BYTES = 4_866_417;

/** 모델이 고정으로 갖는 배율. ×2 는 이 결과를 절반으로 줄여서 만든다. */
export const MODEL_SCALE = 4;

export const SCALES = [2, 4] as const;
export type Scale = (typeof SCALES)[number];

/**
 * 한 번에 모델에 넣는 조각의 **알맹이** 크기. 여기에 사방으로 `TILE_PAD` 를 덧대
 * 넣고, 결과에서 알맹이만 잘라 붙인다.
 *
 * 이 그물망은 완전 합성곱(fully convolutional)이라 가장자리에서만 값이 틀어진다.
 * 덧댄 만큼을 버리면 **이음매가 생기지 않는다** — 흐리게 섞어 가릴 필요가 없다.
 * 덧대는 폭은 이 신경망의 수용영역(3×3 × 16층 ≈ 33px)보다 커야 한다.
 */
const TILE_CORE = 384;
const TILE_PAD = 32;

/**
 * 한 번에 받는 원본 화소 수 상한.
 *
 * ×4 는 화소가 16배가 된다 — 100만 화소를 넣으면 1600만 화소가 나오고, 그것만으로
 * RGBA 64MB 다. 시간도 실측으로 CPU 100만 화소에 1분 남짓이다. 넘으면 **시작하지 않고
 * 그렇다고 말한다** — 브라우저를 몇 분 멈춰 놓고 결과를 못 내는 것이 가장 나쁘다.
 */
export const MAX_PIXELS = 1_000_000;

/** 실측 처리 속도(원본 화소당 초). CPU wasm 단일 스레드, 2026-07-26. */
export const CPU_SECONDS_PER_PIXEL = 16.5 / (512 * 512);

/** 누르기 전에 "얼마나 걸리는가" 를 말하기 위한 어림. 덧댄 몫까지 센다. */
export function estimateSeconds(width: number, height: number): number {
  const overhead = ((TILE_CORE + TILE_PAD * 2) / TILE_CORE) ** 2;
  return width * height * overhead * CPU_SECONDS_PER_PIXEL;
}

export type UpscaleStage = "engine" | "model" | "upscaling";

export interface UpscaleProgress {
  stage: UpscaleStage;
  /** 0~1 */
  ratio: number;
  /** 몇 번째 조각인가 (stage === "upscaling" 일 때만) */
  tile?: number;
  tiles?: number;
}

export class UpscaleError extends Error {
  constructor(
    message: "ENGINE_FAILED" | "MODEL_FAILED" | "UNSUPPORTED_INPUT" | "TOO_LARGE" | "UPSCALE_FAILED",
  ) {
    super(message);
    this.name = "UpscaleError";
  }
}

let sessionPromise: Promise<{ session: OrtSession; runtime: OnnxRuntimeKind }> | null = null;

async function openSession(onProgress?: (progress: UpscaleProgress) => void) {
  if (!sessionPromise) {
    sessionPromise = (async () => {
      try {
        onProgress?.({ stage: "engine", ratio: 0 });
        await loadOrt();
        onProgress?.({ stage: "engine", ratio: 1 });
      } catch {
        throw new UpscaleError("ENGINE_FAILED");
      }
      let buffer: ArrayBuffer;
      try {
        buffer = await fetchModel(MODEL_URL, MODEL_BYTES, (ratio) =>
          onProgress?.({ stage: "model", ratio }),
        );
      } catch {
        throw new UpscaleError("MODEL_FAILED");
      }
      try {
        return await createSession(buffer);
      } catch {
        throw new UpscaleError("MODEL_FAILED");
      }
    })().catch((error) => {
      sessionPromise = null;
      throw error;
    });
  }
  return sessionPromise;
}

/** 조각 하나의 좌표. 알맹이와, 모델에 실제로 넣을 (덧댄) 영역을 함께 갖는다. */
interface Tile {
  coreX: number;
  coreY: number;
  coreW: number;
  coreH: number;
  padX: number;
  padY: number;
  padW: number;
  padH: number;
}

/** 화면과 워커가 같은 값을 보게 하기 위해 조각 나누기도 순수 함수로 둔다. */
export function planTiles(width: number, height: number): Tile[] {
  const tiles: Tile[] = [];
  for (let y = 0; y < height; y += TILE_CORE) {
    for (let x = 0; x < width; x += TILE_CORE) {
      const coreW = Math.min(TILE_CORE, width - x);
      const coreH = Math.min(TILE_CORE, height - y);
      const padX = Math.max(0, x - TILE_PAD);
      const padY = Math.max(0, y - TILE_PAD);
      tiles.push({
        coreX: x,
        coreY: y,
        coreW,
        coreH,
        padX,
        padY,
        padW: Math.min(width, x + coreW + TILE_PAD) - padX,
        padH: Math.min(height, y + coreH + TILE_PAD) - padY,
      });
    }
  }
  return tiles;
}

export interface UpscaleOptions {
  scale: Scale;
  format: string;
  quality: number;
}

export interface UpscaleResult {
  blob: Blob;
  width: number;
  height: number;
  sourceWidth: number;
  sourceHeight: number;
  runtime: OnnxRuntimeKind;
  /** 실제로 걸린 초. 어림과 얼마나 달랐는지 화면에서 볼 수 있어야 한다. */
  seconds: number;
}

export async function upscaleImage(
  file: Blob,
  options: UpscaleOptions,
  onProgress?: (progress: UpscaleProgress) => void,
): Promise<UpscaleResult> {
  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file);
  } catch {
    throw new UpscaleError("UNSUPPORTED_INPUT");
  }

  try {
    if (bitmap.width * bitmap.height > MAX_PIXELS) throw new UpscaleError("TOO_LARGE");

    const { session, runtime } = await openSession(onProgress);
    const ort = await loadOrt();
    const started = Date.now();

    const source = new OffscreenCanvas(bitmap.width, bitmap.height);
    const sourceCtx = source.getContext("2d", { willReadFrequently: true });
    if (!sourceCtx) throw new UpscaleError("UPSCALE_FAILED");
    sourceCtx.drawImage(bitmap, 0, 0);

    const outWidth = bitmap.width * MODEL_SCALE;
    const outHeight = bitmap.height * MODEL_SCALE;
    const target = new OffscreenCanvas(outWidth, outHeight);
    const targetCtx = target.getContext("2d");
    if (!targetCtx) throw new UpscaleError("UPSCALE_FAILED");

    const tiles = planTiles(bitmap.width, bitmap.height);
    for (let index = 0; index < tiles.length; index += 1) {
      const tile = tiles[index];
      onProgress?.({
        stage: "upscaling",
        ratio: index / tiles.length,
        tile: index + 1,
        tiles: tiles.length,
      });

      const { data } = sourceCtx.getImageData(tile.padX, tile.padY, tile.padW, tile.padH);
      const pixels = tile.padW * tile.padH;
      const input = new Float32Array(3 * pixels);
      for (let i = 0; i < pixels; i += 1) {
        input[i] = data[i * 4] / 255;
        input[pixels + i] = data[i * 4 + 1] / 255;
        input[pixels * 2 + i] = data[i * 4 + 2] / 255;
      }

      let output: Float32Array;
      try {
        const results = await session.run({
          [session.inputNames[0]]: new ort.Tensor("float32", input, [1, 3, tile.padH, tile.padW]),
        });
        output = results[session.outputNames[0]].data;
      } catch {
        throw new UpscaleError("UPSCALE_FAILED");
      }

      // 덧댄 영역까지 4배로 나왔다. 그 안에서 알맹이에 해당하는 부분만 오려 낸다.
      const bigW = tile.padW * MODEL_SCALE;
      const bigH = tile.padH * MODEL_SCALE;
      const offsetX = (tile.coreX - tile.padX) * MODEL_SCALE;
      const offsetY = (tile.coreY - tile.padY) * MODEL_SCALE;
      const cropW = tile.coreW * MODEL_SCALE;
      const cropH = tile.coreH * MODEL_SCALE;
      const plane = bigW * bigH;

      const crop = new Uint8ClampedArray(new ArrayBuffer(cropW * cropH * 4));
      for (let y = 0; y < cropH; y += 1) {
        for (let x = 0; x < cropW; x += 1) {
          const from = (y + offsetY) * bigW + (x + offsetX);
          const to = (y * cropW + x) * 4;
          // 모델이 [0,1] 밖으로도 낸다(그래프 안에서 자르지 않는다) — 여기서 자른다.
          crop[to] = output[from] * 255;
          crop[to + 1] = output[plane + from] * 255;
          crop[to + 2] = output[plane * 2 + from] * 255;
          crop[to + 3] = 255;
        }
      }
      targetCtx.putImageData(
        new ImageData(crop, cropW, cropH),
        tile.coreX * MODEL_SCALE,
        tile.coreY * MODEL_SCALE,
      );
    }

    // ×2 는 ×4 를 절반으로 줄여 만든다. 바로 ×2 로 키우는 것보다 결과가 낫다 —
    // 모델이 만들어 낸 세부가 축소되면서 정돈되기 때문이다. FAQ 에 적었다.
    let finished: OffscreenCanvas = target;
    if (options.scale !== MODEL_SCALE) {
      const half = new OffscreenCanvas(
        Math.round((outWidth * options.scale) / MODEL_SCALE),
        Math.round((outHeight * options.scale) / MODEL_SCALE),
      );
      const halfCtx = half.getContext("2d");
      if (!halfCtx) throw new UpscaleError("UPSCALE_FAILED");
      halfCtx.imageSmoothingQuality = "high";
      halfCtx.drawImage(target, 0, 0, half.width, half.height);
      finished = half;
    }

    const blob = await finished.convertToBlob({ type: options.format, quality: options.quality });
    // 규칙 3 — convertToBlob 은 못 만드는 형식에 조용히 PNG 를 뱉는다
    if (blob.type !== options.format) throw new UpscaleError("UPSCALE_FAILED");

    onProgress?.({ stage: "upscaling", ratio: 1, tile: tiles.length, tiles: tiles.length });
    return {
      blob,
      width: finished.width,
      height: finished.height,
      sourceWidth: bitmap.width,
      sourceHeight: bitmap.height,
      runtime,
      seconds: (Date.now() - started) / 1000,
    };
  } finally {
    bitmap.close();
  }
}
