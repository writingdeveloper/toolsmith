"use client";

import { useEffect, useSyncExternalStore } from "react";

/**
 * 화면 밝기. 시스템 설정을 따르거나, 직접 고른다.
 *
 * **판단이 여기 한 곳에 있다.** `app/globals.css` 에는 어두운 색 한 벌만 있고
 * `:root[data-theme="dark"]` 로만 켜진다 — CSS 는 고르지 않고 결과만 그린다.
 * 그래서 색을 바꿀 때 고칠 자리가 하나다.
 */
export type Theme = "system" | "light" | "dark";

const KEY = "toolsmith:theme";

/**
 * 첫 페인트 **전에** 돌아야 하는 조각. `<head>` 에 그대로 박는다.
 *
 * **React 가 붙기를 기다리면 늦다.** 어두운 화면을 고른 사람에게 흰 페이지가 한 번
 * 번쩍이고 나서 어두워지는데, 그 깜빡임은 되돌릴 방법이 없다(효과는 페인트 뒤에 돈다).
 *
 * `localStorage` 접근을 try 로 감싸는 이유: 사생활 보호 모드나 서드파티 쿠키를 막아 둔
 * 브라우저에서 **읽기만 해도 예외가 난다.** 여기서 던지면 문서 파싱이 그 자리에서
 * 멈추므로 페이지가 통째로 비어 버린다.
 */
const BOOTSTRAP = `(function(){try{
var s=localStorage.getItem(${JSON.stringify(KEY)});
var d=s==="dark"||(s!=="light"&&matchMedia("(prefers-color-scheme: dark)").matches);
document.documentElement.dataset.theme=d?"dark":"light";
}catch(e){}})()`;

export function ThemeScript() {
  // 우리가 만든 문자열만 넣는다 — 사용자 입력이 닿지 않는 자리다
  return <script dangerouslySetInnerHTML={{ __html: BOOTSTRAP }} />;
}

/*
 * **저장된 선택은 React 바깥의 상태다.** `useEffect` 로 읽어 `setState` 하면 렌더가
 * 한 번 더 돌고 린트가 막는다(`react-hooks/set-state-in-effect`). 이 저장소는 같은
 * 자리를 `lib/use-capability.ts` 에서 이미 `useSyncExternalStore` 로 풀었다 —
 * 서버에는 `localStorage` 가 없으니 서버 스냅숏은 언제나 `system` 이고, 클라이언트가
 * 붙으면 실제 값으로 바뀐다.
 */
const listeners = new Set<() => void>();

function subscribe(onChange: () => void) {
  listeners.add(onChange);
  return () => {
    listeners.delete(onChange);
  };
}

function readStored(): Theme {
  try {
    const stored = localStorage.getItem(KEY);
    return stored === "light" || stored === "dark" ? stored : "system";
  } catch {
    // 저장소를 막아 둔 브라우저. 고를 수는 있고 기억만 안 된다.
    return "system";
  }
}

function readServer(): Theme {
  return "system";
}

function apply(theme: Theme) {
  const dark =
    theme === "dark" ||
    (theme === "system" && matchMedia("(prefers-color-scheme: dark)").matches);
  document.documentElement.dataset.theme = dark ? "dark" : "light";
}

export function ThemeToggle({
  label,
  names,
}: {
  label: string;
  names: Record<Theme, string>;
}) {
  /*
   * 서버는 `system` 으로 그리고 클라이언트가 붙으면 저장된 값으로 바뀐다.
   * **화면 색은 이미 `<head>` 의 스크립트가 맞춰 두었으므로** 이 한 박자가 눈에 보이지
   * 않는다 — 여기서 늦게 정해지는 것은 선택 상자에 표시될 값뿐이다.
   */
  const theme = useSyncExternalStore(subscribe, readStored, readServer);

  /*
   * 시스템을 따르는 동안에는 **OS 설정이 바뀌면 따라가야 한다.** 이 구독이 없으면
   * 해가 져서 기기가 어두워져도 열어 둔 탭만 밝은 채로 남는다.
   */
  useEffect(() => {
    if (theme !== "system") return;
    const query = matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => apply("system");
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }, [theme]);

  function choose(next: Theme) {
    try {
      /*
       * **`system` 은 값을 지운다.** 그때의 색을 적어 두면 나중에 OS 설정을 바꿔도
       * 따라가지 않는다 — 되돌린 적이 없는 것과 같아진다.
       */
      if (next === "system") localStorage.removeItem(KEY);
      else localStorage.setItem(KEY, next);
    } catch {
      // 기억하지 못할 뿐, 이번 방문에는 적용된다
    }
    apply(next);
    for (const listener of listeners) listener();
  }

  return (
    <select
      aria-label={label}
      value={theme}
      onChange={(event) => choose(event.target.value as Theme)}
      className="rounded-lg border border-border bg-bg px-2 py-1.5 text-sm"
      data-theme-toggle
    >
      {(["system", "light", "dark"] as const).map((value) => (
        <option key={value} value={value}>
          {names[value]}
        </option>
      ))}
    </select>
  );
}
