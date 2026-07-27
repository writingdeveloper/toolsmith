import { readFileSync } from "node:fs";
import path from "node:path";
import { expect, test, type Page } from "@playwright/test";
import { planTiles } from "../lib/upscale/upscale-core";
import { isAnalytics } from "./net";

/** 96×64. 조각 하나로 끝나는 크기 — 스펙이 분 단위가 되지 않게 한다. */
const SMALL = path.join(__dirname, "fixtures", "small.png");
/** 1600×1200 = 192만 화소. 상한(100만)을 확실히 넘는다. */
const BIG = path.join(__dirname, "fixtures", "photo.jpg");

const MODEL_HOST = /huggingface\.co|hf\.co|cdn-lfs/;
const ENGINE_HOST = /cdn\.jsdelivr\.net\/npm\/onnxruntime-web/;

async function run(page: Page) {
  await page.getByRole("button", { name: "크게 키우기" }).click();
  await expect(page.locator("a[download]")).toHaveCount(1, { timeout: 300_000 });
}

/** 결과를 실제로 디코드해서 크기와 화소를 본다. */
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
    const { data } = ctx.getImageData(0, 0, bitmap.width, bitmap.height);
    let min = 255;
    let max = 0;
    for (let i = 0; i < data.length; i += 4) {
      if (data[i] < min) min = data[i];
      if (data[i] > max) max = data[i];
    }
    const out = {
      name: anchor.download,
      type: blob.type,
      width: bitmap.width,
      height: bitmap.height,
      /* 결과가 통짜 한 색이 아닌지 — 크기만 맞고 내용이 빈 경우를 잡는다 */
      min,
      max,
    };
    bitmap.close();
    return out;
  });
}

/* 조각 나누기는 브라우저 없이 확인한다. 이음매가 생기지 않는 근거가 여기 있다. */
test("조각은 덧댄 채로 넣고 알맹이만 이어 붙인다", () => {
  // 작은 그림은 한 조각. 덧댈 곳이 없으므로 알맹이 = 전체.
  expect(planTiles(96, 64)).toEqual([
    { coreX: 0, coreY: 0, coreW: 96, coreH: 64, padX: 0, padY: 0, padW: 96, padH: 64 },
  ]);

  // 알맹이 384 를 넘으면 갈린다(800×400 → 가로 3 × 세로 2).
  const tiles = planTiles(800, 400);
  expect(tiles).toHaveLength(6);
  // 왼쪽 끝 조각은 왼쪽에 덧댈 것이 없다
  expect(tiles[0]).toMatchObject({ coreX: 0, coreW: 384, padX: 0, padW: 416 });
  // 가운데 조각은 양쪽으로 32 씩 덧대어 들어간다
  expect(tiles[1]).toMatchObject({ coreX: 384, coreW: 384, padX: 352, padW: 448 });
  // 알맹이는 겹치지 않고 정확히 원본을 덮는다 — 이래야 이음매가 없다
  expect(tiles.reduce((sum, t) => sum + t.coreW * t.coreH, 0)).toBe(800 * 400);
});

/*
 * 모델 선택을 코드에 못 박는다. 배경 제거와 같은 이유다 — 언젠가 "더 선명하다" 는
 * 이유로 갈아 끼울 때, 라이선스와 속도라는 두 가지 근거가 함께 검사되게 한다.
 */
test("모델은 BSD Real-ESRGAN 에서만 온다", () => {
  const source = readFileSync(
    path.join(__dirname, "..", "lib", "upscale", "upscale-core.ts"),
    "utf8",
  );
  const code = source.replace(/\/\*[\s\S]*?\*\//g, "");
  expect(code).toContain("realesr-general-x4v3");
  expect(code).not.toMatch(/swin2sr|briaai|esrgan-anime/i);
});

test.describe("브라우저", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/ko/tools/upscale");
  });

  test("어느 실행기로 돌지 누르기 전에 말한다", async ({ page }, testInfo) => {
    // 기본 프로젝트(헤드리스 셸)는 GPU 어댑터가 없어 CPU 경고가, WebGPU 프로젝트에서는
    // GPU 안내가 떠야 한다. 어느 쪽이든 **누르기 전에** 말한다는 것이 요점이다.
    const gpu = testInfo.project.name === "chromium-webgpu";
    await expect(page.locator(gpu ? "[data-gpu-notice]" : "[data-cpu-warning]")).toBeVisible();
    await expect(page.locator("[data-notes]")).toContainText("9.6 MB");
  });

  /** 규칙 2 — 누르기 전에는 엔진도 모델도 받지 않는다. */
  test("버튼을 누르기 전에는 모델을 받지 않는다", async ({ page }) => {
    const heavy: string[] = [];
    page.on("request", (request) => {
      const url = request.url();
      if (MODEL_HOST.test(url) || ENGINE_HOST.test(url)) heavy.push(url);
    });

    await page.locator('input[type="file"]').setInputFiles(SMALL);
    await page.waitForTimeout(1_000);
    expect(heavy).toEqual([]);

    await run(page);
    expect(heavy.some((url) => ENGINE_HOST.test(url))).toBe(true);
    expect(heavy.some((url) => MODEL_HOST.test(url))).toBe(true);
  });

  test("4배로 키우면 실제로 4배가 나오고 내용이 비어 있지 않다", async ({ page }) => {
    test.setTimeout(300_000);
    await page.locator('input[type="file"]').setInputFiles(SMALL);
    await expect(page.locator("[data-preview]")).toContainText("96×64 → 384×256");
    await run(page);

    const result = await inspect(page);
    expect(result.type).toBe("image/png");
    expect(result.name).toBe("small.png");
    expect(result.width).toBe(384);
    expect(result.height).toBe(256);
    // 흰 배경과 검은 사각형이 둘 다 살아 있어야 한다
    expect(result.min).toBeLessThan(60);
    expect(result.max).toBeGreaterThan(200);
  });

  test("2배는 4배의 절반으로 정확히 나온다", async ({ page }) => {
    test.setTimeout(300_000);
    await page.locator('input[type="file"]').setInputFiles(SMALL);
    await page.getByLabel("몇 배로").selectOption("2");
    await expect(page.locator("[data-preview]")).toContainText("96×64 → 192×128");
    await run(page);

    const result = await inspect(page);
    expect(result.width).toBe(192);
    expect(result.height).toBe(128);
  });

  /** 못 할 일을 시작하지 않는다 — 탭을 몇 분 얼려 놓고 실패하는 것이 가장 나쁘다. */
  test("상한을 넘는 그림은 시작조차 하지 않는다", async ({ page }) => {
    await page.locator('input[type="file"]').setInputFiles(BIG);
    await expect(page.locator("[data-preview]")).toContainText("1600×1200");
    await expect(page.locator("[data-preview]")).toContainText("상한을 넘습니다");
    await expect(page.getByRole("button", { name: "크게 키우기" })).toBeDisabled();
  });

  test("어느 실행기로 돌았는지 결과 옆에 적는다", async ({ page }, testInfo) => {
    test.setTimeout(300_000);
    await page.locator('input[type="file"]').setInputFiles(SMALL);
    await run(page);
    await expect(page.locator("[data-summary]")).toContainText(
      testInfo.project.name === "chromium-webgpu" ? "GPU 로 처리" : /GPU 로 처리|CPU 로 처리/,
    );
  });

  test("그림이 네트워크로 나가지 않는다", async ({ page }) => {
    test.setTimeout(300_000);
    const outbound: string[] = [];
    page.on("request", (request) => {
      const method = request.method();
      if (method === "POST" || method === "PUT") outbound.push(request.url());
    });
    await page.locator('input[type="file"]').setInputFiles(SMALL);
    await run(page);
    expect(outbound.filter((url) => !isAnalytics(url))).toEqual([]);
  });
});
