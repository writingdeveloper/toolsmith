import { expect, test } from "@playwright/test";
import { LOCALES } from "../lib/i18n/config";
import { LIVE_TOOLS } from "../lib/tools";

/**
 * 색인 설정은 배포본에서만 의미가 있다 (NEXT_PUBLIC_SITE_URL 이 있어야 robots 가 열린다).
 *   BASE_URL=https://toolsmith.writingdeveloper.blog pnpm test
 */
test.describe("배포본 색인 설정", () => {
  test.skip(!process.env.BASE_URL, "BASE_URL 로 배포본을 가리켰을 때만 실행한다");

  test("robots 가 열려 있고 사이트맵을 가리킨다", async ({ request }) => {
    const response = await request.get("/robots.txt");
    const body = await response.text();
    expect(body).toContain("Allow: /");
    expect(body).not.toContain("Disallow: /");
    expect(body).toMatch(/Sitemap: https:\/\/.+\/sitemap\.xml/);
  });

  test("사이트맵이 모든 언어 × 모든 도구를 싣고 x-default 를 붙인다", async ({ request }) => {
    const body = await (await request.get("/sitemap.xml")).text();
    const expected = LOCALES.length * (1 + LIVE_TOOLS.length);

    expect((body.match(/<loc>/g) ?? []).length).toBe(expected);
    // 페이지마다 x-default 가 하나씩 — head 의 hreflang 과 어긋나면 안 된다
    expect((body.match(/x-default/g) ?? []).length).toBe(expected);

    for (const locale of LOCALES) {
      for (const tool of LIVE_TOOLS) {
        expect(body, `${locale}/${tool.slug} 누락`).toContain(`/${locale}/tools/${tool.slug}<`);
      }
    }
  });

  test("배포 URL(*.vercel.app)은 색인되지 않는다", async ({ request }) => {
    // 본 도메인과 글자 하나까지 같은 문서라 중복 콘텐츠가 된다
    const response = await request.get("https://toolsmith-two.vercel.app/ko");
    expect(response.headers()["x-robots-tag"]).toContain("noindex");
  });
});
