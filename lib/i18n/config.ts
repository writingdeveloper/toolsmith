/**
 * 지원 언어. 여기가 유일한 목록이고 라우팅·hreflang·sitemap 이 전부 이걸 읽는다.
 *
 * 고른 근거(2026-07-25):
 * - en  검색량과 LLM 인용의 기본값. 빠질 수 없다.
 * - ko  현재 운영 언어.
 * - ja  도구 수요가 크고 유료 전환율이 높다.
 * - es  화자 수 대비 변환 도구 경쟁이 느슨하다.
 * - de  구매력이 가장 높고 PDF 도구 수요가 크다.
 * - pt-BR 브라질 트래픽이 크고 경쟁이 약하다.
 */
/**
 * URL 세그먼트는 전부 소문자다. 구글은 `/pt-BR/` 과 `/pt-br/` 을 서로 다른 URL 로 보므로
 * 대문자를 섞으면 오타 하나가 404 가 된다. 표준 표기(pt-BR)는 HTML_LANG 이 갖는다.
 */
export const LOCALES = ["en", "ko", "ja", "es", "de", "pt-br"] as const;

export type Locale = (typeof LOCALES)[number];

/** 루트(/)가 가리키는 언어이자 hreflang x-default. */
export const DEFAULT_LOCALE: Locale = "en";

/** <html lang> 과 hreflang 에 들어가는 표준 표기. */
export const HTML_LANG: Record<Locale, string> = {
  en: "en",
  ko: "ko",
  ja: "ja",
  es: "es",
  de: "de",
  "pt-br": "pt-BR",
};

/** 언어 선택 화면에 쓰는 자기 언어 표기. 번역하지 않는다. */
export const LOCALE_NAME: Record<Locale, string> = {
  en: "English",
  ko: "한국어",
  ja: "日本語",
  es: "Español",
  de: "Deutsch",
  "pt-br": "Português (Brasil)",
};

export function isLocale(value: string): value is Locale {
  return (LOCALES as readonly string[]).includes(value);
}

/** "{n}장" 같은 자리표시자를 채운다. 사전은 클라이언트로 넘어가므로 함수를 담을 수 없다. */
export function fill(template: string, values: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (_, key: string) =>
    key in values ? String(values[key]) : `{${key}}`,
  );
}
