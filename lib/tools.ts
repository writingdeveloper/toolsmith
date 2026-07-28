/**
 * 도구 레지스트리 — docs/TOOLS.md 의 코드측 거울.
 * 도구를 추가할 때 이 파일과 docs/TOOLS.md 를 함께 갱신한다.
 *
 * 사람이 읽는 이름과 설명은 여기 없다. 언어마다 달라지므로 `lib/i18n/dictionaries/*`
 * 의 `toolNames` / `tools` 가 갖는다.
 */

import { acceptsFile } from "./handoff";

export type Tier = 1 | 2 | 3;
export type ToolStatus = "live" | "building" | "planned";

export type ToolSlug =
  | "image-convert"
  | "image-compress"
  | "image-resize"
  | "video-convert"
  | "video-compress"
  | "video-trim"
  | "video-to-gif"
  | "audio-extract"
  | "pdf-merge"
  | "pdf-split"
  | "pdf-organize"
  | "pdf-compress"
  | "ocr"
  | "data-query"
  | "subtitles"
  | "subtitle-translate"
  | "remove-bg"
  | "cutout"
  | "upscale"
  | "stems"
  | "summarize";

/** 무엇을 다루는 도구인가. 관련 도구를 고르는 데만 쓴다. */
export type Family = "image" | "video" | "pdf" | "data";

export interface Tool {
  slug: ToolSlug;
  tier: Tier;
  status: ToolStatus;
  /** 브라우저 요구사항 — 사용자에게 그대로 노출된다 */
  needs: "all" | "webgpu";
  family: Family;
}

export const TOOLS: Tool[] = [
  // Tier 1 — WASM/CPU. 전 기기.
  { slug: "image-convert", tier: 1, status: "live", needs: "all", family: "image" },
  { slug: "image-compress", tier: 1, status: "live", needs: "all", family: "image" },
  { slug: "image-resize", tier: 1, status: "live", needs: "all", family: "image" },
  { slug: "pdf-merge", tier: 1, status: "live", needs: "all", family: "pdf" },
  { slug: "pdf-split", tier: 1, status: "live", needs: "all", family: "pdf" },
  { slug: "pdf-organize", tier: 1, status: "live", needs: "all", family: "pdf" },
  { slug: "pdf-compress", tier: 1, status: "live", needs: "all", family: "pdf" },
  { slug: "video-compress", tier: 1, status: "live", needs: "all", family: "video" },
  { slug: "audio-extract", tier: 1, status: "live", needs: "all", family: "video" },
  { slug: "video-to-gif", tier: 1, status: "live", needs: "all", family: "video" },
  { slug: "video-trim", tier: 1, status: "live", needs: "all", family: "video" },
  { slug: "video-convert", tier: 1, status: "live", needs: "all", family: "video" },
  { slug: "ocr", tier: 1, status: "live", needs: "all", family: "pdf" },
  { slug: "data-query", tier: 1, status: "live", needs: "all", family: "data" },

  // Tier 2 — WebGPU AI. 데스크톱.
  //
  // remove-bg 의 needs 가 "all" 인 것은 오타가 아니다. WebGPU 가 있으면 그리로 가고
  // 없으면 wasm 으로 내려가 **끝까지 돈다**(느릴 뿐이다). 할 수 있는 것을 못 한다고
  // 적는 것도 규칙 3 위반이다 — 어느 쪽으로 돌았는지는 결과 옆에 그대로 적는다.
  { slug: "remove-bg", tier: 2, status: "live", needs: "all", family: "image" },
  { slug: "upscale", tier: 2, status: "live", needs: "all", family: "image" },
  { slug: "cutout", tier: 2, status: "live", needs: "all", family: "image" },
  { slug: "subtitles", tier: 2, status: "live", needs: "all", family: "video" },
  // 번역만은 **WebGPU 로 갈 수 없다** — 유일하게 도는 조합이 CPU 다.
  // 근거는 lib/translate/translate-core.ts 의 실측 5번.
  { slug: "subtitle-translate", tier: 2, status: "live", needs: "all", family: "video" },
  // 스템 분리도 **CPU 로만 간다** — 실측하고 결과를 숫자로 확인한 것이 wasm 경로뿐이다.
  { slug: "stems", tier: 2, status: "live", needs: "all", family: "video" },
  //
  // **`needs: "webgpu"` 를 쓰는 첫 도구다.** 앞의 여섯은 GPU 가 없으면 CPU 로 내려가
  // 느릴 뿐 끝까지 돌았지만, 이것은 내려갈 곳이 없다 — 내보내기가 쓰는 연산이
  // wasm EP 에 아예 없다. 근거는 lib/summarize/summarize-core.ts 의 실측 6번.
  { slug: "summarize", tier: 2, status: "live", needs: "webgpu", family: "pdf" },
];

export const LIVE_TOOLS = TOOLS.filter((t) => t.status === "live");
export const UPCOMING_TOOLS = TOOLS.filter((t) => t.status !== "live");

export function getTool(slug: string): Tool | undefined {
  return TOOLS.find((t) => t.slug === slug);
}

/**
 * 이 도구 옆에 놓을 다른 도구들.
 *
 * 도구 페이지가 서로를 가리키지 않으면 **하나하나가 막다른 길**이 된다. 크롤러는
 * 홈에서 한 번 내려온 뒤 더 갈 곳이 없고, 한 가지 일을 끝낸 사람도 다음 도구를 못 찾는다.
 * (2026-07-26 실측: 도구 페이지의 내부 링크가 홈 1개 + 자기 언어판 6개뿐이었다.)
 *
 * 같은 갈래를 먼저 채우고, 모자라면 등록 순서대로 메운다 — 어느 페이지든 최소 개수를
 * 보장해야 크롤 경로가 끊기지 않는다.
 */
export function relatedTools(slug: ToolSlug, count = 4): Tool[] {
  const self = getTool(slug);
  const others = LIVE_TOOLS.filter((tool) => tool.slug !== slug);
  const sameFamily = self ? others.filter((tool) => tool.family === self.family) : [];
  const rest = others.filter((tool) => !sameFamily.includes(tool));
  return [...sameFamily, ...rest].slice(0, count);
}

/**
 * 도구마다 받는 파일 — `<input accept>` 에 그대로 들어간다.
 *
 * **여기 있는 이유.** 예전에는 스물한 개 컴포넌트가 각자 문자열을 들고 있었다. 결과를
 * 다른 도구로 넘기려면 **넘길 곳이 그것을 받는지** 미리 알아야 하는데, 그 앎이 컴포넌트
 * 안에만 있으면 보내는 쪽이 알 길이 없다. 못 받는 것을 보내기 목록에 띄우는 것은 규칙 3
 * 위반이므로, 판단이 한 곳에 있어야 한다.
 */
export const ACCEPT: Record<ToolSlug, string> = {
  "image-convert": "image/*,.heic,.heif",
  "image-compress": "image/*,.heic,.heif",
  "image-resize": "image/*,.heic,.heif",
  "remove-bg": "image/*",
  cutout: "image/*",
  upscale: "image/*",
  "video-convert": "video/mp4,video/quicktime,.mp4,.mov,.m4v",
  "video-compress": "video/mp4,video/quicktime,.mp4,.mov,.m4v",
  "video-trim": "video/mp4,video/quicktime,.mp4,.mov,.m4v",
  "video-to-gif": "video/mp4,video/quicktime,.mp4,.mov,.m4v",
  "audio-extract": "video/mp4,video/quicktime,audio/mp4,.mp4,.mov,.m4v,.m4a",
  subtitles: "video/mp4,video/quicktime,audio/mp4,audio/x-m4a,audio/wav,audio/mpeg,.mp3",
  stems: "video/mp4,video/quicktime,audio/mp4,audio/x-m4a,audio/wav,audio/mpeg,.mp3",
  "subtitle-translate": ".srt,.vtt,text/vtt,application/x-subrip",
  "pdf-merge": "application/pdf,.pdf",
  "pdf-split": "application/pdf,.pdf",
  "pdf-organize": "application/pdf,.pdf",
  "pdf-compress": "application/pdf,.pdf",
  ocr: "image/*,application/pdf,.pdf",
  summarize: ".txt,.md,.html,.htm,.pdf",
  "data-query": ".csv,.tsv,.txt,.parquet,.json,.jsonl,.ndjson",
};

/**
 * 만든 것을 이어서 넣을 만한 도구.
 *
 * **`relatedTools` 와 다른 것이다.** 저쪽은 "옆에 있는 도구"(같은 갈래)라 크롤 경로와
 * 둘러보기를 위한 것이고, 이쪽은 **실제로 이어지는 작업 순서**다. 영상을 자른 다음에
 * 압축하고, 소리를 뽑은 다음에 자막을 만들고, 자막을 만든 다음에 번역한다.
 *
 * 여기 적힌 것은 **후보**일 뿐이다. 실제로 보여 줄지는 만들어진 파일이 대상의 `ACCEPT`
 * 에 걸리는지로 갈린다 — 영상 변환이 WebM 을 내놓으면 MP4 만 받는 자르기·압축은
 * 저절로 목록에서 빠진다. 갈래마다 형식이 갈리는 도구가 여럿이라 **표만으로는 못 정한다.**
 */
export const CHAINS: Partial<Record<ToolSlug, ToolSlug[]>> = {
  "video-trim": ["video-compress", "video-to-gif", "audio-extract", "subtitles"],
  "video-convert": ["video-compress", "video-trim", "video-to-gif"],
  "video-compress": ["video-trim", "video-to-gif", "audio-extract"],
  "audio-extract": ["subtitles", "stems"],
  subtitles: ["subtitle-translate"],
  ocr: ["summarize"],
  "pdf-merge": ["pdf-split", "pdf-organize", "pdf-compress"],
  "pdf-split": ["pdf-merge", "pdf-organize", "pdf-compress", "ocr"],
  "pdf-organize": ["pdf-compress", "pdf-split", "ocr"],
  "pdf-compress": ["pdf-merge", "pdf-organize", "pdf-split"],
  "remove-bg": ["upscale", "image-convert", "image-resize"],
  cutout: ["upscale", "image-convert"],
  upscale: ["image-compress", "image-convert", "image-resize"],
  "image-convert": ["image-compress", "image-resize"],
  "image-resize": ["image-compress", "image-convert"],
  "image-compress": ["image-resize", "image-convert"],
};

/**
 * 이 결과를 이어서 넣을 수 있는 도구. 만들어진 파일을 실제로 받는 것만 남긴다.
 *
 * `acceptsFile` 은 `lib/handoff.ts` 에 있고 그쪽은 여기서 **타입만** 가져간다
 * (`import type` 은 컴파일에서 지워진다) — 실행 시점의 순환 참조가 아니다.
 */
export function chainTargets(slug: ToolSlug, produced: { name: string; type: string }): ToolSlug[] {
  return (CHAINS[slug] ?? []).filter((target) => acceptsFile(ACCEPT[target], produced));
}
