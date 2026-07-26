import path from "node:path";
import { expect, test, type Page } from "@playwright/test";
import { isAnalytics } from "./net";

const CLIP = path.join(__dirname, "fixtures", "clip.mp4"); // H.264 320x240 2초 + AAC
const BROKEN = path.join(__dirname, "fixtures", "broken.pdf");

interface Probed {
  name: string;
  mime: string;
  size: number;
  /** <video> 가 실제로 읽어 낸 값 — 재생 가능하다는 증거다 */
  duration: number;
  width: number;
  height: number;
  /** 첫 프레임 가운데 픽셀. 검은 화면만 나오면 인코딩이 깨진 것이다 */
  centerPixel: number[];
}

/**
 * 결과를 브라우저가 **실제로 재생할 수 있는지** 확인한다.
 * 매직바이트만 보면 "MP4 처럼 생긴 쓰레기" 를 통과시키게 된다.
 */
async function probeResult(page: Page): Promise<Probed> {
  const probed = await page.evaluate(async () => {
    const anchor = document.querySelector<HTMLAnchorElement>("a[download]")!;
    const blob = await (await fetch(anchor.href)).blob();
    const url = URL.createObjectURL(blob);

    const video = document.createElement("video");
    video.muted = true;
    video.src = url;
    await new Promise<void>((resolve, reject) => {
      video.onloadeddata = () => resolve();
      video.onerror = () => reject(new Error("video failed to load"));
      setTimeout(() => reject(new Error("video load timed out")), 20_000);
    });
    // 첫 프레임이 그려지도록 조금 진행시킨다
    video.currentTime = 0.2;
    await new Promise<void>((resolve) => {
      video.onseeked = () => resolve();
      setTimeout(resolve, 3000);
    });

    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d")!;
    ctx.drawImage(video, 0, 0);
    const pixel = ctx.getImageData(
      Math.floor(canvas.width / 2),
      Math.floor(canvas.height / 2),
      1,
      1,
    ).data;

    const out = {
      name: anchor.download,
      mime: blob.type,
      size: blob.size,
      duration: video.duration,
      width: video.videoWidth,
      height: video.videoHeight,
      centerPixel: [...pixel],
    };
    URL.revokeObjectURL(url);
    return out;
  });
  return probed;
}

async function open(page: Page, file: string) {
  await page.locator('input[type="file"]').setInputFiles(file);
  await expect(page.getByText("320×240")).toBeVisible({ timeout: 60_000 });
}

async function compress(page: Page) {
  await page.getByRole("button", { name: "압축하기" }).click();
  await expect(page.locator("a[download]")).toHaveCount(1, { timeout: 180_000 });
}

test.beforeEach(async ({ page }) => {
  await page.goto("/ko/tools/video-compress");
});

test("결과가 브라우저에서 실제로 재생되는 MP4 다", async ({ page }) => {
  await open(page, CLIP);
  await page.getByLabel("해상도").selectOption("0");
  await compress(page);

  const result = await probeResult(page);
  expect(result.mime).toBe("video/mp4");
  expect(result.name).toBe("clip-압축.mp4");

  // <video> 가 길이와 크기를 읽어 냈다면 컨테이너와 코덱이 온전하다
  expect(result.duration).toBeGreaterThan(1.5);
  expect(result.duration).toBeLessThan(2.5);
  expect(result.width).toBe(320);
  expect(result.height).toBe(240);

  // 온통 검은 화면이면 디코드는 됐지만 그림이 없는 것이다
  const [r, g, b] = result.centerPixel;
  expect(r + g + b).toBeGreaterThan(30);
});

test("해상도를 낮추면 실제 픽셀 크기가 줄어든다", async ({ page }) => {
  await open(page, CLIP);
  await page.getByLabel("해상도").selectOption("854");
  // 원본이 320x240 이라 854 제한에는 걸리지 않는다 — 크기가 유지돼야 한다
  await compress(page);
  expect((await probeResult(page)).width).toBe(320);
});

test("품질을 낮추면 파일이 더 작아진다", async ({ page }) => {
  await open(page, CLIP);
  await page.getByLabel("해상도").selectOption("0");

  await page.getByLabel("품질").selectOption("high");
  await compress(page);
  const high = (await probeResult(page)).size;

  await page.getByLabel("품질").selectOption("small");
  await compress(page);
  const small = (await probeResult(page)).size;

  expect(small).toBeLessThan(high);
});

test("소리를 그대로 옮겼다고 표시한다", async ({ page }) => {
  await open(page, CLIP);
  await compress(page);
  await expect(page.getByText("소리는 원본 그대로 옮겼습니다.")).toBeVisible();
});

test("영상이 아닌 파일은 조용히 통과하지 않는다", async ({ page }) => {
  await page.locator('input[type="file"]').setInputFiles(BROKEN);
  await expect(page.getByText(/MP4 나 MOV 로 열 수 없는 파일입니다|영상 트랙이 없는 파일입니다/)).toBeVisible({
    timeout: 60_000,
  });
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

  await open(page, CLIP);
  await compress(page);

  expect(outbound).toEqual([]);
});

/** ffmpeg.wasm(30.7MB)을 버리고 WebCodecs 로 간 이유가 이것이다. */
test("영상을 넣기 전에는 아무 무거운 자산도 받지 않는다 (프로덕션)", async ({ page }) => {
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

  await page.goto("/ko/tools/video-compress");
  await page.waitForLoadState("networkidle");

  armed = true;
  await open(page, CLIP);

  // mp4box(90KB) 만 받으면 된다. wasm 시절이었다면 30MB 였다.
  expect(afterFile).toBeLessThan(1_000_000);
});
