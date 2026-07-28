import type { MetadataRoute } from "next";
import { LOCALES } from "@/lib/i18n/config";
import { alternatesFor, SITE_URL } from "@/lib/site";
import { LIVE_TOOLS } from "@/lib/tools";

/**
 * 언어 × 페이지를 전부 싣고, 각 항목이 자기 언어판 전부를 alternates 로 가리킨다.
 * 본 도메인이 없으면 절대 URL 을 만들 수 없으므로 빈 사이트맵을 낸다
 * (robots 도 이때는 전면 차단이라 앞뒤가 맞는다).
 */
export default function sitemap(): MetadataRoute.Sitemap {
  if (!SITE_URL) return [];

  const paths = ["", ...LIVE_TOOLS.map((tool) => `/tools/${tool.slug}`)];

  /*
   * **언어 선택 화면(`/`)도 싣는다 (2026-07-28).**
   *
   * 도메인 루트인데 사이트맵에 없었다. 스스로를 canonical 로 삼게 고친 김에 여기에도
   * 넣는다 — canonical · og:url · sitemap 이 **셋 다 같은 주소**를 말해야 교차검증에서
   * 어긋나지 않는다.
   */
  const root = {
    url: `${SITE_URL}/`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    // 언어판 홈이 실제 진입점이다 — 루트는 그리로 보내는 한 장이다
    priority: 0.5,
  };

  return [
    root,
    ...paths.flatMap((path) =>
      LOCALES.map((locale) => ({
        url: `${SITE_URL}/${locale}${path}`,
        lastModified: new Date(),
        changeFrequency: "weekly" as const,
        priority: path === "" ? 1 : 0.8,
        // **`<head>` 와 같은 함수를 부른다.** 둘이 어긋나면 구글이 어느 쪽을 믿을지
        // 모른다 — x-default 를 여기서 따로 계산하다가 실제로 어긋날 뻔했다.
        alternates: { languages: alternatesFor(locale, path).languages },
      })),
    ),
  ];
}
