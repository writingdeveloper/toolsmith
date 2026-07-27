import path from "node:path";
import { expect, test, type Page } from "@playwright/test";
import { PDFArray, PDFDocument, PDFName, PDFRawStream } from "pdf-lib";
import { isAnalytics } from "./net";
import { downloadResult, pagesOf } from "./pdf-helpers";

const FIXTURES = path.join(__dirname, "fixtures");
// 2쪽. 1600×1200 고품질 JPEG 한 장을 두 쪽이 공유하고, 쪽마다 글자(C1/C2)가 있다.
const PHOTO = path.join(FIXTURES, "photo.pdf");
// 사진이 없는 순수 텍스트 PDF — 짜낼 것이 없는 경우
const PAGES5 = path.join(FIXTURES, "pages5.pdf");
const ENCRYPTED = path.join(FIXTURES, "encrypted.pdf");

interface Embedded {
  width: number;
  height: number;
  bytes: number;
  colorSpace: string;
  /** 진짜 JPEG 인지 (SOI 매직) */
  jpeg: boolean;
}

/** 결과 PDF 안에 실제로 박혀 있는 이미지들을 꺼내 본다. */
async function imagesOf(bytes: Buffer): Promise<Embedded[]> {
  const doc = await PDFDocument.load(bytes);
  const out: Embedded[] = [];
  for (const [, obj] of doc.context.enumerateIndirectObjects()) {
    if (!(obj instanceof PDFRawStream)) continue;
    const dict = obj.dict;
    if (dict.get(PDFName.of("Subtype")) !== PDFName.of("Image")) continue;
    const filter = dict.get(PDFName.of("Filter"));
    const isJpeg =
      filter === PDFName.of("DCTDecode") ||
      (filter instanceof PDFArray &&
        filter.asArray().some((entry) => entry === PDFName.of("DCTDecode")));
    if (!isJpeg) continue;
    out.push({
      width: Number(String(dict.get(PDFName.of("Width")))),
      height: Number(String(dict.get(PDFName.of("Height")))),
      bytes: obj.contents.length,
      colorSpace: String(dict.get(PDFName.of("ColorSpace"))),
      jpeg: obj.contents[0] === 0xff && obj.contents[1] === 0xd8,
    });
  }
  return out;
}

async function open(page: Page, file: string, pageCount: number) {
  await page.locator('input[type="file"]').setInputFiles(file);
  await expect(page.getByText(`${pageCount}페이지`)).toBeVisible({ timeout: 30_000 });
}

async function compress(page: Page) {
  await page.getByRole("button", { name: "압축하기" }).click();
  await expect(page.locator("a[download]")).toHaveCount(1, { timeout: 120_000 });
  return downloadResult(page);
}

test.beforeEach(async ({ page }) => {
  await page.goto("/ko/tools/pdf-compress");
});

test("용량이 실제로 줄고, 결과는 열리는 진짜 PDF 다", async ({ page }) => {
  await open(page, PHOTO, 2);
  const result = await compress(page);

  expect(result.mime).toBe("application/pdf");
  expect(result.name).toBe("photo-압축.pdf");

  // 픽스처는 263KB. 눈에 띄게 줄어야 의미가 있다.
  expect(result.bytes.length).toBeLessThan(150_000);
  const pages = await pagesOf(result.bytes);
  expect(pages).toHaveLength(2);
});

test("글자는 글자로 남는다 — 페이지를 그림으로 굽지 않는다", async ({ page }) => {
  await open(page, PHOTO, 2);
  const result = await compress(page);

  // 래스터화했다면 콘텐츠 스트림에서 글자가 사라진다. 이것이 이 도구의 존재 이유다.
  const pages = await pagesOf(result.bytes);
  expect(pages.map((p) => p.text)).toEqual(["C1", "C2"]);
});

test("사진은 여전히 진짜 JPEG 이고 해상도 제한이 적용된다", async ({ page }) => {
  await open(page, PHOTO, 2);
  await page.getByLabel("사진 해상도").selectOption("1200");
  const result = await compress(page);

  const images = await imagesOf(result.bytes);
  expect(images).toHaveLength(1);
  const [image] = images;

  // 껍데기만 바꾸고 내용이 PNG 면 문서가 깨진다
  expect(image.jpeg).toBe(true);
  expect(image.colorSpace).toBe("/DeviceRGB");
  // 원본 1600×1200 → 긴 변 1200 제한
  expect(image.width).toBe(1200);
  expect(image.height).toBe(900);
  expect(image.bytes).toBeLessThan(262_387);
});

test("품질을 낮출수록 더 작아진다", async ({ page }) => {
  await open(page, PHOTO, 2);
  await page.getByLabel("사진 해상도").selectOption("0");

  await page.getByLabel("사진 품질").fill("0.9");
  const high = (await compress(page)).bytes.length;

  await page.getByLabel("사진 품질").fill("0.35");
  const low = (await compress(page)).bytes.length;

  expect(low).toBeLessThan(high);
});

test("짜낼 사진이 없으면 줄었다고 말하지 않는다", async ({ page }) => {
  await open(page, PAGES5, 5);
  await page.getByRole("button", { name: "압축하기" }).click();
  await expect(page.locator("[data-not-compressed]")).toBeVisible({ timeout: 120_000 });

  /*
   * 글자뿐인 PDF 다. 다시 저장하는 것만으로 몇 % 줄어들 수는 있지만 그건 우리가
   * 사진을 압축해서 얻은 것이 아니다. 그 몫을 절감률로 표시하면 하지 않은 일을
   * 한 것처럼 보이게 된다.
   */
  await expect(page.getByText("이 PDF 에는 다시 압축할 사진이 없습니다.")).toBeVisible();
  await expect(page.getByText(/\(-\d+%\)/)).toHaveCount(0);
  await expect(page.getByText(/다시 압축했습니다/)).toHaveCount(0);
});

test("암호로 보호된 PDF 는 열지 않고 거부한다", async ({ page }) => {
  await page.locator('input[type="file"]').setInputFiles(ENCRYPTED);
  await expect(page.getByText("암호로 보호된 PDF 입니다")).toBeVisible({ timeout: 30_000 });
  await expect(page.getByRole("button", { name: "압축하기" })).toHaveCount(0);
});

test("압축 중 파일이 네트워크로 나가지 않는다", async ({ page }) => {
  const outbound: string[] = [];
  page.on("request", (request) => {
    const method = request.method();
    // 분석 태그는 파일과 무관하다 — 내용 검사는 tests/analytics.spec.ts 가 맡는다
    if ((method === "POST" || method === "PUT") && !isAnalytics(request.url())) {
      outbound.push(request.url());
    }
  });

  await open(page, PHOTO, 2);
  await compress(page);

  expect(outbound).toEqual([]);
});

test("콘솔 에러 없이 동작한다", async ({ page }) => {
  const errors: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });

  await open(page, PHOTO, 2);
  await compress(page);

  expect(errors).toEqual([]);
});

/**
 * **줄이지 못했으면 결과를 주지 않는다** (2026-07-26, 실물 문서 QA 로 발견).
 *
 * 실제 PDF 의 사진은 JPEG 이 아닌 경우가 많다 — 받아 본 실파일 넷 중 셋이 그랬다.
 * 그런 파일은 손댈 것이 없는데도 결과를 내주고 있었고, pdf-lib 이 다시 쓰면서
 * **오히려 커졌다**(117쪽 논문 5.1MB → +17KB). 그걸 "…-압축.pdf" 로 받아 원본을
 * 덮어쓰면 사용자는 손해만 본다.
 *
 * `alpha.pdf` 는 그림이 PNG(FlateDecode)뿐이라 같은 상황을 재현한다.
 */
test("줄일 것이 없으면 내려받기를 주지 않고 이유를 말한다", async ({ page }) => {
  const ALPHA = path.join(FIXTURES, "alpha.pdf");
  await page.locator('input[type="file"]').setInputFiles(ALPHA);
  await page.getByRole("button", { name: /줄이기|압축/ }).first().click();

  await expect(page.locator("[data-not-compressed]")).toBeVisible({ timeout: 120_000 });
  await expect(page.locator("[data-not-compressed]")).toContainText("사진이 없습니다");
  // 원본보다 큰 파일을 "압축본" 이라고 내주지 않는다
  await expect(page.locator("a[download]")).toHaveCount(0);
});
