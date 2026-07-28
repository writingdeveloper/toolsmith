import { expect, test } from "@playwright/test";
import { GUIDE_LIST } from "../lib/guides";
import { HTML_LANG, LOCALES } from "../lib/i18n/config";
import { getDictionary } from "../lib/i18n";
import { LIVE_TOOLS } from "../lib/tools";

const PATHS = [
  "",
  ...LIVE_TOOLS.map((tool) => `/tools/${tool.slug}`),
  "/guides",
  ...GUIDE_LIST.map((guide) => `/guides/${guide.slug}`),
];

test("모든 언어 × 모든 도구 페이지가 열리고 lang 속성이 맞다", async ({ page }) => {
  /*
   * 이 하나가 언어 × 페이지를 전부 순회한다 — 도구가 늘 때마다 하는 일이 6개씩 는다.
   * 기본 30초는 도구 17개(108 페이지)에서 넘쳤다. 페이지 수에 맞춰 늘린다 —
   * 도구를 더할 때마다 사람이 이 숫자를 고치게 만들지 않는다.
   */
  test.setTimeout(LOCALES.length * PATHS.length * 1_000 + 30_000);

  for (const locale of LOCALES) {
    for (const path of PATHS) {
      const response = await page.goto(`/${locale}${path}`);
      expect(response?.status(), `${locale}${path}`).toBe(200);
      await expect(page.locator("html")).toHaveAttribute("lang", HTML_LANG[locale]);
      // h1 이 비어 있으면 사전 키가 빠진 것이다
      await expect(page.locator("h1")).not.toBeEmpty();
    }
  }
});

test("각 언어가 실제로 그 언어로 렌더된다 (사전이 영어로 새지 않는다)", async ({ page }) => {
  for (const locale of LOCALES) {
    const dict = getDictionary(locale);
    await page.goto(`/${locale}/tools/pdf-merge`);
    await expect(page.locator("h1")).toHaveText(dict.tools["pdf-merge"].h1);
    await expect(page.getByRole("heading", { level: 2 }).first()).toHaveText(
      dict.tools["pdf-merge"].faq[0].q,
    );
  }
});

test("hreflang 이 모든 언어와 x-default 를 가리킨다", async ({ page }) => {
  await page.goto("/ko/tools/pdf-split");

  const alternates = await page.locator('link[rel="alternate"]').evaluateAll((nodes) =>
    nodes.map((node) => ({
      hreflang: node.getAttribute("hreflang"),
      href: node.getAttribute("href"),
    })),
  );

  const byLang = new Map(alternates.map((entry) => [entry.hreflang, entry.href]));
  for (const locale of LOCALES) {
    expect(byLang.get(HTML_LANG[locale]), `${locale} 누락`).toContain(`/${locale}/tools/pdf-split`);
  }
  // 언어를 고르지 않은 방문자가 갈 곳이 지정돼 있어야 한다
  expect(byLang.get("x-default")).toContain("/en/tools/pdf-split");
});

test("canonical 은 자기 언어판을 가리킨다", async ({ page }) => {
  await page.goto("/ja/tools/image-convert");
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    "href",
    /\/ja\/tools\/image-convert$/,
  );
});

test("루트는 언어 선택 화면이고 6개 언어를 모두 링크한다", async ({ page }) => {
  await page.goto("/");
  for (const locale of LOCALES) {
    await expect(page.locator(`a[href="/${locale}"]`).first()).toBeVisible();
  }
});

test("언어를 바꿔도 보고 있던 도구에 그대로 남는다", async ({ page }) => {
  await page.goto("/ko/tools/pdf-split");
  await page.getByLabel("Language").selectOption("de");
  await page.waitForURL("**/de/tools/pdf-split");
  await expect(page.locator("h1")).toHaveText(getDictionary("de").tools["pdf-split"].h1);
});

test("없는 언어는 404 다", async ({ page }) => {
  const response = await page.goto("/xx/tools/pdf-merge");
  expect(response?.status()).toBe(404);
});
