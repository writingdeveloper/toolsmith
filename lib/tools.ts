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
  | "video-convert"
  | "video-compress"
  | "video-trim"
  | "video-to-gif"
  | "audio-extract"
  | "pdf-merge"
  | "pdf-split"
  | "pdf-compress"
  | "ocr"
  | "data-query"
  | "subtitles"
  | "subtitle-translate"
  | "remove-bg"
  | "cutout"
  | "upscale"
  | "stems";

export interface Tool {
  slug: ToolSlug;
  tier: Tier;
  status: ToolStatus;
  /** 브라우저 요구사항 — 사용자에게 그대로 노출된다 */
  needs: "all" | "webgpu";
}

export const TOOLS: Tool[] = [
  // Tier 1 — WASM/CPU. 전 기기.
  { slug: "image-convert", tier: 1, status: "live", needs: "all" },
  { slug: "pdf-merge", tier: 1, status: "live", needs: "all" },
  { slug: "pdf-split", tier: 1, status: "live", needs: "all" },
  { slug: "video-convert", tier: 1, status: "planned", needs: "all" },
  { slug: "video-compress", tier: 1, status: "planned", needs: "all" },
  { slug: "video-trim", tier: 1, status: "planned", needs: "all" },
  { slug: "video-to-gif", tier: 1, status: "planned", needs: "all" },
  { slug: "audio-extract", tier: 1, status: "planned", needs: "all" },
  { slug: "pdf-compress", tier: 1, status: "planned", needs: "all" },
  { slug: "ocr", tier: 1, status: "planned", needs: "all" },
  { slug: "data-query", tier: 1, status: "planned", needs: "all" },

  // Tier 2 — WebGPU AI. 데스크톱.
  { slug: "subtitles", tier: 2, status: "planned", needs: "webgpu" },
  { slug: "subtitle-translate", tier: 2, status: "planned", needs: "webgpu" },
  { slug: "remove-bg", tier: 2, status: "planned", needs: "webgpu" },
  { slug: "cutout", tier: 2, status: "planned", needs: "webgpu" },
  { slug: "upscale", tier: 2, status: "planned", needs: "webgpu" },
  { slug: "stems", tier: 2, status: "planned", needs: "webgpu" },
];

export const LIVE_TOOLS = TOOLS.filter((t) => t.status === "live");
export const UPCOMING_TOOLS = TOOLS.filter((t) => t.status !== "live");

export function getTool(slug: string): Tool | undefined {
  return TOOLS.find((t) => t.slug === slug);
}
