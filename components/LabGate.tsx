"use client";

import { useState } from "react";
import { formatBytes } from "@/lib/lab";

/**
 * Lab 도구 앞의 문.
 *
 * **이 층의 존재 이유가 이 화면이다.** 숨기지 않고, 대신 **받을 것을 숫자로 먼저 말하고**
 * 사용자가 고르게 한다. 규칙 2("버튼을 누르기 전엔 무거운 자산을 받지 않는다")를
 * GB 단위로 옮긴 것이라, 이 문을 지나기 전에는 모델 쪽 코드가 아예 실행되지 않는다 —
 * 지나야 도구 컴포넌트가 마운트되고, 그래야 워커도 만들어진다.
 *
 * **용량을 눈에 띄게 적는 것이 과장이 아니다.** 874MB 를 모바일 데이터로 받게 두는 것이
 * 이 사이트가 할 수 있는 가장 나쁜 일이다 — 되돌릴 수 없고, 사용자는 무슨 일이
 * 일어났는지도 모른다.
 */
export function LabGate({
  bytes,
  copy,
  children,
}: {
  bytes: number;
  copy: {
    warningHeading: string;
    warningBody: string;
    downloadLabel: string;
    onceLabel: string;
    startLabel: string;
  };
  children: React.ReactNode;
}) {
  const [entered, setEntered] = useState(false);
  if (entered) return <>{children}</>;

  return (
    <section
      className="rounded-2xl border border-warn/40 bg-panel p-6 sm:p-8"
      data-lab-gate
      aria-labelledby="lab-gate-heading"
    >
      <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:gap-8">
        {/* 숫자를 가장 크게 둔다 — 이 화면에서 사용자가 읽어야 할 것은 이것 하나다 */}
        <div className="flex shrink-0 flex-col items-center justify-center rounded-xl border border-border bg-bg px-6 py-5 text-center">
          <span className="text-3xl font-semibold tracking-tight text-warn" data-lab-bytes>
            {formatBytes(bytes)}
          </span>
          <span className="mt-1 text-xs text-muted">{copy.downloadLabel}</span>
        </div>

        <div className="space-y-3">
          <h2 id="lab-gate-heading" className="text-lg font-medium">
            {copy.warningHeading}
          </h2>
          <p className="max-w-xl text-sm leading-relaxed text-muted">{copy.warningBody}</p>
          <p className="text-xs text-muted">{copy.onceLabel}</p>
          <button
            type="button"
            onClick={() => setEntered(true)}
            className="mt-1 rounded-xl bg-accent px-5 py-2.5 text-sm font-medium text-accent-fg transition-opacity hover:opacity-90"
            data-lab-enter
          >
            {copy.startLabel}
          </button>
        </div>
      </div>
    </section>
  );
}
