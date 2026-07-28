import { Fragment } from "react";

/**
 * 설명 글 본문의 **강조** 하나만 그린다.
 *
 * **왜 마크다운 라이브러리를 넣지 않는가.** 필요한 것이 이것 하나이고, 파서를 들이면
 * 사전에 없던 문법(링크·이미지·HTML)이 조용히 열린다 — 글은 우리가 쓰지만 그 문법이
 * 열려 있다는 사실 자체가 나중에 실수의 자리가 된다.
 *
 * **왜 필요한가.** 처음에는 본문을 그냥 문자열로 그렸는데, 여섯 언어의 글에 이미
 * `**…**` 가 들어 있어 화면에 **별표가 그대로 찍혔다**(2026-07-28 실측, 프로덕션).
 * 지우는 쪽도 가능했지만 그 강조들은 뜻을 나른다 — "보여 줄 수 있다"와 "만들 수 있다"의
 * 대비처럼.
 *
 * 짝이 안 맞는 `**` 는 **그대로 남긴다.** 조용히 삼키면 글쓴이가 오타를 못 본다.
 */
export function RichText({ text }: { text: string }) {
  // 짝수 번째 조각은 평문, 홀수 번째는 강조. `split` 이 그 순서를 보장한다.
  const parts = text.split(/\*\*(.+?)\*\*/g);
  return (
    <>
      {parts.map((part, index) =>
        index % 2 === 1 ? (
          <strong key={index} className="font-medium text-fg">
            {part}
          </strong>
        ) : (
          <Fragment key={index}>{part}</Fragment>
        ),
      )}
    </>
  );
}
