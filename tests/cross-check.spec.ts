import { expect, test, type Page } from "@playwright/test";
import { GUIDE_LIST } from "../lib/guides";
import { HTML_LANG, LOCALES } from "../lib/i18n/config";
import { LIVE_TOOLS } from "../lib/tools";

/*
 * 바깥 SEO 검사 도구가 하는 **교차검증**을 우리도 한다.
 *
 * 그런 도구들은 값 하나하나가 있는지가 아니라 **서로 어긋나는지**를 본다:
 * 페이지 주소 ↔ canonical ↔ og:url, canonical ↔ sitemap, hreflang 의 자기 참조와
 * 상호 참조, `<html lang>` ↔ og:locale.
 *
 * **실제로 하나 걸렸다 (2026-07-28).** 루트 `/` 의 canonical 이 `/en` 을 가리키고
 * 있었다. "언어를 안 고른 방문자용이니 스스로를 정본으로 삼지 않는다" 는 생각이었는데,
 * canonical 은 **"이 URL 은 저 URL 의 중복본"** 이라는 뜻이다. 언어 선택 화면과 영어
 * 홈은 내용이 다르므로 거짓말이었고, 도메인 루트를 무시하라고 말하는 셈이었다.
 */

async function metaOf(page: Page) {
  return page.evaluate(() => {
    const pick = (selector: string, attribute = "content") =>
      document.querySelector(selector)?.getAttribute(attribute) ?? null;
    return {
      canonical: pick('link[rel="canonical"]', "href"),
      ogUrl: pick('meta[property="og:url"]'),
      ogTitle: pick('meta[property="og:title"]'),
      ogDescription: pick('meta[property="og:description"]'),
      ogLocale: pick('meta[property="og:locale"]'),
      twitterTitle: pick('meta[name="twitter:title"]'),
      twitterDescription: pick('meta[name="twitter:description"]'),
      description: pick('meta[name="description"]'),
      lang: document.documentElement.lang,
      title: document.title,
      alternates: [...document.querySelectorAll('link[rel="alternate"]')].map((node) => ({
        hreflang: node.getAttribute("hreflang"),
        href: node.getAttribute("href"),
      })),
    };
  });
}

/**
 * 주소를 페이지 기준으로 푼다.
 *
 * 개발 서버에는 본 도메인(`SITE_URL`)이 없어 canonical·hreflang 이 **상대 경로**로
 * 나온다. 그것 자체는 정상이라(배포본에서만 절대 URL 이 된다) 여기서 풀어 준다 —
 * 안 그러면 이 검사가 배포본에서만 돌게 되고, 어긋남을 배포한 뒤에야 알게 된다.
 */
function resolve(value: string, base: string) {
  return new URL(value, base);
}

/** hreflang 표기(`pt-BR`)를 og 표기(`pt_BR`)의 앞부분과 맞추기 위한 정규화. */
function langRoot(value: string) {
  return value.toLowerCase().replace("_", "-").split("-")[0];
}

const SAMPLES = [
  "/",
  "/ko",
  "/en",
  "/ja/tools/pdf-merge",
  "/pt-br/tools/image-convert",
  "/de/guides",
  "/es/guides/mov-vs-mp4",
];

for (const path of SAMPLES) {
  test(`${path} 의 주소·canonical·og:url 이 한 곳을 가리킨다`, async ({ page }) => {
    await page.goto(path);
    const meta = await metaOf(page);

    expect(meta.canonical, "canonical 없음").not.toBeNull();
    // canonical 이 자기가 아닌 곳을 가리키면 "나는 저것의 중복본" 이라는 선언이다
    const here = new URL(page.url());
    expect(resolve(meta.canonical!, here.href).pathname).toBe(here.pathname);
    expect(resolve(meta.ogUrl!, here.href).pathname).toBe(
      resolve(meta.canonical!, here.href).pathname,
    );
  });
}

test("설명은 세 곳이 같은 말을 한다", async ({ page }) => {
  for (const path of SAMPLES) {
    await page.goto(path);
    const meta = await metaOf(page);
    expect(meta.ogDescription, path).toBe(meta.description);
    expect(meta.twitterDescription, path).toBe(meta.description);
    expect(meta.twitterTitle, path).toBe(meta.ogTitle);

    /*
     * `<title>` 과 `og:title` 은 **일부러 다르다** — `<title>` 에는 `| toolsmith` 가
     * 붙고 og 에는 안 붙는다(`og:site_name` 이 그 몫을 한다). 검사 도구가 이것을
     * 불일치로 띄우는 경우가 있는데 결함이 아니다. 대신 **접두사는 반드시 같아야**
     * 한다 — 그것마저 다르면 진짜로 어긋난 것이다.
     */
    expect(meta.title.startsWith(meta.ogTitle!), path).toBe(true);
  }
});

test("`<html lang>` 과 og:locale 이 같은 언어를 말한다", async ({ page }) => {
  for (const locale of LOCALES) {
    await page.goto(`/${locale}`);
    const meta = await metaOf(page);
    expect(meta.lang, locale).toBe(HTML_LANG[locale]);
    expect(langRoot(meta.ogLocale!), locale).toBe(langRoot(HTML_LANG[locale]));
  }
});

test("hreflang 은 자기를 포함하고 언어판끼리 서로를 가리킨다", async ({ page }) => {
  await page.goto("/ko/tools/pdf-split");
  const meta = await metaOf(page);
  const byLang = new Map(meta.alternates.map((entry) => [entry.hreflang, entry.href]));

  // 자기 참조가 없으면 구글은 이 묶음을 통째로 무시한다
  expect(byLang.get("ko")).toContain("/ko/tools/pdf-split");
  for (const locale of LOCALES) expect(byLang.get(HTML_LANG[locale]), locale).toBeTruthy();

  // 그리고 상대 쪽도 우리를 가리켜야 한다 — 한쪽만 선언한 hreflang 은 무효다
  await page.goto("/de/tools/pdf-split");
  const back = new Map((await metaOf(page)).alternates.map((e) => [e.hreflang, e.href]));
  expect(back.get("ko")).toBe(byLang.get("ko"));
});

test("홈 층위의 x-default 는 언어 선택 화면이고, 도구는 기본 언어판이다", async ({ page }) => {
  await page.goto("/ko");
  const home = new Map((await metaOf(page)).alternates.map((e) => [e.hreflang, e.href]));
  // 언어를 안 고른 방문자를 보낼 곳이 실재한다
  expect(resolve(home.get("x-default")!, page.url()).pathname).toBe("/");

  await page.goto("/ko/tools/pdf-merge");
  const tool = new Map((await metaOf(page)).alternates.map((e) => [e.hreflang, e.href]));
  // 도구를 찾아온 사람을 언어 목록으로 보내면 하던 일에서 밀려난다
  expect(tool.get("x-default")).toContain("/en/tools/pdf-merge");
});

test("사이트맵이 실제 페이지의 canonical 과 한 글자도 다르지 않다", async ({ page, request }) => {
  test.skip(!process.env.BASE_URL, "절대 URL 이 본 도메인일 때만 의미가 있다");

  const xml = await (await request.get("/sitemap.xml")).text();
  const urls = [...xml.matchAll(/<loc>(.*?)<\/loc>/g)].map(([, url]) => url);

  // 루트 + 언어 × (홈 + 도구 + 글 목록 + 글)
  expect(urls).toHaveLength(
    1 + LOCALES.length * (1 + LIVE_TOOLS.length + 1 + GUIDE_LIST.length),
  );

  // 도메인 루트가 빠져 있으면 검사 도구가 가장 먼저 보는 페이지가 목록에 없는 셈이다
  expect(urls.some((url) => new URL(url).pathname === "/")).toBe(true);

  for (const path of SAMPLES) {
    await page.goto(path);
    const { canonical } = await metaOf(page);
    expect(urls, `${path} 의 canonical 이 사이트맵에 없다`).toContain(canonical);
  }
});
