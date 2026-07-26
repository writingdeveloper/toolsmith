/**
 * PDF 압축 — **글자를 살린 채로** 안에 박힌 사진만 다시 압축한다.
 *
 * 페이지를 통째로 그림으로 굽는 방식이 더 많이 줄지만, 그러면 글자가 이미지가 되어
 * 선택·검색·화면낭독기가 전부 죽는다. 큰 PDF 가 큰 이유는 대개 사진이므로
 * 사진만 다시 압축해도 대부분의 경우 충분히 줄어든다.
 *
 * window / document 를 참조하지 않는다 (워커에서 돈다). OffscreenCanvas 만 쓴다.
 */

import { guarded, load, loadPdfLib, MAX_TOTAL_BYTES, PdfError, stamp } from "./document";

export interface CompressOptions {
  /** JPEG 품질 0..1 */
  quality: number;
  /** 이미지 긴 변 상한(px). 0 이면 원본 해상도 유지 */
  maxEdge: number;
}

export interface CompressResult {
  bytes: Uint8Array;
  before: number;
  after: number;
  /** 손댈 수 있는 사진(JPEG)을 몇 개 찾았는지 */
  images: number;
  /** 그중 실제로 더 작아져서 갈아 끼운 수 */
  rewritten: number;
}

function fit(width: number, height: number, maxEdge: number) {
  if (!maxEdge || (width <= maxEdge && height <= maxEdge)) return { width, height };
  const scale = maxEdge / Math.max(width, height);
  return {
    width: Math.max(1, Math.round(width * scale)),
    height: Math.max(1, Math.round(height * scale)),
  };
}

export async function compressPdf(
  bytes: Uint8Array,
  options: CompressOptions,
): Promise<CompressResult> {
  return guarded(async () => {
    if (bytes.byteLength > MAX_TOTAL_BYTES) throw new PdfError("TOO_LARGE");

    const { PDFName, PDFRawStream, PDFArray } = await loadPdfLib();
    const doc = await load(bytes);
    if (doc.getPageCount() === 0) throw new PdfError("NO_PAGES");
    const ctx = doc.context;

    const IMAGE = PDFName.of("Image");
    const DCT = PDFName.of("DCTDecode");

    let images = 0;
    let rewritten = 0;

    for (const [ref, obj] of ctx.enumerateIndirectObjects()) {
      if (!(obj instanceof PDFRawStream)) continue;
      const dict = obj.dict;
      if (dict.get(PDFName.of("Subtype")) !== IMAGE) continue;

      // JPEG(DCTDecode)만 손댄다. Flate 이미지는 색공간·비트깊이 조합이 너무 다양해
      // 잘못 건드리면 색이 뒤집힌 문서가 나온다.
      const filter = dict.get(PDFName.of("Filter"));
      const isJpeg =
        filter === DCT ||
        (filter instanceof PDFArray && filter.asArray().some((entry) => entry === DCT));
      if (!isJpeg) continue;

      // Decode 배열은 색을 반전시키는 등 특수 지시다. 다시 인코딩하면 그 의미가 깨진다.
      if (dict.get(PDFName.of("Decode"))) continue;

      images += 1;

      // 투명도 마스크는 이미지와 픽셀 크기가 맞아야 한다 → 마스크가 있으면 크기를 건드리지 않는다.
      const hasMask = Boolean(dict.get(PDFName.of("SMask")) ?? dict.get(PDFName.of("Mask")));

      try {
        const source = new Blob([obj.contents as BlobPart], { type: "image/jpeg" });
        const bitmap = await createImageBitmap(source);
        const target = hasMask
          ? { width: bitmap.width, height: bitmap.height }
          : fit(bitmap.width, bitmap.height, options.maxEdge);

        const canvas = new OffscreenCanvas(target.width, target.height);
        // JPEG 에는 알파가 없다. 깔아주지 않으면 투명 영역이 검게 나온다.
        const ctx2d = canvas.getContext("2d", { alpha: false });
        if (!ctx2d) {
          bitmap.close();
          continue;
        }
        ctx2d.fillStyle = "#ffffff";
        ctx2d.fillRect(0, 0, target.width, target.height);
        ctx2d.drawImage(bitmap, 0, 0, target.width, target.height);
        bitmap.close();

        const encoded = await canvas.convertToBlob({
          type: "image/jpeg",
          quality: options.quality,
        });
        // 미지원 형식이면 브라우저가 조용히 PNG 를 뱉는다 — 그대로 넣으면 문서가 깨진다.
        if (encoded.type !== "image/jpeg") continue;

        const next = new Uint8Array(await encoded.arrayBuffer());
        // 이미 잘 압축된 사진이면 다시 인코딩해봐야 커지기만 한다. 그럴 땐 원본을 둔다.
        if (next.byteLength >= obj.contents.length) continue;

        const nextDict = dict.clone(ctx);
        nextDict.set(PDFName.of("Width"), ctx.obj(target.width));
        nextDict.set(PDFName.of("Height"), ctx.obj(target.height));
        nextDict.set(PDFName.of("Filter"), DCT);
        // 캔버스는 언제나 sRGB 를 뱉는다. 원본이 CMYK 였더라도 여기서 RGB 가 된다.
        nextDict.set(PDFName.of("ColorSpace"), PDFName.of("DeviceRGB"));
        nextDict.set(PDFName.of("BitsPerComponent"), ctx.obj(8));
        nextDict.set(PDFName.of("Length"), ctx.obj(next.byteLength));
        nextDict.delete(PDFName.of("DecodeParms"));

        ctx.assign(ref, PDFRawStream.of(nextDict, next));
        rewritten += 1;
      } catch {
        // 이 브라우저가 못 읽는 사진(CMYK 등)은 건드리지 않고 그대로 둔다
      }
    }

    stamp(doc);
    const out = await doc.save();
    return { bytes: out, before: bytes.byteLength, after: out.byteLength, images, rewritten };
  });
}
