import path from "node:path";
import { expect, test, type Page } from "@playwright/test";
import { isAnalytics } from "./net";

const CLIP = path.join(__dirname, "fixtures", "clip.mp4"); // H.264 320x240 15fps 2초
const SILENT = path.join(__dirname, "fixtures", "silent.mp4"); // 160x120, 오디오 없음
const BROKEN = path.join(__dirname, "fixtures", "broken.pdf");

interface Parsed {
  header: string;
  mime: string;
  size: number;
  name: string;
  width: number;
  height: number;
  frames: number;
  /** 프레임마다 GCE 에 적힌 지연(1/100초) */
  delays: number[];
  /** NETSCAPE 확장의 반복 횟수. 0 = 무한 */
  loops: number | null;
  /** 트레일러(0x3B)까지 온전히 닿았는가 */
  ended: boolean;
  /** 첫 프레임 가운데 픽셀 — 실제로 그려지는 그림이라는 증거 */
  centerPixel: number[];
}

/**
 * 결과 GIF 를 **바이트 단위로 뜯는다.**
 *
 * "GIF 로 저장됨" 이라는 글자는 아무것도 증명하지 않는다. 논리 화면 크기, 이미지
 * 디스크립터 개수, GCE 의 지연값을 파일에서 직접 읽어 화면에 뜬 숫자와 대조한다.
 * 마지막으로 브라우저에 실제로 그려 보아 "GIF 처럼 생긴 쓰레기" 를 걸러 낸다.
 */
async function inspectResult(page: Page): Promise<Parsed> {
  return page.evaluate(async () => {
    const anchor = document.querySelector<HTMLAnchorElement>("a[download]")!;
    const blob = await (await fetch(anchor.href)).blob();
    const bytes = new Uint8Array(await blob.arrayBuffer());

    const u16 = (at: number) => bytes[at] | (bytes[at + 1] << 8);
    const text = (from: number, length: number) =>
      String.fromCharCode(...bytes.subarray(from, from + length));

    const header = text(0, 6);
    const width = u16(6);
    const height = u16(8);
    const packed = bytes[10];

    let pos = 13;
    // 전역 색표
    if (packed & 0x80) pos += 3 * (1 << ((packed & 7) + 1));

    const delays: number[] = [];
    let frames = 0;
    let loops: number | null = null;
    let pendingDelay = -1;
    let ended = false;

    while (pos < bytes.length) {
      const marker = bytes[pos];

      if (marker === 0x3b) {
        ended = true;
        break;
      }

      if (marker === 0x21) {
        // 확장 블록: 라벨 + 서브블록 사슬
        const label = bytes[pos + 1];
        pos += 2;
        const payload: number[] = [];
        while (bytes[pos] !== 0) {
          const size = bytes[pos];
          for (let i = 1; i <= size; i += 1) payload.push(bytes[pos + i]);
          pos += size + 1;
        }
        pos += 1;
        if (label === 0xf9) pendingDelay = payload[1] | (payload[2] << 8);
        if (label === 0xff && String.fromCharCode(...payload.slice(0, 11)) === "NETSCAPE2.0") {
          loops = payload[12] | (payload[13] << 8);
        }
        continue;
      }

      if (marker === 0x2c) {
        // 이미지 디스크립터: x,y,w,h,packed = 9바이트
        const framePacked = bytes[pos + 9];
        pos += 10;
        if (framePacked & 0x80) pos += 3 * (1 << ((framePacked & 7) + 1));
        pos += 1; // LZW 최소 코드 길이
        while (bytes[pos] !== 0) pos += bytes[pos] + 1;
        pos += 1;
        frames += 1;
        delays.push(pendingDelay);
        pendingDelay = -1;
        continue;
      }

      break; // 알 수 없는 블록 — 여기서 멈추면 ended 가 false 로 남아 드러난다
    }

    // 브라우저가 실제로 디코드해서 그리는가
    const bitmap = await createImageBitmap(blob);
    const canvas = new OffscreenCanvas(bitmap.width, bitmap.height);
    const ctx = canvas.getContext("2d")!;
    ctx.drawImage(bitmap, 0, 0);
    const pixel = ctx.getImageData(
      Math.floor(bitmap.width / 2),
      Math.floor(bitmap.height / 2),
      1,
      1,
    ).data;

    return {
      header,
      mime: blob.type,
      size: blob.size,
      name: anchor.download,
      width,
      height,
      frames,
      delays,
      loops,
      ended,
      centerPixel: [...pixel],
    };
  });
}

async function open(page: Page, file: string, dimensions: string) {
  await page.locator('input[type="file"]').setInputFiles(file);
  await expect(page.getByText(dimensions)).toBeVisible({ timeout: 60_000 });
}

async function render(page: Page) {
  await page.getByRole("button", { name: "GIF 만들기" }).click();
  await expect(page.locator("a[download]")).toHaveCount(1, { timeout: 180_000 });
}

test.beforeEach(async ({ page }) => {
  await page.goto("/ko/tools/video-to-gif");
});

test("결과가 구조적으로 온전하고 실제로 그려지는 GIF 다", async ({ page }) => {
  await open(page, CLIP, "320×240");
  await render(page);

  const gif = await inspectResult(page);

  expect(gif.header).toBe("GIF89a");
  expect(gif.mime).toBe("image/gif");
  expect(gif.name).toBe("clip.gif");
  // 트레일러까지 닿았다 = 블록 사슬이 처음부터 끝까지 말이 된다
  expect(gif.ended).toBe(true);

  // 원본 320×240 은 긴 변 480 제한에 걸리지 않으므로 그대로다
  expect(gif.width).toBe(320);
  expect(gif.height).toBe(240);

  // 15fps 요청 → GIF 는 1/100초 단위라 7/100초(14.29fps)가 된다. 전부 같아야 한다.
  expect(new Set(gif.delays)).toEqual(new Set([7]));

  // 2초 × 14.29fps ≈ 28장. 원본이 15fps 라 몇 장은 건너뛴다.
  expect(gif.frames).toBeGreaterThan(24);
  expect(gif.frames).toBeLessThanOrEqual(30);

  expect(gif.loops).toBe(0); // 무한 반복

  // 온통 검은 화면이면 디코드는 됐지만 그림이 없는 것이다
  const [r, g, b] = gif.centerPixel;
  expect(r + g + b).toBeGreaterThan(30);

  // 화면에 뜬 프레임 수가 파일 안의 것과 같고, 요청한 15 가 아니라 실제 값을 말한다
  await expect(page.getByText(`${gif.frames} 프레임 · 14.3 fps`)).toBeVisible();
  // 고른 값과 다르므로 설정 칸에서도 실제 값을 밝힌다
  await expect(page.getByText(/^약 \d+ 프레임 · 실제로는 14\.3 fps$/)).toBeVisible();
});

test("10fps 는 정확히 1/100초 10칸으로 적히고 프레임이 줄어든다", async ({ page }) => {
  await open(page, CLIP, "320×240");
  await page.getByLabel("초당 프레임").selectOption("10");

  // 10fps 는 1/100초에 딱 떨어지므로 "실제로는…" 을 덧붙이지 않는다
  // (FAQ 본문에도 그 말이 나오므로 설정 칸의 문장 전체로 못박는다)
  await expect(page.getByText(/^약 \d+ 프레임$/)).toBeVisible();

  await render(page);

  const gif = await inspectResult(page);
  expect(new Set(gif.delays)).toEqual(new Set([10]));
  // 2초 × 10fps ≈ 20장
  expect(gif.frames).toBeGreaterThan(16);
  expect(gif.frames).toBeLessThanOrEqual(22);
  await expect(page.getByText(`${gif.frames} 프레임 · 10.0 fps`)).toBeVisible();
});

test("크기를 줄이면 GIF 의 논리 화면이 실제로 작아진다", async ({ page }) => {
  await open(page, CLIP, "320×240");
  await page.getByLabel("크기").selectOption("240");
  await render(page);

  const gif = await inspectResult(page);
  expect(gif.width).toBe(240);
  expect(gif.height).toBe(180);
  expect(gif.centerPixel[0] + gif.centerPixel[1] + gif.centerPixel[2]).toBeGreaterThan(30);
});

test("소리가 없는 영상도 문제없이 GIF 가 된다", async ({ page }) => {
  await open(page, SILENT, "160×120");
  await render(page);

  const gif = await inspectResult(page);
  expect(gif.header).toBe("GIF89a");
  expect(gif.width).toBe(160);
  expect(gif.frames).toBeGreaterThan(4);
});

test("영상이 아닌 파일은 조용히 통과하지 않는다", async ({ page }) => {
  await page.locator('input[type="file"]').setInputFiles(BROKEN);
  await expect(
    page.getByText(/MP4 나 MOV 로 열 수 없는 파일입니다|영상 트랙이 없는 파일입니다/),
  ).toBeVisible({ timeout: 60_000 });
  await expect(page.getByRole("button", { name: "GIF 만들기" })).toHaveCount(0);
});

test("GIF 를 만드는 동안 파일이 네트워크로 나가지 않는다", async ({ page }) => {
  const outbound: string[] = [];
  page.on("request", (request) => {
    const method = request.method();
    // 분석 태그는 파일과 무관하다 — 내용 검사는 tests/analytics.spec.ts 가 맡는다
    if ((method === "POST" || method === "PUT") && !isAnalytics(request.url())) {
      outbound.push(request.url());
    }
  });

  await open(page, CLIP, "320×240");
  await render(page);

  expect(outbound).toEqual([]);
});

test("영상을 넣기 전에는 mp4box·gifenc 를 받지 않는다 (프로덕션)", async ({ page }) => {
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

  await page.goto("/ko/tools/video-to-gif");
  await page.waitForLoadState("networkidle");

  armed = true;
  await open(page, CLIP, "320×240");

  // mp4box(90KB) + gifenc(20KB) 남짓이면 충분하다
  expect(afterFile).toBeLessThan(1_000_000);
});
