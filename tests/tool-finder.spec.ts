import { expect, test } from "@playwright/test";
import { getDictionary } from "../lib/i18n";
import { LIVE_TOOLS } from "../lib/tools";

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
