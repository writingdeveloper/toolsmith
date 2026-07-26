import type { MetadataRoute } from "next";
import { DEFAULT_LOCALE, HTML_LANG, LOCALES } from "@/lib/i18n/config";
import { SITE_URL } from "@/lib/site";
import { LIVE_TOOLS } from "@/lib/tools";

/**
 * 언어 × 페이지를 전부 싣고, 각 항목이 자기 언어판 전부를 alternates 로 가리킨다.
 * 본 도메인이 없으면 절대 URL 을 만들 수 없으므로 빈 사이트맵을 낸다
 * (robots 도 이때는 전면 차단이라 앞뒤가 맞는다).
 */
export default function sitemap(): MetadataRoute.Sitemap {
  if (!SITE_URL) return [];

  const paths = ["", ...LIVE_TOOLS.map((tool) => `/tools/${tool.slug}`)];

  return paths.flatMap((path) =>
    LOCALES.map((locale) => ({
      url: `${SITE_URL}/${locale}${path}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: path === "" ? 1 : 0.8,
      alternates: {
        languages: {
          ...Object.fromEntries(
            LOCALES.map((other) => [HTML_LANG[other], `${SITE_URL}/${other}${path}`]),
          ),
          // head 의 hreflang 과 어긋나면 구글이 둘 중 무엇을 믿을지 모른다 — 여기도 넣는다
          "x-default": `${SITE_URL}/${DEFAULT_LOCALE}${path}`,
        },
      },
    })),
  );
}
