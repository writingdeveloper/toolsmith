import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getDictionary } from "@/lib/i18n";
import { isLocale } from "@/lib/i18n/config";
import { alternatesFor } from "@/lib/site";
import { PdfMerger } from "./PdfMerger";

const PATH = "/tools/pdf-merge";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const tool = getDictionary(locale).tools["pdf-merge"];
  return {
    title: tool.metaTitle,
    description: tool.metaDescription,
    alternates: alternatesFor(locale, PATH),
  };
}

export default async function PdfMergePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const dict = getDictionary(locale);
  const tool = dict.tools["pdf-merge"];

  return (
    <article className="space-y-10">
      <header className="space-y-3">
        <h1 className="text-3xl font-semibold tracking-tight">{tool.h1}</h1>
        <p className="max-w-2xl text-muted">{tool.lead}</p>
      </header>

      <PdfMerger ui={tool.ui} common={dict.common} errors={dict.pdfErrors} />

      <section className="space-y-4 border-t border-border pt-8 text-sm text-muted">
        {tool.faq.map((entry) => (
          <div key={entry.q}>
            <h2 className="font-medium text-fg">{entry.q}</h2>
            <p className="mt-1">{entry.a}</p>
          </div>
        ))}
      </section>
    </article>
  );
}
