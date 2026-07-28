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

/** 공유 카드에 쓰는 그림. 6개 언어가 같은 것을 쓰므로 **글이 들어 있지 않다.** */
export const OG_IMAGE = "/og.png";
export const OG_IMAGE_SIZE = { width: 1200, height: 630 };

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
  const image = absolute(OG_IMAGE);
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
