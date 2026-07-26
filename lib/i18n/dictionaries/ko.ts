import type { Dictionary } from "./en";

export const ko = {
  site: {
    title: "toolsmith — 업로드 없는 브라우저 도구 모음",
    titleTemplate: "%s | toolsmith",
    description:
      "파일이 기기를 떠나지 않습니다. 이미지·영상·PDF 변환을 전부 브라우저 안에서 처리합니다. 가입 없음, 업로드 없음.",
    tagline: "업로드 없음 · 전부 브라우저에서 처리",
    footerNote: "선택한 파일은 서버로 전송되지 않습니다. 모든 처리는 이 브라우저 탭 안에서 끝납니다.",
  },

  home: {
    title: "파일을 업로드하지 않는 변환 도구",
    lead: "이미지·영상·PDF를 브라우저 안에서 직접 처리합니다. 파일이 기기를 떠나지 않으니 업로드를 기다릴 필요도, 삭제를 걱정할 필요도 없습니다.",
    availableHeading: "사용 가능",
    upcomingHeading: "준비 중",
  },

  localePicker: {
    title: "언어를 선택하세요",
    lead: "toolsmith 는 모든 파일을 브라우저 안에서 처리합니다. 언어를 골라 계속하세요.",
  },

  common: {
    chooseFile: "파일 선택",
    download: "다운로드",
    clear: "비우기",
    downloadAll: "전체 다운로드",
    workerUnsupportedTitle: "이 브라우저에서는 이 도구를 실행할 수 없습니다.",
    workerUnsupportedHint: "Web Worker 를 지원하는 최신 Chrome, Edge, Firefox, Safari 에서 열어 주세요.",
  },

  pdfErrors: {
    encrypted: "암호로 보호된 PDF 입니다",
    noPages: "페이지가 없는 PDF 입니다",
    tooLarge: "512MB 를 넘습니다",
    invalid: "PDF 로 읽을 수 없습니다",
    badRange: "페이지 번호를 이해하지 못했습니다",
    outOfBounds: "이 PDF 에 없는 페이지입니다",
    generic: "처리에 실패했습니다",
  },

  toolNames: {
    "image-convert": "이미지 변환·압축",
    "video-convert": "영상 변환",
    "video-compress": "영상 압축",
    "video-trim": "영상 자르기",
    "video-to-gif": "영상 → GIF",
    "audio-extract": "오디오 추출·변환",
    "pdf-merge": "PDF 병합",
    "pdf-split": "PDF 분할",
    "pdf-organize": "PDF 회전·페이지 삭제",
    "pdf-compress": "PDF 압축",
    ocr: "이미지 → 텍스트",
    "data-query": "CSV·Parquet 쿼리",
    subtitles: "자막 생성",
    "subtitle-translate": "자막 번역",
    "remove-bg": "배경 제거",
    cutout: "클릭 컷아웃",
    upscale: "이미지 업스케일",
    stems: "스템 분리",
  },

  tools: {
    "image-convert": {
      blurb: "HEIC·PNG·JPG·WebP·AVIF 상호 변환, 품질 압축, 리사이즈. 여러 장 한 번에.",
      metaTitle: "이미지 변환·압축 — HEIC, PNG, JPG, WebP, AVIF",
      metaDescription:
        "아이폰 HEIC 사진을 JPG로, PNG를 WebP로. 업로드 없이 브라우저에서 바로 변환하고 압축합니다. 가입 불필요, 파일 개수 제한 없음.",
      h1: "이미지 변환·압축",
      lead: "HEIC·PNG·JPG·WebP·AVIF를 서로 바꾸고, 품질을 조절해 용량을 줄이고, 크기를 함께 줄입니다. 여러 장을 한 번에 처리할 수 있습니다.",
      faq: [
        {
          q: "파일은 어디로 가나요?",
          a: "아무 데도 가지 않습니다. 변환은 이 브라우저 탭 안에서 실행되고, 선택한 이미지는 네트워크로 전송되지 않습니다. 탭을 닫으면 그대로 사라집니다.",
        },
        {
          q: "아이폰 HEIC 사진도 되나요?",
          a: "됩니다. Safari는 HEIC를 직접 읽고, Chrome·Firefox에서는 HEIC 파일을 넣은 순간에만 디코더를 내려받아 처리합니다. HEIC를 쓰지 않으면 다운로드도 일어나지 않습니다.",
        },
        {
          q: "어떤 형식을 고르면 되나요?",
          a: "웹에 올릴 거라면 WebP가 같은 화질에서 가장 작습니다. 어디서나 열려야 한다면 JPG, 투명 배경이 필요하면 PNG를 고르세요. 브라우저가 실제로 만들 수 있는 형식만 목록에 나타납니다.",
        },
      ],
      ui: {
        unsupportedTitle: "이 브라우저에서는 이미지 변환을 실행할 수 없습니다.",
        unsupportedHint:
          "OffscreenCanvas 를 지원하는 최신 Chrome, Edge, Firefox, Safari 17 이상에서 열어 주세요.",
        dropLabel: "이미지를 여기에 놓으세요",
        dropHint: "HEIC · PNG · JPG · WebP · AVIF · GIF · BMP — 여러 장 한 번에",
        formatLabel: "출력 형식",
        qualityLabel: "품질 {value}",
        qualityLossless: "품질 (PNG는 무손실)",
        sizeLabel: "크기",
        sizeOriginal: "원본 크기 유지",
        sizeMax: "긴 변 {px}px",
        convert: "{n}장 변환하기",
        converting: "변환 중…",
        itemWorking: "변환 중…",
        errUnsupportedInput: "이 브라우저가 읽지 못하는 형식입니다",
        errGeneric: "변환에 실패했습니다",
      },
    },

    "pdf-merge": {
      blurb: "여러 PDF를 원하는 순서로 하나로. 재렌더링 없이 원본 그대로 이어 붙입니다.",
      metaTitle: "PDF 병합 — 여러 PDF를 하나로 합치기",
      metaDescription:
        "여러 개의 PDF를 원하는 순서로 이어 붙입니다. 업로드 없이 브라우저에서 바로 처리하고, 가입도 워터마크도 파일 개수 제한도 없습니다.",
      h1: "PDF 병합",
      lead: "여러 개의 PDF를 하나의 파일로 이어 붙입니다. 목록에서 순서를 바꾸면 그 순서 그대로 합쳐집니다.",
      faq: [
        {
          q: "파일은 어디로 가나요?",
          a: "아무 데도 가지 않습니다. 병합은 이 브라우저 탭 안에서 실행되고, 선택한 PDF는 네트워크로 전송되지 않습니다. 탭을 닫으면 그대로 사라집니다.",
        },
        {
          q: "페이지 순서는 어떻게 정하나요?",
          a: "목록에 놓인 위에서 아래 순서가 그대로 결과의 페이지 순서입니다. ↑ ↓ 버튼으로 파일 순서를 바꾸고, ✕ 로 목록에서 뺄 수 있습니다. 각 파일의 페이지는 원본 순서를 유지합니다.",
        },
        {
          q: "암호가 걸린 PDF도 되나요?",
          a: "되지 않습니다. 암호로 보호된 PDF는 목록에서 그렇게 표시되고 병합에서 제외됩니다. 열리는 척 하다가 내용이 깨진 결과를 내놓지 않기 위해서입니다. 먼저 암호를 해제한 뒤 넣어 주세요.",
        },
        {
          q: "품질이 떨어지나요?",
          a: "아닙니다. 페이지를 다시 렌더링하지 않고 원본 페이지를 그대로 복사해 붙입니다. 글자는 글자로, 이미지는 원본 해상도 그대로 남습니다.",
        },
      ],
      ui: {
        dropLabel: "PDF 를 여기에 놓으세요",
        dropHint: "두 개 이상 넣으면 위에서부터 순서대로 이어 붙입니다",
        listLabel: "병합할 파일",
        reading: "읽는 중…",
        pageCount: "{n}페이지",
        moveUp: "{name} 위로",
        moveDown: "{name} 아래로",
        remove: "{name} 제거",
        merge: "{n}개 병합하기",
        merging: "병합 중…",
        totalPages: "합계 {n}페이지",
        needTwo: "PDF 가 두 개 이상 필요합니다",
        resultDetail: "{pages}페이지 · {size}",
      },
    },

    "pdf-split": {
      blurb: "원하는 페이지만 뽑거나, 모든 페이지를 낱장 PDF로 쪼개 ZIP으로.",
      metaTitle: "PDF 분할 — 페이지 추출·낱장 분리",
      metaDescription:
        "PDF에서 원하는 페이지만 뽑거나 모든 페이지를 한 장씩 쪼갭니다. 업로드 없이 브라우저에서 바로 처리하고, 가입도 워터마크도 없습니다.",
      h1: "PDF 분할",
      lead: "필요한 페이지만 뽑아 한 개의 PDF로 만들거나, 모든 페이지를 한 장짜리 PDF로 쪼개 ZIP으로 받습니다.",
      faq: [
        {
          q: "파일은 어디로 가나요?",
          a: "아무 데도 가지 않습니다. 분할은 이 브라우저 탭 안에서 실행되고, 선택한 PDF는 네트워크로 전송되지 않습니다. 탭을 닫으면 그대로 사라집니다.",
        },
        {
          q: "페이지 번호는 어떻게 적나요?",
          a: "1-3, 5, 8- 처럼 적습니다. 1-3은 1쪽부터 3쪽까지, 5는 5쪽 한 장, 8-은 8쪽부터 끝까지라는 뜻입니다. 적은 순서가 그대로 결과의 페이지 순서가 됩니다.",
        },
        {
          q: "없는 페이지를 적으면 어떻게 되나요?",
          a: "바로 알려 드립니다. 10쪽짜리에 1-99를 적었을 때 조용히 10쪽까지만 잘라 성공시키면, 없는 페이지가 있다고 착각한 채로 넘어가게 됩니다. 그렇게 하지 않습니다.",
        },
        {
          q: "품질이 떨어지나요?",
          a: "아닙니다. 페이지를 다시 렌더링하지 않고 원본 페이지를 그대로 복사합니다. 글자는 글자로, 이미지는 원본 해상도 그대로 남습니다.",
        },
      ],
      ui: {
        dropLabel: "PDF 를 여기에 놓으세요",
        dropHint: "한 개씩 처리합니다 — 원하는 페이지만 뽑거나, 모든 페이지를 낱장으로 쪼갭니다",
        reading: "읽는 중…",
        pageCount: "{n}페이지",
        modeExtract: "페이지 범위 추출",
        modeExtractHint: "고른 페이지만 모아 PDF 한 개로",
        modePages: "모든 페이지를 낱장으로",
        modePagesHint: "{n}개의 한 장짜리 PDF 를 ZIP 하나로 묶어 드립니다",
        rangeLabel: "추출할 페이지",
        rangePlaceholder: "예: 1-3, 5, 8-  (전체 {n}쪽)",
        selected: "{n}쪽 선택됨",
        needRange: "뽑을 페이지를 적어 주세요",
        runExtract: "추출하기",
        runPages: "낱장으로 쪼개기",
        processing: "처리 중…",
        extractName: "{stem}-추출.pdf",
        zipName: "{stem}-낱장.zip",
        extractDetail: "{pages}페이지 · {size}",
        zipDetail: "PDF {count}개 · {size}",
      },
    },

    "pdf-organize": {
      blurb: "모든 페이지를 눈으로 보면서, 누운 쪽은 세우고 필요 없는 쪽은 뺍니다.",
      metaTitle: "PDF 회전·페이지 삭제 — 브라우저에서 스캔본 정리",
      metaDescription:
        "누워서 스캔된 페이지를 세우고 필요 없는 페이지를 뺍니다. 모든 페이지를 썸네일로 보여 줍니다. 업로드 없이 브라우저에서 처리하고 가입도 필요 없습니다.",
      h1: "PDF 회전·페이지 삭제",
      lead: "모든 페이지를 썸네일로 펼쳐 놓습니다. 누운 쪽은 돌리고, 빈 쪽은 빼고, 남은 것만 저장하세요.",
      faq: [
        {
          q: "파일은 어디로 가나요?",
          a: "아무 데도 가지 않습니다. 썸네일도 저장 파일도 이 브라우저 탭 안에서 만들어지고, 선택한 PDF는 네트워크로 전송되지 않습니다. 탭을 닫으면 그대로 사라집니다.",
        },
        {
          q: "스캔본에 이미 회전이 걸려 있는데, 돌리면 틀어지지 않나요?",
          a: "틀어지지 않습니다. 회전은 원래 페이지가 갖고 있던 값에 더해집니다. 썸네일에서 본 모습이 그대로 결과가 됩니다. 스캐너는 자체 회전값을 넣는 일이 흔한데, 그것을 덮어써 버리는 것이 바로 페이지가 엉뚱한 방향으로 나오는 원인입니다.",
        },
        {
          q: "회전하면 페이지를 다시 그리나요?",
          a: "아닙니다. 회전 표시만 기록하고 페이지 내용은 그대로 복사합니다. 글자는 글자로, 이미지는 원본 해상도 그대로 남습니다. 뭉개지거나 다시 압축되지 않습니다.",
        },
        {
          q: "지운 페이지를 되살릴 수 있나요?",
          a: "떠나기 전까지는 됩니다. 삭제는 표시만 하는 것이라 그 페이지의 ↩ 를 누르거나 전체 되돌리기로 복구됩니다. 디스크의 원본 파일은 어떤 경우에도 수정되지 않습니다.",
        },
      ],
      ui: {
        dropLabel: "PDF 를 여기에 놓으세요",
        dropHint: "한 개씩 처리합니다 — 모든 페이지를 보여 드립니다",
        rendering: "미리보기를 그리는 중…",
        pageCount: "{n}페이지",
        gridLabel: "페이지",
        pageAlt: "{n}쪽",
        rotateLeft: "{n}쪽 왼쪽으로",
        rotateRight: "{n}쪽 오른쪽으로",
        removePage: "{n}쪽 삭제",
        restorePage: "{n}쪽 되돌리기",
        rotateAll: "전체 오른쪽으로",
        resetAll: "전체 되돌리기",
        save: "{n}페이지로 저장",
        saving: "저장 중…",
        needOne: "최소 한 쪽은 남아야 합니다",
        outputName: "{stem}-정리.pdf",
        resultDetail: "{pages}페이지 · {size}",
      },
    },
  },
} satisfies Dictionary;
