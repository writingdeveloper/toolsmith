import type { Metadata } from "next";
import { ImageConverter } from "./ImageConverter";

export const metadata: Metadata = {
  title: "이미지 변환·압축 — HEIC, PNG, JPG, WebP, AVIF",
  description:
    "아이폰 HEIC 사진을 JPG로, PNG를 WebP로. 업로드 없이 브라우저에서 바로 변환하고 압축합니다. 가입 불필요, 파일 개수 제한 없음.",
  alternates: { canonical: "/tools/image-convert" },
};

export default function ImageConvertPage() {
  return (
    <article className="space-y-10">
      <header className="space-y-3">
        <h1 className="text-3xl font-semibold tracking-tight">이미지 변환·압축</h1>
        <p className="max-w-2xl text-muted">
          HEIC·PNG·JPG·WebP·AVIF를 서로 바꾸고, 품질을 조절해 용량을 줄이고, 크기를 함께 줄입니다.
          여러 장을 한 번에 처리할 수 있습니다.
        </p>
      </header>

      <ImageConverter />

      <section className="space-y-4 border-t border-border pt-8 text-sm text-muted">
        <div>
          <h2 className="font-medium text-fg">파일은 어디로 가나요?</h2>
          <p className="mt-1">
            아무 데도 가지 않습니다. 변환은 이 브라우저 탭 안에서 실행되고, 선택한 이미지는 네트워크로
            전송되지 않습니다. 탭을 닫으면 그대로 사라집니다.
          </p>
        </div>
        <div>
          <h2 className="font-medium text-fg">아이폰 HEIC 사진도 되나요?</h2>
          <p className="mt-1">
            됩니다. Safari는 HEIC를 직접 읽고, Chrome·Firefox에서는 HEIC 파일을 넣은 순간에만 디코더를
            내려받아 처리합니다. HEIC를 쓰지 않으면 다운로드도 일어나지 않습니다.
          </p>
        </div>
        <div>
          <h2 className="font-medium text-fg">어떤 형식을 고르면 되나요?</h2>
          <p className="mt-1">
            웹에 올릴 거라면 WebP가 같은 화질에서 가장 작습니다. 어디서나 열려야 한다면 JPG,
            투명 배경이 필요하면 PNG를 고르세요. 브라우저가 실제로 만들 수 있는 형식만 목록에
            나타납니다.
          </p>
        </div>
      </section>
    </article>
  );
}
