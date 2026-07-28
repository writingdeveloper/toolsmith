import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Breadcrumb } from "@/components/Breadcrumb";
import { JsonLd } from "@/components/JsonLd";
import { RelatedTools } from "@/components/RelatedTools";
import { getDictionary } from "@/lib/i18n";
import { isLocale } from "@/lib/i18n/config";
import { toolJsonLd } from "@/lib/schema";
import { alternatesFor, socialFor } from "@/lib/site";
import { Summarizer } from "./Summarizer";

const PATH = "/tools/summarize";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const tool = getDictionary(locale).tools.summarize;
  return {
    title: tool.metaTitle,
    description: tool.metaDescription,
    alternates: alternatesFor(locale, PATH),
    ...socialFor(locale, tool.metaTitle, tool.metaDescription, PATH),
  };
}

export default async function SummarizePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const dict = getDictionary(locale);
  const tool = dict.tools.summarize;

  return (
    <article className="space-y-10">
      <JsonLd data={toolJsonLd(locale, dict, "summarize")} />

      <Breadcrumb locale={locale} label={dict.common.breadcrumbLabel} current={tool.h1} />

      <header className="space-y-3">
        <h1 className="text-3xl font-semibold tracking-tight">{tool.h1}</h1>
        <p className="max-w-2xl text-muted">{tool.lead}</p>
      </header>

      <Summarizer ui={tool.ui} common={dict.common} />

      <section data-faq className="space-y-4 border-t border-border pt-8 text-sm text-muted">
        {tool.faq.map((entry) => (
          <div key={entry.q}>
            <h2 className="font-medium text-fg">{entry.q}</h2>
            <p className="mt-1">{entry.a}</p>
          </div>
        ))}
      </section>
      <RelatedTools locale={locale} slug="summarize" dict={dict} />
    </article>
  );
}
