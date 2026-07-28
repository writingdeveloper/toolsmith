import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumb } from "@/components/Breadcrumb";
import { JsonLd } from "@/components/JsonLd";
import { RichText } from "@/components/RichText";
import { getGuideCopy, GUIDE_LIST, GUIDE_SLUGS, GUIDES, isGuideSlug } from "@/lib/guides";
import { getDictionary } from "@/lib/i18n";
import { HTML_LANG, isLocale, type Locale } from "@/lib/i18n/config";
import { guideJsonLd } from "@/lib/schema";
import { alternatesFor, socialFor } from "@/lib/site";
import { ACCEPT } from "@/lib/tools";

/**
 * 슬러그는 언어와 무관하다 — 부모가 이미 언어 6개를 찍으므로 여기서는 글만 센다.
 * 6 × 4 = 24 페이지가 빌드 시점에 정적으로 나온다.
 */
export function generateStaticParams() {
  return GUIDE_SLUGS.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  if (!isLocale(locale) || !isGuideSlug(slug)) return {};
  const article = getGuideCopy(locale).articles[slug];
  const path = `/guides/${slug}`;
  return {
    title: article.metaTitle,
    description: article.metaDescription,
    alternates: alternatesFor(locale, path),
    ...socialFor(locale, article.metaTitle, article.metaDescription, path),
  };
}

/** 화면에 적는 날짜. 기계가 읽는 값은 `<time dateTime>` 의 ISO 문자열 쪽이다. */
function formatDate(locale: Locale, iso: string): string {
  return new Intl.DateTimeFormat(HTML_LANG[locale], {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${iso}T00:00:00Z`));
}

export default async function GuidePage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  if (!isLocale(locale) || !isGuideSlug(slug)) notFound();

  const dict = getDictionary(locale);
  const copy = getGuideCopy(locale);
  const meta = GUIDES[slug];
  const article = copy.articles[slug];
  const others = GUIDE_LIST.filter((other) => other.slug !== slug);

  return (
    <article className="space-y-10">
      <JsonLd data={guideJsonLd(locale, copy, meta)} />

      <Breadcrumb
        locale={locale}
        label={dict.common.breadcrumbLabel}
        current={article.h1}
        trail={[{ name: copy.hub.h1, href: `/${locale}/guides` }]}
      />

      <header className="space-y-3">
        <h1 className="text-3xl font-semibold tracking-tight">{article.h1}</h1>
        <p className="max-w-2xl text-lg text-muted">{article.lead}</p>
        <p className="text-sm text-muted">
          {copy.hub.updatedLabel}{" "}
          <time dateTime={meta.updated}>{formatDate(locale, meta.updated)}</time>
        </p>
      </header>

      {/*
        * 본문은 사전이 아니라 `lib/guides/{locale}.ts` 가 갖는다. 길어서가 아니라
        * **성격이 다르기 때문**이다 — 사전은 화면의 조각이고 이쪽은 읽는 글이다.
        */}
      <div className="space-y-8">
        {article.sections.map((section) => (
          <section key={section.h2} className="space-y-3">
            <h2 className="text-xl font-medium">{section.h2}</h2>
            {section.body.map((paragraph) => (
              <p key={paragraph} className="max-w-2xl leading-relaxed text-muted">
                <RichText text={paragraph} />
              </p>
            ))}
            {section.list && (
              <ul className="max-w-2xl list-disc space-y-2 pl-5 leading-relaxed text-muted">
                {section.list.map((item) => (
                  <li key={item}>
                    <RichText text={item} />
                  </li>
                ))}
              </ul>
            )}
          </section>
        ))}
      </div>

      {/*
        * **글은 도구에서 끝난다.** 읽고 나서 다시 찾아 들어가게 만들면 그 자리에서
        * 사람이 떨어진다. 순서는 `lib/guides/registry.ts` 의 `tools` 가 정한다.
        */}
      <section className="space-y-4 border-t border-border pt-8" data-guide-tools>
        <h2 className="text-lg font-medium">{copy.hub.toolsHeading}</h2>
        <ul className="grid gap-3 sm:grid-cols-2">
          {meta.tools.map((tool) => (
            <li key={tool}>
              <Link
                href={`/${locale}/tools/${tool}`}
                className="block rounded-xl border border-border bg-panel p-4 hover:border-accent"
              >
                <span className="block font-medium">{dict.toolNames[tool]}</span>
                <span className="mt-1 block text-sm text-muted">
                  {dict.tools[tool as keyof typeof dict.tools]?.blurb ?? ACCEPT[tool]}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section data-faq className="space-y-4 border-t border-border pt-8 text-sm text-muted">
        {article.faq.map((entry) => (
          <div key={entry.q}>
            <h2 className="font-medium text-fg">{entry.q}</h2>
            <p className="mt-1">{entry.a}</p>
          </div>
        ))}
      </section>

      {others.length > 0 && (
        <section className="space-y-3 border-t border-border pt-8">
          <h2 className="text-lg font-medium">{copy.hub.relatedHeading}</h2>
          <ul className="space-y-2 text-sm">
            {others.map((other) => (
              <li key={other.slug}>
                <Link href={`/${locale}/guides/${other.slug}`} className="hover:text-accent">
                  {copy.articles[other.slug].h1}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </article>
  );
}
