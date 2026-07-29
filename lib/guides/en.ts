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
      "Why HEIC won't open, which image format to pick, why your PDF is huge, what AI upscaling can't do. Short answers from files we actually measured.",
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

    "how-background-removal-works": {
      metaTitle: "How Background Removal Actually Works",
      metaDescription:
        "A model guesses how much of each pixel is the subject — nothing is traced or cut. That explains the soft hair, and the photos it cannot handle at all.",
      h1: "How background removal actually works — and when it fails",
      lead: "Nothing is being cut out. A model is guessing, pixel by pixel, how much of each one belongs to the subject. Once you know that, every strange result you have seen makes sense.",
      sections: [
        {
          h2: "It produces a mask, not a cut-out",
          body: [
            "The model looks at your photo and outputs a greyscale image the same shape as it: white where it is confident that pixel is the subject, black where it is confident it is background, and every grey in between where it is unsure. That greyscale image becomes the transparency channel of the result.",
            "So there is no outline, no path, and nothing is being traced. What you get back is confidence, rendered as transparency. Hair, fur, motion blur, glass and shadows land in the middle of that range — and the softness you see at those edges is the model being honest rather than the model being bad.",
          ],
        },
        {
          h2: "The model is hunting for one obvious thing",
          body: [
            "U²-Net, which is what runs here, is a salient object detection network. It was trained to answer one question: in this picture, what stands out? A single subject against a reasonably plain background is exactly what it is for.",
            "Give it a picture with no single answer and it does not refuse — it spreads a weak, uncertain mask across everything. We ran twenty-four photographs through it and read the alpha values. The ten with no single subject came back as translucent smears or as nothing at all: an aerial shot of forest produced **0.0%** confident pixels while still technically 'succeeding'.",
            "That failure is quiet, which is why the tool now measures the mask and tells you rather than handing you an empty PNG.",
          ],
          list: [
            "Works: one person, a product on a table, a pet, a shoe, a bicycle, a mountain against sky.",
            "Does not work: crowds, traffic, a field of tulips, a bookshelf, a coral reef, forest from above.",
            "In between: a group of similar objects — you may get some of them, half-transparent.",
          ],
        },
        {
          h2: "Why edges soften, and why big photos look worse",
          body: [
            "The model sees your image at 320×320 pixels no matter what size it really is, and the mask comes back at 320×320 too. To apply it, that mask has to be stretched back up to the original dimensions. On a 4000-pixel photo, one mask pixel is covering roughly a dozen real ones, and you can see it along the outline.",
            "Nothing about picking a better photo fixes that — it is the shape of the method. If you plan to use the result small, it will not matter. If you plan to use it large, it will.",
            "There is also a straight quality-for-download trade. The fast model is 4.4 MB and the precise one is 168 MB: forty times apart, and visibly different on the same photograph. The small one tends to leave a faint ghost of the background; the large one separates hair and small props cleanly.",
          ],
        },
        {
          h2: "When the model should not be the one choosing",
          body: [
            "If the photo has several objects, or the thing you want is not the star of the frame, no amount of model quality helps — it was never asked which one you meant.",
            "That is a different tool. Click-based cutout runs a heavy encoder over the picture once, then answers each click almost instantly. We measured 6.0 seconds for the encoder and 0.10 seconds per click on CPU, which is the whole reason it can be a click-and-see interface rather than a wait-and-see one. One point usually gets part of an object; a second point tells it what else belongs.",
          ],
        },
        {
          h2: "Save it as PNG, or the transparency disappears",
          body: [
            "JPG has no transparency channel at all. Save a cut-out as JPG and the transparent region does not stay transparent — it comes back as white or black, and people are frequently surprised by this after the fact. PNG and WebP both carry alpha; use one of those.",
            "One more thing worth saying out loud: the photographs people run through background removal are usually of people. This runs inside the browser tab, so the picture is never sent anywhere — but the model has to be downloaded before it can start, and we tell you the size before you commit to it.",
          ],
        },
      ],
      faq: [
        {
          q: "Why did it say it couldn't find a subject?",
          a: "Because the mask came back weak everywhere rather than strong somewhere. We count confidently-foreground pixels and uncertain ones separately; if there are almost no confident pixels, or they are heavily outnumbered by uncertain ones, the honest answer is that the photo has no single subject to find.",
        },
        {
          q: "Can I get a clean edge around hair?",
          a: "Partly. The precise model is much better at hair than the fast one. But the mask is computed at 320×320 and enlarged, so on a high-resolution photo there is a limit to how fine that edge can be — it will never match a mask cut by hand.",
        },
        {
          q: "It removed the wrong object. Can I choose?",
          a: "Not with background removal — the model picks what stands out and has no way to know what you wanted. Use the click cutout tool instead: you point at the object you want, and add points to include or exclude parts.",
        },
      ],
    },

    "does-upscaling-add-detail": {
      metaTitle: "Does AI Upscaling Add Real Detail?",
      metaDescription:
        "No — it invents plausible detail. That makes it excellent on compressed images and actively worse on a clean photograph. We measured it both ways.",
      h1: "Does AI upscaling add real detail?",
      lead: "The short answer is no. The longer answer is more useful: it invents detail that looks right, and whether that helps depends entirely on what was wrong with your image in the first place.",
      sections: [
        {
          h2: "What the model is actually doing",
          body: [
            "Ordinary enlargement averages neighbouring pixels. It cannot invent anything, so the result is a larger, softer version of what you had — never sharper.",
            "An upscaling model does something different. It was trained on millions of pairs of images, each a large one and its shrunken twin, until it learned what a shrunken eyelash, brick wall or fabric weave tends to look like. Given a small image, it writes back a plausible large one.",
            "The word doing the work there is **plausible**. The detail it adds is not recovered — the information was thrown away when the image was made small, and it is gone. What comes back is a confident guess that resembles the sort of thing that was probably there.",
          ],
        },
        {
          h2: "We measured it losing to plain resizing",
          body: [
            "We took a public-domain photograph from 1896, shrank it to 240 pixels, then enlarged it four times both with the model and with ordinary high-quality resampling.",
            "The model lost. A checked fabric in the picture had its weave erased completely — the model read that fine, regular texture as noise and smoothed it away — and the face came out looking like wax. The plain enlargement was blurrier and more faithful.",
          ],
        },
        {
          h2: "And then measured it winning clearly",
          body: [
            "We saved the same photograph as a quality-35 JPEG first, which is roughly the state of a great many images that have been passed around the internet, and ran the comparison again. This time the model won by a wide margin: the blocky compression artefacts vanished and the edges came back.",
            "The reason is that this class of model is built to repair damage, not to magnify. It removes what it reads as noise. Compression blocking is noise, so it goes and the picture improves. Film grain and fine fabric are also read as noise, so they go too and the picture gets worse.",
            "That gives you a usable rule. If the problem with your image is that it has been compressed, screenshotted, or re-saved to death, the model will help. If the problem is only that it is small but otherwise clean, plain enlargement may be the more honest result.",
          ],
        },
        {
          h2: "The size wall is not arbitrary",
          body: [
            "Four times the width is sixteen times the pixels. A one-megapixel input becomes a sixteen-megapixel output, and every one of those pixels is produced by a neural network rather than copied.",
            "That is why there is a limit on input size, and why we disable the button and explain it rather than letting you try. Freezing the browser tab for several minutes and then producing nothing is the worst possible outcome, and it is what happens if the limit is not enforced.",
            "The 2× option is made by producing the 4× result and halving it, rather than by asking for 2× directly. Invented detail tidies up when it is shrunk, so the result is better. It takes the same time, because the expensive part happened either way.",
          ],
        },
        {
          h2: "The sharpest model is not the right model",
          body: [
            "We compared two candidates with acceptable licences. The transformer-based one is visibly sharper, and it took 9.7 seconds on a 128×128 image. The compact convolutional one took 16.5 seconds on a 512×512 image — sixteen times the pixels. Per pixel, that is roughly a sixtyfold difference.",
            "A graphics card does not rescue the slow one. We measured WebGPU at about 3.4× faster than CPU here, not the twenty or fifty times people expect, because shader compilation and moving data to the card cost real time. Three times faster is worth having, but a model that is unusable on a CPU is generally still unusable on a GPU.",
            "So the sharper model is the one nobody would wait for, and the one that ships is the one that finishes. This is the same judgement made for every model on this site.",
          ],
        },
      ],
      faq: [
        {
          q: "Can it read a licence plate, like on TV?",
          a: "No — and this is the most important thing to understand about it. If the characters are gone, the model will produce something sharp, confident and wrong. It generates what plausibly fits, which is exactly the wrong tool for anything you need to be true.",
        },
        {
          q: "Why does the result look like wax or plastic?",
          a: "Because your original was clean. The model strips what it reads as noise, and film grain, skin texture and fine fabric all get read that way. If the source has no compression damage to repair, ordinary resizing is often the better choice.",
        },
        {
          q: "How large an image can I upscale?",
          a: "About one megapixel going in, because 4× turns that into sixteen megapixels coming out. Larger inputs would take minutes and could exhaust the tab's memory, so the tool refuses up front instead of failing halfway.",
        },
      ],
    },

    "srt-vs-vtt": {
      metaTitle: "SRT vs VTT: Which Subtitle File?",
      metaDescription:
        "The two files are a header line and a punctuation mark apart. Here is which one each player wants — and where automatically generated subtitles go wrong.",
      h1: "SRT vs VTT — which subtitle file do you need?",
      lead: "Open both in a text editor and you will struggle to tell them apart. The differences are tiny, but one of them decides whether a web page will play your subtitles at all.",
      sections: [
        {
          h2: "Both are plain text with timestamps",
          body: [
            "An SRT file is a numbered list of blocks. Each block has an index, a start and end time like `00:00:01,000 --> 00:00:04,000`, and the lines of text to show. That is the entire format. Its simplicity is why it turns up everywhere — media players, TVs, editing software, video platforms.",
            "VTT is the same idea rewritten for the web. It was standardised so browsers could display subtitles natively on an HTML video element, and it adds room for things SRT never had a place for.",
          ],
        },
        {
          h2: "The differences, in full",
          body: ["There are not many, and they are all mechanical:"],
          list: [
            "A VTT file must begin with the line `WEBVTT`. If that line is missing the browser rejects the whole file — this is the single most common reason subtitles silently fail to appear.",
            "Fractions of a second are separated by a comma in SRT and a full stop in VTT.",
            "SRT requires the block numbers. VTT treats them as optional labels.",
            "VTT can carry position, alignment, styling and speaker identification. SRT has no notion of any of that.",
            "The HTML5 video `<track>` element accepts VTT only. It will not load an SRT.",
          ],
        },
        {
          h2: "So which one do you want",
          body: [
            "If the video is playing on a web page you control, VTT — you have no choice. For everything else, SRT is the safer file: desktop players, phones, TVs, editing software and every major video platform accept it, and several of them do not accept VTT.",
            "Because the conversion is mechanical, it is not worth agonising over. Our subtitle tool writes both files from the same transcript, so you can take whichever the destination wants.",
          ],
        },
        {
          h2: "How automatic subtitles are produced — and how they fail",
          body: [
            "Generated subtitles come from a speech recognition model. The audio is decoded, resampled to 16 kHz, and passed to the model, which returns text along with the time each segment started and ended. Here that happens inside the browser tab, which means the model has to be downloaded first — 151 MB or 291 MB depending on which you pick — so the tool states the number before you start rather than after.",
            "The failure mode worth knowing is that poor audio does not produce slightly worse text; it produces a loop. We fed it a 1948 speech recording and it returned the same syllable over and over. A clean modern recording in the same language got roughly forty words with two mistakes. That was recording quality, not language difficulty — and because it is the failure people will hit most often, it is a permanent warning on the page rather than a note in an FAQ.",
            "The most expensive mistake, though, is the language selector. Point a recognition model at the wrong language and it does not stop; it produces fluent, confident nonsense — we measured an English recording transcribed as a hundred and twenty lines of Korean gibberish. If the transcript reads like plausible text that has nothing to do with the audio, check that first.",
          ],
        },
        {
          h2: "Translating subtitles is a separate job",
          body: [
            "Translation runs a different model again — a 418-million-parameter multilingual one that handles a hundred languages in any direction. It is small enough to run in a tab, and that size sets the quality.",
            "The honest description: of twenty lines, about fifteen come out well and five are awkward but understandable. Ordinary sentences are fine. Idioms are where it slips — \"let's wrap this up\" came back meaning roughly \"let's get started\" in both Spanish and German, which is not a small error.",
            "Very short exclamations are the one case where it does not merely slip but collapses into repetition. Rather than ship that, the tool detects the collapse and leaves the original line untranslated, so you can see which lines need a human.",
          ],
        },
      ],
      faq: [
        {
          q: "Can I just rename a .srt file to .vtt?",
          a: "No. It will be missing the `WEBVTT` header line, and its timestamps use commas where VTT expects full stops. A browser will reject it outright. The conversion is simple, but it is not a rename.",
        },
        {
          q: "Are the subtitles burned into the video?",
          a: "No — a subtitle file sits alongside the video, and the player draws it. That is the better arrangement: viewers can turn it off, you can fix a typo without re-encoding, and the same video can carry several languages.",
        },
        {
          q: "The transcript is fluent but completely unrelated to the audio.",
          a: "The language is set wrong. A speech model asked for the wrong language will not fail — it will confidently produce well-formed text in that language. Set the spoken language and run it again.",
        },
      ],
    },

    "what-are-stems": {
      metaTitle: "What Are Stems? Unmixing a Song",
      metaDescription:
        "Stems are the separate parts of a mix. Pulling them back out of a finished song is a guess rather than a recovery — here is how good that guess really is.",
      h1: "What are stems — and can you really unmix a finished song?",
      lead: "In a studio, stems exist before the mix does. Getting them out of a file that has already been mixed is a completely different operation, and it is worth knowing what you are actually being handed.",
      sections: [
        {
          h2: "Stems, properly speaking",
          body: [
            "A stem is a grouped submix kept separate from the rest: all the drums on one, all the vocals on another, and so on. They exist so that a mastering engineer, a remixer or a live sound engineer can work on one part without touching the others.",
            "Real stems are simply files somebody kept. If you have them, nothing needs to be estimated — they were never combined in the first place.",
          ],
        },
        {
          h2: "Separation is not the same thing",
          body: [
            "Once a track is mixed, every part has been summed into two channels of audio. That addition is not reversible; the individual parts no longer exist anywhere in the file.",
            "So a separation model does not recover them. It estimates: given this mixture, what did each part most likely sound like on its own? It has heard enough music to be very good at that guess, but a guess is what it is.",
            "This is why the results have a particular character. The parts are usually convincing on their own, with a faint trace of the others still audible, and dense passages can take on a slightly watery, smeared quality. Those are not bugs to be fixed — they are what estimation sounds like.",
          ],
        },
        {
          h2: "What you get back",
          body: [
            "Four tracks: vocals, drums, bass, and everything else. That last one is not a mistake in the model — it is the category for guitars, keys, strings, synths and anything that is not one of the other three. If your song is built on a piano, the piano is in \"other\".",
            "Every stem is the full length of the original and lines up with it exactly, so you can load them into any editor and they will sit in sync.",
          ],
        },
        {
          h2: "How well does it work? We measured it",
          body: [
            "\"It ran and produced four files\" proves nothing at all — four files of plausible-sounding mush would look identical. So we built a mixture whose ingredients we knew exactly: a speech recording, a 60 Hz sine wave standing in for bass, and short noise bursts standing in for drums. Then we correlated each output stem against each known ingredient.",
            "Each stem matched its own ingredient at almost exactly 1.0 and the others at almost exactly 0. The drum stem contained the noise bursts and essentially nothing else; the bass stem contained the sine wave and essentially nothing else.",
            "That test proves the separation is real and correctly wired. It does not prove any given song will come apart cleanly — real music is much harder than a synthetic mixture, and a heavily layered or heavily compressed master is harder still.",
          ],
        },
        {
          h2: "It is slow, and that is a fact about the method",
          body: [
            "Separation runs the whole waveform through a neural network. We measured 7.8 seconds of audio taking 15.1 seconds to process — roughly twice real time. A full song therefore takes more than six minutes.",
            "That is why the tool works on a 30-second preview and tells you the number before you press anything, rather than starting a six-minute job in a browser tab and hoping you stay.",
          ],
        },
        {
          h2: "Separating something does not give you the right to use it",
          body: [
            "Pulling a vocal out of a commercial record does not change who owns the recording. Practising over an instrumental, studying an arrangement or making something for yourself is one situation; publishing or distributing the result is a different one, and separation does not affect that at all.",
            "Nothing you load here leaves your machine — but that is a statement about privacy, not about licensing.",
          ],
        },
      ],
      faq: [
        {
          q: "Can I make a karaoke track from a song?",
          a: "Yes — take every stem except the vocals and mix them back together. Expect a faint vocal residue in dense sections; the model is estimating, and where the voice overlaps loud instruments it cannot fully separate the two.",
        },
        {
          q: "Will the stems sound as good as the original?",
          a: "Summed back together they are very close to it. Listened to individually on headphones, artefacts are audible — mostly a slight watery quality and traces of the other parts. Each stem is a reconstruction, not an extraction.",
        },
        {
          q: "Why only 30 seconds?",
          a: "Because processing runs at about twice real time in a browser, so a whole song would take over six minutes with the tab open. The preview lets you hear whether the separation is good enough for your track before committing to that.",
        },
      ],
    },

    "why-pdf-wont-open": {
      metaTitle: "Why Won't My PDF Open?",
      metaDescription: "A PDF that fails is usually failing for one of five reasons, and they need different fixes. Here is how to tell which one you have.",
      h1: "Why won't my PDF open?",
      lead: "\"This file cannot be opened\" covers at least five completely different problems. Telling them apart takes about ten seconds and saves you from trying the wrong fix.",
      sections: [
        {
          h2: "First: does it fail everywhere, or only in one place?",
          body: [
            "Open it in a browser — drag the file onto a browser tab. Browsers have their own PDF engine, so this tells you whether the file is broken or your reader is.",
            "If it opens in the browser but not in your desktop reader, the file is fine. Update the reader, or just use the browser. If it fails in both, keep reading.",
          ],
        },
        {
          h2: "It asks for a password — and there are two kinds",
          body: [
            "PDFs can carry two separate passwords and people rarely realise it. A **user password** is required to open the document at all. An **owner password** leaves it readable but restricts printing, copying or editing.",
            "This matters because tools behave differently. A file with only an owner password opens fine in most readers, so it feels unprotected — but many tools will still refuse to modify it, which looks like a broken file when it is really a permission.",
            "There is no honest way around a user password: the content is genuinely encrypted. Our PDF tools refuse encrypted files and say so rather than producing something empty. We tested that with real AES-encrypted files and with ones written by LibreOffice; all four tools declined correctly.",
          ],
        },
        {
          h2: "The text is there but shows as empty boxes",
          body: [
            "This is a font problem, and it is very common with Chinese, Japanese and Korean documents. The characters exist in the file, but the font that draws them was not embedded — so the reader substitutes something that has no glyphs for those characters and you get rows of hollow rectangles.",
            "It is worth knowing that this is a *rendering* failure, not a data failure. Copy the text out and it is intact. If you need it to look right, the fix is on the machine that made the PDF: embed the fonts when exporting.",
          ],
        },
        {
          h2: "Pages are blank, or a scan shows nothing",
          body: [
            "Some PDFs store their images in formats that not every engine implements — JBIG2 and JPEG 2000 are the usual culprits, and both are common in scanned documents from office equipment. An engine without those decoders draws a blank page rather than an error.",
            "The tell is that the page is blank but the file size is large. Blank pages that are genuinely blank are tiny.",
          ],
        },
        {
          h2: "It is truncated or corrupt",
          body: [
            "A PDF keeps its index of objects at the **end** of the file. That is why a partially downloaded PDF fails completely rather than showing the first few pages — the reader looks for the index, does not find it, and gives up.",
            "If a file arrived by email or download, check its size against the original. A file that stops early is not repairable in any meaningful sense; get it again.",
          ],
        },
        {
          h2: "What to do once you know which one it is",
          body: [
            "Matching the fix to the cause saves a lot of time:",
          ],
          list: [
            "Opens in a browser but not your reader → the reader. Use the browser or update it.",
            "Asks for a password → you need the password. No tool can honestly bypass it.",
            "Empty boxes instead of characters → fonts were not embedded. The text is fine; re-export from the source.",
            "Blank pages, large file → an image format your reader cannot decode. Try a different reader.",
            "Fails immediately, file looks small → truncated. Download it again.",
          ],
        },
      ],
      faq: [
        {
          q: "Can a tool remove a PDF password?",
          a: "Not the one that encrypts the content. If a document needs a password to open, the bytes are encrypted and there is nothing to work with. Tools that claim otherwise are either guessing passwords or handling the permissions-only case.",
        },
        {
          q: "Why does the same PDF look different in two programs?",
          a: "Because every reader has its own engine, and they differ in which fonts they substitute and which image formats they decode. A PDF describes a page; it does not guarantee two engines draw it identically.",
        },
        {
          q: "My PDF opens but I cannot select the text.",
          a: "Then there is no text layer — the pages are pictures. That happens with scans, and also with files that some compressors produce by flattening every page to an image. Text recognition can put a layer back.",
        },
      ],
    },

    "csv-vs-excel": {
      metaTitle: "CSV vs Excel: What Actually Differs",
      metaDescription: "A CSV has no types, no formatting and no sheets — it is just text. That single fact explains every strange thing Excel does when it opens one.",
      h1: "CSV vs Excel — what actually differs",
      lead: "Almost every confusing thing that happens to a CSV comes from one fact: a CSV file has no idea what its values mean. Excel guesses, and the guesses are where data gets damaged.",
      sections: [
        {
          h2: "A CSV is text. That is the whole format.",
          body: [
            "A CSV is lines of characters separated by commas. There is nothing else in it — no cell types, no formulas, no formatting, no multiple sheets, no column widths. `007` in a CSV is three characters, not a number and not a string; the file does not say which.",
            "An .xlsx file is the opposite: a compressed bundle that records, for every cell, what kind of value it holds and how it should look. That is why it is bigger and why it survives a round trip unchanged.",
          ],
        },
        {
          h2: "What Excel does to your data when it opens a CSV",
          body: [
            "Because the file does not declare types, Excel infers them. Its guesses are reasonable in the average case and destructive in specific ones:",
          ],
          list: [
            "Leading zeros disappear. `007` becomes `7`. Postal codes, account numbers and part numbers are the usual casualties.",
            "Things that look like dates become dates. `1-2` becomes 2 January. This famously forced geneticists to rename genes because Excel kept turning SEPT2 into a date.",
            "Long numbers switch to scientific notation and lose their tail. A 16-digit identifier can come back as `1.23457E+15`, and the lost digits are not recoverable by changing the format afterwards.",
            "The damage is saved when you save. The original file was correct; the file Excel writes back is not.",
          ],
        },
        {
          h2: "Why your CSV shows as gibberish, or all in one column",
          body: [
            "Two separate problems, both about assumptions the file cannot state.",
            "**Encoding.** A CSV does not record its character encoding. Excel on Windows historically assumes the local codepage rather than UTF-8, which is why Korean, Japanese and accented Latin text arrives mangled. A UTF-8 byte order mark at the start usually fixes it.",
            "**The separator.** In countries where the comma is the decimal mark, spreadsheets write and expect semicolons instead. Open such a file elsewhere and every row lands in a single column. The file is not broken; the two programs disagree about what a comma means.",
          ],
        },
        {
          h2: "When the file is simply too big",
          body: [
            "A spreadsheet has a hard ceiling of about 1,048,576 rows, and it gets slow long before that because it loads everything into memory to make it all editable.",
            "Past a certain size the right move is to stop opening the file and start asking it questions instead. `SELECT` a few columns, filter, group, count — you get an answer in seconds without the machine trying to render millions of cells you were never going to look at.",
          ],
        },
        {
          h2: "Parquet, briefly",
          body: [
            "If CSV keeps letting you down, Parquet is what the analytics world switched to. It stores types inside the file, so nothing is guessed. It stores data by column rather than by row, so reading three columns out of fifty reads roughly three columns' worth of bytes. And it compresses well — often five to ten times smaller than the same CSV.",
            "The trade is that you cannot open it in a text editor. It is a format for querying, not for eyeballing.",
          ],
        },
      ],
      faq: [
        {
          q: "How do I stop Excel from mangling my CSV?",
          a: "Do not double-click it. Use Data → From Text/CSV, which lets you set the encoding and mark columns as text before anything is converted. Or query the file directly and never let a spreadsheet touch it.",
        },
        {
          q: "Is a CSV smaller than an Excel file?",
          a: "Usually no, which surprises people. .xlsx is a zipped bundle, and zip compresses repetitive text well. A plain CSV is uncompressed characters. Parquet beats both by a wide margin.",
        },
        {
          q: "Can I query a CSV without a database?",
          a: "Yes. Our data tool runs a SQL engine inside the browser tab and reads the file straight from your disk — nothing is uploaded, and there is no server or database to set up.",
        },
      ],
    },

    "can-ai-summarize": {
      metaTitle: "Can AI Summarise a Document Reliably?",
      metaDescription: "Small summarisation models fail in specific, repeatable ways — copying, inventing and getting facts wrong. Here is what we measured, and when to trust it.",
      h1: "Can AI summarise a document reliably?",
      lead: "Sometimes, and the failures are specific enough to be worth learning. We tested four models on the same documents; two of them did not summarise at all.",
      sections: [
        {
          h2: "What a summariser is actually doing",
          body: [
            "A summarisation model does not extract sentences and stitch them together. It reads the document and then writes new sentences, one word at a time, choosing each word by what tends to follow.",
            "That is why the output reads naturally, and it is also why it can be wrong in ways that a copy-paste approach never could: nothing anchors the generated text to the source except the model's training.",
          ],
        },
        {
          h2: "Failure one: it copies instead of summarising",
          body: [
            "This was the biggest surprise in our testing. Two models with clean, permissive licences — one 600M parameters, one 350M — did not summarise narrative prose. They reproduced the opening of the document verbatim.",
            "Both handled encyclopedia articles fine. It was only when we added a piece of narrative writing that the behaviour showed up. If we had tested with reference material alone, we would have shipped a model that copies.",
            "Forcing it not to copy made things worse rather than better: wrapped in delimiters, the same model produced a fluent sentence that said something the document never said.",
          ],
        },
        {
          h2: "Failure two: it invents when there is nothing to work with",
          body: [
            "Given an empty input, one model produced a summary of a public health campaign. Given the single word \"hello\", it wrote three lines of a diary entry.",
            "A model always produces something — there is no state in which it returns nothing. If the input is too short to summarise, what comes out is not a bad summary; it is fiction. This is why our tool has a minimum length and refuses below it rather than obliging.",
          ],
        },
        {
          h2: "Failure three: it gets facts wrong, fluently",
          body: [
            "In one run the model expanded the abbreviation NADPH into a chemical name that was not what NADPH stands for. The sentence was well-formed and confident.",
            "Fluency and accuracy are separate things, and they fail separately. This is the failure mode you cannot spot by reading the summary alone, which is precisely why a summary is a way to decide whether to read something — not a replacement for reading it.",
          ],
        },
        {
          h2: "What it is genuinely good at",
          body: [
            "Working out whether a long document is relevant to you. Getting the gist of a report in a language you read slowly. Producing a first draft of an abstract that you then correct.",
            "One more limit worth knowing: asking for a summary in a different language than the source is where small models fall apart — inventing words that do not exist, or ignoring the instruction and answering in the source language. Summarising and translating are two jobs; ask for them one at a time.",
          ],
        },
        {
          h2: "If the document is a scan, nothing above applies yet",
          body: [
            "A scanned PDF has no text in it, only pictures of text. A summariser given such a file receives nothing at all — and, per the second failure above, a model given nothing will still write something.",
            "Run text recognition first, check the result, then summarise. Recognition on a poor scan produces its own errors, and summarising those errors compounds them quietly.",
          ],
        },
      ],
      faq: [
        {
          q: "Can I trust an AI summary for something important?",
          a: "Use it to decide what to read, not as a substitute for reading. The errors it makes are fluent and confident, which means they do not look like errors — that is exactly the property that makes them dangerous for decisions.",
        },
        {
          q: "Why does the tool refuse very long documents instead of truncating?",
          a: "Because summarising the first part and presenting it as a summary of the whole is a lie the reader cannot detect. Refusing is honest; silently truncating is not.",
        },
        {
          q: "Does my document get uploaded?",
          a: "No. The model is downloaded to your browser and the document is read there. It is the opposite arrangement from a hosted service: the model travels, not your file.",
        },
      ],
    },
  },
} satisfies GuideCopy;
