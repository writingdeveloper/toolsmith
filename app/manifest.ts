import type { MetadataRoute } from "next";
import { getDictionary } from "@/lib/i18n";
import { DEFAULT_LOCALE } from "@/lib/i18n/config";

/**
 * 웹 앱 매니페스트.
 *
 * `robots.ts` · `sitemap.ts` 와 같은 방식이다 — Next 가 **빌드 시점에 파일로 찍어** 두므로
 * 함수가 돌지 않는다. 규칙 1 을 깨지 않는다.
 *
 * `start_url` 은 언어 선택 페이지(`/`)다. 특정 언어로 보내면 홈 화면에 추가한 사람의
 * 언어를 우리가 마음대로 정하는 셈이 된다.
 */
export default function manifest(): MetadataRoute.Manifest {
  const dict = getDictionary(DEFAULT_LOCALE);
  return {
    name: dict.site.title,
    short_name: "toolsmith",
    description: dict.site.description,
    start_url: "/",
    display: "standalone",
    background_color: "#0b0b0e",
    theme_color: "#2563eb",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
    ],
  };
}
