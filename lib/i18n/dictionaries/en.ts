/**
 * 기준 사전. 다른 언어는 이 모양을 그대로 따른다 (`satisfies Dictionary`).
 * 여기에 키를 추가하면 나머지 5개 언어가 타입 에러로 빠짐없이 드러난다.
 */
export const en = {
  site: {
    title: "toolsmith — browser tools that never upload your files",
    titleTemplate: "%s | toolsmith",
    description:
      "Your files never leave your device. Convert images, video and PDFs entirely inside your browser. No sign-up, no upload.",
    tagline: "No upload · everything runs in your browser",
    footerNote:
      "The files you pick are never sent to a server. Everything happens inside this browser tab.",
  },

  home: {
    title: "File tools that never upload anything",
    lead: "Images, video and PDFs are processed right inside your browser. Nothing to upload, nothing to wait for, nothing to delete afterwards.",
    availableHeading: "Available",
    upcomingHeading: "Coming soon",
  },

  localePicker: {
    title: "Choose your language",
    lead: "toolsmith processes every file inside your browser. Pick a language to continue.",
  },

  common: {
    relatedHeading: "Other tools",
    chooseFile: "Choose files",
    download: "Download",
    clear: "Clear",
    downloadAll: "Download all",
    workerUnsupportedTitle: "This browser can't run this tool.",
    workerUnsupportedHint:
      "Please open it in an up-to-date Chrome, Edge, Firefox or Safari that supports Web Workers.",
  },

  mediaErrors: {
    unsupportedContainer: "This file isn't an MP4 or MOV we can open",
    noVideoTrack: "This file has no video track",
    noAudioTrack: "This file has no sound to pull out",
    unsupportedCodec: "This browser can't decode this video",
    badRange: "The end has to come after the start",
    tooLarge: "That is over 512MB",
    decodeFailed: "The video could not be read to the end",
    encodeFailed: "This browser could not encode the result",
    generic: "Something went wrong",
  },

  pdfErrors: {
    encrypted: "This PDF is password-protected",
    noPages: "This PDF has no pages",
    tooLarge: "That is over 512MB",
    invalid: "This file can't be read as a PDF",
    badRange: "Those page numbers don't make sense",
    outOfBounds: "This PDF doesn't have those pages",
    generic: "Something went wrong",
  },

  /** 홈의 도구 카드와 "준비 중" 목록에 쓰는 짧은 이름. 모든 슬러그를 덮는다. */
  toolNames: {
    "image-convert": "Image converter",
    "video-convert": "Video converter",
    "video-compress": "Compress video",
    "video-trim": "Video trimmer",
    "video-to-gif": "Video to GIF",
    "audio-extract": "Audio extractor",
    "pdf-merge": "Merge PDF",
    "pdf-split": "Split PDF",
    "pdf-organize": "Rotate & delete pages",
    "pdf-compress": "Compress PDF",
    ocr: "Image to text",
    "data-query": "CSV & Parquet query",
    subtitles: "Subtitle generator",
    "subtitle-translate": "Subtitle translator",
    "remove-bg": "Background remover",
    cutout: "Click-to-cut-out",
    upscale: "Image upscaler",
    stems: "Stem separator",
  },

  tools: {
    "image-convert": {
      blurb: "HEIC, PNG, JPG, WebP and AVIF in every direction. Compress and resize in one pass.",
      metaTitle: "Image Converter — HEIC, PNG, JPG, WebP, AVIF",
      metaDescription:
        "Turn iPhone HEIC photos into JPG, PNG into WebP. Convert and compress right in your browser with no upload. No sign-up, no file limit.",
      h1: "Image converter & compressor",
      lead: "Convert between HEIC, PNG, JPG, WebP and AVIF, dial the quality down to save space, and resize at the same time. Handles a whole batch at once.",
      faq: [
        {
          q: "Where do my files go?",
          a: "Nowhere. The conversion runs inside this browser tab and the images you pick are never sent over the network. Close the tab and they are gone.",
        },
        {
          q: "Does it handle iPhone HEIC photos?",
          a: "Yes. Safari reads HEIC natively; on Chrome and Firefox the decoder is fetched only the moment you drop a HEIC file in. If you never use HEIC, nothing is downloaded.",
        },
        {
          q: "Which format should I pick?",
          a: "WebP is the smallest at the same quality if the image is going on the web. Pick JPG if it has to open anywhere, PNG if you need transparency. Only formats your browser can actually produce appear in the list.",
        },
      ],
      ui: {
        unsupportedTitle: "This browser can't run image conversion.",
        unsupportedHint:
          "Please open it in an up-to-date Chrome, Edge, Firefox or Safari 17+ that supports OffscreenCanvas.",
        dropLabel: "Drop your images here",
        dropHint: "HEIC · PNG · JPG · WebP · AVIF · GIF · BMP — several at once",
        formatLabel: "Output format",
        qualityLabel: "Quality {value}",
        qualityLossless: "Quality (PNG is lossless)",
        sizeLabel: "Size",
        sizeOriginal: "Keep original size",
        sizeMax: "Long edge {px}px",
        convert: "Convert {n} file(s)",
        converting: "Converting…",
        itemWorking: "Converting…",
        errUnsupportedInput: "This browser can't read that format",
        errGeneric: "Conversion failed",
      },
    },

    "pdf-merge": {
      blurb: "Several PDFs into one, in the order you choose. Pages are copied, never re-rendered.",
      metaTitle: "Merge PDF — combine several PDFs into one",
      metaDescription:
        "Join multiple PDFs in any order you like. Runs entirely in your browser with no upload, no sign-up, no watermark and no file limit.",
      h1: "Merge PDF",
      lead: "Join several PDFs into a single file. Reorder the list and the result follows that exact order.",
      faq: [
        {
          q: "Where do my files go?",
          a: "Nowhere. Merging runs inside this browser tab and the PDFs you pick are never sent over the network. Close the tab and they are gone.",
        },
        {
          q: "How do I set the page order?",
          a: "Top to bottom in the list is the page order of the result. Use ↑ ↓ to move a file and ✕ to drop it. Pages inside each file keep their original order.",
        },
        {
          q: "Does it work with password-protected PDFs?",
          a: "No. Protected PDFs are marked as such and left out of the merge. We would rather refuse than hand you a file that opened but came out corrupted. Remove the password first.",
        },
        {
          q: "Does quality suffer?",
          a: "No. Pages are copied as they are rather than re-rendered. Text stays text and images keep their original resolution.",
        },
      ],
      ui: {
        dropLabel: "Drop your PDFs here",
        dropHint: "Add two or more and they are joined top to bottom",
        listLabel: "Files to merge",
        reading: "reading…",
        pageCount: "{n} pages",
        moveUp: "Move {name} up",
        moveDown: "Move {name} down",
        remove: "Remove {name}",
        merge: "Merge {n} files",
        merging: "Merging…",
        totalPages: "{n} pages in total",
        needTwo: "Two or more PDFs are needed",
        resultDetail: "{pages} pages · {size}",
      },
    },

    "pdf-split": {
      blurb: "Pull out the pages you want, or explode every page into its own PDF inside a ZIP.",
      metaTitle: "Split PDF — extract pages or burst to singles",
      metaDescription:
        "Pull selected pages out of a PDF or split every page into its own file. Runs entirely in your browser with no upload, no sign-up and no watermark.",
      h1: "Split PDF",
      lead: "Pull the pages you need into one PDF, or burst every page into its own single-page PDF and get them back as a ZIP.",
      faq: [
        {
          q: "Where do my files go?",
          a: "Nowhere. Splitting runs inside this browser tab and the PDF you pick is never sent over the network. Close the tab and it is gone.",
        },
        {
          q: "How do I write the page numbers?",
          a: "Like 1-3, 5, 8-. That means pages 1 through 3, page 5 on its own, and page 8 to the end. The order you write is the order you get.",
        },
        {
          q: "What if I ask for a page that isn't there?",
          a: "We tell you straight away. Quietly clipping 1-99 down to a 10-page file would leave you believing pages you never had came through. We don't do that.",
        },
        {
          q: "Does quality suffer?",
          a: "No. Pages are copied as they are rather than re-rendered. Text stays text and images keep their original resolution.",
        },
      ],
      ui: {
        dropLabel: "Drop a PDF here",
        dropHint: "One at a time — pull out the pages you want, or burst every page apart",
        reading: "reading…",
        pageCount: "{n} pages",
        modeExtract: "Extract a page range",
        modeExtractHint: "Selected pages, gathered into one PDF",
        modePages: "Every page on its own",
        modePagesHint: "{n} single-page PDFs, wrapped in one ZIP",
        rangeLabel: "Pages to extract",
        rangePlaceholder: "e.g. 1-3, 5, 8-  ({n} pages total)",
        selected: "{n} pages selected",
        needRange: "Tell us which pages to pull",
        runExtract: "Extract",
        runPages: "Burst into single pages",
        processing: "Working…",
        extractName: "{stem}-extract.pdf",
        zipName: "{stem}-pages.zip",
        extractDetail: "{pages} pages · {size}",
        zipDetail: "{count} PDFs · {size}",
      },
    },

    "pdf-organize": {
      blurb: "See every page, turn the sideways ones upright and drop the ones you don't want.",
      metaTitle: "Rotate PDF & delete pages — fix a crooked scan",
      metaDescription:
        "Turn sideways scans upright and drop the pages you don't need. Every page is shown as a thumbnail. All in your browser — no upload, no sign-up.",
      h1: "Rotate PDF & delete pages",
      lead: "Every page is laid out as a thumbnail. Turn the ones that came out sideways, drop the blank ones, and save what is left.",
      faq: [
        {
          q: "Where do my files go?",
          a: "Nowhere. Both the thumbnails and the saved file are produced inside this browser tab, and the PDF you pick is never sent over the network. Close the tab and it is gone.",
        },
        {
          q: "The scan already looks rotated. Will turning it break things?",
          a: "No. Rotation is added on top of whatever the page already carried, so what you see in the thumbnail is what you get. Scanners often store a rotation of their own; overwriting it is what makes pages come out the wrong way round.",
        },
        {
          q: "Does rotating re-render the page?",
          a: "No. Only a rotation flag is written; the page content is copied untouched. Text stays text and images keep their original resolution. Nothing is blurred or re-compressed.",
        },
        {
          q: "Can I get a deleted page back?",
          a: "Yes, until you leave. Deleting only marks the page — press ↩ on it, or Undo everything, to bring it back. The original file on your disk is never modified.",
        },
      ],
      ui: {
        dropLabel: "Drop a PDF here",
        dropHint: "One at a time — every page is shown so you can pick",
        rendering: "drawing previews…",
        pageCount: "{n} pages",
        gridLabel: "Pages",
        pageAlt: "Page {n}",
        rotateLeft: "Turn page {n} left",
        rotateRight: "Turn page {n} right",
        removePage: "Delete page {n}",
        restorePage: "Restore page {n}",
        rotateAll: "Turn every page right",
        resetAll: "Undo everything",
        save: "Save {n} pages",
        saving: "Saving…",
        needOne: "At least one page has to stay",
        outputName: "{stem}-edited.pdf",
        resultDetail: "{pages} pages · {size}",
      },
    },

    "pdf-compress": {
      blurb: "Re-compress the photos inside a PDF. The text stays text — nothing is flattened.",
      metaTitle: "Compress PDF — shrink the file, keep the text",
      metaDescription:
        "Make a PDF smaller by re-compressing the photos inside it. Text stays selectable and searchable. Runs entirely in your browser with no upload and no sign-up.",
      h1: "Compress PDF",
      lead: "Shrinks a PDF by re-compressing the photos inside it. The text is left exactly as it was, so it stays selectable and searchable.",
      faq: [
        {
          q: "Where do my files go?",
          a: "Nowhere. Compression runs inside this browser tab and the PDF you pick is never sent over the network. Close the tab and it is gone.",
        },
        {
          q: "Does the text get blurry?",
          a: "No. Only the photos are re-encoded; text and vector drawings are copied untouched. Many compressors bake each page into one flat image — that shrinks more, but your text stops being text and can no longer be selected, searched or read aloud. We don't do that.",
        },
        {
          q: "Why did my file barely shrink?",
          a: "Because there was little to squeeze. A PDF of mostly text is already small, and photos that were saved well the first time cannot be made much smaller without visible damage. We tell you when that happens instead of handing back a file of the same size and calling it compressed.",
        },
        {
          q: "How low should I set the quality?",
          a: "Around 70 is a good balance for documents meant to be read on screen. Go lower for drafts you just need to email; keep it high and leave the resolution untouched if the photos matter.",
        },
      ],
      ui: {
        dropLabel: "Drop a PDF here",
        dropHint: "One at a time — the photos inside get re-compressed",
        reading: "reading…",
        pageCount: "{n} pages",
        qualityLabel: "Photo quality {value}",
        qualityAria: "Photo quality",
        sizeLabel: "Photo resolution",
        sizeOriginal: "Keep original resolution",
        sizeMax: "Long edge {px}px",
        run: "Compress",
        working: "Compressing…",
        outputName: "{stem}-compressed.pdf",
        rewroteImages: "Re-compressed {n} of {total} photos",
        noImages: "This PDF has no photos to re-compress.",
        alreadySmall: "The photos were already well compressed — this could not be made smaller.",
      },
    },

    "data-query": {
      blurb: "Run SQL over a CSV or Parquet file. The file never leaves your device.",
      metaTitle: "CSV & Parquet SQL Query — in your browser",
      metaDescription:
        "Open a CSV or Parquet file and query it with SQL. Powered by DuckDB, running entirely in your browser — no upload, no sign-up, no row limit.",
      h1: "CSV & Parquet query (SQL)",
      lead: "Opens a CSV or Parquet file and lets you query it with real SQL. DuckDB runs inside this tab, so the file is never uploaded.",
      faq: [
        {
          q: "Where do my files go?",
          a: "Nowhere. DuckDB is handed a reference to the file and reads it straight off your disk. Nothing is uploaded. What does get downloaded is the DuckDB engine itself, from a public CDN — that traffic goes the other way.",
        },
        {
          q: "Why does it download about 6MB first?",
          a: "Because DuckDB is a real analytical database compiled to WebAssembly. It is 35MB uncompressed and about 6MB over the wire. We fetch it the moment you press the button and not before, and your browser keeps it afterwards.",
        },
        {
          q: "How large a file can it handle?",
          a: "Larger than you would expect, especially for Parquet. The file is not loaded into memory up front — DuckDB reads only the parts a query needs, so a query touching two columns of a wide Parquet file barely reads anything. A CSV has to be scanned, so it is slower.",
        },
        {
          q: "What SQL can I write?",
          a: "DuckDB's dialect, which is close to PostgreSQL. Your file is available as the table `data`, so `SELECT * FROM data LIMIT 50` is the starting point. Joins, window functions, aggregates and CTEs all work. Errors come back from DuckDB word for word so you can fix them.",
        },
        {
          q: "Does it show every row?",
          a: "The table on screen stops at 200 rows so the page stays usable, and it tells you when it has. The query itself is not limited, and the CSV download contains every row that was displayed.",
        },
      ],
      ui: {
        dropLabel: "Drop a CSV or Parquet file here",
        dropHint: "CSV · TSV · Parquet · JSON — one at a time",
        downloadNote: "Opening the file downloads the DuckDB engine, about {size}.",
        localNote: "The file itself is not uploaded — DuckDB reads it from your disk.",
        open: "Open and query",
        opening: "Opening…",
        rowCount: "{rows} rows",
        columnCount: "{columns} columns",
        schemaLabel: "Columns",
        sqlLabel: "SQL",
        sqlHint: "Your file is the table `data`.",
        run: "Run",
        running: "Running…",
        resultSummary: "{rows} rows · {ms}ms",
        showingFirst: "showing the first {n}",
        noRows: "This query returned no rows.",
        downloadCsv: "Download CSV",
        errEngine: "The DuckDB engine could not be loaded",
        errFormat: "This file type can't be opened — CSV, TSV, Parquet or JSON",
        errRead: "The file could not be read",
      },
    },

    ocr: {
      blurb: "Pull the text out of a photo, screenshot or scanned PDF. Nothing is uploaded.",
      metaTitle: "Image & PDF to Text — OCR in your browser",
      metaDescription:
        "Read the text out of a photo, screenshot or scanned PDF without uploading it. Seven languages, runs entirely in your browser, no sign-up.",
      h1: "Image & PDF to text (OCR)",
      lead: "Reads the words out of a picture or a scanned PDF and hands you plain text you can copy. The recognition runs on your device.",
      faq: [
        {
          q: "Where do my files go?",
          a: "Nowhere. The picture is read inside this browser tab and never uploaded. The one thing that does travel is the recognition engine itself, which is downloaded from a public CDN — your file goes the other way, which is to say nowhere.",
        },
        {
          q: "Why does it download a few megabytes before it starts?",
          a: "Because OCR needs a real engine and a trained model for the language you picked. Together that is roughly 4 to 6MB. We fetch it the moment you press the button and not before, and your browser keeps it afterwards, so the second document starts immediately.",
        },
        {
          q: "Why isn't the text perfect?",
          a: "We use the compact models, which are five to ten times smaller than the accurate ones (English: 2MB against 11MB, Japanese: 1.5MB against 16MB). On a clean scan the difference is small; on a blurry phone photo it shows. We would rather not make you download 16MB to find that out. Straighten the page and turn up the light and it improves a lot.",
        },
        {
          q: "Can it read a PDF?",
          a: "Yes, up to 30 pages at a time. Each page is drawn as an image first, then read. If the PDF already has real text in it, a copy-and-paste from any reader will be faster and exact — OCR is for the ones that are just pictures of paper.",
        },
        {
          q: "Does it keep the layout?",
          a: "No. You get the words in reading order, not columns, tables or headings. If the layout matters more than the words, this is the wrong tool.",
        },
      ],
      ui: {
        dropLabel: "Drop an image or PDF here",
        dropHint: "PNG · JPG · WebP · PDF — one at a time",
        pdfLimit: "up to {max} pages",
        languageLabel: "Language in the document",
        downloadNote: "Pressing the button downloads about {size} of engine and language data.",
        cachedNote: "It is fetched once and kept by your browser — the next document starts straight away.",
        run: "Read the text",
        working: "Reading…",
        stageEngine: "loading engine {percent}%",
        stageRendering: "drawing page {done}/{total}",
        stageReading: "reading page {page}/{pages}",
        resultSummary: "{pages} page(s) · confidence {confidence}%",
        copy: "Copy",
        copied: "Copied",
        resultLabel: "Recognised text",
        truncated: "This document has {total} pages; only the first {max} were read.",
        nothingFound: "No text was found in this image.",
        lowConfidence: "Confidence is low — check it against the original before you trust it.",
        errEngine: "The OCR engine could not be loaded",
        errTooManyPages: "Only {max} pages can be read at once",
        languages: {
          eng: "English",
          kor: "Korean",
          jpn: "Japanese",
          spa: "Spanish",
          deu: "German",
          por: "Portuguese",
          chi_sim: "Chinese (Simplified)",
        },
      },
    },

    "video-convert": {
      blurb: "MOV to MP4 without re-encoding, or MP4 to WebM for the web. Nothing is uploaded.",
      metaTitle: "MOV to MP4 & MP4 to WebM Converter",
      metaDescription:
        "Convert MOV to MP4 with no re-encoding, or MP4 to WebM with VP9 and Opus. Runs in your browser — no upload, no sign-up, no file size limit.",
      h1: "Video converter",
      lead: "Puts your video in a different container. MP4 leaves the codecs exactly as they are; WebM re-encodes the picture to VP9 and the sound to Opus.",
      faq: [
        {
          q: "Where do my files go?",
          a: "Nowhere. The video is read and rewritten inside this browser tab, and nothing is uploaded. Close the tab and it is gone.",
        },
        {
          q: "Why is MOV to MP4 finished almost instantly?",
          a: "Because .mov and .mp4 are the same box with a different label. An iPhone .mov already holds H.264 or HEVC video and AAC sound, all of which an MP4 can hold too, so we copy the streams across untouched and only rewrite the wrapper. Nothing is decoded, so nothing is lost.",
        },
        {
          q: "Why does WebM take so much longer?",
          a: "Because WebM cannot hold H.264 or AAC at all. Every frame has to be decoded and encoded again as VP9, and the sound as Opus. That is real work — expect it to take a fair share of the clip's own length, and expect a small quality cost, as with any re-encode.",
        },
        {
          q: "Can I convert a WebM, AVI or MKV into MP4?",
          a: "No. We open the container ourselves instead of shipping a 30MB media toolchain to your browser, and what we can open is MP4, MOV and M4V. We would rather leave those formats off the list than accept the file and fail on it.",
        },
        {
          q: "Does the quality drop?",
          a: "Not on the MP4 path — not a single frame is re-encoded there. On the WebM path it does, because re-encoding always does. Pick the quality that suits you; the tool tells you which path you are on before you press the button.",
        },
      ],
      ui: {
        dropLabel: "Drop a video here",
        dropHint: "MP4 · MOV · M4V — one at a time",
        reading: "reading…",
        seconds: "s",
        noAudio: "no sound",
        targetLabel: "Convert to",
        targetMp4: "MP4",
        targetWebm: "WebM",
        mp4Note: "The codecs are left alone and only the container is rewritten. Nothing is lost and it takes seconds.",
        webmNote: "H.264 cannot live in a WebM, so the picture is re-encoded to VP9 and the sound to Opus. This takes a while and costs a little quality.",
        alreadyMp4: "This file is already an MP4 — converting would only rewrite the container.",
        mp4Unavailable: "This video's codec can't be copied into an MP4 as it is.",
        webmUnavailable: "This browser can't encode WebM. MP4 still works.",
        sizeLabel: "Size",
        sizeOriginal: "Keep original size",
        sizeMax: "Long edge {px}px",
        qualityLabel: "Quality",
        qualityHigh: "High — bigger file",
        qualityBalanced: "Balanced",
        qualitySmall: "Small — lower quality",
        run: "Convert to {format}",
        working: "Converting…",
        outputNameMp4: "{stem}.mp4",
        outputNameWebm: "{stem}.webm",
        resultLossless: "Nothing was re-encoded.",
        resultReencoded: "The picture was re-encoded to VP9.",
        audioKept: "The sound came across too.",
        audioDropped: "The sound could not be carried over.",
      },
    },

    "video-compress": {
      blurb: "Shrink an MP4 in your browser. No 30MB toolchain to download — your device does the work.",
      metaTitle: "Compress Video — shrink MP4 in your browser",
      metaDescription:
        "Make an MP4 smaller without uploading it. Runs on your device with the browser's own video encoder — nothing to install, no file ever leaves it.",
      h1: "Compress video",
      lead: "Re-encodes the picture at a lower bitrate and leaves the sound exactly as it was. Everything happens on your device.",
      faq: [
        {
          q: "Where do my files go?",
          a: "Nowhere. The whole thing runs inside this browser tab using your device's own video encoder. The file is never uploaded — which for video matters more than anywhere else, since these are usually the largest and most personal files people have.",
        },
        {
          q: "Why is the sound untouched?",
          a: "Because re-encoding it would only make it worse. The audio is copied across exactly as it was, which is faster and lossless. Only the picture is re-encoded.",
        },
        {
          q: "Which files can I use?",
          a: "MP4 and MOV. We read the container ourselves rather than shipping a 30MB media toolchain, and that is the honest limit of what we can open today — so AVI and MKV are not offered rather than accepted and then failed on.",
        },
        {
          q: "Why does my browser say it can't do this?",
          a: "Video encoding needs WebCodecs, which older browsers lack. Chrome and Edge have had it since 2021, Safari since 16.4, Firefox since 130. We ask your browser whether it can actually encode H.264 before offering the tool.",
        },
      ],
      ui: {
        unsupportedTitle: "This browser can't compress video.",
        unsupportedHint:
          "Video encoding needs WebCodecs — try an up-to-date Chrome, Edge, Safari 16.4+ or Firefox 130+.",
        dropLabel: "Drop a video here",
        dropHint: "MP4 and MOV — one at a time",
        reading: "reading…",
        seconds: "s",
        noAudio: "no sound",
        qualityLabel: "Quality",
        quality: { high: "High", balanced: "Balanced", small: "Smallest file" },
        sizeLabel: "Resolution",
        sizeOriginal: "Keep original resolution",
        sizeMax: "Long edge {px}px",
        run: "Compress",
        working: "Compressing…",
        outputName: "{stem}-compressed.mp4",
        audioKept: "The sound was copied across untouched.",
        didNotShrink:
          "This came out no smaller — the original was already efficient. Try a lower quality or resolution.",
      },
    },

    "video-trim": {
      blurb: "Cut a clip out of a video without re-encoding it. Nothing is lost, and it takes seconds.",
      metaTitle: "Trim Video — cut an MP4 in your browser",
      metaDescription:
        "Cut a section out of an MP4 or MOV without uploading it. Nothing is re-encoded, so the quality is untouched and it finishes in seconds. Runs in your browser.",
      h1: "Trim video",
      lead: "Cuts a section out of a video and copies it across untouched — no re-encoding, so the quality is exactly what you started with.",
      faq: [
        {
          q: "Where do my files go?",
          a: "Nowhere. The video is read and rewritten inside this browser tab, and nothing is uploaded. Close the tab and it is gone.",
        },
        {
          q: "Why does it start slightly earlier than I asked?",
          a: "Because a cut can only land on a keyframe. Keyframes are the frames that can be drawn on their own; the ones in between only describe what changed since an earlier frame. Cut between them and the first second comes out broken, so we move the start back to the nearest keyframe — and tell you where that is before you press the button.",
        },
        {
          q: "Can I get the exact second I asked for?",
          a: "Only by re-encoding the beginning, which costs quality and time. We would rather show you the honest cut point than quietly make that trade for you. If you need frame-exact edits, a full editor is the right tool.",
        },
        {
          q: "Does the quality drop?",
          a: "No. Not a single frame is re-encoded — the picture and sound are copied across exactly as they were. That is also why it finishes almost instantly, even on a large file.",
        },
        {
          q: "Which files can I use?",
          a: "MP4 and MOV. We read the container ourselves rather than shipping a 30MB media toolchain, so AVI and MKV are not offered rather than accepted and then failed on.",
        },
      ],
      ui: {
        dropLabel: "Drop a video here",
        dropHint: "MP4 and MOV — one at a time",
        reading: "reading…",
        seconds: "s",
        noAudio: "no sound",
        startLabel: "Start (seconds)",
        endLabel: "End (seconds)",
        grabHere: "Use playhead",
        snapped: "Cuts at {actual}s, not {asked}s — that is the nearest keyframe before it.",
        onKeyframe: "This start lands exactly on a keyframe.",
        run: "Trim",
        working: "Trimming…",
        outputName: "{stem}-trimmed.mp4",
        resultRange: "{from}s → {to}s · {length}s long",
        lossless: "Nothing was re-encoded.",
        audioKept: "The sound came across untouched.",
      },
    },

    "video-to-gif": {
      blurb: "Turn a clip into a looping GIF. Your device does the work — nothing is uploaded.",
      metaTitle: "Video to GIF — MP4 to GIF in your browser",
      metaDescription:
        "Make a looping GIF from an MP4 or MOV without uploading it. Choose the frame rate and size and see the result before you save. All in your browser.",
      h1: "Video to GIF",
      lead: "Turns a clip into a looping GIF. Pick how smooth and how big it should be — everything happens on your device.",
      faq: [
        {
          q: "Where do my files go?",
          a: "Nowhere. The video is decoded and the GIF is built inside this browser tab. Nothing is uploaded, and closing the tab is all the cleanup there is.",
        },
        {
          q: "Why is the GIF bigger than the video?",
          a: "Because GIF is a 1987 format that stores every frame as a palette of at most 256 colours with no motion compression. A video codec looks at what changed between frames; GIF mostly doesn't. Expect a GIF to be several times the size of the MP4 it came from — that is the format, not the tool.",
        },
        {
          q: "Why does the frame rate come out slightly different?",
          a: "GIF stores each frame's delay in hundredths of a second, so only some rates can be written exactly. 20, 10 and 5 fps land exactly; 15 fps becomes 7/100s, which plays at 14.3. We tell you the real number rather than the one you asked for.",
        },
        {
          q: "How long a clip can I use?",
          a: "Up to 400 frames — 20 seconds at 20 fps, or 40 at 10 fps. Past that a GIF becomes tens of megabytes and browsers start to struggle, so we stop rather than hand you something unusable. Lower the frame rate to fit a longer clip.",
        },
        {
          q: "Which files can I use?",
          a: "MP4 and MOV. We read the container ourselves rather than shipping a 30MB media toolchain, so AVI and MKV are not offered rather than accepted and then failed on.",
        },
      ],
      ui: {
        unsupportedTitle: "This browser can't make GIFs from video.",
        unsupportedHint:
          "Reading the video needs WebCodecs — try an up-to-date Chrome, Edge, Safari 16.4+ or Firefox 130+.",
        dropLabel: "Drop a video here",
        dropHint: "MP4 and MOV — one at a time",
        reading: "reading…",
        seconds: "s",
        fpsLabel: "Frame rate",
        fpsOption: "{n} fps",
        fpsActual: "really {n} fps",
        sizeLabel: "Size",
        sizeOriginal: "Keep original size",
        sizeMax: "Long edge {px}px",
        framesEstimate: "about {n} frames",
        tooManyFrames:
          "That is over {max} frames. Pick a lower frame rate — a GIF this long would be enormous.",
        run: "Make GIF",
        working: "Building…",
        outputName: "{stem}.gif",
        resultFrames: "{n} frames · {fps} fps",
        truncated: "Only the first {n} frames fit, so the end of the clip is missing.",
        biggerNote:
          "The GIF is larger than the video. That is normal — GIF has no motion compression.",
        previewAlt: "The GIF that was just made",
      },
    },

    "audio-extract": {
      blurb: "Pull the sound out of a video. Nothing is re-encoded, so nothing is lost.",
      metaTitle: "Extract Audio from Video — MP4 to M4A or WAV",
      metaDescription:
        "Take the soundtrack out of an MP4 or MOV without uploading it. Keep it lossless as M4A or get a WAV that opens anywhere. Runs entirely in your browser.",
      h1: "Extract audio from video",
      lead: "Takes the soundtrack out of a video. Neither option re-encodes the sound, so nothing is lost along the way.",
      faq: [
        {
          q: "Where do my files go?",
          a: "Nowhere. The extraction runs inside this browser tab and the video is never uploaded. Close the tab and it is gone.",
        },
        {
          q: "M4A or WAV — which should I pick?",
          a: "M4A if you just want the audio: it lifts the original track out untouched, so it is identical to what was in the video and stays small. WAV if something downstream needs plain PCM — editors and older software often do. WAV is much larger because it is uncompressed.",
        },
        {
          q: "Does the sound quality drop?",
          a: "No. M4A copies the original audio exactly as it was — bit for bit. WAV decodes it back to raw samples, which is also lossless relative to what the video contained. Neither path re-compresses the sound.",
        },
        {
          q: "Can I get an MP3?",
          a: "Not today. Browsers can decode MP3 but not create one, and we won't ship a 30MB encoder to add it. M4A is the same idea — compressed, small, widely supported — and it comes straight out of your file with no quality cost.",
        },
      ],
      ui: {
        unsupportedTitle: "This browser can't extract audio.",
        unsupportedHint:
          "This needs WebCodecs — try an up-to-date Chrome, Edge, Safari 16.4+ or Firefox 130+.",
        dropLabel: "Drop a video here",
        dropHint: "MP4 and MOV — one at a time",
        reading: "reading…",
        seconds: "s",
        channels: "{n} channels",
        formatM4a: "M4A — keep the original",
        formatM4aHint: "Lifts the track out untouched. Small, and identical to the video's audio.",
        formatWav: "WAV — opens anywhere",
        formatWavHint: "Uncompressed PCM for editors and older software. Much larger.",
        run: "Extract audio",
        working: "Extracting…",
        outputNameM4a: "{stem}.m4a",
        outputNameWav: "{stem}.wav",
        losslessNote: "identical to the original track",
      },
    },
  },
};

/** en 이 모양의 원본이다. 나머지 언어는 `satisfies Dictionary` 로 빠진 키가 드러난다. */
export type Dictionary = typeof en;
