import path from "node:path";
import { expect, test, type Page } from "@playwright/test";
import { isAnalytics } from "./net";

const CLIP = path.join(__dirname, "fixtures", "clip.mp4"); // 2초, AAC 440Hz 사인파
const NO_SOUND = path.join(__dirname, "fixtures", "silent.mp4"); // 오디오 트랙이 없는 영상
const BROKEN = path.join(__dirname, "fixtures", "broken.pdf");

interface Probed {
  name: string;
  mime: string;
  size: number;
  /** AudioContext 가 디코드해 낸 값 — 실제로 들리는 소리라는 증거 */
  duration: number;
  channels: number;
  sampleRate: number;
  /** 최대 진폭. 0 이면 무음(=추출이 깨진 것) */
  peak: number;
}

/** 결과를 진짜 오디오로 디코드해서 확인한다. 확장자만 보면 아무것도 모른다. */
async function probeResult(page: Page): Promise<Probed> {
  return page.evaluate(async () => {
    const anchor = document.querySelector<HTMLAnchorElement>("a[download]")!;
    const blob = await (await fetch(anchor.href)).blob();
    const bytes = await blob.arrayBuffer();

    const audioCtx = new AudioContext();
    const decoded = await audioCtx.decodeAudioData(bytes.slice(0));
    const data = decoded.getChannelData(0);
    let peak = 0;
    for (let i = 0; i < data.length; i += 1) {
      const value = Math.abs(data[i]);
      if (value > peak) peak = value;
    }
    await audioCtx.close();

    return {
      name: anchor.download,
      mime: blob.type,
      size: blob.size,
      duration: decoded.duration,
      channels: decoded.numberOfChannels,
      sampleRate: decoded.sampleRate,
      peak,
    };
  });
}

async function open(page: Page, file: string) {
  await page.locator('input[type="file"]').setInputFiles(file);
  await expect(page.getByText(/채널/)).toBeVisible({ timeout: 60_000 });
}

async function extract(page: Page) {
  await page.getByRole("button", { name: "오디오 추출" }).click();
  await expect(page.locator("a[download]")).toHaveCount(1, { timeout: 120_000 });
}

test.beforeEach(async ({ page }) => {
  await page.goto("/ko/tools/audio-extract");
});

test("M4A: 원본 트랙을 그대로 옮기고 실제로 소리가 난다", async ({ page }) => {
  await open(page, CLIP);
  await extract(page);

  const result = await probeResult(page);
  expect(result.name).toBe("clip.m4a");
  expect(result.duration).toBeGreaterThan(1.5);
  expect(result.duration).toBeLessThan(2.6);
  // 440Hz 사인파가 들어 있다. 무음이면 추출이 깨진 것이다.
  expect(result.peak).toBeGreaterThan(0.05);
});

test("WAV: 디코드된 PCM 이고 M4A 보다 크다", async ({ page }) => {
  await open(page, CLIP);
  await extract(page);
  const m4a = await probeResult(page);

  await page.getByLabel("WAV — 어디서나 열림").check();
  await extract(page);
  const wav = await probeResult(page);

  expect(wav.name).toBe("clip.wav");
  expect(wav.duration).toBeGreaterThan(1.5);
  expect(wav.peak).toBeGreaterThan(0.05);
  // 무압축이므로 압축본보다 확실히 크다
  expect(wav.size).toBeGreaterThan(m4a.size * 3);
});

test("두 형식의 길이와 채널 수가 서로 어긋나지 않는다", async ({ page }) => {
  await open(page, CLIP);
  await extract(page);
  const m4a = await probeResult(page);

  await page.getByLabel("WAV — 어디서나 열림").check();
  await extract(page);
  const wav = await probeResult(page);

  expect(wav.channels).toBe(m4a.channels);
  expect(Math.abs(wav.duration - m4a.duration)).toBeLessThan(0.2);
});

test("소리가 없는 영상은 그렇다고 말한다", async ({ page }) => {
  await page.locator('input[type="file"]').setInputFiles(NO_SOUND);
  await expect(page.getByText("꺼낼 소리가 없는 파일입니다")).toBeVisible({ timeout: 60_000 });
  await expect(page.getByRole("button", { name: "오디오 추출" })).toHaveCount(0);
});

test("영상이 아닌 파일은 조용히 통과하지 않는다", async ({ page }) => {
  await page.locator('input[type="file"]').setInputFiles(BROKEN);
  await expect(
    page.getByText(/MP4 나 MOV 로 열 수 없는 파일입니다|꺼낼 소리가 없는 파일입니다/),
  ).toBeVisible({ timeout: 60_000 });
});

test("추출 중 파일이 네트워크로 나가지 않는다", async ({ page }) => {
  const outbound: string[] = [];
  page.on("request", (request) => {
    const method = request.method();
    // 분석 태그는 파일과 무관하다 — 내용 검사는 tests/analytics.spec.ts 가 맡는다
    if ((method === "POST" || method === "PUT") && !isAnalytics(request.url())) {
      outbound.push(request.url());
    }
  });

  await open(page, CLIP);
  await extract(page);

  expect(outbound).toEqual([]);
});
