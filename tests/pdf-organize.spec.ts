import path from "node:path";
import { expect, test, type Page } from "@playwright/test";
import { PDFDocument } from "pdf-lib";
import { downloadResult, pagesOf } from "./pdf-helpers";

const FIXTURES = path.join(__dirname, "fixtures");
// 5쪽: 201x401(P1) … 205x405(P5)
const PAGES5 = path.join(FIXTURES, "pages5.pdf");
// 1쪽에 /Rotate 90 이 박혀 있다
const TILTED = path.join(FIXTURES, "tilted.pdf");
const ENCRYPTED = path.join(FIXTURES, "encrypted.pdf");

async function open(page: Page, file: string, pageCount: number) {
  await page.locator('input[type="file"]').setInputFiles(file);
  await expect(page.getByRole("list", { name: "페이지" }).getByRole("listitem")).toHaveCount(
    pageCount,
    { timeout: 60_000 },
  );
}

async function save(page: Page) {
  await page.getByRole("button", { name: /저장$/ }).click();
  await expect(page.locator("a[download]")).toHaveCount(1, { timeout: 60_000 });
  return downloadResult(page);
}

/** 결과 PDF 의 페이지별 회전값(도). */
async function rotationsOf(bytes: Buffer): Promise<number[]> {
  const doc = await PDFDocument.load(bytes);
  return doc.getPages().map((page) => page.getRotation().angle);
}

test.beforeEach(async ({ page }) => {
  await page.goto("/ko/tools/pdf-organize");
});

test("모든 페이지를 실제로 그려서 보여준다", async ({ page }) => {
  await open(page, PAGES5, 5);

  // 썸네일이 떴다는 것과 픽셀이 그려졌다는 것은 다르다 — 디코드해서 본다
  const drawn = await page.evaluate(async () => {
    const images = [...document.querySelectorAll<HTMLImageElement>("li img")];
    const out: { width: number; height: number; inkRatio: number }[] = [];
    for (const image of images) {
      const blob = await (await fetch(image.src)).blob();
      const bitmap = await createImageBitmap(blob);
      const canvas = new OffscreenCanvas(bitmap.width, bitmap.height);
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(bitmap, 0, 0);
      const { data } = ctx.getImageData(0, 0, bitmap.width, bitmap.height);
      let ink = 0;
      for (let i = 0; i < data.length; i += 4) {
        // 흰 종이가 아닌 픽셀 = 실제로 그려진 내용
        if (data[i] < 200 || data[i + 1] < 200 || data[i + 2] < 200) ink += 1;
      }
      out.push({
        width: bitmap.width,
        height: bitmap.height,
        inkRatio: ink / (bitmap.width * bitmap.height),
      });
    }
    return out;
  });

  expect(drawn).toHaveLength(5);
  for (const thumb of drawn) {
    expect(thumb.width).toBeGreaterThan(50);
    // 글자가 조금이라도 찍혀야 한다. 0 이면 흰 종이만 그린 것이다.
    expect(thumb.inkRatio).toBeGreaterThan(0);
    // 반대로 온통 검으면 렌더가 깨진 것이다
    expect(thumb.inkRatio).toBeLessThan(0.5);
  }
});

test("지운 페이지는 결과에서 빠지고 나머지는 순서를 지킨다", async ({ page }) => {
  await open(page, PAGES5, 5);
  await page.getByRole("button", { name: "2쪽 삭제" }).click();
  await page.getByRole("button", { name: "4쪽 삭제" }).click();
  await expect(page.getByRole("button", { name: "3페이지로 저장" })).toBeEnabled();

  const result = await save(page);
  expect(result.mime).toBe("application/pdf");
  expect(result.name).toBe("pages5-정리.pdf");

  const pages = await pagesOf(result.bytes);
  expect(pages.map((p) => p.text)).toEqual(["P1", "P3", "P5"]);
});

test("삭제는 되돌릴 수 있다", async ({ page }) => {
  await open(page, PAGES5, 5);
  await page.getByRole("button", { name: "3쪽 삭제" }).click();
  await expect(page.getByRole("button", { name: "4페이지로 저장" })).toBeEnabled();

  await page.getByRole("button", { name: "3쪽 되돌리기" }).click();
  await expect(page.getByRole("button", { name: "5페이지로 저장" })).toBeEnabled();

  const pages = await pagesOf((await save(page)).bytes);
  expect(pages.map((p) => p.text)).toEqual(["P1", "P2", "P3", "P4", "P5"]);
});

test("회전이 결과 PDF 의 회전값에 실제로 기록된다", async ({ page }) => {
  await open(page, PAGES5, 5);
  await page.getByRole("button", { name: "1쪽 오른쪽으로" }).click();
  await page.getByRole("button", { name: "2쪽 왼쪽으로" }).click();
  // 두 번 돌리면 180
  await page.getByRole("button", { name: "3쪽 오른쪽으로" }).click();
  await page.getByRole("button", { name: "3쪽 오른쪽으로" }).click();

  const result = await save(page);
  expect(await rotationsOf(result.bytes)).toEqual([90, 270, 180, 0, 0]);
  // 회전은 표시일 뿐 — 내용은 그대로 복사돼야 한다
  expect((await pagesOf(result.bytes)).map((p) => p.text)).toEqual(["P1", "P2", "P3", "P4", "P5"]);
});

test("원본에 박힌 회전값 위에 더한다 (덮어쓰지 않는다)", async ({ page }) => {
  await open(page, TILTED, 1);
  await page.getByRole("button", { name: "1쪽 오른쪽으로" }).click();

  // 원본 90 + 사용자가 준 90 = 180. 덮어썼다면 90 이 나온다.
  expect(await rotationsOf((await save(page)).bytes)).toEqual([180]);
});

test("전체 회전과 전체 되돌리기", async ({ page }) => {
  await open(page, PAGES5, 5);
  await page.getByRole("button", { name: "전체 오른쪽으로" }).click();
  expect(await rotationsOf((await save(page)).bytes)).toEqual([90, 90, 90, 90, 90]);

  await page.getByRole("button", { name: "전체 되돌리기" }).click();
  expect(await rotationsOf((await save(page)).bytes)).toEqual([0, 0, 0, 0, 0]);
});

test("전부 지우면 저장할 수 없다", async ({ page }) => {
  await open(page, PAGES5, 5);
  for (const n of [1, 2, 3, 4, 5]) {
    await page.getByRole("button", { name: `${n}쪽 삭제` }).click();
  }
  await expect(page.getByRole("button", { name: "0페이지로 저장" })).toBeDisabled();
  await expect(page.getByText("최소 한 쪽은 남아야 합니다")).toBeVisible();
});

test("암호로 보호된 PDF 는 열지 않고 거부한다", async ({ page }) => {
  await page.locator('input[type="file"]').setInputFiles(ENCRYPTED);
  await expect(page.getByText("암호로 보호된 PDF 입니다")).toBeVisible({ timeout: 60_000 });
  await expect(page.getByRole("list", { name: "페이지" })).toHaveCount(0);
});

test("처리 중 파일이 네트워크로 나가지 않는다", async ({ page }) => {
  const outbound: string[] = [];
  page.on("request", (request) => {
    const method = request.method();
    if (method === "POST" || method === "PUT") outbound.push(request.url());
  });

  await open(page, PAGES5, 5);
  await page.getByRole("button", { name: "전체 오른쪽으로" }).click();
  await save(page);

  expect(outbound).toEqual([]);
});

/** pdf.js 는 짐이 크다. 파일을 넣기 전에는 받지 않아야 한다. */
test("PDF 를 넣기 전에는 pdf.js 를 내려받지 않는다 (프로덕션)", async ({ page }) => {
  test.skip(!process.env.BASE_URL, "BASE_URL 로 배포본을 가리켰을 때만 의미가 있다");

  let afterFile = 0;
  let armed = false;
  page.on("response", async (response) => {
    if (!armed || !/\.(js|wasm|mjs)(\?|$)/.test(response.url())) return;
    try {
      afterFile += (await response.body()).length;
    } catch {
      /* 무시 */
    }
  });

  await page.goto("/ko/tools/pdf-organize");
  await page.waitForLoadState("networkidle");

  armed = true;
  await open(page, PAGES5, 5);

  expect(afterFile).toBeGreaterThan(300_000);
});
