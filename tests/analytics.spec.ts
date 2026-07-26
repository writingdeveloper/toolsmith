import path from "node:path";
import { expect, test, type Page } from "@playwright/test";
import { isAnalytics } from "./net";

const PAGES5 = path.join(__dirname, "fixtures", "pages5.pdf");

/**
 * 분석을 **켠다.**
 *
 * 배포본은 자동화된 브라우저(`navigator.webdriver`)에 GA 태그를 심지 않는다 —
 * 우리 QA 가 통계를 만들면 개선 효과를 잴 수 없기 때문이다. 그런데 이 파일의 목적은
 * 그 태그가 무엇을 보내는지 확인하는 것이므로, 여기서만 명시적으로 켠다.
 * 켜는 길이 이 한 줄뿐이어야 다른 스펙이 실수로 통계를 더럽히지 않는다.
 */
async function optIn(page: Page) {
  await page.addInitScript(() => {
    (window as unknown as Record<string, unknown>).__toolsmithAnalyticsOptIn = true;
  });
}

/** 분석 태그로 나간 요청을 URL·본문까지 통째로 모은다. */
function watchAnalytics(page: Page): string[] {
  const seen: string[] = [];
  page.on("request", (request) => {
    if (!isAnalytics(request.url())) return;
    seen.push(`${request.url()}\n${request.postData() ?? ""}`);
  });
  return seen;
}

test("측정 ID 가 없으면 태그를 심지 않는다 (dev)", async ({ page }) => {
  test.skip(!!process.env.BASE_URL, "로컬 개발 서버에서만 의미가 있다");

  await page.goto("/ko/tools/pdf-merge");
  await page.waitForLoadState("networkidle");
  // 로컬 클릭이 프로덕션 통계를 더럽히면 안 된다
  await expect(page.locator('script[src*="googletagmanager"]')).toHaveCount(0);
});

test("배포본에는 GA 태그가 실려 있다", async ({ page }) => {
  test.skip(!process.env.BASE_URL, "BASE_URL 로 배포본을 가리켰을 때만 의미가 있다");

  await optIn(page);
  await page.goto("/ko");
  await expect(page.locator('script[src*="googletagmanager.com/gtag/js"]')).toHaveCount(1, {
    timeout: 30_000,
  });
});

/**
 * 이 사이트의 약속은 "파일이 기기를 떠나지 않는다" 이다.
 * GA 의 향상된 측정에는 **파일 다운로드 추적**이 있는데, 켜져 있으면 클릭된
 * 다운로드 링크의 이름이 그대로 전송된다. 우리 결과 파일 이름에는 사용자의
 * 원본 파일명이 들어간다 → 껐다. 정말 꺼졌는지는 여기서 확인한다.
 */
test("파일을 처리해도 파일명이 GA 로 나가지 않는다", async ({ page }) => {
  test.skip(!process.env.BASE_URL, "BASE_URL 로 배포본을 가리켰을 때만 의미가 있다");

  await optIn(page);
  const seen = watchAnalytics(page);
  await page.goto("/ko/tools/pdf-split");
  await page.waitForLoadState("networkidle");

  await page.locator('input[type="file"]').setInputFiles(PAGES5);
  await expect(page.getByText("5페이지")).toBeVisible({ timeout: 30_000 });
  await page.getByLabel("모든 페이지를 낱장으로").check();
  await page.getByRole("button", { name: /쪼개기$/ }).click();
  await expect(page.locator("a[download]")).toHaveCount(1, { timeout: 60_000 });

  // 다운로드 링크까지 실제로 눌러 본다 — file_download 이벤트가 있다면 여기서 터진다
  await page.locator("a[download]").click();

  /*
   * 양성 대조. GA 가 아무것도 보내지 않은 상태에서 "파일명이 없다" 를 확인하면
   * 아무것도 증명하지 못한다. 전환 이벤트가 실제로 도착할 때까지 기다린 뒤에 본다.
   * (GA4 는 이벤트를 모아 보내므로 고정 대기로는 놓친다.)
   */
  await expect.poll(() => seen.join("\n"), { timeout: 20_000 }).toContain("tool_completed");

  const traffic = seen.join("\n");
  for (const secret of ["pages5", "낱장", ".zip", ".pdf", "blob:"]) {
    expect(traffic, `GA 요청에 "${secret}" 가 들어 있다`).not.toContain(secret);
  }
  // 이벤트 이름 자체도 나가면 안 된다
  expect(traffic).not.toContain("file_download");
});

/**
 * 전환은 "방문했다" 가 아니라 "쓸모를 봤다" 여야 개선 효과를 잴 수 있다.
 * 도구가 결과를 만들어 낸 순간 tool_completed 를 보내되, 실린 것은 도구 이름뿐이다.
 */
test("도구를 끝까지 쓰면 전환 이벤트가 나가고, 실린 것은 도구 이름뿐이다", async ({ page }) => {
  test.skip(!process.env.BASE_URL, "BASE_URL 로 배포본을 가리켰을 때만 의미가 있다");

  await optIn(page);
  const seen = watchAnalytics(page);
  await page.goto("/ko/tools/pdf-merge");
  await page.waitForLoadState("networkidle");

  const A = path.join(__dirname, "fixtures", "a.pdf");
  const B = path.join(__dirname, "fixtures", "b.pdf");
  await page.locator('input[type="file"]').setInputFiles([A, B]);
  await expect(page.getByText("읽는 중")).toHaveCount(0, { timeout: 30_000 });
  await page.getByRole("button", { name: /병합하기$/ }).click();
  await expect(page.locator("a[download]")).toHaveCount(1, { timeout: 60_000 });

  // GA4 는 이벤트를 모아 보낸다 — 고정 대기로는 놓친다
  await expect.poll(() => seen.join("\n"), { timeout: 20_000 }).toContain("tool_completed");

  const traffic = seen.join("\n");
  expect(traffic).toContain("pdf-merge");
  // 도구 이름 말고는 아무것도 실리지 않는다
  for (const secret of ["a.pdf", "b.pdf", "merged", "blob:"]) {
    expect(traffic, `전환 이벤트에 "${secret}" 가 들어 있다`).not.toContain(secret);
  }
});

/**
 * 이 사이트의 통계는 우리 QA 로 만들어진 적이 있다.
 *
 * 2026-07-26 기준 GA 는 활성 사용자 282 / 세션 283 을 보여 주었는데, 검색 노출은 0 이었고
 * 인기 페이지 상위 5개가 전부 `/ko` 였다. Playwright 는 테스트마다 새 컨텍스트를 주므로
 * GA 가 **매 테스트를 새 사용자로 센 것**이다. 그래서 자동화된 브라우저에는 태그를
 * 심지 않기로 했고, 정말 안 심는지는 여기서 지킨다.
 */
test("자동화된 브라우저에는 GA 태그를 심지 않는다 (배포본)", async ({ page }) => {
  test.skip(!process.env.BASE_URL, "BASE_URL 로 배포본을 가리켰을 때만 의미가 있다");

  const seen = watchAnalytics(page);
  // opt-in 을 하지 않는다 — 다른 스펙과 똑같은 조건이다
  await page.goto("/ko/tools/pdf-merge");
  await page.waitForLoadState("networkidle");

  await expect(page.locator('script[src*="googletagmanager"]')).toHaveCount(0);
  expect(seen, `분석 요청이 나갔다: ${seen.join(" | ")}`).toEqual([]);
});

/**
 * 위의 차단이 **실사용자까지 막아 버리면** 통계가 통째로 죽는다. 조용히 죽는 실패라
 * 아무도 눈치채지 못한 채 몇 주가 지날 수 있으므로 여기서 지킨다.
 *
 * `navigator.webdriver` 를 false 로 돌려놓아 실사용자와 똑같은 조건을 만든 뒤,
 * 태그가 실제로 불려 나가는지 본다. 다만 **요청은 중간에서 끊는다** — 이 검사를
 * 돌릴 때마다 진짜 방문 한 건이 GA 에 쌓이면 그것도 오염이다.
 */
test("실사용자에게는 GA 태그가 그대로 나간다 (배포본)", async ({ page }) => {
  test.skip(!process.env.BASE_URL, "BASE_URL 로 배포본을 가리켰을 때만 의미가 있다");

  await page.addInitScript(() => {
    Object.defineProperty(navigator, "webdriver", { get: () => false });
  });

  const attempted: string[] = [];
  await page.route(/googletagmanager\.com|google-analytics\.com/, async (route) => {
    attempted.push(route.request().url());
    await route.abort();
  });

  await page.goto("/ko/tools/pdf-merge");
  await expect.poll(() => attempted.length, { timeout: 20_000 }).toBeGreaterThan(0);
  expect(attempted.join(" | ")).toContain("gtag/js");
});
