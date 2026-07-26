import type { Metadata } from "next";
import { PdfMerger } from "./PdfMerger";

export const metadata: Metadata = {
  title: "PDF 병합 — 여러 PDF를 하나로 합치기",
  description:
    "여러 개의 PDF를 원하는 순서로 이어 붙입니다. 업로드 없이 브라우저에서 바로 처리하고, 가입도 워터마크도 파일 개수 제한도 없습니다.",
  alternates: { canonical: "/tools/pdf-merge" },
};

export default function PdfMergePage() {
  return (
    <article className="space-y-10">
      <header className="space-y-3">
        <h1 className="text-3xl font-semibold tracking-tight">PDF 병합</h1>
        <p className="max-w-2xl text-muted">
          여러 개의 PDF를 하나의 파일로 이어 붙입니다. 목록에서 순서를 바꾸면 그 순서 그대로 합쳐집니다.
        </p>
      </header>

      <PdfMerger />

      <section className="space-y-4 border-t border-border pt-8 text-sm text-muted">
        <div>
          <h2 className="font-medium text-fg">파일은 어디로 가나요?</h2>
          <p className="mt-1">
            아무 데도 가지 않습니다. 병합은 이 브라우저 탭 안에서 실행되고, 선택한 PDF는 네트워크로
            전송되지 않습니다. 탭을 닫으면 그대로 사라집니다.
          </p>
        </div>
        <div>
          <h2 className="font-medium text-fg">페이지 순서는 어떻게 정하나요?</h2>
          <p className="mt-1">
            목록에 놓인 위에서 아래 순서가 그대로 결과의 페이지 순서입니다. ↑ ↓ 버튼으로 파일 순서를
            바꾸고, ✕ 로 목록에서 뺄 수 있습니다. 각 파일의 페이지는 원본 순서를 유지합니다.
          </p>
        </div>
        <div>
          <h2 className="font-medium text-fg">암호가 걸린 PDF도 되나요?</h2>
          <p className="mt-1">
            되지 않습니다. 암호로 보호된 PDF는 목록에서 그렇게 표시되고 병합에서 제외됩니다. 열리는 척
            하다가 내용이 깨진 결과를 내놓지 않기 위해서입니다. 먼저 암호를 해제한 뒤 넣어 주세요.
          </p>
        </div>
        <div>
          <h2 className="font-medium text-fg">품질이 떨어지나요?</h2>
          <p className="mt-1">
            아닙니다. 페이지를 다시 렌더링하지 않고 원본 페이지를 그대로 복사해 붙입니다. 글자는 글자로,
            이미지는 원본 해상도 그대로 남습니다.
          </p>
        </div>
      </section>
    </article>
  );
}
