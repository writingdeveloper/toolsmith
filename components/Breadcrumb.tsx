import Link from "next/link";
import type { Locale } from "@/lib/i18n/config";

/**
 * 도구 페이지의 위치 표시.
 *
 * **스키마에는 `BreadcrumbList` 가 있는데 화면에는 아무것도 없었다(2026-07-28).**
 * 구글은 구조화 데이터가 **보이는 내용을 반영해야 한다**고 못 박아 두었으므로 그 자체로
 * 위험이고, 사용자에게도 문제였다 — 도구에서 목록으로 돌아가는 길이 로고 하나뿐이라
 * 다른 도구를 찾으려면 무엇을 눌러야 하는지 알 수 없었다.
 *
 * 서버 컴포넌트다. 링크 하나짜리에 클라이언트 번들을 늘릴 이유가 없다.
 */
export function Breadcrumb({
  locale,
  label,
  current,
}: {
  locale: Locale;
  /** 스크린리더가 읽을 영역 이름 */
  label: string;
  current: string;
}) {
  return (
    <nav aria-label={label} data-breadcrumb className="text-sm text-muted">
      <ol className="flex flex-wrap items-center gap-1.5">
        <li>
          <Link href={`/${locale}`} className="hover:text-fg">
            toolsmith
          </Link>
        </li>
        <li aria-hidden="true">/</li>
        {/* 현재 위치는 링크가 아니다 — 자기 자신으로 가는 링크는 길이 아니다 */}
        <li className="min-w-0 truncate text-fg">{current}</li>
      </ol>
    </nav>
  );
}
