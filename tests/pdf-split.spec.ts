import path from "node:path";
import { expect, test, type Page } from "@playwright/test";
import { unzipSync } from "fflate";
import { downloadResult, pagesOf } from "./pdf-helpers";

const FIXTURES = path.join(__dirname, "fixtures");
// 5쪽: 201x401(P1) … 205x405(P5)
const PAGES5 = path.join(FIXTURES, "pages5.pdf");
const ENCRYPTED = path.join(FIXTURES, "encrypted.pdf");
const BROKEN = path.join(FIXTURES, "broken.pdf");

async function open(page: Page, file: string) {
  await page.locator('input[type="file"]').setInputFiles(file);
}

/** 페이지 수를 읽어야 모드 선택 UI 가 뜬다. */
async function openAndWait(page: Page, file: string, pageCount: number) {
  await open(page, file);
  await expect(page.getByText(`${pageCount}페이지`)).toBeVisible({ timeout: 30_000 });
}

async function runAndDownload(page: Page, button: RegExp) {
  await page.getByRole("button", { name: button }).click();
  await expect(page.locator("a[download]")).toHaveCount(1, { timeout: 60_000 });
  return downloadResult(page);
}

test.beforeEach(async ({ page }) => {
  await page.goto("/ko/tools/pdf-split");
});

test("고른 페이지만, 적은 순서 그대로 뽑는다", async ({ page }) => {
  await openAndWait(page, PAGES5, 5);
  await page.getByLabel("추출할 페이지").fill("1-2, 5");
  await expect(page.getByText("3쪽 선택됨")).toBeVisible();

  const result = await runAndDownload(page, /추출하기$/);
  expect(result.mime).toBe("application/pdf");
  expect(result.name).toBe("pages5-추출.pdf");

  const pages = await pagesOf(result.bytes);
  expect(pages.map((p) => p.text)).toEqual(["P1", "P2", "P5"]);
  expect(pages.map((p) => p.size)).toEqual(["201x401", "202x402", "205x405"]);
});

test("적은 순서가 결과 순서다 — 역순도 그대로", async ({ page }) => {
  await openAndWait(page, PAGES5, 5);
  await page.getByLabel("추출할 페이지").fill("5, 1, 3");

  const result = await runAndDownload(page, /추출하기$/);
  const pages = await pagesOf(result.bytes);
  expect(pages.map((p) => p.text)).toEqual(["P5", "P1", "P3"]);
});

test("'4-' 는 4쪽부터 끝까지를 뜻한다", async ({ page }) => {
  await openAndWait(page, PAGES5, 5);
  await page.getByLabel("추출할 페이지").fill("4-");
  await expect(page.getByText("2쪽 선택됨")).toBeVisible();

  const result = await runAndDownload(page, /추출하기$/);
  const pages = await pagesOf(result.bytes);
  expect(pages.map((p) => p.text)).toEqual(["P4", "P5"]);
});

test("없는 페이지를 조용히 잘라내지 않는다", async ({ page }) => {
  await openAndWait(page, PAGES5, 5);
  await page.getByLabel("추출할 페이지").fill("1-99");

  await expect(page.getByText("이 PDF 에 없는 페이지입니다")).toBeVisible();
  await expect(page.getByRole("button", { name: /추출하기$/ })).toBeDisabled();
  await expect(page.locator("a[download]")).toHaveCount(0);
});

test("이해하지 못한 표기는 그렇다고 말한다", async ({ page }) => {
  await openAndWait(page, PAGES5, 5);
  await page.getByLabel("추출할 페이지").fill("셋째장");

  await expect(page.getByText("페이지 번호를 이해하지 못했습니다")).toBeVisible();
  await expect(page.getByRole("button", { name: /추출하기$/ })).toBeDisabled();
});

test("낱장 분리: ZIP 안에 페이지 수만큼의 한 장짜리 PDF 가 순서대로 들어간다", async ({ page }) => {
  await openAndWait(page, PAGES5, 5);
  await page.getByLabel("모든 페이지를 낱장으로").check();

  const result = await runAndDownload(page, /쪼개기$/);
  expect(result.mime).toBe("application/zip");
  expect(result.name).toBe("pages5-낱장.zip");

  const entries = unzipSync(new Uint8Array(result.bytes));
  const names = Object.keys(entries).sort();
  expect(names).toEqual([
    "pages5-1.pdf",
    "pages5-2.pdf",
    "pages5-3.pdf",
    "pages5-4.pdf",
    "pages5-5.pdf",
  ]);

  // 이름만 맞고 내용이 뒤섞였을 수 있다 — 전부 열어서 대조한다
  for (let i = 0; i < names.length; i += 1) {
    const pages = await pagesOf(Buffer.from(entries[names[i]]));
    expect(pages).toHaveLength(1);
    expect(pages[0].text).toBe(`P${i + 1}`);
    expect(pages[0].size).toBe(`${201 + i}x${401 + i}`);
  }
});

test("암호로 보호된 PDF 는 열지 않고 거부한다", async ({ page }) => {
  await open(page, ENCRYPTED);
  await expect(page.getByText("암호로 보호된 PDF 입니다")).toBeVisible({ timeout: 30_000 });
  // 처리 UI 자체가 뜨지 않아야 한다
  await expect(page.getByRole("button", { name: /추출하기$/ })).toHaveCount(0);
});

test("PDF 가 아닌 파일은 조용히 통과하지 않는다", async ({ page }) => {
  await open(page, BROKEN);
  await expect(page.getByText("PDF 로 읽을 수 없습니다")).toBeVisible({ timeout: 30_000 });
  await expect(page.getByRole("button", { name: /추출하기$/ })).toHaveCount(0);
});

test("처리 중 파일이 네트워크로 나가지 않는다", async ({ page }) => {
  const outbound: string[] = [];
  page.on("request", (request) => {
    const method = request.method();
    if (method === "POST" || method === "PUT") outbound.push(request.url());
  });

  await openAndWait(page, PAGES5, 5);
  await page.getByLabel("모든 페이지를 낱장으로").check();
  await runAndDownload(page, /쪼개기$/);

  expect(outbound).toEqual([]);
});

/** 프로덕션은 청크 이름이 해시라 크기로 본다. pdf-lib 은 약 450KB. */
test("PDF 를 넣기 전에는 pdf-lib 을 내려받지 않는다 (프로덕션)", async ({ page }) => {
  test.skip(!process.env.BASE_URL, "BASE_URL 로 배포본을 가리켰을 때만 의미가 있다");

  let afterFile = 0;
  let armed = false;
  page.on("response", async (response) => {
    if (!armed || !/\.(js|wasm)(\?|$)/.test(response.url())) return;
    try {
      afterFile += (await response.body()).length;
    } catch {
      /* 무시 */
    }
  });

  await page.goto("/ko/tools/pdf-split");
  await page.waitForLoadState("networkidle");

  armed = true;
  await openAndWait(page, PAGES5, 5);

  expect(afterFile).toBeGreaterThan(300_000);
});

test("콘솔 에러 없이 동작한다", async ({ page }) => {
  const errors: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });

  await openAndWait(page, PAGES5, 5);
  await page.getByLabel("추출할 페이지").fill("2-4");
  await runAndDownload(page, /추출하기$/);

  expect(errors).toEqual([]);
});
