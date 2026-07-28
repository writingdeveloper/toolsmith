import { readFileSync } from "node:fs";
import path from "node:path";
import { expect, test, type Page } from "@playwright/test";
import { toCues, toMono16k, toSrt, toVtt } from "../lib/subtitles/subtitle-core";
import { isAnalytics } from "./net";

/** 1961년 케네디 취임 연설 앞 6초(퍼블릭 도메인), 16kHz 모노. */
const SPEECH = path.join(__dirname, "fixtures", "speech.wav");
/** 1908년 부커 T. 워싱턴 연설 녹음 12초(퍼블릭 도메인). **컨테이너가 없는 MP3** 다. */
const SPEECH_MP3 = path.join(__dirname, "fixtures", "speech.mp3");
/** 소리가 없는 영상 — "소리가 없다" 를 제대로 말하는지 본다. */
const SILENT = path.join(__dirname, "fixtures", "silent.mp4");

const MODEL_HOST = /huggingface\.co|hf\.co|cdn-lfs/;
const ENGINE_HOST = /cdn\.jsdelivr\.net\/npm\/@huggingface\/transformers/;

async function run(page: Page) {
  await page.getByRole("button", { name: "자막 만들기" }).click();
  await expect(page.locator("[data-summary]")).toBeVisible({ timeout: 600_000 });
}

/* ── 브라우저 없이 도는 검사 ─────────────────────────────────────
 * 자막 파일 형식은 순수 계산이다. 여기가 틀리면 어떤 자막 프로그램도 열지 못한다. */

test("SRT 는 쉼표, VTT 는 마침표로 밀리초를 적는다", () => {
  const cues = [
    { start: 0, end: 2.5, text: "첫 줄" },
    { start: 2.5, end: 3661.125, text: "둘째 줄" },
  ];

  expect(toSrt(cues)).toBe(
    "1\n00:00:00,000 --> 00:00:02,500\n첫 줄\n\n2\n00:00:02,500 --> 01:01:01,125\n둘째 줄\n\n",
  );
  expect(toVtt(cues)).toBe(
    "WEBVTT\n\n00:00:00.000 --> 00:00:02.500\n첫 줄\n\n00:00:02.500 --> 01:01:01.125\n둘째 줄\n",
  );
});

test("끝이 비어 있는 구간을 그대로 두지 않는다", () => {
  // 모델이 마지막 구간을 안 닫는 일이 있다. 그대로 쓰면 자막 파일이 깨진다.
  const cues = toCues(
    [
      { timestamp: [0, 1.5], text: " 안녕 " },
      { timestamp: [1.5, null], text: "끝" },
    ],
    9,
  );
  expect(cues).toEqual([
    { start: 0, end: 1.5, text: "안녕" },
    { start: 1.5, end: 9, text: "끝" },
  ]);

  // 빈 구간은 버리고, 길이가 0 인 구간은 최소 길이를 준다
  expect(toCues([{ timestamp: [1, 1], text: "  " }], 5)).toEqual([]);
  expect(toCues([{ timestamp: [1, 1], text: "짧다" }], 5)[0].end).toBeGreaterThan(1);
});

test("여러 채널을 섞고 16kHz 로 내린다", () => {
  // 48kHz 스테레오 1초 → 16kHz 모노 16000 표본
  const left = new Float32Array(48_000).fill(1);
  const right = new Float32Array(48_000).fill(-1);
  const mixed = toMono16k([left, right], 48_000);
  expect(mixed.length).toBe(16_000);
  // 좌우가 정반대이므로 섞으면 0 이어야 한다
  expect(Math.abs(mixed[100])).toBeLessThan(1e-6);

  // 이미 16kHz 면 그대로 둔다
  const same = toMono16k([new Float32Array(16_000).fill(0.5)], 16_000);
  expect(same.length).toBe(16_000);
  expect(same[0]).toBeCloseTo(0.5, 5);
});

test.describe("브라우저", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/ko/tools/subtitles");
  });

  test("받을 용량과 실패 모드를 누르기 전에 말한다", async ({ page }) => {
    await expect(page.locator("[data-notes]")).toContainText("150 MB");
    // 잡음에서 무너진다는 것을 미리 말한다 — 이 도구의 정직한 한계다
    await expect(page.locator("[data-noise-note]")).toContainText("반복");
    await page.getByLabel("모델").selectOption("accurate");
    await expect(page.locator("[data-notes]")).toContainText("283 MB");
  });

  /** 규칙 2 — 누르기 전에는 엔진도 모델도 받지 않는다. */
  test("버튼을 누르기 전에는 모델을 받지 않는다", async ({ page }) => {
    test.setTimeout(600_000);
    const heavy: string[] = [];
    page.on("request", (request) => {
      const url = request.url();
      if (MODEL_HOST.test(url) || ENGINE_HOST.test(url)) heavy.push(url);
    });

    await page.locator('input[type="file"]').setInputFiles(SPEECH);
    await page.waitForTimeout(1_000);
    expect(heavy).toEqual([]);

    await run(page);
    expect(heavy.some((url) => ENGINE_HOST.test(url))).toBe(true);
    expect(heavy.some((url) => MODEL_HOST.test(url))).toBe(true);
  });

  /**
   * 결과 파일을 실제로 읽어 본다. 화면에 글자가 떴다는 것은 아무것도 증명하지 않는다 —
   * 자막은 **시간이 맞아야** 자막이다.
   */
  test("말한 내용이 실제로 적히고 SRT 가 온전하다", async ({ page }) => {
    test.setTimeout(600_000);
    await page.locator('input[type="file"]').setInputFiles(SPEECH);
    await page.getByLabel("말하는 언어").selectOption("en");
    await run(page);

    const srt = await page.evaluate(async () => {
      const anchor = document.querySelector<HTMLAnchorElement>('a[download$=".srt"]')!;
      return { name: anchor.download, text: await (await fetch(anchor.href)).text() };
    });

    expect(srt.name).toBe("speech.srt");
    // 케네디 연설의 첫 문장이 실제로 들어 있어야 한다
    expect(srt.text.toLowerCase()).toContain("fellow americans");
    // 자막 파일의 뼈대: 번호 → 시간 → 글
    expect(srt.text).toMatch(/^1\n00:00:\d\d,\d\d\d --> 00:00:\d\d,\d\d\d\n/);

    // 시간이 6초짜리 음성 안에 들어와야 한다
    const stamps = [...srt.text.matchAll(/(\d\d):(\d\d):(\d\d),(\d\d\d)/g)].map(
      (m) => Number(m[1]) * 3600 + Number(m[2]) * 60 + Number(m[3]) + Number(m[4]) / 1000,
    );
    expect(stamps.length).toBeGreaterThan(0);
    expect(Math.max(...stamps)).toBeLessThanOrEqual(7);
  });

  /**
   * MP3 도 읽는다.
   *
   * **붙이자마자 한 번 놓쳤다(2026-07-27).** `decodeAudio()` 에 MP3 를 붙이고 화면에도
   * 적었는데, 전사 경로가 `decodeAudio()` 를 부르지 않고 자체 디코드 호출을 갖고 있어
   * **스템 분리에서는 열리고 여기서는 거부됐다.** 같은 판단이 두 곳에 있으면 한 곳만
   * 고쳐진다. 이 검사가 그 자리를 지킨다.
   */
  test("MP3 도 읽는다 — 컨테이너가 없는 형식이다", async ({ page }) => {
    test.setTimeout(600_000);
    await page.locator('input[type="file"]').setInputFiles(SPEECH_MP3);
    await page.getByLabel("말하는 언어").selectOption("en");
    await run(page);

    const srt = await page.evaluate(async () => {
      const anchor = document.querySelector<HTMLAnchorElement>('a[download$=".srt"]')!;
      return { name: anchor.download, text: await (await fetch(anchor.href)).text() };
    });
    expect(srt.name).toBe("speech.srt");
    // 1908년 축음기 녹음이라 낱말은 흔들린다. 연설에 분명히 있는 낱말 하나만 본다.
    expect(srt.text.toLowerCase()).toContain("south");
    expect(srt.text).toMatch(/^1\n00:00:\d\d,\d\d\d --> 00:00:\d\d,\d\d\d\n/);
    // 12초짜리 파일이다 — 프레임 시각을 잘못 매기면 여기서 걸린다
    const stamps = [...srt.text.matchAll(/(\d\d):(\d\d):(\d\d),(\d\d\d)/g)].map(
      (m) => Number(m[1]) * 3600 + Number(m[2]) * 60 + Number(m[3]) + Number(m[4]) / 1000,
    );
    expect(Math.max(...stamps)).toBeLessThanOrEqual(14);
  });

  test("소리가 없는 영상에는 없다고 말한다", async ({ page }) => {
    test.setTimeout(600_000);
    await page.locator('input[type="file"]').setInputFiles(SILENT);
    await page.getByRole("button", { name: "자막 만들기" }).click();
    await expect(page.getByText("이 파일에는 소리가 없습니다")).toBeVisible({ timeout: 120_000 });
  });

  test("어느 실행기로 돌았는지 적는다", async ({ page }, testInfo) => {
    test.setTimeout(600_000);
    await page.locator('input[type="file"]').setInputFiles(SPEECH);
    await run(page);
    await expect(page.locator("[data-summary]")).toContainText(
      testInfo.project.name === "chromium-webgpu" ? "GPU 로 처리" : /GPU 로 처리|CPU 로 처리/,
    );
  });

  test("파일이 네트워크로 나가지 않는다", async ({ page }) => {
    test.setTimeout(600_000);
    const outbound: string[] = [];
    page.on("request", (request) => {
      const method = request.method();
      if (method === "POST" || method === "PUT") outbound.push(request.url());
    });
    await page.locator('input[type="file"]').setInputFiles(SPEECH);
    await run(page);
    expect(outbound.filter((url) => !isAnalytics(url))).toEqual([]);
  });
});

/* 모델·엔진 선택을 코드에 못 박는다 — 앞선 세 도구와 같은 이유다. */
test("Whisper 와 transformers.js 만 쓴다", () => {
  const source = readFileSync(
    path.join(__dirname, "..", "lib", "subtitles", "subtitle-core.ts"),
    "utf8",
  );
  const code = source.replace(/\/\*[\s\S]*?\*\//g, "");
  expect(code).toContain("onnx-community/whisper-tiny");
  expect(code).toContain("@huggingface/transformers");
  // fp16·q8 은 실측에서 조용히 망가졌다. 되돌아가지 못하게 막는다.
  expect(code).not.toMatch(/dtype:\s*"(fp16|q8|q4)"/);
});
