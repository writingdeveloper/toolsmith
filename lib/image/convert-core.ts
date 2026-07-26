/**
 * 이미지 디코드/인코드 핵심. Worker 와 메인 스레드 양쪽에서 그대로 쓰인다.
 * 따라서 window / document 를 절대 참조하지 않는다.
 */

export const OUTPUT_FORMATS = ["image/jpeg", "image/png", "image/webp", "image/avif"] as const;
export type OutputFormat = (typeof OUTPUT_FORMATS)[number];

export const FORMAT_LABEL: Record<OutputFormat, string> = {
  "image/jpeg": "JPG",
  "image/png": "PNG",
  "image/webp": "WebP",
  "image/avif": "AVIF",
};

export const FORMAT_EXTENSION: Record<OutputFormat, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/avif": "avif",
};

/** PNG 는 무손실이라 품질 슬라이더가 의미 없다. */
export const LOSSY_FORMATS: OutputFormat[] = ["image/jpeg", "image/webp", "image/avif"];

export interface ConvertOptions {
  format: OutputFormat;
  /** 0..1 — PNG 에서는 무시된다 */
  quality: number;
  /** 긴 변 최대 픽셀. 0 이면 원본 유지 */
  maxEdge: number;
}

export interface ConvertResult {
  blob: Blob;
  width: number;
  height: number;
}

export class UnsupportedInputError extends Error {
  constructor() {
    super("UNSUPPORTED_INPUT");
    this.name = "UnsupportedInputError";
  }
}

/**
 * 브라우저가 실제로 인코딩 가능한 포맷만 돌려준다.
 *
 * convertToBlob 은 지원하지 않는 type 을 받으면 예외를 던지지 않고 조용히 PNG 를
 * 뱉는다. 그래서 반환된 blob.type 을 대조해야 한다. 이걸 안 하면 "AVIF 로 변환됨"
 * 이라고 표시해놓고 실제로는 PNG 를 내려주는 거짓말을 하게 된다.
 */
export async function detectEncoders(): Promise<OutputFormat[]> {
  const canvas = new OffscreenCanvas(1, 1);
  const ctx = canvas.getContext("2d");
  if (!ctx) return [];
  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, 1, 1);

  const supported: OutputFormat[] = [];
  for (const format of OUTPUT_FORMATS) {
    try {
      const blob = await canvas.convertToBlob({ type: format, quality: 0.8 });
      if (blob.type === format) supported.push(format);
    } catch {
      // 미지원 — 조용히 건너뛴다
    }
  }
  return supported;
}

function isHeic(file: Blob & { name?: string }): boolean {
  const type = file.type.toLowerCase();
  if (type === "image/heic" || type === "image/heif") return true;
  const name = (file.name ?? "").toLowerCase();
  return name.endsWith(".heic") || name.endsWith(".heif");
}

/**
 * HEIC 는 Safari 만 네이티브로 읽는다. Chrome/Firefox 용으로 libheif 를 쓰되,
 * 실제로 HEIC 파일이 들어왔을 때만 지연 로드한다 (원칙 3번).
 */
async function decodeHeic(file: Blob): Promise<ImageBitmap> {
  const { default: libheif } = await import("libheif-js/wasm-bundle");
  const buffer = new Uint8Array(await file.arrayBuffer());
  const decoder = new libheif.HeifDecoder();
  const images = decoder.decode(buffer);
  if (!images || images.length === 0) throw new UnsupportedInputError();

  const image = images[0];
  const width = image.get_width();
  const height = image.get_height();

  const canvas = new OffscreenCanvas(width, height);
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new UnsupportedInputError();

  const imageData = ctx.createImageData(width, height);
  await new Promise<void>((resolve, reject) => {
    image.display(imageData, (result) => (result ? resolve() : reject(new UnsupportedInputError())));
  });
  ctx.putImageData(imageData, 0, 0);
  return canvas.transferToImageBitmap();
}

export async function decodeToBitmap(file: Blob): Promise<ImageBitmap> {
  // imageOrientation: EXIF 회전을 픽셀에 반영한다. 없으면 아이폰 사진이 눕는다.
  if (isHeic(file)) {
    // Safari 는 HEIC 를 네이티브로 읽는다. 되면 libheif 다운로드를 통째로 아낀다.
    try {
      return await createImageBitmap(file, { imageOrientation: "from-image" });
    } catch {
      return decodeHeic(file);
    }
  }
  try {
    return await createImageBitmap(file, { imageOrientation: "from-image" });
  } catch {
    throw new UnsupportedInputError();
  }
}

function fit(width: number, height: number, maxEdge: number): { width: number; height: number } {
  if (!maxEdge || (width <= maxEdge && height <= maxEdge)) return { width, height };
  const scale = maxEdge / Math.max(width, height);
  return {
    width: Math.max(1, Math.round(width * scale)),
    height: Math.max(1, Math.round(height * scale)),
  };
}

export async function encodeBitmap(bitmap: ImageBitmap, options: ConvertOptions): Promise<ConvertResult> {
  const { width, height } = fit(bitmap.width, bitmap.height, options.maxEdge);
  const canvas = new OffscreenCanvas(width, height);
  const opaque = options.format === "image/jpeg";
  const ctx = canvas.getContext("2d", { alpha: !opaque });
  if (!ctx) throw new UnsupportedInputError();

  // JPG 는 알파가 없다. 깔아주지 않으면 투명 영역이 검게 나온다.
  if (opaque) {
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, width, height);
  }
  ctx.drawImage(bitmap, 0, 0, width, height);

  const blob = await canvas.convertToBlob({ type: options.format, quality: options.quality });
  if (blob.type !== options.format) throw new UnsupportedInputError();
  return { blob, width, height };
}

export async function convertImage(file: Blob, options: ConvertOptions): Promise<ConvertResult> {
  const bitmap = await decodeToBitmap(file);
  try {
    return await encodeBitmap(bitmap, options);
  } finally {
    bitmap.close();
  }
}
