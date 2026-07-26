/**
 * 도구 레지스트리 — docs/TOOLS.md 의 코드측 거울.
 * 도구를 추가할 때 이 파일과 docs/TOOLS.md 를 함께 갱신한다.
 *
 * 사람이 읽는 이름과 설명은 여기 없다. 언어마다 달라지므로 `lib/i18n/dictionaries/*`
 * 의 `toolNames` / `tools` 가 갖는다.
 */

export type Tier = 1 | 2 | 3;
export type ToolStatus = "live" | "building" | "planned";

export type ToolSlug =
  | "image-convert"
  | "image-compress"
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
  | "stems";

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
  { slug: "subtitles", tier: 2, status: "planned", needs: "webgpu", family: "video" },
  { slug: "subtitle-translate", tier: 2, status: "planned", needs: "webgpu", family: "video" },
  { slug: "remove-bg", tier: 2, status: "planned", needs: "webgpu", family: "image" },
  { slug: "cutout", tier: 2, status: "planned", needs: "webgpu", family: "image" },
  { slug: "upscale", tier: 2, status: "planned", needs: "webgpu", family: "image" },
  { slug: "stems", tier: 2, status: "planned", needs: "webgpu", family: "video" },
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
