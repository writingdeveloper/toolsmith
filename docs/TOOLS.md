# toolsmith — 마스터 도구 목록 (단일 진실원천)

> 이 파일이 "무엇을 만들 것인가"의 유일한 기준이다. 새 세션은 여기부터 읽는다.
> 도구를 하나 끝낼 때마다 **상태**를 갱신한다. 상태는 `미착수 → 구현 → QA → 배포`.

## 원칙 (바꾸지 말 것)

1. **서버 연산 0.** v1의 모든 처리는 브라우저 안에서 끝난다. 업로드가 없다.
2. **무거운 자산은 Vercel에 두지 않는다.** AI 모델은 HuggingFace CDN, wasm 바이너리는 R2/jsDelivr.
   Vercel(Pro, 월 1TB)에는 앱 셸만. 근거: 모델 100MB × 방문 1만 = 1TB.
3. **버튼을 누르기 전엔 아무것도 다운로드하지 않는다.** 모든 무거운 모듈은 지연 로딩.
4. **3단 폴백.** WebGPU → WASM(CPU) → 명확한 미지원 안내. 조용한 실패 금지.
5. **카피레프트 금지.** AGPL/GPL 라이브러리는 채택하지 않는다 (아래 라이선스 지뢰 참조).
6. **메인 스레드에서 처리하지 않는다.** 전부 Web Worker.

## 층 구조와 각 층의 역할

| 층 | 런타임 | 역할 | 원가 |
|---|---|---|---|
| **Tier 1** | WASM / 브라우저 네이티브 (CPU) | **SEO 트래픽**. 전 기기(모바일 포함) 동작 | 0 |
| **Tier 2** | WebGPU | **차별화·재방문**. 데스크톱 한정 | 0 |
| **Tier 3** | WebGPU (Lab) | **백링크·소셜**. 화제성 전용, 실용성 무관 | 0 |
| (유료, 보류) | 4080 노트북 서버 | 긴 파일·대형 모델·배치·모바일 | GPU 시간 |

유료층은 **Tier 1~2가 실제 유입을 만든 뒤에만** 착수한다. v1에서는 4080을 쓰지 않는다.

---

## Tier 1 — WASM/CPU (SEO 앵커)

전 기기에서 돌고, 다운로드가 작고, 검색 수요가 크다. **여기가 트래픽의 원천이다.**

| # | 도구 | 라이브러리 | 라이선스 | 검색수요 | 상태 |
|---|---|---|---|---|---|
| 1 | 이미지 변환 (HEIC/PNG/JPG/WebP/AVIF) | Canvas/createImageBitmap + libheif-js | LGPL(동적) | 최상 | **배포** |
| 2 | 이미지 압축 (품질 조절) | Canvas | — | 상 | 미착수 |
| 3 | 이미지 리사이즈·크롭 | Canvas | — | 상 | 미착수 |
| 4 | 영상 변환 (MP4/WebM/MOV) | **WebCodecs** + mp4box/mp4-muxer | BSD-3/MIT | 최상 | 미착수 |
| 5 | 영상 압축 | **WebCodecs** + mp4box/mp4-muxer | BSD-3/MIT | 최상 | **배포** |
| 6 | 영상 트림·자르기 | **WebCodecs** | BSD-3/MIT | 상 | 미착수 |
| 7 | 영상 → GIF | **WebCodecs** + gifenc | MIT | 상 | **배포** |
| 8 | 오디오 추출·변환 (WAV/M4A) | **WebCodecs** | BSD-3/MIT | 최상 | **배포** |
| 9 | PDF 병합 | pdf-lib | MIT | 최상 | **배포** |
| 10 | PDF 분할 | pdf-lib + fflate(ZIP) | MIT | 상 | **배포** |
| 11 | PDF 회전·페이지 삭제 | pdf-lib + pdf.js(썸네일) | MIT / Apache-2.0 | 중 | **배포** |
| 12 | PDF 압축 | **pdf-lib + Canvas 이미지 재인코딩** | MIT | 최상 | **배포** |
| 13 | 이미지/PDF → 텍스트 (OCR) | tesseract.wasm | Apache-2.0 | 중 | 미착수 |
| 14 | CSV/Parquet 뷰어·SQL 쿼리 | DuckDB-wasm | MIT | 중(무주공산) | 미착수 |

## Tier 2 — WebGPU AI (차별화)

`webml-community` Transformers.js V4 데모가 사실상 부품 카탈로그. 데스크톱 전용, VRAM 1~4GB 상한.

| # | 도구 | 모델/출처 | 상태 |
|---|---|---|---|
| 15 | 자막 생성 (음성→텍스트) | Voxtral Realtime WebGPU | 미착수 |
| 16 | 자막 번역 (56개 언어) | TranslateGemma 4B WebGPU | 미착수 |
| 17 | 배경 제거 | RMBG-1.4 / MODNet | 미착수 |
| 18 | 클릭 객체 컷아웃 | SAM3 Tracker WebGPU (※ `segment-anything-webgpu` 레포 재활용) | 미착수 |
| 19 | 이미지 업스케일 4× | Real-ESRGAN / Real-CUGAN (TF.js WebGPU) | 미착수 |
| 20 | 스템 분리 미리듣기 (30초) | Demucs (ONNX Runtime Web) | 미착수 |
| 21 | 문서·웹페이지 요약 | LFM2.5 Summarizer | 미착수 |

**핵심 퍼널**: 15(자막) → 16(번역) → ffmpeg.wasm(SRT 굽기)까지 전부 무료.
마지막 칸(4080 Qwen3-TTS 더빙)만 유료. 이 흐름이 유료 전환의 축이다.

## Tier 3 — Lab (백링크 전용)

실용성이 아니라 **화제성**이 목적. 도메인 권위를 올려 Tier 1 페이지의 SEO를 밀어 올린다.

| # | 데모 | 비고 | 상태 |
|---|---|---|---|
| 22 | Bonsai 27B 1-bit 브라우저 구동 | 54GB→3.8GB(-93%), 지능 90% 유지. 커널을 Fable 5 + GPT-5.6 Sol이 작성한 것이 화제의 본체 | 미착수 |
| 23 | 실시간 영상 캡셔닝 | LFM2-VL WebGPU | 미착수 |
| 24 | Text Behind Video | 소셜 바이럴형 | 미착수 |

**주의**: Tier 3은 3.8GB 다운로드 등 일반 방문자에겐 불가능한 물건이다.
`/lab` 경로에 격리하고, Tier 1·2 도구 페이지에서 링크하지 않는다.

---

## 채택하지 않기로 한 것 (재논의 금지)

| 대상 | 이유 |
|---|---|
| **ffmpeg.wasm (@ffmpeg/core)** | **GPL 빌드다.** 실측(2026-07-26): `ffmpeg-core.wasm` 안에 박힌 빌드 설정이 `--enable-gpl --enable-libx264 --enable-libx265`. libx264/x265 를 링크한 결과물은 GPL 이 되고, 30.7MB 바이너리를 브라우저에 보내는 것은 배포에 해당한다 → 사이트 전체가 GPL 이 된다. 표에 "LGPL/MIT" 로 적혀 있던 것은 **검증 전 기재였고 사실이 아니었다.** LGPL 빌드를 직접 만들면 쓸 수 있지만 그때도 H.264 인코딩은 빠진다 |
| Ghostscript.wasm | **AGPL** — 네트워크 배포 시 전체 소스 공개 의무. 상용 불가 |
| mupdf-wasm | AGPL, 동일 |
| mediabunny | MPL-2.0. 약한 카피레프트라 실무 위험은 낮지만, MIT/BSD 조합(mp4box + mp4-muxer + webm-muxer)으로 같은 일이 되므로 굳이 들이지 않는다 |
| LibreOffice WASM (문서 변환) | 2026년에도 너무 크고 느리고 불안정. 문서 변환은 v1 범위 밖 |
| 브라우저 챗봇 (Gemma/Qwen/GPT-OSS) | 차별화 0, 다운로드만 큼. 도구 사이트와 무관 |
| YouTube URL 입력 | DMCA + 결제 처리사 계정 위험. **업로드만 받는다** |
| 광고 수익 모델 | RPM $3~8. 트래픽 폭증 시 서버 원가를 못 이김. 크레딧 선불제로 간다 |

## 다국어 (2026-07-25 결정, 재논의 금지)

- **en · ko · ja · es · de · pt-br** 6개. 근거: en 은 검색량과 LLM 인용의 기본값,
  es·pt-BR 은 화자 수 대비 변환 도구 경쟁이 느슨하고, ja 는 유료 전환율이 높으며,
  de 는 구매력이 가장 크다. zh 는 구글 점유율이 낮아 제외, id·hi 는 트래픽 대비 단가가
  낮아 보류.
- URL 은 **전 언어 접두사**(`/en/...`, `/ko/...`). 기본 언어라고 접두사를 빼지 않는다 —
  한 언어만 규칙이 다르면 색인·링크 실수가 거기서 난다. `/` 는 정적 언어 선택 페이지,
  x-default 는 `/en`.
- 새 도구를 만들 때 6개 언어 사전을 **함께** 채운다. 영어로 새는 것은
  `tests/i18n.spec.ts` 가 잡는다.

## 배포 상태

- 라이브: **https://toolsmith.writingdeveloper.blog** (Vercel Pro, 스코프
  `sihyeong-lees-projects-64e0ba83`). 다른 서비스와 같은 `*.writingdeveloper.blog` 패턴.
- **색인 열림(2026-07-25).** `NEXT_PUBLIC_SITE_URL` 프로덕션 env 로 robots 가 열리고
  사이트맵 24개 URL(6 언어 × 4 페이지)이 채워졌다.
- 배포 URL `toolsmith-two.vercel.app` 은 같은 문서를 내므로 `next.config.ts` 의 host 조건
  헤더로 `X-Robots-Tag: noindex` 를 붙였다. canonical 만으로는 권고에 그친다.
- **Search Console 은 서브도메인마다 별도 속성**을 만드는 것이 이 계정의 방식이다.
  `sc-domain:toolsmith.writingdeveloper.blog` 등록됨(자동 인증). 사이트맵 Success,
  발견 페이지 30개. 새 도구를 배포하면 이 숫자가 언어 수(6)만큼 늘어야 한다.
- **미완료: Vercel Spend Management 지출 한도 알림.** 대시보드에서 직접 켜야 한다.

## 구조화 데이터 (JSON-LD)

- 도구 페이지: `WebApplication` + `FAQPage` + `BreadcrumbList` 를 `@graph` 하나에.
  홈: `WebSite`. 전부 `lib/schema.ts` 가 사전에서 만들어 내므로 언어마다 자동으로 달라진다.
- **없는 것을 지어내지 않는다.** `aggregateRating` 은 넣지 않는다 — 받은 적이 없다.
  구글 리치 결과 테스트가 "선택사항 누락" 경고를 내지만 유효 판정에는 영향이 없다.
- `FAQPage` 는 리치 결과로 표시되지 않는다(구글이 2023년 이후 정부·의료로 제한).
  그래도 LLM 이 읽는 데는 유효해서 남긴다. **화면에 보이는 Q&A 와 반드시 같아야 한다** —
  `tests/schema.spec.ts` 가 h2 목록과 대조한다.
- 실측(2026-07-25): 리치 결과 테스트에서 **유효 항목 2개**(탐색경로, 소프트웨어 앱).

## 분석(GA4)

- 속성 **Toolsmith**, 측정 ID `G-V1SX1J2BG2`. `NEXT_PUBLIC_GA_ID` 가 없으면 태그를 심지
  않는다 — 로컬·프리뷰 클릭이 프로덕션 통계를 더럽히지 않게.
- **향상된 측정의 "파일 다운로드" 는 반드시 꺼 둔다.** 이 항목은 클릭된 다운로드 링크의
  이름을 GA 로 보내는데, 우리 결과 파일 이름에는 사용자의 원본 파일명이 들어간다
  (`보고서-추출.pdf`). "파일이 기기를 떠나지 않는다" 는 약속이 바로 여기서 깨진다.
  새 스트림을 만들 때마다 확인할 것 — 기본값이 **켜짐**이다.
- **전환 이벤트는 `tool_completed`** 하나다. 도구가 결과를 만들어 낸 순간 보내고,
  실리는 것은 `tool_slug`(도구 이름) 뿐이다. 파일명·크기·페이지 수는 넣지 않는다 —
  파일명에는 사용자의 사정이 그대로 들어 있고, 크기와 쪽수도 모이면 문서를 지목하는
  실마리가 된다.
- `@next/third-parties` 의 `sendGAEvent` 는 쓰지 않는다. dataLayer 에 넣기는 하는데
  gtag.js 가 집어가지 않았다(실측: `gtm.uniqueEventId` 가 붙지 않고 collect 요청도
  나가지 않음). 태그가 정의한 **`window.gtag` 를 직접 부른다.**
- **GA4 는 이벤트를 모아 보낸다.** 테스트에서 고정 대기(3초)로는 놓친다 →
  `expect.poll` 로 기다린다. "파일명이 없다" 를 검사할 때도 먼저 전환 이벤트가
  도착한 것을 확인한 뒤에 본다(양성 대조). 아무것도 안 온 상태의 "없음"은 아무 증명도 아니다.

## 영상·오디오는 WebCodecs 로 간다 (2026-07-26 결정)

ffmpeg.wasm 이 GPL 이라 못 쓰게 되면서 방향을 바꿨고, 결과적으로 이 프로젝트 규칙에 더 잘 맞는다.

- **다운로드 0MB.** ffmpeg.wasm 은 30.7MB 였다. 규칙 2·5 를 애초에 어길 일이 없다.
- **COEP 불필요.** SharedArrayBuffer 를 쓰지 않으므로 헤더 스코프 문제 자체가 사라진다.
- **하드웨어 가속.** 실측(2026-07-26, 테스트 Chromium): 인코더 H.264(baseline·main)·VP8·
  VP9·AV1, 오디오 AAC·Opus 전부 지원.
- 대가: **입력 컨테이너를 직접 열어야 한다.** MP4/MOV 는 mp4box.js(BSD-3)로 demux 하고,
  출력은 mp4-muxer/webm-muxer(MIT)로 쓴다. AVI·MKV 같은 입력은 받지 않는다 —
  **받는 척하지 말고 목록에서 빼는 쪽이 이 프로젝트의 방식이다.**
- 브라우저 지원이 이미지·PDF 도구보다 좁다(Firefox 130+, Safari 16.4+).
  `VideoEncoder.isConfigSupported` 로 실제 능력을 물어 목록을 만든다.
- **AAC 의 `description` 은 esds 박스가 아니라 그 안의 AudioSpecificConfig 다.**
  avcC 는 박스 payload 가 곧 디코더 설정이라 헤더 8바이트만 떼면 되지만, esds 는
  ES_Descriptor 가 겹겹이 싸인 구조다. 같은 방법을 쓰면 만들어진 M4A 가
  `Unable to decode audio data` 로 거절당한다 — **소리가 안 나는 파일을 내주게 된다.**
  mp4box 가 파싱해 둔 값을 쓰고, 없으면 2바이트를 직접 조립한다(`describeAac`).
- **GIF 는 인코더가 필요 없다.** 색 줄이기와 GIF 조립은 gifenc(MIT, 20KB)가 JS 로 한다.
  그래서 능력 판정도 `VideoEncoder` 가 아니라 **`VideoDecoder`** 로 물어야 한다
  (`canRunGifTools`). 인코더로 물으면 H.264 인코더가 없는 기기에서 멀쩡한 도구를
  "못 한다" 고 잘못 막는다.

## GIF 는 1/100초 격자 위에서만 움직인다 (2026-07-26)

GIF89a 는 프레임 지연을 **1/100초 단위 정수**로만 적는다. 임의의 fps 를 담을 수 없다.

- 20 · 10 · 5 fps 는 딱 떨어진다(5 · 10 · 20 칸). **15fps 는 7칸 = 14.29fps 가 된다.**
- 그래서 `lib/video/gif-timing.ts` 가 그 반올림을 **한 곳에 모은다.** 워커와 UI 가 같은
  함수를 부르므로 화면의 숫자와 파일 안의 숫자가 어긋날 수 없다. 요청값과 실제값이
  다를 때만 "실제로는 14.3 fps" 를 덧붙인다 — 규칙 3의 GIF 판.
- 2칸(50fps) 미만은 브라우저마다 10칸으로 바꿔 버리므로 하한을 2칸으로 둔다.
- **400프레임 상한.** 넘으면 버튼을 막고 이유를 말한다. GIF 는 움직임 압축이 없어
  길이가 곧 용량이다 — 30초짜리는 수십 MB 가 되고 브라우저가 먼저 무너진다.
- 프레임을 **모아 두지 않는다.** 디코더가 프레임을 내놓는 그 자리에서 양자화해 스트림에
  흘린다. 480×270 400장을 ImageData 로 쥐면 200MB 다.
- 색표는 **프레임마다 새로 뽑는다**(첫 장은 전역 색표, 나머지는 지역 색표). 장면이 바뀌어도
  색이 무너지지 않는 대신 프레임당 768바이트를 더 쓴다 — 그만한 값어치가 있다.

## 기술 함정 (걸려본 것 / 걸릴 것)

- `COEP: require-corp`를 켜면 **교차 출처 리소스가 전부 차단**된다 → HF CDN 모델 로드와 정면 충돌.
  `credentialless`를 쓰거나 COEP가 필요한 경로에만 헤더를 건다.
  **실측(2026-07-25)**: v1 은 COOP/COEP 를 걸지 않았고 `crossOriginIsolated === false` 인 상태로
  이미지 도구가 정상 동작한다. ffmpeg.wasm 을 붙이는 시점에 `/tools/video/*` 로 스코프해서 켠다.
- Vercel CLI 첫 배포는 git 연결이 없으면 **preview 가 아니라 production 으로 올라간다.**
  `--target preview` 를 명시해야 한다.
- 워커에서 `Omit<Union, "id">` 는 공통 키만 남겨 payload 를 날린다. 조건부 타입으로 분배해야 한다.
- **지연 로딩은 dev 서버에서 판정하지 말 것.** Turbopack dev 는 동적 import 청크를 미리
  당겨온다 → dev 만 보면 멀쩡한 코드가 규칙 2번 위반처럼 보인다.
  **실측(2026-07-25, 프로덕션)**:
  - `/tools/image-convert` 로드 546KB → HEIC 를 넣은 순간 **+1.48MB**(libheif). 정상.
  - `/tools/pdf-merge` 로드 529KB → PDF 를 넣은 순간 **+461KB**(워커+pdf-lib). 정상.
  - `/tools/video-to-gif` 로드 530KB → 영상을 넣은 순간 **+204KB**(mp4box+gifenc). 정상.

  같은 페이지를 dev 에서 보면 둘 다 로드 시점에 이미 내려와 있다. **판정은 반드시
  `BASE_URL=<배포주소> pnpm test` 로 한다.** 두 스펙 모두 프로덕션 전용 검사를 갖고 있고,
  dev 에서는 자동으로 스킵된다.
- pdf-lib 파서는 관대해서 PDF 가 아닌 바이트도 `PDFDocument.load` 는 통과시키고
  `getPageCount()` 에서 TypeError 로 터진다. load 만 try 로 감싸면 오류 분류가 새어 나간다.
- pdf-lib 은 암호화를 **복호화하지 않는다.** `ignoreEncryption: true` 로 열면 내용이 깨진
  결과가 조용히 나온다 → 암호 PDF 는 열지 말고 거부해야 한다.
- **pdf-lib 과 pdf.js 는 같은 사정을 다른 말로 알린다.** pdf-lib 은 `EncryptedPDFError`,
  pdf.js 는 `PasswordException`("No password given" — 'encrypted' 라는 말이 없다).
  pdf.js 에게 먼저 물으면 암호 걸린 파일에 "읽을 수 없습니다" 라고 잘못 안내하게 된다 →
  **썸네일을 그리기 전에 pdf-lib 으로 먼저 연다.** 덤으로 못 그릴 파일에 pdf.js(1.5MB)를
  내려받지 않는다.
- pdf.js 6 에는 `PDFDocumentProxy.destroy` 가 없다. `getDocument()` 가 준 **로딩 태스크**를
  destroy 해야 pdf.js 가 띄운 워커까지 정리된다.
- **회전은 원본 값에 더한다.** 스캔본은 `/Rotate 90` 을 달고 있는 일이 흔하고, 사용자가 화면에서
  본 것은 그 회전이 적용된 모습이다. 덮어쓰면 눈에 보이던 것과 다른 결과가 나온다.
- **PDF 압축은 페이지를 굽지 않는다.** 페이지를 통째로 래스터화하면 훨씬 많이 줄지만 글자가
  글자이기를 그만둔다(선택·검색·화면낭독기 전멸). 안에 박힌 **JPEG(DCTDecode)만** 다시
  인코딩한다. Flate 이미지는 색공간·비트깊이 조합이 너무 다양해 건드리지 않고,
  `Decode` 배열(색 반전 등)이 있으면 건너뛴다. `SMask`/`Mask` 가 있으면 크기를 바꾸지
  않는다 — 마스크와 픽셀 수가 어긋나면 문서가 깨진다.
- **다시 저장하는 것만으로도 몇 % 줄어든다.** 그 몫을 절감률로 표시하면 하지 않은 일을 한
  것처럼 보인다 → 실제로 사진을 갈아 끼웠을 때(`rewritten > 0`)만 `-N%` 를 붙인다.
  이건 테스트가 잡아낸 실제 결함이다.
- **dev 서버가 떠 있는 동안 `pnpm build` 를 돌리지 말 것.** 둘이 같은 `.next` 를 쓰기 때문에
  실행 중인 dev 서버의 캐시가 깨지고, 그때부터 테스트가 `SyntaxError: Unexpected end of
  JSON input` 과 함께 무더기로 무너진다. 겪고 나면 원인을 찾기 어렵다.
- **Playwright 워커 수도 같은 증상을 만든다(2026-07-26).** 기본값(코어의 절반, 이 기계는 12)
  으로 돌리면 `next dev` 한 대에 12개가 동시에 컴파일을 요구하다가 `.next` 매니페스트를
  쓰는 중에 읽어 버린다 → 전 페이지가 `SyntaxError: Unexpected non-whitespace character
  after JSON` 으로 죽고 85개 중 1개만 통과한다. **`.next` 를 지워도 낫지 않는다** — 부하
  문제이지 캐시 문제가 아니기 때문. `playwright.config.ts` 에 `workers: 4` 로 고정했다
  (그러자 42초에 전부 통과). 배포본(정적)을 칠 때는 제한하지 않는다.
- Next.js 가 상위 디렉터리 lockfile 때문에 워크스페이스 루트를 잘못 잡는다 →
  `next.config.ts` 의 `turbopack.root` 로 고정.
- ffmpeg.wasm 멀티스레드와 `SharedArrayBuffer`는 COOP/COEP 없으면 조용히 단일 스레드로 떨어진다.
- Vercel Functions 요청 본문 4.5MB 제한 → 나중에 유료층 업로드는 **Vercel을 우회**해 4080/R2로 직행.
- 도구 사이트는 스크래퍼가 wasm 자산을 긁어 대역폭을 태운다 → Vercel Firewall 레이트 리밋 필요.
- WebGPU 어댑터 VRAM은 데스크톱 1~4GB, 모바일은 그 이하. iOS Safari는 여전히 불안정.

## 작업 규율

도구 하나당 **구현 → QA → 배포**를 끝내고 다음으로 간다. 여러 도구를 동시에 열지 않는다.
각 단계 완료 시 이 파일의 상태 칸을 갱신하고 커밋한다.
