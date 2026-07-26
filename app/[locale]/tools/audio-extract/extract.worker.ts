import { extractAudio, type AudioFormat, type ExtractResult } from "@/lib/video/audio-core";
import { readMp4 } from "@/lib/video/mp4-source";

export type WorkerRequest =
  | { kind: "inspect"; id: number; file: File }
  | { kind: "extract"; id: number; file: File; format: AudioFormat };

/**
 * 유니온에 그냥 Omit 을 씌우면 공통 키만 남아 payload 가 사라진다.
 * 각 멤버에 분배되도록 조건부 타입을 거쳐야 한다.
 */
export type WorkerRequestPayload = WorkerRequest extends infer T
  ? T extends { id: number }
    ? Omit<T, "id">
    : never
  : never;

export type WorkerResponse =
  | {
      kind: "inspected";
      id: number;
      durationSec: number;
      channels: number;
      sampleRate: number;
    }
  | { kind: "progress"; id: number; ratio: number }
  | { kind: "extracted"; id: number; blob: Blob; stats: Omit<ExtractResult, "blob"> }
  | { kind: "failed"; id: number; message: string };

// DOM lib 의 window.postMessage 시그니처와 충돌하지 않도록 좁혀서 캐스팅한다.
const ctx = self as unknown as {
  onmessage: ((event: MessageEvent<WorkerRequest>) => void) | null;
  postMessage(message: WorkerResponse): void;
};

async function bytesOf(file: File): Promise<Uint8Array> {
  return new Uint8Array(await file.arrayBuffer());
}

ctx.onmessage = async (event) => {
  const request = event.data;

  try {
    if (request.kind === "inspect") {
      const { audio } = await readMp4(await bytesOf(request.file), { requireVideo: false });
      if (!audio) throw new Error("NO_AUDIO_TRACK");
      ctx.postMessage({
        kind: "inspected",
        id: request.id,
        durationSec: audio.duration / 1_000_000,
        channels: audio.channels,
        sampleRate: audio.sampleRate,
      });
      return;
    }

    const { blob, ...stats } = await extractAudio(
      await bytesOf(request.file),
      request.format,
      (ratio) => ctx.postMessage({ kind: "progress", id: request.id, ratio }),
    );
    ctx.postMessage({ kind: "extracted", id: request.id, blob, stats });
  } catch (error) {
    ctx.postMessage({
      kind: "failed",
      id: request.id,
      message: error instanceof Error ? error.message : "UNKNOWN",
    });
  }
};
