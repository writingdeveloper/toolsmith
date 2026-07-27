import { readFileSync } from "node:fs";
import path from "node:path";
import { expect, test, type Page } from "@playwright/test";
import { planSegment } from "../lib/segment/segment-core";
import { isAnalytics } from "./net";

/** 640×480. 밝은 배경 한가운데 어두운 덩어리(타원 + 원). */
const SUBJECT = path.join(__dirname, "fixtures", "subject.png");

const MODEL_HOST = /huggingface\.co|hf\.co|cdn-lfs/;
const ENGINE_HOST = /cdn\.jsdelivr\.net\/npm\/onnxruntime-web/;

/** 그림을 읽히고(인코더) 클릭할 수 있는 상태로 만든다. */
async function prepare(page: Page) {
  await page.locator('input[type="file"]').setInputFiles(SUBJECT);
  await page.getByRole("button", { name: "이 사진 준비하기" }).click();
  await expect(page.locator("[data-hint]")).toBeVisible({ timeout: 300_000 });
}

/** 캔버스의 (x, y) 원본 화소 위치를 눌러 준다. 화면에서는 줄여 보여 주므로 환산이 필요하다. */
async function clickAt(page: Page, x: number, y: number) {
  const canvas = page.locator("[data-canvas]");
  const box = (await canvas.boundingBox())!;
  const width = Number(await canvas.getAttribute("width"));
  const height = Number(await canvas.getAttribute("height"));
  // 요소 기준 좌표로 준다 — page.mouse 는 뷰포트 기준이라 스크롤된 만큼 어긋난다.
  await canvas.click({ position: { x: (x / width) * box.width, y: (y / height) * box.height } });
}

async function inspect(page: Page) {
  return page.evaluate(async () => {
    const anchor = document.querySelector<HTMLAnchorElement>("a[download]")!;
    const blob = await (await fetch(anchor.href)).blob();
    const bitmap = await createImageBitmap(blob);
    const canvas = document.createElement("canvas");
    canvas.width = bitmap.width;
    canvas.height = bitmap.height;
    const ctx = canvas.getContext("2d")!;
    ctx.drawImage(bitmap, 0, 0);
    const at = (x: number, y: number) => Array.from(ctx.getImageData(x, y, 1, 1).data);
    const out = {
      name: anchor.download,
      type: blob.type,
      width: bitmap.width,
      height: bitmap.height,
      corner: at(4, 4),
      subject: at(320, 300),
    };
    bitmap.close();
    return out;
  });
}

/* 좌표 환산은 브라우저 없이 확인한다 — 클릭이 엉뚱한 곳으로 가는 것을 여기서 막는다. */
test("클릭 좌표는 1024 상자 기준으로 옮겨진다", () => {
  // 640×480 → 긴 변이 640 이므로 1.6배, 상자 안에서 1024×768 을 차지한다
  const plan = planSegment(640, 480);
  expect(plan.scale).toBeCloseTo(1.6, 5);
  expect(plan.fitWidth).toBe(1024);
  expect(plan.fitHeight).toBe(768);
  // 마스크(256)에서 그림이 차지하는 몫도 같은 비율이다
  expect(plan.maskWidth).toBe(256);
  expect(plan.maskHeight).toBe(192);

  // 세로가 긴 그림은 반대로 잡힌다
  const tall = planSegment(500, 1000);
  expect(tall.fitWidth).toBe(512);
  expect(tall.fitHeight).toBe(1024);
});

/* 모델 선택을 코드에 못 박는다 — 배경 제거·업스케일과 같은 이유다. */
test("모델은 Apache-2.0 SlimSAM 에서만 온다", () => {
  const source = readFileSync(
    path.join(__dirname, "..", "lib", "segment", "segment-core.ts"),
    "utf8",
  );
  const code = source.replace(/\/\*[\s\S]*?\*\//g, "");
  expect(code).toContain("slimsam-77-uniform");
  expect(code).not.toMatch(/briaai|rmbg/i);
});

test.describe("브라우저", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/ko/tools/cutout");
  });

  test("받을 용량을 누르기 전에 말한다", async ({ page }) => {
    await expect(page.locator("[data-download-note]")).toContainText("18.1 MB");
  });

  /** 규칙 2 — 누르기 전에는 엔진도 모델도 받지 않는다. */
  test("준비하기를 누르기 전에는 모델을 받지 않는다", async ({ page }) => {
    test.setTimeout(300_000);
    const heavy: string[] = [];
    page.on("request", (request) => {
      const url = request.url();
      if (MODEL_HOST.test(url) || ENGINE_HOST.test(url)) heavy.push(url);
    });

    await page.locator('input[type="file"]').setInputFiles(SUBJECT);
    await page.waitForTimeout(1_000);
    expect(heavy).toEqual([]);

    await page.getByRole("button", { name: "이 사진 준비하기" }).click();
    await expect(page.locator("[data-hint]")).toBeVisible({ timeout: 300_000 });
    expect(heavy.some((url) => ENGINE_HOST.test(url))).toBe(true);
    expect(heavy.some((url) => MODEL_HOST.test(url))).toBe(true);
  });

  test("누른 물체만 남고 배경은 투명해진다", async ({ page }) => {
    test.setTimeout(300_000);
    await prepare(page);

    // 타원 한가운데를 누른다
    await clickAt(page, 320, 300);
    await expect(page.locator("[data-hint]")).toContainText("점 1개");

    await page.getByRole("button", { name: "오려 내기" }).click();
    await expect(page.locator("a[download]")).toHaveCount(1, { timeout: 120_000 });

    const result = await inspect(page);
    expect(result.type).toBe("image/png");
    expect(result.name).toBe("subject.png");
    expect(result.width).toBe(640);
    expect(result.height).toBe(480);
    // 모서리는 배경이므로 투명, 누른 곳은 남아야 한다
    expect(result.corner[3]).toBeLessThan(40);
    expect(result.subject[3]).toBeGreaterThan(200);
  });

  test("점을 되돌리면 선택도 함께 사라진다", async ({ page }) => {
    test.setTimeout(300_000);
    await prepare(page);
    await clickAt(page, 320, 300);
    await expect(page.locator("[data-hint]")).toContainText("점 1개");

    await page.getByRole("button", { name: "마지막 점 취소" }).click();
    await expect(page.locator("[data-hint]")).toContainText("남기고 싶은 것을 누르세요");
    // 점이 없으면 오려 낼 것도 없다
    await expect(page.getByRole("button", { name: "오려 내기" })).toBeDisabled();
  });

  test("어느 실행기로 돌았는지 화면에 적는다", async ({ page }) => {
    test.setTimeout(300_000);
    await prepare(page);
    await expect(page.locator("[data-hint]")).toContainText(/GPU 로 처리|CPU 로 처리/);
  });

  test("사진이 네트워크로 나가지 않는다", async ({ page }) => {
    test.setTimeout(300_000);
    const outbound: string[] = [];
    page.on("request", (request) => {
      const method = request.method();
      if (method === "POST" || method === "PUT") outbound.push(request.url());
    });
    await prepare(page);
    await clickAt(page, 320, 300);
    await page.getByRole("button", { name: "오려 내기" }).click();
    await expect(page.locator("a[download]")).toHaveCount(1, { timeout: 120_000 });
    expect(outbound.filter((url) => !isAnalytics(url))).toEqual([]);
  });
});
