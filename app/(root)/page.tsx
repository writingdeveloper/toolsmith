import type { Metadata } from "next";
import Link from "next/link";
import { JsonLd } from "@/components/JsonLd";
import { getDictionary } from "@/lib/i18n";
import { rootJsonLd } from "@/lib/schema";
import { DEFAULT_LOCALE, HTML_LANG, LOCALE_NAME, LOCALES } from "@/lib/i18n/config";
import { absolute, alternatesFor, socialFor } from "@/lib/site";

const dict = getDictionary(DEFAULT_LOCALE);

export const metadata: Metadata = {
  title: dict.site.title,
  description: dict.site.description,
  alternates: {
    /*
     * **자기 자신을 가리킨다 (2026-07-28).**
     *
     * 예전에는 canonical 이 `/en` 이었다 — "루트는 언어를 안 고른 방문자용이니
     * 스스로를 정본으로 삼지 않는다" 는 생각이었는데, **그건 틀린 신호였다.**
     * canonical 은 "이 URL 은 저 URL 의 중복본이다" 라는 뜻이고, 이 화면은 `/en`
     * (도구 목록)과 **내용이 다르다**. 교차검증 도구가 이것을 불일치로 잡았고,
     * 구글에게도 "도메인 루트는 무시하라" 고 말하는 셈이었다.
     */
    canonical: absolute("/"),
    languages: alternatesFor(DEFAULT_LOCALE).languages,
  },
  ...socialFor(DEFAULT_LOCALE, dict.site.title, dict.site.description, "", absolute("/")),
};

/**
 * `/` — 언어 선택. 리다이렉트를 쓰지 않는 이유: 미들웨어(=Vercel Function)를 켜야 하고,
 * 그러면 "서버 연산 0" 이 깨진다. 정적 HTML 한 장이면 충분하다.
 */
export default function LanguagePicker() {
  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col justify-center px-5 py-16">
      <JsonLd data={rootJsonLd(dict)} />
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
