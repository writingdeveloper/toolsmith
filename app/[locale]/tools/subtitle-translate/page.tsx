import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Breadcrumb } from "@/components/Breadcrumb";
import { JsonLd } from "@/components/JsonLd";
import { RelatedTools } from "@/components/RelatedTools";
import { getDictionary } from "@/lib/i18n";
import { isLocale, type Locale } from "@/lib/i18n/config";
import { toolJsonLd } from "@/lib/schema";
import { alternatesFor, socialFor } from "@/lib/site";
import type { TranslateLanguage } from "@/lib/translate/translate-core";
import { SubtitleTranslator } from "./SubtitleTranslator";

const PATH = "/tools/subtitle-translate";

/**
 * 보고 있는 언어판에 맞춘 기본 **도착** 언어.
 * 한국어 페이지에 온 사람은 한국어 자막을 얻으러 왔다 — 자막 생성이 **출발**
 * 언어를 그렇게 정한 것과 방향만 반대다.
 */
const DEFAULT_TARGET: Record<Locale, TranslateLanguage> = {
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
  const tool = getDictionary(locale).tools["subtitle-translate"];
  return {
    title: tool.metaTitle,
    description: tool.metaDescription,
    alternates: alternatesFor(locale, PATH),
    ...socialFor(locale, tool.metaTitle, tool.metaDescription, PATH),
  };
}

export default async function SubtitleTranslatePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const dict = getDictionary(locale);
  const tool = dict.tools["subtitle-translate"];

  return (
    <article className="space-y-10">
      <JsonLd data={toolJsonLd(locale, dict, "subtitle-translate")} />

      <Breadcrumb locale={locale} label={dict.common.breadcrumbLabel} current={tool.h1} />

      <header className="space-y-3">
        <h1 className="text-3xl font-semibold tracking-tight">{tool.h1}</h1>
        <p className="max-w-2xl text-muted">{tool.lead}</p>
      </header>

      <SubtitleTranslator ui={tool.ui} common={dict.common} defaultTarget={DEFAULT_TARGET[locale]} />

      <section data-faq className="space-y-4 border-t border-border pt-8 text-sm text-muted">
        {tool.faq.map((entry) => (
          <div key={entry.q}>
            <h2 className="font-medium text-fg">{entry.q}</h2>
            <p className="mt-1">{entry.a}</p>
          </div>
        ))}
      </section>
      <RelatedTools locale={locale} slug="subtitle-translate" dict={dict} />
    </article>
  );
}
