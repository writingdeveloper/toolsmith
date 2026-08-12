import { expect, test } from "@playwright/test";
import { LOCALES } from "../lib/i18n/config";
import { getDictionary } from "../lib/i18n";
import { LIVE_TOOLS, UPCOMING_TOOLS } from "../lib/tools";

/*
 * 홈의 도구 찾기.
 *
 * 도구가 스물한 개다. 분류로 묶어도 "HEIC" 를 아는 사람은 그 낱말로 바로 가고 싶어 한다.
 *
 * **여기서 지켜야 하는 것은 두 가지가 동시에 성립한다는 것이다** — 사람에게는 걸러지고,
 * 크롤러에게는 전부 보인다. 걸러 주려고 클라이언트 컴포넌트로 만들었는데 그것 때문에
 * 링크가 HTML 에서 사라지면 132 페이지의 내부 링크 구조가 통째로 무너진다.
 */

test("자바스크립트 없이도 도구 링크가 전부 문서 안에 있다", async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto("/ko");

  for (const tool of LIVE_TOOLS) {
    await expect(page.locator(`a[href="/ko/tools/${tool.slug}"]`), tool.slug).toHaveCount(1);
  }
  await context.close();
});

test("형식 이름으로 찾으면 그 도구만 남는다", async ({ page }) => {
  await page.goto("/ko");
  const cards = page.locator('a[href^="/ko/tools/"]');
  await expect(cards).toHaveCount(LIVE_TOOLS.length);

  // HEIC 는 도구 **이름에 없다** — 설명까지 훑지 않으면 하나도 안 걸린다.
  await page.locator("[data-tool-search]").fill("heic");
  await expect(cards).not.toHaveCount(LIVE_TOOLS.length);
  const hrefs = await cards.evaluateAll((nodes) =>
    nodes.map((node) => (node as HTMLAnchorElement).getAttribute("href")),
  );
  expect(hrefs).toContain("/ko/tools/image-convert");
  // 용량 줄이기도 HEIC 를 받는다 — 설명에 그 낱말이 없어도 걸려야 한다
  expect(hrefs).toContain("/ko/tools/image-compress");
  expect(hrefs.every((href) => href !== null)).toBe(true);
});

test("슬러그로도 찾힌다", async ({ page }) => {
  await page.goto("/ko");
  await page.locator("[data-tool-search]").fill("pdf-organize");
  const cards = page.locator('a[href^="/ko/tools/"]');
  await expect(cards).toHaveCount(1);
  await expect(cards).toHaveAttribute("href", "/ko/tools/pdf-organize");
});

test("걸리는 것이 없으면 그렇다고 말한다", async ({ page }) => {
  await page.goto("/ko");
  await page.locator("[data-tool-search]").fill("이런것은없다zzz");
  await expect(page.locator('a[href^="/ko/tools/"]')).toHaveCount(0);
  await expect(page.locator("[data-search-empty]")).toHaveText(
    getDictionary("ko").home.searchEmpty,
  );
});

/*
 * **아무것도 안 오는데 "곧 온다" 고 말하지 않는다 (2026-08-12).**
 *
 * 21개가 전부 `live` 가 되면서 `UPCOMING_TOOLS` 가 빈 배열이 됐는데, 제목은 조건
 * 없이 렌더되어 홈 맨 아래에 **내용 없는 "Coming soon"** 이 6개 언어 전부에 떠
 * 있었다. 스펙 411개가 초록색인 채로 살아 있었다 — 아무도 그 자리를 안 봤기 때문이다.
 *
 * 언어를 전부 도는 이유: 제목 문자열이 사전마다 다르므로 한 언어만 보면 나머지
 * 다섯이 조용히 새는 종류의 결함이다.
 */
test("준비 중인 도구가 없으면 그 제목 자체가 안 나온다", async ({ page }) => {
  for (const locale of LOCALES) {
    await page.goto(`/${locale}`);
    const heading = page.getByRole("heading", {
      name: getDictionary(locale).home.upcomingHeading,
      exact: true,
    });
    await expect(heading, locale).toHaveCount(UPCOMING_TOOLS.length > 0 ? 1 : 0);
  }
});
