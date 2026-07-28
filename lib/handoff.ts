/**
 * 도구에서 도구로 결과를 넘긴다.
 *
 * **왜 필요한가.** 21개 도구가 서로를 링크로만 가리키고 있었다. 영상을 자른 사람이
 * 그것을 압축하려면 **내려받고 → 다른 페이지로 가서 → 다시 고르는** 세 걸음을 걷는다.
 * 자막을 만든 사람이 번역하려면 똑같다. 실제로 이어지는 조합이 스무 쌍이 넘는데
 * 제품이 그 길을 하나도 놓아 주지 않았다.
 *
 * **왜 IndexedDB 인가.** Blob 을 그대로 담을 수 있는 유일한 저장소다. `sessionStorage`
 * 는 문자열만 받으므로 base64 로 부풀려야 하고(1.33배 + 메모리 두 벌), URL 로는
 * 100MB 짜리 영상을 못 넘긴다. `postMessage` 는 페이지가 바뀌면 끊긴다.
 *
 * **파일은 여전히 브라우저를 안 떠난다** — IndexedDB 는 이 출처(origin)에 갇혀 있고
 * 네트워크로 나가지 않는다. 규칙 1(서버 연산 0)이 그대로 지켜진다.
 *
 * **한 번 꺼내면 사라진다.** `take` 는 읽으면서 지운다. 안 그러면 나중에 그 도구를
 * 그냥 열었을 때 예전 파일이 되살아난다 — 사용자가 지웠다고 믿는 것이 되돌아오는 것은
 * 이 사이트가 내건 약속과 정면으로 충돌한다.
 */

import type { ToolSlug } from "./tools";

const DB_NAME = "toolsmith-handoff";
const STORE = "file";
const KEY = "pending";

/** 넘겨 놓고 안 가져간 것은 이만큼 지나면 없는 셈 친다. */
const STALE_MS = 10 * 60 * 1000;

/** 넘길 때 URL 에 붙이는 표시. 이게 없으면 꺼내려 들지도 않는다. */
export const HANDOFF_PARAM = "from";

export interface HandoffFile {
  name: string;
  type: string;
  blob: Blob;
}

export interface Handoff {
  /**
   * 여러 장을 한 번에 넘길 수 있다. 이미지 도구 넷은 원래 여러 장을 받으므로,
   * 한 장만 넘기게 만들면 **여덟 장을 처리한 사람이 여덟 번 눌러야** 한다.
   */
  files: HandoffFile[];
  /** 어느 도구가 만든 것인가 */
  from: ToolSlug;
  at: number;
}

function open(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => {
      request.result.createObjectStore(STORE);
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function done(tx: IDBTransaction): Promise<void> {
  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
    tx.onabort = () => reject(tx.error);
  });
}

/**
 * 결과를 넣어 둔다. 하나만 담는다 — 여러 개를 쌓으면 어느 것을 꺼낼지 정해야 하고,
 * "방금 보낸 것" 말고 다른 것을 꺼낼 이유가 없다.
 */
export async function putHandoff(entry: Omit<Handoff, "at">): Promise<void> {
  const db = await open();
  try {
    const tx = db.transaction(STORE, "readwrite");
    tx.objectStore(STORE).put({ ...entry, at: Date.now() } satisfies Handoff, KEY);
    await done(tx);
    // 같은 탭에서 두 번째로 넘길 때를 위해 집기 기억을 비운다 (아래 `claimHandoff`).
    claim = null;
    delivered = false;
  } finally {
    db.close();
  }
}

/**
 * **집기는 한 페이지에 한 번뿐이다.**
 *
 * 실측(2026-07-28): 이걸 안 묶었더니 넘긴 파일이 도착하지 않았다. React 는
 * 개발 모드에서 효과를 **두 번** 돌린다 — 첫 번째가 IndexedDB 에서 꺼내면서 지우고,
 * 그 사이에 정리 함수가 돌아 결과를 버리고, 두 번째는 이미 빈 저장소를 본다.
 * 넘긴 파일이 조용히 사라지는 것이다.
 *
 * 그래서 꺼내기 자체를 **약속 하나로 공유하고**, 실제로 건네주는 것은 딱 한 번만 한다.
 * 두 번 건네주면 여러 장을 받는 도구에 같은 파일이 두 벌 쌓인다.
 */
let claim: Promise<Handoff | null> | null = null;
let delivered = false;

export function claimHandoff(): Promise<Handoff | null> {
  claim ??= takeHandoff();
  return claim.then((entry) => {
    if (delivered) return null;
    delivered = true;
    return entry;
  });
}

/** 읽으면서 지운다. 오래된 것은 없는 것으로 친다. */
export async function takeHandoff(): Promise<Handoff | null> {
  const db = await open();
  try {
    const tx = db.transaction(STORE, "readwrite");
    const store = tx.objectStore(STORE);
    const read = store.get(KEY);
    store.delete(KEY);
    await done(tx);

    const entry = read.result as Handoff | undefined;
    if (!entry || !Array.isArray(entry.files) || entry.files.length === 0) return null;
    if (!entry.files.every((file) => file.blob instanceof Blob)) return null;
    if (Date.now() - entry.at > STALE_MS) return null;
    return entry;
  } finally {
    db.close();
  }
}

/**
 * 파일 이름으로 종류를 짐작한다.
 *
 * **왜 필요한가.** 도구들의 결과 상태에는 이름과 object URL 만 있고 MIME 이 없다
 * (내려받기 링크에는 필요 없으니까). 그런데 넘길 곳을 고르려면 종류를 알아야 한다 —
 * `image/*` 만 받는 도구에 `.png` 라는 이름만으로는 안 걸린다.
 *
 * **여기 없는 확장자는 빈 문자열이다.** 그러면 확장자 규칙에만 걸리므로, 못 넘길 것을
 * 넘길 수 있다고 표시하는 쪽이 아니라 **안전한 쪽으로 틀린다**(규칙 3).
 */
const MIME: Record<string, string> = {
  png: "image/png",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  webp: "image/webp",
  avif: "image/avif",
  gif: "image/gif",
  bmp: "image/bmp",
  mp4: "video/mp4",
  m4v: "video/mp4",
  mov: "video/quicktime",
  webm: "video/webm",
  m4a: "audio/mp4",
  wav: "audio/wav",
  mp3: "audio/mpeg",
  pdf: "application/pdf",
  txt: "text/plain",
  srt: "application/x-subrip",
  vtt: "text/vtt",
  zip: "application/zip",
};

export function mimeForName(name: string): string {
  const dot = name.lastIndexOf(".");
  if (dot < 0) return "";
  return MIME[name.slice(dot + 1).toLowerCase()] ?? "";
}

/**
 * 이 파일을 저 `accept` 가 받는가.
 *
 * `<input accept>` 와 **같은 규칙**을 쓴다 — 확장자(`.mp4`), 정확한 MIME(`image/png`),
 * 와일드카드(`image/*`). 브라우저가 파일 고르기 창에서 하는 판단을 우리가 코드로
 * 되풀이하는 것이라, 갈래가 어긋나면 사용자가 고를 수 없는 파일을 우리가 밀어 넣게 된다.
 *
 * 넘긴 결과가 대상 도구가 못 받는 것이면 **보내기 버튼을 아예 안 보여 준다**(규칙 3).
 */
export function acceptsFile(accept: string, file: { name: string; type: string }): boolean {
  const rules = accept
    .split(",")
    .map((rule) => rule.trim().toLowerCase())
    .filter(Boolean);
  if (rules.length === 0) return true;

  const name = file.name.toLowerCase();
  // `text/plain;charset=utf-8` 처럼 매개변수가 붙어 오는 경우가 있다 — OCR 의 결과가
  // 그렇다. 매개변수를 안 떼면 정확 일치 규칙에 영영 안 걸린다.
  const type = file.type.toLowerCase().split(";")[0].trim();

  return rules.some((rule) => {
    if (rule.startsWith(".")) return name.endsWith(rule);
    if (rule.endsWith("/*")) return type.startsWith(rule.slice(0, -1));
    return type !== "" && type === rule;
  });
}
