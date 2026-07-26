"use client";

import { usePathname, useRouter } from "next/navigation";
import { LOCALE_NAME, LOCALES, type Locale } from "@/lib/i18n/config";

/**
 * 지금 보고 있는 문서의 다른 언어판으로 옮긴다.
 * 크롤러는 이 select 를 따라가지 않지만, hreflang 과 푸터의 실제 링크가 그 몫을 한다.
 */
export function LocaleSwitcher({ current }: { current: Locale }) {
  const router = useRouter();
  const pathname = usePathname() ?? `/${current}`;
  const rest = pathname.startsWith(`/${current}`) ? pathname.slice(current.length + 1) : "";

  return (
    <select
      aria-label="Language"
      value={current}
      onChange={(event) => router.push(`/${event.target.value}${rest}`)}
      className="rounded-lg border border-border bg-bg px-2 py-1.5 text-sm"
    >
      {LOCALES.map((locale) => (
        <option key={locale} value={locale}>
          {LOCALE_NAME[locale]}
        </option>
      ))}
    </select>
  );
}
