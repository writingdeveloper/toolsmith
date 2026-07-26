import { readFileSync } from "node:fs";
import path from "node:path";
import { expect, test, type Page } from "@playwright/test";
import { isAnalytics } from "./net";

/** 2초, H.264 + AAC, 320×240. */
const MP4 = path.join(__dirname, "fixtures", "clip.mp4");
/** 같은 스트림을 QuickTime 상자에 담은 것(-c copy). 짝이 있어야 무손실을 증명할 수 있다. */
const MOV = path.join(__dirname, "fixtures", "clip.mov");
const SILENT = path.join(__dirname, "fixtures", "silent.mp4");
const BROKEN = path.join(__dirname, "fixtures", "broken.pdf");

interface Probed {
  name: string;
  mime: string;
  size: number;
  /** 파일 맨 앞 12바이트. 상자가 정말 바뀌었는지는 여기서만 확실해진다. */
  magic: number[];
  duration: number;
  width: number;
  height: number;
}

/** 결과를 브라우저가 실제로 재생할 수 있는지, 그리고 진짜 그 형식인지 확인한다. */
async function probeResult(page: Page): Promise<Probed> {
  return page.evaluate(async () => {
    const anchor = document.querySelector<HTMLAnchorElement>("a[download]")!;
    const blob = await (await fetch(anchor.href)).blob();
    const magic = [...new Uint8Array(await blob.slice(0, 12).arrayBuffer())];
    const url = URL.createObjectURL(blob);

    const video = document.createElement("video");
    video.muted = true;
    video.src = url;
    await new Promise<void>((resolve, reject) => {
      video.onloadeddata = () => resolve();
      video.onerror = () => reject(new Error("video failed to load"));
      setTimeout(() => reject(new Error("video load timed out")), 30_000);
    });
    video.currentTime = 0;
    await new Promise<void>((resolve) => {
      video.onseeked = () => resolve();
      setTimeout(resolve, 3000);
    });

    const out = {
      name: anchor.download,
      mime: blob.type,
      size: blob.size,
      magic,
      duration: video.duration,
      width: video.videoWidth,
      height: video.videoHeight,
    };
    URL.revokeObjectURL(url);
    return out;
  });
}

async function open(page: Page, file: string) {
  await page.locator('input[type="file"]').setInputFiles(file);
  await expect(page.getByRole("button", { name: "MP4", exact: true })).toBeVisible({
    timeout: 60_000,
  });
}

async function chooseTarget(page: Page, format: "MP4" | "WebM") {
  await page.getByRole("button", { name: format, exact: true }).click();
}

async function convert(page: Page, format: "MP4" | "WebM") {
  await page.getByRole("button", { name: `${format} 형식으로 변환` }).click();
  await expect(page.locator("a[download]")).toHaveCount(1, { timeout: 180_000 });
}

test.beforeEach(async ({ page }) => {
  await page.goto("/ko/tools/video-convert");
});

/**
 * 이 도구의 핵심 주장을 **픽셀로** 증명한다.
 *
 * clip.mov 와 clip.mp4 는 같은 부호화 데이터를 다른 상자에 담은 짝이다. MOV → MP4 가
 * 정말 재인코딩 없이 옮기기만 했다면, 나온 MP4 의 한 프레임은 원본 MOV 의 그 프레임과
 * **같은 데이터를 같은 디코더에 넣은 것**이므로 픽셀도 같아야 한다. 손실 압축을 한 번
 * 더 거쳤다면 값이 흔들린다.
 */
test("MOV 를 MP4 로 옮길 때 코덱을 건드리지 않는다", async ({ page }) => {
  await open(page, MOV);
  await chooseTarget(page, "MP4");
  await convert(page, "MP4");

  const result = await probeResult(page);
  expect(result.name).toBe("clip.mp4");
  expect(result.mime).toBe("video/mp4");
  expect(result.width).toBe(320);
  expect(result.height).toBe(240);
  expect(result.duration).toBeGreaterThan(1.8);
  expect(result.duration).toBeLessThan(2.3);
  // ISOBMFF: 4바이트 크기 뒤에 "ftyp"
  expect(String.fromCharCode(...result.magic.slice(4, 8))).toBe("ftyp");

  // 원본을 다시 읽어야 하는데 FileDrop 이 <input> 을 비워 둔다(같은 파일을 다시 고를 수
  // 있게 하려고). 그래서 바이트를 테스트에서 직접 들여보낸다.
  const sourceBase64 = readFileSync(MOV).toString("base64");

  const diff = await page.evaluate(async (base64: string) => {
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
      const y = Math.floor(canvas.height / 2);
      return ctx.getImageData(0, y, canvas.width, 1).data;
    };

    const load = async (blob: Blob) => {
      const video = document.createElement("video");
      video.muted = true;
      video.src = URL.createObjectURL(blob);
      await new Promise<void>((resolve, reject) => {
        video.onloadeddata = () => resolve();
        video.onerror = () => reject(new Error("failed to load"));
        setTimeout(() => reject(new Error("timed out")), 30_000);
      });
      return video;
    };

    const raw = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
    const original = await readRow(await load(new Blob([raw], { type: "video/quicktime" })), 1);

    const anchor = document.querySelector<HTMLAnchorElement>("a[download]")!;
    const converted = await readRow(await load(await (await fetch(anchor.href)).blob()), 1);

    let worst = 0;
    let sum = 0;
    for (let i = 0; i < original.length; i += 1) {
      const d = Math.abs(original[i] - converted[i]);
      if (d > worst) worst = d;
      sum += d;
    }
    return { worst, mean: sum / original.length, samples: original.length };
  }, sourceBase64);

  expect(diff.samples).toBeGreaterThan(1000);
  expect(diff.worst).toBeLessThanOrEqual(2);
  expect(diff.mean).toBeLessThan(0.5);

  await expect(page.getByText("다시 인코딩하지 않았습니다.", { exact: false })).toBeVisible();
});

test("MP4 를 WebM 으로 바꾸면 진짜 WebM 이 나온다", async ({ page }) => {
  await open(page, MP4);
  await chooseTarget(page, "WebM");
  await convert(page, "WebM");

  const result = await probeResult(page);
  expect(result.name).toBe("clip.webm");
  expect(result.mime).toBe("video/webm");
  // Matroska/WebM 의 EBML 머리글. MP4 를 그대로 내보냈다면 여기서 걸린다.
  expect(result.magic.slice(0, 4)).toEqual([0x1a, 0x45, 0xdf, 0xa3]);
  expect(result.width).toBe(320);
  expect(result.height).toBe(240);
  expect(result.duration).toBeGreaterThan(1.7);
  expect(result.duration).toBeLessThan(2.4);

  await expect(page.getByText("화면을 VP9 로 다시 인코딩했습니다.", { exact: false })).toBeVisible();
});

test("WebM 안의 소리가 실제로 들린다", async ({ page }) => {
  await open(page, MP4);
  await chooseTarget(page, "WebM");
  await convert(page, "WebM");

  const audio = await page.evaluate(async () => {
    const anchor = document.querySelector<HTMLAnchorElement>("a[download]")!;
    const bytes = await (await fetch(anchor.href)).blob().then((b) => b.arrayBuffer());
    const context = new AudioContext();
    const decoded = await context.decodeAudioData(bytes);
    const data = decoded.getChannelData(0);
    let peak = 0;
    for (let i = 0; i < data.length; i += 1) peak = Math.max(peak, Math.abs(data[i]));
    await context.close();
    return { duration: decoded.duration, peak, rate: decoded.sampleRate };
  });

  // AAC 440Hz 사인파가 Opus 를 거쳐도 살아 있어야 한다. 무음이면 오디오 파이프라인이 끊긴 것이다.
  expect(audio.peak).toBeGreaterThan(0.05);
  expect(audio.duration).toBeGreaterThan(1.7);
  expect(audio.duration).toBeLessThan(2.4);
});

test("긴 변 상한이 원본보다 크면 키우지 않는다", async ({ page }) => {
  await open(page, MP4);
  await chooseTarget(page, "WebM");
  await page.getByLabel("크기").selectOption("640");
  await convert(page, "WebM");

  // 320×240 짜리를 640 으로 늘리지 않는다 — 상한이지 목표가 아니다
  const result = await probeResult(page);
  expect(result.width).toBe(320);
  expect(result.height).toBe(240);
});

test("소리 없는 영상도 WebM 으로 나가고, 없는 소리를 말하지 않는다", async ({ page }) => {
  await open(page, SILENT);
  await chooseTarget(page, "WebM");
  await convert(page, "WebM");

  const result = await probeResult(page);
  expect(result.magic.slice(0, 4)).toEqual([0x1a, 0x45, 0xdf, 0xa3]);
  expect(result.width).toBe(160);
  expect(result.duration).toBeGreaterThan(0.5);

  await expect(page.getByText("소리도 함께 옮겼습니다.")).toHaveCount(0);
  await expect(page.getByText("소리는 옮기지 못했습니다.")).toHaveCount(0);
});

test("MOV 를 넣으면 MP4 를, MP4 를 넣으면 WebM 을 먼저 권한다", async ({ page }) => {
  await open(page, MOV);
  await expect(page.getByRole("button", { name: "MP4", exact: true })).toHaveAttribute(
    "aria-pressed",
    "true",
  );

  await page.locator('input[type="file"]').setInputFiles(MP4);
  await expect(page.getByRole("button", { name: "WebM", exact: true })).toHaveAttribute(
    "aria-pressed",
    "true",
  );
});

test("이미 MP4 인 파일에는 그렇다고 말한다", async ({ page }) => {
  await open(page, MP4);
  await chooseTarget(page, "MP4");
  await expect(page.getByText("이미 MP4 입니다", { exact: false })).toBeVisible();

  // MOV 에서는 할 말이 아니다
  await page.locator('input[type="file"]').setInputFiles(MOV);
  await chooseTarget(page, "MP4");
  await expect(page.getByText("이미 MP4 입니다", { exact: false })).toHaveCount(0);
});

test("어느 쪽을 고르든 무슨 일이 벌어지는지 누르기 전에 말한다", async ({ page }) => {
  await open(page, MOV);

  await chooseTarget(page, "MP4");
  await expect(page.getByText(/코덱은 건드리지 않고 상자만 다시 씁니다/)).toBeVisible();
  // 재인코딩 경로의 설정은 나오면 안 된다 — 여기서는 의미가 없다
  await expect(page.getByLabel("화질")).toHaveCount(0);

  await chooseTarget(page, "WebM");
  await expect(page.getByText(/^H\.264 는 WebM 에 들어갈 수 없어/)).toBeVisible();
  await expect(page.getByLabel("화질")).toBeVisible();
});

test("영상이 아닌 파일은 조용히 통과하지 않는다", async ({ page }) => {
  await page.locator('input[type="file"]').setInputFiles(BROKEN);
  await expect(
    page.getByText(/MP4 나 MOV 로 열 수 없는 파일입니다|영상 트랙이 없는 파일입니다/),
  ).toBeVisible({ timeout: 60_000 });
  await expect(page.getByRole("button", { name: "MP4", exact: true })).toHaveCount(0);
});

test("변환하는 동안 파일이 네트워크로 나가지 않는다", async ({ page }) => {
  const outbound: string[] = [];
  page.on("request", (request) => {
    const method = request.method();
    // 분석 태그는 파일과 무관하다 — 내용 검사는 tests/analytics.spec.ts 가 맡는다
    if ((method === "POST" || method === "PUT") && !isAnalytics(request.url())) {
      outbound.push(request.url());
    }
  });

  await open(page, MOV);
  await chooseTarget(page, "MP4");
  await convert(page, "MP4");

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

  await page.goto("/ko/tools/video-convert");
  await page.waitForLoadState("networkidle");

  armed = true;
  await open(page, MOV);

  // mp4box(90KB)와 워커 남짓. webm-muxer 는 WebM 을 누를 때까지 오지 않는다.
  expect(afterFile).toBeLessThan(1_000_000);
});
