/**
 * JSON-LD 구조화 데이터.
 *
 * 노리는 것은 리치 결과보다 **GEO** 다 — LLM 이 "브라우저에서 PDF 를 합치는 법"을 물었을 때
 * 이 페이지가 무엇을 하는 도구인지 기계가 읽고 인용할 수 있어야 한다.
 *
 * 없는 것을 지어내지 않는다. 평점(aggregateRating)은 받은 적이 없으므로 넣지 않는다.
 */

import type { Locale } from "./i18n/config";
import { HTML_LANG } from "./i18n/config";
import type { Dictionary } from "./i18n/dictionaries/en";
import { absolute, pathFor } from "./site";

type ToolKey = keyof Dictionary["tools"];

/** 사이트 전체를 설명한다. 홈에만 넣는다. */
export function siteJsonLd(locale: Locale, dict: Dictionary) {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "toolsmith",
    url: absolute(pathFor(locale)),
    description: dict.site.description,
    inLanguage: HTML_LANG[locale],
  };
}

export function toolJsonLd(locale: Locale, dict: Dictionary, slug: ToolKey) {
  const tool = dict.tools[slug];
  const url = absolute(pathFor(locale, `/tools/${slug}`));
  const language = HTML_LANG[locale];

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebApplication",
        name: tool.h1,
        url,
        description: tool.metaDescription,
        inLanguage: language,
        // 설치가 필요 없고 브라우저 안에서 끝난다는 것이 이 도구의 핵심이다
        applicationCategory: "UtilitiesApplication",
        operatingSystem: "Any",
        browserRequirements: "Requires JavaScript and Web Workers",
        isAccessibleForFree: true,
        offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
      },
      {
        "@type": "FAQPage",
        inLanguage: language,
        // 화면에 실제로 보이는 Q&A 와 같은 내용이어야 한다 (구글 정책)
        mainEntity: tool.faq.map((entry) => ({
          "@type": "Question",
          name: entry.q,
          acceptedAnswer: { "@type": "Answer", text: entry.a },
        })),
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "toolsmith",
            item: absolute(pathFor(locale)),
          },
          { "@type": "ListItem", position: 2, name: tool.h1, item: url },
        ],
      },
    ],
  };
}
