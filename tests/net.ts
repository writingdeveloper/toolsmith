/**
 * 분석 태그가 내는 요청인가.
 *
 * 도구 스펙의 "파일이 네트워크로 나가지 않는다" 검사에서 걸러내기 위한 것이다.
 * GA 는 페이지뷰 텔레메트리라 파일 데이터와 무관하지만, **정말 무관한지**는
 * 믿지 않고 `tests/analytics.spec.ts` 가 요청 내용을 직접 뒤져서 확인한다.
 */
export function isAnalytics(url: string): boolean {
  return /google-analytics\.com|googletagmanager\.com|analytics\.google\.com|doubleclick\.net/.test(
    url,
  );
}
