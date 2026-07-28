import type { Metadata } from "next";
import Link from "next/link";
import { getDictionary } from "@/lib/i18n";
import { DEFAULT_LOCALE, HTML_LANG, LOCALE_NAME, LOCALES } from "@/lib/i18n/config";
import { absolute, alternatesFor, socialFor } from "@/lib/site";

const dict = getDictionary(DEFAULT_LOCALE);

export const metadata: Metadata = {
  title: dict.site.title,
  description: dict.site.description,
  alternates: {
    // 루트는 언어를 고르지 않은 방문자용이라 스스로를 canonical 로 삼지 않는다.
    canonical: absolute(`/${DEFAULT_LOCALE}`),
    languages: alternatesFor(DEFAULT_LOCALE).languages,
  },
  ...socialFor(DEFAULT_LOCALE, dict.site.title, dict.site.description),
};

/**
 * `/` — 언어 선택. 리다이렉트를 쓰지 않는 이유: 미들웨어(=Vercel Function)를 켜야 하고,
 * 그러면 "서버 연산 0" 이 깨진다. 정적 HTML 한 장이면 충분하다.
 */
export default function LanguagePicker() {
  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col justify-center px-5 py-16">
      <p className="text-lg font-semibold tracking-tight">toolsmith</p>
      <h1 className="mt-6 text-2xl font-semibold tracking-tight">{dict.localePicker.title}</h1>
      <p className="mt-2 text-muted">{dict.localePicker.lead}</p>

      <ul className="mt-8 grid gap-3 sm:grid-cols-2">
        {LOCALES.map((locale) => (
          <li key={locale}>
            <Link
              href={`/${locale}`}
              hrefLang={HTML_LANG[locale]}
              className="block rounded-xl border border-border bg-panel px-5 py-4 font-medium transition-colors hover:border-accent"
            >
              {LOCALE_NAME[locale]}
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
