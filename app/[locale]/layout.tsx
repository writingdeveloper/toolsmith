import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import "../globals.css";
import { Analytics } from "@/components/Analytics";
import { LocaleSwitcher } from "@/components/LocaleSwitcher";
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
    <html lang={HTML_LANG[typed]} className="h-full">
      <body className="flex min-h-full flex-col">
        <header className="border-b border-border">
          <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-5 py-4">
            <Link href={`/${typed}`} className="text-lg font-semibold tracking-tight">
              toolsmith
            </Link>
            <div className="flex items-center gap-3">
              <span className="hidden rounded-full border border-border px-3 py-1 text-xs text-muted sm:inline">
                {dict.site.tagline}
              </span>
              <LocaleSwitcher current={typed} />
            </div>
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
