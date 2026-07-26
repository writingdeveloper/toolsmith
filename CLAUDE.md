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
2. `lib/tools.ts` 에 등록하고 `app/tools/<slug>/` 를 만든다.
3. 처리 로직은 `lib/<domain>/` 에 **순수 모듈**로 두고 워커가 그것을 부른다.
   순수 모듈은 `window` / `document` 를 참조하지 않는다 (워커·메인 양쪽에서 쓰인다).
4. `tests/<slug>.spec.ts` 작성 → `pnpm test`.
5. 배포 → `docs/TOOLS.md` 의 상태 칸을 `배포` 로 갱신 → 커밋.

## 명령어

```bash
pnpm dev              # 개발 서버
pnpm build            # 타입체크 포함
pnpm test             # Playwright (dev 서버 자동 기동)
pnpm fixtures         # tests/fixtures 재생성

# 배포본에 같은 스펙을 그대로 친다 (dev 서버를 띄우지 않는다)
BASE_URL=https://toolsmith-two.vercel.app pnpm test

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

- 도구 #1 이미지 변환·압축: **배포 완료.** https://toolsmith-two.vercel.app
- 도구 #9 PDF 병합: **배포 완료.** `/tools/pdf-merge`
- Playwright 15종 통과(이미지 7 + PDF 8). 두 도구 모두 프로덕션 URL 에서 실동작 재확인 완료.
- 본 도메인 미정 → `app/robots.ts` 가 전면 `Disallow: /`. `NEXT_PUBLIC_SITE_URL` 설정 시 열린다.

### 남은 일 (사용자 몫)

- Vercel **Spend Management** 지출 한도 알림 — 대시보드에서만 설정 가능.
- GitHub 푸시 — 아직 로컬 `main` 만 있다.

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

## 다음 도구 후보

- **PDF 분할** (pdf-lib) — 병합 코어(`lib/pdf/merge-core.ts`)와 셸을 그대로 재사용한다.
  가장 싸게 하나 더 늘리는 길.
- **영상 변환** (ffmpeg.wasm) — 검색수요 최상이지만 COEP 스코프 문제를 먼저 뚫어야 한다.
