import { DEFAULT_LOCALE, LOCALES, type Locale } from "./config";
import { de } from "./dictionaries/de";
import { en, type Dictionary } from "./dictionaries/en";
import { es } from "./dictionaries/es";
import { ja } from "./dictionaries/ja";
import { ko } from "./dictionaries/ko";
import { ptBR } from "./dictionaries/pt-br";

/**
 * 사전은 서버 컴포넌트에서만 읽는다. 클라이언트 컴포넌트에는 필요한 조각만
 * prop 으로 넘긴다 — 그래야 6개 언어가 브라우저 번들에 딸려 들어가지 않는다.
 */
const DICTIONARIES: Record<Locale, Dictionary> = {
  en,
  ko,
  ja,
  es,
  de,
  "pt-br": ptBR,
};

export function getDictionary(locale: Locale): Dictionary {
  return DICTIONARIES[locale] ?? DICTIONARIES[DEFAULT_LOCALE];
}

export type { Dictionary };
export { DEFAULT_LOCALE, LOCALES };
export type { Locale };
