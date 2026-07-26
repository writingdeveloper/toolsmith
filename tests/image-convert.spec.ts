import path from "node:path";
import { expect, test, type Page } from "@playwright/test";

const FIXTURES = path.join(__dirname, "fixtures");
const PHOTO = path.join(FIXTURES, "photo.jpg");
const ALPHA = path.join(FIXTURES, "alpha.png");
const ROTATED = path.join(FIXTURES, "rotated.jpg");

interface Inspected {
  name: string;
  mime: string;
  size: number;
  width: number;
  height: number;
  /** 가운데 픽셀 [r,g,b,a] — 알파 보존과 배경 합성을 확인한다 */
  centerPixel: number[];
}

/** 결과 blob 을 실제로 디코드해서 검사한다. UI 텍스트만 믿지 않는다. */
async function inspectResults(page: Page): Promise<Inspected[]> {
  return page.evaluate(async () => {
    const links = [...document.querySelectorAll<HTMLAnchorElement>("a[download]")];
    const out = [];
    for (const anchor of links) {
      const blob = await (await fetch(anchor.href)).blob();
      const bitmap = await createImageBitmap(blob);
      const canvas = new OffscreenCanvas(bitmap.width, bitmap.height);
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(bitmap, 0, 0);
      const pixel = ctx.getImageData(
        Math.floor(bitmap.width / 2),
        Math.floor(bitmap.height / 2),
        1,
        1,
      ).data;
      out.push({
        name: anchor.download,
        mime: blob.type,
        size: blob.size,
        width: bitmap.width,
        height: bitmap.height,
        centerPixel: [...pixel],
      });
    }
    return out;
  });
}

async function addFiles(page: Page, files: string[]) {
  await page.locator('input[type="file"]').setInputFiles(files);
}

async function convert(page: Page, expected: number) {
  await page.getByRole("button", { name: /변환하기$/ }).click();
  await expect(page.locator("a[download]")).toHaveCount(expected, { timeout: 60_000 });
}

test.beforeEach(async ({ page }) => {
  await page.goto("/tools/image-convert");
});

test("브라우저가 실제로 인코딩 가능한 형식만 노출한다", async ({ page }) => {
  const select = page.getByLabel("출력 형식");
  await expect(select.locator("option")).not.toHaveCount(0);
  // 감지 결과에 없는 형식이 남아 있으면 사용자에게 거짓말을 하게 된다
  const values = await select.locator("option").evaluateAll((nodes) =>
    nodes.map((node) => (node as HTMLOptionElement).value),
  );
  for (const value of values) {
    expect(["image/jpeg", "image/png", "image/webp", "image/avif"]).toContain(value);
  }
});

test("WebP 변환: 실제 WebP 를 내보내고 알파를 보존한다", async ({ page }) => {
  await page.getByLabel("출력 형식").selectOption("image/webp");
  await addFiles(page, [PHOTO, ALPHA]);
  await convert(page, 2);

  const results = await inspectResults(page);
  expect(results).toHaveLength(2);

  const photo = results.find((r) => r.name === "photo.webp")!;
  expect(photo.mime).toBe("image/webp");
  expect(photo.width).toBe(1600);
  expect(photo.size).toBeLessThan(60_000); // 원본 171KB 대비 확실히 줄어야 한다

  const alpha = results.find((r) => r.name === "alpha.webp")!;
  // 원본이 alpha 0.35 → 약 89. 완전 불투명(255)이 되면 알파가 날아간 것이다.
  expect(alpha.centerPixel[3]).toBeGreaterThan(70);
  expect(alpha.centerPixel[3]).toBeLessThan(110);
});

test("JPG 변환: 투명 영역이 검게 뭉개지지 않고 흰색으로 합성된다", async ({ page }) => {
  await page.getByLabel("출력 형식").selectOption("image/jpeg");
  await addFiles(page, [ALPHA]);
  await convert(page, 1);

  const [alpha] = await inspectResults(page);
  expect(alpha.mime).toBe("image/jpeg");
  expect(alpha.centerPixel[3]).toBe(255);
  // 0.35 * [220,40,90] + 0.65 * 흰색 ≈ [243,180,197]
  expect(alpha.centerPixel[0]).toBeGreaterThan(200);
  expect(alpha.centerPixel[1]).toBeGreaterThan(140);
});

test("EXIF orientation 이 픽셀에 반영된다", async ({ page }) => {
  await addFiles(page, [ROTATED]);
  await convert(page, 1);

  const [rotated] = await inspectResults(page);
  // 원본은 1200x600 이지만 orientation=6 이므로 세로로 서야 한다
  expect(rotated.width).toBe(600);
  expect(rotated.height).toBe(1200);
});

test("긴 변 제한이 비율을 유지하며 적용된다", async ({ page }) => {
  await page.getByLabel("크기").selectOption("800");
  await addFiles(page, [PHOTO, ROTATED]);
  await convert(page, 2);

  const results = await inspectResults(page);
  for (const result of results) {
    expect(Math.max(result.width, result.height)).toBe(800);
  }
  const photo = results.find((r) => r.name.startsWith("photo"))!;
  expect(photo.width).toBe(800);
  expect(photo.height).toBe(600);
});

test("변환 중 파일이 네트워크로 나가지 않는다", async ({ page }) => {
  const outbound: string[] = [];
  page.on("request", (request) => {
    const method = request.method();
    if (method === "POST" || method === "PUT") outbound.push(request.url());
  });

  await addFiles(page, [PHOTO, ALPHA, ROTATED]);
  await convert(page, 3);

  expect(outbound).toEqual([]);
});

test("콘솔 에러 없이 동작한다", async ({ page }) => {
  const errors: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });

  await addFiles(page, [PHOTO]);
  await convert(page, 1);

  expect(errors).toEqual([]);
});
