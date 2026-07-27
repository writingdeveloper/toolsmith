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

/**
 * OCR 에 먹이기 전에 맞출 긴 변(px).
 *
 * tesseract 는 대략 300dpi 근처에서 가장 잘 읽는다. 여기서 더 키우면 정확도는 거의
 * 안 오르는데 메모리와 시간만 늘어난다 — PDF 쪽은 처음부터 이 값으로 그려 왔다.
 *
 * **그림은 그러지 않고 있었고, 실제 스캔에서 통째로 무너졌다(2026-07-27).**
 * 1919년 타자기 편지 스캔(4962×4192, 7.9MB)을 그대로 넣었더니 6,385자가 전부
 * 쓰레기였다(`ATR ae, een PRL RON Ra oes ree Bee…`, 알아본 낱말 0/6). 같은 그림을
 * 줄여서 넣으면 멀쩡히 읽힌다:
 *
 * | 긴 변 | 알아본 낱말 | 시간 |
 * |---|---|---|
 * | 4962(원본) | **0/6** | 11.3초 |
 * | 3600 · 3000 · 2000 · 1600 · 1200 | 6/6 | 1.2~2.0초 |
 * | 2400 | 5/6 | 1.7초 |
 * | 1000 | 5/6 | 1.1초 |
 *
 * **다만 "크면 깨진다" 는 아니다.** 같은 4962×4192 를 깨끗한 합성 그림으로 만들어
 * 넣으면 멀쩡히 읽힌다(합성본 6/6). 방아쇠는 픽셀 수가 아니라 **종이 결**이다 —
 * 고해상도에서 종이의 결이 글자와 비슷한 크기의 고주파 잡음이 되고, 줄이면 평균이
 * 되어 사라진다. 그래서 이 결함은 **합성 픽스처로 재현되지 않는다**; 다음 사람이
 * 임계값을 찾으려 하지 않도록 적어 둔다.
 *
 * 줄이는 것은 어느 쪽이든 손해가 없다 — 정확도는 그대로이고 7배 빠르다.
 */
export const OCR_EDGE = 2000;

/**
 * 그림을 OCR 이 읽을 수 있는 크기로 맞춘다. 이미 작으면 그대로 돌려준다.
 *
 * **흰 바탕을 먼저 깔아야 한다.** JPEG 에는 투명도가 없어서, 투명한 PNG 스캔을
 * 그냥 그리면 검은 바탕에 검은 글자가 된다 — PDF 쪽이 같은 이유로 흰 바탕을 깐다.
 *
 * window / document 를 참조하지 않는다.
 */
export async function normalizeForOcr(image: Blob): Promise<Blob> {
  const bitmap = await createImageBitmap(image);
  const longest = Math.max(bitmap.width, bitmap.height);
  if (longest <= OCR_EDGE) {
    bitmap.close();
    return image;
  }

  const scale = OCR_EDGE / longest;
  const canvas = new OffscreenCanvas(
    Math.max(1, Math.round(bitmap.width * scale)),
    Math.max(1, Math.round(bitmap.height * scale)),
  );
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    bitmap.close();
    return image;
  }
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  return canvas.convertToBlob({ type: "image/jpeg", quality: 0.9 });
}

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
