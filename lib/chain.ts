/**
 * "이어서 하기" 버튼이 쓰는 글자와 언어.
 *
 * **왜 사전을 통째로 안 넘기는가.** 사전은 서버 컴포넌트에서만 읽고 클라이언트에는
 * **필요한 조각만** 넘긴다(CLAUDE.md 의 다국어 규칙). 도구 컴포넌트 열여섯 개가
 * 각자 `dict` 를 받게 만들면 그 규칙이 무너진다 — 여기 있는 것이 딱 필요한 조각이다.
 *
 * 서버에서 만들어 넘기므로 이 파일은 `"use client"` 가 아니다.
 */

import type { Locale } from "./i18n/config";
import type { Dictionary } from "./i18n/dictionaries/en";
import type { ToolSlug } from "./tools";

export interface ChainCopy {
  locale: Locale;
  heading: string;
  names: Record<ToolSlug, string>;
}

export function chainCopy(locale: Locale, dict: Dictionary): ChainCopy {
  return { locale, heading: dict.common.sendToHeading, names: dict.toolNames };
}
