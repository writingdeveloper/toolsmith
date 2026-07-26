import type { MetadataRoute } from "next";

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
    rules: [{ userAgent: "*", allow: "/" }],
    sitemap: `${site}/sitemap.xml`,
  };
}
