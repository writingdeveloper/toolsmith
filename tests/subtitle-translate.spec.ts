import { readFileSync } from "node:fs";
import path from "node:path";
import { expect, test, type Page } from "@playwright/test";
import { estimateSeconds, parseSubtitles } from "../lib/translate/translate-core";
import { isAnalytics } from "./net";

/** 6줄짜리 SRT. 끝의 두 줄은 같은 글이다 — 같은 글을 한 번만 부르는지 여기서 본다. */
const SAMPLE = path.join(__dirname, "fixtures", "sample.srt");

const MODEL_HOST = /huggingface\.co|hf\.co|cdn-lfs/;
const ENGINE_HOST = /cdn\.jsdelivr\.net\/npm\/@huggingface\/transformers/;

async function run(page: Page) {
  await page.getByRole("button", { name: "번역하기" }).click();
  await expect(page.locator("[data-summary]")).toBeVisible({ timeout: 600_000 });
}

/* ── 브라우저 없이 도는 검사 ─────────────────────────────────────
 * 자막 파일을 읽는 것은 순수 계산이다. 여기가 틀리면 무엇을 번역할지부터 틀린다. */

test("SRT 와 VTT 를 같은 규칙으로 읽는다", () => {
  const srt = parseSubtitles(
    "1\n00:00:01,000 --> 00:00:03,500\n첫 줄\n\n2\n00:00:03,500 --> 00:00:06,000\n둘째 줄\n두 번째 행\n",
  );
  expect(srt).toEqual([
    { start: 1, end: 3.5, text: "첫 줄" },
    // 여러 행짜리 자막은 한 줄로 합쳐 번역한다 — 반쪽 문장을 따로 넘기면 더 나빠진다
    { start: 3.5, end: 6, text: "둘째 줄 두 번째 행" },
  ]);

  const vtt = parseSubtitles(
    "WEBVTT\n\nNOTE 여기는 주석\n\ncue-1\n00:00:01.000 --> 00:00:03.500 align:start position:10%\n첫 줄\n",
  );
  // 머리글·주석·큐 이름·배치 설정은 모두 버린다
  expect(vtt).toEqual([{ start: 1, end: 3.5, text: "첫 줄" }]);
});

test("시간 칸이 없는 자막도 읽는다", () => {
  // `MM:SS,mmm` 은 실제 파일에 흔하다
  expect(parseSubtitles("1\n01:02,000 --> 01:04,500\n말\n")).toEqual([
    { start: 62, end: 64.5, text: "말" },
  ]);
  // 자막이 아닌 파일에서는 아무것도 읽히지 않아야 한다 — 조용히 성공하면 안 된다
  expect(parseSubtitles("그냥 글입니다.\n두 번째 줄.\n")).toEqual([]);
});

test("걸릴 시간은 같은 글을 빼고 센다", () => {
  const cues = parseSubtitles(readFileSync(SAMPLE, "utf8"));
  expect(cues).toHaveLength(6);
  // 마지막 두 줄이 같으므로 실제로 부르는 것은 다섯 번이다
  expect(estimateSeconds(cues)).toBeCloseTo(5 * 1.5, 5);
});

test.describe("브라우저", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/ko/tools/subtitle-translate");
  });

  test("받을 용량과 품질 한계를 누르기 전에 말한다", async ({ page }) => {
    await expect(page.locator("[data-notes]")).toContainText("608 MB");
    // 관용구에서 미끄러진다는 것을 미리 말한다 — 이 도구의 정직한 한계다
    await expect(page.locator("[data-quality-note]")).toContainText("관용구");
  });

  test("줄 수와 걸릴 시간을 파일을 넣자마자 말한다", async ({ page }) => {
    await page.locator('input[type="file"]').setInputFiles(SAMPLE);
    await expect(page.locator("[data-loaded]")).toContainText("6줄");
    // 5줄 × 1.5초 = 7.5초 → "8초"
    await expect(page.locator("[data-loaded]")).toContainText("8초");
  });

  /** 규칙 2 — 누르기 전에는 엔진도 모델도 받지 않는다. */
  test("버튼을 누르기 전에는 모델을 받지 않는다", async ({ page }) => {
    test.setTimeout(600_000);
    const heavy: string[] = [];
    page.on("request", (request) => {
      const url = request.url();
      if (MODEL_HOST.test(url) || ENGINE_HOST.test(url)) heavy.push(url);
    });

    await page.locator('input[type="file"]').setInputFiles(SAMPLE);
    await page.waitForTimeout(1_000);
    expect(heavy).toEqual([]);

    await run(page);
    expect(heavy.some((url) => ENGINE_HOST.test(url))).toBe(true);
    expect(heavy.some((url) => MODEL_HOST.test(url))).toBe(true);
  });

  /**
   * 결과 파일을 실제로 읽어 본다. 화면에 글자가 떴다는 것은 아무것도 증명하지 않는다 —
   * 번역 자막은 **글이 바뀌고 시간이 그대로여야** 쓸모가 있다.
   *
   * 확인할 것 넷(번역·시간·중복 제거·파일 유출)을 **한 검사에 모았다.** 이 도구는
   * 컨텍스트마다 632MB 를 새로 받으므로 검사를 나누는 값이 너무 비싸다.
   */
  test("글은 한국어가 되고, 시간과 중복은 그대로다", async ({ page }) => {
    test.setTimeout(600_000);
    const outbound: string[] = [];
    page.on("request", (request) => {
      const method = request.method();
      if (method === "POST" || method === "PUT") outbound.push(request.url());
    });

    await page.locator('input[type="file"]').setInputFiles(SAMPLE);
    await page.getByLabel("원문 언어").selectOption("en");
    await page.getByLabel("번역할 언어").selectOption("ko");
    await run(page);

    const srt = await page.evaluate(async () => {
      const anchor = document.querySelector<HTMLAnchorElement>('a[download$=".srt"]')!;
      return { name: anchor.download, text: await (await fetch(anchor.href)).text() };
    });

    expect(srt.name).toBe("sample.ko.srt");
    // 한글이 실제로 들어 있어야 한다
    expect(srt.text).toMatch(/[가-힣]/);
    // 영어 원문이 그대로 남아 있으면 번역이 안 된 것이다
    expect(srt.text).not.toContain("Good morning everyone");

    // **시간은 한 자리도 바뀌지 않는다** — 이 도구가 지키는 유일한 불변식이다
    const stamps = [...srt.text.matchAll(/(\d\d:\d\d:\d\d,\d\d\d) --> (\d\d:\d\d:\d\d,\d\d\d)/g)];
    expect(stamps).toHaveLength(6);
    expect(stamps[0][1]).toBe("00:00:01,000");
    expect(stamps[3][1]).toBe("00:01:02,000");
    expect(stamps[5][2]).toBe("00:01:09,000");

    // 6줄이지만 마지막 둘이 같으므로 다섯 번만 부른다
    await expect(page.locator("[data-summary]")).toContainText("5줄 번역");
    const cues = await page.locator("[data-cues] li").allInnerTexts();
    expect(cues).toHaveLength(6);
    // 같은 원문은 같은 번역을 받아야 한다
    expect(cues[4].replace(/^\S+\s/, "")).toBe(cues[5].replace(/^\S+\s/, ""));

    // 파일은 어디로도 나가지 않는다
    expect(outbound.filter((url) => !isAnalytics(url))).toEqual([]);
  });

  test("자막이 아닌 파일에는 못 읽었다고 말한다", async ({ page }) => {
    await page
      .locator('input[type="file"]')
      .setInputFiles({ name: "notes.srt", mimeType: "text/plain", buffer: Buffer.from("그냥 글") });
    await expect(page.getByText("이 파일에서 자막을 읽지 못했습니다")).toBeVisible();
  });
});

/* 모델·엔진 선택을 코드에 못 박는다 — 앞선 네 도구와 같은 이유다. */
test("m2m100 과 transformers.js 3.7.6 만 쓴다", () => {
  const source = readFileSync(
    path.join(__dirname, "..", "lib", "translate", "translate-core.ts"),
    "utf8",
  );
  const code = source.replace(/\/\*[\s\S]*?\*\//g, "");
  // 가중치는 facebook/m2m100_418M(MIT)에서 온 것이다
  expect(code).toContain("Xenova/m2m100_418M");

  /*
   * **버전을 못 박는다.** 4.2.0 에서는 q8 세션이 열리지 않는다
   * (`MatMulNBits ... Missing required scale`). 자막 생성이 4.2.0 을 쓰고 있어서
   * "통일하자" 는 손이 언젠가 반드시 온다 — 그때 이 검사가 막는다.
   */
  expect(code).toContain('TRANSFORMERS_VERSION = "3.7.6"');
  // WebGPU 는 이 모델에서 동작하지 않는다. 되돌아가지 못하게 막는다.
  expect(code).toContain('device: "wasm"');
  expect(code).not.toContain('device: "webgpu"');
});
