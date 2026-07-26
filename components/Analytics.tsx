"use client";

import Script from "next/script";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { useCapability } from "@/lib/use-capability";

/**
 * GA 태그. **자동화된 브라우저에는 심지 않는다.**
 *
 * 이 저장소의 QA 규칙은 배포본에 같은 스펙을 그대로 치는 것이다
 * (`BASE_URL=… pnpm test`). 그런데 Playwright 는 테스트마다 새 컨텍스트를 주므로
 * GA 가 **매 테스트를 새 사용자로 센다** — 한 번 돌릴 때마다 방문 100여 건이 생기고,
 * 활성 사용자와 세션이 거의 1:1 로 붙는다(2026-07-26 실측: 사용자 282 / 세션 283,
 * 인기 페이지 상위 5개가 전부 `/ko`, 검색 노출 0). 우리 손으로 만든 숫자가 대시보드를
 * 채우면 무엇을 고쳐야 좋아지는지 잴 수 없다.
 *
 * `navigator.webdriver` 는 자동화된 브라우저에서만 true 다. 다만 분석 자체를 검증하는
 * 스펙(`tests/analytics.spec.ts`)에서는 태그가 실제로 돌아야 하므로 그쪽만 명시적으로
 * 켤 수 있게 열어 둔다. 켜는 길이 하나뿐이어야 실수로 켜지지 않는다.
 */
const TEST_OPT_IN = "__toolsmithAnalyticsOptIn";

function shouldLoad(): boolean {
  if (typeof navigator === "undefined") return false;
  if (!navigator.webdriver) return true;
  return (window as unknown as Record<string, unknown>)[TEST_OPT_IN] === true;
}

type Gtag = (command: string, target: string | Date, params?: Record<string, unknown>) => void;

export function Analytics({ gaId }: { gaId: string }) {
  const load = useCapability(shouldLoad);
  const pathname = usePathname();
  /** 첫 페이지는 gtag('config') 가 이미 보냈다 — 여기서 또 보내면 두 번 세어진다. */
  const counted = useRef<string | null>(null);

  useEffect(() => {
    if (!load) return;
    if (counted.current === null) {
      counted.current = pathname;
      return;
    }
    if (counted.current === pathname) return;
    counted.current = pathname;
    // 앱 라우터의 화면 전환은 새 문서를 부르지 않는다. 이걸 안 보내면 홈에서 링크로
    // 들어간 방문이 통계에 없는 것이 되어, 도구별 인기가 실제보다 낮게 잡힌다.
    const gtag = (window as unknown as { gtag?: Gtag }).gtag;
    if (typeof gtag === "function") gtag("event", "page_view", { page_path: pathname });
  }, [load, pathname]);

  if (!load) return null;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
        strategy="afterInteractive"
      />
      <Script id="ga-init" strategy="afterInteractive">
        {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}window.gtag=gtag;gtag('js',new Date());gtag('config','${gaId}');`}
      </Script>
    </>
  );
}
