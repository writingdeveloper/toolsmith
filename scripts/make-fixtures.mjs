/**
 * QA 픽스처 생성. `node scripts/make-fixtures.mjs`
 * HEIC 는 sharp 로 인코딩할 수 없어 여기서 만들지 못한다 — 실기기 사진으로 수동 검증한다.
 */
import { execFileSync } from "node:child_process";
import { mkdir, stat, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import sharp from "sharp";
import { PDFDocument, StandardFonts, degrees, rgb } from "pdf-lib";

const OUT = new URL("../tests/fixtures/", import.meta.url);
await mkdir(OUT, { recursive: true });

const write = async (name, buffer) => {
  await writeFile(new URL(name, OUT), buffer);
  console.log(`${name} — ${buffer.length} bytes`);
};

// 1) 사진에 가까운 큰 JPEG (압축 여지가 있어야 절감률 검증이 의미 있다)
const noise = Buffer.alloc(1600 * 1200 * 3);
for (let i = 0; i < noise.length; i += 3) {
  const x = (i / 3) % 1600;
  const y = Math.floor(i / 3 / 1600);
  noise[i] = (x * 0.15 + y * 0.05) % 256;
  noise[i + 1] = (y * 0.2) % 256;
  noise[i + 2] = (x * 0.05 + y * 0.15) % 256;
}
await write(
  "photo.jpg",
  await sharp(noise, { raw: { width: 1600, height: 1200, channels: 3 } }).jpeg({ quality: 98 }).toBuffer(),
);

// 2) 알파 채널 PNG — JPG 변환 시 검게 뭉개지지 않는지 확인용
await write(
  "alpha.png",
  await sharp({
    create: { width: 800, height: 600, channels: 4, background: { r: 220, g: 40, b: 90, alpha: 0.35 } },
  })
    .png()
    .toBuffer(),
);

// 3) EXIF orientation=6 (시계방향 90도) — 아이폰 세로 사진과 같은 상황
await write(
  "rotated.jpg",
  await sharp({ create: { width: 1200, height: 600, channels: 3, background: { r: 30, g: 120, b: 200 } } })
    .withMetadata({ orientation: 6 })
    .jpeg({ quality: 95 })
    .toBuffer(),
);

/*
 * PDF 픽스처.
 *
 * 페이지마다 **크기를 다르게** 만든다. 병합 결과를 다시 파싱했을 때 페이지 크기 수열이
 * 곧 지문이 되어, 순서가 실제로 보존됐는지를 UI 텍스트 없이 증명할 수 있다.
 */
async function makePdf(pages, options = {}) {
  const doc = await PDFDocument.create();
  const font = await doc.embedFont(StandardFonts.Helvetica);
  for (const [width, height, label] of pages) {
    const page = doc.addPage([width, height]);
    page.drawText(label, { x: 12, y: height - 40, size: 24, font, color: rgb(0.1, 0.1, 0.1) });
  }
  return Buffer.from(await doc.save(options));
}

await write("a.pdf", await makePdf([[200, 400, "A1"], [210, 410, "A2"]]));
await write("b.pdf", await makePdf([[300, 300, "B1"]]));

// 분할용 5쪽. 쪽마다 크기와 글자가 달라서 어느 쪽이 어디로 갔는지 되짚을 수 있다.
await write(
  "pages5.pdf",
  await makePdf([
    [201, 401, "P1"],
    [202, 402, "P2"],
    [203, 403, "P3"],
    [204, 404, "P4"],
    [205, 405, "P5"],
  ]),
);

/*
 * 압축용. 큰 JPEG 사진이 박힌 2쪽 + 글자.
 * "이미지는 줄었는데 글자는 살아 있는가" 를 가리는 픽스처다.
 */
const photoJpeg = await sharp(noise, { raw: { width: 1600, height: 1200, channels: 3 } })
  .jpeg({ quality: 100 })
  .toBuffer();
{
  const doc = await PDFDocument.create();
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const image = await doc.embedJpg(photoJpeg);
  for (const label of ["C1", "C2"]) {
    const page = doc.addPage([600, 500]);
    page.drawImage(image, { x: 20, y: 120, width: 560, height: 350 });
    page.drawText(label, { x: 20, y: 60, size: 28, font, color: rgb(0.1, 0.1, 0.1) });
  }
  await write("photo.pdf", Buffer.from(await doc.save()));
}

/*
 * /Rotate 90 이 이미 박힌 1쪽짜리. 스캔 문서가 흔히 이렇다.
 * 회전을 "덮어쓰는지 더하는지" 를 가르는 픽스처다.
 */
const tilted = await PDFDocument.create();
{
  const font = await tilted.embedFont(StandardFonts.Helvetica);
  const page = tilted.addPage([300, 500]);
  page.drawText("T1", { x: 12, y: 460, size: 24, font, color: rgb(0.1, 0.1, 0.1) });
  page.setRotation(degrees(90));
}
await write("tilted.pdf", Buffer.from(await tilted.save()));

/*
 * 영상 픽스처. 로컬 ffmpeg 로 만든다(브라우저에서 쓰는 것이 아니라 **입력 재료**일 뿐이라
 * GPL 문제와 무관하다 — 우리가 배포하는 코드에는 ffmpeg 가 들어가지 않는다).
 *
 * H.264 + AAC, 320x240, 2초. WebCodecs 파이프라인이 실제로 다루는 조합이다.
 */
const clipPath = fileURLToPath(new URL("clip.mp4", OUT));
try {
  execFileSync(
    "ffmpeg",
    [
      "-y",
      "-f", "lavfi", "-i", "testsrc=size=320x240:rate=15:duration=2",
      "-f", "lavfi", "-i", "sine=frequency=440:duration=2",
      "-c:v", "libx264", "-profile:v", "baseline", "-pix_fmt", "yuv420p",
      "-c:a", "aac", "-b:a", "64k",
      "-shortest", "-movflags", "+faststart",
      clipPath,
    ],
    { stdio: "ignore" },
  );
  console.log(`clip.mp4 — ${(await stat(clipPath)).size} bytes`);

  /*
   * 트림용. 6초, **1초마다 키프레임**, main 프로파일이라 B프레임이 들어 있다.
   *
   * clip.mp4 로는 트림을 검증할 수 없다 — ffmpeg 기본 GOP 가 250이라 2초짜리에는
   * 키프레임이 맨 앞 하나뿐이고, 어디를 찍어도 0초로 떨어져 "스냅했다" 를 증명하지
   * 못한다. 여기서는 2.5초를 요청하면 2.0초로 내려앉는 것이 눈에 보인다.
   *
   * B프레임(-bf 2)은 일부러 넣었다. cts ≠ dts 인 파일을 다시 mux 할 때 우리가
   * compositionTimeOffset 을 제대로 넘기는지가 여기서만 드러난다.
   */
  const trimPath = fileURLToPath(new URL("trim.mp4", OUT));
  execFileSync(
    "ffmpeg",
    [
      "-y",
      "-f", "lavfi", "-i", "testsrc=size=320x240:rate=15:duration=6",
      "-f", "lavfi", "-i", "sine=frequency=440:duration=6",
      "-c:v", "libx264", "-profile:v", "main", "-pix_fmt", "yuv420p",
      "-g", "15", "-keyint_min", "15", "-sc_threshold", "0", "-bf", "2",
      "-c:a", "aac", "-b:a", "64k",
      "-shortest", "-movflags", "+faststart",
      trimPath,
    ],
    { stdio: "ignore" },
  );
  console.log(`trim.mp4 — ${(await stat(trimPath)).size} bytes`);

  /*
   * MOV. clip.mp4 와 **같은 스트림을 다른 상자에 담은 것**이다(-c copy).
   *
   * 영상 변환의 핵심 주장이 "MOV → MP4 는 코덱을 건드리지 않는다" 이므로, 그것을
   * 증명하려면 내용이 같고 상자만 다른 짝이 있어야 한다. 변환 결과를 clip.mp4 와
   * 견주면 "정말 아무것도 다시 인코딩하지 않았는가" 를 픽셀로 확인할 수 있다.
   */
  const movPath = fileURLToPath(new URL("clip.mov", OUT));
  execFileSync(
    "ffmpeg",
    ["-y", "-i", clipPath, "-c", "copy", "-f", "mov", movPath],
    { stdio: "ignore" },
  );
  console.log(`clip.mov — ${(await stat(movPath)).size} bytes`);

  // 오디오 트랙이 아예 없는 영상 — "꺼낼 소리가 없다" 를 정직하게 말하는지 확인용
  const silentPath = fileURLToPath(new URL("silent.mp4", OUT));
  execFileSync(
    "ffmpeg",
    [
      "-y",
      "-f", "lavfi", "-i", "testsrc=size=160x120:rate=10:duration=1",
      "-c:v", "libx264", "-profile:v", "baseline", "-pix_fmt", "yuv420p",
      "-an",
      silentPath,
    ],
    { stdio: "ignore" },
  );
  console.log(`silent.mp4 — ${(await stat(silentPath)).size} bytes`);
} catch {
  console.warn("clip.mp4 — ffmpeg 가 없어 건너뜀 (영상 스펙은 이 픽스처가 있어야 돈다)");
}

// PDF 가 아닌 파일에 .pdf 확장자만 붙인 것 — 조용히 통과하면 안 된다.
await write("broken.pdf", Buffer.from("%PDF-1.7\nthis is not a pdf\n"));

/*
 * "암호가 걸린" PDF.
 *
 * pdf-lib 은 암호화를 만들지 못한다. 대신 trailer 딕셔너리에 /Encrypt 참조를 주입한다 —
 * PDFDocument.load 가 EncryptedPDFError 를 던지는 조건이 바로 이것이라, 우리 쪽 오류
 * 분기를 그대로 통과한다. 진짜 RC4/AES 암호화 파일은 아니므로 실파일 확인은 별도다.
 * (xref 표는 trailer 앞에 오므로 이 주입으로 오프셋이 깨지지 않는다.)
 */
const plain = await makePdf([[250, 250, "E1"]], { useObjectStreams: false });
const marker = "trailer\n<<\n";
const at = plain.lastIndexOf(marker);
if (at < 0) throw new Error("trailer 딕셔너리를 찾지 못했다 — pdf-lib 출력 형식이 바뀌었다");
await write(
  "encrypted.pdf",
  Buffer.concat([
    plain.subarray(0, at + marker.length),
    Buffer.from("/Encrypt 1 0 R\n"),
    plain.subarray(at + marker.length),
  ]),
);

/*
 * OCR 픽스처.
 *
 * 글자가 든 그림이 있어야 "정말 읽었는가" 를 확인할 수 있다. 결과 문자열을 대조할
 * 것이므로 **읽기 쉬운 조건**으로 만든다 — 큰 산세리프, 검정 글씨, 흰 바탕.
 * 흔들린 사진에서도 되는지는 이 픽스처가 답할 수 있는 질문이 아니다.
 *
 * 숫자를 섞어 둔 이유: 글자만 있으면 사전 보정으로 맞힐 수 있어서 "정말 그림을
 * 읽었는가" 가 흐려진다. 12345 는 사전이 도와줄 수 없다.
 */
const OCR_TEXT_A = "TOOLSMITH OCR";
const OCR_TEXT_B = "TEST 12345";
const ocrSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="500">
  <rect width="1200" height="500" fill="white"/>
  <text x="60" y="200" font-family="Arial, Helvetica, sans-serif" font-size="120" fill="black">${OCR_TEXT_A}</text>
  <text x="60" y="380" font-family="Arial, Helvetica, sans-serif" font-size="120" fill="black">${OCR_TEXT_B}</text>
</svg>`;
const ocrPng = await sharp(Buffer.from(ocrSvg)).png().toBuffer();
await write("text.png", ocrPng);

/*
 * 스캔본을 흉내 낸 PDF. 페이지 안에 **그림만** 들어 있어 진짜 글자가 없다 —
 * 복사해서 붙일 수 없는, OCR 이 필요한 바로 그 PDF 다.
 */
const scan = await PDFDocument.create();
const embedded = await scan.embedPng(ocrPng);
const scanPage = scan.addPage([595, 842]); // A4
scanPage.drawImage(embedded, { x: 40, y: 500, width: 515, height: 215 });
await write("scan.pdf", Buffer.from(await scan.save()));

/*
 * 데이터 쿼리 픽스처.
 *
 * 열마다 **타입이 다르다** — 정수·문자열·소수·불리언·날짜. DuckDB 가 CSV 를 훑어
 * 타입을 알아맞히는지, Arrow 가 준 BigInt 를 우리가 화면에 제대로 옮기는지가 여기서 갈린다.
 * 도시가 겹치게 둔 것은 GROUP BY 결과를 손으로 검산할 수 있게 하기 위해서다
 * (Seoul 3건 합계 3600, Busan 2건 합계 900).
 */
const CSV_ROWS = [
  ["id", "name", "city", "amount", "active", "at"],
  [1, "Ada", "Seoul", 1200.5, true, "2024-01-02"],
  [2, "Grace", "Busan", 300, false, "2024-01-03"],
  [3, "Linus", "Seoul", 1800.25, true, "2024-02-11"],
  [4, "Ada", "Daegu", 50.75, true, "2024-02-12"],
  [5, "Alan", "Busan", 600, true, "2024-03-01"],
  [6, "Grace", "Seoul", 599.25, false, "2024-03-02"],
];
await write("sample.csv", Buffer.from(CSV_ROWS.map((r) => r.join(",")).join("\n") + "\n", "utf8"));

/*
 * sample.parquet 은 여기서 만들지 않는다.
 *
 * Node 에는 Parquet 을 쓰는 도구가 없고, 그것 하나 때문에 의존성을 늘리고 싶지 않았다.
 * 대신 **DuckDB 자신에게 쓰게 했다** — 브라우저에서 sample.csv 를 읽어
 * `COPY t TO 'out.parquet'` 한 결과를 저장한 것이 tests/fixtures/sample.parquet 이다.
 * 다시 만들어야 하면 그 일회용 스펙을 되살리면 된다(커밋 이력에 있다).
 */

/*
 * 배경 제거 픽스처.
 *
 * U²-Net 은 **눈에 띄는 것**(salient object)을 찾는 모델이다. 그러니 픽스처도 그래야
 * 한다 — 밝고 평평한 배경 한가운데에 어두운 덩어리 하나. 모서리는 확실히 배경이고
 * 가운데는 확실히 피사체이므로, 나온 PNG 의 알파를 그 두 지점에서 읽으면 마스크가
 * 물체 위에 앉았는지를 손으로 검산할 수 있다.
 *
 * 사람 사진이 아닌 것은 의도다. 저장소에 남의 얼굴을 넣지 않으면서도 배관은 그대로
 * 검증된다. 실제 사진에서의 품질(머리카락 등)은 스펙이 아니라 사람이 눈으로 본다.
 */
const SUBJECT = `<svg xmlns="http://www.w3.org/2000/svg" width="640" height="480">
  <rect width="640" height="480" fill="#eef1f4"/>
  <ellipse cx="320" cy="300" rx="110" ry="140" fill="#1d2b3a"/>
  <circle cx="320" cy="140" r="72" fill="#1d2b3a"/>
</svg>`;
await write("subject.png", await sharp(Buffer.from(SUBJECT)).png().toBuffer());
