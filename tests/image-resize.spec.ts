import path from "node:path";
import { expect, test, type Page } from "@playwright/test";
import { planResize } from "../lib/image/resize-core";

/** 1600×1200 (4:3) JPEG. */
const PHOTO = path.join(__dirname, "fixtures", "photo.jpg");

async function run(page: Page, n = 1) {
  await page.getByRole("button", { name: `${n}장 처리하기` }).click();
  await expect(page.locator("a[download]")).toHaveCount(n, { timeout: 60_000 });
}

/** 결과 blob 을 실제로 디코드한다. 화면의 숫자를 믿지 않는다. */
async function inspect(page: Page) {
  return page.evaluate(async () => {
    const anchor = document.querySelector<HTMLAnchorElement>("a[download]")!;
    const blob = await (await fetch(anchor.href)).blob();
    const bitmap = await createImageBitmap(blob);
    const out = { name: anchor.download, width: bitmap.width, height: bitmap.height, size: blob.size };
    bitmap.close();
    return out;
  });
}

/* 계산은 브라우저 없이도 확인할 수 있다 — 잘라내기 규칙이 여기서 고정된다. */
test("가운데에서 그 비율의 가장 큰 사각형을 잡는다", () => {
  // 1600×1200 에서 1:1 → 1200×1200, 좌우로 200씩 버린다
  expect(planResize(1600, 1200, { width: 0, crop: "1:1" })).toMatchObject({
    sx: 200,
    sy: 0,
    sw: 1200,
    sh: 1200,
  });
  // 세로가 긴 원본에서 16:9 → 위아래를 버린다
  expect(planResize(1000, 2000, { width: 0, crop: "16:9" })).toMatchObject({ sw: 1000, sh: 563 });
});

test("원본보다 크게 요청해도 늘리지 않는다", () => {
  const plan = planResize(800, 600, { width: 4000, crop: "none" });
  expect(plan.width).toBe(800);
  expect(plan.height).toBe(600);
});

test.describe("브라우저", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/ko/tools/image-resize");
  });

  test("요청한 너비로 정확히 나오고 비율이 유지된다", async ({ page }) => {
    await page.locator('input[type="file"]').setInputFiles(PHOTO);
    await page.getByLabel("너비 (px)").fill("800");
    await run(page);

    const result = await inspect(page);
    // 1600×1200 의 절반 = 800×600
    expect(result.width).toBe(800);
    expect(result.height).toBe(600);
    expect(result.name).toBe("photo.jpg");
  });

  test("1:1 을 고르면 실제로 정사각형이 나온다", async ({ page }) => {
    await page.locator('input[type="file"]').setInputFiles(PHOTO);
    await page.getByLabel("자를 비율").selectOption("1:1");
    await page.getByLabel("너비 (px)").fill("600");
    await run(page);

    const result = await inspect(page);
    expect(result.width).toBe(600);
    expect(result.height).toBe(600);
  });

  /** 화면과 워커가 같은 함수를 부르므로 어긋날 수 없다 — 그것을 확인한다. */
  test("누르기 전에 적힌 결과 크기가 파일과 정확히 같다", async ({ page }) => {
    await page.locator('input[type="file"]').setInputFiles(PHOTO);
    await page.getByLabel("자를 비율").selectOption("4:5");
    await page.getByLabel("너비 (px)").fill("540");

    await expect(page.getByText("1600×1200 → 540×675")).toBeVisible();
    await run(page);

    const result = await inspect(page);
    expect(`${result.width}×${result.height}`).toBe("540×675");
  });

  test("원본보다 큰 너비를 넣으면 그렇게 말하고 늘리지 않는다", async ({ page }) => {
    await page.locator('input[type="file"]').setInputFiles(PHOTO);
    await page.getByLabel("너비 (px)").fill("5000");

    await expect(page.getByText(/원본보다 크게 만들지 않았습니다/)).toBeVisible();
    await run(page);

    const result = await inspect(page);
    expect(result.width).toBe(1600);
  });

  test("처리 중 파일이 네트워크로 나가지 않는다", async ({ page }) => {
    const outbound: string[] = [];
    page.on("request", (request) => {
      const method = request.method();
      if (method === "POST" || method === "PUT") outbound.push(request.url());
    });
    await page.locator('input[type="file"]').setInputFiles(PHOTO);
    await run(page);
    expect(outbound.filter((url) => !/google|doubleclick/.test(url))).toEqual([]);
  });
});
