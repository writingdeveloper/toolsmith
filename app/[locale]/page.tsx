import Link from "next/link";
import { notFound } from "next/navigation";
import { JsonLd } from "@/components/JsonLd";
import { getDictionary } from "@/lib/i18n";
import { isLocale } from "@/lib/i18n/config";
import { siteJsonLd } from "@/lib/schema";
import { LIVE_TOOLS, UPCOMING_TOOLS, type Family } from "@/lib/tools";

/** 화면에 놓이는 순서. 검색 수요가 큰 것부터다. */
const FAMILY_ORDER: Family[] = ["image", "pdf", "video", "data"];

const FAMILY_HEADING = {
  image: "familyImage",
  pdf: "familyPdf",
  video: "familyVideo",
  data: "familyData",
} as const;

export default async function Home({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const dict = getDictionary(locale);

  return (
    <div className="space-y-12">
      <JsonLd data={siteJsonLd(locale, dict)} />

      <section className="space-y-4">
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">{dict.home.title}</h1>
        <p className="max-w-2xl text-lg text-muted">{dict.home.lead}</p>
      </section>

      {/*
        * **분류별로 묶는다.** 21개를 한 줄로 늘어놓으면 찾는 사람이 전부 읽어야 한다.
        * 순서는 `FAMILY_ORDER` 가 정하고 이름은 사전이 갖는다 — 도구를 더해도
        * `lib/tools.ts` 의 `family` 만 맞으면 저절로 제자리에 들어간다.
        */}
      <section className="space-y-8">
        <h2 className="sr-only">{dict.home.availableHeading}</h2>
        {FAMILY_ORDER.map((family) => {
          const tools = LIVE_TOOLS.filter((tool) => tool.family === family);
          if (tools.length === 0) return null;
          return (
            <div key={family} className="space-y-4">
              <h3 className="text-sm font-medium tracking-wide text-muted uppercase">
                {dict.home[FAMILY_HEADING[family]]}
              </h3>
              <ul className="grid gap-4 sm:grid-cols-2">
                {tools.map((tool) => (
                  <li key={tool.slug}>
                    <Link
                      href={`/${locale}/tools/${tool.slug}`}
                      className="block h-full rounded-xl border border-border bg-panel p-5 transition-colors hover:border-accent"
                    >
                      <p className="font-medium">{dict.toolNames[tool.slug]}</p>
                      <p className="mt-1 text-sm text-muted">
                        {tool.slug in dict.tools
                          ? dict.tools[tool.slug as keyof typeof dict.tools].blurb
                          : null}
                      </p>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </section>

      <section className="space-y-4">
        <h2 className="text-sm font-medium tracking-wide text-muted uppercase">
          {dict.home.upcomingHeading}
        </h2>
        <ul className="flex flex-wrap gap-2">
          {UPCOMING_TOOLS.map((tool) => (
            <li
              key={tool.slug}
              className="rounded-lg border border-border px-3 py-1.5 text-sm text-muted"
            >
              {dict.toolNames[tool.slug]}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
