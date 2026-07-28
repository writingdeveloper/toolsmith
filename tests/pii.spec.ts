import { readFileSync } from "node:fs";
import { expect, test, type Page } from "@playwright/test";
import { getDictionary } from "../lib/i18n";
import { LOCALES } from "../lib/i18n/config";
import { formatBytes, LAB, LAB_LIST } from "../lib/lab";
import { countByKind, locateSpans, redact, toKind } from "../lib/pii/pii-core";

/**
 * Lab 첫 도구 — 글 속 개인정보 찾기.
 *
 * **여기서 가장 중요한 검사는 모델이 아니라 문이다.** 이 층이 존재하는 이유가
 * "누르기 전에 874MB 라고 말하는 것" 이므로, 그 문이 새면 층 자체가 의미를 잃는다.
 */

const GATE = "[data-lab-gate]";

/* ── 브라우저 없이: 자리 찾기 ───────────────────────────────────── */

/**
 * **이 검사가 없어서 도구가 통째로 조용히 죽어 있었다 (2026-07-28).**
 *
 * transformers.js 의 token-classification 은 `start`/`end` 를 주지 않는다 —
 * `{entity_group, score, word}` 뿐이다. 처음엔 위치가 올 것으로 보고 짰고, 스펙은
 * 위치가 든 가짜 입력으로만 검사해서 전부 초록색이었다. 실제 계약서에서는 모델이
 * 26건을 확신도 0.9999 로 맞히는데 화면은 **"찾지 못했습니다"** 라고 말했다.
 *
 * 그래서 이 스펙의 입력은 **실물에서 받아 온 모양 그대로**다.
 */
const REAL_GROUPS = [
  { entity_group: "private_person", score: 0.999998, word: " Margaret Alvarez" },
  { entity_group: "private_phone", score: 0.999902, word: " (503) 555-0142" },
  { entity_group: "private_email", score: 0.999992, word: " m.alvarez@example.net" },
  { entity_group: "private_address", score: 0.998521, word: "4417 Cedar Hollow Road, Portland, Oregon" },
  { entity_group: "private_address", score: 0.994144, word: "97218" },
];

const REAL_TEXT = [
  "Client: Margaret Alvarez",
  "Phone: (503) 555-0142",
  "Email: m.alvarez@example.net",
  "Address: 4417 Cedar Hollow Road, Portland, Oregon 97218",
  "",
].join("\n");

test("위치가 없는 실제 출력에서 자리를 찾아낸다", () => {
  const spans = locateSpans(REAL_TEXT, REAL_GROUPS);
  expect(spans.length).toBeGreaterThan(0);
  // 찾은 자리가 원문과 정확히 맞아야 한다 — 한 글자만 밀려도 가릴 때 엉뚱한 곳이 지워진다
  for (const span of spans) {
    expect(REAL_TEXT.slice(span.start, span.end)).toBe(span.text);
  }
  expect(spans.map((span) => span.text)).toContain("Margaret Alvarez");
  expect(spans.map((span) => span.text)).toContain("m.alvarez@example.net");
});

/**
 * **모델의 딱지를 그대로 쓴다.** `id2label` 을 실제로 읽어 확인한 여덟이다 —
 * 짐작으로 "식별번호·금융정보" 같은 칸을 만들어 두면 잘못 뭉갠다.
 */
test("모델의 딱지를 우리 갈래로 옮긴다", () => {
  expect(toKind("B-private_person")).toBe("name");
  expect(toKind("E-private_address")).toBe("address");
  expect(toKind("S-account_number")).toBe("account");
  expect(toKind("I-secret")).toBe("secret");
  expect(toKind("private_url")).toBe("url");
  // 모르는 딱지는 버리지 않고 남긴다
  expect(toKind("B-something_new")).toBe("other");
});

/**
 * 실측에서 주소 하나가 `"…Portland, Oregon"` 과 `"97218"` 둘로 쪼개져 나왔다.
 * 그대로 두면 "주소 2곳" 이 되고, 가릴 때 우편번호 앞 빈칸이 남는다.
 */
test("빈칸으로만 떨어진 같은 갈래를 하나로 본다", () => {
  const spans = locateSpans(REAL_TEXT, REAL_GROUPS);
  const addresses = spans.filter((span) => span.kind === "address");
  expect(addresses).toHaveLength(1);
  expect(addresses[0].text).toBe("4417 Cedar Hollow Road, Portland, Oregon 97218");
});

test("사이에 글자가 있으면 합치지 않는다", () => {
  const text = "김철수 와 이영희";
  const spans = locateSpans(text, [
    { entity_group: "private_person", score: 0.9, word: "김철수" },
    { entity_group: "private_person", score: 0.9, word: "이영희" },
  ]);
  expect(spans.map((span) => span.text)).toEqual(["김철수", "이영희"]);
});

/**
 * **앞으로만 찾는다.** 뒤로 돌아가면 같은 낱말이 여러 번 나오는 문서에서 앞자리를
 * 다시 가리키고, 그러면 뒤쪽 개인정보가 가려지지 않은 채 남는다.
 */
test("같은 낱말이 두 번 나와도 각자의 자리를 찾는다", () => {
  const text = "담당 김민수 확인. 승인 김민수 완료.";
  const spans = locateSpans(text, [
    { entity_group: "private_person", score: 0.99, word: "김민수" },
    { entity_group: "private_person", score: 0.99, word: "김민수" },
  ]);
  expect(spans).toHaveLength(2);
  expect(spans[0].start).toBeLessThan(spans[1].start);
  expect(redact(text, spans)).toBe("담당 ███ 확인. 승인 ███ 완료.");
});

/**
 * 실측에서 모델이 `Building 7` 의 `7` 을 주소로 집었다. 혼자 있는 한 글자는 가려도
 * 알려 주는 것이 없고 개수만 부풀려 진짜 항목을 묻는다.
 */
test("한 글자짜리 오탐은 버린다", () => {
  const text = "Building 7 at 200 Harbor Street";
  const spans = locateSpans(text, [
    { entity_group: "private_address", score: 0.9, word: "7" },
    { entity_group: "private_address", score: 0.9, word: "200 Harbor Street" },
  ]);
  expect(spans.map((span) => span.text)).toEqual(["200 Harbor Street"]);
});

test("확신하지 못한 것과 개인정보 아님은 버린다", () => {
  const text = "이름은 김민수";
  const spans = locateSpans(text, [
    { entity_group: "O", score: 0.99, word: "이름은" },
    { entity_group: "private_person", score: 0.2, word: "김민수" },
  ]);
  expect(spans).toHaveLength(0);
});

/**
 * **뒤에서부터 바꿔야 한다.** 앞에서부터 가리면 길이가 달라지면서 뒤쪽 좌표가 전부
 * 밀리고, 두 번째 이후의 개인정보가 엉뚱한 자리에서 지워진다.
 */
test("여러 자리를 가려도 좌표가 밀리지 않는다", () => {
  const spans = locateSpans(REAL_TEXT, REAL_GROUPS);
  const out = redact(REAL_TEXT, spans);
  expect(out.length).toBe(REAL_TEXT.length);
  expect(out).not.toContain("Margaret");
  expect(out).not.toContain("m.alvarez@example.net");
  expect(out).not.toContain("97218");
  // 개인정보가 아닌 글자는 그대로 남아야 한다 — 다 가리면 읽을 수가 없다
  expect(out).toContain("Client:");
  expect(out).toContain("Address:");
});

test("갈래별 개수를 센다", () => {
  const counts = countByKind(locateSpans(REAL_TEXT, REAL_GROUPS));
  expect(counts).toEqual([
    { kind: "name", count: 1 },
    { kind: "address", count: 1 },
    { kind: "phone", count: 1 },
    { kind: "email", count: 1 },
  ]);
});

/**
 * **버전이 조용히 바뀌는 것을 막는다.** 자막 번역은 3.7.6, 요약과 이 도구는 4.2.0 이다.
 * "통일하자" 는 손은 언젠가 반드시 오고, 그때 어느 한쪽이 조용히 죽는다.
 */
test("런타임 버전과 모델을 못 박는다", () => {
  const source = readFileSync("lib/pii/pii-core.ts", "utf8");
  expect(source).toContain('const TRANSFORMERS_VERSION = "4.2.0"');
  // Apache-2.0 가중치. "품질이 더 좋다" 며 갈아 끼우는 일을 막는다.
  expect(source).toContain('export const MODEL_ID = "openai/privacy-filter"');
});

/** 화면에 적는 숫자와 레지스트리가 어긋나면 안 된다. */
test("받을 용량을 사람이 읽는 대로 적는다", () => {
  /*
   * **모델만이 아니라 엔진까지 더한 값이다.** 모델 874MB 만 적으면 실제로는 그보다
   * 더 받는다 — 이 층의 약속이 "받을 것을 숫자로 먼저 말한다" 이므로 적게 적으면
   * 안 된다. 880MB 는 그 합이다.
   */
  expect(formatBytes(LAB.pii.bytes)).toBe("880MB");
  expect(formatBytes(874_000_000)).toBe("874MB");
  expect(formatBytes(291_000_000)).toBe("291MB");
});

/* ── 브라우저 ───────────────────────────────────────────────────── */

async function open(page: Page, locale = "ko") {
  const response = await page.goto(`/${locale}/lab/pii`);
  expect(response?.status()).toBe(200);
}

test("문을 지나기 전에는 도구가 없다", async ({ page }) => {
  await open(page);
  await expect(page.locator(GATE)).toBeVisible();
  // 파일을 고르는 자리도, 워커를 만드는 컴포넌트도 아직 없어야 한다
  await expect(page.locator('input[type="file"]')).toHaveCount(0);
});

/**
 * **이 층의 존재 이유가 이 숫자다.** 화면 어딘가에 적혀 있는 정도가 아니라,
 * 누르기 전에 눈에 들어와야 한다.
 */
test("받을 용량을 누르기 전에 숫자로 말한다", async ({ page }) => {
  await open(page);
  await expect(page.locator("[data-lab-bytes]")).toHaveText(formatBytes(LAB.pii.bytes));
  const gate = await page.locator(GATE).innerText({ timeout: 5_000 });
  // 모바일 데이터 경고가 함께 있어야 한다 — 되돌릴 수 없는 실수는 이쪽이다
  expect(gate).toContain(getDictionary("ko").lab.warningBody.slice(0, 12));
});

test("문을 지나야 도구가 나온다", async ({ page }) => {
  await open(page);
  await page.locator("[data-lab-enter]").click();
  await expect(page.locator(GATE)).toHaveCount(0);
  // WebGPU 가 없는 브라우저에서는 도구 대신 못 한다는 안내가 나온다 — 둘 중 하나여야 한다
  await expect(page.locator('input[type="file"], [data-unsupported]').first()).toBeVisible();
});

/**
 * **문을 지나기 전에는 아무것도 받지 않는다.** 규칙 2 를 GB 단위로 옮긴 것이 이 층의
 * 전부이므로, 여는 것만으로 CDN 을 건드리면 층이 무의미해진다.
 */
test("페이지를 열기만 해서는 모델도 엔진도 받지 않는다", async ({ page }) => {
  const outbound: string[] = [];
  page.on("request", (request) => {
    const url = request.url();
    if (/huggingface|jsdelivr|cdn/i.test(url)) outbound.push(url);
  });
  await open(page);
  await page.waitForTimeout(1_500);
  expect(outbound.join("\n")).toBe("");
});

test("목록에도 용량이 먼저 보인다", async ({ page }) => {
  const response = await page.goto("/ko/lab");
  expect(response?.status()).toBe(200);
  const list = await page.locator("[data-lab-list]").innerText({ timeout: 5_000 });
  for (const entry of LAB_LIST) expect(list).toContain(formatBytes(entry.bytes));
});

/**
 * **Lab 은 도구 목록에 끼면 안 된다.** 끼는 순간 홈에서 874MB 짜리를 권하게 되고,
 * "이 사이트의 도구" 라는 약속이 조용히 달라진다.
 */
test("홈과 도구 페이지는 Lab 을 권하지 않는다", async ({ page }) => {
  await page.goto("/ko");
  const home = await page.locator("main").innerText({ timeout: 5_000 });
  expect(home).not.toContain(getDictionary("ko").lab.entries.pii.h1);

  await page.goto("/ko/tools/summarize");
  const links = await page.evaluate(() =>
    [...document.querySelectorAll("main a[href]")].map((a) => a.getAttribute("href") ?? ""),
  );
  expect(links.filter((href) => href.includes("/lab"))).toEqual([]);
});

/** 그래도 닿을 수는 있어야 한다 — 크롤러가 못 찾으면 백링크 층이 아니다. */
test("푸터에서 Lab 으로 닿는다", async ({ page }) => {
  await page.goto("/ko");
  await expect(page.locator('footer a[href="/ko/lab"]')).toBeVisible();
});

test("모든 언어가 제 언어로 열린다", async ({ page }) => {
  for (const locale of LOCALES) {
    await page.goto(`/${locale}/lab/pii`);
    await expect(page.locator("h1")).toHaveText(getDictionary(locale).lab.entries.pii.h1);
  }
});
