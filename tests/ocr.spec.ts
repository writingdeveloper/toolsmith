import path from "node:path";
import { expect, test, type Page } from "@playwright/test";
import { isAnalytics } from "./net";

/** 큰 산세리프 검정 글씨 / 흰 바탕. "TOOLSMITH OCR" + "TEST 12345" 가 적혀 있다. */
const TEXT_PNG = path.join(__dirname, "fixtures", "text.png");
/** 같은 그림만 박힌 A4 한 장. 진짜 글자가 없어 복사할 수 없는 스캔본이다. */
const SCAN_PDF = path.join(__dirname, "fixtures", "scan.pdf");
const BROKEN = path.join(__dirname, "fixtures", "broken.pdf");
/** 4962×4192. OCR 에 넘기기 전에 반드시 줄여야 하는 크기다. */
const BIG_SCAN = path.join(__dirname, "fixtures", "big-scan.jpg");

/*
 * 엔진 wasm 3.4MB + 언어 데이터를 남의 CDN 에서 받고 나서야 글자를 읽기 시작한다.
 * 그 다음 인식 자체도 단일 스레드다(COOP/COEP 를 켜지 않으므로) — 넉넉히 준다.
 */
const OCR_TIMEOUT = 180_000;

async function open(page: Page, file: string) {
  await page.locator('input[type="file"]').setInputFiles(file);
  await expect(page.getByRole("button", { name: "글자 읽기" })).toBeVisible({ timeout: 30_000 });
}

/**
 * 문서에 쓰인 언어를 고른다.
 *
 * 기본값은 보고 있는 언어판(=/ko 이면 한국어)이다. 픽스처의 글자는 라틴 문자이므로
 * 영어로 바꿔야 한다 — 한국어 모델로 라틴 문자를 읽으면 `12345` 는 맞히지만 낱말은
 * 뭉갠다(실측). 이것은 결함이 아니라 이 도구가 언어 선택을 앞에 내놓는 이유다.
 */
async function useLanguage(page: Page, label: string) {
  await page.getByLabel("문서에 쓰인 언어").selectOption({ label });
}

async function read(page: Page) {
  await page.getByRole("button", { name: "글자 읽기" }).click();
  await expect(page.getByLabel("인식된 글자")).toBeVisible({ timeout: OCR_TIMEOUT });
}

/** 화면의 문구가 아니라 **인식된 글자 그 자체**를 가져온다. */
async function recognised(page: Page): Promise<string> {
  return page.getByLabel("인식된 글자").inputValue();
}

test.beforeEach(async ({ page }) => {
  await page.goto("/ko/tools/ocr");
});

/**
 * 이 도구의 유일한 주장 — 그림 속 글자를 실제로 읽는다.
 *
 * 숫자를 함께 확인하는 이유가 있다. 낱말만 맞히면 사전 보정으로도 그럴듯해지지만
 * `12345` 는 사전이 도와줄 수 없다. 그림을 정말 읽었을 때만 나온다.
 */
test("그림 속 글자를 실제로 읽어 낸다", async ({ page }) => {
  await open(page, TEXT_PNG);
  await useLanguage(page, "영어");
  await read(page);

  const text = await recognised(page);
  expect(text.toUpperCase()).toContain("TOOLSMITH");
  expect(text.toUpperCase()).toContain("OCR");
  expect(text).toContain("12345");
});

test("읽어 낸 글자를 .txt 로 그대로 내려받을 수 있다", async ({ page }) => {
  await open(page, TEXT_PNG);
  await useLanguage(page, "영어");
  await read(page);

  const text = await recognised(page);
  const file = await page.evaluate(async () => {
    const anchor = document.querySelector<HTMLAnchorElement>("a[download]")!;
    const blob = await (await fetch(anchor.href)).blob();
    return { name: anchor.download, type: blob.type, body: await blob.text() };
  });

  expect(file.name).toBe("text.txt");
  expect(file.type).toContain("text/plain");
  // 화면에 보이는 것과 파일 안의 것이 같아야 한다
  expect(file.body).toBe(text);
});

/**
 * 스캔본 PDF 는 페이지를 그림으로 먼저 그린 뒤 읽는다.
 * 이 픽스처에는 **진짜 글자가 없으므로**, 결과가 나왔다면 그림을 읽은 것이다.
 */
/**
 * 큰 그림은 **줄여서** OCR 에 넣는다.
 *
 * 실물 스캔(1919년 타자기 편지 4962×4192)을 원본 그대로 넣었더니 6,385자가 전부
 * 쓰레기였고, 줄여 넣으면 멀쩡히 읽혔다(2026-07-27). 이 픽스처는 같은 크기지만
 * 깨끗한 합성본이라 **그 결함 자체를 재현하지는 못한다** — 방아쇠가 픽셀 수가 아니라
 * 종이 결이기 때문이다. 여기서 못 박는 것은 **줄여서 넣는 길이 글자를 망가뜨리지
 * 않는다**는 것이다. 정규화를 잘못 건드리면 이 검사가 걸린다.
 */
test("아주 큰 그림도 줄여서 제대로 읽는다", async ({ page }) => {
  test.setTimeout(OCR_TIMEOUT + 120_000);
  await open(page, BIG_SCAN);
  await useLanguage(page, "영어");
  await read(page);
  const text = await recognised(page);
  expect(text).toContain("WAR DEPARTMENT");
  expect(text).toContain("Centralia");
  // 쓰레기가 나오면 길이부터 터진다 — 여섯 줄짜리 그림이 수천 자가 될 이유가 없다
  expect(text.length).toBeLessThan(400);
});

test("스캔본 PDF 도 페이지를 그려서 읽는다", async ({ page }) => {
  await open(page, SCAN_PDF);
  // FAQ 본문에도 "30쪽까지" 가 있다 — 파일 정보 줄만 집는다
  await expect(page.getByText(/^[\d.]+ [KM]B · 30쪽까지$/)).toBeVisible();
  await useLanguage(page, "영어");
  await read(page);

  const text = await recognised(page);
  expect(text.toUpperCase()).toContain("TOOLSMITH");
  expect(text).toContain("12345");
  await expect(page.getByText(/^1쪽 · 확신도 \d+%$/)).toBeVisible();
});

/**
 * 다른 도구와 달리 이건 남의 CDN 에서 몇 MB 를 받아야 시작한다.
 * **누르고 나서 알게 두지 않는다** — 크기와 언어가 눌리기 전에 화면에 있어야 한다.
 */
test("받아야 하는 용량을 누르기 전에 말하고, 언어를 바꾸면 그 숫자도 바뀐다", async ({ page }) => {
  await open(page, TEXT_PNG);

  // 한국어판이므로 한국어 데이터가 기본으로 잡혀 있다
  await expect(page.getByLabel("문서에 쓰인 언어")).toHaveValue("kor");
  const korean = await page.getByText(/엔진과 언어 데이터 약 .+ 를 받습니다/).textContent();

  await page.getByLabel("문서에 쓰인 언어").selectOption("eng");
  const english = await page.getByText(/엔진과 언어 데이터 약 .+ 를 받습니다/).textContent();

  // 영어 데이터(1.98MB)가 한국어(1.11MB)보다 크다 — 고정 문구였다면 여기서 걸린다
  expect(english).not.toBe(korean);
});

test("엔진을 받는 것은 버튼을 누른 뒤다", async ({ page }) => {
  const heavy: string[] = [];
  page.on("request", (request) => {
    if (/tesseract|tessdata|traineddata/.test(request.url())) heavy.push(request.url());
  });

  await open(page, TEXT_PNG);
  await page.waitForLoadState("networkidle");
  // 파일을 넣은 것만으로는 아무것도 받지 않는다
  expect(heavy, `버튼 전에 받은 것: ${heavy.join(" | ")}`).toEqual([]);

  await read(page);
  expect(heavy.length).toBeGreaterThan(0);
});

test("PDF 로 읽을 수 없는 파일은 조용히 통과하지 않는다", async ({ page }) => {
  await open(page, BROKEN);
  await page.getByRole("button", { name: "글자 읽기" }).click();
  await expect(page.getByText("PDF 로 읽을 수 없습니다")).toBeVisible({ timeout: 60_000 });
  await expect(page.getByLabel("인식된 글자")).toHaveCount(0);
});

test("읽는 동안 파일이 네트워크로 나가지 않는다", async ({ page }) => {
  const outbound: string[] = [];
  page.on("request", (request) => {
    const method = request.method();
    // 엔진과 언어 데이터는 **받아 오는** 것이라 GET 이다. 우리 파일이 나가는 것은 없다.
    if ((method === "POST" || method === "PUT") && !isAnalytics(request.url())) {
      outbound.push(request.url());
    }
  });

  await open(page, TEXT_PNG);
  await read(page);

  expect(outbound).toEqual([]);
});

test("페이지를 열기만 해서는 tesseract 도 pdf.js 도 받지 않는다 (프로덕션)", async ({ page }) => {
  test.skip(!process.env.BASE_URL, "BASE_URL 로 배포본을 가리켰을 때만 의미가 있다");

  let bytes = 0;
  page.on("response", async (response) => {
    if (!/\.(js|wasm|mjs)(\?|$)/.test(response.url())) return;
    try {
      bytes += (await response.body()).length;
    } catch {
      /* 무시 */
    }
  });

  await page.goto("/ko/tools/ocr");
  await page.waitForLoadState("networkidle");

  // tesseract.js 래퍼만 해도 수백 KB 다. 첫 화면에 실렸다면 여기서 걸린다.
  expect(bytes).toBeLessThan(700_000);
});
