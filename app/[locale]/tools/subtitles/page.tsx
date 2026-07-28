import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Breadcrumb } from "@/components/Breadcrumb";
import { JsonLd } from "@/components/JsonLd";
import { RelatedTools } from "@/components/RelatedTools";
import { chainCopy } from "@/lib/chain";
import { getDictionary } from "@/lib/i18n";
import { isLocale } from "@/lib/i18n/config";
import { toolJsonLd } from "@/lib/schema";
import { alternatesFor, socialFor } from "@/lib/site";
import type { SubtitleLanguage } from "@/lib/subtitles/subtitle-core";
import { SubtitleMaker } from "./SubtitleMaker";

const PATH = "/tools/subtitles";

/**
 * 기본 인식 언어는 **자동 감지**다.
 *
 * 예전에는 보고 있는 언어판을 따라갔다("한국어 페이지에 온 사람이 넣을 영상은 한국어일
 * 가능성이 가장 높다"). 그럴듯했지만 **재 본 적이 없는 추측**이었고, 틀렸을 때의 대가가
 * 크다 — 실물 영어 대화 녹음(4.7분)을 한국어 페이지에서 넣었더니 "이 노래가 제거하는
 * 것 같다" 같은 **한국어 헛소리 120줄**이 나왔고 경고는 없었다(2026-07-28 실측).
 *
 * OCR 과는 사정이 다르다. Tesseract 에는 자동 감지가 없어서 **누군가는 골라야** 하지만,
 * Whisper 는 자기가 알아맞힌다 — 그 능력을 화면에 옵션으로 내놓고도 기본으로 쓰지
 * 않고 있었다. 같은 파일을 `auto` 로 돌리니 영어로 정확히 받아썼고, 영어를 손으로 고른
 * 것과 사실상 같았다(124줄 대 124줄, 앞 다섯 줄 일치).
 *
 * 틀렸을 때의 모습이 다르다는 것이 핵심이다. 자동 감지가 틀리면 드물게 틀리지만,
 * 언어를 고정해 두고 틀리면 **항상, 조용히, 통째로** 틀린다.
 */
const DEFAULT_LANGUAGE: SubtitleLanguage = "auto";

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

      <SubtitleMaker ui={tool.ui} common={dict.common} defaultLanguage={DEFAULT_LANGUAGE} chain={chainCopy(locale, dict)} />

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
