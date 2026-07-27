import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    /*
     * Playwright 산출물. 스펙이 한 번이라도 실패하면 트레이스 안의 남의 번들 코드가
     * 여기 떨어지는데, eslint 가 그것을 훑기 시작하면 우리 코드와 무관한 경고가 쏟아지고
     * **스위트가 도는 중에는 파일이 지워져 ENOENT 로 죽는다.** .gitignore 에만 있고
     * 여기 없어서, 실패가 없던 동안 우연히 조용했다 (2026-07-27).
     */
    "test-results/**",
    "playwright-report/**",
  ]),
]);

export default eslintConfig;
