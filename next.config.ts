import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 상위 디렉터리의 lockfile 때문에 워크스페이스 루트가 잘못 추론되는 것을 막는다.
  turbopack: { root: path.resolve() },

  /**
   * `app/global-not-found.tsx` 를 켠다.
   *
   * 이 저장소에는 `app/layout.tsx` 가 없어서(있으면 6개 언어가 하나의 `<html lang>` 을
   * 공유하게 된다) 평범한 `app/not-found.tsx` 를 놓을 자리가 없다. 이 화면은 자기
   * `<html>` 을 직접 그리므로 루트 레이아웃 없이 성립한다.
   */
  experimental: { globalNotFound: true },

  /**
   * 배포 URL(*.vercel.app)은 본 도메인과 글자 하나까지 같은 문서를 낸다.
   * canonical 이 본 도메인을 가리키긴 하지만 그건 권고일 뿐이라, 색인 자체를 막는다.
   * 정적 라우팅 규칙이라 함수가 돌지 않는다 — "서버 연산 0" 을 깨지 않는다.
   */
  async headers() {
    return [
      {
        source: "/:path*",
        has: [{ type: "host", value: ".*\\.vercel\\.app" }],
        headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }],
      },
    ];
  },
};

export default nextConfig;
