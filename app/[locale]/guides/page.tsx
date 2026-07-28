import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumb } from "@/components/Breadcrumb";
import { JsonLd } from "@/components/JsonLd";
import { getGuideCopy, GUIDE_LIST } from "@/lib/guides";
import { getDictionary } from "@/lib/i18n";
import { isLocale } from "@/lib/i18n/config";
import { guideHubJsonLd } from "@/lib/schema";
import { alternatesFor, socialFor } from "@/lib/site";

const PATH = "/guides";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const { hub } = getGuideCopy(locale);
  return {
    title: hub.metaTitle,
    description: hub.metaDescription,
    alternates: alternatesFor(locale, PATH),
    ...socialFor(locale, hub.metaTitle, hub.metaDescription, PATH),
  };
}

/**
 * 글 목록.
 *
 * **도구가 아닌 것이 사이트에 생기는 첫 자리다.** 지금까지 132페이지가 전부 "무엇을
 * 하는 곳" 이라, 검색에서 잡히는 것이 거래형 낱말뿐이었다. 그 앞에 오는 질문들에
 * 답할 페이지가 여기다.
 */
export default async function GuidesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const dict = getDictionary(locale);
  const copy = getGuideCopy(locale);

  return (
    <div className="space-y-10">
      <JsonLd data={guideHubJsonLd(locale, copy, GUIDE_LIST)} />

      <Breadcrumb locale={locale} label={dict.common.breadcrumbLabel} current={copy.hub.h1} />

      <header className="space-y-3">
        <h1 className="text-3xl font-semibold tracking-tight">{copy.hub.h1}</h1>
        <p className="max-w-2xl text-lg text-muted">{copy.hub.lead}</p>
      </header>

      <ul className="grid gap-4 sm:grid-cols-2" data-guide-list>
        {GUIDE_LIST.map((meta) => {
          const article = copy.articles[meta.slug];
          return (
            <li key={meta.slug}>
              <Link
                href={`/${locale}/guides/${meta.slug}`}
                className="block h-full rounded-xl border border-border bg-panel p-5 hover:border-accent"
              >
                <span className="block font-medium">{article.h1}</span>
                <span className="mt-2 block text-sm text-muted">{article.lead}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
