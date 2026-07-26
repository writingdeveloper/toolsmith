/**
 * MP4/MOV 를 열어 트랙과 인코딩된 샘플을 꺼낸다.
 *
 * WebCodecs 는 **디코드·인코드만** 한다. 컨테이너를 여는 일은 우리 몫이라
 * mp4box.js(BSD-3)가 그 자리를 맡는다. 90KB 라 파일이 들어온 뒤에 지연 로드한다.
 *
 * window / document 를 참조하지 않는다 (워커에서 돈다).
 */

export type MediaErrorCode =
  | "UNSUPPORTED_CONTAINER"
  | "NO_VIDEO_TRACK"
  | "UNSUPPORTED_CODEC"
  | "TOO_LARGE"
  | "DECODE_FAILED"
  | "ENCODE_FAILED";

export class MediaError extends Error {
  readonly code: MediaErrorCode;
  constructor(code: MediaErrorCode) {
    super(code);
    this.name = "MediaError";
    this.code = code;
  }
}

/** 한 트랙에서 뽑아낸 인코딩 상태 그대로의 샘플. */
export interface Sample {
  data: Uint8Array;
  /** 마이크로초 */
  timestamp: number;
  duration: number;
  key: boolean;
}

export interface VideoTrack {
  codec: string;
  width: number;
  height: number;
  /** 마이크로초 */
  duration: number;
  frameCount: number;
  /** avcC / hvcC 등 디코더 초기화 데이터 */
  description?: Uint8Array;
  samples: Sample[];
}

export interface AudioTrack {
  codec: string;
  sampleRate: number;
  channels: number;
  duration: number;
  description?: Uint8Array;
  samples: Sample[];
}

export interface Mp4Source {
  video: VideoTrack;
  audio?: AudioTrack;
}

/** 브라우저 메모리를 지키기 위한 안전판. 영상은 금방 커진다. */
export const MAX_VIDEO_BYTES = 512 * 1024 * 1024;

/* mp4box 는 타입이 헐거워 우리가 쓰는 부분만 좁혀서 적는다. */
interface Mp4BoxTrack {
  id: number;
  codec: string;
  timescale: number;
  duration: number;
  nb_samples: number;
  video?: { width: number; height: number };
  audio?: { sample_rate: number; channel_count: number };
}
interface Mp4BoxInfo {
  videoTracks: Mp4BoxTrack[];
  audioTracks: Mp4BoxTrack[];
}
interface Mp4BoxSample {
  data: Uint8Array;
  cts: number;
  duration: number;
  timescale: number;
  is_sync: boolean;
}

const MICROS = 1_000_000;

/**
 * 디코더 초기화 데이터(avcC/esds…)를 꺼낸다.
 * 박스를 통째로 직렬화한 뒤 8바이트 헤더를 떼면 WebCodecs 가 원하는 형태가 된다.
 */
function describeTrack(
  file: { getTrackById(id: number): unknown },
  trackId: number,
  DataStream: new (buffer?: ArrayBuffer, byteOffset?: number, endianness?: unknown) => {
    buffer: ArrayBuffer;
    endianness: unknown;
  },
  BIG_ENDIAN: unknown,
): Uint8Array | undefined {
  const trak = file.getTrackById(trackId) as {
    mdia?: { minf?: { stbl?: { stsd?: { entries?: Record<string, unknown>[] } } } };
  };
  const entries = trak?.mdia?.minf?.stbl?.stsd?.entries ?? [];
  for (const entry of entries) {
    for (const key of ["avcC", "hvcC", "vpcC", "av1C", "esds"]) {
      const box = entry[key] as { write(stream: unknown): void } | undefined;
      if (!box) continue;
      const stream = new DataStream(undefined, 0, BIG_ENDIAN);
      box.write(stream);
      // 박스 헤더(size 4 + type 4)를 뗀다
      return new Uint8Array(stream.buffer.slice(8));
    }
  }
  return undefined;
}

export async function readMp4(bytes: Uint8Array): Promise<Mp4Source> {
  if (bytes.byteLength > MAX_VIDEO_BYTES) throw new MediaError("TOO_LARGE");

  const mp4box = (await import("mp4box")) as unknown as {
    createFile(): {
      onReady: (info: Mp4BoxInfo) => void;
      onError: (message: string) => void;
      onSamples: (id: number, user: unknown, samples: Mp4BoxSample[]) => void;
      appendBuffer(buffer: ArrayBuffer & { fileStart: number }): void;
      setExtractionOptions(id: number, user: unknown, options: { nbSamples: number }): void;
      start(): void;
      flush(): void;
      getTrackById(id: number): unknown;
    };
    DataStream: new (buffer?: ArrayBuffer, byteOffset?: number, endianness?: unknown) => {
      buffer: ArrayBuffer;
      endianness: unknown;
    };
  };

  const BIG_ENDIAN = (
    mp4box.DataStream as unknown as { BIG_ENDIAN?: unknown }
  ).BIG_ENDIAN;

  const file = mp4box.createFile();

  return new Promise<Mp4Source>((resolve, reject) => {
    const collected = new Map<number, Sample[]>();
    let info: Mp4BoxInfo | null = null;
    let expected = 0;

    const finish = () => {
      if (!info) return;
      const videoInfo = info.videoTracks[0];
      const audioInfo = info.audioTracks[0];

      const video: VideoTrack = {
        codec: videoInfo.codec,
        width: videoInfo.video?.width ?? 0,
        height: videoInfo.video?.height ?? 0,
        duration: (videoInfo.duration / videoInfo.timescale) * MICROS,
        frameCount: videoInfo.nb_samples,
        description: describeTrack(file, videoInfo.id, mp4box.DataStream, BIG_ENDIAN),
        samples: collected.get(videoInfo.id) ?? [],
      };

      const audio: AudioTrack | undefined = audioInfo
        ? {
            codec: audioInfo.codec,
            sampleRate: audioInfo.audio?.sample_rate ?? 48000,
            channels: audioInfo.audio?.channel_count ?? 2,
            duration: (audioInfo.duration / audioInfo.timescale) * MICROS,
            description: describeTrack(file, audioInfo.id, mp4box.DataStream, BIG_ENDIAN),
            samples: collected.get(audioInfo.id) ?? [],
          }
        : undefined;

      resolve({ video, audio });
    };

    file.onError = (message: string) => {
      reject(new MediaError(message.includes("codec") ? "UNSUPPORTED_CODEC" : "UNSUPPORTED_CONTAINER"));
    };

    file.onReady = (ready: Mp4BoxInfo) => {
      info = ready;
      if (!ready.videoTracks?.length) {
        reject(new MediaError("NO_VIDEO_TRACK"));
        return;
      }
      const tracks = [ready.videoTracks[0], ...(ready.audioTracks?.[0] ? [ready.audioTracks[0]] : [])];
      expected = tracks.length;
      for (const track of tracks) {
        collected.set(track.id, []);
        file.setExtractionOptions(track.id, null, { nbSamples: track.nb_samples });
      }
      file.start();
    };

    file.onSamples = (id: number, _user: unknown, samples: Mp4BoxSample[]) => {
      const bucket = collected.get(id);
      if (!bucket) return;
      for (const sample of samples) {
        bucket.push({
          // mp4box 가 내부 버퍼를 재사용하므로 복사해 둔다
          data: new Uint8Array(sample.data),
          timestamp: (sample.cts / sample.timescale) * MICROS,
          duration: (sample.duration / sample.timescale) * MICROS,
          key: sample.is_sync,
        });
      }
      // 모든 트랙의 샘플이 다 모였으면 끝
      const done = [...collected.entries()].every(([trackId, list]) => {
        const track =
          info?.videoTracks.find((t) => t.id === trackId) ??
          info?.audioTracks.find((t) => t.id === trackId);
        return track ? list.length >= track.nb_samples : true;
      });
      if (done && collected.size === expected) finish();
    };

    const buffer = bytes.buffer.slice(
      bytes.byteOffset,
      bytes.byteOffset + bytes.byteLength,
    ) as ArrayBuffer & { fileStart: number };
    buffer.fileStart = 0;
    file.appendBuffer(buffer);
    file.flush();

    // onSamples 가 한 번도 불리지 않는 파일(빈 트랙 등)을 위한 안전망
    setTimeout(() => {
      if (info) finish();
      else reject(new MediaError("UNSUPPORTED_CONTAINER"));
    }, 15_000);
  });
}
