import { expect, test } from "@playwright/test";
import { getDictionary } from "../lib/i18n";
import { LOCALES } from "../lib/i18n/config";
import { LIVE_TOOLS } from "../lib/tools";

/**
 * 검색결과에서 잘리는 길이를 넘지 않는지 본다. 브라우저가 필요 없는 데이터 검사라
 * 배포본이 아니어도 돈다.
 *
 * 제목은 `%s | toolsmith` 템플릿이 붙어서 나가므로 접미사를 더해서 센다. 이 검사가
 * 없으면 번역이 길어질 때마다 조용히 잘린다 — 독일어가 특히 잘 넘친다.
 * (구글은 실제로는 픽셀로 자르지만, 글자 수가 손으로 지킬 수 있는 유일한 근사치다.)
 */
test("모든 언어의 제목·설명이 검색결과 잘림선 안에 있다", () => {
  const SUFFIX = " | toolsmith".length;
  const tooLong: string[] = [];

  for (const locale of LOCALES) {
    const dict = getDictionary(locale);
    for (const tool of LIVE_TOOLS) {
      const entry = dict.tools[tool.slug as keyof typeof dict.tools];
      const title = entry.metaTitle.length + SUFFIX;
      if (title > 60) tooLong.push(`${locale}/${tool.slug} 제목 ${title}자`);
      if (entry.metaDescription.length > 160) {
        tooLong.push(`${locale}/${tool.slug} 설명 ${entry.metaDescription.length}자`);
      }
    }
  }

  expect(tooLong.join("\n")).toBe("");
});

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
