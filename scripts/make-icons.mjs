/**
 * 파비콘·앱 아이콘·OG 이미지를 만든다.
 *
 * **새 의존성을 들이지 않는다.** sharp 를 넣으면 아이콘 하나 때문에 네이티브 바이너리가
 * 따라오고, `next/og` 의 ImageResponse 를 쓰면 빌드 시점에 이미지를 굽는 경로가 생긴다.
 * 이미 있는 Playwright 로 SVG 를 그려 PNG 로 찍으면 **결과가 정적 파일 하나씩**이고,
 * 저장소에는 그 파일만 남는다.
 *
 *   node scripts/make-icons.mjs
 *
 * 아이콘 모양을 바꾸려면 `app/icon.svg` 만 고치고 이 스크립트를 다시 돌린다 —
 * 여기 있는 마크는 그 파일에서 읽어 온다. 두 곳에 같은 그림을 두지 않는다.
 */
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "@playwright/test";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const MARK = readFileSync(path.join(ROOT, "app", "icon.svg"), "utf8");

/** 마크만 뽑아 임의 크기의 캔버스에 앉힌다. */
function page(body, width, height, background) {
  return `<!doctype html><html><head><meta charset="utf-8"><style>
    html,body{margin:0;padding:0;width:${width}px;height:${height}px;background:${background}}
    *{box-sizing:border-box}
  </style></head><body>${body}</body></html>`;
}

/**
 * `alpha` 를 켜면 알파 채널이 있는 PNG(RGBA)가 나온다.
 *
 * **ICO 안에 넣을 PNG 는 반드시 RGBA 여야 한다.** 알파 없이 찍으면 Next 가 빌드에서
 * `The PNG is not in RGBA format!` 로 죽는다 — 여기서 한 번 데였다.
 */
async function shoot(browser, html, width, height, out, alpha = false) {
  const tab = await browser.newPage({ viewport: { width, height }, deviceScaleFactor: 1 });
  await tab.setContent(html, { waitUntil: "load" });
  const buffer = await tab.screenshot({ type: "png", omitBackground: alpha });
  writeFileSync(out, buffer);
  await tab.close();
  console.log(`${path.relative(ROOT, out)}  ${width}×${height}  ${buffer.length} bytes`);
  return buffer;
}

/**
 * ICO 를 손으로 조립한다. Vista 이후는 항목 안에 PNG 를 그대로 넣어도 된다.
 *
 * 헤더 6바이트(예약·형식·개수) + 항목마다 16바이트 디렉터리 + PNG 본문.
 * 폭·높이 바이트에 256 은 0 으로 적는다 — 한 바이트에 256 이 안 들어가기 때문이다.
 */
function ico(pngs) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(pngs.length, 4);

  let offset = 6 + pngs.length * 16;
  const entries = [];
  for (const { size, data } of pngs) {
    const entry = Buffer.alloc(16);
    entry.writeUInt8(size >= 256 ? 0 : size, 0);
    entry.writeUInt8(size >= 256 ? 0 : size, 1);
    entry.writeUInt8(0, 2); // 팔레트 없음
    entry.writeUInt8(0, 3); // 예약
    entry.writeUInt16LE(1, 4); // 평면
    entry.writeUInt16LE(32, 6); // 비트 깊이
    entry.writeUInt32LE(data.length, 8);
    entry.writeUInt32LE(offset, 12);
    offset += data.length;
    entries.push(entry);
  }
  return Buffer.concat([header, ...entries, ...pngs.map((p) => p.data)]);
}

const browser = await chromium.launch();

const square = (size) =>
  page(`<div style="width:${size}px;height:${size}px">${MARK}</div>`, size, size, "transparent");

// 애플 터치 아이콘은 투명을 검게 깐다 — 모서리를 흰 바탕 위에 둥글게 남긴다
const apple = page(
  `<div style="width:180px;height:180px;padding:14px;background:#ffffff">${MARK}</div>`,
  180,
  180,
  "#ffffff",
);

await shoot(browser, apple, 180, 180, path.join(ROOT, "app", "apple-icon.png"));

const sizes = [16, 32, 48];
const pngs = [];
for (const size of sizes) {
  const buffer = await shoot(
    browser,
    square(size),
    size,
    size,
    path.join(ROOT, "public", `icon-${size}.png`),
    true,
  );
  pngs.push({ size, data: buffer });
}
for (const size of [192, 512]) {
  await shoot(browser, square(size), size, size, path.join(ROOT, "public", `icon-${size}.png`), true);
}

writeFileSync(path.join(ROOT, "app", "favicon.ico"), ico(pngs));
console.log("app/favicon.ico  16·32·48");

/*
 * OG 카드. **글로 된 문구를 넣지 않는다** — 6개 언어가 같은 그림을 쓰는데 한 언어의
 * 문장을 박으면 나머지 다섯에는 거짓말이 된다. 마크와 이름만 둔다.
 */
const og = page(
  `<div style="width:1200px;height:630px;display:flex;flex-direction:column;
        align-items:center;justify-content:center;gap:40px;
        background:#0b0b0e;font-family:ui-sans-serif,system-ui,-apple-system,'Segoe UI',Roboto,sans-serif">
     <div style="width:200px;height:200px">${MARK}</div>
     <div style="color:#f4f4f5;font-size:84px;font-weight:600;letter-spacing:-.03em">toolsmith</div>
     <div style="display:flex;gap:14px">
       ${["#2563eb", "#3b82f6", "#60a5fa", "#93c5fd"]
         .map((c) => `<span style="width:14px;height:14px;border-radius:99px;background:${c}"></span>`)
         .join("")}
     </div>
   </div>`,
  1200,
  630,
  "#0b0b0e",
);
await shoot(browser, og, 1200, 630, path.join(ROOT, "public", "og.png"));

/*
 * 페이지별 OG 카드.
 *
 * **왜 필요했나.** 스물한 도구가 위의 카드 하나를 함께 썼다. 어디를 공유해도 똑같이
 * 보였고, 공유 카드에서 도구를 구별할 방법이 없었다. 2026-07-29 에 **설명 글과 Lab
 * 도구까지** 넓혔다 — 그전에는 글 66쪽이 공용 카드였는데, 링크를 받으라고 만든 층에
 * 카드가 없고 도구에만 있는 것은 앞뒤가 뒤집힌 것이다.
 *
 * **그런데 문장은 여전히 안 넣는다.** 이미지 한 장을 6개 언어가 함께 쓰기 때문이다
 * (위의 og.png 에 적어 둔 이유 그대로). 대신 **형식 이름과 화살표**만 쓴다 —
 * `MOV → MP4`, `PDF ↓` 는 어느 언어에서나 같은 낱말이라 거짓말이 되지 않는다.
 * 제목·설명은 어차피 `og:title`/`og:description` 이 언어별로 따로 나른다.
 *
 * 계열 색이 한 번 더 갈라 준다. 형식이 같은 둘(배경 제거·컷아웃)은 카드도 닮는데,
 * **목적이 "전부 구별" 이 아니라 "전부 같지 않게" 이므로** 그대로 둔다.
 */
const FAMILY_COLOR = {
  image: "#3b82f6",
  pdf: "#ef4444",
  video: "#a855f7",
  data: "#10b981",
  /** Lab. 나머지 넷과 성격이 다르다 — 계열이 아니라 **층**이다(받을 것이 880MB). */
  lab: "#f59e0b",
};

/**
 * 카드 하나. `ask` 를 켜면 계열 색 물음표가 붙는다 — **설명 글용**이다.
 *
 * 글에 물음표 하나만 더하는 이유: 글은 도구와 **같은 대상을 다루므로 표기도 같아야
 * 한다**(업스케일 도구가 `1× → 4×` 면 "업스케일이 화질을 만드나" 도 `1× → 4×` 다).
 * 다른 낱말을 억지로 찾으면 대상이 달라 보이게 만드는 거짓말이 된다. 갈라 주는 것은
 * **물음표 하나**로 충분하다 — 어느 언어에서나 물음이라는 뜻이고, 글은 실제로 물음에
 * 답하는 페이지다.
 */
function cardHtml(label, color, ask) {
  return page(
    `<div style="width:1200px;height:630px;position:relative;display:flex;flex-direction:column;
          align-items:center;justify-content:center;gap:56px;background:#0b0b0e;
          font-family:ui-sans-serif,system-ui,-apple-system,'Segoe UI',Roboto,sans-serif">
       <div style="position:absolute;top:0;left:0;right:0;height:10px;background:${color}"></div>
       <div style="color:#f4f4f5;font-size:76px;font-weight:600;letter-spacing:-.02em;
             text-align:center;padding:0 80px;line-height:1.15">${label}${
               ask ? `<span style="color:${color}"> ?</span>` : ""
             }</div>
       <div style="display:flex;align-items:center;gap:18px">
         <div style="width:52px;height:52px">${MARK}</div>
         <div style="color:#a1a1aa;font-size:40px;font-weight:500;letter-spacing:-.02em">toolsmith</div>
       </div>
       <div style="position:absolute;bottom:52px;display:flex;gap:12px">
         ${[0.9, 0.6, 0.35, 0.18]
           .map(
             (o) =>
               `<span style="width:12px;height:12px;border-radius:99px;background:${color};opacity:${o}"></span>`,
           )
           .join("")}
       </div>
     </div>`,
    1200,
    630,
    "#0b0b0e",
  );
}

/**
 * [출력 경로, 계열, 형식 표기, 물음표].
 *
 * **출력 경로가 URL 경로 그대로다** — `lib/site.ts` 의 `ogImageFor` 가 `/og{경로}.png`
 * 로 유도하므로 여기 적는 것과 저기 만드는 것이 어긋날 수 없다. 층 이름을 빼고
 * 슬러그만 적으면 세 층의 슬러그가 겹치는 순간 카드가 조용히 섞인다.
 *
 * 표기에 **어느 언어의 문장도 넣지 않는다.**
 */
const CARDS = [
  // ── 도구 ──
  ["tools/image-convert", "image", "HEIC · PNG · JPG · WebP"],
  ["tools/image-compress", "image", "JPG ↓"],
  ["tools/image-resize", "image", "4000 → 1200"],
  ["tools/remove-bg", "image", "JPG → PNG"],
  ["tools/upscale", "image", "1× → 4×"],
  ["tools/cutout", "image", "PNG ⌖"],
  ["tools/pdf-merge", "pdf", "PDF + PDF → PDF"],
  ["tools/pdf-split", "pdf", "PDF → 1 · 2 · 3"],
  ["tools/pdf-organize", "pdf", "PDF ↻"],
  ["tools/pdf-compress", "pdf", "PDF ↓"],
  ["tools/ocr", "pdf", "PDF · JPG → TXT"],
  ["tools/summarize", "pdf", "PDF → TXT"],
  ["tools/video-convert", "video", "MOV → MP4"],
  ["tools/video-compress", "video", "MP4 ↓"],
  ["tools/video-trim", "video", "MP4 ⟨ ⟩"],
  ["tools/video-to-gif", "video", "MP4 → GIF"],
  ["tools/audio-extract", "video", "MP4 → M4A · WAV"],
  ["tools/subtitles", "video", "MP4 → SRT · VTT"],
  ["tools/subtitle-translate", "video", "SRT → SRT"],
  ["tools/stems", "video", "MP3 → 4 × WAV"],
  ["tools/data-query", "data", "CSV · Parquet → SQL"],

  /*
   * ── Lab ──
   * 가린 자리를 블록으로 보인다(`█`). 도구가 실제로 쓰는 마스크 글자와 같은 것이고,
   * 읽을 필요가 없으므로 언어에 걸리지 않는다.
   */
  ["lab/pii", "lab", "TXT · PDF → ███"],

  /*
   * ── 설명 글 ──
   * 넷은 자기 도구와 표기가 같다(배경 제거·업스케일·스템·요약). 위 `cardHtml` 참고 —
   * 같은 대상을 다루므로 그래야 맞고, 물음표가 갈라 준다.
   */
  ["guides/what-is-heic", "image", "HEIC", true],
  ["guides/image-formats", "image", "JPG · PNG · WebP · AVIF", true],
  ["guides/how-background-removal-works", "image", "JPG → PNG", true],
  ["guides/does-upscaling-add-detail", "image", "1× → 4×", true],
  ["guides/why-pdf-is-large", "pdf", "PDF ↑", true],
  ["guides/why-pdf-wont-open", "pdf", "PDF ✕", true],
  ["guides/can-ai-summarize", "pdf", "PDF → TXT", true],
  ["guides/mov-vs-mp4", "video", "MOV ⇄ MP4", true],
  ["guides/srt-vs-vtt", "video", "SRT ⇄ VTT", true],
  ["guides/what-are-stems", "video", "MP3 → 4 × WAV", true],
  ["guides/csv-vs-excel", "data", "CSV ⇄ XLSX", true],
  ["guides/wav-vs-mp3", "video", "WAV ⇄ MP3", true],
  ["guides/what-is-a-codec", "video", "H.264 · VP9 · AAC", true],
  ["guides/why-video-is-sideways", "video", "MP4 ↻", true],
];

for (const dir of ["tools", "guides", "lab"]) {
  mkdirSync(path.join(ROOT, "public", "og", dir), { recursive: true });
}

for (const [out, family, label, ask = false] of CARDS) {
  const card = cardHtml(label, FAMILY_COLOR[family], ask);
  await shoot(browser, card, 1200, 630, path.join(ROOT, "public", "og", `${out}.png`));
}

await browser.close();
