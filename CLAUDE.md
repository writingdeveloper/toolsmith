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

## 현재 상태 (2026-07-25)

- **본 도메인 확정: https://toolsmith.writingdeveloper.blog** (와일드카드 DNS 가 이미
  Vercel 을 가리키고 있어 DNS 작업은 없었다). `NEXT_PUBLIC_SITE_URL` 을 프로덕션 env 로
  넣어 **색인이 열렸다.** `*.vercel.app` 은 `next.config.ts` 가 `X-Robots-Tag: noindex` 를
  붙여 중복 색인을 막는다.
- 도구 #1 이미지 변환·압축: **배포 완료.**
- 도구 #9 PDF 병합: **배포 완료.** `/tools/pdf-merge`
- 도구 #10 PDF 분할: **배포 완료.** `/{locale}/tools/pdf-split` (범위 추출 + 낱장 ZIP)
- 도구 #11 PDF 회전·페이지 삭제: **배포 완료.** `/{locale}/tools/pdf-organize`
  (pdf.js 썸네일 그리드 + 회전 + 삭제). pdf.js 는 `lib/pdf/render-core.ts` 에서만 쓰인다.
- **다국어 6개 언어 배포 완료.** 정적 페이지 30장(6 언어 × 4 + 루트 + robots/sitemap).
- Playwright 53종. 프로덕션 52 통과 / 1 스킵(dev 전용), dev 45 통과 / 8 스킵.
- **JSON-LD 완료.** 도구 페이지에 WebApplication + FAQPage + BreadcrumbList,
  홈에 WebSite. 구글 리치 결과 테스트 **유효 항목 2개**(탐색경로·소프트웨어 앱) 확인.
  `aggregateRating` 누락 경고는 **의도한 것** — 받은 적 없는 평점을 지어내지 않는다.
  FAQPage 는 리치 결과 목록에 안 뜨는데, 구글이 FAQ 표시를 정부·의료로 제한했기 때문이다.
  그래도 GEO(LLM 인용)에는 그대로 유효해서 남긴다.
- PDF 공통 토대는 `lib/pdf/document.ts` — 병합·분할이 함께 쓴다. 도구별 로직만 각자 파일에.
- `app/sitemap.ts` 추가 — 언어 × 페이지 전부, 각 항목이 자기 언어판을 alternates 로 가리킨다.
  `NEXT_PUBLIC_SITE_URL` 이 없으면 빈 사이트맵을 낸다(robots 도 이때는 전면 차단이라 앞뒤가 맞다).
- `tests/seo.spec.ts` 가 robots·사이트맵·중복 색인 차단을 배포본에서 고정한다.

### 남은 일 (사용자 몫)

- GitHub 푸시 — 아직 로컬 `main` 만 있다.
- **번역 검수.** de·es·pt-BR 마케팅 문구는 한 번 읽어볼 값어치가 있다.

### 끝난 일 (2026-07-25 실측 확인)

- **Search Console.** `writingdeveloper.blog` **도메인 속성**이 이미 있고 서브도메인을 전부
  덮는다 → 별도 속성이 필요 없다. 사이트맵 제출 완료, URL 검사 라이브 테스트에서
  "URL is available to Google / Page can be indexed" 확인, `/en`·`/ko` 색인 요청 완료.
  사이트맵 목록의 "Couldn't fetch" 는 제출 직후의 대기 표시일 뿐 — URL 검사의
  Discovery 항목에 우리 사이트맵이 이미 잡혀 있다.
- **Vercel Spend Management 는 이미 켜져 있었다.** 팀 전역 설정이라 toolsmith 도 덮는다.
  On-Demand Budget **$50**, 알림 On, **Pause Projects On**(예산 초과 시 프로덕션 배포가
  멈춰 방문자에게 안 보이게 된다 — 색인 이탈 위험이므로 트래픽이 커지면 재검토할 것).

### 실측으로 확인된 것 (2026-07-25, 프로덕션)

- **지연 로딩은 두 도구 모두 정상이다.** image-convert 546KB → HEIC 투입 시 +1.48MB(libheif),
  pdf-merge 529KB → PDF 투입 시 +461KB(pdf-lib). **dev 서버에서는 둘 다 미리 내려온 것처럼
  보인다** — Turbopack dev 가 동적 import 청크를 당겨오기 때문. 규칙 2번 판정은 반드시
  `BASE_URL=<배포주소> pnpm test` 로 한다. 각 스펙의 프로덕션 전용 검사가 이것을 고정한다.

### 알려진 결함 (다음에 손볼 것)

- `pnpm lint` 가 4건(에러 3, 경고 1) 남아 있다. 대부분 `useEffect` 안의 `setSupported` —
  SSR/hydration 때문에 지금 구조에서는 불가피하다. `useSyncExternalStore` 로 정리 가능.

### 미검증

- **HEIC 실파일.** sharp 로 HEIC 픽스처를 만들 수 없다. 실제 아이폰 사진으로 Chrome(libheif
  경로)·Safari(네이티브 경로) 양쪽 수동 확인 필요.
- **AVIF 인코딩.** 테스트 Chromium 이 미지원이라 목록에서 자동으로 빠진다.
- **진짜 암호화 PDF.** `tests/fixtures/encrypted.pdf` 는 trailer 에 `/Encrypt` 만 주입한
  합성 파일이다. 오류 분기는 그대로 타지만, 실제 RC4/AES 로 암호화된 PDF 는 미확인.

## 다음 할 일

1. **PDF 압축** (#12) — `lib/pdf/render-core.ts` 의 pdf.js 를 재사용해 페이지를 래스터화하고
   Canvas 로 재인코딩한다. 검색수요 최상이고 부품이 이미 다 있다.
2. **영상 변환** (ffmpeg.wasm) — 검색수요 최상이지만 COEP 스코프를 먼저 뚫어야 한다.
3. 색인 진행 상황 확인 — 며칠 뒤 Search Console 의 사이트맵 상태가 Success 로 바뀌고
   Pages 리포트에 페이지가 잡히는지 본다.
