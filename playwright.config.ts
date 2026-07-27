import { defineConfig, devices } from "@playwright/test";

export const PORT = 3111;

/**
 * BASE_URL 을 주면 dev 서버를 띄우지 않고 그 주소를 그대로 친다.
 * 배포 후 프로덕션에서 같은 스펙을 돌려 실동작을 재확인하는 용도.
 *   BASE_URL=https://toolsmith-two.vercel.app pnpm test
 */
const BASE_URL = process.env.BASE_URL;

export default defineConfig({
  testDir: "./tests",
  fullyParallel: false,
  /*
   * dev 서버를 우리가 띄울 때는 워커를 4개로 묶는다.
   *
   * 기본값(코어의 절반, 이 기계에서는 12)으로 돌리면 `next dev` 한 대에 12개가 동시에
   * 컴파일을 요구하면서 `.next` 의 매니페스트를 쓰는 도중에 읽어 버린다 →
   * 모든 페이지가 `SyntaxError: Unexpected non-whitespace character after JSON` 로
   * 무너진다. 코드 문제로 보이지만 부하 문제다. 4개면 전체가 30초에 끝난다.
   *
   * BASE_URL 로 배포본(정적 파일)을 칠 때는 이 제약이 필요 없다.
   */
  workers: BASE_URL ? undefined : 4,
  /*
   * 워커를 풀기 전에 dev 서버를 데운다. 냉컴파일 경합이 이 저장소에서 가장 자주
   * 사람을 속인 실패다 — "코드가 깨졌다" 처럼 보이지만 부하 문제였다.
   * 손으로 데우던 절차를 여기로 옮겼다. 근거는 tests/global-setup.ts.
   */
  globalSetup: "./tests/global-setup.ts",
  reporter: [["list"]],
  use: {
    baseURL: BASE_URL ?? `http://localhost:${PORT}`,
    trace: "retain-on-failure",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: BASE_URL
    ? undefined
    : {
        command: `pnpm dev --port ${PORT}`,
        url: `http://localhost:${PORT}`,
        reuseExistingServer: true,
        timeout: 120_000,
      },
});
