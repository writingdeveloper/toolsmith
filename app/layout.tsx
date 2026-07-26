import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

const SITE_NAME = "toolsmith";

export const metadata: Metadata = {
  title: {
    default: "toolsmith — 업로드 없는 브라우저 도구 모음",
    template: `%s | ${SITE_NAME}`,
  },
  description:
    "파일이 기기를 떠나지 않습니다. 이미지·영상·PDF 변환을 전부 브라우저 안에서 처리합니다. 가입 없음, 업로드 없음.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ko" className="h-full">
      <body className="flex min-h-full flex-col">
        <header className="border-b border-border">
          <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-4">
            <Link href="/" className="text-lg font-semibold tracking-tight">
              toolsmith
            </Link>
            <span className="rounded-full border border-border px-3 py-1 text-xs text-muted">
              업로드 없음 · 전부 브라우저에서 처리
            </span>
          </div>
        </header>

        <main className="mx-auto w-full max-w-5xl flex-1 px-5 py-10">{children}</main>

        <footer className="border-t border-border">
          <div className="mx-auto max-w-5xl px-5 py-6 text-sm text-muted">
            선택한 파일은 서버로 전송되지 않습니다. 모든 처리는 이 브라우저 탭 안에서 끝납니다.
          </div>
        </footer>
      </body>
    </html>
  );
}
