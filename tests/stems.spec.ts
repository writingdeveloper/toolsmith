import { readFileSync } from "node:fs";
import path from "node:path";
import { expect, test, type Page } from "@playwright/test";
import { MAX_SECONDS, planSegments, toStereo44k } from "../lib/stems/stems-core";
import { isAnalytics } from "./net";

/** 1961년 케네디 취임 연설 앞 6초(퍼블릭 도메인), 16kHz 모노. */
const SPEECH = path.join(__dirname, "fixtures", "speech.wav");
/** 1918년 재즈 밴드 녹음 앞 6초(퍼블릭 도메인). **진짜 인코더가 낸 MP3** 다. */
const MUSIC = path.join(__dirname, "fixtures", "music.mp3");
/** 소리가 없는 영상 — "소리가 없다" 를 제대로 말하는지 본다. */
const SILENT = path.join(__dirname, "fixtures", "silent.mp4");

const MODEL_HOST = /huggingface\.co|hf\.co|cdn-lfs/;
const ENGINE_HOST = /cdn\.jsdelivr\.net\/npm\/onnxruntime-web/;

async function run(page: Page) {
  await page.getByRole("button", { name: "스템으로 나누기" }).click();
  await expect(page.locator("[data-summary]")).toBeVisible({ timeout: 900_000 });
}

/* ── 브라우저 없이 도는 검사 ─────────────────────────────────────
 * 소리를 다듬는 것은 순수 계산이다. 여기가 틀리면 모델에 들어가는 것부터 틀린다. */

test("모노 16kHz 를 스테레오 44.1kHz 로 맞춘다", () => {
  // 모노는 양쪽에 같은 소리가 들어가야 한다 — 한쪽만 채우면 스테레오가 아니다
  const mono = new Float32Array(16_000).fill(0.5);
  const out = toStereo44k([mono], 16_000);
  expect(out).toHaveLength(2);
  expect(out[0].length).toBe(44_100);
  expect(out[1].length).toBe(44_100);
  expect(out[0][1000]).toBeCloseTo(0.5, 3);
  expect(out[1][1000]).toBeCloseTo(0.5, 3);

  // 이미 44.1kHz 스테레오면 그대로 둔다
  const left = new Float32Array(44_100).fill(0.2);
  const right = new Float32Array(44_100).fill(-0.2);
  const same = toStereo44k([left, right], 44_100);
  expect(same[0][10]).toBeCloseTo(0.2, 5);
  expect(same[1][10]).toBeCloseTo(-0.2, 5);
});

test("48kHz 를 내릴 때 건너뛰지 않고 평균 낸다", () => {
  /*
   * 한 표본만 튀는 신호를 넣는다. 건너뛰며 뽑으면 그 표본이 통째로 사라지거나
   * 그대로 남는다. 평균을 내면 값이 옅어진 채로 **남아 있어야** 한다.
   */
  const spike = new Float32Array(48_000);
  spike[24_000] = 1;
  const out = toStereo44k([spike], 48_000);
  const around = out[0].slice(21_000, 23_500);
  const peak = Math.max(...around);
  expect(peak).toBeGreaterThan(0);
  expect(peak).toBeLessThan(1);
});

test("조각은 겹치고 마지막은 끝을 넘지 않는다", () => {
  const SEGMENT = Math.round(44_100 * 7.8);

  // 한 조각보다 짧으면 하나뿐이다
  expect(planSegments(SEGMENT - 1)).toEqual([0]);

  const starts = planSegments(44_100 * 30);
  expect(starts[0]).toBe(0);
  // 겹쳐야 한다 — 간격이 조각 길이보다 짧다
  expect(starts[1]).toBeLessThan(SEGMENT);
  // 마지막 조각이 끝을 넘으면 소리가 잘린다
  expect(starts[starts.length - 1] + SEGMENT).toBe(44_100 * 30);
});

test.describe("브라우저", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/ko/tools/stems");
  });

  test("받을 용량과 걸릴 시간을 누르기 전에 말한다", async ({ page }) => {
    await expect(page.locator("[data-notes]")).toContainText("295 MB");
    // 느리다는 것을 미리 말한다 — 이 도구가 미리듣기인 이유다
    await expect(page.locator("[data-slow-note]")).toContainText("미리듣기");
    await expect(page.locator("[data-slow-note]")).toContainText(`${MAX_SECONDS}초`);
  });

  /** 규칙 2 — 누르기 전에는 엔진도 모델도 받지 않는다. */
  test("버튼을 누르기 전에는 모델을 받지 않는다", async ({ page }) => {
    test.setTimeout(900_000);
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
   * 결과 WAV 를 실제로 디코드해서 본다. 네 칸이 떴다는 것은 아무것도 증명하지 않는다 —
   * **스템마다 소리가 달라야** 나뉜 것이다.
   */
  test("네 갈래가 나오고 서로 다른 소리다", async ({ page }) => {
    test.setTimeout(900_000);
    await page.locator('input[type="file"]').setInputFiles(SPEECH);
    await run(page);

    await expect(page.locator("[data-stems] li")).toHaveCount(4);

    const stems = await page.evaluate(async () => {
      const out: Array<{ name: string; magic: string; rate: number; channels: number; rms: number }> =
        [];
      for (const anchor of document.querySelectorAll<HTMLAnchorElement>('a[download$=".wav"]')) {
        const buffer = await (await fetch(anchor.href)).arrayBuffer();
        const view = new DataView(buffer);
        const tag = (at: number) =>
          String.fromCharCode(view.getUint8(at), view.getUint8(at + 1), view.getUint8(at + 2), view.getUint8(at + 3));
        // 16비트 PCM 을 직접 읽어 세기를 잰다
        let sum = 0;
        const samples = (buffer.byteLength - 44) / 2;
        for (let i = 0; i < samples; i += 1) {
          const v = view.getInt16(44 + i * 2, true) / 32768;
          sum += v * v;
        }
        out.push({
          name: anchor.download,
          magic: tag(0) + tag(8),
          channels: view.getUint16(22, true),
          rate: view.getUint32(24, true),
          rms: Math.sqrt(sum / samples),
        });
      }
      return out;
    });

    expect(stems).toHaveLength(4);
    for (const stem of stems) {
      // 매직바이트와 형식을 본다 — "wav" 라는 이름이 붙었다는 것과 WAV 인 것은 다르다
      expect(stem.magic).toBe("RIFFWAVE");
      expect(stem.channels).toBe(2);
      expect(stem.rate).toBe(44_100);
    }
    expect(stems.map((s) => s.name.replace(/^.*-/, ""))).toEqual([
      "drums.wav",
      "bass.wav",
      "other.wav",
      "vocals.wav",
    ]);

    /*
     * 말소리만 든 파일이므로 **보컬이 가장 커야 한다.** 네 갈래가 다 똑같이 나오면
     * 나뉘지 않은 것이고, 전부 0 이면 아무것도 안 한 것이다.
     */
    const byName = Object.fromEntries(stems.map((s) => [s.name.replace(/^.*-/, ""), s.rms]));
    expect(byName["vocals.wav"]).toBeGreaterThan(0.001);
    expect(byName["vocals.wav"]).toBeGreaterThan(byName["bass.wav"]);
    expect(byName["vocals.wav"]).toBeGreaterThan(byName["other.wav"]);
  });

  /**
 * MP3 를 받는다.
 *
 * 오랫동안 받지 않았고, FAQ 는 그 이유를 "읽으려면 코드를 더 받아야 하기 때문" 이라고
 * 적어 두었다. **그것은 사실이 아니었다(2026-07-27 실측)** — 브라우저의 `AudioDecoder`
 * 는 워커 안에서도 `mp3` 를 지원한다. 없던 것은 우리 쪽 프레임 파서였다.
 * 근거와 실측표는 `lib/video/mp3-source.ts` 에 있다.
 */
test("MP3 도 나눈다 — 가장 흔한 형식이다", async ({ page }) => {
  test.setTimeout(900_000);
  await page.goto("/ko/tools/stems");
  await page.locator('input[type="file"]').setInputFiles(MUSIC);
  await run(page);

  await expect(page.locator("[data-stems] li")).toHaveCount(4);
  const stems = await page.evaluate(async () => {
    const out: Array<{ name: string; rate: number; rms: number }> = [];
    for (const anchor of document.querySelectorAll<HTMLAnchorElement>('a[download$=".wav"]')) {
      const buffer = await (await fetch(anchor.href)).arrayBuffer();
      const view = new DataView(buffer);
      let sum = 0;
      const samples = (buffer.byteLength - 44) / 2;
      for (let i = 0; i < samples; i += 1) {
        const v = view.getInt16(44 + i * 2, true) / 32768;
        sum += v * v;
      }
      out.push({ name: anchor.download, rate: view.getUint32(24, true), rms: Math.sqrt(sum / samples) });
    }
    return out;
  });

  expect(stems).toHaveLength(4);
  for (const stem of stems) expect(stem.rate).toBe(44_100);
  // 소리가 실제로 들어 있어야 한다 — 전부 0 이면 디코드가 조용히 실패한 것이다
  expect(Math.max(...stems.map((s) => s.rms))).toBeGreaterThan(0.01);
});

  test("소리가 없는 영상에는 없다고 말한다", async ({ page }) => {
    test.setTimeout(300_000);
    await page.locator('input[type="file"]').setInputFiles(SILENT);
    await page.getByRole("button", { name: "스템으로 나누기" }).click();
    await expect(page.getByText("이 파일에는 소리가 없습니다")).toBeVisible({ timeout: 120_000 });
  });

  test("파일이 네트워크로 나가지 않는다", async ({ page }) => {
    test.setTimeout(900_000);
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

/* 모델 선택을 코드에 못 박는다 — 앞선 다섯 도구와 같은 이유다. */
test("Demucs 만 쓰고, 계약이 적힌 내보내기를 쓴다", () => {
  const source = readFileSync(path.join(__dirname, "..", "lib", "stems", "stems-core.ts"), "utf8");
  const code = source.replace(/\/\*[\s\S]*?\*\//g, "");

  /*
   * **`smank/htdemucs-onnx` 여야 한다.** 이 내보내기만 STFT·iSTFT 를 그래프 안에 갖고
   * 있고 계약이 문서로 적혀 있다. 다른 내보내기는 스펙트로그램을 우리가 만들어 넣어야
   * 해서, 틀리면 소리가 **그럴듯하게** 틀린다.
   */
  expect(code).toContain("smank/htdemucs-onnx");
  // 라이선스가 비상업이거나 불명확한 것들로 돌아가지 못하게 막는다
  expect(code).not.toContain("open-unmix");
  expect(code).not.toContain("spleeter");
  // 실측하고 확인한 경로는 CPU 뿐이다
  expect(code).toContain('executionProviders: ["wasm"]');
});
