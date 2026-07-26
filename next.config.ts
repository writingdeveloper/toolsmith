import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 상위 디렉터리의 lockfile 때문에 워크스페이스 루트가 잘못 추론되는 것을 막는다.
  turbopack: { root: path.resolve() },

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
