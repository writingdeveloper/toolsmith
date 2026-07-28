import { compressVideo, type CompressOptions, type CompressResult } from "@/lib/video/compress-core";
import { readMp4 } from "@/lib/video/mp4-source";
import { displaySize } from "@/lib/video/rotation";

export type WorkerRequest =
  | { kind: "inspect"; id: number; file: File }
  | { kind: "compress"; id: number; file: File; options: CompressOptions };

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
      width: number;
      height: number;
      durationSec: number;
      hasAudio: boolean;
    }
  | { kind: "progress"; id: number; ratio: number }
  | { kind: "compressed"; id: number; blob: Blob; stats: Omit<CompressResult, "blob"> }
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
      const { video, audio } = await readMp4(await bytesOf(request.file));
      if (!video) throw new Error("NO_VIDEO_TRACK");
      ctx.postMessage({
        kind: "inspected",
        id: request.id,
        // **보이는 크기**를 준다. 저장 크기를 그대로 주면 세로 영상에 가로를 말한다.
        ...displaySize(video, video.rotation),
        durationSec: video.duration / 1_000_000,
        hasAudio: Boolean(audio),
      });
      return;
    }

    const { blob, ...stats } = await compressVideo(
      await bytesOf(request.file),
      request.options,
      (ratio) => ctx.postMessage({ kind: "progress", id: request.id, ratio }),
    );
    ctx.postMessage({ kind: "compressed", id: request.id, blob, stats });
  } catch (error) {
    ctx.postMessage({
      kind: "failed",
      id: request.id,
      message: error instanceof Error ? error.message : "UNKNOWN",
    });
  }
};
