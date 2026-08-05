# toolsmith

File tools that never upload your files. Images, video, audio, PDFs — converted,
compressed, split and transcribed **entirely inside the browser tab**.

**[toolsmith.writingdeveloper.blog](https://toolsmith.writingdeveloper.blog)** ·
21 tools · 6 languages · no backend, no account, no watermark

---

## "No upload" is a structural claim here, not a promise

There is no server to upload to. Every page is prerendered static HTML on a CDN;
all processing happens in a Web Worker in your tab. The paid converters can't
match this — server-side processing *is* their ad inventory — but it also means
we give up anything that needs a server.

You do not have to take our word for it. Open the network tab, or read the specs:
all 21 tools have one that runs the real conversion with request interception on and
fails if any outbound POST/PUT carries a byte of your file.

Models are the one exception, and they are downloads *to* you, never uploads:
they come from the Hugging Face CDN and only after you press the button.

## Three things that cost us the most

### 1. `@ffmpeg/core` is GPL, and shipping it to a browser is distribution

The wasm binary is built with `--enable-gpl --enable-libx264 --enable-libx265`.
Sending those 30.7 MB to a visitor is distribution, so the whole site becomes GPL.
Almost every "convert video in your browser" tutorial skips this.

We went to **WebCodecs** instead — built into the browser, 0 MB to download,
hardware accelerated. We only open the containers ourselves: `mp4box.js` (BSD-3) to
demux, `mp4-muxer`/`webm-muxer` (MIT) to mux. MOV→MP4 became a *remux* — no
re-encoding at all, so it is lossless and near-instant.

### 2. Four video tools rotated portrait video sideways, with every test green

Phones store portrait video as landscape pixels plus a rotation matrix in the `tkhd`
box. We never read it, so convert, trim, compress and GIF all emitted sideways video.

The tests were green because **every video fixture we had was landscape**. It was not
a bug that slipped through review — it was a hole in the sample set. Two further traps
came with it: matching dimensions do *not* prove correct orientation (180° preserves
them, and 90°/270° are indistinguishable by size alone), and the four rotated files
had to be compared **each against its own source**, not against each other.

The fix also splits by output: MP4 rewrites the matrix, WebM and GIF must bake the
rotation into pixels.

### 3. A clean license does not mean a usable model

Picking on-device models turned out to be five gates — *exists → license → size →
speed → quality* — and every one of them rejected a candidate we had already
committed to on paper:

- **Exists.** A well-cited candidate table pointed at a model that does not exist.
- **License.** Kokoro TTS has genuinely clean weights, but its grapheme-to-phoneme
  step bundles a compiled eSpeak NG (GPL-3.0). The license gate is not a weights gate —
  it covers everything the model *requires* to run. Spleeter was the third "code is
  MIT, weights are not" we hit.
- **Quality.** Two Apache-2.0 summarizers copied the source text back instead of
  summarizing it. A clean license is worth nothing if the model cannot do the job.

And a runtime version can flip a model verdict: subtitle translation only works on
transformers.js **3.7.6**, summarization only on **4.2.0**. Unifying them silently
kills one.

The full engineering log — every rejected candidate, every measurement — is in
[`docs/TOOLS.md`](docs/TOOLS.md). It is written in Korean.

## What it does

| | |
|---|---|
| **Images** | convert (incl. HEIC), compress, resize/crop |
| **PDF** | merge, split, rotate/delete pages, compress (re-encodes JPEGs only, so text stays text) |
| **Video** | convert, compress, trim, extract audio, to GIF |
| **On-device models** | background removal, upscaling, click-to-cutout, subtitles, subtitle translation, stem separation, summarization, OCR |
| **Data** | SQL over CSV/Parquet via DuckDB-wasm — the file is handed over as a handle, never read into memory |

Results chain: finish in one tool and hand the output straight to the next. The blob
travels through IndexedDB and is deleted the moment it is claimed.

## Stack

- Next.js 16 (App Router, Turbopack) + TypeScript (strict) + Tailwind 4
- Fully static: 235 prerendered pages, zero server compute, no middleware
- Processing: Web Workers + `OffscreenCanvas` / WASM / WebCodecs / WebGPU
- ONNX Runtime Web is loaded from a CDN and is deliberately **not** an npm dependency —
  its default export embeds the wasm as base64, so importing it ships ~20 MB from your host
- 411 Playwright specs across two projects (one forces the WebGPU path)

## Development

```bash
pnpm install
pnpm dev        # http://localhost:3000
pnpm build      # includes typecheck
pnpm test       # Playwright; starts its own dev server
pnpm fixtures   # regenerate tests/fixtures
```

Specs verify decoded output, not UI text — magic bytes, real pixel values, output
dimensions. The word "converted" appearing on screen proves nothing.

## Layout

```
app/
  (root)/page.tsx        "/" language picker — static, no redirect
  [locale]/
    layout.tsx           <html lang>, header/footer, hreflang
    page.tsx             home — tool grid, driven by lib/tools.ts
    tools/<slug>/        page.tsx (server) + <Tool>.tsx ('use client') + *.worker.ts
    guides/ lab/
lib/
  tools.ts               tool registry
  i18n/                  en is the type source; the other five are enforced by `satisfies`
  image/ pdf/ video/     pure processing modules — never touch window or document
  onnx/runtime.ts        the only place a model runtime is opened
  segment/ upscale/ subtitles/ translate/ stems/ summarize/ ocr/ pii/
  handoff.ts             the only path a result takes from one tool to the next
tests/                   Playwright specs + fixtures
docs/TOOLS.md            master log (Korean)
```

## Known gaps

Kept here honestly rather than quietly:

- **AVIF encoding** is unverified — the test Chromium does not support it, so it drops
  off the capability list automatically.
- **Safari's native HEIC path** is unverified. Chrome's libheif path was checked with
  real iPhone photos.
- **Summarization requires WebGPU** and has nowhere to fall back to: the wasm execution
  provider has no implementation of the operators this export uses.
- Animated GIFs keep only the first frame when converted. The UI says so before you start.

## License

MIT — see [`LICENSE`](LICENSE).

Third-party models are downloaded at runtime from the Hugging Face CDN under their own
licenses (Apache-2.0, BSD-3, MIT). No copyleft dependency is used anywhere, by rule.
