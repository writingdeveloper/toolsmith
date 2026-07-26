import {
  convertVideo,
  probeSource,
  type ConvertOptions,
  type ConvertProbe,
  type ConvertResult,
} from "@/lib/video/convert-core";
import { readMp4 } from "@/lib/video/mp4-source";

export type WorkerRequest =
  | { kind: "inspect"; id: number; file: File }
  | { kind: "convert"; id: number; file: File; options: ConvertOptions };

/** 유니온에 그냥 Omit 을 씌우면 공통 키만 남는다 — 멤버마다 분배되도록 조건부 타입을 거친다. */
export type WorkerRequestPayload = WorkerRequest extends infer T
  ? T extends { id: number }
    ? Omit<T, "id">
    : never
  : never;

export type WorkerResponse =
  | { kind: "inspected"; id: number; probe: ConvertProbe }
  | { kind: "progress"; id: number; ratio: number }
  | { kind: "converted"; id: number; blob: Blob; stats: Omit<ConvertResult, "blob"> }
  | { kind: "failed"; id: number; message: string };

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
      const probe = probeSource(await readMp4(await bytesOf(request.file)));
      ctx.postMessage({ kind: "inspected", id: request.id, probe });
      return;
    }

    const { blob, ...stats } = await convertVideo(
      await bytesOf(request.file),
      request.options,
      (ratio) => ctx.postMessage({ kind: "progress", id: request.id, ratio }),
    );
    ctx.postMessage({ kind: "converted", id: request.id, blob, stats });
  } catch (error) {
    ctx.postMessage({
      kind: "failed",
      id: request.id,
      message: error instanceof Error ? error.message : "UNKNOWN",
    });
  }
};
