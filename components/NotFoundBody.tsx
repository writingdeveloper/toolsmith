"use client";

import { useEffect, useSyncExternalStore } from "react";
import { DEFAULT_LOCALE, HTML_LANG, isLocale, type Locale } from "@/lib/i18n/config";

/** 주소의 첫 토막이 우리가 아는 언어면 그것, 아니면 기본 언어. */
function localeOfPath(pathname: string): Locale {
  const first = pathname.split("/")[1]?.toLowerCase() ?? "";
  return isLocale(first) ? first : DEFAULT_LOCALE;
}

/** 이 값은 페이지가 살아 있는 동안 바뀌지 않는다 — 구독할 것이 없다. */
const noSubscribe = () => () => {};

export interface NotFoundCopy {
  title: string;
  lead: string;
  home: string;
}

/**
 * 404 의 본문.
 *
 * **왜 클라이언트에서 언어를 고르는가.** 이 페이지는 어떤 주소로도 도달할 수 있어서
 * (`/ko/tools/없는것`, `/zz`, `/아무거나`) 라우트 매개변수가 없다. 서버에서 주소를
 * 읽어 언어를 정하려면 미들웨어나 함수가 돌아야 하는데 그러면 **규칙 1(서버 연산 0)**
 * 이 깨진다. 여섯 언어의 글자는 다 합쳐도 몇 백 바이트라 전부 실어 보내고 여기서 고른다.
 *
 * 고르기 전에는 기본 언어로 보인다 — **빈 화면을 보여 주지 않는다.** 404 는 이미
 * 뭔가 잘못된 상황이고, 거기서 한 번 더 깜빡이게 만들 이유가 없다.
 */
export function NotFoundBody({ copy }: { copy: Record<Locale, NotFoundCopy> }) {
  /*
   * **`useEffect` 안에서 `setState` 를 부르지 않는다** — 서버에는 `location` 이 없어
   * 렌더 중에 물을 수도 없다. `useSyncExternalStore` 가 서버엔 기본 언어를,
   * 클라이언트엔 주소에서 읽은 값을 준다. `lib/use-capability.ts` 와 같은 이유다.
   */
  const locale = useSyncExternalStore(
    noSubscribe,
    () => localeOfPath(window.location.pathname),
    () => DEFAULT_LOCALE,
  );

  // `<html lang>` 도 같이 고친다 — 화면 글자와 어긋나면 스크린리더가 엉뚱하게 읽는다.
  useEffect(() => {
    document.documentElement.lang = HTML_LANG[locale];
  }, [locale]);

  const text = copy[locale];

  return (
    <main className="mx-auto flex min-h-full max-w-5xl flex-col justify-center gap-4 px-5 py-24">
      <p className="text-sm font-medium text-muted tabular-nums">404</p>
      <h1 className="text-3xl font-semibold tracking-tight">{text.title}</h1>
      <p className="max-w-xl text-muted">{text.lead}</p>
      <p>
        {/*
          `next/link` 가 아니라 평범한 `<a>` 다. 이 페이지는 라우터 바깥에서도 뜨므로
          (주소가 아예 안 맞는 경우) 클라이언트 이동을 기대할 수 없다.
        */}
        <a
          href={`/${locale}`}
          className="inline-block rounded-lg bg-accent px-5 py-2.5 text-sm font-medium text-accent-fg"
        >
          {text.home}
        </a>
      </p>
    </main>
  );
}
