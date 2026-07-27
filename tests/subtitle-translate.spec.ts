import { readFileSync } from "node:fs";
import path from "node:path";
import { expect, test, type Page } from "@playwright/test";
import {
  MAX_LINES,
  estimateSeconds,
  isCollapsed,
  parseSubtitles,
  readSubtitles,
  tokenBudget,
} from "../lib/translate/translate-core";
import { isAnalytics } from "./net";

const fixture = (name: string) => path.join(__dirname, "fixtures", name);

/** 6줄짜리 SRT. 끝의 두 줄은 같은 글이다 — 같은 글을 한 번만 부르는지 여기서 본다. */
const SAMPLE = fixture("sample.srt");
/*
 * 아래 셋은 **실제 자막 파일을 받아 보고** 만든 것이다(2026-07-26). 무엇을 봤는지는
 * `scripts/make-fixtures.mjs` 에 적혀 있다 — 표시가 섞인 칸, UTF-8 이 아닌 파일,
 * 그리고 1332칸짜리 진짜 영화.
 */
const MARKUP = fixture("markup.vtt");
const LEGACY_1252 = fixture("legacy-1252.srt");
const LEGACY_EUCKR = fixture("legacy-euckr.srt");

/** 파일 바이트를 브라우저가 주는 것과 같은 모양으로 만든다. */
function bytesOf(file: string): ArrayBuffer {
  const buffer = readFileSync(file);
  return buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength);
}

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

/*
 * 아래 셋은 **합성 픽스처가 못 잡아낸 것들**이다. 손으로 쓴 6줄짜리 SRT 로는 세상의
 * 자막이 어떻게 생겼는지 알 수 없었고, 공개 자막 11개를 받아 물려 보고서야 드러났다.
 */

test("본문에 섞인 표시를 걷어낸다", () => {
  // 실파일에서 본 것: <i> <b> <br> <v 화자> {\an8} <타임스탬프>
  const { cues, stripped, encoding } = readSubtitles(bytesOf(MARKUP), "en");
  expect(encoding).toBe("utf-8");
  expect(cues.map((cue) => cue.text)).toEqual([
    "You… I mean, we.",
    // <br> 은 줄바꿈이므로 공백이 되어야 한다 — 지우면 "–Why?–Now!" 가 된다
    "–Why? –Now!",
    "Pulp, Emo!",
    "Everything is safe.",
  ]);
  expect(stripped).toBe(4);
  // 표시밖에 없던 칸(`<i></i>`)은 번역할 것이 없으므로 남지 않는다
  expect(cues).toHaveLength(4);

  // 진짜 글까지 먹으면 안 된다 — 부등호는 태그가 아니다
  expect(parseSubtitles("1\n00:00:01,000 --> 00:00:02,000\na < b 이고 c > d\n")[0].text).toBe(
    "a < b 이고 c > d",
  );
});

test("UTF-8 이 아닌 파일을 조용히 깨뜨리지 않는다", () => {
  // 실측: pysrt 테스트 코퍼스의 실제 영화 자막이 windows-1252 다
  const fr = readSubtitles(bytesOf(LEGACY_1252), "en");
  expect(fr.encoding).toBe("windows-1252");
  expect(fr.cues[1].text).toBe("Un café, s'il vous plaît.");

  // 한국어 자막은 CP949 인 경우가 아주 많다
  const ko = readSubtitles(bytesOf(LEGACY_EUCKR), "ko");
  expect(ko.encoding).toBe("euc-kr");
  expect(ko.cues[0].text).toBe("안녕하세요, 여러분.");

  // 원문 언어를 잘못 고르면 글자가 깨진다. **그래서 화면이 인코딩과 첫 줄을 보여 준다** —
  // 우리가 맞힐 수 없는 것을 맞힌 척하지 않는다.
  const wrong = readSubtitles(bytesOf(LEGACY_EUCKR), "en");
  expect(wrong.encoding).toBe("windows-1252");
  expect(wrong.cues[0].text).not.toBe("안녕하세요, 여러분.");

  // UTF-8 파일은 건드리지 않는다
  expect(readSubtitles(bytesOf(SAMPLE), "ko").encoding).toBe("utf-8");
});

test("무너진 결과를 알아본다", () => {
  // 실측에서 나온 것 — "No! Emo! It's a trap!" 이 이렇게 나왔다
  expect(isCollapsed("ᄏᄏᄏᄏᄏᄏᄏᄏᄏᄏᄏᄏᄏᄏᄏᄏᄏᄏᄏᄏᄏᄏᄏᄏ")).toBe(true);
  // 공백만 110자 나오는 경우도 있었다
  expect(isCollapsed("          ")).toBe(true);
  expect(isCollapsed("")).toBe(true);
  // 길이는 긴데 서로 다른 글자가 거의 없다
  expect(isCollapsed("가 나 가 나 가 나 가 나 가 나 가 나 가")).toBe(true);

  // 멀쩡한 줄을 무너졌다고 하면 안 된다
  expect(isCollapsed("모든 것이 안전합니다... 완벽하게 안전합니다.")).toBe(false);
  expect(isCollapsed("나를 따르라!")).toBe(false);
  expect(isCollapsed("...")).toBe(false);
  // 반복이 좀 있어도 사람이 읽을 수 있으면 살린다
  expect(isCollapsed("똑같은, 똑같은, 똑같은, 똑같은...")).toBe(false);
});

test("줄 길이를 원문에 맞춰 묶는다", () => {
  /*
   * 묶지 않으면 무너진 줄 하나가 21.9초를 먹는다(실측). 묶으면 2.4초다.
   * 멀쩡한 줄은 이 상한에 닿지 않으므로 결과가 달라지지 않는다.
   */
  expect(tokenBudget("Follow me!")).toBe(24);
  expect(tokenBudget("No! Emo! It’s a trap!")).toBe(37);
  // 아주 긴 줄이라도 상한을 넘지 않는다
  expect(tokenBudget("word ".repeat(200))).toBe(256);
});

test("상한은 실제 장편 영화보다 위에 있다", () => {
  // 실측한 진짜 영화 자막이 1332칸이었다. 상한이 그 아래면 영화를 거부하는 도구가 된다.
  expect(MAX_LINES).toBeGreaterThan(1_332);
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

  test("표시를 걷어냈으면 걷어냈다고 말한다", async ({ page }) => {
    await page.locator('input[type="file"]').setInputFiles(MARKUP);
    await expect(page.locator("[data-loaded]")).toContainText("4줄");
    await expect(page.locator("[data-stripped]")).toContainText("4줄");
  });

  /**
   * 인코딩은 **원문 언어를 바꾸면 다시 판정한다.** 화면이 첫 줄을 보여 주므로
   * 사람이 눈으로 맞출 수 있다 — 이 검사는 그 왕복이 실제로 도는지를 본다.
   */
  test("UTF-8 이 아닌 파일은 무엇으로 읽었는지 말하고 첫 줄을 보여 준다", async ({ page }) => {
    await page.locator('input[type="file"]').setInputFiles(LEGACY_EUCKR);

    // 기본 원문 언어가 영어라 처음에는 잘못 읽힌다 — 그 사실을 숨기지 않는다
    await expect(page.locator("[data-encoding]")).toContainText("WINDOWS-1252");
    await expect(page.locator("[data-preview]")).not.toHaveText("안녕하세요, 여러분.");

    // 원문 언어를 한국어로 고치면 그 자리에서 다시 읽는다
    await page.getByLabel("원문 언어").selectOption("ko");
    await expect(page.locator("[data-encoding]")).toContainText("EUC-KR");
    await expect(page.locator("[data-preview]")).toHaveText("안녕하세요, 여러분.");
  });

  test("UTF-8 파일에는 인코딩 안내를 띄우지 않는다", async ({ page }) => {
    await page.locator('input[type="file"]').setInputFiles(SAMPLE);
    await expect(page.locator("[data-loaded]")).toBeVisible();
    await expect(page.locator("[data-encoding]")).toHaveCount(0);
    await expect(page.locator("[data-stripped]")).toHaveCount(0);
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
