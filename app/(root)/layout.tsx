import "../globals.css";

/**
 * 언어 선택 화면 전용 루트 레이아웃.
 *
 * `app/layout.tsx` 를 두지 않는 이유: 그 파일이 있으면 모든 페이지가 하나의 <html lang>
 * 을 공유하게 되어 언어별 lang 속성을 줄 수 없다. 라우트 그룹마다 루트 레이아웃을 두면
 * `/` 는 여기, `/{locale}/**` 는 app/[locale]/layout.tsx 가 각자 <html> 을 갖는다.
 */
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="h-full">
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  );
}
