import Link from "next/link";
import { getGuideCopy, guidesForTool } from "@/lib/guides";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries/en";
import { relatedTools, type ToolSlug } from "@/lib/tools";

/**
 * 도구 페이지 아래에 놓는 "다음에 쓸 만한 것".
 *
 * 이것이 없으면 도구 페이지가 전부 막다른 길이다 — 크롤러도 사람도 홈으로 되돌아가야만
 * 다음으로 갈 수 있다. 12개가 서로를 가리키면 크롤 경로가 이어지고, 한 가지 일을 끝낸
 * 사람이 다음 일을 그 자리에서 찾는다.
 *
 * 서버 컴포넌트다 — 링크는 HTML 안에 있어야 크롤러가 본다.
 */
export function RelatedTools({
  locale,
  slug,
  dict,
}: {
  locale: Locale;
  slug: ToolSlug;
  dict: Dictionary;
}) {
  const tools = relatedTools(slug);
  if (tools.length === 0) return null;

  /*
   * **글로 나가는 길도 여기서 낸다 (2026-07-28).**
   *
   * 이 자리가 스물한 도구가 전부 그리는 유일한 공통 꼬리다. 도구 페이지 21개에
   * 각자 링크를 박으면 글을 하나 더할 때마다 21곳을 고쳐야 하고, 그러면 언젠가
   * 한 곳이 빠진다 — 이 저장소에서 두 번 이상 겪은 실패다.
   */
  const guideCopy = getGuideCopy(locale);
  const guides = guidesForTool(slug);

  return (
    <>
      <section className="space-y-4 border-t border-border pt-8">
        <h2 className="text-lg font-medium">{dict.common.relatedHeading}</h2>
        <ul className="grid gap-3 sm:grid-cols-2">
          {tools.map((tool) => (
            <li key={tool.slug}>
              <Link
                href={`/${locale}/tools/${tool.slug}`}
                className="block rounded-xl border border-border bg-panel p-4 hover:border-accent"
              >
                <span className="block font-medium">{dict.toolNames[tool.slug]}</span>
                <span className="mt-1 block text-sm text-muted">
                  {dict.tools[tool.slug as keyof Dictionary["tools"]]?.blurb}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {guides.length > 0 && (
        <section className="space-y-3 border-t border-border pt-8" data-tool-guides>
          <h2 className="text-lg font-medium">{guideCopy.hub.relatedHeading}</h2>
          <ul className="space-y-2 text-sm">
            {guides.map((guide) => (
              <li key={guide.slug}>
                <Link href={`/${locale}/guides/${guide.slug}`} className="hover:text-accent">
                  {guideCopy.articles[guide.slug].h1}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </>
  );
}
