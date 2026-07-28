/**
 * 이 그림이 움직이는가.
 *
 * **왜 필요한가 (2026-07-28 실측).** 이미지 변환은 GIF 를 받는다고 화면에 적어 두고
 * 실제로 받는다. 그런데 `createImageBitmap` 은 **첫 프레임만** 준다 — 움직이는 GIF
 * 978KB 를 넣으면 정지 WebP 12KB 가 나오고, 화면은 `-99%` 라고 자랑한다. 애니메이션이
 * 사라졌다는 말은 어디에도 없다. 규칙 3 위반이다.
 *
 * 고치는 방향은 "거절" 이 아니라 **"누르기 전에 말하기"** 다. 움직이는 GIF 에서 한 장을
 * 뽑고 싶은 사람도 있고, 영상 → GIF 도구가 이미 있으니 갈 곳도 있다.
 *
 * 세 형식의 판별 근거가 서로 다르다:
 * - **GIF** — 이미지 디스크립터(0x2C)가 두 개 이상. 블록을 걸어야 알 수 있어서 유일하게
 *   파일을 훑는다. **두 번째를 찾는 순간 멈춘다.**
 * - **APNG** — `acTL` 청크. 규격상 첫 `IDAT` 앞에 있어야 하므로 앞부분만 봐도 된다.
 * - **WebP** — `VP8X` 확장 헤더의 ANIMATION 비트(0x02). 파일 맨 앞 30바이트 안에 있다.
 *
 * window / document 를 참조하지 않는다 (워커에서 돈다).
 */

export interface AnimationProbe {
  animated: boolean;
  /** 셀 수 있으면 프레임 수. 두 장을 넘으면 2 에서 멈추므로 **정확한 총수가 아니다.** */
  frames: number;
}

const STILL: AnimationProbe = { animated: false, frames: 1 };

function text(bytes: Uint8Array, at: number, length: number): string {
  return String.fromCharCode(...bytes.subarray(at, at + length));
}

/**
 * GIF 의 블록을 걸으며 이미지 디스크립터를 센다.
 *
 * 서브블록은 **길이 바이트 + 그만큼**이 0 길이 블록까지 이어진다. 이 구조를 건너뛰지
 * 않고 0x2C 바이트만 찾으면 픽셀 데이터 안의 우연한 0x2C 를 프레임으로 잘못 센다.
 */
function probeGif(bytes: Uint8Array): AnimationProbe {
  const packed = bytes[10];
  let at = 13;
  if (packed & 0x80) at += 3 * (1 << ((packed & 7) + 1));

  let frames = 0;
  while (at < bytes.length) {
    const marker = bytes[at];
    if (marker === 0x3b) break; // 트레일러
    if (marker === 0x21) {
      // 확장 블록: 도입부 2바이트 뒤에 서브블록이 이어진다
      at += 2;
      while (at < bytes.length && bytes[at] !== 0) at += bytes[at] + 1;
      at += 1;
      continue;
    }
    if (marker !== 0x2c) break; // 알 수 없는 바이트 — 더 세지 않는다
    frames += 1;
    if (frames >= 2) return { animated: true, frames: 2 };

    const local = bytes[at + 9];
    at += 10;
    if (local & 0x80) at += 3 * (1 << ((local & 7) + 1));
    at += 1; // LZW 최소 코드 크기
    while (at < bytes.length && bytes[at] !== 0) at += bytes[at] + 1;
    at += 1;
  }
  return { animated: false, frames: Math.max(1, frames) };
}

/** APNG 인가. `acTL` 은 첫 `IDAT` 앞에 있어야 한다는 규격을 그대로 쓴다. */
function probePng(bytes: Uint8Array): AnimationProbe {
  let at = 8; // 서명
  while (at + 8 <= bytes.length) {
    const length = new DataView(bytes.buffer, bytes.byteOffset + at, 4).getUint32(0);
    const type = text(bytes, at + 4, 4);
    if (type === "acTL") {
      const frames = new DataView(bytes.buffer, bytes.byteOffset + at + 8, 4).getUint32(0);
      return { animated: true, frames: Math.max(2, frames) };
    }
    if (type === "IDAT") break; // 여기까지 없으면 APNG 가 아니다
    at += 12 + length; // 길이 4 + 종류 4 + 본문 + CRC 4
  }
  return STILL;
}

/** 움직이는 WebP 인가. `VP8X` 의 플래그 바이트에 ANIMATION 비트가 선다. */
function probeWebp(bytes: Uint8Array): AnimationProbe {
  if (text(bytes, 12, 4) !== "VP8X") return STILL;
  return (bytes[20] & 0x02) !== 0 ? { animated: true, frames: 2 } : STILL;
}

export function probeAnimation(bytes: Uint8Array): AnimationProbe {
  if (bytes.length < 24) return STILL;

  if (text(bytes, 0, 3) === "GIF") return probeGif(bytes);
  if (bytes[0] === 0x89 && text(bytes, 1, 3) === "PNG") return probePng(bytes);
  if (text(bytes, 0, 4) === "RIFF" && text(bytes, 8, 4) === "WEBP") return probeWebp(bytes);
  return STILL;
}
