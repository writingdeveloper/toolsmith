import { DEFAULT_LOCALE, HTML_LANG, LOCALES, type Locale } from "@/lib/i18n/config";

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
  languages["x-default"] = absolute(pathFor(DEFAULT_LOCALE, path));
  return { canonical: absolute(pathFor(locale, path)), languages };
}
