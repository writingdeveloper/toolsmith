/**
 * MP3 를 프레임으로 잘라 낸다.
 *
 * **왜 이것이 있는가.** 자막 생성과 스템 분리는 오랫동안 MP3 를 받지 않았고, FAQ 는
 * 그 이유를 "읽으려면 코드를 더 받아야 하기 때문" 이라고 적어 두었다. **그것은 사실이
 * 아니었다(2026-07-27 실측).** 브라우저의 `AudioDecoder` 는 **워커 안에서도** `mp3` 를
 * 지원한다:
 *
 * | | 메인 스레드 | 워커 안 |
 * |---|---|---|
 * | `AudioContext` / `OfflineAudioContext` | 있음 | **없음** |
 * | `AudioDecoder` | 있음 | **있음** |
 * | `mp3` 코덱 | true | **true** |
 *
 * 즉 받아야 할 것은 하나도 없고, 없던 것은 **우리 쪽 파서**였다. MP3 는 컨테이너가
 * 없는 날 프레임 흐름이라 누군가 프레임 경계를 짚어 줘야 `AudioDecoder` 에 넣을 수
 * 있다. 그 일을 여기서 한다 — MP4 는 `mp4-source.ts` 가 하는 것과 같은 자리다.
 *
 * window / document 를 참조하지 않는다.
 */

/** Layer III 비트레이트(kbps). 0 은 free, 15 는 잘못된 값이다. */
const BITRATE_V1 = [0, 32, 40, 48, 56, 64, 80, 96, 112, 128, 160, 192, 224, 256, 320, -1];
const BITRATE_V2 = [0, 8, 16, 24, 32, 40, 48, 56, 64, 80, 96, 112, 128, 144, 160, -1];

/** 버전별 표본율. 인덱스 3 은 예약값이라 쓰지 않는다. */
const RATE_V1 = [44100, 48000, 32000, -1];
const RATE_V2 = [22050, 24000, 16000, -1];
const RATE_V25 = [11025, 12000, 8000, -1];

export interface Mp3Stream {
  /** `AudioDecoder.configure` 에 그대로 넣는다. */
  codec: "mp3";
  sampleRate: number;
  channels: number;
  /** 인코딩된 프레임들. 각각이 `EncodedAudioChunk` 하나가 된다. */
  frames: Uint8Array[];
  /** 프레임 하나에 든 표본 수 — 타임스탬프를 만드는 데 쓴다. */
  samplesPerFrame: number;
}

/**
 * ID3v2 태그를 건너뛴다.
 *
 * **크기가 syncsafe 정수다** — 바이트마다 최상위 비트를 버리고 7비트씩만 쓴다.
 * 이것을 모르고 32비트로 읽으면 엉뚱한 자리로 건너뛰어 첫 프레임을 놓친다.
 */
function skipId3(bytes: Uint8Array): number {
  if (bytes.length < 10) return 0;
  if (bytes[0] !== 0x49 || bytes[1] !== 0x44 || bytes[2] !== 0x33) return 0;
  const size =
    (bytes[6] & 0x7f) * 0x200000 +
    (bytes[7] & 0x7f) * 0x4000 +
    (bytes[8] & 0x7f) * 0x80 +
    (bytes[9] & 0x7f);
  // 플래그의 6번 비트가 서면 footer 10바이트가 더 붙는다
  const footer = (bytes[5] & 0x10) !== 0 ? 10 : 0;
  return 10 + size + footer;
}

interface Header {
  length: number;
  sampleRate: number;
  channels: number;
  samplesPerFrame: number;
}

/** 이 자리에서 시작하는 Layer III 프레임의 머리를 읽는다. 아니면 null. */
function readHeader(bytes: Uint8Array, at: number): Header | null {
  if (at + 4 > bytes.length) return null;
  // 동기 낱말 11비트
  if (bytes[at] !== 0xff || (bytes[at + 1] & 0xe0) !== 0xe0) return null;

  const versionBits = (bytes[at + 1] >> 3) & 0x03;
  if (versionBits === 1) return null; // 예약값
  const layerBits = (bytes[at + 1] >> 1) & 0x03;
  if (layerBits !== 0x01) return null; // Layer III 만 받는다

  const bitrateIndex = (bytes[at + 2] >> 4) & 0x0f;
  const rateIndex = (bytes[at + 2] >> 2) & 0x03;
  if (rateIndex === 3) return null;

  const mpeg1 = versionBits === 3;
  const bitrate = (mpeg1 ? BITRATE_V1 : BITRATE_V2)[bitrateIndex];
  // free(0)와 잘못된 값(-1)은 길이를 계산할 수 없다
  if (bitrate <= 0) return null;

  const rates = mpeg1 ? RATE_V1 : versionBits === 2 ? RATE_V2 : RATE_V25;
  const sampleRate = rates[rateIndex];
  if (sampleRate <= 0) return null;

  const padding = (bytes[at + 2] >> 1) & 0x01;
  const channels = ((bytes[at + 3] >> 6) & 0x03) === 3 ? 1 : 2;
  // MPEG1 은 프레임당 1152 표본, MPEG2/2.5 는 576 이다 — 길이 식의 계수도 그래서 다르다
  const samplesPerFrame = mpeg1 ? 1152 : 576;
  const length = Math.floor(((samplesPerFrame / 8) * bitrate * 1000) / sampleRate) + padding;
  if (length < 4) return null;

  return { length, sampleRate, channels, samplesPerFrame };
}

/**
 * MP3 인가. 맞으면 프레임으로 잘라 돌려준다.
 *
 * **동기 낱말만 보고 판정하지 않는다.** 0xFF 0xEx 는 아무 파일에서나 우연히 나온다.
 * 그래서 머리를 읽어 길이를 구한 다음, **그 자리에 다음 프레임이 또 있는지** 확인한다.
 * 세 프레임이 연달아 맞으면 MP3 로 본다.
 */
export function readMp3(bytes: Uint8Array): Mp3Stream | null {
  const start = findFirstFrame(bytes);
  if (start < 0) return null;

  const first = readHeader(bytes, start);
  if (!first) return null;

  const frames: Uint8Array[] = [];
  let at = start;
  while (at + 4 <= bytes.length) {
    const header = readHeader(bytes, at);
    if (!header) {
      // 중간에 쓰레기가 끼는 파일이 실제로 있다. 다음 동기 낱말을 찾아 이어 간다.
      const next = findFirstFrame(bytes, at + 1);
      if (next < 0) break;
      at = next;
      continue;
    }
    const end = Math.min(at + header.length, bytes.length);
    frames.push(bytes.subarray(at, end));
    at = end;
  }

  // 첫 프레임이 Xing/Info 헤더면 소리가 없는 안내용 프레임이라 버린다
  if (frames.length > 0 && isXing(frames[0])) frames.shift();
  if (frames.length === 0) return null;

  return {
    codec: "mp3",
    sampleRate: first.sampleRate,
    channels: first.channels,
    frames,
    samplesPerFrame: first.samplesPerFrame,
  };
}

/** 연달아 세 프레임이 맞는 자리를 찾는다. */
function findFirstFrame(bytes: Uint8Array, from = -1): number {
  const begin = from >= 0 ? from : skipId3(bytes);
  for (let at = begin; at + 4 <= bytes.length; at += 1) {
    if (bytes[at] !== 0xff || (bytes[at + 1] & 0xe0) !== 0xe0) continue;
    let cursor = at;
    let matched = 0;
    while (matched < 3) {
      const header = readHeader(bytes, cursor);
      if (!header) break;
      cursor += header.length;
      matched += 1;
      // 파일 끝에 닿았으면 그것으로 충분하다
      if (cursor + 4 > bytes.length) {
        matched = 3;
        break;
      }
    }
    if (matched >= 3) return at;
  }
  return -1;
}

/** VBR 안내 프레임인가. 소리가 없으므로 디코더에 넣지 않는다. */
function isXing(frame: Uint8Array): boolean {
  const limit = Math.min(frame.length - 4, 200);
  for (let at = 4; at < limit; at += 1) {
    const tag = String.fromCharCode(frame[at], frame[at + 1], frame[at + 2], frame[at + 3]);
    if (tag === "Xing" || tag === "Info") return true;
  }
  return false;
}
