/**
 * 영상 압축 — 비디오만 다시 인코딩하고 **오디오는 원본 그대로 옮긴다.**
 *
 * 같은 컨테이너(MP4)로 나가므로 오디오는 손댈 이유가 없다. 다시 인코딩하면
 * 소리만 나빠지고 시간도 더 걸린다.
 *
 * ffmpeg.wasm(30.7MB, GPL)을 쓰지 않고 브라우저 내장 WebCodecs 로 한다 →
 * 받을 것이 없고 하드웨어 가속을 탄다. 근거는 docs/TOOLS.md.
 *
 * window / document 를 참조하지 않는다 (워커에서 돈다).
 */

import { MediaError, readMp4, type AudioTrack, type VideoTrack } from "./mp4-source";

export interface CompressOptions {
  /** 긴 변 상한(px). 0 이면 원본 해상도 유지 */
  maxEdge: number;
  /** 목표 비디오 비트레이트(bps) */
  bitrate: number;
}

export interface CompressResult {
  blob: Blob;
  before: number;
  after: number;
  width: number;
  height: number;
  durationSec: number;
  /** 오디오를 그대로 옮겼는지 */
  keptAudio: boolean;
}

/** H.264 는 가로·세로가 짝수여야 한다. */
function evenFit(width: number, height: number, maxEdge: number) {
  let w = width;
  let h = height;
  if (maxEdge && Math.max(w, h) > maxEdge) {
    const scale = maxEdge / Math.max(w, h);
    w = Math.round(w * scale);
    h = Math.round(h * scale);
  }
  return { width: Math.max(2, w - (w % 2)), height: Math.max(2, h - (h % 2)) };
}

/** 목표 해상도에서 실제로 받아 주는 H.264 프로파일을 찾는다. */
async function pickVideoCodec(width: number, height: number, bitrate: number): Promise<string> {
  for (const codec of ["avc1.4d0033", "avc1.4d001f", "avc1.42001f", "avc1.42e01e"]) {
    try {
      const probe = await VideoEncoder.isConfigSupported({ codec, width, height, bitrate });
      if (probe.supported) return codec;
    } catch {
      // 다음 후보로
    }
  }
  throw new MediaError("ENCODE_FAILED");
}

export async function compressVideo(
  bytes: Uint8Array,
  options: CompressOptions,
  onProgress?: (ratio: number) => void,
): Promise<CompressResult> {
  const source = await readMp4(bytes);
  const { video, audio } = source;
  if (video.samples.length === 0) throw new MediaError("NO_VIDEO_TRACK");

  const target = evenFit(video.width, video.height, options.maxEdge);
  const codec = await pickVideoCodec(target.width, target.height, options.bitrate);

  const { Muxer, ArrayBufferTarget } = await import("mp4-muxer");
  const muxer = new Muxer({
    target: new ArrayBufferTarget(),
    video: { codec: "avc", width: target.width, height: target.height },
    ...(audio
      ? {
          audio: {
            codec: "aac" as const,
            numberOfChannels: audio.channels,
            sampleRate: audio.sampleRate,
          },
        }
      : {}),
    fastStart: "in-memory" as const,
  });

  let encodeError: unknown = null;
  const encoder = new VideoEncoder({
    output: (chunk, meta) => muxer.addVideoChunk(chunk, meta),
    error: (error) => {
      encodeError = error;
    },
  });
  encoder.configure({
    codec,
    width: target.width,
    height: target.height,
    bitrate: options.bitrate,
    // annex-b 로 나오면 muxer 가 avcC 를 만들지 못한다
    avc: { format: "avc" },
  });

  // 크기를 바꿀 때만 캔버스를 거친다 — 그대로일 땐 프레임을 그대로 넘긴다.
  const resizing = target.width !== video.width || target.height !== video.height;
  const canvas = resizing ? new OffscreenCanvas(target.width, target.height) : null;
  const ctx = canvas?.getContext("2d") ?? null;
  if (resizing && !ctx) throw new MediaError("ENCODE_FAILED");

  let done = 0;
  let decodeError: unknown = null;

  const decoder = new VideoDecoder({
    output: (frame) => {
      try {
        if (ctx && canvas) {
          ctx.drawImage(frame, 0, 0, target.width, target.height);
          const resized = new VideoFrame(canvas, {
            timestamp: frame.timestamp,
            duration: frame.duration ?? undefined,
          });
          encoder.encode(resized);
          resized.close();
        } else {
          encoder.encode(frame);
        }
      } catch (error) {
        encodeError = error;
      } finally {
        frame.close();
        done += 1;
        onProgress?.(Math.min(1, done / Math.max(1, video.samples.length)));
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
    // 큐가 밀리면 잠시 양보한다. 안 그러면 메모리가 프레임으로 가득 찬다.
    if (decoder.decodeQueueSize > 16 || encoder.encodeQueueSize > 16) {
      await new Promise((resolve) => setTimeout(resolve, 0));
    }
  }

  await decoder.flush();
  await encoder.flush();
  decoder.close();
  encoder.close();

  if (decodeError) throw new MediaError("DECODE_FAILED");
  if (encodeError) throw new MediaError("ENCODE_FAILED");

  // 오디오는 손대지 않고 그대로 옮긴다.
  // muxer 가 esds 를 쓰려면 원본 디코더 설정이 필요하다.
  if (audio) {
    const meta = audio.description
      ? {
          decoderConfig: {
            codec: audio.codec,
            sampleRate: audio.sampleRate,
            numberOfChannels: audio.channels,
            description: audio.description,
          },
        }
      : undefined;
    for (const sample of audio.samples) {
      muxer.addAudioChunkRaw(
        sample.data,
        sample.key ? "key" : "delta",
        sample.timestamp,
        sample.duration,
        meta,
      );
    }
  }

  muxer.finalize();
  const buffer = (muxer.target as { buffer: ArrayBuffer }).buffer;

  return {
    blob: new Blob([buffer], { type: "video/mp4" }),
    before: bytes.byteLength,
    after: buffer.byteLength,
    width: target.width,
    height: target.height,
    durationSec: video.duration / 1_000_000,
    keptAudio: Boolean(audio),
  };
}

export type { AudioTrack, VideoTrack };
export { MediaError };
