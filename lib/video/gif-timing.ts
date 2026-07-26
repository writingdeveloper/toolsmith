/**
 * GIF 타이밍 계산. 워커와 UI 가 **같은 수를 써야** 하므로 따로 떼어 두었다.
 * (gif-core 를 UI 에서 부르면 mp4box 경로까지 끌려 온다.)
 *
 * GIF 는 프레임 지연을 **1/100초 단위 정수**로만 적을 수 있다. 그래서 임의의 fps 를
 * 그대로 낼 수 없다 — 15fps 를 고르면 실제로는 7/100초 = 14.29fps 가 된다.
 * 이 파일이 그 반올림을 한 곳에 모아, 화면에 뜨는 숫자와 실제 파일이 어긋나지 않게 한다.
 */

/** 한 GIF 에 담는 프레임 수 상한. 넘으면 브라우저 메모리와 인내심이 먼저 무너진다. */
export const MAX_GIF_FRAMES = 400;

/** UI 에 내놓는 선택지. */
export const GIF_FPS_CHOICES = [20, 15, 10, 5] as const;

export interface GifTiming {
  /** 프레임 지연(ms). 항상 10의 배수다. */
  delayMs: number;
  /** 그 지연으로 실제로 나오는 초당 프레임 수 */
  fps: number;
}

export function gifTiming(requested: number): GifTiming {
  // 2/100초 미만은 브라우저마다 제각각 10/100초로 바꿔 버린다 → 50fps 가 현실적인 상한
  const centis = Math.min(100, Math.max(2, Math.round(100 / requested)));
  return { delayMs: centis * 10, fps: 100 / centis };
}

/** 이 길이·이 fps 면 프레임이 몇 장 나오는가. 버튼을 누르기 전에 보여 준다. */
export function estimateFrames(durationSec: number, requested: number): number {
  return Math.max(1, Math.ceil(durationSec * gifTiming(requested).fps));
}
