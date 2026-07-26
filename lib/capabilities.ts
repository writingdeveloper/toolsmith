/**
 * 브라우저 능력 감지. 원칙 4번(3단 폴백: WebGPU → WASM → 명확한 미지원 안내)의 근거.
 * 조용한 실패를 만들지 않기 위해, 감지 결과는 항상 UI에 노출한다.
 */

export type Runtime = "webgpu" | "wasm" | "unsupported";

let webgpuCache: boolean | null = null;

export async function hasWebGPU(): Promise<boolean> {
  if (webgpuCache !== null) return webgpuCache;
  try {
    const gpu = (navigator as Navigator & { gpu?: { requestAdapter(): Promise<unknown> } }).gpu;
    if (!gpu) return (webgpuCache = false);
    const adapter = await gpu.requestAdapter();
    return (webgpuCache = adapter !== null);
  } catch {
    return (webgpuCache = false);
  }
}

/** ffmpeg.wasm 멀티스레드에 필요. COOP/COEP 헤더가 있어야 true. */
export function hasSharedArrayBuffer(): boolean {
  return typeof SharedArrayBuffer !== "undefined" && globalThis.crossOriginIsolated === true;
}

export function hasOffscreenCanvas(): boolean {
  return typeof OffscreenCanvas !== "undefined";
}

export function hasWorkers(): boolean {
  return typeof Worker !== "undefined";
}

/** 이미지 도구가 요구하는 최소 조건. */
export function canRunImageTools(): boolean {
  return hasOffscreenCanvas() && typeof createImageBitmap !== "undefined";
}
