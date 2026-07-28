import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Breadcrumb } from "@/components/Breadcrumb";
import { JsonLd } from "@/components/JsonLd";
import { RelatedTools } from "@/components/RelatedTools";
import { getDictionary } from "@/lib/i18n";
import { isLocale, type Locale } from "@/lib/i18n/config";
import { toolJsonLd } from "@/lib/schema";
import { alternatesFor, socialFor } from "@/lib/site";
import type { SubtitleLanguage } from "@/lib/subtitles/subtitle-core";
import { SubtitleMaker } from "./SubtitleMaker";

const PATH = "/tools/subtitles";

/**
 * 보고 있는 언어판에 맞춘 기본 인식 언어.
 * 한국어 페이지에 온 사람이 넣을 영상은 한국어일 가능성이 가장 높다 — OCR 과 같은 판단이다.
 */
const DEFAULT_LANGUAGE: Record<Locale, SubtitleLanguage> = {
  en: "en",
  ko: "ko",
  ja: "ja",
  es: "es",
  de: "de",
  "pt-br": "pt",
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const tool = getDictionary(locale).tools.subtitles;
  return {
    title: tool.metaTitle,
    description: tool.metaDescription,
    alternates: alternatesFor(locale, PATH),
    ...socialFor(locale, tool.metaTitle, tool.metaDescription, PATH),
  };
}

export default async function SubtitlesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const dict = getDictionary(locale);
  const tool = dict.tools.subtitles;

  return (
    <article className="space-y-10">
      <JsonLd data={toolJsonLd(locale, dict, "subtitles")} />

      <Breadcrumb locale={locale} label={dict.common.breadcrumbLabel} current={tool.h1} />

      <header className="space-y-3">
        <h1 className="text-3xl font-semibold tracking-tight">{tool.h1}</h1>
        <p className="max-w-2xl text-muted">{tool.lead}</p>
      </header>

      <SubtitleMaker ui={tool.ui} common={dict.common} defaultLanguage={DEFAULT_LANGUAGE[locale]} />

      <section data-faq className="space-y-4 border-t border-border pt-8 text-sm text-muted">
        {tool.faq.map((entry) => (
          <div key={entry.q}>
            <h2 className="font-medium text-fg">{entry.q}</h2>
            <p className="mt-1">{entry.a}</p>
          </div>
        ))}
      </section>
      <RelatedTools locale={locale} slug="subtitles" dict={dict} />
    </article>
  );
}
