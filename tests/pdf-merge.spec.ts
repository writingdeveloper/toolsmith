import path from "node:path";
import { expect, test, type Page } from "@playwright/test";
import { PDFArray, PDFDocument, PDFRawStream, decodePDFRawStream, type PDFPage } from "pdf-lib";

const FIXTURES = path.join(__dirname, "fixtures");
const A = path.join(FIXTURES, "a.pdf"); // 2쪽: 200x400(A1), 210x410(A2)
const B = path.join(FIXTURES, "b.pdf"); // 1쪽: 300x300(B1)
const BROKEN = path.join(FIXTURES, "broken.pdf");
const ENCRYPTED = path.join(FIXTURES, "encrypted.pdf");

interface MergedPage {
  /** "200x400" — 페이지 크기 수열이 곧 순서의 지문이다 */
  size: string;
  /** 페이지 콘텐츠 스트림에서 뽑은 문자열. 빈 페이지가 아님을 증명한다 */
  text: string;
}

/** pdf-lib 은 텍스트를 `<4131> Tj` 형태의 16진 문자열로 쓴다. */
function textOf(doc: PDFDocument, page: PDFPage): string {
  const contents = page.node.Contents();
  if (!contents) return "";
  const streams =
    contents instanceof PDFArray
      ? contents.asArray().map((ref) => doc.context.lookup(ref))
      : [contents];

  let raw = "";
  for (const stream of streams) {
    if (!(stream instanceof PDFRawStream)) continue;
    raw += new TextDecoder().decode(decodePDFRawStream(stream).decode());
  }

  return [...raw.matchAll(/<([0-9A-Fa-f]+)>\s*Tj/g)]
    .map(([, hex]) => Buffer.from(hex, "hex").toString("latin1"))
    .join("");
}

/**
 * 결과 blob 을 실제로 파싱해서 검사한다. "병합됨" 이라고 떴다는 것은 아무것도 증명하지 않는다.
 * 매직바이트 → 페이지 수 → 각 페이지의 크기와 실제 내용까지 본다.
 */
async function inspectResult(page: Page) {
  const payload = await page.evaluate(async () => {
    const anchor = document.querySelector<HTMLAnchorElement>("a[download]");
    if (!anchor) return null;
    const blob = await (await fetch(anchor.href)).blob();
    return {
      name: anchor.download,
      mime: blob.type,
      bytes: [...new Uint8Array(await blob.arrayBuffer())],
    };
  });

  expect(payload).not.toBeNull();
  const bytes = Buffer.from(payload!.bytes);
  expect(bytes.subarray(0, 5).toString("latin1")).toBe("%PDF-");

  const doc = await PDFDocument.load(bytes);
  const pages: MergedPage[] = doc.getPages().map((p) => ({
    size: `${Math.round(p.getWidth())}x${Math.round(p.getHeight())}`,
    text: textOf(doc, p),
  }));

  return { name: payload!.name, mime: payload!.mime, size: bytes.length, pages };
}

/** @param total 추가 후 목록에 남아야 할 총 개수 */
async function addFiles(page: Page, files: string[], total: number) {
  await page.locator('input[type="file"]').setInputFiles(files);
  // 목록이 먼저 뜬 뒤(전부 "읽는 중"), 검사가 끝날 때까지 기다린다.
  // 이 시점에 pdf-lib 이 내려온다 — 그 전에는 네트워크로 나가지 않는다.
  const list = page.getByRole("list", { name: "병합할 파일" });
  await expect(list.getByRole("listitem")).toHaveCount(total);
  await expect(page.getByText("읽는 중")).toHaveCount(0, { timeout: 30_000 });
}

async function merge(page: Page) {
  await page.getByRole("button", { name: /병합하기$/ }).click();
  await expect(page.locator("a[download]")).toHaveCount(1, { timeout: 60_000 });
}

test.beforeEach(async ({ page }) => {
  await page.goto("/tools/pdf-merge");
});

test("페이지 수·순서·내용이 원본 그대로 보존된다", async ({ page }) => {
  await addFiles(page, [A, B], 2);
  await expect(page.getByText("2페이지", { exact: false }).first()).toBeVisible();

  await merge(page);
  const result = await inspectResult(page);

  expect(result.mime).toBe("application/pdf");
  expect(result.name).toBe("merged.pdf");
  expect(result.pages.map((p) => p.size)).toEqual(["200x400", "210x410", "300x300"]);
  // 페이지 크기만 맞고 내용이 비어 있으면 병합이 아니라 빈 종이를 만든 것이다
  expect(result.pages.map((p) => p.text)).toEqual(["A1", "A2", "B1"]);
});

test("목록 순서를 바꾸면 결과 페이지 순서도 바뀐다", async ({ page }) => {
  await addFiles(page, [A, B], 2);
  await page.getByRole("button", { name: "b.pdf 위로" }).click();
  await merge(page);

  const result = await inspectResult(page);
  expect(result.pages.map((p) => p.text)).toEqual(["B1", "A1", "A2"]);
  expect(result.pages.map((p) => p.size)).toEqual(["300x300", "200x400", "210x410"]);
});

test("암호로 보호된 PDF 는 거부되고 병합에 섞이지 않는다", async ({ page }) => {
  await addFiles(page, [A, ENCRYPTED, B], 3);

  await expect(page.getByText("암호로 보호된 PDF 입니다")).toBeVisible();
  // 병합 대상에서 빠졌으므로 3개가 아니라 2개다
  await expect(page.getByRole("button", { name: "2개 병합하기" })).toBeEnabled();

  await merge(page);
  const result = await inspectResult(page);
  expect(result.pages.map((p) => p.text)).toEqual(["A1", "A2", "B1"]);
});

test("PDF 가 아닌 파일은 조용히 통과하지 않는다", async ({ page }) => {
  await addFiles(page, [BROKEN, A], 2);

  await expect(page.getByText("PDF 로 읽을 수 없습니다")).toBeVisible();
  // 쓸 수 있는 파일이 하나뿐이면 병합할 것이 없다
  await expect(page.getByRole("button", { name: "1개 병합하기" })).toBeDisabled();
  await expect(page.getByText("PDF 가 두 개 이상 필요합니다")).toBeVisible();
});

test("제거한 파일은 결과에서 빠진다", async ({ page }) => {
  await addFiles(page, [A, B], 2);
  await page.getByRole("button", { name: "a.pdf 제거" }).click();
  await expect(page.getByRole("button", { name: "1개 병합하기" })).toBeDisabled();

  await addFiles(page, [A], 2);
  await merge(page);
  const result = await inspectResult(page);
  expect(result.pages.map((p) => p.text)).toEqual(["B1", "A1", "A2"]);
});

test("PDF 를 넣기 전에는 pdf-lib 을 내려받지 않는다", async ({ page }) => {
  const requested: string[] = [];
  page.on("request", (request) => requested.push(request.url()));

  await page.goto("/tools/pdf-merge");
  await page.waitForLoadState("networkidle");
  const before = requested.filter((url) => /pdf-lib/i.test(url));
  expect(before).toEqual([]);

  await addFiles(page, [A], 1);
  // 파일이 들어온 뒤에야 받는다
  expect(requested.filter((url) => /pdf-lib/i.test(url)).length).toBeGreaterThan(0);
});

test("병합 중 파일이 네트워크로 나가지 않는다", async ({ page }) => {
  const outbound: string[] = [];
  page.on("request", (request) => {
    const method = request.method();
    if (method === "POST" || method === "PUT") outbound.push(request.url());
  });

  await addFiles(page, [A, B], 2);
  await merge(page);

  expect(outbound).toEqual([]);
});

test("콘솔 에러 없이 동작한다", async ({ page }) => {
  const errors: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });

  await addFiles(page, [A, B], 2);
  await merge(page);

  expect(errors).toEqual([]);
});
