import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import "../globals.css";
import { Analytics } from "@/components/Analytics";
import { LocaleSwitcher } from "@/components/LocaleSwitcher";
import { ThemeScript, ThemeToggle } from "@/components/Theme";
import { getDictionary } from "@/lib/i18n";
import { HTML_LANG, isLocale, LOCALE_NAME, LOCALES, type Locale } from "@/lib/i18n/config";
import { alternatesFor, GA_ID, SITE_URL, socialFor } from "@/lib/site";

/** 6개 언어를 빌드 시점에 전부 찍어낸다. 런타임 서버 연산은 없다. */
export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const dict = getDictionary(locale);

  return {
    metadataBase: SITE_URL ? new URL(SITE_URL) : undefined,
    title: { default: dict.site.title, template: dict.site.titleTemplate },
    description: dict.site.description,
    alternates: alternatesFor(locale),
    /*
     * 각 언어의 홈이 이것을 그대로 물려받는다. 도구 페이지는 자기 제목으로 다시
     * 부르므로 여기 값이 남지 않는다 — Next 는 og 를 통째로 갈아끼운다.
     */
    ...socialFor(locale, dict.site.title, dict.site.description),
  };
}

export default async function LocaleLayout({
  children,
  params,
}: Readonly<{ children: React.ReactNode; params: Promise<{ locale: string }> }>) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const typed: Locale = locale;
  const dict = getDictionary(typed);

  return (
    /*
      `data-theme` 은 아래 인라인 스크립트가 **React 가 붙기 전에** 적는다. 서버가 찍은
      HTML 에는 그 속성이 없으므로 React 가 불일치로 보고 경고를 낸다 — 여기서는 그것이
      정상이다(그 한 박자를 없애려고 스크립트를 둔 것이다). 이 표시를 빼면 모든 페이지
      로드마다 콘솔에 오류가 남는다.
    */
    <html lang={HTML_LANG[typed]} className="h-full" suppressHydrationWarning>
      <head>
        {/* 첫 페인트 전에 화면 밝기를 확정한다 — 근거는 components/Theme.tsx */}
        <ThemeScript />
      </head>
      <body className="flex min-h-full flex-col">
        <header className="border-b border-border">
          <div className="mx-auto max-w-5xl px-5 py-4">
            <div className="flex items-center justify-between gap-3">
              <Link href={`/${typed}`} className="text-lg font-semibold tracking-tight">
                toolsmith
              </Link>
              <div className="flex items-center gap-3">
                <span className="hidden rounded-full border border-border px-3 py-1 text-xs text-muted sm:inline">
                  {dict.site.tagline}
                </span>
                <ThemeToggle label={dict.site.themeLabel} names={dict.site.themeNames} />
                <LocaleSwitcher current={typed} />
              </div>
            </div>
            {/*
              **좁은 화면에서는 아래 줄에 그대로 보여 준다 (2026-07-28).**
              예전에는 `sm:` 아래에서 통째로 숨겼는데, "업로드 없음" 은 이 사이트가 내건
              **유일한 차별점**이다. 그것을 가장 흔한 기기에서만 안 보여 주고 있었다.
              한 줄이 더 생기지만 첫 화면에서 밀려나는 것은 없다.
            */}
            <p className="mt-3 text-center text-xs text-muted sm:hidden">{dict.site.tagline}</p>
          </div>
        </header>

        <main className="mx-auto w-full max-w-5xl flex-1 px-5 py-10">{children}</main>

        <footer className="border-t border-border">
          <div className="mx-auto max-w-5xl space-y-3 px-5 py-6 text-sm text-muted">
            <p>{dict.site.footerNote}</p>
            {/* 크롤러가 언어판을 실제 링크로도 발견하게 한다 */}
            <ul className="flex flex-wrap gap-x-4 gap-y-1">
              {LOCALES.map((other) => (
                <li key={other}>
                  <Link
                    href={`/${other}`}
                    hrefLang={HTML_LANG[other]}
                    className={other === typed ? "text-fg" : "hover:text-fg"}
                  >
                    {LOCALE_NAME[other]}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </footer>

        {/* 측정 ID 가 없으면(로컬·프리뷰) 태그를 심지 않는다.
            자동화된 브라우저에 심지 않는 판단은 Analytics 안에 있다. */}
        {GA_ID && <Analytics gaId={GA_ID} />}
      </body>
    </html>
  );
}
