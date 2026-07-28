import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Breadcrumb } from "@/components/Breadcrumb";
import { LabGate } from "@/components/LabGate";
import { getDictionary } from "@/lib/i18n";
import { isLocale, LOCALES } from "@/lib/i18n/config";
import { LAB } from "@/lib/lab";
import { alternatesFor, socialFor } from "@/lib/site";
import { PiiFinder } from "./PiiFinder";

const PATH = "/lab/pii";

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
  const copy = getDictionary(locale).lab.entries.pii;
  return {
    title: copy.metaTitle,
    description: copy.metaDescription,
    alternates: alternatesFor(locale, PATH),
    ...socialFor(locale, copy.metaTitle, copy.metaDescription, PATH),
  };
}

export default async function PiiPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const dict = getDictionary(locale);
  const { lab } = dict;
  const copy = lab.entries.pii;

  return (
    <div className="space-y-8">
      <Breadcrumb
        locale={locale}
        label={dict.common.breadcrumbLabel}
        current={copy.h1}
        trail={[{ name: lab.h1, href: `/${locale}/lab` }]}
      />

      <header className="space-y-4">
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">{copy.h1}</h1>
        <p className="max-w-2xl text-lg text-muted">{copy.lead}</p>
      </header>

      {/*
        **문을 지나야 도구가 마운트된다.** 그래야 워커도, CDN 도, 874MB 도 그 전에는
        건드려지지 않는다 — 규칙 2 를 GB 단위로 옮긴 것이 이 층의 전부다.
      */}
      <LabGate bytes={LAB.pii.bytes} copy={lab}>
        <PiiFinder copy={copy} />
      </LabGate>
    </div>
  );
}
