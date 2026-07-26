"use client";

import { useSyncExternalStore } from "react";

/**
 * 브라우저가 이 도구를 돌릴 수 있는지 묻는다.
 *
 * `useEffect` 안에서 `setSupported(...)` 를 부르면 렌더가 한 번 더 돌고 린트도 막는다.
 * 그렇다고 렌더 중에 바로 부를 수도 없다 — 서버에는 `OffscreenCanvas` 도 `Worker` 도
 * 없어서 하이드레이션이 어긋난다. `useSyncExternalStore` 가 정확히 이 자리를 위한 것이다:
 * 서버는 `null`(아직 모른다), 클라이언트는 실제 값.
 *
 * 구독은 비워 둔다 — 브라우저 능력은 세션 중에 바뀌지 않는다.
 */
const neverChanges = () => () => {};
const unknownOnServer = () => null;

export function useCapability(probe: () => boolean): boolean | null {
  return useSyncExternalStore(neverChanges, probe, unknownOnServer);
}
