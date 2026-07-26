/**
 * QA 픽스처 생성. `node scripts/make-fixtures.mjs`
 * HEIC 는 sharp 로 인코딩할 수 없어 여기서 만들지 못한다 — 실기기 사진으로 수동 검증한다.
 */
import { mkdir, writeFile } from "node:fs/promises";
import sharp from "sharp";

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
