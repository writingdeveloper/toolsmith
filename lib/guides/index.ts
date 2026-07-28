import { DEFAULT_LOCALE, type Locale } from "@/lib/i18n/config";
import { de } from "./de";
import { en } from "./en";
import { es } from "./es";
import { ja } from "./ja";
import { ko } from "./ko";
import { ptBr } from "./pt-br";
import type { GuideArticle, GuideCopy, GuideSlug } from "./registry";

/**
 * 글도 **서버 컴포넌트에서만** 읽는다. 사전과 같은 규칙이다 — 클라이언트로 넘기면
 * 6개 언어의 본문이 브라우저 번들에 통째로 딸려 들어간다.
 */
const COPY: Record<Locale, GuideCopy> = { en, ko, ja, es, de, "pt-br": ptBr };

export function getGuideCopy(locale: Locale): GuideCopy {
  return COPY[locale] ?? COPY[DEFAULT_LOCALE];
}

export function getGuide(locale: Locale, slug: GuideSlug): GuideArticle {
  return getGuideCopy(locale).articles[slug];
}

export * from "./registry";
