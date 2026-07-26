"use client";

import type { ToolSlug } from "@/lib/tools";

type Gtag = (command: "event", name: string, params?: Record<string, unknown>) => void;

/**
 * 도구가 결과를 실제로 만들어 냈다 — 이것이 이 사이트의 전환이다.
 * 방문이 아니라 "쓸모를 봤는가" 를 세야 개선 효과를 잴 수 있다.
 *
 * **파일에 관한 것은 아무것도 싣지 않는다.** 파일명·크기·페이지 수 전부 제외한다.
 * 파일명에는 사용자의 사정이 그대로 들어 있고(계약서, 진단서, 이력서…), 크기와
 * 페이지 수도 모이면 특정 문서를 지목하는 실마리가 된다. 어느 도구가 끝까지
 * 쓰였는지만 알면 충분하다.
 *
 * `@next/third-parties` 의 `sendGAEvent` 를 쓰지 않는 이유: dataLayer 에 밀어 넣기는
 * 하는데 gtag.js 가 그 항목을 집어가지 않았다(실측: 다른 항목과 달리
 * `gtm.uniqueEventId` 가 붙지 않고 collect 요청도 나가지 않았다).
 * 태그가 정의한 `window.gtag` 를 직접 부르는 쪽이 GA 의 공식 경로이고 확실하다.
 */
export function trackToolCompleted(slug: ToolSlug): void {
  if (typeof window === "undefined") return;
  const gtag = (window as unknown as { gtag?: Gtag }).gtag;
  // 측정 ID 가 없으면 태그 자체가 없다 — 로컬·프리뷰에서는 여기서 조용히 끝난다.
  if (typeof gtag !== "function") return;
  try {
    gtag("event", "tool_completed", { tool_slug: slug });
  } catch {
    // 분석이 실패해도 도구는 계속 동작해야 한다
  }
}
