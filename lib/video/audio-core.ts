/**
 * 영상에서 소리만 꺼낸다.
 *
 * 두 갈래로 나간다.
 * - **M4A**: 원본 오디오 청크를 손대지 않고 컨테이너만 바꾼다. 무손실이고 빠르다.
 * - **WAV**: 디코드해서 PCM 으로 쓴다. 커지지만 어디서나 열린다(편집 프로그램 포함).
 *
 * 어느 쪽도 **다시 인코딩하지 않는다.** 소리를 재인코딩하면 나빠지기만 한다.
 * window / document 를 참조하지 않는다 (워커에서 돈다).
 */

import { MediaError, readMp4, type AudioTrack } from "./mp4-source";

export type AudioFormat = "m4a" | "wav";

export interface ExtractResult {
  blob: Blob;
  format: AudioFormat;
  durationSec: number;
  channels: number;
  sampleRate: number;
}

/** 44바이트 WAV 헤더 + 16비트 PCM. */
function writeWav(channels: Float32Array[], sampleRate: number): Blob {
  const channelCount = channels.length;
  const frameCount = channels[0]?.length ?? 0;
  const blockAlign = channelCount * 2;
  const dataBytes = frameCount * blockAlign;

  const buffer = new ArrayBuffer(44 + dataBytes);
  const view = new DataView(buffer);
  const ascii = (offset: number, text: string) => {
    for (let i = 0; i < text.length; i += 1) view.setUint8(offset + i, text.charCodeAt(i));
  };

  ascii(0, "RIFF");
  view.setUint32(4, 36 + dataBytes, true);
  ascii(8, "WAVE");
  ascii(12, "fmt ");
  view.setUint32(16, 16, true); // PCM 청크 크기
  view.setUint16(20, 1, true); // PCM
  view.setUint16(22, channelCount, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * blockAlign, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, 16, true);
  ascii(36, "data");
  view.setUint32(40, dataBytes, true);

  let offset = 44;
  for (let frame = 0; frame < frameCount; frame += 1) {
    for (let channel = 0; channel < channelCount; channel += 1) {
      // -1..1 을 16비트로 접는다. 넘치는 값은 잘라야 지직거리지 않는다.
      const sample = Math.max(-1, Math.min(1, channels[channel][frame] ?? 0));
      view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7fff, true);
      offset += 2;
    }
  }

  return new Blob([buffer], { type: "audio/wav" });
}

/** 원본 오디오 청크를 그대로 M4A 컨테이너에 옮긴다. */
async function toM4a(audio: AudioTrack): Promise<Blob> {
  const { Muxer, ArrayBufferTarget } = await import("mp4-muxer");
  const muxer = new Muxer({
    target: new ArrayBufferTarget(),
    audio: {
      codec: "aac",
      numberOfChannels: audio.channels,
      sampleRate: audio.sampleRate,
    },
    fastStart: "in-memory" as const,
  });

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
  muxer.finalize();

  const buffer = (muxer.target as { buffer: ArrayBuffer }).buffer;
  return new Blob([buffer], { type: "audio/mp4" });
}

/** 디코드해서 PCM 으로 편다. */
async function toWav(audio: AudioTrack, onProgress?: (ratio: number) => void): Promise<Blob> {
  const planes: Float32Array[][] = [];
  let channelCount = audio.channels;
  let sampleRate = audio.sampleRate;
  let failure: unknown = null;
  let done = 0;

  const decoder = new AudioDecoder({
    output: (data) => {
      try {
        channelCount = data.numberOfChannels;
        sampleRate = data.sampleRate;
        const frame: Float32Array[] = [];
        for (let channel = 0; channel < channelCount; channel += 1) {
          const plane = new Float32Array(data.numberOfFrames);
          data.copyTo(plane, { planeIndex: channel, format: "f32-planar" });
          frame.push(plane);
        }
        planes.push(frame);
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
  if (failure) throw new MediaError("DECODE_FAILED");
  if (planes.length === 0) throw new MediaError("DECODE_FAILED");

  // 조각난 프레임들을 채널별로 하나씩 잇는다
  const total = planes.reduce((sum, frame) => sum + (frame[0]?.length ?? 0), 0);
  const channels: Float32Array[] = Array.from(
    { length: channelCount },
    () => new Float32Array(total),
  );
  let offset = 0;
  for (const frame of planes) {
    const length = frame[0]?.length ?? 0;
    for (let channel = 0; channel < channelCount; channel += 1) {
      channels[channel].set(frame[channel] ?? new Float32Array(length), offset);
    }
    offset += length;
  }

  return writeWav(channels, sampleRate);
}

export async function extractAudio(
  bytes: Uint8Array,
  format: AudioFormat,
  onProgress?: (ratio: number) => void,
): Promise<ExtractResult> {
  // 소리만 꺼내는 도구다 — 영상 트랙이 없어도 상관없다.
  const { audio } = await readMp4(bytes, { requireVideo: false });
  if (!audio || audio.samples.length === 0) throw new MediaError("NO_AUDIO_TRACK");

  const blob = format === "m4a" ? await toM4a(audio) : await toWav(audio, onProgress);

  return {
    blob,
    format,
    durationSec: audio.duration / 1_000_000,
    channels: audio.channels,
    sampleRate: audio.sampleRate,
  };
}
