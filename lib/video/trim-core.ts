/**
 * 영상 트림 — **아무것도 다시 인코딩하지 않는다.**
 *
 * 원하는 구간의 샘플을 골라 다시 mux 할 뿐이라 화질이 그대로이고 순식간에 끝난다.
 * 대신 대가가 하나 있고, 이 파일의 절반은 그 대가를 정직하게 다루는 코드다:
 *
 *   **시작점은 키프레임에만 앉는다.** 키프레임은 혼자 힘으로 그려지는 프레임이고,
 *   그 사이의 프레임들은 앞 프레임을 참조한다. 참조 대상 없이 잘라내면 첫 몇 초가
 *   깨진 채로 나온다. 그래서 요청한 지점 **이전의 가장 가까운 키프레임**에서 자르고,
 *   "실제로는 여기서 시작합니다" 를 버튼을 누르기 전에 보여 준다.
 *
 * 정확히 그 지점에서 자르려면 앞부분만 다시 인코딩해야 하는데, 그러면 화질이 떨어지고
 * 느려진다. 어느 쪽이 나은지는 사용자가 알 수 있어야 한다 — 몰래 고르지 않는다.
 *
 * window / document 를 참조하지 않는다 (워커에서 돈다).
 */

import {
  MediaError,
  mp4AudioCodecName,
  mp4VideoCodecName,
  readMp4,
  type Mp4Source,
  type Sample,
  type VideoTrack,
} from "./mp4-source";

export interface TrimOptions {
  /** 요청 시작(초). 실제로는 이 앞의 키프레임으로 당겨진다. */
  startSec: number;
  /** 요청 끝(초) */
  endSec: number;
}

export interface TrimResult {
  blob: Blob;
  before: number;
  after: number;
  /** 실제로 잘린 시작(초). 요청값과 다를 수 있다 — 그게 이 도구의 핵심 고백이다. */
  startSec: number;
  endSec: number;
  keptAudio: boolean;
}

const MICROS = 1_000_000;

/**
 * 이 영상에서 실제로 잘릴 수 있는 시작점들(초).
 * UI 가 "요청 10.0초 → 실제 9.6초" 를 **버튼을 누르기 전에** 말할 수 있게 하는 재료다.
 */
export function keyframeTimes(video: VideoTrack): number[] {
  return video.samples.filter((s) => s.key).map((s) => s.timestamp / MICROS);
}

/** 요청 시작점을 감당할 수 있는 실제 시작점으로 내린다. */
export function snapToKeyframe(keyframes: number[], startSec: number): number {
  let best = keyframes.length > 0 ? keyframes[0] : 0;
  for (const at of keyframes) {
    if (at <= startSec + 1e-6) best = at;
    else break;
  }
  return best;
}

/** 잘라 낼 샘플의 인덱스 범위. 디코드 순서 기준이라 그대로 이어 붙이면 된다. */
function sliceRange(samples: Sample[], startMicros: number, endMicros: number) {
  let first = 0;
  for (let i = 0; i < samples.length; i += 1) {
    if (samples[i].key && samples[i].timestamp <= startMicros + 1) first = i;
    if (samples[i].timestamp > startMicros) break;
  }

  let last = first;
  for (let i = first; i < samples.length; i += 1) {
    if (samples[i].timestamp < endMicros) last = i;
  }
  return { first, last };
}

export async function trimVideo(
  bytes: Uint8Array,
  options: TrimOptions,
  onProgress?: (ratio: number) => void,
): Promise<TrimResult> {
  return remuxMp4(bytes.byteLength, await readMp4(bytes), options, onProgress);
}

/**
 * 고른 구간을 MP4 로 다시 mux 한다. **이 저장소에서 cts/dts 를 다루는 유일한 곳이다.**
 *
 * 이미 열어 둔 소스를 받는 형태로 떼어 놓은 이유는 영상 변환(MOV → MP4)이 같은 일을
 * 하기 때문이다 — 구간이 파일 전체일 뿐이다. 두 벌로 두면 한쪽만 고치게 된다.
 */
export async function remuxMp4(
  sourceBytes: number,
  { video, audio }: Mp4Source,
  options: TrimOptions,
  onProgress?: (ratio: number) => void,
): Promise<TrimResult> {
  if (!video || video.samples.length === 0) throw new MediaError("NO_VIDEO_TRACK");

  const startMicros = options.startSec * MICROS;
  const endMicros = options.endSec * MICROS;
  if (!(endMicros > startMicros)) throw new MediaError("BAD_RANGE");

  const { first, last } = sliceRange(video.samples, startMicros, endMicros);
  const chosen = video.samples.slice(first, last + 1);
  if (chosen.length === 0) throw new MediaError("BAD_RANGE");

  const codec = mp4VideoCodecName(video.codec);
  if (!codec) throw new MediaError("UNSUPPORTED_CODEC");
  // 옮길 줄 모르는 오디오라면 소리를 버리고 영상만 낸다 — 통째로 실패시키지 않는다
  const audioCodec = audio ? mp4AudioCodecName(audio.codec) : null;
  const keepAudio = Boolean(audio && audioCodec);

  const { Muxer, ArrayBufferTarget } = await import("mp4-muxer");
  const muxer = new Muxer({
    target: new ArrayBufferTarget(),
    /*
     * **회전을 그대로 다시 적는다.** 여기서는 샘플을 옮기기만 하므로 픽셀을 돌릴
     * 방법이 없다 — 원본이 세로였다는 사실은 이 한 줄로만 살아남는다. 빠뜨리면
     * 휴대폰 세로 영상이 옆으로 누워서 나간다(2026-07-27 실측). `lib/video/rotation.ts`.
     */
    video: { codec, width: video.width, height: video.height, rotation: video.rotation },
    ...(keepAudio && audio && audioCodec
      ? {
          audio: {
            codec: audioCodec,
            numberOfChannels: audio.channels,
            sampleRate: audio.sampleRate,
          },
        }
      : {}),
    /*
     * B프레임이 있으면 첫 dts 가 음수로 나온다(cts − cto). "strict" 면 거기서 던지고,
     * "offset" 이면 트랙마다 **제각각** 당겨서 소리와 그림이 어긋난다.
     * "cross-track-offset" 만이 두 트랙을 **같은 양**만큼 옮긴다.
     */
    firstTimestampBehavior: "cross-track-offset" as const,
    fastStart: "in-memory" as const,
  });

  // 시간의 기준점. 영상·오디오가 같은 값으로 당겨져야 입이 맞는다.
  const base = chosen[0].timestamp;

  const videoMeta = video.description
    ? { decoderConfig: { codec: video.codec, description: video.description } }
    : undefined;

  chosen.forEach((sample, index) => {
    muxer.addVideoChunkRaw(
      sample.data,
      sample.key ? "key" : "delta",
      // **표시 시각을 넘긴다.** muxer 는 dts 를 timestamp − cto 로 되짚는다 —
      // 여기에 dts 를 주면 dts 가 두 번 빠져 뒤로 흐르고, "monotonically
      // increasing" 위반으로 죽는다. B프레임 없는 파일에서는 cto 가 0 이라
      // 두 값이 같아서 이 실수가 드러나지 않는다.
      sample.timestamp - base,
      sample.duration,
      videoMeta,
      // cts − dts. B프레임이 없으면 0 이고, 있으면 이 값이 디코드 순서를 되살린다.
      Math.round(sample.timestamp - sample.decodeTime),
    );
    if (index % 30 === 0) onProgress?.(index / chosen.length);
  });

  const actualStart = chosen[0].timestamp;
  const lastSample = chosen[chosen.length - 1];
  const actualEnd = lastSample.timestamp + lastSample.duration;

  if (keepAudio && audio && audioCodec) {
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
      // 영상이 실제로 시작하는 지점에 맞춘다 — 요청한 지점이 아니다.
      // 걸쳐 있는 프레임은 버린다. 남기면 오디오만 영상보다 먼저 시작한다.
      if (sample.timestamp < actualStart) continue;
      if (sample.timestamp >= actualEnd) break;
      muxer.addAudioChunkRaw(
        sample.data,
        sample.key ? "key" : "delta",
        sample.timestamp - base,
        sample.duration,
        meta,
      );
    }
  }

  onProgress?.(1);
  muxer.finalize();
  const buffer = (muxer.target as { buffer: ArrayBuffer }).buffer;

  return {
    blob: new Blob([buffer], { type: "video/mp4" }),
    before: sourceBytes,
    after: buffer.byteLength,
    startSec: actualStart / MICROS,
    endSec: actualEnd / MICROS,
    keptAudio: keepAudio,
  };
}

export { MediaError };
