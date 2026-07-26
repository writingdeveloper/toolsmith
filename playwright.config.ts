import { defineConfig, devices } from "@playwright/test";

const PORT = 3111;

/**
 * BASE_URL 을 주면 dev 서버를 띄우지 않고 그 주소를 그대로 친다.
 * 배포 후 프로덕션에서 같은 스펙을 돌려 실동작을 재확인하는 용도.
 *   BASE_URL=https://toolsmith-two.vercel.app pnpm test
 */
const BASE_URL = process.env.BASE_URL;

export default defineConfig({
  testDir: "./tests",
  fullyParallel: false,
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
