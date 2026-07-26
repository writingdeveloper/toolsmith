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
