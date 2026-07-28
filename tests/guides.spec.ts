import { expect, test, type Page } from "@playwright/test";
import { getGuideCopy, GUIDE_LIST, GUIDES } from "../lib/guides";
import { LOCALES } from "../lib/i18n/config";
import { getDictionary } from "../lib/i18n";

/**
 * 설명 글.
 *
 * **여기서 지키는 것은 글의 존재가 아니라 길이다.** 글이 검색에서 잡혀도 도구로
 * 가는 길이 없으면 아무 일도 일어나지 않고, 도구에서 글로 가는 길이 없으면
 * 크롤러가 글을 발견하지 못한다. 양쪽을 다 센다.
 */

async function links(page: Page, prefix: string): Promise<string[]> {
  return page.evaluate((needle: string) => {
    const hrefs = [...document.querySelectorAll("a[href]")].map((a) => a.getAttribute("href") ?? "");
    return [...new Set(hrefs.filter((href) => href.includes(needle)))];
  }, prefix);
}

for (const guide of GUIDE_LIST) {
  test(`${guide.slug} 가 열리고 도구로 가는 길을 갖는다`, async ({ page }) => {
    const response = await page.goto(`/ko/guides/${guide.slug}`);
    expect(response?.status()).toBe(200);

    const article = getGuideCopy("ko").articles[guide.slug];
    await expect(page.locator("h1")).toHaveText(article.h1);

    // 본문이 실제로 그려져야 한다 — 문단 배열을 렌더하지 않으면 h1 만 남는다
    for (const section of article.sections) {
      await expect(page.getByRole("heading", { level: 2, name: section.h2 })).toBeVisible();
    }

    /*
     * **글은 도구에서 끝난다.** 여기가 없으면 글은 읽고 나갈 뿐인 페이지가 된다 —
     * 이 사이트에서 글을 쓰는 유일한 이유가 사라진다.
     */
    const toolLinks = await links(page, "/ko/tools/");
    expect(toolLinks.length, `${guide.slug} 의 도구 링크`).toBe(guide.tools.length);
    for (const tool of guide.tools) expect(toolLinks).toContain(`/ko/tools/${tool}`);
  });
}

/**
 * **별표가 화면에 찍히면 안 된다 (2026-07-28 실측, 프로덕션).**
 *
 * 본문을 문자열 그대로 그렸더니 여섯 언어의 글에 들어 있던 `**…**` 가 별표째 나왔다.
 * 강조가 뜻을 나르는 자리들이라 지우는 대신 그리기로 했고(`components/RichText.tsx`),
 * 그 판단을 여기서 못 박는다. **언어를 전부 돈다** — 한 언어만 보면 나머지 다섯에
 * 남은 별표를 못 본다.
 */
test("강조가 별표가 아니라 굵은 글씨로 나온다", async ({ page }) => {
  for (const locale of LOCALES) {
    for (const guide of GUIDE_LIST) {
      await page.goto(`/${locale}/guides/${guide.slug}`);
      const text = await page.locator("main").innerText({ timeout: 10_000 });
      expect(text, `${locale}/${guide.slug} 에 별표가 남았다`).not.toContain("**");
    }
  }
  // 그리고 실제로 강조가 그려지긴 해야 한다 — 전부 지워 놓고 통과하면 의미가 없다
  await page.goto("/ko/guides/mov-vs-mp4");
  expect(await page.locator("main strong").count()).toBeGreaterThan(0);
});

test("도구 페이지가 그 도구를 다룬 글을 가리킨다", async ({ page }) => {
  // 글이 걸려 있는 도구를 하나 고른다 — 걸려 있지 않은 도구에는 이 구역이 없는 것이 맞다
  await page.goto("/ko/tools/image-convert");
  const guideLinks = await links(page, "/ko/guides/");
  expect(guideLinks).toContain("/ko/guides/what-is-heic");
  expect(guideLinks).toContain("/ko/guides/image-formats");
  // 이미지 도구 페이지에 PDF 글이 붙으면 안 된다
  expect(guideLinks).not.toContain("/ko/guides/why-pdf-is-large");
});

test("홈에서 글로 가는 길이 있다", async ({ page }) => {
  await page.goto("/ko");
  const found = await links(page, "/ko/guides/");
  for (const guide of GUIDE_LIST) expect(found).toContain(`/ko/guides/${guide.slug}`);
});

test("목록이 글을 빠짐없이 싣는다", async ({ page }) => {
  await page.goto("/ko/guides");
  const found = await links(page, "/ko/guides/");
  expect(found).toHaveLength(GUIDE_LIST.length);
});

test("breadcrumb 이 목록을 거쳐 간다", async ({ page }) => {
  await page.goto("/ko/guides/mov-vs-mp4");
  const crumbs = await page
    .locator("[data-breadcrumb] li")
    .evaluateAll((nodes) => nodes.map((node) => node.textContent?.trim() ?? ""));
  // toolsmith / 가이드 / 글 — 구분자 li 를 빼면 셋이다
  const named = crumbs.filter((text) => text !== "/");
  expect(named).toEqual([
    "toolsmith",
    getGuideCopy("ko").hub.h1,
    getGuideCopy("ko").articles["mov-vs-mp4"].h1,
  ]);

  /*
   * 화면의 breadcrumb 과 스키마의 `BreadcrumbList` 가 어긋나면 안 된다 — 구글은
   * 구조화 데이터가 **보이는 내용을 반영해야 한다**고 못 박아 두었다.
   */
  const schema = await page
    .locator('script[type="application/ld+json"]')
    .first()
    .textContent({ timeout: 5_000 });
  const graph = JSON.parse(schema ?? "{}")["@graph"] as Record<string, unknown>[];
  const list = graph.find((node) => node["@type"] === "BreadcrumbList")!;
  const items = list.itemListElement as { name: string }[];
  expect(items.map((item) => item.name)).toEqual(named);
});

test("Article 스키마의 날짜가 레지스트리와 같다", async ({ page }) => {
  await page.goto("/ko/guides/what-is-heic");
  const schema = await page
    .locator('script[type="application/ld+json"]')
    .first()
    .textContent({ timeout: 5_000 });
  const graph = JSON.parse(schema ?? "{}")["@graph"] as Record<string, unknown>[];
  const article = graph.find((node) => node["@type"] === "Article")!;

  // **빌드 시각을 쓰면 안 된다.** 안 고쳤는데 배포마다 날짜가 바뀌면 값 자체를 못 믿는다.
  expect(article.datePublished).toBe(GUIDES["what-is-heic"].published);
  expect(article.dateModified).toBe(GUIDES["what-is-heic"].updated);
  // 사람 이름을 지어내지 않는다 — 쓴 주체는 이 사이트다
  expect(article.author).toHaveProperty("@id");
});

test("모든 언어가 실제로 그 언어로 렌더된다", async ({ page }) => {
  for (const locale of LOCALES) {
    await page.goto(`/${locale}/guides/why-pdf-is-large`);
    await expect(page.locator("h1")).toHaveText(
      getGuideCopy(locale).articles["why-pdf-is-large"].h1,
    );
  }
});

test("언어를 바꿔도 보고 있던 글에 그대로 남는다", async ({ page }) => {
  await page.goto("/ko/guides/image-formats");
  await page.getByLabel("Language").selectOption("ja");
  await page.waitForURL("**/ja/guides/image-formats");
  await expect(page.locator("h1")).toHaveText(getGuideCopy("ja").articles["image-formats"].h1);
});

test("없는 글은 404 다", async ({ page }) => {
  const response = await page.goto("/ko/guides/nope");
  expect(response?.status()).toBe(404);
});

/**
 * 글이 도구와 **같은 낱말을 노리면** 우리 두 페이지가 서로를 밀어낸다.
 * 제목이 통째로 겹치는 일만은 막아 둔다.
 */
test("글 제목이 도구 제목과 겹치지 않는다", () => {
  const clashes: string[] = [];
  for (const locale of LOCALES) {
    const toolTitles = new Set(
      Object.values(getDictionary(locale).tools).map((tool) => tool.metaTitle.toLowerCase()),
    );
    for (const guide of GUIDE_LIST) {
      const title = getGuideCopy(locale).articles[guide.slug].metaTitle.toLowerCase();
      if (toolTitles.has(title)) clashes.push(`${locale}/${guide.slug}`);
    }
  }
  expect(clashes.join(", ")).toBe("");
});
