/**
 * 영상의 회전. **이 저장소에서 회전을 판단하는 유일한 곳이다.**
 *
 * 휴대폰으로 세로 영상을 찍으면 픽셀은 **가로로 저장된다.** 센서가 가로이기 때문이고,
 * 세로로 보이게 하는 것은 `tkhd` 의 3×3 행렬 하나다. 재생기는 그 행렬을 적용해서
 * 그리므로 사용자는 세로 영상을 본다.
 *
 * 우리는 그 행렬을 **읽지도 다시 쓰지도 않았다.** 그래서 실측(2026-07-27)에서
 * 변환·자르기·압축·GIF 넷이 전부 세로 영상을 **옆으로 누운 결과**로 내놓았다.
 * 표본은 Chromium 미디어 테스트 자산의 `bear_rotate_{0,90,180,270}.mp4` 다 —
 * 같은 그림을 네 방향으로만 다르게 적어 둔 것이라 방향만 따로 떼어 볼 수 있다.
 *
 * 고치는 방법이 출력에 따라 **둘로 갈린다.** 어느 쪽인지가 이 파일에 적혀 있다:
 *
 * - **상자에 회전을 적을 수 있는 출력(MP4)** — 픽셀을 그대로 두고 행렬만 다시 쓴다.
 *   재mux 경로(자르기·MOV→MP4)는 애초에 픽셀을 건드리지 않으므로 이 길밖에 없다.
 *   `mp4-muxer` 의 `rotation` 옵션이 그 자리다.
 * - **적을 수 없는 출력(WebM·GIF)** — `drawRotated()` 로 픽셀을 실제로 돌려 굽는다.
 *   WebM(Matroska)의 회전은 재생기 지원이 고르지 않고 GIF 에는 개념 자체가 없다.
 *
 * window / document 를 참조하지 않는다 (워커에서 돈다).
 */

export type Rotation = 0 | 90 | 180 | 270;

/**
 * `tkhd` 행렬에서 회전각(시계방향)을 읽는다.
 *
 * 행렬은 `[a b u; c d v; x y w]` 순서로 저장되고 우리에게 필요한 것은 `a`(=m[0])와
 * `b`(=m[1]) 뿐이다. 값은 16.16 고정소수점이지만 **부호와 0 여부만 보므로 나눌 필요가
 * 없다.** 90도 배수가 아닌 회전(기울이기)은 이 도구들이 다룰 수 있는 물건이 아니라
 * 가장 가까운 90도 배수로 본다.
 */
export function readRotation(matrix: ArrayLike<number> | undefined | null): Rotation {
  if (!matrix || matrix.length < 5) return 0;
  const a = matrix[0];
  const b = matrix[1];
  if (a === 0 && b === 0) return 0;
  if (Math.abs(a) >= Math.abs(b)) return a >= 0 ? 0 : 180;
  return b > 0 ? 90 : 270;
}

/** 90·270 도에서는 가로세로가 바뀐다. */
export function isQuarterTurn(rotation: Rotation): boolean {
  return rotation === 90 || rotation === 270;
}

/**
 * 저장 크기를 **사용자에게 보이는 크기**로 옮긴다.
 *
 * 화면에 적는 숫자는 전부 이 값이어야 한다. 저장 크기를 그대로 적으면 세로 영상을
 * 넣은 사람에게 "1280×720" 이라고 말하게 된다 — 재생기는 720×1280 으로 보여 주는데.
 */
export function displaySize(
  size: { width: number; height: number },
  rotation: Rotation,
): { width: number; height: number } {
  return isQuarterTurn(rotation)
    ? { width: size.height, height: size.width }
    : { width: size.width, height: size.height };
}

/**
 * 프레임을 회전시켜 캔버스에 채운다. `width`/`height` 는 **회전 뒤** 크기다.
 *
 * 크기 조절도 이 한 번의 `drawImage` 가 함께 한다 — 목적지 사각형이 곧 결과 크기라서,
 * 회전과 축소를 따로 두 번 그릴 이유가 없다.
 */
export function drawRotated(
  ctx: OffscreenCanvasRenderingContext2D,
  frame: CanvasImageSource,
  rotation: Rotation,
  width: number,
  height: number,
): void {
  if (rotation === 0) {
    ctx.drawImage(frame, 0, 0, width, height);
    return;
  }
  ctx.save();
  if (rotation === 90) {
    // 새 x축이 아래를, y축이 왼쪽을 향한다 → 목적지 사각형은 가로세로가 뒤바뀐다
    ctx.translate(width, 0);
    ctx.rotate(Math.PI / 2);
    ctx.drawImage(frame, 0, 0, height, width);
  } else if (rotation === 180) {
    ctx.translate(width, height);
    ctx.rotate(Math.PI);
    ctx.drawImage(frame, 0, 0, width, height);
  } else {
    ctx.translate(0, height);
    ctx.rotate(-Math.PI / 2);
    ctx.drawImage(frame, 0, 0, height, width);
  }
  ctx.restore();
}
