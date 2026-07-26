# toolsmith — 작업 지침

업로드 없이 브라우저 안에서 끝나는 파일 변환 도구 모음.

## 세션을 시작하면 이 순서로 읽는다

1. **`docs/TOOLS.md`** — 마스터 도구 목록(24종, 3티어). 무엇을 만들지, 무엇을 만들지
   않기로 했는지, 왜 그렇게 정했는지의 **단일 진실원천**. 여기 적힌 결정은 재논의하지 않는다.
2. `README.md` — 구조와 스택.
3. 이 파일 — 작업 루프와 규칙.

## 작업 루프 (사용자가 정한 방식)

**도구 하나씩 `구현 → QA → 배포`.** 여러 도구를 동시에 열지 않는다.

1. `docs/TOOLS.md` 에서 다음 도구를 고른다 (Tier 1 부터, 검색수요 높은 순).
2. `lib/tools.ts` 에 등록하고 `app/[locale]/tools/<slug>/` 를 만든다.
3. 처리 로직은 `lib/<domain>/` 에 **순수 모듈**로 두고 워커가 그것을 부른다.
   순수 모듈은 `window` / `document` 를 참조하지 않는다 (워커·메인 양쪽에서 쓰인다).
4. **사전 6개를 채운다.** `lib/i18n/dictionaries/en.ts` 에 키를 추가하면 나머지 5개는
   타입 에러로 빠짐없이 드러난다. 사람이 읽는 문자열을 컴포넌트에 직접 쓰지 않는다.
5. `tests/<slug>.spec.ts` 작성 → `pnpm test`. 스펙은 `/ko/tools/<slug>` 를 친다.
6. 배포 → `BASE_URL=<배포주소> pnpm test` → `docs/TOOLS.md` 상태 칸 갱신 → 커밋.

## 다국어 (2026-07-25 도입)

- 지원: **en · ko · ja · es · de · pt-br** (`lib/i18n/config.ts` 가 유일한 목록).
- URL 은 전부 접두사: `/{locale}/tools/{slug}`. URL 세그먼트는 **소문자**(`pt-br`),
  `<html lang>` 과 hreflang 은 표준 표기(`pt-BR`) — `HTML_LANG` 이 그 변환을 갖는다.
- `/` 는 정적 언어 선택 페이지. **리다이렉트를 쓰지 않는다** — 미들웨어를 켜면
  Vercel Function 이 돌아 "서버 연산 0" 이 깨진다.
- 루트 레이아웃이 두 개다: `app/(root)/layout.tsx`(언어 선택)와
  `app/[locale]/layout.tsx`(그 외 전부). `app/layout.tsx` 를 만들면 안 된다 —
  그 순간 모든 페이지가 하나의 `<html lang>` 을 공유하게 된다.
- 사전은 **서버 컴포넌트에서만** 읽고 클라이언트에는 필요한 조각만 prop 으로 넘긴다.
  그래서 사전에 함수를 담을 수 없다 → 자리표시자는 `fill()` 로 채운다.
- `tests/i18n.spec.ts` 가 언어 × 페이지, lang 속성, hreflang, canonical, 404 를 고정한다.

## 명령어

```bash
pnpm dev              # 개발 서버
pnpm build            # 타입체크 포함
pnpm test             # Playwright (dev 서버 자동 기동)
pnpm fixtures         # tests/fixtures 재생성

# 배포본에 같은 스펙을 그대로 친다 (dev 서버를 띄우지 않는다)
BASE_URL=https://toolsmith.writingdeveloper.blog pnpm test

vercel deploy --prod --yes --scope sihyeong-lees-projects-64e0ba83
```

## QA 규칙 — 이것만은 지킨다

**UI 텍스트를 믿지 않는다. 결과 blob 을 실제로 디코드해서 검증한다.**
`tests/image-convert.spec.ts` 의 `inspectResults()` 가 템플릿이다. 매직바이트, 실제 픽셀값,
출력 크기를 본다. "변환됨" 이라는 글자가 떴다는 것은 아무것도 증명하지 않는다.

## 영상·오디오는 ffmpeg.wasm 이 아니다 (2026-07-26)

**`@ffmpeg/core` 는 GPL 빌드다.** wasm 안의 빌드 설정이 증거:
`--enable-gpl --enable-libx264 --enable-libx265`. 30.7MB 바이너리를 브라우저로 보내는 것은
배포이므로 사이트 전체가 GPL 이 된다 → 규칙 6 위반. **다시 집어들지 말 것.**

대신 **WebCodecs**(브라우저 내장)로 간다. 받을 것이 0MB 이고 하드웨어 가속을 탄다.
컨테이너만 우리가 연다: mp4box.js(BSD-3, demux) + mp4-muxer/webm-muxer(MIT, mux).
자세한 근거와 실측은 `docs/TOOLS.md` 의 "영상·오디오는 WebCodecs 로 간다".

## 절대 규칙

1. **서버 연산 0.** v1 의 모든 처리는 브라우저 안에서 끝난다. 업로드가 없다.
   4080 노트북 서버는 **쓰지 않는다** — Tier 1~2 가 실제 유입을 만든 뒤에 착수한다.
2. **버튼을 누르기 전엔 무거운 자산을 받지 않는다.** 동적 import 로 지연 로딩.
3. **못 하는 것을 할 수 있다고 표시하지 않는다.** `convertToBlob` 은 미지원 형식에 예외 없이
   조용히 PNG 를 뱉는다 → 반환된 `blob.type` 을 대조해 능력 목록을 만든다.
4. **COOP/COEP 를 전역으로 켜지 않는다.** `require-corp` 는 교차 출처를 전부 막아 HF CDN
   모델 로드를 죽인다. `SharedArrayBuffer` 가 필요한 경로에만 스코프해서 건다.
5. **무거운 자산을 Vercel 에서 서빙하지 않는다.** 모델은 HF CDN, wasm 은 R2/jsDelivr.
   근거: 모델 100MB × 방문 1만 = 1TB(Pro 한도).
6. **카피레프트 금지.** AGPL/GPL 라이브러리는 채택하지 않는다.
7. **메인 스레드에서 처리하지 않는다.** 전부 Web Worker.

## 현재 상태 (2026-07-26)

**라이브: https://toolsmith.writingdeveloper.blog** — 6개 언어 × (홈 + 도구 12) = 78 페이지
+ 루트 언어 선택. 전부 정적. Playwright **106종**(프로덕션 104 통과 / 2 스킵).
dev 는 90 통과 / 15 스킵 — pdf-compress 1건이 냉컴파일 부하로 30초 타임아웃을 냈지만
단독으로는 8/8 통과한다. 판정은 프로덕션 수치로 한다.

### 배포된 도구 12개

| # | 도구 | 경로 | 핵심 |
|---|---|---|---|
| 1 | 이미지 변환·압축 | `/tools/image-convert` | HEIC 는 파일이 들어온 순간에만 libheif 를 받는다 |
| 4 | 영상 변환 | `/tools/video-convert` | MOV→MP4 는 재mux, MP4→WebM 만 재인코딩 |
| 13 | 이미지·PDF → 텍스트 | `/tools/ocr` | **받아야 시작하는 첫 도구** — 용량을 미리 말한다 |
| 14 | CSV·Parquet 쿼리 | `/tools/data-query` | DuckDB-wasm. **파일을 읽어 올리지 않는다**(핸들만 넘긴다) |
| 9 | PDF 병합 | `/tools/pdf-merge` | 재렌더링 없이 페이지 복사 |
| 10 | PDF 분할 | `/tools/pdf-split` | 범위 추출 + 낱장 ZIP(fflate) |
| 11 | PDF 회전·삭제 | `/tools/pdf-organize` | pdf.js 썸네일. 회전은 **원본 값에 더한다** |
| 12 | PDF 압축 | `/tools/pdf-compress` | JPEG 만 재인코딩 — **글자가 살아 있다** |
| 5 | 영상 압축 | `/tools/video-compress` | WebCodecs. 오디오는 원본 그대로 옮김 |
| 8 | 오디오 추출 | `/tools/audio-extract` | M4A·WAV. **어느 쪽도 재인코딩하지 않는다** |
| 7 | 영상 → GIF | `/tools/video-to-gif` | gifenc. **fps 는 1/100초 격자에만 앉는다** |
| 6 | 영상 자르기 | `/tools/video-trim` | 코덱을 안 쓴다. **키프레임에서만 잘린다는 것을 미리 말한다** |

경로 앞에 `/{locale}` 이 붙는다(`/ko/tools/pdf-merge`).

### 공통 토대 (새 도구는 여기서 갈라진다)

- `lib/pdf/document.ts` — PDF 열기·오류 번역. 병합·분할·회전·압축이 함께 쓴다.
- `lib/pdf/pdfjs-options.ts` — pdf.js 를 **워커에서** 쓰기 위한 설정. `disableFontFace`
  가 빠지면 CJK PDF 가 통째로 빈 네모로 그려진다(예외 없이, 그림만 틀린다). 근거와
  실측은 `docs/TOOLS.md`.
- `lib/pdf/render-core.ts` — pdf.js 썸네일. **썸네일 전에 pdf-lib 으로 먼저 연다**
  (암호 판정이 정확해지고, 못 그릴 파일에 1.5MB 를 안 받는다).
- `lib/video/mp4-source.ts` — MP4 demux. 영상·오디오 도구가 전부 이걸 쓴다.
- `lib/video/capabilities.ts` — 능력 판정. 도구마다 **필요한 것만** 물어야 한다:
  압축은 `VideoEncoder`, 오디오는 `AudioDecoder`, GIF 는 `VideoDecoder`.
- `lib/video/gif-timing.ts` — GIF 의 1/100초 반올림. 워커와 UI 가 같은 함수를 부르므로
  화면 숫자와 파일 안 숫자가 어긋날 수 없다.
- `lib/video/trim-core.ts` — 재인코딩 없는 재mux. **cts/dts 를 다루는 유일한 곳**이다.
  `Sample.decodeTime` 과 `readMp4` 의 `rebase()` 가 여기 때문에 생겼다.
  `remuxMp4()` 는 이미 열어 둔 소스를 받는다 — 영상 변환(MOV→MP4)이 **구간만 파일 전체로
  주고** 그대로 재사용한다.
- `lib/video/convert-core.ts` — 상자 바꾸기. 두 갈래의 성격이 정반대라(무손실 재mux vs
  전부 재인코딩) UI 가 어느 쪽인지 미리 말한다. **`AudioEncoder` 를 부르는 유일한 곳**
  (`transcodeToOpus`) 이기도 하다.
- `lib/use-capability.ts` — "이 브라우저가 할 수 있는가" 를 묻는 유일한 방법.
  `useEffect` 안에서 `setSupported(...)` 를 부르지 말 것 — 서버에는 `Worker` 도
  `OffscreenCanvas` 도 없어 렌더 중에 물을 수도 없다. `useSyncExternalStore` 가
  서버엔 `null`, 클라이언트엔 실제 값을 준다.
- `lib/i18n/dictionaries/en.ts` — 사전의 **타입 원본**. 여기에 키를 더하면 나머지 5개가
  타입 에러로 드러난다.

### SEO·분석 (전부 끝났고 검증됨)

- 색인 열림. `*.vercel.app` 은 `next.config.ts` 가 `X-Robots-Tag: noindex` 로 막는다.
- Search Console: **서브도메인마다 별도 속성**(`sc-domain:toolsmith.…`). 사이트맵 Success.
- JSON-LD: WebApplication + FAQPage + BreadcrumbList. 리치 결과 테스트 유효 2개.
  `aggregateRating` 없음은 **의도** — 받은 적 없는 평점을 지어내지 않는다.
- GA4 `G-V1SX1J2BG2`. 전환 이벤트 `tool_completed`(실리는 것은 도구 이름뿐).
  **자동화된 브라우저에는 태그를 심지 않는다** — 프로덕션 스펙 한 번이 방문 100여 건을
  만들어 통계를 통째로 뒤덮었다(2026-07-26 실측: 사용자 282 / 세션 283, 검색 노출 0).
  판단은 `components/Analytics.tsx` 에 있고, 켜는 길은 `tests/analytics.spec.ts` 의
  `__toolsmithAnalyticsOptIn` 하나뿐이다. 근거는 `docs/TOOLS.md`.
  **향상된 측정의 "파일 다운로드" 는 꺼 두었다** — 켜면 사용자 파일명이 구글로 간다.

### 이 저장소에서 두 번 이상 데인 것

- **`pnpm build` 는 dev 서버가 떠 있을 때 돌리지 않는다.** 같은 `.next` 를 쓰기 때문에
  실행 중인 dev 서버 캐시가 깨져 테스트가 무더기로 무너진다(`Unexpected end of JSON input`).
  겪었다면 3111 포트 프로세스를 죽이고 `.next` 를 지운 뒤 다시 돌린다.
- 지연 로딩은 **dev 에서 판정하지 말 것.** Turbopack dev 가 동적 import 를 당겨온다.
  `BASE_URL=<배포주소> pnpm test` 로만 판단한다.
- **`.next` 가 깨진 것처럼 보이는 두 번째 원인은 Playwright 워커 수다.** 기본값(12)이면
  `next dev` 한 대가 감당 못 해 전 페이지가 `Unexpected non-whitespace character after JSON`
  으로 죽는다. `playwright.config.ts` 에 `workers: 4` 로 묶어 두었으니 **이 값을 올리지 말 것.**
- **그 오류가 났다고 `.next` 를 지우고 곧바로 전체 스위트를 돌리면 오히려 그 오류를 만든다.**
  2026-07-26 에 두 번 연속 이렇게 무너뜨렸다(둘 다 11.8분, 2 통과). 4 워커가 텅 빈 `.next`
  에 동시에 냉컴파일을 요구하는 것이 바로 그 경합이기 때문이다. `.next` 를 지웠다면
  **가벼운 스펙 하나를 먼저 돌려 데운 뒤** 전체를 돌린다 — 그러면 59초에 끝난다.
  판정 순서: (1) 단일 스펙이 통과하는가 → 통과하면 코드 문제가 아니다, (2) 3111 포트에
  **LISTENING** 이 남아 있는가(TIME_WAIT 는 무관하다).

### 남은 일 (사용자 몫)

지금은 없다. 2026-07-26 에 셋 다 끝냈다 — 아래 "끝난 일" 참고.

### 끝난 일 (2026-07-26)

- **GitHub 푸시 완료.** `writingdeveloper/toolsmith`(private). 그 자리에서 Dependabot 이
  5건을 띄웠고 분류·조치했다 — 판단 근거는 `docs/TOOLS.md` "의존성 경고".
- **GA `tool_completed` 를 핵심 이벤트로 표시했다.** 관리 > 데이터 표시 > 이벤트 >
  최근 이벤트 탭에서 별표. GA 계정은 **`authuser=3`** 이다(기본 프로필에는 GA 계정이
  없어 프로비저닝 화면으로 튕긴다). 속성 Toolsmith = `a68310012p547076149`.
- **번역 검수 1차 완료.** 독일어 video-to-gif 만 반말(du)이던 것을 존칭(Sie)으로 통일하고,
  6개 언어의 제목·설명이 검색결과에서 잘리던 것(제목 14곳, 설명 19곳)을 줄였다.
  `tests/seo.spec.ts` 가 길이를 고정한다. **원어민 감수는 여전히 값어치가 있다** —
  기계가 잡을 수 있는 것(말투 일관성·길이)까지만 손봤다.

### 끝난 일 (2026-07-25 실측 확인)

- **Search Console.** 이 계정은 **서브도메인마다 별도 도메인 속성**을 만든다
  (`sc-domain:fitcheck.…`, `sc-domain:receo.…` 처럼). 상위 `writingdeveloper.blog` 속성이
  서브도메인을 덮긴 하지만, 사이트별 성과·색인을 따로 보려면 개별 속성이 있어야 한다.
  → `sc-domain:toolsmith.writingdeveloper.blog` 생성 완료. Cloudflare 에 이미 DNS 가
  있어 **자동 인증**(Domain name provider)됐다 — TXT 레코드 추가 작업은 없었다.
- 사이트맵 **Success, 발견 페이지 30개**(6 언어 × (홈 + 도구 4)). 제출 직후 잠시 보이는
  "Couldn't fetch" 는 대기 표시일 뿐이니 놀라지 말 것.
- URL 검사 라이브 테스트 "URL is available to Google / Page can be indexed" 확인,
  `/en`·`/ko` 색인 요청 완료.
- **GA4.** 계정 "글쓰는 개발자" 아래 속성 **Toolsmith**(한국 시간대·원화),
  스트림 "Toolsmith Web", 측정 ID `G-V1SX1J2BG2` → `NEXT_PUBLIC_GA_ID` 프로덕션 env.
  실시간 보고서에 방문이 잡히는 것까지 확인했다.
  **향상된 측정의 "파일 다운로드" 는 껐다.** 켜져 있으면 클릭된 다운로드 링크의 이름이
  그대로 전송되는데, 우리 결과 파일 이름에는 사용자의 원본 파일명이 들어간다
  ("보고서-추출.pdf"). 이 사이트가 내건 약속과 정면 충돌한다.
  `tests/analytics.spec.ts` 가 실제 GA 요청을 뒤져 파일명이 없는지 확인한다.
- **Vercel Spend Management 는 이미 켜져 있었다.** 팀 전역 설정이라 toolsmith 도 덮는다.
  On-Demand Budget **$50**, 알림 On, **Pause Projects On**(예산 초과 시 프로덕션 배포가
  멈춰 방문자에게 안 보이게 된다 — 색인 이탈 위험이므로 트래픽이 커지면 재검토할 것).

### 실측으로 확인된 것 (2026-07-25, 프로덕션)

- **지연 로딩은 두 도구 모두 정상이다.** image-convert 546KB → HEIC 투입 시 +1.48MB(libheif),
  pdf-merge 529KB → PDF 투입 시 +461KB(pdf-lib). **dev 서버에서는 둘 다 미리 내려온 것처럼
  보인다** — Turbopack dev 가 동적 import 청크를 당겨오기 때문. 규칙 2번 판정은 반드시
  `BASE_URL=<배포주소> pnpm test` 로 한다. 각 스펙의 프로덕션 전용 검사가 이것을 고정한다.

### 알려진 결함 (다음에 손볼 것)

지금은 없다. `pnpm lint` 0건, `npx tsc --noEmit` 0건.

### 미검증

- **HEIC 실파일.** sharp 로 HEIC 픽스처를 만들 수 없다. 실제 아이폰 사진으로 Chrome(libheif
  경로)·Safari(네이티브 경로) 양쪽 수동 확인 필요.
- **AVIF 인코딩.** 테스트 Chromium 이 미지원이라 목록에서 자동으로 빠진다.
- **진짜 암호화 PDF.** `tests/fixtures/encrypted.pdf` 는 trailer 에 `/Encrypt` 만 주입한
  합성 파일이다. 오류 분기는 그대로 타지만, 실제 RC4/AES 로 암호화된 PDF 는 미확인.

## 다음 할 일

1. **Tier 1 이 전부 끝났다.** 다음은 Tier 2(WebGPU AI) 이거나, 색인이 붙는 동안
   기존 12개를 다듬는 쪽이다. Tier 2 는 모델이 100MB 단위라 규칙 5 가 훨씬 무겁게
   걸린다 — 시작하기 전에 `docs/TOOLS.md` 의 Tier 2 절을 다시 읽을 것.
2. 색인 진행 상황 확인 — 며칠 뒤 Pages 리포트에 페이지가 잡히는지 본다.
   사이트맵 발견 페이지가 도구 수 × 6 + 6 으로 늘어야 한다(지금 60).
