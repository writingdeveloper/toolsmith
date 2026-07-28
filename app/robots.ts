import type { MetadataRoute } from "next";

/**
 * 생성형 검색엔진의 크롤러들.
 *
 * `*` 규칙이 이미 전부 열어 두므로 **지금은 기능이 같다.** 그런데도 따로 적는 이유는,
 * 나중에 누군가 `*` 를 좁힐 때 이쪽이 조용히 함께 닫히지 않게 하려는 것이다.
 * 이 사이트에는 막을 이유가 없다 — 유입이 필요하고, 여기 있는 글은 전부 우리가 쓴
 * 설명이며, **사용자 파일은 애초에 서버에 없다.**
 *
 * 학습용(GPTBot·ClaudeBot·CCBot)과 답변 시점 조회용(OAI-SearchBot·Claude-SearchBot·
 * PerplexityBot)을 나누지 않고 전부 허용한다. 답변에 인용되려면 뒤엣것이 필요하고,
 * 앞엣것만 막아 봐야 얻는 것이 없다.
 */
const AI_CRAWLERS = [
  "GPTBot",
  "OAI-SearchBot",
  "ChatGPT-User",
  "ClaudeBot",
  "Claude-SearchBot",
  "Claude-User",
  "PerplexityBot",
  "Perplexity-User",
  "Google-Extended",
  "Applebot-Extended",
  "CCBot",
  "meta-externalagent",
];

/**
 * 본 도메인이 붙기 전까지 *.vercel.app 이 색인되는 것을 막는다.
 * 미리 색인되면 나중에 진짜 도메인과 중복 콘텐츠로 서로 경쟁하게 된다.
 * 도메인이 정해지면 NEXT_PUBLIC_SITE_URL 을 설정하는 것만으로 색인이 열린다.
 */
export default function robots(): MetadataRoute.Robots {
  const site = process.env.NEXT_PUBLIC_SITE_URL;
  if (!site) {
    return { rules: [{ userAgent: "*", disallow: "/" }] };
  }
  return {
    rules: [
      { userAgent: "*", allow: "/" },
      ...AI_CRAWLERS.map((userAgent) => ({ userAgent, allow: "/" })),
    ],
    sitemap: `${site}/sitemap.xml`,
  };
}
