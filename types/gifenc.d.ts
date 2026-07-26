/**
 * gifenc(MIT)는 타입 선언을 함께 배포하지 않는다. 우리가 실제로 부르는 부분만 적는다.
 * 전체 API 는 node_modules/gifenc/src/index.js 에 있다.
 */
declare module "gifenc" {
  /** [r, g, b] 또는 [r, g, b, a] */
  export type Palette = number[][];

  export interface WriteFrameOptions {
    /** 이 프레임의 색표. 첫 프레임은 반드시 있어야 한다(전역 색표가 된다). */
    palette?: Palette;
    /** 밀리초. GIF 는 1/100초 단위라 내부에서 반올림된다. */
    delay?: number;
    /** -1 = 한 번, 0 = 무한 반복, >0 = 횟수 */
    repeat?: number;
    transparent?: boolean;
    transparentIndex?: number;
    colorDepth?: number;
    dispose?: number;
    first?: boolean;
  }

  export interface GifEncoderInstance {
    writeFrame(
      index: Uint8Array,
      width: number,
      height: number,
      options?: WriteFrameOptions,
    ): void;
    finish(): void;
    bytes(): Uint8Array;
    bytesView(): Uint8Array;
    reset(): void;
  }

  export function GIFEncoder(options?: {
    initialCapacity?: number;
    auto?: boolean;
  }): GifEncoderInstance;

  export function quantize(
    rgba: Uint8Array | Uint8ClampedArray,
    maxColors: number,
    options?: {
      format?: "rgb565" | "rgb444" | "rgba4444";
      oneBitAlpha?: boolean | number;
      clearAlpha?: boolean;
      clearAlphaColor?: number;
      clearAlphaThreshold?: number;
      useSqrt?: boolean;
    },
  ): Palette;

  export function applyPalette(
    rgba: Uint8Array | Uint8ClampedArray,
    palette: Palette,
    format?: "rgb565" | "rgb444" | "rgba4444",
  ): Uint8Array;
}
