/**
 * 구조화 데이터를 페이지에 심는다. 서버 컴포넌트라 정적 HTML 에 그대로 박힌다.
 * `</script>` 가 값에 섞여 들어와 문서를 깨뜨리지 않도록 막는다.
 */
export function JsonLd({ data }: { data: unknown }) {
  const json = JSON.stringify(data).replace(/</g, "\\u003c");
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: json }} />;
}
