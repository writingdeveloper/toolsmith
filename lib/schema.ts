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

/**
 * 만든 주체. `@id` 를 두어 다른 스키마가 이것을 가리킬 수 있게 한다.
 *
 * **평점도 직원 수도 지어내지 않는다.** 확인할 수 있는 것만 적는다.
 */
function publisher() {
  return {
    "@type": "Organization",
    "@id": `${absolute("/")}#org`,
    name: "toolsmith",
    url: absolute("/"),
    logo: { "@type": "ImageObject", url: absolute("/icon-512.png"), width: 512, height: 512 },
  };
}

/** 사이트 전체를 설명한다. 홈에만 넣는다. */
export function siteJsonLd(locale: Locale, dict: Dictionary) {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": `${absolute("/")}#site`,
        name: "toolsmith",
        url: absolute(pathFor(locale)),
        description: dict.site.description,
        inLanguage: HTML_LANG[locale],
        publisher: { "@id": `${absolute("/")}#org` },
      },
      publisher(),
    ],
  };
}

/**
 * 언어 선택 루트(`/`) 용.
 *
 * **여기에는 구조화 데이터가 하나도 없었다(2026-07-28).** 검사 도구는 대개 입력한
 * 도메인의 루트를 보므로, 도구 페이지마다 세 개씩 넣어 두고도 바깥에서는 "JSON-LD 없음"
 * 으로 보였다. 루트는 언어 선택 한 장이라 도구 스키마를 넣을 수 없지만, 사이트와 만든
 * 주체는 여기서도 말할 수 있다.
 */
export function rootJsonLd(dict: Dictionary) {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": `${absolute("/")}#site`,
        name: "toolsmith",
        url: absolute("/"),
        description: dict.site.description,
        publisher: { "@id": `${absolute("/")}#org` },
      },
      publisher(),
    ],
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
