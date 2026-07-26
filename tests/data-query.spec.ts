import path from "node:path";
import { expect, test, type Page } from "@playwright/test";
import { isAnalytics } from "./net";

/** 6행 × 6열. 열마다 타입이 다르고 도시가 겹쳐 GROUP BY 를 손으로 검산할 수 있다. */
const CSV = path.join(__dirname, "fixtures", "sample.csv");
/** 같은 표를 DuckDB 가 Parquet 으로 쓴 것. */
const PARQUET = path.join(__dirname, "fixtures", "sample.parquet");
const BROKEN = path.join(__dirname, "fixtures", "photo.jpg");

/** DuckDB wasm 6.2MB 를 CDN 에서 받고 나서야 첫 결과가 나온다. */
const OPEN_TIMEOUT = 180_000;

async function open(page: Page, file: string) {
  await page.locator('input[type="file"]').setInputFiles(file);
  await page.getByRole("button", { name: "열어서 조회" }).click();
  await expect(page.getByLabel("SQL")).toBeVisible({ timeout: OPEN_TIMEOUT });
}

async function ask(page: Page, sql: string) {
  await page.getByLabel("SQL").fill(sql);
  await page.getByRole("button", { name: "실행", exact: true }).click();
  await expect(page.getByRole("button", { name: "실행", exact: true })).toBeEnabled({
    timeout: 60_000,
  });
}

/** 화면의 문구가 아니라 **표 그 자체**를 읽는다. */
async function grid(page: Page): Promise<{ columns: string[]; rows: string[][] }> {
  return page.evaluate(() => {
    const table = document.querySelector("table")!;
    const columns = [...table.querySelectorAll("thead th")].map((th) => th.textContent ?? "");
    const rows = [...table.querySelectorAll("tbody tr")].map((tr) =>
      [...tr.querySelectorAll("td")].map((td) => td.textContent ?? ""),
    );
    return { columns, rows };
  });
}

test.beforeEach(async ({ page }) => {
  await page.goto("/ko/tools/data-query");
});

test("CSV 를 열면 타입을 알아맞히고 행 수를 센다", async ({ page }) => {
  await open(page, CSV);

  // 결과 요약에도 "6행" 이 나온다 — 파일 정보 줄만 집는다
  await expect(page.getByText(/· 6행 · 6열$/)).toBeVisible();

  // 숫자 열이 문자열로 잡히면 SUM 이 안 된다 — 타입 추론이 실제로 됐는지 본다
  await expect(page.getByText(/^amount DOUBLE$/)).toBeVisible();
  await expect(page.getByText(/^active BOOLEAN$/)).toBeVisible();
  await expect(page.getByText(/^id BIGINT$/)).toBeVisible();

  const table = await grid(page);
  expect(table.columns).toEqual(["id", "name", "city", "amount", "active", "at"]);
  expect(table.rows).toHaveLength(6);
  // Arrow 는 정수를 BigInt 로 준다. 그대로 넘기면 렌더가 던진다 — 문자열로 나와야 한다.
  expect(table.rows[0][0]).toBe("1");
  expect(table.rows[0][1]).toBe("Ada");
});

test("집계 질의가 실제로 맞는 값을 낸다", async ({ page }) => {
  await open(page, CSV);
  await ask(page, "SELECT city, count(*) AS n, sum(amount) AS total FROM data GROUP BY city ORDER BY total DESC");

  const table = await grid(page);
  expect(table.columns).toEqual(["city", "n", "total"]);
  // 손으로 검산한 값 — Seoul 3건 3600, Busan 2건 900, Daegu 1건 50.75
  expect(table.rows).toEqual([
    ["Seoul", "3", "3600"],
    ["Busan", "2", "900"],
    ["Daegu", "1", "50.75"],
  ]);
});

test("Parquet 도 같은 표로 열린다", async ({ page }) => {
  await open(page, PARQUET);
  await ask(page, "SELECT sum(amount) AS total, count(*) AS n FROM data");

  const table = await grid(page);
  // CSV 로 읽었을 때와 같은 값이어야 한다 — 같은 표를 다른 형식으로 담았을 뿐이다
  expect(table.rows[0]).toEqual(["4550.75", "6"]);
});

test("결과를 CSV 로 내려받으면 화면과 같은 내용이다", async ({ page }) => {
  await open(page, CSV);
  await ask(page, "SELECT name, amount FROM data ORDER BY amount DESC LIMIT 2");

  const file = await page.evaluate(async () => {
    const anchor = document.querySelector<HTMLAnchorElement>("a[download]")!;
    return { name: anchor.download, body: await (await fetch(anchor.href)).blob().then((b) => b.text()) };
  });

  expect(file.name).toBe("sample-query.csv");
  expect(file.body).toBe("name,amount\nLinus,1800.25\nAda,1200.5");
});

test("SQL 이 틀리면 DuckDB 가 한 말을 그대로 보여 준다", async ({ page }) => {
  await open(page, CSV);
  await ask(page, "SELECT nope FROM data");

  // 우리가 요약하면 어디가 틀렸는지 알 수 없다 — 원문이 그대로 나와야 한다
  // (SQL 입력칸에도 "nope" 가 있으므로 오류 상자만 본다)
  const message = await page.locator("pre").innerText();
  expect(message).toContain("nope");
  expect(message).toMatch(/Binder Error|Referenced column/i);
});

test("엔진은 버튼을 누른 뒤에 받는다", async ({ page }) => {
  // wasm 과 duckdb 워커만 센다. 얇은 래퍼(JS)는 우리 번들에서 오는 것이 맞다.
  const heavy: string[] = [];
  page.on("request", (request) => {
    if (/duckdb.*\.(wasm|worker\.js)/.test(request.url())) heavy.push(request.url());
  });

  await page.locator('input[type="file"]').setInputFiles(CSV);
  await expect(page.getByRole("button", { name: "열어서 조회" })).toBeVisible();
  await page.waitForLoadState("networkidle");
  expect(heavy, `버튼 전에 받은 것: ${heavy.join(" | ")}`).toEqual([]);

  await page.getByRole("button", { name: "열어서 조회" }).click();
  await expect(page.getByLabel("SQL")).toBeVisible({ timeout: OPEN_TIMEOUT });
  expect(heavy.length).toBeGreaterThan(0);
  // 규칙 4 — SharedArrayBuffer 가 필요한 coi 번들로 가면 안 된다
  expect(heavy.join(" ")).not.toContain("coi");
  // 규칙 5 — 우리 서버에서 나가지 않는다
  expect(heavy.every((url) => url.startsWith("https://cdn.jsdelivr.net/"))).toBe(true);
});

test("데이터가 아닌 파일은 조용히 통과하지 않는다", async ({ page }) => {
  await page.locator('input[type="file"]').setInputFiles(BROKEN);
  await page.getByRole("button", { name: "열어서 조회" }).click();
  await expect(page.getByText("열 수 없는 형식입니다", { exact: false })).toBeVisible({
    timeout: 30_000,
  });
  await expect(page.getByLabel("SQL")).toHaveCount(0);
});

test("조회하는 동안 파일이 네트워크로 나가지 않는다", async ({ page }) => {
  const outbound: string[] = [];
  page.on("request", (request) => {
    const method = request.method();
    if ((method === "POST" || method === "PUT") && !isAnalytics(request.url())) {
      outbound.push(request.url());
    }
  });

  await open(page, CSV);
  await ask(page, "SELECT count(*) FROM data");

  expect(outbound).toEqual([]);
});

test("페이지를 열기만 해서는 DuckDB 를 받지 않는다 (프로덕션)", async ({ page }) => {
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

  await page.goto("/ko/tools/data-query");
  await page.waitForLoadState("networkidle");

  // duckdb-wasm 래퍼만 해도 수백 KB 다. 첫 화면에 실렸다면 여기서 걸린다.
  expect(bytes).toBeLessThan(700_000);
});
