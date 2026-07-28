/**
 * 회전한 영상이 바로 선 채로 나오는가.
 *
 * **도구 하나가 아니라 네 도구가 함께 지키는 성질이라 파일을 따로 둔다.** 회전을
 * 다루는 방법이 출력에 따라 갈리기 때문에(MP4 는 상자에 적고, WebM·GIF 는 픽셀을
 * 돌린다) 한 도구의 스펙에 넣으면 나머지 셋이 조용히 빠진다. 근거는
 * `lib/video/rotation.ts`.
 *
 * 표본은 Chromium 미디어 테스트 자산이다. 넷은 **같은 가로 픽셀에 회전 플래그만
 * 다르게 붙인 것**이라(90·180·270 은 바이트 수까지 63,080 으로 같다) 방향만 따로
 * 떼어 볼 수 있다. 그래서 기준은 "넷이 서로 같다" 가 아니라 **"각 결과가 자기 원본과
 * 같다"** 이다 — 재생기가 보여 주는 그림이 곧 정답이다.
 */
import { readFileSync } from "node:fs";
import path from "node:path";
import { expect, test, type Page } from "@playwright/test";

const F = (n: string) => path.join(__dirname, "fixtures", n);

interface Case {
  /** 픽셀은 넷 다 1280×720 가로다 */
  file: string;
  /** 재생기가 보여 주는 크기 */
  width: number;
  height: number;
}

const CASES: Case[] = [
  { file: "rot0.mp4", width: 1280, height: 720 }, // 대조군 — 회전 없음
  { file: "rot90.mp4", width: 720, height: 1280 },
  { file: "rot180.mp4", width: 1280, height: 720 }, // 크기로는 안 드러난다. 상하가 뒤집힌다
  { file: "rot270.mp4", width: 720, height: 1280 },
];

/**
 * 프레임을 16×16 회색조로 줄인다.
 *
 * **방향이 틀리면 이 값이 자릿수째로 벌어진다.** 고치기 전 실측에서 회전본은 70 대,
 * 고친 뒤에는 재인코딩 오차만 남아 한 자릿수다. 90 과 270 을 뒤바꾸면 크기는 맞고
 * 이 값만 무너지므로, 크기 검사만으로는 잡히지 않는 자리를 여기가 맡는다.
 */
const THUMB = `async (url) => {
  const v = document.createElement("video");
  v.muted = true;
  v.src = url;
  await new Promise((res, rej) => {
    v.onloadeddata = () => res();
    v.onerror = () => rej(new Error("load"));
    setTimeout(() => rej(new Error("timeout")), 20000);
  });
  v.currentTime = 0;
  await new Promise((res) => { v.onseeked = () => res(); setTimeout(res, 2000); });
  const c = document.createElement("canvas");
  c.width = 16; c.height = 16;
  const g = c.getContext("2d");
  g.drawImage(v, 0, 0, 16, 16);
  const d = g.getImageData(0, 0, 16, 16).data;
  const out = [];
  for (let i = 0; i < d.length; i += 4) out.push(Math.round(0.299*d[i] + 0.587*d[i+1] + 0.114*d[i+2]));
  return { thumb: out, w: v.videoWidth, h: v.videoHeight };
}`;

interface Thumb {
  thumb: number[];
  w: number;
  h: number;
}

function mae(a: number[], b: number[]): number {
  let sum = 0;
  for (let i = 0; i < a.length; i += 1) sum += Math.abs(a[i] - b[i]);
  return sum / a.length;
}

/** 원본을 브라우저에 그대로 물려 본다. Chrome 이 tkhd 행렬을 적용해서 그린다. */
async function sourceThumb(page: Page, file: string): Promise<Thumb> {
  const b64 = readFileSync(F(file)).toString("base64");
  return page.evaluate(
    async ([data, fn]) => {
      const raw = atob(data);
      const bytes = new Uint8Array(raw.length);
      for (let i = 0; i < raw.length; i += 1) bytes[i] = raw.charCodeAt(i);
      const url = URL.createObjectURL(new Blob([bytes], { type: "video/mp4" }));
      return (0, eval)(`(${fn})`)(url) as Promise<Thumb>;
    },
    [b64, THUMB],
  );
}

async function resultThumb(page: Page): Promise<Thumb> {
  return page.evaluate(async (fn) => {
    const anchor = document.querySelector<HTMLAnchorElement>("a[download]")!;
    const blob = await (await fetch(anchor.href)).blob();
    return (0, eval)(`(${fn})`)(URL.createObjectURL(blob)) as Promise<Thumb>;
  }, THUMB);
}

/** GIF 는 <video> 로 열리지 않으므로 <img> 로 그린다. */
async function gifThumb(page: Page): Promise<Thumb> {
  return page.evaluate(async () => {
    const anchor = document.querySelector<HTMLAnchorElement>("a[download]")!;
    const blob = await (await fetch(anchor.href)).blob();
    const img = new Image();
    img.src = URL.createObjectURL(blob);
    await img.decode();
    const canvas = document.createElement("canvas");
    canvas.width = 16;
    canvas.height = 16;
    const ctx = canvas.getContext("2d")!;
    ctx.drawImage(img, 0, 0, 16, 16);
    const data = ctx.getImageData(0, 0, 16, 16).data;
    const out: number[] = [];
    for (let i = 0; i < data.length; i += 4) {
      out.push(Math.round(0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]));
    }
    return { thumb: out, w: img.naturalWidth, h: img.naturalHeight };
  });
}

async function run(
  page: Page,
  slug: string,
  file: string,
  button: string,
  before?: (p: Page) => Promise<void>,
) {
  await page.goto(`/ko/tools/${slug}`);
  await page.locator('input[type="file"]').setInputFiles(F(file));
  if (before) await before(page);
  await expect(page.getByRole("button", { name: button })).toBeEnabled({ timeout: 60_000 });
  await page.getByRole("button", { name: button }).click();
  await expect(page.locator("a[download]")).toHaveCount(1, { timeout: 180_000 });
}

const pickTarget = (label: "MP4" | "WebM") => async (page: Page) => {
  await expect(page.getByRole("button", { name: label, exact: true })).toBeVisible({
    timeout: 60_000,
  });
  await page.getByRole("button", { name: label, exact: true }).click();
};

test("원본이 세로로 보인다 — 표본이 실제로 회전을 지니고 있다", async ({ page }) => {
  await page.goto("/ko/tools/video-convert");
  for (const item of CASES) {
    const source = await sourceThumb(page, item.file);
    expect(source.w, item.file).toBe(item.width);
    expect(source.h, item.file).toBe(item.height);
  }
});

/**
 * 재mux 경로(자르기 · MOV→MP4)는 픽셀을 건드리지 않으므로 **어긋남이 0 이어야 한다.**
 * 여기서 값이 조금이라도 뜨면 무손실이라는 주장이 깨진 것이다.
 */
for (const [label, slug, button, before] of [
  ["변환(MP4)", "video-convert", "MP4 형식으로 변환", pickTarget("MP4")],
  ["자르기", "video-trim", "잘라내기", undefined],
] as const) {
  test(`${label} — 회전을 다시 적어 원본 그대로 내보낸다`, async ({ page }) => {
    await page.goto("/ko/tools/video-convert");
    for (const item of CASES) {
      const source = await sourceThumb(page, item.file);
      await run(page, slug, item.file, button, before);
      const out = await resultThumb(page);
      expect(out.w, item.file).toBe(item.width);
      expect(out.h, item.file).toBe(item.height);
      expect(mae(source.thumb, out.thumb), item.file).toBe(0);
    }
  });
}

test("압축 — 픽셀은 그대로 두고 회전만 옮긴다", async ({ page }) => {
  await page.goto("/ko/tools/video-convert");
  for (const item of CASES) {
    const source = await sourceThumb(page, item.file);
    await run(page, "video-compress", item.file, "압축하기");
    const out = await resultThumb(page);
    expect(out.w, item.file).toBe(item.width);
    expect(out.h, item.file).toBe(item.height);
    // 다시 인코딩하므로 0 은 아니다. 실측 0.3~0.4, 방향이 틀리면 70 대.
    expect(mae(source.thumb, out.thumb), item.file).toBeLessThan(5);
  }
});

test("변환(WebM) — 상자가 회전을 못 담으니 픽셀을 돌린다", async ({ page }) => {
  await page.goto("/ko/tools/video-convert");
  for (const item of CASES) {
    const source = await sourceThumb(page, item.file);
    await run(page, "video-convert", item.file, "WebM 형식으로 변환", pickTarget("WebM"));
    const out = await resultThumb(page);
    expect(out.w, item.file).toBe(item.width);
    expect(out.h, item.file).toBe(item.height);
    // VP9 재인코딩. 실측 0.4~1.6.
    expect(mae(source.thumb, out.thumb), item.file).toBeLessThan(8);
  }
});

test("GIF — 회전을 담을 자리가 아예 없으니 픽셀을 돌린다", async ({ page }) => {
  await page.goto("/ko/tools/video-convert");
  for (const item of CASES) {
    const source = await sourceThumb(page, item.file);
    await run(page, "video-to-gif", item.file, "GIF 만들기");
    const out = await gifThumb(page);
    // 긴 변 480 으로 줄여 나간다 — 비율이 유지되는지가 곧 방향이 맞는지다
    expect(out.w > out.h, item.file).toBe(item.width > item.height);
    expect(Math.max(out.w, out.h), item.file).toBe(480);
    // 256색으로 줄이므로 오차가 크다. 실측 9.1~10, 방향이 틀리면 70 대.
    expect(mae(source.thumb, out.thumb), item.file).toBeLessThan(25);
  }
});
