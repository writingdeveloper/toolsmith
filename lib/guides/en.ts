import type { GuideCopy } from "./registry";

/**
 * 기준 글. 다른 언어는 이 모양을 그대로 따른다 (`satisfies GuideCopy`).
 *
 * **여기 적는 것은 우리가 실제로 재 본 것뿐이다.** 도구가 못 하는 것을 못 한다고
 * 적는 규칙(규칙 3)은 글에도 그대로 적용된다 — 오히려 그것이 다른 변환기 안내글과
 * 구별되는 지점이다.
 */
export const en = {
  hub: {
    metaTitle: "Guides — file formats, explained plainly",
    metaDescription:
      "Why HEIC won't open, which image format to pick, why your PDF is huge, MOV versus MP4. Short answers from files we actually measured.",
    h1: "Guides",
    lead: "The questions that come before the tool. Every answer here comes from files we opened and measured, not from a spec sheet.",
    breadcrumb: "Guides",
    toolsHeading: "Do it now, without uploading anything",
    relatedHeading: "Worth reading",
    updatedLabel: "Updated",
  },

  articles: {
    "what-is-heic": {
      metaTitle: "What Is a HEIC File and Why Won't It Open?",
      metaDescription:
        "HEIC is what your iPhone saves instead of JPEG. Here is why it is half the size, why Windows and most websites reject it, and what you lose converting.",
      h1: "What is a HEIC file, and why won't it open?",
      lead: "Your iPhone stopped saving JPEGs years ago. Here is what it saves instead, why almost every upload form rejects it, and what a conversion actually costs you.",
      sections: [
        {
          h2: "HEIC is a photo squeezed with video compression",
          body: [
            "A HEIC file is a still image stored in the HEIF container and compressed with HEVC — the same codec used for 4K video. Video codecs are far better at predicting what a picture looks like than the 1992 maths inside JPEG, so the same photo lands at roughly half the size with no visible difference.",
            "Apple switched the iPhone camera to HEIC with iOS 11 in 2017. If your photos end in .HEIC, that is all this is: a normal photo in a newer wrapper.",
          ],
        },
        {
          h2: "Why it opens on your phone and nowhere else",
          body: [
            "Apple ships the decoder, so HEIC opens everywhere on iOS and macOS. Off that island it gets patchy:",
          ],
          list: [
            "Windows 10 and 11 need the HEIF Image Extensions from the Microsoft Store, and that package leans on the HEVC codec, which is a separate paid item on some machines.",
            "Chrome and Firefox do not decode HEIC. Safari does.",
            "Most upload forms — job applications, insurance claims, printing services — check the extension and refuse .heic outright, whether or not they could read it.",
          ],
        },
        {
          h2: "Two ways out, and they solve different problems",
          body: [
            "You can stop your iPhone making them: Settings → Camera → Formats → Most Compatible. From then on the camera saves JPEG. That fixes the future and does nothing for the thousands of photos already on the phone.",
            "Or you convert. That is the only option for what you already have, and it is the right one when you need a single photo out of the phone right now.",
          ],
        },
        {
          h2: "What you lose in the conversion",
          body: [
            "Converting HEIC to JPEG re-encodes the picture, so it is lossy — going back and forth repeatedly will visibly soften it. Convert from the original each time rather than from a previous conversion.",
            "A few things do not survive the trip. A Live Photo becomes a single still, because the motion lives in a separate video track that JPEG has nowhere to put. Depth maps used for Portrait mode and HDR gain maps are dropped for the same reason. Rotation, date and location in EXIF do carry over.",
            "If size is what you are chasing rather than compatibility, note that a JPEG at default quality will usually be larger than the HEIC it came from. That is the trade: HEIC is smaller, JPEG opens everywhere.",
          ],
        },
        {
          h2: "Converting without handing the photo to anyone",
          body: [
            "HEIC files are personal in a way that a spreadsheet is not — they carry faces, and the EXIF carries where you were standing. Uploading them to a free converter to get a JPEG back is a poor trade.",
            "Our image converter decodes HEIC inside the browser tab. The decoder is about 1.5 MB and is fetched only at the moment a HEIC file actually arrives — if you never use HEIC, nothing is downloaded. The photo itself is never sent anywhere.",
          ],
        },
      ],
      faq: [
        {
          q: "Is HEIC the same as HEIF?",
          a: "HEIF is the container format; HEIC is the name for a HEIF file whose images are compressed with HEVC. Apple uses the .heic extension. In practice the two words get used interchangeably.",
        },
        {
          q: "Will converting lose quality?",
          a: "Yes, slightly — JPEG and WebP are lossy, so the picture is re-encoded. One conversion from the original is usually invisible. Repeatedly converting an already-converted file is what does the damage.",
        },
        {
          q: "Can I convert HEIC on a phone?",
          a: "Yes. The conversion runs in the browser, so a phone works as long as the browser is current. Large batches are slower on a phone simply because there is less CPU to go around.",
        },
      ],
    },

    "image-formats": {
      metaTitle: "PNG, JPG, WebP or AVIF: Which to Use",
      metaDescription:
        "One question decides the format: is it a photo, or is it flat colour and text? Here is what each format is actually good at, with the traps.",
      h1: "PNG, JPG, WebP or AVIF — which should you use?",
      lead: "Four formats, one question that settles most of it: is the image a photograph, or is it flat colour, text and lines?",
      sections: [
        {
          h2: "The question that decides it",
          body: [
            "Photographs are made of gradual, noisy variation. Lossy formats — JPG, WebP, AVIF — are built for exactly that, and they get small by throwing away detail your eye does not track.",
            "Screenshots, logos, diagrams and anything with text are the opposite: large flat areas and hard edges. Lossy compression puts visible fuzz around the edges of letters, and because there is little noise to discard it does not even save much. That is what PNG is for.",
          ],
        },
        {
          h2: "JPG — the one that opens everywhere",
          body: [
            "Thirty years old, understood by everything ever built, and still perfectly good for photographs. It cannot store transparency, and it will show blocky artefacts if you push quality far down.",
            "Pick it when the file has to be opened by software you do not control — a printer, a government upload form, a colleague's ancient laptop.",
          ],
        },
        {
          h2: "PNG — lossless, transparent, and wrong for photos",
          body: [
            "PNG never discards a pixel, and it supports full transparency. That makes it right for logos, screenshots, icons and anything you will edit again later.",
            "It is a bad container for a photograph, and this is where people get stuck: running a photographic PNG through a compressor barely helps. Lossless compression has almost nothing to remove from photographic noise. If your PNG photo is 8 MB, no PNG optimiser will make it small — converting it to JPG or WebP will.",
          ],
        },
        {
          h2: "WebP — the sensible default for the web",
          body: [
            "WebP does both jobs: lossy for photos, lossless with transparency for graphics, plus animation. At comparable quality it typically lands 25–35% below JPEG.",
            "Every current browser displays it. The remaining reason to avoid it is software outside the browser — some older desktop apps and print workflows still will not open a .webp.",
          ],
        },
        {
          h2: "AVIF — smallest, slowest, and not everywhere yet",
          body: [
            "AVIF uses the AV1 video codec and is usually the smallest of the four at a given quality, particularly on photographs and at low bitrates. Encoding is slow — noticeably so for a large batch.",
            "There is a trap worth knowing: a browser being able to **display** AVIF does not mean it can **create** one. Encoding support is narrower than decoding support, and a browser asked to write a format it does not support will quietly hand back a PNG instead. That is why our converter builds its format list by encoding a test image and checking what actually came back, rather than by trusting a support table.",
          ],
        },
        {
          h2: "Short version",
          body: ["If you want a rule of thumb rather than a decision tree:"],
          list: [
            "Photo going on a website → WebP, or AVIF if size matters more than encoding time.",
            "Photo that has to open anywhere → JPG.",
            "Screenshot, logo, diagram, anything with text → PNG.",
            "Needs transparency → PNG or WebP. Never JPG.",
            "Already a JPG and just too big → resize the pixel dimensions first. Halving the width quarters the pixel count, and that beats any quality slider.",
          ],
        },
      ],
      faq: [
        {
          q: "Does converting PNG to JPG make it smaller?",
          a: "For a photograph, dramatically — often by 80% or more. For a screenshot or a logo it can make it larger and will blur the text edges. Check what the image actually is before converting.",
        },
        {
          q: "Is WebP safe to use now?",
          a: "In a browser, yes — every current browser displays it. Outside the browser it is patchier, so if the file is going to a print shop or into a desktop application, JPG or PNG is the safer hand-off.",
        },
        {
          q: "Why is my compressed PNG the same size?",
          a: "Because PNG compression is lossless and photographic detail is nearly incompressible. There is nothing safe left to remove. Change the format or reduce the pixel dimensions instead.",
        },
      ],
    },

    "why-pdf-is-large": {
      metaTitle: "Why Your PDF Is So Large, and What Shrinks It",
      metaDescription:
        "Almost every oversized PDF is oversized for one reason: the pictures inside it. Here is how to tell what you have and what actually reduces it.",
      h1: "Why your PDF is so large — and what actually shrinks it",
      lead: "A 40 MB PDF and a 400 KB PDF can look identical on screen. The difference is almost never the text.",
      sections: [
        {
          h2: "A PDF is a box, and the weight is the pictures",
          body: [
            "PDF is a container. Text is stored as characters plus an embedded font — a few hundred kilobytes for an entire book. Vector drawings are stored as coordinates and are similarly tiny.",
            "Images are stored as images. A single phone photo dropped into a document can outweigh two hundred pages of text. When a PDF is enormous, it is carrying pictures.",
          ],
        },
        {
          h2: "First work out which kind of PDF you have",
          body: [
            "Try to select a sentence with your cursor. If the text highlights word by word, it is a text PDF — the characters are real. If nothing highlights, or the whole page highlights as one block, every page is a photograph of a page.",
            "That single test tells you what will work:",
          ],
          list: [
            "Text PDF that is large → something bulky was inserted: photos, a chart pasted as an image, or a scanned cover page. Compressing the images is the fix.",
            "Scanned PDF → the pages themselves are the images. Re-encoding them is the only lever, and there is a floor below which the scan stops being readable.",
          ],
        },
        {
          h2: "What actually reduces the size",
          body: [
            "Re-encode the embedded JPEGs at a lower quality. This is the main lever and it is usually enough — the text, links, bookmarks and the ability to search all survive untouched, because none of them were the problem.",
            "Remove pages you do not need. Obvious, and routinely the biggest single win — the appendix of scans is often most of the file.",
            "Split the document. If you only need to send chapter 3, send chapter 3.",
            "Reduce the resolution of the images. A scan at 600 DPI is four times the pixels of the same scan at 300 DPI, and 300 DPI already exceeds what any screen shows.",
          ],
        },
        {
          h2: "What does not work",
          body: [
            "Putting it in a ZIP saves close to nothing. The streams inside a PDF are already compressed, and compressing compressed data is a null operation.",
            "The other trap is the aggressive kind of \"compress\": a tool that renders every page to a bitmap and rebuilds the PDF around those pictures. The number gets smaller and the document is ruined — the text is now a photograph of text, so it cannot be searched, cannot be copied, cannot be read by a screen reader, and prints soft. If you compressed a PDF and can no longer select its text, this is what happened.",
          ],
        },
        {
          h2: "What our compressor does, and when it refuses",
          body: [
            "It re-encodes JPEG images and leaves everything else alone. Text stays text. Fonts, links and structure come through unchanged.",
            "The consequence is that it sometimes has nothing to do. We ran it against a real 1929 scanned receipt whose pages were not stored as JPEG, and it produced no download at all rather than handing back a file the same size with a smaller-sounding label. If your scan is stored in another format, this is the honest answer — reducing the page count or the resolution is the route that remains.",
          ],
        },
      ],
      faq: [
        {
          q: "How much smaller will my PDF get?",
          a: "It depends entirely on what is inside. Photo-heavy documents often drop by half or more. A pure text PDF is already near its floor and will barely move — there was nothing heavy in it to begin with.",
        },
        {
          q: "Will compressing break the text or the links?",
          a: "Not with an image-only approach. Only the embedded pictures are rewritten; characters, fonts, links and bookmarks are copied through. Tools that flatten every page to an image do destroy all of that.",
        },
        {
          q: "My scanned PDF barely shrank. Why?",
          a: "Scanners do not all store pages as JPEG. If the pages are in another image format, a JPEG re-encoder has nothing to grip. Splitting out the pages you actually need is usually the larger win anyway.",
        },
      ],
    },

    "mov-vs-mp4": {
      metaTitle: "MOV vs MP4: What Actually Differs",
      metaDescription:
        "MOV and MP4 are close relatives, and converting between them usually needs no re-encoding at all. Here is when it is free and when it costs quality.",
      h1: "MOV vs MP4 — what actually differs",
      lead: "They are closer than the different extensions suggest. Knowing how close tells you when a conversion is free and when it costs you picture quality.",
      sections: [
        {
          h2: "Same family, different surname",
          body: [
            "MOV is Apple's QuickTime File Format. MP4 is the ISO base media file format — which was standardised by taking QuickTime as the starting point. They are parent and child, not rivals.",
            "Both are containers: boxes that hold a video track, an audio track, timing information and metadata. The video inside is usually the identical codec either way — H.264 or HEVC. A .mov from an iPhone and a .mp4 from the same iPhone can hold byte-for-byte equivalent video.",
          ],
        },
        {
          h2: "So why does anything reject MOV?",
          body: [
            "Mostly by extension, not by inability. Upload forms, video platforms, editors and presentation software frequently check the filename and decline .mov before ever opening it.",
            "MOV also permits a few things MP4 does not — certain Apple-specific tracks and codecs like ProRes — so software that plays MP4 fine cannot promise it will play every MOV. It is easier to refuse the whole extension.",
          ],
        },
        {
          h2: "Converting without re-encoding is the important part",
          body: [
            "Because the video track is already in a form MP4 accepts, converting MOV to MP4 does not need to decode and re-compress anything. The tracks are lifted out of the QuickTime box and written into an MP4 box. This is called remuxing.",
            "It is lossless — the picture is bit-identical to the original — and it takes seconds rather than minutes, because no encoder ever runs. Any tool that takes ten minutes and comes back softer than the original did the wrong thing.",
            "Trimming works the same way: cutting a clip out of an MP4 needs no encoder either. The catch is that cuts land on keyframes, so the start of a trim can shift by a fraction of a second. That is a real limitation and it is worth knowing before you cut, rather than after.",
          ],
        },
        {
          h2: "When re-encoding is unavoidable",
          body: [
            "Changing the codec, not the box, is what costs time and quality:",
          ],
          list: [
            "MP4 to WebM — different codec family entirely, so every frame is decoded and re-compressed.",
            "Making the file smaller — compression means re-encoding by definition; there is no free version of it.",
            "Video to GIF — GIF is a completely different thing, capped at 256 colours, and the result will be several times larger than the video it came from.",
          ],
        },
        {
          h2: "The rotation trap nobody warns you about",
          body: [
            "Film something vertically on a phone and the file usually does not contain vertical pixels. The sensor writes a landscape frame and the container records a rotation matrix saying \"turn this 90 degrees when playing\". Players read it. Naive converters do not.",
            "That is how a portrait clip comes out of a converter lying on its side. We measured exactly this in four of our own tools in July 2026 — convert, trim, compress and GIF all shipped sideways video — and the fix differs by output: for MP4 you rewrite the matrix, for WebM and GIF there is no matrix, so the pixels must actually be rotated before encoding.",
            "It survived a long time because every video test file we had was landscape. It was not a bug that hid; it was a hole in the samples.",
          ],
        },
      ],
      faq: [
        {
          q: "Does converting MOV to MP4 lose quality?",
          a: "It does not have to. If the video is already H.264 or HEVC, the tracks can be copied into an MP4 container untouched, which is bit-for-bit lossless. Only a codec change forces a re-encode.",
        },
        {
          q: "Why is my converted file the same size?",
          a: "Because a container swap does not compress anything — it moves the same video into a different box. If you want a smaller file you need compression, which is a re-encode and a separate operation.",
        },
        {
          q: "Which should I keep, MOV or MP4?",
          a: "MP4, unless you are staying inside Apple's editing tools. Everything accepts MP4; MOV gets refused by extension often enough to be a nuisance.",
        },
      ],
    },
  },
} satisfies GuideCopy;
