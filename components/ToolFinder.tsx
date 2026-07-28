"use client";

import Link from "next/link";
import { useId, useMemo, useState } from "react";
import { FamilyIcon } from "@/components/FamilyIcon";

export interface FinderTool {
  slug: string;
  href: string;
  name: string;
  blurb: string;
  /**
   * 이 도구가 받는 형식(`lib/tools.ts` 의 `ACCEPT`). 화면에는 안 나오고 찾기에만 쓴다.
   *
   * 실측(2026-07-28): 이것 없이 "heic" 를 치면 **이미지 변환만** 걸렸다. 용량 줄이기도
   * HEIC 를 받는데 설명에 그 낱말이 없었기 때문이다. 받는 형식은 우리가 이미 아는
   * 사실이고, 사람은 대개 **자기가 가진 파일의 확장자로** 찾는다.
   */
  accepts: string;
}

export interface FinderGroup {
  key: string;
  heading: string;
  tools: FinderTool[];
}

/**
 * 홈의 도구 목록 + 찾기 상자.
 *
 * **왜 클라이언트 컴포넌트인데 SEO 가 안 상하는가.** Next 는 클라이언트 컴포넌트도
 * 서버에서 HTML 로 찍어 보낸다 — 링크 스물한 개가 그대로 문서 안에 있고, 자바스크립트가
 * 꺼져 있어도 목록은 전부 보인다. 상자만 안 걸러질 뿐이다.
 *
 * **왜 필요한가.** 도구가 스물한 개다. 분류로 묶어 놨어도 "HEIC" 를 아는 사람은
 * 그 낱말로 바로 가고 싶어 한다. 파일 형식(`heic`, `mp4`)은 이름에 안 나오는 경우가
 * 많아서 **설명과 슬러그까지 함께 훑는다.**
 */
export function ToolFinder({
  groups,
  label,
  placeholder,
  empty,
}: {
  groups: FinderGroup[];
  label: string;
  placeholder: string;
  empty: string;
}) {
  const [query, setQuery] = useState("");
  const inputId = useId();

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return groups;
    return groups
      .map((group) => ({
        ...group,
        tools: group.tools.filter((tool) =>
          `${tool.name} ${tool.blurb} ${tool.slug} ${tool.accepts}`.toLowerCase().includes(needle),
        ),
      }))
      .filter((group) => group.tools.length > 0);
  }, [groups, query]);

  return (
    <div className="space-y-8">
      <div>
        <label htmlFor={inputId} className="sr-only">
          {label}
        </label>
        <input
          id={inputId}
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={placeholder}
          data-tool-search
          className="w-full rounded-xl border border-border bg-panel px-4 py-3 text-sm outline-none focus:border-accent"
        />
      </div>

      {filtered.length === 0 ? (
        <p className="text-sm text-muted" data-search-empty>
          {empty}
        </p>
      ) : (
        filtered.map((group) => (
          <div key={group.key} className="space-y-4">
            <h3 className="text-sm font-medium tracking-wide text-muted uppercase">
              {group.heading}
            </h3>
            <ul className="grid gap-4 sm:grid-cols-2">
              {group.tools.map((tool) => (
                <li key={tool.slug}>
                  <Link
                    href={tool.href}
                    className="flex h-full gap-3 rounded-xl border border-border bg-panel p-5 transition-colors hover:border-accent"
                  >
                    <FamilyIcon family={group.key} />
                    <span className="min-w-0">
                      <span className="block font-medium">{tool.name}</span>
                      <span className="mt-1 block text-sm text-muted">{tool.blurb}</span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))
      )}
    </div>
  );
}
