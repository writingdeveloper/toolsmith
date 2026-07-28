import path from "node:path";
import { expect, test, type Page } from "@playwright/test";
import { acceptsFile, mimeForName } from "../lib/handoff";
import { ACCEPT, CHAINS, LIVE_TOOLS, chainTargets, type ToolSlug } from "../lib/tools";
import { ACCEPTED_EXTENSIONS } from "../lib/summarize/summarize-core";
import { downloadResult, pagesOf } from "./pdf-helpers";

const FIXTURES = path.join(__dirname, "fixtures");
const A = path.join(FIXTURES, "a.pdf"); // 2쪽: 200x400(A1), 210x410(A2)
const B = path.join(FIXTURES, "b.pdf"); // 1쪽: 300x300(B1)
const SMALL = path.join(FIXTURES, "small.png");

/*
 * 도구에서 도구로 넘기기.
 *
 * **무엇을 지키는 검사인가.** "보내기 버튼이 있다" 는 아무것도 증명하지 않는다.
 * 넘어간 파일이 **원본 그대로**여야 하고, 받은 도구가 그것을 실제로 열어 일해야 한다.
 * 그래서 아래 두 흐름은 넘긴 뒤 대상 도구를 **끝까지 돌려 결과 바이트를 연다.**
 */

// ---------------------------------------------------------------- 계약

test("summarize 의 accept 는 코어가 정한 확장자와 어긋날 수 없다", () => {
  // ACCEPT 는 넘길 곳을 고르려고 만든 목록이라 코어와 따로 산다. 둘이 갈라지면
  // 요약이 받는 파일과 우리가 "요약으로 보낼 수 있다" 고 말하는 파일이 달라진다.
  expect(ACCEPT.summarize).toBe(ACCEPTED_EXTENSIONS.join(","));
});

test("연계 지도가 가리키는 곳은 전부 살아 있는 도구다", () => {
  const live = new Set(LIVE_TOOLS.map((tool) => tool.slug));
  for (const [from, targets] of Object.entries(CHAINS)) {
    expect(live, from).toContain(from);
    for (const target of targets ?? []) {
      expect(live, `${from} → ${target}`).toContain(target);
      // 자기 자신으로 보내는 것은 길이 아니다
      expect(target, from).not.toBe(from);
    }
  }
});

test("만든 형식이 안 맞으면 그 도구는 목록에서 빠진다", () => {
  // 영상 변환은 MP4 도 WebM 도 만든다. 자르기·압축은 MP4 만 받는다 —
  // WebM 을 만들었을 때 그 버튼이 남아 있으면 눌러 보고 나서야 실패를 만난다.
  expect(chainTargets("video-convert", { name: "clip.mp4", type: "video/mp4" })).toEqual([
    "video-compress",
    "video-trim",
    "video-to-gif",
  ]);
  expect(chainTargets("video-convert", { name: "clip.webm", type: "video/webm" })).toEqual([]);

  // 분할이 낱장 모드로 가면 ZIP 이 나온다. ZIP 을 받는 도구는 하나도 없다.
  expect(chainTargets("pdf-split", { name: "pages.zip", type: "application/zip" })).toEqual([]);
});

test("accept 규칙은 확장자·정확 일치·와일드카드를 브라우저와 같게 읽는다", () => {
  expect(acceptsFile("image/*,.heic", { name: "a.png", type: "image/png" })).toBe(true);
  expect(acceptsFile("image/*,.heic", { name: "a.heic", type: "" })).toBe(true);
  expect(acceptsFile("image/*,.heic", { name: "a.pdf", type: "application/pdf" })).toBe(false);
  // 매개변수가 붙은 MIME 도 정확 일치로 읽혀야 한다 — OCR 의 결과가 이 모양이다
  expect(acceptsFile("text/plain", { name: "a.txt", type: "text/plain;charset=utf-8" })).toBe(true);
  // 종류를 모르면 확장자로만 판단한다 (안전한 쪽으로 틀린다)
  expect(mimeForName("a.parquet")).toBe("");
  expect(acceptsFile("image/*", { name: "a.parquet", type: "" })).toBe(false);
});

// ---------------------------------------------------------------- 실제 흐름

/** 결과 옆의 "이어서 하기" 버튼을 눌러 대상 도구로 넘어간다. */
async function sendTo(page: Page, target: ToolSlug) {
  await expect(page.locator("[data-send-to]")).toBeVisible({ timeout: 30_000 });
  await page.locator(`[data-send-to-target="${target}"]`).click();
  await page.waitForURL(new RegExp(`/tools/${target}\\?from=`), { timeout: 30_000 });
}

test("PDF 를 병합한 뒤 그대로 분할로 넘기면 같은 바이트가 도착한다", async ({ page }) => {
  await page.goto("/ko/tools/pdf-merge");
  await page.locator('input[type="file"]').setInputFiles([A, B]);
  await expect(page.getByText("읽는 중")).toHaveCount(0, { timeout: 30_000 });
  await page.getByRole("button", { name: /병합하기$/ }).click();
  await expect(page.locator("a[download]")).toHaveCount(1, { timeout: 60_000 });

  await sendTo(page, "pdf-split");

  // 분할이 3쪽짜리로 읽었다는 것 자체가 "병합 결과가 통째로 도착했다" 는 증거다.
  // 한 쪽이라도 빠졌거나 잘렸으면 여기서 숫자가 어긋난다.
  await expect(page.getByText("merged.pdf")).toBeVisible({ timeout: 30_000 });
  await expect(page.getByText("3", { exact: false }).first()).toBeVisible();

  // 그리고 실제로 일을 시켜 결과 바이트를 연다 — 열리기만 한 것과 쓸 수 있는 것은 다르다.
  await page.getByRole("textbox", { name: /페이지|범위/ }).first().fill("2-3");
  await page.getByRole("button", { name: /추출하기$/ }).click();
  await expect(page.locator("a[download]")).toHaveCount(1, { timeout: 60_000 });

  const pages = await pagesOf((await downloadResult(page)).bytes);
  expect(pages.map((entry) => entry.text)).toEqual(["A2", "B1"]);
  expect(pages.map((entry) => entry.size)).toEqual(["210x410", "300x300"]);
});

test("이미지를 변환한 뒤 용량 줄이기로 넘기면 바꾼 형식 그대로 간다", async ({ page }) => {
  await page.goto("/ko/tools/image-convert");
  await page.locator('input[type="file"]').setInputFiles([SMALL]);
  await page.getByLabel("출력 형식").selectOption("image/webp");
  await page.getByRole("button", { name: /변환하기$/ }).click();
  await expect(page.locator("a[download]")).toHaveCount(1, { timeout: 60_000 });

  await sendTo(page, "image-compress");
  await expect(page.getByText("small.webp")).toBeVisible({ timeout: 30_000 });

  await page.getByRole("button", { name: /압축하기$/ }).click();
  await expect(page.locator("a[download]")).toHaveCount(1, { timeout: 60_000 });

  const { bytes, name } = await downloadResult(page);
  // 용량 줄이기는 **형식을 유지한다**. WebP 로 바꾼 것이 도착했다면 WebP 가 나와야 한다.
  expect(name.endsWith(".webp")).toBe(true);
  expect(bytes.subarray(0, 4).toString("latin1")).toBe("RIFF");
  expect(bytes.subarray(8, 12).toString("latin1")).toBe("WEBP");
});

// ---------------------------------------------------------------- 안전장치

test("넘긴 것이 없는데 ?from= 만 붙여 들어오면 아무 일도 없다", async ({ page }) => {
  await page.goto("/ko/tools/pdf-split?from=pdf-merge");
  await expect(page.getByRole("button", { name: /추출하기$/ })).toHaveCount(0);
  await expect(page.locator("a[download]")).toHaveCount(0);
});

test("한 번 집어 든 파일은 되살아나지 않는다", async ({ page }) => {
  await page.goto("/ko/tools/pdf-merge");
  await page.locator('input[type="file"]').setInputFiles([A, B]);
  await expect(page.getByText("읽는 중")).toHaveCount(0, { timeout: 30_000 });
  await page.getByRole("button", { name: /병합하기$/ }).click();
  await expect(page.locator("a[download]")).toHaveCount(1, { timeout: 60_000 });
  await sendTo(page, "pdf-split");
  await expect(page.getByText("merged.pdf")).toBeVisible({ timeout: 30_000 });

  // 같은 주소를 다시 열면 비어 있어야 한다. 사용자가 떠났다고 믿는 파일이
  // 되돌아오는 것은 이 사이트가 내건 약속과 정면으로 충돌한다.
  await page.goto("/ko/tools/pdf-split?from=pdf-merge");
  await expect(page.getByText("merged.pdf")).toHaveCount(0);
});
