import { expect, test } from "@playwright/test";

/**
 * 화면 밝기.
 *
 * **여기서 지키는 것은 색이 아니라 순서다.** 어두운 화면을 고른 사람에게 흰 페이지가
 * 한 번 번쩍이고 나서 어두워지면, 색은 결국 맞지만 그 깜빡임은 되돌릴 수 없다.
 * 그래서 `data-theme` 이 **첫 페인트 전에** 확정돼 있어야 한다.
 */

test("OS 가 어두우면 고르지 않아도 어둡게 나온다", async ({ browser }) => {
  const context = await browser.newContext({ colorScheme: "dark" });
  const page = await context.newPage();
  await page.goto("/ko");
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await context.close();
});

test("OS 가 밝으면 밝게 나온다", async ({ browser }) => {
  const context = await browser.newContext({ colorScheme: "light" });
  const page = await context.newPage();
  await page.goto("/ko");
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  await context.close();
});

/**
 * **직접 고른 것이 OS 설정을 이겨야 한다.** 이것이 이 기능의 전부다 —
 * OS 를 따라가기만 할 거라면 `prefers-color-scheme` 만으로 충분했다.
 */
test("OS 가 어두워도 밝게를 고르면 밝아지고, 새로 열어도 남는다", async ({ browser }) => {
  const context = await browser.newContext({ colorScheme: "dark" });
  const page = await context.newPage();
  await page.goto("/ko");

  await page.locator("[data-theme-toggle]").selectOption("light");
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");

  /*
   * 다시 열어서 확인한다. 저장이 안 되면 여기서만 걸린다 — 같은 탭에서는
   * 메모리에 남은 상태로 통과해 버린다.
   */
  const again = await context.newPage();
  await again.goto("/ko/tools/pdf-merge");
  await expect(again.locator("html")).toHaveAttribute("data-theme", "light");
  // 고른 값이 선택 상자에도 되살아나야 한다
  await expect(again.locator("[data-theme-toggle]")).toHaveValue("light");

  await context.close();
});

/**
 * **시스템으로 되돌리면 저장된 값을 지워야 한다.** 지우지 않고 그때의 값을 적어 두면
 * 나중에 OS 설정을 바꿨을 때 따라가지 않는다 — 되돌린 적이 없는 것과 같아진다.
 */
test("시스템으로 되돌리면 다시 OS 를 따라간다", async ({ browser }) => {
  const context = await browser.newContext({ colorScheme: "dark" });
  const page = await context.newPage();
  await page.goto("/ko");

  await page.locator("[data-theme-toggle]").selectOption("light");
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  await page.locator("[data-theme-toggle]").selectOption("system");
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");

  const again = await context.newPage();
  await again.goto("/ko");
  await expect(again.locator("html")).toHaveAttribute("data-theme", "dark");
  await expect(again.locator("[data-theme-toggle]")).toHaveValue("system");

  await context.close();
});

/**
 * 저장소를 막아 둔 브라우저(사생활 보호 모드 등)에서 **읽기만 해도 예외가 난다.**
 * 그 예외가 `<head>` 의 인라인 스크립트에서 새어 나가면 문서 파싱이 그 자리에서 멈춰
 * **페이지가 통째로 비어 버린다.** try 로 감싼 것이 실제로 그것을 막는지 본다.
 */
test("localStorage 가 막혀 있어도 페이지가 뜬다", async ({ browser }) => {
  const context = await browser.newContext({ colorScheme: "dark" });
  await context.addInitScript(() => {
    Object.defineProperty(window, "localStorage", {
      configurable: true,
      get() {
        throw new Error("blocked");
      },
    });
  });
  const page = await context.newPage();
  await page.goto("/ko");

  await expect(page.locator("h1")).toBeVisible();
  // 고르는 것 자체는 되어야 한다. 기억만 안 될 뿐이다.
  await page.locator("[data-theme-toggle]").selectOption("light");
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");

  await context.close();
});
