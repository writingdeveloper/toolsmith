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
    chooseFile: "Choose files",
    download: "Download",
    clear: "Clear",
    downloadAll: "Download all",
    workerUnsupportedTitle: "This browser can't run this tool.",
    workerUnsupportedHint:
      "Please open it in an up-to-date Chrome, Edge, Firefox or Safari that supports Web Workers.",
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
    "video-compress": "Video compressor",
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
      metaTitle: "Split PDF — extract pages or burst into single pages",
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
      metaTitle: "Rotate PDF & delete pages — fix a scan in your browser",
      metaDescription:
        "Turn sideways scans upright and remove the pages you don't need. Every page is shown as a thumbnail. Runs entirely in your browser with no upload and no sign-up.",
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
  },
};

/** en 이 모양의 원본이다. 나머지 언어는 `satisfies Dictionary` 로 빠진 키가 드러난다. */
export type Dictionary = typeof en;
