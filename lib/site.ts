import { GUIDE_LIST } from "@/lib/guides";
import { LAB_LIST } from "@/lib/lab";
import { LIVE_TOOLS } from "@/lib/tools";
import { DEFAULT_LOCALE, HTML_LANG, LOCALES, type Locale } from "@/lib/i18n/config";
import type { Metadata } from "next";

/**
 * 본 도메인이 붙기 전까지는 비어 있다. 비어 있으면 robots 가 전면 차단하고
 * canonical/hreflang 은 상대 경로로 남는다 (틀린 절대 URL 을 내보내지 않는다).
 */
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "";

/**
 * GA4 측정 ID. 비어 있으면 태그를 아예 심지 않는다 —
 * 로컬·프리뷰의 클릭이 프로덕션 통계를 더럽히지 않게 하려는 것이다.
 *
 * 주의: GA 의 "향상된 측정 > 파일 다운로드" 는 **꺼 두었다.** 켜면 사용자가 내려받는
 * 결과 파일의 이름(원본 파일명이 그대로 들어간다)이 구글로 전송된다. 이 사이트가
 * 내건 약속과 정면으로 충돌한다.
 */
export const GA_ID = process.env.NEXT_PUBLIC_GA_ID ?? "";

export function pathFor(locale: Locale, path = ""): string {
  return `/${locale}${path}`;
}

export function absolute(path: string): string {
  return SITE_URL ? `${SITE_URL}${path}` : path;
}

/**
 * 같은 문서의 모든 언어판을 서로 가리키게 한다.
 * x-default 는 언어를 고르지 않은 방문자용 — 기본 언어판으로 보낸다.
 */
export function alternatesFor(locale: Locale, path = "") {
  const languages: Record<string, string> = {};
  // 키는 표준 표기(pt-BR), 값의 경로는 소문자 세그먼트(/pt-br)
  for (const other of LOCALES) languages[HTML_LANG[other]] = absolute(pathFor(other, path));
  /*
   * **홈 층위의 x-default 는 `/` 다 (2026-07-28).**
   *
   * x-default 는 "어느 언어도 안 맞는 방문자를 어디로 보낼까" 이고, 그 자리에 놓기
   * 가장 좋은 것은 **언어 선택 화면**이다. 우리에게는 그것이 실재한다(`/`).
   *
   * 도구 페이지에는 그런 화면이 없다 — "PDF 병합" 을 찾아온 사람을 언어 목록으로
   * 보내면 하던 일에서 밀려난다. 그쪽은 기본 언어판을 가리킨다.
   *
   * **이 판단은 여기 한 곳에만 있다.** `<head>` 와 sitemap 이 같은 함수를 부르므로
   * 둘이 어긋날 수 없다 — 어긋나면 구글이 어느 쪽을 믿을지 모른다.
   */
  languages["x-default"] = path === "" ? absolute("/") : absolute(pathFor(DEFAULT_LOCALE, path));
  return { canonical: absolute(pathFor(locale, path)), languages };
}

/**
 * OG 는 언어를 `xx_XX` 로 적는다. hreflang 표기(`pt-BR`)와 형태가 달라서 따로 둔다.
 */
const OG_LOCALE: Record<Locale, string> = {
  en: "en_US",
  ko: "ko_KR",
  ja: "ja_JP",
  es: "es_ES",
  de: "de_DE",
  "pt-br": "pt_BR",
};

/**
 * 사이트맵에 실리는 **언어별** 경로 수 — 홈 + 도구 + 글 목록 + 글 + Lab 목록 + Lab 도구.
 *
 * 실제 경로 목록은 `app/sitemap.ts` 가 만든다. 여기 있는 것은 그 개수뿐이고,
 * **스펙 둘이 각자 세고 있던 것**을 2026-07-28 에 여기로 모았다 — Lab 을 더했을 때
 * 한쪽만 고쳐져 배포본에서 걸렸다.
 */
export const SITEMAP_PATHS_PER_LOCALE =
  1 + LIVE_TOOLS.length + 1 + GUIDE_LIST.length + 1 + LAB_LIST.length;

/** 공유 카드에 쓰는 기본 그림. 6개 언어가 같은 것을 쓰므로 **글이 들어 있지 않다.** */
export const OG_IMAGE = "/og.png";
export const OG_IMAGE_SIZE = { width: 1200, height: 630 };

/**
 * 이 문서의 공유 카드.
 *
 * **전용 카드가 있는 층이 셋이다** — 도구·설명 글·Lab 도구(`scripts/make-icons.mjs`
 * 가 굽는다). 스물한 도구가 카드 하나를 함께 쓰던 것을 2026-07-28 에 갈랐고,
 * **2026-07-29 에 글과 Lab 까지 넓혔다.** 그전에는 `/tools/<slug>` 만 봤기 때문에
 * **글 66쪽과 Lab 12쪽이 전부 공용 카드**를 쓰고 있었다 — 정작 링크를 받으라고 만든
 * 층에 카드가 없고 도구에만 있었으니 앞뒤가 뒤집혀 있었다.
 *
 * **경로에서 유도한다.** 페이지 여든 곳에 각각 파일 이름을 적게 하면 페이지를 더할 때
 * 빠뜨릴 자리가 하나 더 는다. 여기서 한 번 갈라 두면 `PATH` 만 맞으면 저절로 따라온다.
 *
 * **파일 이름이 URL 경로 그대로다**(`/tools/ocr` → `/og/tools/ocr.png`). 전에는
 * `/og/<slug>.png` 로 납작했는데, 층이 셋이 되면 슬러그가 겹치는 순간 두 층의 카드가
 * 조용히 같은 파일을 가리킨다. 아직 겹칠 것이 없어도 **규칙이 "경로 그대로" 하나인
 * 편이 층마다 규칙 하나씩 두는 것보다 짧다.**
 *
 * 목록 페이지(`/guides`·`/lab`)는 공용 카드로 남는다 — 그 두 곳에는 형식 이름으로
 * 줄일 대상이 없다. 파일이 실제로 있는지는 `tests/seo.spec.ts` 가 세 층 전부에 대해
 * 확인한다 — **유도한 이름의 파일이 없어도 화면에는 아무 일도 일어나지 않는다.**
 */
const SHARED_CARD = /^\/(?:tools|guides|lab)\/[a-z0-9-]+$/;

export function ogImageFor(path: string): string {
  return SHARED_CARD.test(path) ? `/og${path}.png` : OG_IMAGE;
}

/**
 * 공유 카드(Open Graph · X) 메타.
 *
 * **Next 는 `title`/`description` 을 og 로 자동 복사하지 않는다.** 레이아웃에 한 번
 * 적어 두어도 페이지가 제목을 바꾸면 og 제목은 레이아웃의 옛 값으로 남는다 — 그래서
 * 페이지마다 자기 제목으로 이 함수를 부른다. 대신 부르는 자리가 21곳이 되므로
 * **문자열은 전부 여기 한 곳에만 있다.**
 */
export function socialFor(
  locale: Locale,
  title: string,
  description: string,
  path = "",
  /**
   * 주소를 직접 지정한다. 언어 선택 화면(`/`)만 이것을 쓴다 — 그 페이지에는 언어
   * 접두사가 없어서 `pathFor` 로는 자기 주소를 만들 수 없다. **`og:url` 이 실제
   * 주소와 다르면 교차검증 도구가 바로 불일치로 잡는다**(2026-07-28 실측).
   */
  urlOverride?: string,
): Pick<Metadata, "openGraph" | "twitter"> {
  const url = urlOverride ?? absolute(pathFor(locale, path));
  const image = absolute(ogImageFor(path));
  return {
    openGraph: {
      type: "website",
      siteName: "toolsmith",
      title,
      description,
      url,
      locale: OG_LOCALE[locale],
      alternateLocale: LOCALES.filter((other) => other !== locale).map((other) => OG_LOCALE[other]),
      images: [{ url: image, ...OG_IMAGE_SIZE, alt: "toolsmith" }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
    },
  };
}
