/**
 * 영상 변환 — 상자(컨테이너)를 바꾼다.
 *
 * 두 갈래이고 성격이 정반대라, UI 는 **누르기 전에** 어느 쪽인지 말해야 한다.
 *
 * - **MP4 로**: 코덱을 손대지 않고 상자만 바꾼다. `.mov` → `.mp4` 가 이 길이다.
 *   무손실이고 순식간에 끝난다 — 트림과 같은 재mux 경로를 그대로 쓴다.
 * - **WebM 으로**: H.264 는 WebM 에 들어갈 수 없다. 비디오는 VP9, 소리는 Opus 로
 *   **전부 다시 인코딩**한다. 시간이 걸리고 화질이 한 세대 내려간다.
 *
 * 입력은 MP4·MOV·M4V 뿐이다. mp4box 는 ISOBMFF 만 읽으므로 우리에게 **WebM 을 여는
 * 코드가 없다** — 그래서 "WebM → MP4" 를 목록에 올리지 않는다. 규칙 3.
 *
 * window / document 를 참조하지 않는다 (워커에서 돈다).
 */

import { evenFit } from "./compress-core";
import {
  MediaError,
  mp4VideoCodecName,
  readMp4,
  type AudioTrack,
  type Mp4Source,
  type VideoTrack,
} from "./mp4-source";
import { remuxMp4 } from "./trim-core";
import { displaySize, drawRotated } from "./rotation";

export type ConvertTarget = "mp4" | "webm";
export type Quality = "high" | "balanced" | "small";

export interface ConvertOptions {
  target: ConvertTarget;
  /** WebM 에서만 쓴다. 0 이면 원본 해상도 그대로 */
  maxEdge: number;
  /** WebM 에서만 쓴다 */
  quality: Quality;
}

export interface ConvertResult {
  blob: Blob;
  target: ConvertTarget;
  before: number;
  after: number;
  width: number;
  height: number;
  durationSec: number;
  /** 비디오를 다시 인코딩했는가. 이 값이 곧 "화질이 그대로인가" 다. */
  reencoded: boolean;
  keptAudio: boolean;
}

/** 파일을 열어 본 결과. UI 가 어떤 출력이 가능한지 정직하게 그리는 재료다. */
export interface ConvertProbe {
  width: number;
  height: number;
  durationSec: number;
  frameRate: number;
  videoCodec: string;
  audioCodec: string | null;
  hasAudio: boolean;
  /** 재인코딩 없이 MP4 로 옮길 수 있는가 */
  canRemuxToMp4: boolean;
}

const MICROS = 1_000_000;

/**
 * 화소 하나당 몇 비트를 쓸지. 해상도·프레임률과 곱해 비트레이트를 만든다.
 * 고정 비트레이트를 쓰면 240p 는 낭비되고 1080p 는 뭉개진다.
 */
const BITS_PER_PIXEL: Record<Quality, number> = { high: 0.12, balanced: 0.07, small: 0.04 };

export function probeSource({ video, audio }: Mp4Source): ConvertProbe {
  if (!video || video.samples.length === 0) throw new MediaError("NO_VIDEO_TRACK");

  const durationSec = video.duration / MICROS;
  // UI 가 그리는 숫자다 — 저장 크기가 아니라 재생기가 보여 주는 크기여야 한다
  const shown = displaySize(video, video.rotation);

  return {
    width: shown.width,
    height: shown.height,
    durationSec,
    frameRate: durationSec > 0 ? video.samples.length / durationSec : 0,
    videoCodec: video.codec,
    audioCodec: audio ? audio.codec : null,
    hasAudio: Boolean(audio),
    // 소리를 옮길 줄 몰라도 영상은 옮길 수 있다 — 소리만 버리고 나간다
    canRemuxToMp4: mp4VideoCodecName(video.codec) !== null,
  };
}

function targetBitrate(width: number, height: number, frameRate: number, quality: Quality): number {
  const fps = frameRate > 0 && Number.isFinite(frameRate) ? Math.min(60, frameRate) : 30;
  const raw = width * height * fps * BITS_PER_PIXEL[quality];
  // 아주 작은 영상에서도 알아볼 수 있을 만큼은 준다
  return Math.round(Math.max(150_000, Math.min(20_000_000, raw)));
}

/** 이 브라우저가 실제로 받아 주는 WebM 비디오 코덱을 찾는다. */
async function pickWebmCodec(width: number, height: number, bitrate: number) {
  const candidates = [
    { codec: "vp09.00.10.08", mux: "V_VP9" },
    { codec: "vp8", mux: "V_VP8" },
  ];
  for (const candidate of candidates) {
    try {
      const probe = await VideoEncoder.isConfigSupported({
        codec: candidate.codec,
        width,
        height,
        bitrate,
      });
      if (probe.supported) return candidate;
    } catch {
      // 다음 후보로
    }
  }
  throw new MediaError("ENCODE_FAILED");
}

interface OpusChunk {
  chunk: EncodedAudioChunk;
  meta?: EncodedAudioChunkMetadata;
}

/**
 * AAC 를 Opus 로 옮긴다. **이 저장소에서 소리를 인코딩하는 유일한 곳이다.**
 *
 * 결과를 배열에 모아 두는 것은 낭비가 아니라 필요다. muxer 에 오디오 트랙을 선언하려면
 * 샘플레이트·채널 수를 미리 알아야 하는데, 그 값의 진짜 출처는 트랙 헤더가 아니라
 * **디코더가 내놓는 AudioData** 다(HE-AAC 는 헤더의 두 배로 나온다). 먼저 다 돌려 본 뒤에
 * muxer 를 세우면 어긋날 자리가 없어진다. Opus 는 분당 1MB 남짓이라 감당된다.
 */
async function transcodeToOpus(
  audio: AudioTrack,
  onProgress?: (ratio: number) => void,
): Promise<{ chunks: OpusChunk[]; sampleRate: number; channels: number } | null> {
  const chunks: OpusChunk[] = [];
  let sampleRate = audio.sampleRate;
  let channels = audio.channels;
  let failure: unknown = null;
  let encoder: AudioEncoder | null = null;
  let done = 0;

  const decoder = new AudioDecoder({
    output: (data) => {
      try {
        if (!encoder) {
          sampleRate = data.sampleRate;
          channels = data.numberOfChannels;
          encoder = new AudioEncoder({
            output: (chunk, meta) => chunks.push({ chunk, meta }),
            error: (error) => {
              failure = error;
            },
          });
          encoder.configure({
            codec: "opus",
            sampleRate,
            numberOfChannels: channels,
            bitrate: channels > 1 ? 128_000 : 96_000,
          });
        }
        encoder.encode(data);
      } catch (error) {
        failure = error;
      } finally {
        data.close();
        done += 1;
        onProgress?.(Math.min(1, done / Math.max(1, audio.samples.length)));
      }
    },
    error: (error) => {
      failure = error;
    },
  });

  decoder.configure({
    codec: audio.codec,
    sampleRate: audio.sampleRate,
    numberOfChannels: audio.channels,
    description: audio.description,
  });

  for (const sample of audio.samples) {
    if (failure) break;
    decoder.decode(
      new EncodedAudioChunk({
        type: sample.key ? "key" : "delta",
        timestamp: sample.timestamp,
        duration: sample.duration,
        data: sample.data,
      }),
    );
    if (decoder.decodeQueueSize > 32) {
      await new Promise((resolve) => setTimeout(resolve, 0));
    }
  }

  await decoder.flush();
  decoder.close();

  const active = encoder as AudioEncoder | null;
  if (active) {
    await active.flush();
    active.close();
  }

  // 소리를 옮기지 못했다면 영상만 내보낸다 — 통째로 실패시키지 않는다
  if (failure || chunks.length === 0) return null;
  return { chunks, sampleRate, channels };
}

async function toWebm(
  sourceBytes: number,
  video: VideoTrack,
  audio: AudioTrack | undefined,
  options: ConvertOptions,
  onProgress?: (ratio: number) => void,
): Promise<ConvertResult> {
  const durationSec = video.duration / MICROS;
  const frameRate = durationSec > 0 ? video.samples.length / durationSec : 30;
  /*
   * **WebM 은 회전을 담지 못한다.** Matroska 에 자리가 아예 없는 것은 아니지만
   * (`ProjectionPoseRoll`) `webm-muxer` 에 그 옵션이 없고 재생기 지원도 고르지 않다.
   * 그래서 여기서는 픽셀을 실제로 돌려 굽는다 — MP4 갈래와 방법이 갈리는 지점이다.
   */
  const stored = evenFit(video.width, video.height, options.maxEdge);
  const target = displaySize(stored, video.rotation);
  const bitrate = targetBitrate(target.width, target.height, frameRate, options.quality);
  const picked = await pickWebmCodec(target.width, target.height, bitrate);

  // 소리를 먼저 끝낸다. 진행률의 앞 20% 를 여기에 준다.
  const opus = audio ? await transcodeToOpus(audio, (r) => onProgress?.(r * 0.2)) : null;

  const { Muxer, ArrayBufferTarget } = await import("webm-muxer");
  const muxer = new Muxer({
    target: new ArrayBufferTarget(),
    video: {
      codec: picked.mux,
      width: target.width,
      height: target.height,
      frameRate: Math.round(frameRate) || undefined,
    },
    ...(opus
      ? {
          audio: {
            codec: "A_OPUS",
            numberOfChannels: opus.channels,
            sampleRate: opus.sampleRate,
          },
        }
      : {}),
    // 트랙 시간축은 readMp4 의 rebase 가 이미 0 에 맞춰 두었다
    firstTimestampBehavior: "permissive" as const,
  });

  /*
   * 오디오는 이미 다 만들어져 있고 영상은 지금 나온다. 영상 청크를 넣기 직전에
   * 그보다 이른 오디오를 흘려 보내야 클러스터가 시간 순서대로 쌓인다 —
   * 한쪽을 통째로 먼저 넣으면 뒤 트랙이 과거 시각으로 도착한다.
   */
  let audioAt = 0;
  const drainAudio = (untilMicros: number) => {
    if (!opus) return;
    while (audioAt < opus.chunks.length && opus.chunks[audioAt].chunk.timestamp <= untilMicros) {
      const entry = opus.chunks[audioAt];
      audioAt += 1;
      muxer.addAudioChunk(entry.chunk, entry.meta);
    }
  };

  let encodeError: unknown = null;
  let decodeError: unknown = null;

  const encoder = new VideoEncoder({
    output: (chunk, meta) => {
      try {
        drainAudio(chunk.timestamp);
        muxer.addVideoChunk(chunk, meta);
      } catch (error) {
        encodeError = error;
      }
    },
    error: (error) => {
      encodeError = error;
    },
  });
  encoder.configure({ codec: picked.codec, width: target.width, height: target.height, bitrate });

  // 회전이 있으면 크기가 그대로여도 캔버스를 거쳐야 한다 — 돌릴 곳이 거기뿐이다
  const redrawing =
    video.rotation !== 0 || stored.width !== video.width || stored.height !== video.height;
  const canvas = redrawing ? new OffscreenCanvas(target.width, target.height) : null;
  const ctx = canvas?.getContext("2d") ?? null;
  if (redrawing && !ctx) throw new MediaError("ENCODE_FAILED");

  const base = opus ? 0.2 : 0;
  const span = 1 - base;
  let done = 0;

  const decoder = new VideoDecoder({
    output: (frame) => {
      try {
        if (ctx && canvas) {
          drawRotated(ctx, frame, video.rotation, target.width, target.height);
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
        onProgress?.(base + span * Math.min(1, done / Math.max(1, video.samples.length)));
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

  // 영상보다 뒤에 남은 소리를 마저 넣는다
  drainAudio(Number.POSITIVE_INFINITY);

  onProgress?.(1);
  muxer.finalize();
  const buffer = (muxer.target as { buffer: ArrayBuffer }).buffer;

  return {
    blob: new Blob([buffer], { type: "video/webm" }),
    target: "webm",
    before: sourceBytes,
    after: buffer.byteLength,
    width: target.width,
    height: target.height,
    durationSec,
    reencoded: true,
    keptAudio: Boolean(opus),
  };
}

export async function convertVideo(
  bytes: Uint8Array,
  options: ConvertOptions,
  onProgress?: (ratio: number) => void,
): Promise<ConvertResult> {
  const source = await readMp4(bytes);
  const { video, audio } = source;
  if (!video || video.samples.length === 0) throw new MediaError("NO_VIDEO_TRACK");

  if (options.target === "webm") {
    return toWebm(bytes.byteLength, video, audio, options, onProgress);
  }

  // MP4 로는 코덱을 그대로 옮긴다. 구간이 파일 전체인 트림과 같은 일이다.
  if (!mp4VideoCodecName(video.codec)) throw new MediaError("UNSUPPORTED_CODEC");
  const remuxed = await remuxMp4(
    bytes.byteLength,
    source,
    // 끝을 넉넉히 잡아 마지막 샘플까지 포함시킨다
    { startSec: 0, endSec: video.duration / MICROS + 1 },
    onProgress,
  );

  const shown = displaySize(video, video.rotation);

  return {
    blob: remuxed.blob,
    target: "mp4",
    before: remuxed.before,
    after: remuxed.after,
    width: shown.width,
    height: shown.height,
    durationSec: remuxed.endSec - remuxed.startSec,
    reencoded: false,
    keptAudio: remuxed.keptAudio,
  };
}

export { MediaError };
