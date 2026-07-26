import path from "node:path";
import { expect, test, type Page } from "@playwright/test";
import { isAnalytics } from "./net";

const PAGES5 = path.join(__dirname, "fixtures", "pages5.pdf");

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
  await page.waitForTimeout(3000);

  const traffic = seen.join("\n");
  for (const secret of ["pages5", "낱장", ".zip", ".pdf", "blob:"]) {
    expect(traffic, `GA 요청에 "${secret}" 가 들어 있다`).not.toContain(secret);
  }
  // 이벤트 이름 자체도 나가면 안 된다
  expect(traffic).not.toContain("file_download");
});
