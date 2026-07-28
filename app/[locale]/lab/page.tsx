import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumb } from "@/components/Breadcrumb";
import { getDictionary } from "@/lib/i18n";
import { isLocale, LOCALES } from "@/lib/i18n/config";
import { formatBytes, LAB_LIST } from "@/lib/lab";
import { alternatesFor, socialFor } from "@/lib/site";

const PATH = "/lab";

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
  const { lab } = getDictionary(locale);
  return {
    title: lab.metaTitle,
    description: lab.metaDescription,
    alternates: alternatesFor(locale, PATH),
    ...socialFor(locale, lab.metaTitle, lab.metaDescription, PATH),
  };
}

/**
 * Lab 목록.
 *
 * **색인된다.** 이 층의 목적이 백링크와 화제성이므로 숨기면 존재 이유가 사라진다.
 * 링크하지 않는 것은 **Tier 1·2 도구 페이지에서**다 — 도구를 쓰러 온 사람에게
 * 874MB 짜리를 권하지 않는다.
 */
export default async function LabIndex({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const dict = getDictionary(locale);
  const { lab } = dict;

  return (
    <div className="space-y-8">
      <Breadcrumb locale={locale} label={dict.common.breadcrumbLabel} current={lab.h1} />

      <header className="space-y-4">
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">{lab.h1}</h1>
        <p className="max-w-2xl text-lg text-muted">{lab.lead}</p>
      </header>

      <ul className="grid gap-4 sm:grid-cols-2" data-lab-list>
        {LAB_LIST.map((entry) => (
          <li key={entry.slug}>
            <Link
              href={`/${locale}/lab/${entry.slug}`}
              className="flex h-full flex-col gap-2 rounded-xl border border-border bg-panel p-5 transition-colors hover:border-accent"
            >
              <span className="font-medium">{lab.entries[entry.slug].h1}</span>
              <span className="text-sm text-muted">{lab.entries[entry.slug].blurb}</span>
              {/* 목록에서도 용량을 먼저 보여 준다 — 열어 본 뒤에 알면 늦다 */}
              <span className="mt-auto pt-2 text-xs font-medium text-warn">
                {formatBytes(entry.bytes)} · {lab.downloadLabel}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
