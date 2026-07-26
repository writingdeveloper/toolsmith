import type { Metadata } from "next";
import { PdfSplitter } from "./PdfSplitter";

export const metadata: Metadata = {
  title: "PDF 분할 — 페이지 추출·낱장 분리",
  description:
    "PDF에서 원하는 페이지만 뽑거나 모든 페이지를 한 장씩 쪼갭니다. 업로드 없이 브라우저에서 바로 처리하고, 가입도 워터마크도 없습니다.",
  alternates: { canonical: "/tools/pdf-split" },
};

export default function PdfSplitPage() {
  return (
    <article className="space-y-10">
      <header className="space-y-3">
        <h1 className="text-3xl font-semibold tracking-tight">PDF 분할</h1>
        <p className="max-w-2xl text-muted">
          필요한 페이지만 뽑아 한 개의 PDF로 만들거나, 모든 페이지를 한 장짜리 PDF로 쪼개 ZIP으로
          받습니다.
        </p>
      </header>

      <PdfSplitter />

      <section className="space-y-4 border-t border-border pt-8 text-sm text-muted">
        <div>
          <h2 className="font-medium text-fg">파일은 어디로 가나요?</h2>
          <p className="mt-1">
            아무 데도 가지 않습니다. 분할은 이 브라우저 탭 안에서 실행되고, 선택한 PDF는 네트워크로
            전송되지 않습니다. 탭을 닫으면 그대로 사라집니다.
          </p>
        </div>
        <div>
          <h2 className="font-medium text-fg">페이지 번호는 어떻게 적나요?</h2>
          <p className="mt-1">
            <code>1-3, 5, 8-</code> 처럼 적습니다. <code>1-3</code>은 1쪽부터 3쪽까지,
            <code>5</code>는 5쪽 한 장, <code>8-</code>은 8쪽부터 끝까지라는 뜻입니다. 적은 순서가
            그대로 결과의 페이지 순서가 됩니다.
          </p>
        </div>
        <div>
          <h2 className="font-medium text-fg">없는 페이지를 적으면 어떻게 되나요?</h2>
          <p className="mt-1">
            바로 알려 드립니다. 10쪽짜리에 <code>1-99</code>를 적었을 때 조용히 10쪽까지만 잘라
            성공시키면, 없는 페이지가 있다고 착각한 채로 넘어가게 됩니다. 그렇게 하지 않습니다.
          </p>
        </div>
        <div>
          <h2 className="font-medium text-fg">품질이 떨어지나요?</h2>
          <p className="mt-1">
            아닙니다. 페이지를 다시 렌더링하지 않고 원본 페이지를 그대로 복사합니다. 글자는 글자로,
            이미지는 원본 해상도 그대로 남습니다.
          </p>
        </div>
      </section>
    </article>
  );
}
