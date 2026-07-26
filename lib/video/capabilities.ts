/**
 * 영상 도구가 이 브라우저에서 실제로 돌 수 있는지 묻는다.
 *
 * WebCodecs 는 있다고 다 되는 것이 아니다 — 코덱 지원은 브라우저·OS·하드웨어마다
 * 다르다. "있다" 가 아니라 "이 설정으로 인코딩할 수 있냐" 를 직접 물어본다
 * (이미지 도구에서 convertToBlob 결과를 대조하는 것과 같은 이유).
 */

let cached: boolean | null = null;
let audioCached: boolean | null = null;
let gifCached: boolean | null = null;

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

/**
 * GIF 는 **인코더가 필요 없다.** 색을 줄이고 GIF 를 짜는 일은 gifenc 가 JS 로 한다.
 * VideoEncoder 를 물어보면(canRunVideoTools) H.264 인코더가 없는 기기에서 멀쩡한
 * 도구를 못 쓴다고 잘못 말하게 된다 — 그래서 **디코더**만 확인한다.
 */
export async function canRunGifTools(): Promise<boolean> {
  if (gifCached !== null) return gifCached;
  if (typeof VideoDecoder === "undefined" || typeof OffscreenCanvas === "undefined") {
    return (gifCached = false);
  }

  try {
    const probe = await VideoDecoder.isConfigSupported({ codec: "avc1.42001f" });
    return (gifCached = Boolean(probe.supported));
  } catch {
    return (gifCached = false);
  }
}

/**
 * 오디오 추출은 인코더가 필요 없다 — M4A 는 원본을 옮기기만 하고,
 * WAV 는 디코드한 PCM 을 그대로 쓴다. 그래서 **디코더**만 물어본다.
 */
export async function canRunAudioTools(): Promise<boolean> {
  if (audioCached !== null) return audioCached;
  if (typeof AudioDecoder === "undefined") return (audioCached = false);

  try {
    const probe = await AudioDecoder.isConfigSupported({
      codec: "mp4a.40.2",
      sampleRate: 48000,
      numberOfChannels: 2,
    });
    return (audioCached = Boolean(probe.supported));
  } catch {
    return (audioCached = false);
  }
}
