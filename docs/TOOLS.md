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
| 4 | 영상 변환 (MP4/WebM/MOV) | ffmpeg.wasm | LGPL/MIT | 최상 | 미착수 |
| 5 | 영상 압축 | ffmpeg.wasm | LGPL | 최상 | 미착수 |
| 6 | 영상 트림·자르기 | ffmpeg.wasm | LGPL | 상 | 미착수 |
| 7 | 영상 → GIF | ffmpeg.wasm | LGPL | 상 | 미착수 |
| 8 | 오디오 추출·변환 (MP3/WAV/M4A) | ffmpeg.wasm | LGPL | 최상 | 미착수 |
| 9 | PDF 병합 | pdf-lib | MIT | 최상 | **배포** |
| 10 | PDF 분할 | pdf-lib + fflate(ZIP) | MIT | 상 | **배포** |
| 11 | PDF 회전·페이지 삭제 | pdf-lib + pdf.js(썸네일) | MIT / Apache-2.0 | 중 | **배포** |
| 12 | PDF 압축 | **pdf-lib + Canvas 이미지 재인코딩** | MIT | 최상 | 미착수 |
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
| Ghostscript.wasm | **AGPL** — 네트워크 배포 시 전체 소스 공개 의무. 상용 불가 |
| mupdf-wasm | AGPL, 동일 |
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
- 전환(핵심 이벤트)은 아직 정의하지 않았다. 정의할 때도 파일명·파일 크기 같은
  파라미터를 실어 보내면 안 된다. "도구를 끝까지 썼다" 정도의 신호만 보낸다.

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
- Next.js 가 상위 디렉터리 lockfile 때문에 워크스페이스 루트를 잘못 잡는다 →
  `next.config.ts` 의 `turbopack.root` 로 고정.
- ffmpeg.wasm 멀티스레드와 `SharedArrayBuffer`는 COOP/COEP 없으면 조용히 단일 스레드로 떨어진다.
- Vercel Functions 요청 본문 4.5MB 제한 → 나중에 유료층 업로드는 **Vercel을 우회**해 4080/R2로 직행.
- 도구 사이트는 스크래퍼가 wasm 자산을 긁어 대역폭을 태운다 → Vercel Firewall 레이트 리밋 필요.
- WebGPU 어댑터 VRAM은 데스크톱 1~4GB, 모바일은 그 이하. iOS Safari는 여전히 불안정.

## 작업 규율

도구 하나당 **구현 → QA → 배포**를 끝내고 다음으로 간다. 여러 도구를 동시에 열지 않는다.
각 단계 완료 시 이 파일의 상태 칸을 갱신하고 커밋한다.
