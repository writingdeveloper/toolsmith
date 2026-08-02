/**
 * 설명 글 레지스트리 — 도구가 아닌 것이 사이트에 생기는 첫 자리다.
 *
 * **왜 도구 페이지로는 안 되는가.** 처음에는 이렇게 적어 두었다 — "도구 페이지가 전부
 * '무엇을 하는 곳' 이라 검색에서 잡히는 질문이 **거래형**(`heic to jpg` 같은 것)뿐이고,
 * 그 앞에 오는 질문에는 답할 페이지가 없었다."
 *
 * **절반이 틀렸다 (2026-08-01, 첫 질의 데이터).** 거래형으로도 잡히고 있지 않았다.
 * 질의 36개 중 **35개가 정보형**이었고 `heic to jpg` · `merge pdf` 류는 **한 건도**
 * 나오지 않았다. 노출 65 중 **59(91%)가 글 다섯 쪽**으로 갔고 도구 21개가 합쳐서 7 이다.
 *
 * 그러니 글은 "비는 앞자리를 메우는 것" 이 아니라 **우리가 실제로 경쟁 가능한 유일한
 * 자리**다. 거래형 낱말은 iLovePDF·Smallpdf 가 앉아 있어 새 사이트가 낄 틈이 없다.
 * 이 사실이 다음 묶음을 고르는 방식을 바꿨다 — 아래 네 번째 묶음 주석 참고.
 *
 * **일부러 도구와 다른 말을 겨눈다.** 같은 낱말을 노리면 우리 두 페이지가 서로를
 * 밀어낸다(카니벌라이제이션). 글은 "왜/무엇" 에 답하고 끝에서 도구로 보낸다.
 *
 * 사람이 읽는 글은 여기 없다 — 언어마다 다르므로 `lib/guides/{locale}.ts` 가 갖는다.
 * 이 파일에는 **언어와 무관한 것만** 둔다: 어떤 글이 있고, 어느 도구를 가리키며,
 * 언제 손봤는가.
 */

import type { ToolSlug } from "@/lib/tools";

export const GUIDE_SLUGS = [
  "what-is-heic",
  "image-formats",
  "why-pdf-is-large",
  "mov-vs-mp4",
  "how-background-removal-works",
  "does-upscaling-add-detail",
  "srt-vs-vtt",
  "what-are-stems",
  "why-pdf-wont-open",
  "csv-vs-excel",
  "can-ai-summarize",
  "wav-vs-mp3",
  "what-is-a-codec",
  "why-video-is-sideways",
] as const;

export type GuideSlug = (typeof GUIDE_SLUGS)[number];

export function isGuideSlug(value: string): value is GuideSlug {
  return (GUIDE_SLUGS as readonly string[]).includes(value);
}

export interface GuideMeta {
  slug: GuideSlug;
  /** 처음 낸 날. `datePublished` 로 나간다. */
  published: string;
  /**
   * 마지막으로 내용을 손본 날. `dateModified` 로 나가고 사이트맵의 `lastmod` 가 된다.
   *
   * **빌드 시각을 쓰지 않는다.** 글을 안 고쳤는데 배포할 때마다 날짜가 바뀌면
   * 크롤러에게 거짓말을 하는 것이고, 반복되면 lastmod 자체를 안 믿게 된다.
   */
  updated: string;
  /** 이 글이 끝에서 보내는 도구. 순서가 화면 순서다. */
  tools: ToolSlug[];
}

export const GUIDES: Record<GuideSlug, GuideMeta> = {
  "what-is-heic": {
    slug: "what-is-heic",
    published: "2026-07-28",
    updated: "2026-07-28",
    tools: ["image-convert", "image-compress", "image-resize"],
  },
  "image-formats": {
    slug: "image-formats",
    published: "2026-07-28",
    updated: "2026-07-28",
    tools: ["image-convert", "image-compress", "image-resize"],
  },
  "why-pdf-is-large": {
    slug: "why-pdf-is-large",
    published: "2026-07-28",
    updated: "2026-07-28",
    tools: ["pdf-compress", "pdf-split", "pdf-organize", "ocr"],
  },
  "mov-vs-mp4": {
    slug: "mov-vs-mp4",
    published: "2026-07-28",
    updated: "2026-07-28",
    tools: ["video-convert", "video-compress", "video-trim", "video-to-gif"],
  },

  /*
   * 두 번째 묶음(2026-07-28). **Tier 2 도구를 다룬 글이 하나도 없었다** — 이 사이트에서
   * 가장 차별화된 도구들인데 첫 넷이 전부 Tier 1(이미지·PDF·영상 형식) 이었다.
   *
   * 이쪽 글은 성격이 조금 다르다. 형식 글은 "무엇이 다른가" 에 답하면 끝나지만,
   * 모델 도구는 **무엇을 못 하는가**가 본론이다 — 되살리는 것이 아니라 지어내는 것,
   * 하나를 찾는 모델이라 군중에서는 못 찾는 것, 섞인 소리를 되꺼내는 것이 복구가 아니라
   * 추정인 것. 규칙 3 이 글에서 가장 크게 걸리는 자리다.
   */
  "how-background-removal-works": {
    slug: "how-background-removal-works",
    published: "2026-07-28",
    updated: "2026-07-28",
    tools: ["remove-bg", "cutout", "image-convert"],
  },
  "does-upscaling-add-detail": {
    slug: "does-upscaling-add-detail",
    published: "2026-07-28",
    updated: "2026-07-28",
    tools: ["upscale", "image-resize", "image-compress"],
  },
  "srt-vs-vtt": {
    slug: "srt-vs-vtt",
    published: "2026-07-28",
    updated: "2026-07-28",
    tools: ["subtitles", "subtitle-translate"],
  },
  "what-are-stems": {
    slug: "what-are-stems",
    published: "2026-07-28",
    updated: "2026-07-28",
    tools: ["stems", "audio-extract"],
  },

  /*
   * 세 번째 묶음(2026-07-28). **글이 없는 도구를 세어서 골랐다** — 짐작이 아니라
   * `guidesForTool` 이 비는 자리를 계산해서 나온 셋이다(pdf-merge · data-query ·
   * summarize). 검색 데이터가 아직 없으니 그 다음으로 확실한 근거는 "우리 도구 중
   * 아무도 설명하지 않은 것" 이다.
   */
  "why-pdf-wont-open": {
    slug: "why-pdf-wont-open",
    published: "2026-07-28",
    updated: "2026-07-28",
    tools: ["pdf-merge", "pdf-organize", "pdf-split", "pdf-compress"],
  },
  "csv-vs-excel": {
    slug: "csv-vs-excel",
    published: "2026-07-28",
    updated: "2026-07-28",
    tools: ["data-query"],
  },
  "can-ai-summarize": {
    slug: "can-ai-summarize",
    published: "2026-07-28",
    updated: "2026-07-28",
    tools: ["summarize", "ocr"],
  },

  /*
   * 네 번째 묶음(2026-08-01). **처음으로 감이 아니라 질의로 골랐다.** 앞의 셋은 각각
   * 짐작 · Tier 2 가 비어서 · 글 없는 도구를 세어서 골랐고, 이번에는 Search Console 이
   * 실제로 보여 준 36개 질의에서 골랐다.
   *
   * | 묶음 | 질의 | 노출 | 받던 페이지 |
   * |---|---|---|---|
   * | 음악 스템 | 18 | **32** | `what-are-stems` |
   * | MOV·MP4 | 9 | 11 | `mov-vs-mp4` |
   * | PDF 안 열림 · HEIC · SRT | 8 | 9 | 각자의 글 |
   *
   * **주의해서 읽어야 한다.** 보이는 질의는 전부 *이미 우리가 쓴 글*의 질의다 —
   * 구글은 "무엇이 비었나" 가 아니라 "무엇이 먹히나" 를 말한 것이다. 그래서 없는
   * 수요를 상상하지 않고 **먹히는 두 묶음의 이웃**만 골랐다: 소리 하나, 영상 둘.
   *
   * **낱말이 겹치지 않게 골랐다.** `wav-vs-mp3` 는 형식이고 `what-are-stems` 는 분리다.
   * `what-is-a-codec` 은 코덱이고 `mov-vs-mp4` 는 상자다 — 오히려 저쪽이 왜 그런지를
   * 이쪽이 설명한다. `why-video-is-sideways` 는 아무 글도 건드린 적 없는 문제형이다.
   */
  "wav-vs-mp3": {
    slug: "wav-vs-mp3",
    published: "2026-08-01",
    updated: "2026-08-01",
    tools: ["audio-extract", "stems"],
  },
  "what-is-a-codec": {
    slug: "what-is-a-codec",
    published: "2026-08-01",
    updated: "2026-08-01",
    tools: ["video-convert", "video-compress", "audio-extract"],
  },
  "why-video-is-sideways": {
    slug: "why-video-is-sideways",
    published: "2026-08-01",
    updated: "2026-08-01",
    tools: ["video-convert", "video-trim", "video-compress", "video-to-gif"],
  },
};

export const GUIDE_LIST: GuideMeta[] = GUIDE_SLUGS.map((slug) => GUIDES[slug]);

/**
 * 이 도구를 다룬 글. 도구 페이지 아래에 놓는다.
 *
 * **방향을 뒤집어 계산한다.** 글마다 `tools` 를 적어 두고 도구마다 `guides` 를 또
 * 적으면 같은 판단이 두 곳에 살게 되고, 언젠가 한 곳만 고쳐진다.
 */
export function guidesForTool(slug: ToolSlug): GuideMeta[] {
  return GUIDE_LIST.filter((guide) => guide.tools.includes(slug));
}

export interface GuideSection {
  h2: string;
  body: string[];
  /** 문단 뒤에 붙는 목록. 없으면 안 그린다. */
  list?: string[];
}

export interface GuideArticle {
  /** `%s | toolsmith` 가 붙어 나간다 — 48자를 넘으면 검색결과에서 잘린다. */
  metaTitle: string;
  metaDescription: string;
  h1: string;
  lead: string;
  sections: GuideSection[];
  faq: { q: string; a: string }[];
}

export interface GuideCopy {
  hub: {
    metaTitle: string;
    metaDescription: string;
    h1: string;
    lead: string;
    /** breadcrumb 과 도구 페이지의 링크에 함께 쓴다 */
    breadcrumb: string;
    /** 글 아래 "지금 해 보기" */
    toolsHeading: string;
    /** 도구 페이지 아래 "읽어 둘 만한 글" */
    relatedHeading: string;
    updatedLabel: string;
  };
  articles: Record<GuideSlug, GuideArticle>;
}
