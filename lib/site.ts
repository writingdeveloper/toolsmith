import { DEFAULT_LOCALE, HTML_LANG, LOCALES, type Locale } from "@/lib/i18n/config";

/**
 * 본 도메인이 붙기 전까지는 비어 있다. 비어 있으면 robots 가 전면 차단하고
 * canonical/hreflang 은 상대 경로로 남는다 (틀린 절대 URL 을 내보내지 않는다).
 */
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "";

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
