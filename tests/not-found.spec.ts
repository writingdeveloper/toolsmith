import { expect, test } from "@playwright/test";
import { getDictionary } from "../lib/i18n";
import { HTML_LANG, LOCALES } from "../lib/i18n/config";

/*
 * 없는 주소.
 *
 * 예전에는 Next 기본 화면이 떴다 — **6개 언어 사이트에 영어 한 줄**("This page could
 * not be found"), 돌아갈 링크도 없었다. 지금은 주소의 언어 토막을 읽어 그 언어로 말하고
 * 그 언어의 도구 목록으로 보낸다.
 *
 * **개발 서버로 판정하지 말 것.** `next dev` 는 못 찾은 주소를 자기 오류 화면으로
 * 가로채는 경우가 있어, 실제로 무엇이 뜨는지는 빌드된 결과에서만 갈린다.
 * (2026-07-28 실측: dev 에서 `/ko/tools/없는것` 이 "This page couldn't load" 였다.)
 */
test.describe("없는 주소", () => {
  test.skip(!process.env.BASE_URL, "빌드된 결과에서만 의미가 있다");

  test("주소의 언어로 말하고 그 언어의 목록으로 보낸다", async ({ page }) => {
    for (const locale of LOCALES) {
      const dict = getDictionary(locale);
      const response = await page.goto(`/${locale}/tools/이런-도구는-없다`);
      expect(response?.status(), locale).toBe(404);

      // 상태 코드만 404 이고 내용이 영어면 고치기 전과 같다
      await expect(page.getByRole("heading", { level: 1 }), locale).toHaveText(
        dict.common.notFoundTitle,
      );
      await expect(page.locator("html"), locale).toHaveAttribute("lang", HTML_LANG[locale]);

      const home = page.getByRole("link", { name: dict.common.notFoundHome });
      await expect(home, locale).toHaveAttribute("href", `/${locale}`);
    }
  });

  test("언어를 안 붙인 도구 주소도 안내 화면으로 간다", async ({ page }) => {
    // 공유하다가 `/ko` 를 빠뜨리는 것은 사람이 실제로 하는 실수다.
    const response = await page.goto("/tools/pdf-merge");
    expect(response?.status()).toBe(404);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(
      getDictionary("en").common.notFoundTitle,
    );
  });

  test("색인하지 말라고 적는다", async ({ page }) => {
    await page.goto("/ko/tools/없는것");
    // 태그는 딱 하나여야 한다 — 한때 우리가 적은 것과 Next 가 붙인 것이 겹쳐 둘이었다.
    await expect(page.locator('meta[name="robots"]')).toHaveCount(1);
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/);
  });
});
