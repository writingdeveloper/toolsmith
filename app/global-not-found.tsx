import type { Metadata } from "next";
import "./globals.css";
import { NotFoundBody, type NotFoundCopy } from "@/components/NotFoundBody";
import { ThemeScript } from "@/components/Theme";
import { getDictionary } from "@/lib/i18n";
import { DEFAULT_LOCALE, HTML_LANG, LOCALES, type Locale } from "@/lib/i18n/config";

/**
 * 주소가 아무것도 안 맞을 때 뜨는 화면.
 *
 * **왜 `global-not-found` 인가.** 이 저장소에는 `app/layout.tsx` 가 없다 — 만들면
 * 모든 페이지가 하나의 `<html lang>` 을 공유하게 되어 6개 언어가 무너진다(CLAUDE.md).
 * 그래서 평범한 `app/not-found.tsx` 는 놓을 자리가 없다. `global-not-found` 는 자기
 * `<html>` 을 직접 그리므로 루트 레이아웃 없이 성립한다.
 *
 * 그전에는 Next 기본 404 가 떴다 — **6개 언어 사이트에서 영어 한 줄.**
 */
/*
 * `robots: noindex` 는 **여기 안 적는다.** Next 가 404 화면에 자동으로 붙인다 —
 * 적었더니 같은 태그가 두 개 나갔다(2026-07-28 실측). 프레임워크가 이미 하는 일을
 * 되풀이하면 어느 쪽이 진짜인지 나중에 아무도 모른다.
 */
export const metadata: Metadata = { title: "404" };

export default function GlobalNotFound() {
  const copy = Object.fromEntries(
    LOCALES.map((locale) => {
      const dict = getDictionary(locale);
      return [
        locale,
        {
          title: dict.common.notFoundTitle,
          lead: dict.common.notFoundLead,
          home: dict.common.notFoundHome,
        } satisfies NotFoundCopy,
      ];
    }),
  ) as Record<Locale, NotFoundCopy>;

  return (
    <html lang={HTML_LANG[DEFAULT_LOCALE]} className="h-full" suppressHydrationWarning>
      <head>
        <ThemeScript />
      </head>
      <body className="flex min-h-full flex-col">
        <NotFoundBody copy={copy} />
      </body>
    </html>
  );
}
