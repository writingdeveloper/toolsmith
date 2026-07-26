import { expect, test } from "@playwright/test";
import { LIVE_TOOLS } from "../lib/tools";

/**
 * 도구 페이지가 서로를 가리키는지.
 *
 * 2026-07-26 이전에는 **하나도 가리키지 않았다** — 도구 페이지의 내부 링크는 홈 1개와
 * 자기 자신의 언어판 6개가 전부였다. 크롤러는 홈에서 한 번 내려온 뒤 더 갈 곳이 없고,
 * 한 가지 일을 끝낸 사람도 다음 도구를 그 자리에서 찾을 수 없었다.
 *
 * 화면에 무엇이 보이는가가 아니라 **HTML 안의 링크**를 센다. 크롤러가 보는 것이 그것이다.
 */
async function toolLinks(page: import("@playwright/test").Page, self: string): Promise<string[]> {
  return page.evaluate((slug: string) => {
    const hrefs = [...document.querySelectorAll("a[href]")].map((a) => a.getAttribute("href") ?? "");
    return [...new Set(hrefs.filter((h) => h.includes("/tools/") && !h.endsWith(`/tools/${slug}`)))];
  }, self);
}

for (const tool of LIVE_TOOLS) {
  test(`${tool.slug} 는 다른 도구로 가는 길을 갖는다`, async ({ page }) => {
    await page.goto(`/ko/tools/${tool.slug}`);
    const links = await toolLinks(page, tool.slug);
    expect(links.length, `${tool.slug} 의 다른 도구 링크: ${links.join(", ")}`).toBeGreaterThanOrEqual(4);
    // 전부 같은 언어판 안에 머물러야 한다 — 언어가 섞이면 hreflang 과 충돌한다
    for (const href of links) expect(href).toMatch(/^\/ko\/tools\//);
  });
}

test("같은 갈래를 먼저 권한다", async ({ page }) => {
  await page.goto("/ko/tools/pdf-merge");
  const links = await toolLinks(page, "pdf-merge");
  // PDF 도구 옆에는 PDF 도구가 먼저 와야 한다
  expect(links.slice(0, 3).every((href) => href.includes("/tools/pdf-"))).toBe(true);
});

test("권한 도구가 전부 실제로 열린다", async ({ page }) => {
  await page.goto("/ko/tools/data-query");
  const links = await toolLinks(page, "data-query");
  for (const href of links) {
    const response = await page.request.get(href);
    expect(response.status(), href).toBe(200);
  }
});
