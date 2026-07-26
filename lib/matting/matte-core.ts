/**
 * 배경 제거 — U²-Net 을 브라우저 안에서 돌린다.
 *
 * Tier 2 의 첫 도구다. Tier 1 과 다른 점은 **모델을 받아야 시작한다**는 것뿐이고,
 * 규칙은 그대로다. 여기서 지킨 것을 적어 둔다.
 *
 * 1. **라이선스를 먼저 봤다**(규칙 6). 이 바닥에서 가장 유명한 `briaai/RMBG-1.4` 는
 *    모델 카드가 직접 "Commercial use is subject to a commercial agreement with BRIA"
 *    라고 적은 **비상업** 라이선스다 → 채택하지 않는다. MODNet 도 CC BY-NC-SA 다.
 *    U²-Net 은 **Apache-2.0** 이고, 여기서 쓰는 ONNX 는 rembg 가 재배포한 공식
 *    체크포인트를 HF 에 다시 올린 것이다(`base_model: xuebinqin/U-2-Net`).
 * 2. **무거운 자산은 Vercel 에서 서빙하지 않는다**(규칙 5). 모델은 HF CDN, 엔진은
 *    jsDelivr. `onnxruntime-web` 을 npm 의존성으로 두지 **않는** 이유가 여기 있다 —
 *    이 패키지의 기본 export 는 wasm 을 base64 로 품은 `*.bundle.min.mjs` 라서
 *    import 하는 순간 20MB 가 우리 번들로 들어온다. CDN 에서 받으면 그 일이 일어날
 *    수 없다.
 * 3. **누르기 전엔 아무것도 안 받는다**(규칙 2). 엔진도 모델도 실행 시점에 받는다.
 * 4. **COOP/COEP 를 켜지 않는다**(규칙 4) → `SharedArrayBuffer` 가 없다 →
 *    `numThreads = 1`. 명시하지 않으면 ORT 가 스레드를 띄우려다 실패한다.
 *
 * window / document 를 참조하지 않는다 (워커에서 돈다).
 */

/** 잰 것은 브라우저가 실제로 받은 전송량이다(brotli). 화면에 그대로 적는다. */
export const ENGINE_BYTES = 5_176_105;

export type MatteModel = "fast" | "fine";

export const MATTE_MODELS: MatteModel[] = ["fast", "fine"];

export const MODEL_BYTES: Record<MatteModel, number> = {
  fast: 4_574_861,
  fine: 175_997_641,
};

/**
 * 같은 저장소의 두 체크포인트. `u2netp` 는 U²-Net 의 소형판이라 40배 작고 그만큼
 * 윤곽이 거칠다 — 어느 쪽이 어떤지는 화면에서 미리 말한다.
 */
const MODEL_URL: Record<MatteModel, string> = {
  fast: "https://huggingface.co/Heliosoph/u2net-onnx/resolve/main/u2netp.onnx",
  fine: "https://huggingface.co/Heliosoph/u2net-onnx/resolve/main/u2net.onnx",
};

const ORT_VERSION = "1.27.0";
const ORT_DIST = `https://cdn.jsdelivr.net/npm/onnxruntime-web@${ORT_VERSION}/dist/`;

/** U²-Net 이 보는 크기. 모델이 고정으로 갖고 있는 값이라 바꿀 수 없다. */
export const MODEL_EDGE = 320;

/** 원본 정규화 값 — U²-Net 학습 때 쓴 것과 같아야 한다. */
const MEAN = [0.485, 0.456, 0.406];
const STD = [0.229, 0.224, 0.225];

/** 결과 배경을 무엇으로 채울까. 투명은 PNG 로만 의미가 있다. */
export const MATTE_BACKGROUNDS = ["transparent", "white", "black"] as const;
export type MatteBackground = (typeof MATTE_BACKGROUNDS)[number];

const BACKGROUND_RGB: Record<Exclude<MatteBackground, "transparent">, [number, number, number]> = {
  white: [255, 255, 255],
  black: [0, 0, 0],
};

export type MatteStage = "engine" | "model" | "matting";

export interface MatteProgress {
  stage: MatteStage;
  /** 0~1 */
  ratio: number;
}

export class MatteError extends Error {
  constructor(message: "ENGINE_FAILED" | "MODEL_FAILED" | "UNSUPPORTED_INPUT" | "MATTE_FAILED") {
    super(message);
    this.name = "MatteError";
  }
}

/* ── onnxruntime-web 타입 ─────────────────────────────────────────────
 * npm 의존성이 아니라 CDN 에서 오므로 타입도 없다. tesseract.js 때와 같이
 * **우리가 쓰는 만큼만** 좁혀 적는다. */

interface OrtTensor {
  data: Float32Array;
  dims: readonly number[];
}

interface OrtSession {
  inputNames: readonly string[];
  outputNames: readonly string[];
  run(feeds: Record<string, OrtTensor>): Promise<Record<string, OrtTensor>>;
}

interface OrtModule {
  env: { wasm: { wasmPaths: string; numThreads: number; proxy: boolean } };
  Tensor: new (type: "float32", data: Float32Array, dims: number[]) => OrtTensor;
  InferenceSession: {
    create(model: ArrayBuffer, options?: Record<string, unknown>): Promise<OrtSession>;
  };
}

let ortPromise: Promise<OrtModule> | null = null;

async function loadOrt(): Promise<OrtModule> {
  if (!ortPromise) {
    ortPromise = (async () => {
      // URL 을 변수로 둔다 — 상수 문자열이면 번들러가 이걸 우리 번들로 끌어온다.
      const url = `${ORT_DIST}ort.webgpu.min.mjs`;
      const loaded = (await import(/* webpackIgnore: true */ /* @vite-ignore */ url)) as {
        default?: OrtModule;
      } & OrtModule;
      const ort = loaded.default ?? loaded;
      ort.env.wasm.wasmPaths = ORT_DIST;
      // 규칙 4: COOP/COEP 를 켜지 않으므로 SharedArrayBuffer 가 없다
      ort.env.wasm.numThreads = 1;
      ort.env.wasm.proxy = false;
      return ort;
    })().catch((error) => {
      ortPromise = null;
      throw error;
    });
  }
  return ortPromise;
}

export type MatteRuntime = "webgpu" | "wasm";

/**
 * 세션은 모델마다 하나만 만든다 — 두 번째 사진이 즉시 시작하는 이유다.
 *
 * 실행기를 **세션에 붙여** 들고 다닌다. 전역 변수 하나에 담아 두면, 작은 모델이
 * WebGPU 로 열린 뒤 정밀 모델이 wasm 으로 떨어지는 순간 작은 모델의 표시까지
 * "CPU" 로 바뀐다. 화면에 적는 값이 실제와 어긋나는 것이 이 저장소에서 가장 하면
 * 안 되는 일이다.
 */
const sessions = new Map<MatteModel, Promise<{ session: OrtSession; runtime: MatteRuntime }>>();

async function fetchModel(model: MatteModel, onProgress?: (ratio: number) => void) {
  const response = await fetch(MODEL_URL[model]);
  if (!response.ok || !response.body) throw new MatteError("MODEL_FAILED");

  // Content-Length 를 못 받는 경우가 있어 실측 크기를 분모로 쓴다.
  const total = Number(response.headers.get("content-length")) || MODEL_BYTES[model];
  const reader = response.body.getReader();
  const chunks: Uint8Array[] = [];
  let received = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
    received += value.byteLength;
    onProgress?.(Math.min(1, received / total));
  }

  const bytes = new Uint8Array(received);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return bytes.buffer;
}

async function openSession(
  model: MatteModel,
  onProgress?: (progress: MatteProgress) => void,
): Promise<{ session: OrtSession; runtime: MatteRuntime }> {
  const existing = sessions.get(model);
  if (existing) return existing;

  const created = (async () => {
    let ort: OrtModule;
    try {
      onProgress?.({ stage: "engine", ratio: 0 });
      ort = await loadOrt();
      onProgress?.({ stage: "engine", ratio: 1 });
    } catch {
      throw new MatteError("ENGINE_FAILED");
    }

    const buffer = await fetchModel(model, (ratio) => onProgress?.({ stage: "model", ratio }));

    // WebGPU 로 먼저 시도하고, 안 되면 wasm 으로 내려간다. 어느 쪽으로 갔는지는
    // 숨기지 않는다 — 3단 폴백의 두 번째 칸이고, 속도가 눈에 띄게 다르다.
    try {
      const session = await ort.InferenceSession.create(buffer, {
        executionProviders: ["webgpu"],
        graphOptimizationLevel: "all",
      });
      return { session, runtime: "webgpu" as const };
    } catch {
      try {
        const session = await ort.InferenceSession.create(buffer, {
          executionProviders: ["wasm"],
          graphOptimizationLevel: "all",
        });
        return { session, runtime: "wasm" as const };
      } catch {
        throw new MatteError("MODEL_FAILED");
      }
    }
  })().catch((error) => {
    sessions.delete(model);
    throw error;
  });

  sessions.set(model, created);
  return created;
}

/**
 * 320×320 으로 줄여 NCHW float32 로 만든다.
 *
 * 원본 비율을 지키지 않고 그냥 늘린다 — U²-Net 학습이 그렇게 되어 있고, 마스크를
 * 되돌릴 때 같은 방식으로 늘리므로 왜곡이 상쇄된다.
 */
function preprocess(bitmap: ImageBitmap): Float32Array {
  const canvas = new OffscreenCanvas(MODEL_EDGE, MODEL_EDGE);
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) throw new MatteError("MATTE_FAILED");
  ctx.drawImage(bitmap, 0, 0, MODEL_EDGE, MODEL_EDGE);
  const { data } = ctx.getImageData(0, 0, MODEL_EDGE, MODEL_EDGE);

  // rembg 가 255 가 아니라 **실제 최댓값**으로 나눈다. 어두운 사진에서 결과가 달라진다.
  let max = 0;
  for (let i = 0; i < data.length; i += 4) {
    if (data[i] > max) max = data[i];
    if (data[i + 1] > max) max = data[i + 1];
    if (data[i + 2] > max) max = data[i + 2];
  }
  if (max === 0) max = 255;

  const pixels = MODEL_EDGE * MODEL_EDGE;
  const input = new Float32Array(3 * pixels);
  for (let i = 0; i < pixels; i += 1) {
    for (let c = 0; c < 3; c += 1) {
      input[c * pixels + i] = (data[i * 4 + c] / max - MEAN[c]) / STD[c];
    }
  }
  return input;
}

/** 모델이 낸 값은 정해진 범위가 없다 — 0~1 로 펴야 알파로 쓸 수 있다. */
function normalizeMask(raw: Float32Array): Uint8ClampedArray<ArrayBuffer> {
  let min = Infinity;
  let max = -Infinity;
  for (const value of raw) {
    if (value < min) min = value;
    if (value > max) max = value;
  }
  const span = max - min || 1;

  // ArrayBuffer 를 명시해서 만든다 — 그냥 길이로 만들면 타입이 SharedArrayBuffer 까지
  // 열려 있어 ImageData 가 받지 않는다.
  const mask = new Uint8ClampedArray(new ArrayBuffer(raw.length * 4));
  for (let i = 0; i < raw.length; i += 1) {
    const alpha = ((raw[i] - min) / span) * 255;
    mask[i * 4] = alpha;
    mask[i * 4 + 1] = alpha;
    mask[i * 4 + 2] = alpha;
    mask[i * 4 + 3] = 255;
  }
  return mask;
}

export interface MatteOptions {
  model: MatteModel;
  background: MatteBackground;
}

export interface MatteResult {
  blob: Blob;
  width: number;
  height: number;
  /** 실제로 돌아간 실행기. 화면에 적는다. */
  runtime: MatteRuntime;
  /** 전경으로 판정된 화소의 비율(0~1). 0 에 가까우면 아무것도 못 찾았다는 뜻이다. */
  coverage: number;
}

export async function removeBackground(
  file: Blob,
  options: MatteOptions,
  onProgress?: (progress: MatteProgress) => void,
): Promise<MatteResult> {
  const { session, runtime } = await openSession(options.model, onProgress);

  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file);
  } catch {
    throw new MatteError("UNSUPPORTED_INPUT");
  }

  try {
    onProgress?.({ stage: "matting", ratio: 0.1 });
    const ort = await loadOrt();
    const input = new ort.Tensor("float32", preprocess(bitmap), [1, 3, MODEL_EDGE, MODEL_EDGE]);

    let output: Float32Array;
    try {
      const results = await session.run({ [session.inputNames[0]]: input });
      // U²-Net 은 7개를 낸다(d0~d6). 첫 번째가 최종 예측이고 나머지는 학습용 보조 출력이다.
      output = results[session.outputNames[0]].data;
    } catch {
      throw new MatteError("MATTE_FAILED");
    }
    onProgress?.({ stage: "matting", ratio: 0.8 });

    const { width, height } = bitmap;

    // 마스크를 원본 크기로 되돌린다. 캔버스로 늘리면 브라우저가 보간해 주므로
    // 경계가 계단지지 않는다.
    const small = new OffscreenCanvas(MODEL_EDGE, MODEL_EDGE);
    const smallCtx = small.getContext("2d");
    if (!smallCtx) throw new MatteError("MATTE_FAILED");
    smallCtx.putImageData(
      new ImageData(normalizeMask(output), MODEL_EDGE, MODEL_EDGE),
      0,
      0,
    );

    const canvas = new OffscreenCanvas(width, height);
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) throw new MatteError("MATTE_FAILED");
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(small, 0, 0, width, height);
    const mask = ctx.getImageData(0, 0, width, height).data;

    ctx.clearRect(0, 0, width, height);
    ctx.drawImage(bitmap, 0, 0);
    const image = ctx.getImageData(0, 0, width, height);
    const pixels = image.data;

    const fill = options.background === "transparent" ? null : BACKGROUND_RGB[options.background];
    let opaque = 0;
    for (let i = 0; i < mask.length; i += 4) {
      const alpha = mask[i];
      if (alpha > 127) opaque += 1;
      if (fill) {
        // 배경색 위에 올린다. 알파를 남기면 JPEG 로 저장할 때 검게 변한다.
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
    // 규칙 3 — convertToBlob 은 못 만드는 형식에 조용히 PNG 를 뱉는다. 여기선 PNG 를
    // 원했으므로 통과해야 정상이고, 아니면 알파가 사라진 것이다.
    if (blob.type !== "image/png") throw new MatteError("MATTE_FAILED");

    onProgress?.({ stage: "matting", ratio: 1 });
    return {
      blob,
      width,
      height,
      runtime,
      coverage: opaque / (width * height),
    };
  } finally {
    bitmap.close();
  }
}
