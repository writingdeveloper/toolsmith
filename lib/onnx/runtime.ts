/**
 * ONNX Runtime Web 을 브라우저에서 여는 유일한 자리.
 *
 * 배경 제거(#17)가 세운 방식을 업스케일(#19)이 그대로 쓰면서 여기로 뽑았다.
 * 모델을 쓰는 다음 도구도 이 파일을 부른다.
 *
 * **`onnxruntime-web` 은 npm 의존성이 아니다.** 이 패키지의 기본 export 는
 * `*.bundle.min.mjs` 인데 wasm 을 base64 로 품고 있어서, import 하는 순간 20MB 가
 * 우리 번들에 들어와 Vercel 에서 나간다(규칙 5 위반). 외부 wasm 을 쓰는 변형을 고르려면
 * 번들러의 export condition 을 건드려야 하므로, **의존성에서 아예 빼고** jsDelivr 에서
 * 실행 시점에 받는다. 규칙을 문서가 아니라 구조가 지키게 한 것이다.
 *
 * 타입도 그래서 없다 — tesseract.js 때와 같이 **우리가 쓰는 만큼만** 좁혀 적는다.
 *
 * window / document 를 참조하지 않는다 (워커에서 돈다).
 */

const ORT_VERSION = "1.27.0";
const ORT_DIST = `https://cdn.jsdelivr.net/npm/onnxruntime-web@${ORT_VERSION}/dist/`;

/** 실측한 전송량(brotli): 글루 21KB + wasm 글루 16KB + jsep wasm 5.14MB. */
export const ENGINE_BYTES = 5_176_105;

export type OnnxRuntimeKind = "webgpu" | "wasm";

export interface OrtTensor {
  data: Float32Array;
  dims: readonly number[];
}

export interface OrtSession {
  inputNames: readonly string[];
  outputNames: readonly string[];
  run(feeds: Record<string, OrtTensor>): Promise<Record<string, OrtTensor>>;
}

export interface OrtModule {
  env: { wasm: { wasmPaths: string; numThreads: number; proxy: boolean } };
  Tensor: new (type: "float32", data: Float32Array, dims: number[]) => OrtTensor;
  InferenceSession: {
    create(model: ArrayBuffer, options?: Record<string, unknown>): Promise<OrtSession>;
  };
}

let ortPromise: Promise<OrtModule> | null = null;

export async function loadOrt(): Promise<OrtModule> {
  if (!ortPromise) {
    ortPromise = (async () => {
      // URL 을 변수로 둔다 — 상수 문자열이면 번들러가 이걸 우리 번들로 끌어온다.
      const url = `${ORT_DIST}ort.webgpu.min.mjs`;
      const loaded = (await import(/* webpackIgnore: true */ /* @vite-ignore */ url)) as {
        default?: OrtModule;
      } & OrtModule;
      const ort = loaded.default ?? loaded;
      ort.env.wasm.wasmPaths = ORT_DIST;
      // 규칙 4: COOP/COEP 를 켜지 않으므로 SharedArrayBuffer 가 없다.
      // 적지 않으면 ORT 가 스레드를 띄우려다 실패한다.
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

/**
 * 모델 파일을 받는다. 진행률을 위해 스트림을 직접 읽는다 — 100MB 대 모델에서
 * 아무 표시 없이 멈춰 있는 것처럼 보이면 사용자는 고장으로 읽는다.
 */
export async function fetchModel(
  url: string,
  expectedBytes: number,
  onProgress?: (ratio: number) => void,
): Promise<ArrayBuffer> {
  const response = await fetch(url);
  if (!response.ok || !response.body) throw new Error("MODEL_FAILED");

  const total = Number(response.headers.get("content-length")) || expectedBytes;
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

/**
 * WebGPU 로 먼저 열고, 안 되면 wasm 으로 내려간다(규칙 4 의 3단 폴백).
 *
 * **어느 쪽으로 갔는지를 세션과 함께 돌려준다.** 전역 변수 하나에 담아 두면 모델을
 * 두 개 쓰는 도구에서 표시가 어긋난다 — 한쪽이 wasm 으로 떨어지는 순간 다른 쪽의
 * 표시까지 바뀐다.
 */
export async function createSession(
  model: ArrayBuffer,
): Promise<{ session: OrtSession; runtime: OnnxRuntimeKind }> {
  const ort = await loadOrt();
  try {
    const session = await ort.InferenceSession.create(model, {
      executionProviders: ["webgpu"],
      graphOptimizationLevel: "all",
    });
    return { session, runtime: "webgpu" };
  } catch {
    const session = await ort.InferenceSession.create(model, {
      executionProviders: ["wasm"],
      graphOptimizationLevel: "all",
    });
    return { session, runtime: "wasm" };
  }
}
