import { convertImage, detectEncoders, type ConvertOptions, type OutputFormat } from "@/lib/image/convert-core";
import { probeAnimation } from "@/lib/image/animation";

export type WorkerRequest =
  | { kind: "detect"; id: number }
  | { kind: "probe"; id: number; file: File }
  | { kind: "convert"; id: number; file: File; options: ConvertOptions };

/**
 * 유니온에 그냥 Omit 을 씌우면 공통 키만 남아 file/options 가 사라진다.
 * 각 멤버에 분배되도록 조건부 타입을 거쳐야 한다.
 */
export type WorkerRequestPayload = WorkerRequest extends infer T
  ? T extends { id: number }
    ? Omit<T, "id">
    : never
  : never;

export type WorkerResponse =
  | { kind: "detect"; id: number; formats: OutputFormat[] }
  | { kind: "probed"; id: number; animated: boolean }
  | { kind: "converted"; id: number; blob: Blob; width: number; height: number }
  | { kind: "failed"; id: number; message: string };

// DOM lib 의 window.postMessage 시그니처와 충돌하지 않도록 좁혀서 캐스팅한다.
const ctx = self as unknown as {
  onmessage: ((event: MessageEvent<WorkerRequest>) => void) | null;
  postMessage(message: WorkerResponse): void;
};

ctx.onmessage = async (event) => {
  const request = event.data;

  if (request.kind === "detect") {
    ctx.postMessage({ kind: "detect", id: request.id, formats: await detectEncoders() });
    return;
  }

  if (request.kind === "probe") {
    /*
     * **워커에서 읽는다.** 움직이는 GIF 를 판별하려면 파일을 훑어야 하는데,
     * 메인 스레드에서 하면 여러 장을 놓았을 때 화면이 멈춘다. 규칙 7.
     */
    try {
      const bytes = new Uint8Array(await request.file.arrayBuffer());
      ctx.postMessage({
        kind: "probed",
        id: request.id,
        animated: probeAnimation(bytes).animated,
      });
    } catch {
      // 못 읽었으면 그냥 정지 그림으로 본다 — 판별 실패가 변환을 막을 이유는 없다
      ctx.postMessage({ kind: "probed", id: request.id, animated: false });
    }
    return;
  }

  try {
    const { blob, width, height } = await convertImage(request.file, request.options);
    ctx.postMessage({ kind: "converted", id: request.id, blob, width, height });
  } catch (error) {
    ctx.postMessage({
      kind: "failed",
      id: request.id,
      message: error instanceof Error ? error.message : "UNKNOWN",
    });
  }
};
