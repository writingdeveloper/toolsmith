import type { MetadataRoute } from "next";
import { GUIDE_LIST } from "@/lib/guides";
import { LOCALES } from "@/lib/i18n/config";
import { alternatesFor, SITE_URL } from "@/lib/site";
import { LAB_LIST } from "@/lib/lab";
import { LIVE_TOOLS } from "@/lib/tools";

/**
 * 언어 × 페이지를 전부 싣고, 각 항목이 자기 언어판 전부를 alternates 로 가리킨다.
 * 본 도메인이 없으면 절대 URL 을 만들 수 없으므로 빈 사이트맵을 낸다
 * (robots 도 이때는 전면 차단이라 앞뒤가 맞는다).
 */
export default function sitemap(): MetadataRoute.Sitemap {
  if (!SITE_URL) return [];

  const now = new Date();

  /**
   * 경로마다 우선순위와 마지막 수정일이 다르다.
   *
   * **설명 글의 날짜는 빌드 시각이 아니라 글을 고친 날이다.** 도구 페이지는 코드가
   * 바뀌면 화면도 바뀌므로 빌드 시각이 맞지만, 글은 안 고쳤는데 배포마다 날짜가
   * 올라가면 크롤러가 `lastmod` 자체를 안 믿게 된다.
   */
  const pages: { path: string; priority: number; lastModified: Date }[] = [
    { path: "", priority: 1, lastModified: now },
    ...LIVE_TOOLS.map((tool) => ({
      path: `/tools/${tool.slug}`,
      priority: 0.8,
      lastModified: now,
    })),
    { path: "/guides", priority: 0.6, lastModified: now },
  /*
   * Lab 은 색인된다. 이 층의 목적이 백링크라서다 — 숨기면 존재 이유가 사라진다.
   * 우선순위를 도구보다 낮게 두는 것은 실용성이 아니라 화제성으로 오는 자리이기 때문이다.
   */
  { path: "/lab", priority: 0.5, lastModified: now },
  ...LAB_LIST.map((entry) => ({
    path: `/lab/${entry.slug}`,
    priority: 0.5,
    lastModified: now,
  })),
    ...GUIDE_LIST.map((guide) => ({
      path: `/guides/${guide.slug}`,
      priority: 0.7,
      lastModified: new Date(`${guide.updated}T00:00:00Z`),
    })),
  ];

  /*
   * **언어 선택 화면(`/`)도 싣는다 (2026-07-28).**
   *
   * 도메인 루트인데 사이트맵에 없었다. 스스로를 canonical 로 삼게 고친 김에 여기에도
   * 넣는다 — canonical · og:url · sitemap 이 **셋 다 같은 주소**를 말해야 교차검증에서
   * 어긋나지 않는다.
   */
  const root = {
    url: `${SITE_URL}/`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    // 언어판 홈이 실제 진입점이다 — 루트는 그리로 보내는 한 장이다
    priority: 0.5,
  };

  return [
    root,
    ...pages.flatMap((page) =>
      LOCALES.map((locale) => ({
        url: `${SITE_URL}/${locale}${page.path}`,
        lastModified: page.lastModified,
        changeFrequency: "weekly" as const,
        priority: page.priority,
        // **`<head>` 와 같은 함수를 부른다.** 둘이 어긋나면 구글이 어느 쪽을 믿을지
        // 모른다 — x-default 를 여기서 따로 계산하다가 실제로 어긋날 뻔했다.
        alternates: { languages: alternatesFor(locale, page.path).languages },
      })),
    ),
  ];
}
