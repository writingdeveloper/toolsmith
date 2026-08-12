import Link from "next/link";
import { notFound } from "next/navigation";
import { JsonLd } from "@/components/JsonLd";
import { ToolFinder } from "@/components/ToolFinder";
import { getGuideCopy, GUIDE_LIST } from "@/lib/guides";
import { getDictionary } from "@/lib/i18n";
import { isLocale } from "@/lib/i18n/config";
import { siteJsonLd } from "@/lib/schema";
import { ACCEPT, LIVE_TOOLS, UPCOMING_TOOLS, type Family } from "@/lib/tools";

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
  const guides = getGuideCopy(locale);

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
        <ToolFinder
          label={dict.home.searchLabel}
          placeholder={dict.home.searchPlaceholder}
          empty={dict.home.searchEmpty}
          groups={FAMILY_ORDER.flatMap((family) => {
            const tools = LIVE_TOOLS.filter((tool) => tool.family === family);
            if (tools.length === 0) return [];
            return [
              {
                key: family,
                heading: dict.home[FAMILY_HEADING[family]],
                tools: tools.map((tool) => ({
                  slug: tool.slug,
                  href: `/${locale}/tools/${tool.slug}`,
                  name: dict.toolNames[tool.slug],
                  blurb:
                    tool.slug in dict.tools
                      ? dict.tools[tool.slug as keyof typeof dict.tools].blurb
                      : "",
                  accepts: ACCEPT[tool.slug],
                })),
              },
            ];
          })}
        />
      </section>

      {/*
        * **글로 들어가는 길은 홈에 있어야 한다.** 도구 페이지 꼬리에도 링크가 있지만
        * 그쪽은 그 도구를 다룬 글만 보여 준다. 목록 전체로 가는 길은 여기 하나다.
        */}
      <section className="space-y-4 border-t border-border pt-8">
        <h2 className="text-lg font-medium">{guides.hub.h1}</h2>
        <p className="max-w-2xl text-sm text-muted">{guides.hub.lead}</p>
        <ul className="grid gap-3 sm:grid-cols-2" data-home-guides>
          {GUIDE_LIST.map((meta) => (
            <li key={meta.slug}>
              <Link
                href={`/${locale}/guides/${meta.slug}`}
                className="block rounded-xl border border-border bg-panel p-4 text-sm hover:border-accent"
              >
                {guides.articles[meta.slug].h1}
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {/*
       * **비어 있으면 통째로 사라진다 (2026-08-12).** 21개가 전부 `live` 가 된 순간
       * `UPCOMING_TOOLS` 는 빈 배열이 됐는데 제목은 조건 없이 렌더되고 있었다 —
       * 홈 맨 아래, 푸터 바로 위에 **내용 없는 "Coming soon"** 이 6개 언어 전부에
       * 떠 있었다. 아무것도 안 오는데 곧 온다고 말하는 것은 규칙 3 위반이고,
       * 처음 온 사람에게는 그냥 깨진 화면으로 보인다.
       * 목록이 다시 차면 저절로 돌아온다.
       */}
      {UPCOMING_TOOLS.length > 0 && (
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
      )}
    </div>
  );
}
