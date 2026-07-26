/**
 * 이미지 크기 조절과 비율 자르기.
 *
 * 계산을 **순수 함수 하나**(`planResize`)로 모은 이유가 있다. 화면은 누르기 전에
 * "1080 × 1080 이 나옵니다" 라고 말해야 하고 워커는 실제로 그 크기를 만들어야 하는데,
 * 두 곳에서 따로 계산하면 언젠가 어긋난다. GIF 의 `gif-timing` 과 같은 이유다.
 *
 * window / document 를 참조하지 않는다 (워커·메인 양쪽에서 쓰인다).
 */

import { decodeToBitmap, type OutputFormat } from "./convert-core";

/** 잘라 낼 비율. 가운데를 기준으로 가장 큰 사각형을 잡는다. */
export const CROP_RATIOS = ["none", "1:1", "4:5", "16:9", "3:2"] as const;
export type CropRatio = (typeof CROP_RATIOS)[number];

const RATIO: Record<Exclude<CropRatio, "none">, number> = {
  "1:1": 1,
  "4:5": 4 / 5,
  "16:9": 16 / 9,
  "3:2": 3 / 2,
};

export interface ResizeOptions {
  /** 결과의 너비(px). 0 이면 자르기만 하고 크기는 그대로 둔다. */
  width: number;
  crop: CropRatio;
  format: OutputFormat;
  quality: number;
}

export interface ResizePlan {
  /** 원본에서 잘라 낼 영역 */
  sx: number;
  sy: number;
  sw: number;
  sh: number;
  /** 결과 크기 */
  width: number;
  height: number;
}

/**
 * 무엇을 잘라 어느 크기로 낼지 정한다. 화면과 워커가 **같은 함수**를 부른다.
 *
 * 비율을 고르면 원본 안에서 **그 비율의 가장 큰 사각형**을 가운데로 잡는다.
 * 늘리지는 않는다 — 요청한 너비가 잘라 낸 영역보다 크면 그대로 둔다. 없는 화소를
 * 지어내면 흐려지기만 하고, 사용자는 커진 숫자를 보고 화질이 좋아진 줄 안다.
 */
export function planResize(
  sourceWidth: number,
  sourceHeight: number,
  options: Pick<ResizeOptions, "width" | "crop">,
): ResizePlan {
  let sw = sourceWidth;
  let sh = sourceHeight;

  if (options.crop !== "none") {
    const target = RATIO[options.crop];
    if (sourceWidth / sourceHeight > target) {
      // 원본이 더 넓다 → 좌우를 잘라낸다
      sw = Math.round(sourceHeight * target);
      sh = sourceHeight;
    } else {
      sw = sourceWidth;
      sh = Math.round(sourceWidth / target);
    }
  }

  const sx = Math.round((sourceWidth - sw) / 2);
  const sy = Math.round((sourceHeight - sh) / 2);

  // 요청 너비가 0 이거나 잘라 낸 것보다 크면 확대하지 않는다
  const width = options.width > 0 ? Math.min(options.width, sw) : sw;
  const height = Math.max(1, Math.round((width / sw) * sh));

  return { sx, sy, sw, sh, width: Math.max(1, width), height };
}

export interface ResizeResult {
  blob: Blob;
  width: number;
  height: number;
  /** 원본 크기 — "무엇이 어떻게 바뀌었나" 를 화면에 적기 위한 값 */
  sourceWidth: number;
  sourceHeight: number;
  /** 비율을 맞추느라 실제로 잘라 냈는가 */
  cropped: boolean;
}

export async function resizeImage(file: Blob, options: ResizeOptions): Promise<ResizeResult> {
  const bitmap = await decodeToBitmap(file);
  const plan = planResize(bitmap.width, bitmap.height, options);

  try {
    const canvas = new OffscreenCanvas(plan.width, plan.height);
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("NO_CANVAS");
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(bitmap, plan.sx, plan.sy, plan.sw, plan.sh, 0, 0, plan.width, plan.height);

    const blob = await canvas.convertToBlob({ type: options.format, quality: options.quality });
    // convertToBlob 은 못 만드는 형식에 조용히 PNG 를 뱉는다 — 규칙 3
    if (blob.type !== options.format) throw new Error("UNSUPPORTED_OUTPUT");

    return {
      blob,
      width: plan.width,
      height: plan.height,
      sourceWidth: bitmap.width,
      sourceHeight: bitmap.height,
      cropped: plan.sw !== bitmap.width || plan.sh !== bitmap.height,
    };
  } finally {
    bitmap.close();
  }
}
