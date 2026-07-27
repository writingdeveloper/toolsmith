import { readFileSync } from "node:fs";
import path from "node:path";
import { expect, test, type Page } from "@playwright/test";
import { isAnalytics } from "./net";

/** 밝은 배경 한가운데 어두운 덩어리. 모서리는 배경, 가운데는 피사체다. */
const SUBJECT = path.join(__dirname, "fixtures", "subject.png");
/** 같은 도형 48개. 고를 것이 없어 단호한 화소가 거의 안 남는다. */
const CROWD = path.join(__dirname, "fixtures", "crowd.png");
/** 1914년 백과사전 비둘기 도판(퍼블릭 도메인). 14마리라 모델이 결정을 못 내린다. */
const PLATE = path.join(__dirname, "fixtures", "plate.jpg");

/** 무거운 자산이 어디서 오는가. 규칙 5 를 스펙이 직접 본다. */
const MODEL_HOST = /huggingface\.co|hf\.co|cdn-lfs/;
const ENGINE_HOST = /cdn\.jsdelivr\.net\/npm\/onnxruntime-web/;

async function run(page: Page) {
  await page.getByRole("button", { name: "배경 지우기" }).click();
  await expect(page.locator("a[download]")).toHaveCount(1, { timeout: 180_000 });
}

/**
 * 결과 PNG 를 실제로 디코드해서 **화소를 읽는다.**
 * "배경이 제거됨" 이라는 글자가 떴다는 것은 아무것도 증명하지 않는다.
 */
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
      // 640×480 픽스처 기준: 모서리는 확실히 배경, (320, 300) 은 타원의 한가운데다.
      corner: at(4, 4),
      subject: at(320, 300),
    };
    bitmap.close();
    return out;
  });
}

/*
 * 브라우저 없이 도는 검사 — **라이선스 결정을 코드에 못 박는다.**
 *
 * 이 바닥에서 검색하면 제일 먼저 나오는 briaai/RMBG-1.4 는 비상업 라이선스다.
 * 언젠가 "품질이 더 좋다" 는 이유로 슬쩍 갈아 끼우는 일이 벌어질 수 있으므로,
 * 모델 주소가 Apache-2.0 저장소를 가리키는지 여기서 고정한다.
 */
test("모델은 Apache-2.0 U²-Net 에서만 온다", () => {
  const source = readFileSync(path.join(__dirname, "..", "lib", "matting", "matte-core.ts"), "utf8");
  // 주석은 뺀다 — 그 파일은 "왜 RMBG-1.4 를 쓰지 않는가" 를 적어 두고 있고,
  // 그 문장이 남아 있는 것이 오히려 옳다. 검사 대상은 실제 주소다.
  // (줄 주석까지 지우면 `https://` 의 `//` 에 걸려 주소 자체가 사라진다.)
  const code = source.replace(/\/\*[\s\S]*?\*\//g, "");
  expect(code).toContain("Heliosoph/u2net-onnx");
  expect(code).not.toMatch(/briaai|rmbg|modnet/i);
});

test.describe("브라우저", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/ko/tools/remove-bg");
  });

  test("받을 용량을 누르기 전에 말한다", async ({ page }) => {
    const note = page.locator("[data-download-note]");
    await expect(note).toContainText("9.3 MB");
    await page.getByLabel("모델").selectOption("fine");
    // 정밀 모델을 고르면 적힌 숫자도 같이 커져야 한다 — 아니면 거짓말이 된다.
    await expect(note).toContainText("173 MB");
  });

  /** 규칙 2 — 누르기 전에는 엔진도 모델도 받지 않는다. */
  test("버튼을 누르기 전에는 모델을 받지 않는다", async ({ page }) => {
    const heavy: string[] = [];
    page.on("request", (request) => {
      const url = request.url();
      if (MODEL_HOST.test(url) || ENGINE_HOST.test(url)) heavy.push(url);
    });

    await page.locator('input[type="file"]').setInputFiles(SUBJECT);
    await page.waitForTimeout(1_000);
    expect(heavy).toEqual([]);

    await run(page);
    // 누른 뒤에는 둘 다 남의 CDN 에서 와야 한다 (규칙 5)
    expect(heavy.some((url) => ENGINE_HOST.test(url))).toBe(true);
    expect(heavy.some((url) => MODEL_HOST.test(url))).toBe(true);
  });

  test("배경 화소가 실제로 투명해지고 피사체는 남는다", async ({ page }) => {
    test.setTimeout(240_000);
    await page.locator('input[type="file"]').setInputFiles(SUBJECT);
    await run(page);

    const result = await inspect(page);
    expect(result.type).toBe("image/png");
    expect(result.name).toBe("subject.png");
    // 크기는 원본 그대로다 — 모델이 320 으로 보더라도 결과는 줄이지 않는다
    expect(result.width).toBe(640);
    expect(result.height).toBe(480);

    // 모서리(배경)는 알파가 거의 0, 가운데(피사체)는 거의 255
    expect(result.corner[3]).toBeLessThan(40);
    expect(result.subject[3]).toBeGreaterThan(200);
    // 피사체 색은 원본의 어두운 파랑 그대로여야 한다 (마스크만 씌웠지 색을 건드리지 않는다)
    expect(result.subject[0]).toBeLessThan(80);
  });

  test("흰 배경을 고르면 모서리가 흰색이고 불투명하다", async ({ page }) => {
    test.setTimeout(240_000);
    await page.locator('input[type="file"]').setInputFiles(SUBJECT);
    await page.getByLabel("피사체 뒤").selectOption("white");
    await run(page);

    const result = await inspect(page);
    expect(result.corner[3]).toBe(255);
    expect(result.corner[0]).toBeGreaterThan(240);
    expect(result.corner[1]).toBeGreaterThan(240);
    expect(result.corner[2]).toBeGreaterThan(240);
    expect(result.subject[3]).toBe(255);
  });

  /** 어느 실행기로 돌았는지 숨기지 않는다 — 3단 폴백의 두 번째 칸을 눈으로 본다. */
  test("GPU 로 돌았는지 CPU 로 돌았는지 결과 옆에 적는다", async ({ page }, testInfo) => {
    test.setTimeout(240_000);
    await page.locator('input[type="file"]').setInputFiles(SUBJECT);
    await run(page);
    // WebGPU 프로젝트에서는 정확히 GPU 여야 한다 — 어댑터가 사라져도 조용히 통과하면 안 된다
    await expect(page.locator("[data-summary]")).toContainText(
      testInfo.project.name === "chromium-webgpu" ? "GPU 로 처리" : /GPU 로 처리|CPU 로 처리/,
    );
  });

  test("사진이 네트워크로 나가지 않는다", async ({ page }) => {
    test.setTimeout(240_000);
    const outbound: string[] = [];
    page.on("request", (request) => {
      const method = request.method();
      if (method === "POST" || method === "PUT") outbound.push(request.url());
    });
    await page.locator('input[type="file"]').setInputFiles(SUBJECT);
    await run(page);
    expect(outbound.filter((url) => !isAnalytics(url))).toEqual([]);
  });
});

/**
 * 결과가 못 미더울 때 **말해야 한다.**
 *
 * 이 검사들이 없어서 경고가 어긋난 채로 남아 있었다(2026-07-27). 예전 판정은
 * `alpha > 127` 인 화소를 셌는데, 모델이 확신하지 못하면 마스크 전체가 어중간하게
 * 깔리면서 그 값들이 127 을 넘어 **"많이 남았다" 로 잡혔다.** 실사진 여덟 장 중 셋이
 * 눈으로 보면 명백한 실패였는데 경고가 한 번도 뜨지 않았다.
 */
test.describe("못 미더운 결과를 말한다", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/ko/tools/remove-bg");
  });

  test("고를 것이 없으면 못 찾았다고 말한다", async ({ page }) => {
    await page.locator('input[type="file"]').setInputFiles(CROWD);
    await run(page);
    await expect(page.locator("[data-empty]")).toBeVisible();
  });

  /**
   * 이쪽은 **더 위험한 실패**다. 결과가 그럴듯해 보이는데 남은 것이 반투명한 유령이다.
   * 합성 그림으로는 재현되지 않아 실물 도판을 픽스처로 둔다 — 근거는 make-fixtures.
   */
  test("찾긴 했는데 확신하지 못하면 그렇다고 말한다", async ({ page }) => {
    await page.locator('input[type="file"]').setInputFiles(PLATE);
    await run(page);
    await expect(page.locator("[data-unsure]")).toBeVisible();
    // "아무것도 못 찾음" 과는 다른 상황이다 — 둘이 함께 뜨면 안 된다
    await expect(page.locator("[data-empty]")).toHaveCount(0);
  });

  test("제대로 잘린 그림에는 아무 경고도 띄우지 않는다", async ({ page }) => {
    await page.locator('input[type="file"]').setInputFiles(SUBJECT);
    await run(page);
    await expect(page.locator("[data-empty]")).toHaveCount(0);
    await expect(page.locator("[data-unsure]")).toHaveCount(0);
  });
});
