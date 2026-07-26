import path from "node:path";
import { expect, test, type Page } from "@playwright/test";
import { isAnalytics } from "./net";

/** 6초, 1초마다 키프레임, main 프로파일(B프레임 있음) + AAC. */
const CLIP = path.join(__dirname, "fixtures", "trim.mp4");
const SILENT = path.join(__dirname, "fixtures", "silent.mp4"); // 1초, 오디오 없음
const BROKEN = path.join(__dirname, "fixtures", "broken.pdf");

interface Probed {
  name: string;
  mime: string;
  size: number;
  /** <video> 가 읽어 낸 값 — 컨테이너와 코덱이 온전하다는 증거 */
  duration: number;
  width: number;
  height: number;
  /** 첫 프레임 픽셀. 온통 검으면 디코드는 됐지만 그림이 없는 것이다 */
  firstFrame: number[];
}

/** 결과를 브라우저가 실제로 재생할 수 있는지 확인한다. */
async function probeResult(page: Page): Promise<Probed> {
  return page.evaluate(async () => {
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
    video.currentTime = 0;
    await new Promise<void>((resolve) => {
      video.onseeked = () => resolve();
      setTimeout(resolve, 3000);
    });

    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d")!;
    ctx.drawImage(video, 0, 0);
    const pixels = ctx.getImageData(0, 0, canvas.width, canvas.height).data;

    const out = {
      name: anchor.download,
      mime: blob.type,
      size: blob.size,
      duration: video.duration,
      width: video.videoWidth,
      height: video.videoHeight,
      // 통째로 넘기면 무거우니 가로 한 줄만 가져온다
      firstFrame: [...pixels.slice(0, canvas.width * 4)],
    };
    URL.revokeObjectURL(url);
    return out;
  });
}

async function open(page: Page, file: string) {
  await page.locator('input[type="file"]').setInputFiles(file);
  await expect(page.getByLabel("시작 (초)", { exact: true })).toBeVisible({ timeout: 60_000 });
}

async function setRange(page: Page, from: number, to: number) {
  await page.getByLabel("시작 (초)", { exact: true }).fill(String(from));
  await page.getByLabel("끝 (초)", { exact: true }).fill(String(to));
}

async function trim(page: Page) {
  await page.getByRole("button", { name: "잘라내기" }).click();
  await expect(page.locator("a[download]")).toHaveCount(1, { timeout: 120_000 });
}

test.beforeEach(async ({ page }) => {
  await page.goto("/ko/tools/video-trim");
});

test("요청 지점을 앞 키프레임으로 내리고, 그 사실을 누르기 전에 말한다", async ({ page }) => {
  await open(page, CLIP);
  await setRange(page, 2.5, 4);

  // 이 도구가 반드시 해야 하는 고백. 결과를 받고 나서가 아니라 지금 나와야 한다.
  await expect(page.getByText("2.5초가 아니라 2.0초에서 잘립니다")).toBeVisible();

  await trim(page);
  const result = await probeResult(page);

  expect(result.mime).toBe("video/mp4");
  expect(result.name).toBe("trim-구간.mp4");
  expect(result.width).toBe(320);
  expect(result.height).toBe(240);

  // 2.0초부터 4.0초까지 = 2초. 요청한 1.5초가 아니다.
  expect(result.duration).toBeGreaterThan(1.8);
  expect(result.duration).toBeLessThan(2.3);

  // 화면에 적힌 구간도 실제 값이어야 한다
  await expect(page.getByText("2.0초 → 4.0초")).toBeVisible();
});

test("키프레임에 정확히 맞으면 경고 대신 그렇다고 말한다", async ({ page }) => {
  await open(page, CLIP);
  await setRange(page, 3, 5);

  await expect(page.getByText("이 시작점은 키프레임에 정확히 맞습니다.")).toBeVisible();
  await expect(page.getByText(/에서 잘립니다/)).toHaveCount(0);

  await trim(page);
  const result = await probeResult(page);
  expect(result.duration).toBeGreaterThan(1.8);
  expect(result.duration).toBeLessThan(2.3);
});

/**
 * "다시 인코딩하지 않는다" 를 **픽셀로** 증명한다.
 *
 * 재인코딩하지 않았다면 잘라 낸 첫 프레임은 원본 2.0초 프레임과 **같은 부호화 데이터**다.
 * 같은 데이터를 같은 디코더에 넣었으니 나오는 픽셀도 같아야 한다.
 * 다시 인코딩했다면 손실 압축을 한 번 더 거쳐 값이 흔들린다.
 */
test("잘라 낸 첫 프레임이 원본의 그 프레임과 픽셀까지 같다 (재인코딩 없음)", async ({ page }) => {
  await open(page, CLIP);
  await setRange(page, 2, 4);
  await trim(page);

  const diff = await page.evaluate(async () => {
    const readRow = async (video: HTMLVideoElement, at: number) => {
      video.currentTime = at;
      await new Promise<void>((resolve) => {
        video.onseeked = () => resolve();
        setTimeout(resolve, 5000);
      });
      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(video, 0, 0);
      // 세로 한가운데 가로줄 하나면 충분하다 — 다르면 여기서 이미 다르다
      const y = Math.floor(canvas.height / 2);
      return ctx.getImageData(0, y, canvas.width, 1).data;
    };

    // 페이지에 이미 붙어 있는 <video> 가 원본이다 (blob: 로 로컬에서 읽는다)
    const source = document.querySelector("video")!;
    const original = await readRow(source, 2);

    const anchor = document.querySelector<HTMLAnchorElement>("a[download]")!;
    const blob = await (await fetch(anchor.href)).blob();
    const trimmed = document.createElement("video");
    trimmed.muted = true;
    trimmed.src = URL.createObjectURL(blob);
    await new Promise<void>((resolve, reject) => {
      trimmed.onloadeddata = () => resolve();
      trimmed.onerror = () => reject(new Error("trimmed video failed to load"));
      setTimeout(() => reject(new Error("timed out")), 20_000);
    });
    const cut = await readRow(trimmed, 0);

    let worst = 0;
    let sum = 0;
    for (let i = 0; i < original.length; i += 1) {
      const d = Math.abs(original[i] - cut[i]);
      if (d > worst) worst = d;
      sum += d;
    }
    return { worst, mean: sum / original.length, samples: original.length };
  });

  expect(diff.samples).toBeGreaterThan(1000);
  // 같은 부호화 데이터를 디코드했으므로 어긋날 이유가 없다
  expect(diff.worst).toBeLessThanOrEqual(2);
  expect(diff.mean).toBeLessThan(0.5);
});

test("소리도 함께 잘려 오고 실제로 들린다", async ({ page }) => {
  await open(page, CLIP);
  await setRange(page, 2, 4);
  await trim(page);

  const audio = await page.evaluate(async () => {
    const anchor = document.querySelector<HTMLAnchorElement>("a[download]")!;
    const bytes = await (await fetch(anchor.href)).blob().then((b) => b.arrayBuffer());
    const context = new AudioContext();
    const decoded = await context.decodeAudioData(bytes);
    const data = decoded.getChannelData(0);
    let peak = 0;
    for (let i = 0; i < data.length; i += 1) peak = Math.max(peak, Math.abs(data[i]));
    await context.close();
    return { duration: decoded.duration, peak };
  });

  // 440Hz 사인파가 살아 있어야 한다. 무음이면 오디오를 옮기지 못한 것이다.
  expect(audio.peak).toBeGreaterThan(0.05);
  // 영상과 길이가 맞아야 입이 맞는다
  expect(audio.duration).toBeGreaterThan(1.7);
  expect(audio.duration).toBeLessThan(2.4);

  await expect(page.getByText("소리도 원본 그대로 옮겼습니다.")).toBeVisible();
});

test("소리 없는 영상도 잘린다", async ({ page }) => {
  await open(page, SILENT);
  await setRange(page, 0, 0.5);
  await trim(page);

  const result = await probeResult(page);
  expect(result.width).toBe(160);
  expect(result.duration).toBeGreaterThan(0.2);
  await expect(page.getByText("소리도 원본 그대로 옮겼습니다.")).toHaveCount(0);
});

test("끝이 시작보다 앞이면 자를 수 없다", async ({ page }) => {
  await open(page, CLIP);
  await setRange(page, 4, 2);

  await expect(page.getByText("끝이 시작보다 뒤여야 합니다")).toBeVisible();
  await expect(page.getByRole("button", { name: "잘라내기" })).toBeDisabled();
});

test("영상이 아닌 파일은 조용히 통과하지 않는다", async ({ page }) => {
  await page.locator('input[type="file"]').setInputFiles(BROKEN);
  await expect(
    page.getByText(/MP4 나 MOV 로 열 수 없는 파일입니다|영상 트랙이 없는 파일입니다/),
  ).toBeVisible({ timeout: 60_000 });
  await expect(page.getByRole("button", { name: "잘라내기" })).toHaveCount(0);
});

test("자르는 동안 파일이 네트워크로 나가지 않는다", async ({ page }) => {
  const outbound: string[] = [];
  page.on("request", (request) => {
    const method = request.method();
    // 분석 태그는 파일과 무관하다 — 내용 검사는 tests/analytics.spec.ts 가 맡는다
    if ((method === "POST" || method === "PUT") && !isAnalytics(request.url())) {
      outbound.push(request.url());
    }
  });

  await open(page, CLIP);
  await setRange(page, 1, 3);
  await trim(page);

  expect(outbound).toEqual([]);
});

test("영상을 넣기 전에는 mp4box 를 받지 않는다 (프로덕션)", async ({ page }) => {
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

  await page.goto("/ko/tools/video-trim");
  await page.waitForLoadState("networkidle");

  armed = true;
  await open(page, CLIP);

  // mp4box(90KB) 남짓이면 충분하다. 이 도구는 코덱을 아예 부르지 않는다.
  expect(afterFile).toBeLessThan(1_000_000);
});
