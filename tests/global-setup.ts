/**
 * 워커를 풀기 전에 dev 서버를 데운다.
 *
 * **왜 필요한가.** `next dev` 는 요청이 처음 닿는 순간 그 라우트를 컴파일하고, 그동안
 * `.next` 의 매니페스트를 다시 쓴다. 워커 4개가 서로 다른 페이지를 동시에 처음 요청하면
 * 한쪽이 쓰는 중인 매니페스트를 다른 쪽이 읽어 전 페이지가
 * `SyntaxError: Unexpected non-whitespace character after JSON` 으로 죽는다.
 * 코드 문제로 보이지만 부하 문제다.
 *
 * 워커 수를 4로 묶어 두었는데도 2026-07-26 에 도구가 16개(페이지 108개)가 되면서 다시
 * 터졌다. 손으로 "가벼운 스펙을 먼저 돌려 데운다" 로 우회하고 있었는데, 그것을 여기로
 * 옮겼다. **사람이 기억해야 지켜지는 규칙은 언젠가 안 지켜진다.**
 *
 * 라우트 모듈은 언어와 무관하게 하나다(`app/[locale]/tools/<slug>/page.tsx`). 그래서
 * 한 언어만 훑으면 전부 컴파일된다 — 108개가 아니라 18개면 된다.
 */

import { LIVE_TOOLS } from "../lib/tools";
import { PORT } from "../playwright.config";

/** 컴파일이 끝날 때까지 기다린다. 냉컴파일은 한 페이지에 몇 초가 걸릴 수 있다. */
const PAGE_TIMEOUT = 90_000;

async function get(url: string, timeout: number): Promise<number | null> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);
  try {
    const response = await fetch(url, { signal: controller.signal });
    // 본문까지 받아야 SSR 이 끝난다 — 헤더만 보고 넘기면 컴파일이 안 끝난 채로 지나간다
    await response.text();
    return response.status;
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

export default async function globalSetup() {
  // 배포본은 정적 파일이라 데울 것이 없다
  if (process.env.BASE_URL) return;

  const base = `http://localhost:${PORT}`;

  // webServer 가 아직 안 떴을 수 있다. 뜰 때까지 기다린 뒤에 데운다.
  const deadline = Date.now() + 120_000;
  while (Date.now() < deadline) {
    if ((await get(`${base}/`, 10_000)) !== null) break;
    await new Promise((resolve) => setTimeout(resolve, 500));
  }

  const paths = ["/ko", ...LIVE_TOOLS.map((tool) => `/ko/tools/${tool.slug}`)];
  const started = Date.now();
  const failed: string[] = [];
  for (const path of paths) {
    const status = await get(base + path, PAGE_TIMEOUT);
    if (status !== 200) failed.push(`${path}${status === null ? "" : ` (${status})`}`);
  }

  const seconds = ((Date.now() - started) / 1000).toFixed(1);
  console.log(`dev 서버 워밍: 라우트 ${paths.length}개 ${seconds}초`);
  if (failed.length > 0) {
    // 여기서 던지지 않는다 — 스펙이 같은 페이지를 다시 쳐서 제대로 된 오류를 낼 것이다.
    console.log(`  데우지 못한 경로: ${failed.join(", ")}`);
  }
}
