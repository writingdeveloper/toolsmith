/**
 * 영상 → GIF. 오디오가 없어 이 저장소의 영상 파이프라인 중 가장 단순하다.
 *
 *   mp4box(demux) → VideoDecoder → OffscreenCanvas → gifenc(MIT)
 *
 * 프레임을 **모아 두지 않는다.** 480×270 짜리 400장을 ImageData 로 쥐고 있으면 200MB 다.
 * 디코더가 프레임을 내놓는 그 자리에서 색을 줄이고 GIF 스트림에 흘려 보낸다.
 *
 * window / document 를 참조하지 않는다 (워커에서 돈다).
 */

import { MediaError, readMp4 } from "./mp4-source";
import { MAX_GIF_FRAMES, gifTiming } from "./gif-timing";

export interface GifOptions {
  /** 요청 fps. 실제 값은 gifTiming() 이 1/100초에 맞춰 반올림한 값이다. */
  fps: number;
  /** 긴 변 상한(px). 0 이면 원본 크기 그대로 */
  maxEdge: number;
}

export interface GifResult {
  blob: Blob;
  before: number;
  after: number;
  width: number;
  height: number;
  /** 실제로 담긴 프레임 수 */
  frameCount: number;
  /** 실제 재생 fps (요청값이 아니다) */
  fps: number;
  durationSec: number;
  /** 프레임 상한에 걸려 뒷부분이 잘렸는가 */
  truncated: boolean;
}

function fit(width: number, height: number, maxEdge: number) {
  let w = width;
  let h = height;
  if (maxEdge && Math.max(w, h) > maxEdge) {
    const scale = maxEdge / Math.max(w, h);
    w = Math.round(w * scale);
    h = Math.round(h * scale);
  }
  return { width: Math.max(1, w), height: Math.max(1, h) };
}

export async function videoToGif(
  bytes: Uint8Array,
  options: GifOptions,
  onProgress?: (ratio: number) => void,
): Promise<GifResult> {
  const { video } = await readMp4(bytes);
  if (!video || video.samples.length === 0) throw new MediaError("NO_VIDEO_TRACK");

  const target = fit(video.width, video.height, options.maxEdge);
  const timing = gifTiming(options.fps);
  const stepMicros = 1_000_000 / timing.fps;

  const { GIFEncoder, quantize, applyPalette } = await import("gifenc");
  const gif = GIFEncoder();

  const canvas = new OffscreenCanvas(target.width, target.height);
  // 프레임마다 픽셀을 읽어 가므로 브라우저에 미리 알려 준다
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) throw new MediaError("ENCODE_FAILED");

  let written = 0;
  let truncated = false;
  let nextAt: number | null = null;
  let decoded = 0;
  let decodeError: unknown = null;
  let encodeError: unknown = null;

  const take = (frame: VideoFrame) => {
    ctx.drawImage(frame, 0, 0, target.width, target.height);
    const { data } = ctx.getImageData(0, 0, target.width, target.height);
    // 프레임마다 색표를 새로 뽑는다 — 장면이 바뀌어도 색이 무너지지 않는다
    const palette = quantize(data, 256, { format: "rgb565" });
    const index = applyPalette(data, palette, "rgb565");
    gif.writeFrame(index, target.width, target.height, {
      palette,
      delay: timing.delayMs,
      repeat: 0, // 무한 반복
    });
    written += 1;
  };

  const decoder = new VideoDecoder({
    output: (frame) => {
      try {
        if (written >= MAX_GIF_FRAMES) {
          truncated = true;
        } else if (nextAt === null || frame.timestamp >= nextAt) {
          take(frame);
          const base = nextAt === null ? frame.timestamp : nextAt;
          nextAt = base + stepMicros;
          // 원본이 목표 fps 보다 느리면 같은 프레임을 두 번 담지 않도록 앞으로 민다
          if (nextAt <= frame.timestamp) nextAt = frame.timestamp + stepMicros;
        }
      } catch (error) {
        encodeError = error;
      } finally {
        frame.close();
        decoded += 1;
        onProgress?.(Math.min(1, decoded / Math.max(1, video.samples.length)));
      }
    },
    error: (error) => {
      decodeError = error;
    },
  });

  decoder.configure({
    codec: video.codec,
    codedWidth: video.width,
    codedHeight: video.height,
    description: video.description,
  });

  for (const sample of video.samples) {
    if (decodeError || encodeError) break;
    decoder.decode(
      new EncodedVideoChunk({
        type: sample.key ? "key" : "delta",
        timestamp: sample.timestamp,
        duration: sample.duration,
        data: sample.data,
      }),
    );
    if (decoder.decodeQueueSize > 8) {
      await new Promise((resolve) => setTimeout(resolve, 0));
    }
  }

  await decoder.flush();
  decoder.close();

  if (decodeError) throw new MediaError("DECODE_FAILED");
  if (encodeError) throw new MediaError("ENCODE_FAILED");
  if (written === 0) throw new MediaError("DECODE_FAILED");

  gif.finish();
  const out = gif.bytes();

  return {
    blob: new Blob([out as BlobPart], { type: "image/gif" }),
    before: bytes.byteLength,
    after: out.byteLength,
    width: target.width,
    height: target.height,
    frameCount: written,
    fps: timing.fps,
    // 잘렸다면 남은 길이가 아니라 **실제로 담긴 길이**를 말해야 한다
    durationSec: (written * timing.delayMs) / 1000,
    truncated,
  };
}

export { MediaError };
