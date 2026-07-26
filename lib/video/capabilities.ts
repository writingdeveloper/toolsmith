/**
 * 영상 도구가 이 브라우저에서 실제로 돌 수 있는지 묻는다.
 *
 * WebCodecs 는 있다고 다 되는 것이 아니다 — 코덱 지원은 브라우저·OS·하드웨어마다
 * 다르다. "있다" 가 아니라 "이 설정으로 인코딩할 수 있냐" 를 직접 물어본다
 * (이미지 도구에서 convertToBlob 결과를 대조하는 것과 같은 이유).
 */

let cached: boolean | null = null;

export async function canRunVideoTools(): Promise<boolean> {
  if (cached !== null) return cached;
  if (
    typeof VideoEncoder === "undefined" ||
    typeof VideoDecoder === "undefined" ||
    typeof OffscreenCanvas === "undefined"
  ) {
    return (cached = false);
  }

  try {
    // 우리가 실제로 내보내는 형식(H.264)을 물어본다
    const probe = await VideoEncoder.isConfigSupported({
      codec: "avc1.42001f",
      width: 640,
      height: 480,
      bitrate: 1_000_000,
    });
    return (cached = Boolean(probe.supported));
  } catch {
    return (cached = false);
  }
}
