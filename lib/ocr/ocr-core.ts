/**
 * 그림 속 글자를 읽어 낸다 (OCR).
 *
 * tesseract.js(Apache-2.0)를 쓴다. 여기서 지켜야 할 것이 세 가지다.
 *
 * 1. **무거운 자산은 Vercel 에서 서빙하지 않는다**(규칙 5). 엔진 wasm 3.4MB 와 언어
 *    데이터는 전부 남의 CDN 에서 온다 — jsDelivr(npm 미러)와 tesseract.js 가 직접
 *    운영하는 tessdata 호스트다.
 * 2. **버튼을 누르기 전에는 아무것도 받지 않는다**(규칙 2). tesseract.js 자체를
 *    동적 import 로 미룬다.
 * 3. **`4.0.0_fast` 를 쓴다.** 같은 언어의 `best` 모델은 5~10배 크다(영어 1.98MB vs
 *    10.9MB, 일본어 1.54MB vs 16.2MB). 정확도가 조금 낮은 대신 받는 양이 한 자릿수
 *    MB 안에 머문다 — 업로드 없는 도구에서 이 트레이드는 사용자가 알아야 하므로
 *    화면과 FAQ 에 그대로 적는다.
 *
 * COOP/COEP 를 켜지 않으므로(규칙 4) 단일 스레드 코어로 돈다. 느리지만 교차 출처를
 * 막지 않는다.
 *
 * window / document 를 참조하지 않는다.
 */

export type OcrLanguage = "eng" | "kor" | "jpn" | "spa" | "deu" | "por" | "chi_sim";

/** 실측한 gzip 전송 크기(바이트). 화면에 "약 N MB" 로 보여 주기 위한 것이다. */
export const LANGUAGE_BYTES: Record<OcrLanguage, number> = {
  eng: 1_984_273,
  kor: 1_114_590,
  jpn: 1_535_471,
  spa: 1_137_561,
  deu: 854_318,
  por: 1_009_185,
  chi_sim: 1_730_011,
};

export const OCR_LANGUAGES: OcrLanguage[] = ["eng", "kor", "jpn", "spa", "deu", "por", "chi_sim"];

/** 엔진 wasm. 언어와 무관하게 처음 한 번 받는다. */
export const ENGINE_BYTES = 3_451_410;

const VERSION = "7.0.0";
const CORE_PATH = `https://cdn.jsdelivr.net/npm/tesseract.js-core@${VERSION}`;
const WORKER_PATH = `https://cdn.jsdelivr.net/npm/tesseract.js@${VERSION}/dist/worker.min.js`;
const LANG_PATH = "https://tessdata.projectnaptha.com/4.0.0_fast";

/** 한 장을 읽은 결과. */
export interface OcrPage {
  /** 1-based. 이미지 한 장이면 항상 1 이다. */
  number: number;
  text: string;
  /** tesseract 가 매긴 확신도(0~100). 낮으면 사용자에게 그렇다고 말한다. */
  confidence: number;
}

export interface OcrResult {
  pages: OcrPage[];
  text: string;
  /** 전체 평균 확신도 */
  confidence: number;
}

export type OcrStage = "engine" | "reading";

export interface OcrProgress {
  stage: OcrStage;
  /** 0~1 */
  ratio: number;
  /** 몇 장째를 읽는 중인가 (stage === "reading" 일 때만) */
  page?: number;
  pages?: number;
}

export class OcrError extends Error {
  constructor(message: "ENGINE_FAILED" | "NO_TEXT" | "TOO_MANY_PAGES") {
    super(message);
    this.name = "OcrError";
  }
}

/** 한 번에 읽는 장수 상한. 넘으면 시작하지 않고 그렇다고 말한다. */
export const MAX_PAGES = 30;

/* tesseract.js 는 전역 네임스페이스로 타입을 내므로 우리가 쓰는 만큼만 좁혀 적는다. */
interface TesseractLogger {
  status: string;
  progress: number;
}
interface TesseractWorker {
  recognize(image: Blob): Promise<{ data: { text: string; confidence: number } }>;
  terminate(): Promise<unknown>;
}

/**
 * 그림들을 순서대로 읽는다.
 *
 * 워커를 장마다 새로 만들지 않는다 — 언어 데이터를 다시 받게 되기 때문이다.
 * 한 번 세우고 전부 통과시킨 뒤에 닫는다.
 */
export async function readText(
  images: Blob[],
  language: OcrLanguage,
  onProgress?: (progress: OcrProgress) => void,
): Promise<OcrResult> {
  if (images.length === 0) throw new OcrError("NO_TEXT");
  if (images.length > MAX_PAGES) throw new OcrError("TOO_MANY_PAGES");

  const { createWorker } = await import("tesseract.js");

  let worker: TesseractWorker;
  try {
    worker = (await createWorker(language, undefined, {
      corePath: CORE_PATH,
      workerPath: WORKER_PATH,
      langPath: LANG_PATH,
      gzip: true,
      logger: (message: TesseractLogger) => {
        // 엔진과 언어 데이터를 받는 동안의 진행률. 여기가 이 도구에서 가장 오래 걸린다.
        if (message.status !== "recognizing text") {
          onProgress?.({ stage: "engine", ratio: Math.min(1, message.progress) });
        }
      },
    })) as unknown as TesseractWorker;
  } catch {
    throw new OcrError("ENGINE_FAILED");
  }

  const pages: OcrPage[] = [];
  try {
    for (let index = 0; index < images.length; index += 1) {
      onProgress?.({
        stage: "reading",
        ratio: index / images.length,
        page: index + 1,
        pages: images.length,
      });
      const { data } = await worker.recognize(images[index]);
      pages.push({
        number: index + 1,
        text: data.text.trim(),
        confidence: data.confidence,
      });
    }
  } finally {
    await worker.terminate();
  }

  onProgress?.({ stage: "reading", ratio: 1, page: images.length, pages: images.length });

  const withText = pages.filter((page) => page.text.length > 0);
  const confidence =
    withText.length > 0
      ? withText.reduce((sum, page) => sum + page.confidence, 0) / withText.length
      : 0;

  return {
    pages,
    // 여러 장이면 장 사이를 빈 줄로 띄운다 — 어디서 페이지가 바뀌었는지 보여야 한다
    text: pages.map((page) => page.text).join("\n\n"),
    confidence,
  };
}
