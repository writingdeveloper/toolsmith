/**
 * 도구 레지스트리 — docs/TOOLS.md 의 코드측 거울.
 * 도구를 추가할 때 이 파일과 docs/TOOLS.md 를 함께 갱신한다.
 */

export type Tier = 1 | 2 | 3;
export type ToolStatus = "live" | "building" | "planned";

export interface Tool {
  slug: string;
  name: string;
  blurb: string;
  tier: Tier;
  status: ToolStatus;
  /** 브라우저 요구사항 — 사용자에게 그대로 노출된다 */
  needs: "all" | "webgpu";
}

export const TOOLS: Tool[] = [
  // Tier 1 — WASM/CPU. 전 기기.
  {
    slug: "image-convert",
    name: "이미지 변환·압축",
    blurb: "HEIC·PNG·JPG·WebP·AVIF 상호 변환, 품질 압축, 리사이즈. 여러 장 한 번에.",
    tier: 1,
    status: "live",
    needs: "all",
  },
  { slug: "video-convert", name: "영상 변환", blurb: "MP4·WebM·MOV 변환", tier: 1, status: "planned", needs: "all" },
  { slug: "video-compress", name: "영상 압축", blurb: "용량 줄이기", tier: 1, status: "planned", needs: "all" },
  { slug: "video-trim", name: "영상 자르기", blurb: "구간 트림", tier: 1, status: "planned", needs: "all" },
  { slug: "video-to-gif", name: "영상 → GIF", blurb: "GIF 변환", tier: 1, status: "planned", needs: "all" },
  { slug: "audio-extract", name: "오디오 추출·변환", blurb: "MP3·WAV·M4A", tier: 1, status: "planned", needs: "all" },
  {
    slug: "pdf-merge",
    name: "PDF 병합",
    blurb: "여러 PDF를 원하는 순서로 하나로. 재렌더링 없이 원본 그대로 이어 붙입니다.",
    tier: 1,
    status: "live",
    needs: "all",
  },
  { slug: "pdf-split", name: "PDF 분할", blurb: "페이지 단위 분리", tier: 1, status: "planned", needs: "all" },
  { slug: "pdf-compress", name: "PDF 압축", blurb: "용량 줄이기", tier: 1, status: "planned", needs: "all" },
  { slug: "ocr", name: "이미지 → 텍스트", blurb: "OCR 문자 인식", tier: 1, status: "planned", needs: "all" },
  { slug: "data-query", name: "CSV·Parquet 쿼리", blurb: "브라우저에서 SQL", tier: 1, status: "planned", needs: "all" },

  // Tier 2 — WebGPU AI. 데스크톱.
  { slug: "subtitles", name: "자막 생성", blurb: "음성을 텍스트로", tier: 2, status: "planned", needs: "webgpu" },
  { slug: "subtitle-translate", name: "자막 번역", blurb: "56개 언어", tier: 2, status: "planned", needs: "webgpu" },
  { slug: "remove-bg", name: "배경 제거", blurb: "인물·사물 누끼", tier: 2, status: "planned", needs: "webgpu" },
  { slug: "cutout", name: "클릭 컷아웃", blurb: "클릭한 객체만 오려내기", tier: 2, status: "planned", needs: "webgpu" },
  { slug: "upscale", name: "이미지 업스케일", blurb: "4배 확대", tier: 2, status: "planned", needs: "webgpu" },
  { slug: "stems", name: "스템 분리", blurb: "보컬·반주 분리", tier: 2, status: "planned", needs: "webgpu" },
];

export const LIVE_TOOLS = TOOLS.filter((t) => t.status === "live");
export const UPCOMING_TOOLS = TOOLS.filter((t) => t.status !== "live");

export function getTool(slug: string): Tool | undefined {
  return TOOLS.find((t) => t.slug === slug);
}
