/**
 * 도구 카드 앞에 붙는 그림.
 *
 * **도구마다가 아니라 계열마다 하나다.** 스물한 개에 각각 다른 그림을 그리면 서로
 * 구별은 되지만 **무엇을 뜻하는지는 아무도 못 읽는다** — 카드에 이미 이름과 설명이
 * 글로 있다. 그림이 할 수 있는 일은 "이건 PDF 쪽", "이건 영상 쪽" 을 훑을 때
 * 알려 주는 것뿐이고, 그건 계열 넷이면 된다.
 *
 * **글자를 넣지 않는다.** 6개 언어가 같은 그림을 쓴다.
 * `currentColor` 로 그리므로 밝기 전환에 저절로 따라간다.
 */
const PATHS: Record<string, React.ReactNode> = {
  // 사진 — 액자 안의 산과 해
  image: (
    <>
      <rect x="3" y="4" width="18" height="16" rx="2.5" />
      <circle cx="8.5" cy="9.5" r="1.5" />
      <path d="M3.5 17.5 9 12l4 4 2.5-2.5 5 5" />
    </>
  ),
  // 문서 — 모서리를 접은 종이
  pdf: (
    <>
      <path d="M6 3h8l5 5v13a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Z" />
      <path d="M14 3v5h5" />
      <path d="M8.5 13.5h7M8.5 17h4.5" />
    </>
  ),
  // 영상 — 재생 삼각형이 든 화면
  video: (
    <>
      <rect x="2.5" y="5" width="19" height="14" rx="2.5" />
      <path d="M10.5 9.5 15 12l-4.5 2.5Z" />
    </>
  ),
  // 데이터 — 쌓인 원기둥
  data: (
    <>
      <ellipse cx="12" cy="6" rx="7.5" ry="3" />
      <path d="M4.5 6v6c0 1.7 3.4 3 7.5 3s7.5-1.3 7.5-3V6" />
      <path d="M4.5 12v6c0 1.7 3.4 3 7.5 3s7.5-1.3 7.5-3v-6" />
    </>
  ),
};

export function FamilyIcon({ family }: { family: string }) {
  const paths = PATHS[family];
  if (!paths) return null;
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="size-5 shrink-0 text-muted"
      /* 뜻은 옆의 글이 전부 나른다 — 읽어 주면 같은 말을 두 번 듣게 된다 */
      aria-hidden="true"
      data-family-icon={family}
    >
      {paths}
    </svg>
  );
}
