import path from "node:path";
import { expect, test, type Page } from "@playwright/test";

/** 1600×1200 JPEG. 압축 여지가 있어야 절감률이 의미 있다. */
const PHOTO = path.join(__dirname, "fixtures", "photo.jpg");
/** 무손실 PNG — 품질을 내려도 줄지 않는다. 그 사실을 말하는지가 이 도구의 정직함이다. */
const PNG = path.join(__dirname, "fixtures", "alpha.png");

async function run(page: Page, n = 1) {
  await page.getByRole("button", { name: `${n}장 압축하기` }).click();
  await expect(page.locator("a[download]")).toHaveCount(n, { timeout: 60_000 });
}

/** 결과 blob 을 실제로 디코드해서 본다. 화면의 숫자를 믿지 않는다. */
async function inspect(page: Page) {
  return page.evaluate(async () => {
    const anchor = document.querySelector<HTMLAnchorElement>("a[download]")!;
    const blob = await (await fetch(anchor.href)).blob();
    const head = [...new Uint8Array(await blob.slice(0, 12).arrayBuffer())];
    const bitmap = await createImageBitmap(blob);
    const out = {
      name: anchor.download,
      size: blob.size,
      head,
      width: bitmap.width,
      height: bitmap.height,
    };
    bitmap.close();
    return out;
  });
}

test.beforeEach(async ({ page }) => {
  await page.goto("/ko/tools/image-compress");
});

test("JPG 는 JPG 로 나오고 실제로 작아진다", async ({ page }) => {
  await page.locator('input[type="file"]').setInputFiles(PHOTO);
  await run(page);

  const result = await inspect(page);
  // 형식 유지가 이 도구의 약속이다 — JPEG 매직바이트 FF D8 FF
  expect(result.head.slice(0, 3)).toEqual([0xff, 0xd8, 0xff]);
  expect(result.name).toBe("photo.jpg");
  // 픽셀은 그대로 두고 용량만 줄인다
  expect(result.width).toBe(1600);
  expect(result.height).toBe(1200);
  expect(result.size).toBeLessThan(300_000);
});

test("품질을 더 낮추면 더 작아진다", async ({ page }) => {
  await page.locator('input[type="file"]').setInputFiles(PHOTO);
  await page.getByLabel(/품질/).fill("0.9");
  await run(page);
  const high = (await inspect(page)).size;

  await page.getByRole("button", { name: "비우기" }).click();
  await page.locator('input[type="file"]').setInputFiles(PHOTO);
  await page.getByLabel(/품질/).fill("0.4");
  await run(page);
  const low = (await inspect(page)).size;

  expect(low).toBeLessThan(high);
});

/**
 * PNG 를 넣고 품질을 내렸는데 크기가 그대로면 도구가 고장난 줄 안다.
 * 그래서 **넣는 순간** 왜 안 줄어드는지와 무엇을 하면 되는지를 말한다.
 */
test("PNG 는 품질로 줄지 않는다고 미리 말한다", async ({ page }) => {
  await page.locator('input[type="file"]').setInputFiles(PNG);
  await expect(page.getByText(/PNG 는 무손실이라 품질을 내려도 줄지 않습니다/)).toBeVisible();

  // JPG 를 넣었을 때는 할 말이 아니다.
  // (FAQ 본문에도 "PNG 는 무손실이라" 가 있으므로 안내 문구 전체로 맞춘다)
  await page.getByRole("button", { name: "비우기" }).click();
  await page.locator('input[type="file"]').setInputFiles(PHOTO);
  await expect(
    page.getByText(/PNG 는 무손실이라 품질을 내려도 줄지 않습니다/),
  ).toHaveCount(0);
});

test("출력을 WebP 로 바꾸면 진짜 WebP 가 나온다", async ({ page }) => {
  await page.locator('input[type="file"]').setInputFiles(PNG);
  await page.getByLabel("출력").selectOption("image/webp");
  await run(page);

  const result = await inspect(page);
  expect(result.name).toBe("alpha.webp");
  // RIFF....WEBP
  expect(String.fromCharCode(...result.head.slice(0, 4))).toBe("RIFF");
  expect(String.fromCharCode(...result.head.slice(8, 12))).toBe("WEBP");
});

test("여러 장을 한 번에 하고 합계를 보여 준다", async ({ page }) => {
  await page.locator('input[type="file"]').setInputFiles([PHOTO, PNG]);
  await run(page, 2);
  await expect(page.getByText(/^2장 · .+ → .+ \(-?\d+% 감소\)$/)).toBeVisible();
});

test("압축 중 파일이 네트워크로 나가지 않는다", async ({ page }) => {
  const outbound: string[] = [];
  page.on("request", (request) => {
    const method = request.method();
    if (method === "POST" || method === "PUT") outbound.push(request.url());
  });
  await page.locator('input[type="file"]').setInputFiles(PHOTO);
  await run(page);
  expect(outbound.filter((url) => !/google|doubleclick/.test(url))).toEqual([]);
});
