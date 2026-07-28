/**
 * Lab — 감당할 수 있는 사람만 쓰는 것들.
 *
 * **`lib/tools.ts` 와 섞지 않는다.** 섞는 순간 홈의 도구 목록과 찾기 상자에 874MB 짜리가
 * 끼어들고, `relatedTools`·`CHAINS`·사이트맵의 도구 칸이 전부 그것을 데려간다.
 * 그러면 "이 사이트의 도구" 라는 약속이 조용히 달라진다.
 *
 * **그렇다고 숨기지도 않는다.** `/lab` 은 색인되어야 한다 — 이 층의 목적이 백링크와
 * 화제성이기 때문이다(`docs/TOOLS.md` 의 Tier 3). 링크하지 않는 것은 **Tier 1·2 도구
 * 페이지에서**이고, 푸터와 `/lab` 목록에서는 정상적으로 닿는다.
 *
 * 구별되는 규칙은 하나뿐이다: **누르기 전에 받을 용량을 숫자로 말하고 사용자가 고른다.**
 * 규칙 2("버튼을 누르기 전엔 무거운 자산을 받지 않는다")를 GB 단위로 옮긴 것이다.
 */

export const LAB_SLUGS = ["pii"] as const;

export type LabSlug = (typeof LAB_SLUGS)[number];

export function isLabSlug(value: string): value is LabSlug {
  return (LAB_SLUGS as readonly string[]).includes(value);
}

export interface LabEntry {
  slug: LabSlug;
  /** 받아야 시작할 수 있는 양(바이트). **화면에 그대로 적는다.** */
  bytes: number;
  /** 이 도구가 요구하는 것. 지금은 전부 WebGPU 다. */
  needs: "webgpu";
  /** 받는 형식. 도구의 `ACCEPT` 와 같은 자리다. */
  accept: string;
}

export const LAB: Record<LabSlug, LabEntry> = {
  pii: {
    slug: "pii",
    // lib/pii/pii-core.ts 의 MODEL_BYTES + ENGINE_BYTES
    bytes: 879_600_000,
    needs: "webgpu",
    accept: ".txt,.md,.html,.htm,.pdf",
  },
};

export const LAB_LIST: LabEntry[] = LAB_SLUGS.map((slug) => LAB[slug]);

/** 사람이 읽는 용량. 소수 한 자리까지 — 874MB 를 "0.9GB" 로 적으면 덜 무거워 보인다. */
export function formatBytes(bytes: number): string {
  if (bytes >= 1_000_000_000) return `${(bytes / 1_000_000_000).toFixed(1)}GB`;
  return `${Math.round(bytes / 1_000_000)}MB`;
}
