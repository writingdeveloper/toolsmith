import { readFileSync } from "node:fs";
import path from "node:path";
import { expect, test, type Page } from "@playwright/test";
import { planSegment } from "../lib/segment/segment-core";
import { isAnalytics } from "./net";

/** 640×480. 밝은 배경 한가운데 어두운 덩어리(타원 + 원). */
const SUBJECT = path.join(__dirname, "fixtures", "subject.png");
/**
 * 1914년 백과사전 비둘기 도판 500×782(퍼블릭 도메인). **비슷한 새가 14마리** 있다.
 * 배경 제거는 이 그림에서 무너진다 — 고를 것이 하나가 아니기 때문이다. 이 도구는
 * 사람이 눌러서 고르므로 **되어야 한다.** 그 차이를 여기서 못 박는다.
 */
const PLATE = path.join(__dirname, "fixtures", "plate.jpg");

/*
 * 누를 자리는 **눈짐작이 아니라 픽셀에서 계산했다.** 붉은/흰 화소의 연결된 덩어리 중
 * 가장 큰 것의 중심이다(각각 3,795화소 · 1,768화소). 한 번 눈대중으로 찍었다가 종이
 * 배경을 눌러 놓고 "도구가 이상하다" 고 적을 뻔했다 — 조준을 검증하지 않은 클릭은
 * 아무것도 증명하지 않는다.
 */
const RED_BIRD = { x: 123, y: 71 };
const WHITE_BIRD = { x: 396, y: 576 };

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

  test("어느 실행기로 돌았는지 화면에 적는다", async ({ page }, testInfo) => {
    test.setTimeout(300_000);
    await prepare(page);
    await expect(page.locator("[data-hint]")).toContainText(
      testInfo.project.name === "chromium-webgpu" ? "GPU 로 처리" : /GPU 로 처리|CPU 로 처리/,
    );
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

/**
 * **누른 것을 고른다.**
 *
 * 배경 제거가 무너지는 그림(비둘기 14마리)에서, 한 마리를 눌러 그 마리만 남는지 본다.
 * 화소를 직접 읽어 **누른 자리는 남고 다른 새는 지워졌는지**를 확인한다 — 결과가
 * 나왔다는 것만으로는 아무것도 증명되지 않는다.
 */
test.describe("여러 개 중 하나 고르기", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/ko/tools/cutout");
  });

  test("누른 새만 남고 다른 새는 지워진다", async ({ page }) => {
    test.setTimeout(600_000);
    await page.locator('input[type="file"]').setInputFiles(PLATE);
    await page.getByRole("button", { name: "이 사진 준비하기" }).click();
    await expect(page.locator("[data-hint]")).toBeVisible({ timeout: 300_000 });

    await clickAt(page, RED_BIRD.x, RED_BIRD.y);
    await page.getByRole("button", { name: "오려 내기" }).click();
    await expect(page.locator("a[download]")).toHaveCount(1, { timeout: 300_000 });

    const alpha = await page.evaluate(
      async ({ red, white }) => {
        const anchor = document.querySelector<HTMLAnchorElement>("a[download]")!;
        const bitmap = await createImageBitmap(await (await fetch(anchor.href)).blob());
        const canvas = document.createElement("canvas");
        canvas.width = bitmap.width;
        canvas.height = bitmap.height;
        const ctx = canvas.getContext("2d")!;
        ctx.drawImage(bitmap, 0, 0);
        const { data } = ctx.getImageData(0, 0, bitmap.width, bitmap.height);
        const at = (x: number, y: number) => data[(y * bitmap.width + x) * 4 + 3];
        let kept = 0;
        for (let i = 3; i < data.length; i += 4) if (data[i] > 240) kept += 1;
        // **닫기 전에 읽는다.** 닫힌 비트맵은 크기를 0 으로 돌려준다.
        const out = {
          width: bitmap.width,
          height: bitmap.height,
          onClicked: at(red.x, red.y),
          onOther: at(white.x, white.y),
          kept: kept / (data.length / 4),
        };
        bitmap.close();
        return out;
      },
      { red: RED_BIRD, white: WHITE_BIRD },
    );

    // 크기는 원본 그대로여야 한다
    expect(alpha.width).toBe(500);
    expect(alpha.height).toBe(782);
    // 누른 자리는 남아야 한다
    expect(alpha.onClicked).toBeGreaterThan(240);
    // 누르지 않은 다른 새는 지워져야 한다 — 이것이 배경 제거와 갈리는 지점이다
    expect(alpha.onOther).toBeLessThan(16);
    // 열넷 중 한 마리다. 절반이 남았다면 종이나 여러 마리를 고른 것이다.
    expect(alpha.kept).toBeGreaterThan(0.002);
    expect(alpha.kept).toBeLessThan(0.2);
  });
});
