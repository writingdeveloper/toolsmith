import { expect, test, type Page } from "@playwright/test";
import { getDictionary } from "../lib/i18n";
import { HTML_LANG, LOCALES } from "../lib/i18n/config";
import { LIVE_TOOLS } from "../lib/tools";

/** 페이지에 박힌 ld+json 을 전부 파싱한다. 문법이 깨지면 여기서 터진다. */
async function jsonLdOf(page: Page): Promise<Record<string, unknown>[]> {
  const blocks = await page
    .locator('script[type="application/ld+json"]')
    .evaluateAll((nodes) => nodes.map((node) => node.textContent ?? ""));
  return blocks.map((block) => JSON.parse(block) as Record<string, unknown>);
}

test("도구 페이지가 앱·FAQ·breadcrumb 을 기계가 읽을 수 있게 내놓는다", async ({ page }) => {
  await page.goto("/ko/tools/pdf-merge");
  const [graph, ...rest] = await jsonLdOf(page);
  expect(rest).toHaveLength(0);

  const nodes = graph["@graph"] as Record<string, unknown>[];
  const byType = new Map(nodes.map((node) => [node["@type"] as string, node]));
  expect([...byType.keys()].sort()).toEqual(["BreadcrumbList", "FAQPage", "WebApplication"]);

  const dict = getDictionary("ko");
  const tool = dict.tools["pdf-merge"];

  const app = byType.get("WebApplication")!;
  expect(app.name).toBe(tool.h1);
  expect(app.description).toBe(tool.metaDescription);
  expect(app.inLanguage).toBe("ko");
  expect(app.isAccessibleForFree).toBe(true);
  // 무료라고 적었으면 값도 0 이어야 한다
  expect((app.offers as Record<string, unknown>).price).toBe("0");
  // 받은 적 없는 평점을 지어내지 않는다
  expect(app.aggregateRating).toBeUndefined();

  const faq = byType.get("FAQPage")!;
  const questions = faq.mainEntity as Record<string, unknown>[];
  expect(questions.map((q) => q.name)).toEqual(tool.faq.map((entry) => entry.q));
});

test("구조화 데이터의 FAQ 가 화면에 실제로 보이는 Q&A 와 같다", async ({ page }) => {
  await page.goto("/ko/tools/pdf-split");
  const [graph] = await jsonLdOf(page);
  const nodes = graph["@graph"] as Record<string, unknown>[];
  const faq = nodes.find((node) => node["@type"] === "FAQPage")!;
  const questions = (faq.mainEntity as Record<string, unknown>[]).map((q) => q.name as string);

  // 보이지 않는 Q&A 를 구조화 데이터에만 넣는 것은 구글 정책 위반이다.
  // FAQ 구역 안만 본다 — 페이지 아래의 "다른 도구" 도 h2 라서 함께 잡히면
  // 이 검사가 무엇을 지키는지 흐려진다.
  const visible = await page.locator("[data-faq] h2").allInnerTexts();
  expect(questions).toEqual(visible);
});

test("모든 언어가 자기 언어의 구조화 데이터를 낸다", async ({ page }) => {
  for (const locale of LOCALES) {
    await page.goto(`/${locale}/tools/pdf-organize`);
    const [graph] = await jsonLdOf(page);
    const nodes = graph["@graph"] as Record<string, unknown>[];
    const app = nodes.find((node) => node["@type"] === "WebApplication")!;

    expect(app.inLanguage, locale).toBe(HTML_LANG[locale]);
    expect(app.name, locale).toBe(getDictionary(locale).tools["pdf-organize"].h1);
  }
});

test("홈은 사이트 자체를 설명하고 만든 주체를 가리킨다", async ({ page }) => {
  await page.goto("/en");
  const [graph] = await jsonLdOf(page);
  const nodes = graph["@graph"] as Array<Record<string, unknown>>;

  const site = nodes.find((node) => node["@type"] === "WebSite")!;
  expect(site.name).toBe("toolsmith");
  expect(site.inLanguage).toBe("en");

  // 사이트와 만든 주체가 이어져 있어야 한 덩어리로 읽힌다
  const org = nodes.find((node) => node["@type"] === "Organization")!;
  expect((site.publisher as { "@id": string })["@id"]).toBe(org["@id"]);
});

test("배포본은 절대 URL 로 자기를 가리킨다", async ({ page }) => {
  test.skip(!process.env.BASE_URL, "BASE_URL 로 배포본을 가리켰을 때만 의미가 있다");

  for (const tool of LIVE_TOOLS) {
    await page.goto(`/ko/tools/${tool.slug}`);
    const [graph] = await jsonLdOf(page);
    const nodes = graph["@graph"] as Record<string, unknown>[];
    const app = nodes.find((node) => node["@type"] === "WebApplication")!;
    expect(app.url, tool.slug).toBe(`${process.env.BASE_URL}/ko/tools/${tool.slug}`);
  }
});

/*
 * **루트 `/` 에는 구조화 데이터가 하나도 없었다 (2026-07-28).**
 *
 * 도구 페이지마다 세 개씩 넣어 두고도 바깥 검사 도구에서는 "JSON-LD 없음" 으로 보였다 —
 * 그런 도구는 대개 **입력한 도메인의 루트**를 보기 때문이다. 루트는 언어 선택 한 장이라
 * 도구 스키마를 넣을 수 없지만, 사이트와 만든 주체는 여기서도 말할 수 있다.
 */
test("언어 선택 루트에도 구조화 데이터가 있다", async ({ page }) => {
  await page.goto("/");
  const blocks = await page.locator('script[type="application/ld+json"]').allTextContents();
  expect(blocks).toHaveLength(1);

  const graph = JSON.parse(blocks[0])["@graph"] as Array<Record<string, unknown>>;
  const types = graph.map((node) => node["@type"]);
  expect(types).toContain("WebSite");
  expect(types).toContain("Organization");

  // WebSite 가 Organization 을 실제로 가리켜야 한 덩어리로 읽힌다
  const site = graph.find((node) => node["@type"] === "WebSite")!;
  const org = graph.find((node) => node["@type"] === "Organization")!;
  expect((site.publisher as { "@id": string })["@id"]).toBe(org["@id"]);
});

/*
 * 구조화 데이터는 **보이는 내용을 반영해야 한다**(구글 정책). BreadcrumbList 를
 * 넣어 두고 화면에는 아무것도 없던 상태를 이 검사가 막는다.
 */
test("BreadcrumbList 가 화면의 위치 표시와 같은 것을 말한다", async ({ page }) => {
  await page.goto("/ko/tools/pdf-merge");

  const crumb = page.locator("[data-breadcrumb]");
  await expect(crumb).toBeVisible();
  const shown = (await crumb.innerText({ timeout: 5_000 })).replace(/\s+/g, " ");

  const blocks = await page.locator('script[type="application/ld+json"]').allTextContents();
  const graph = JSON.parse(blocks[0])["@graph"] as Array<Record<string, unknown>>;
  const list = graph.find((node) => node["@type"] === "BreadcrumbList")!;
  const items = list.itemListElement as Array<{ name: string }>;

  for (const item of items) expect(shown).toContain(item.name);
});
