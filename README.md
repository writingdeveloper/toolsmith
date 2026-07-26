# toolsmith

업로드 없이 브라우저 안에서 끝나는 파일 변환 도구 모음.

**새 세션은 [`docs/TOOLS.md`](docs/TOOLS.md) 부터 읽는다.** 무엇을 만들 것인지, 무엇을
만들지 않기로 했는지, 왜 그렇게 정했는지가 전부 거기 있다.

## 왜 이 형태인가

기존 변환 사이트(FreeConvert 월 1,130만 방문, 유입 71%가 오가닉)는 10년치 도메인 권위가
자산이라 정면 클론이 불가능하다. 대신 **무료층을 100% 클라이언트로 돌려 원가를 0으로 만들고**,
"파일이 서버로 가지 않는다"는 것을 경쟁사가 구조상 버릴 수 없는 차별점으로 삼는다.
(그들은 서버 처리가 곧 광고 인벤토리다.)

유료층(긴 파일·대형 모델·배치)은 4080 노트북 서버에 붙이되, **Tier 1~2가 실제 유입을
만든 뒤에** 착수한다. v1은 4080을 쓰지 않는다.

## 스택

- Next.js 16 (App Router, Turbopack) + TypeScript + Tailwind 4
- 배포: Vercel Pro 단독. 서버 연산이 0이라 백엔드가 없다.
- 처리: Web Worker + OffscreenCanvas / WASM / (추후) WebGPU

## 개발

```bash
pnpm install
pnpm dev              # http://localhost:3000
pnpm build
pnpm fixtures         # tests/fixtures/*.{jpg,png} 재생성
pnpm test             # Playwright — dev 서버를 자동으로 띄운다
```

## 구조

```
app/
  page.tsx                     홈 — 도구 그리드 (lib/tools.ts 레지스트리 기반)
  tools/<slug>/
    page.tsx                   서버 컴포넌트: 메타데이터 + SEO 본문
    <Tool>.tsx                 'use client' — UI와 워커 RPC
    *.worker.ts                실제 처리. 메인 스레드에서 돌리지 않는다
lib/
  tools.ts                     도구 레지스트리 (docs/TOOLS.md 의 코드측 거울)
  capabilities.ts              WebGPU / OffscreenCanvas / crossOriginIsolated 감지
  image/convert-core.ts        디코드·인코드 핵심. window·document 를 참조하지 않는다
  pdf/merge-core.ts            PDF 읽기·병합 핵심. pdf-lib 은 여기서만 동적으로 불린다
tests/                         Playwright 스펙 + 픽스처
docs/TOOLS.md                  마스터 도구 목록 ← 단일 진실원천
```

## 도구를 하나 추가할 때

1. `docs/TOOLS.md` 에서 다음 도구를 고른다. 여러 개를 동시에 열지 않는다.
2. `lib/tools.ts` 에 등록하고 `app/tools/<slug>/` 를 만든다.
3. 처리 로직은 `lib/<domain>/` 에 순수 모듈로 두고 워커가 그것을 부른다.
4. `tests/<slug>.spec.ts` 를 쓴다. **UI 텍스트가 아니라 결과 blob 을 디코드해서 검증한다.**
5. `pnpm test` → 배포 → `docs/TOOLS.md` 의 상태 칸 갱신 → 커밋.

## 지켜야 할 것

- **버튼을 누르기 전엔 무거운 자산을 받지 않는다.** libheif 는 HEIC 파일이 들어온 순간에만
  동적 import 된다. 워커도 마찬가지다 — 시작할 때 워커에 물어볼 것이 없다면 워커 생성 자체를
  미룬다. 워커 청크를 받는 순간 그 워커가 참조하는 동적 import 대상까지 함께 내려온다.
- **브라우저가 실제로 못 하는 것을 할 수 있다고 표시하지 않는다.** `convertToBlob` 은 지원하지
  않는 형식을 받으면 조용히 PNG 를 뱉으므로, 반환된 `blob.type` 을 대조해 인코더 목록을 만든다.
- **COOP/COEP 를 전역으로 켜지 않는다.** `require-corp` 는 교차 출처 리소스를 전부 막아
  HuggingFace CDN 모델 로드와 충돌한다. `SharedArrayBuffer` 가 필요한 경로(ffmpeg 멀티스레드)에만
  스코프해서 건다.
- **무거운 자산은 Vercel 에서 서빙하지 않는다.** 모델 100MB × 방문 1만 = 1TB(Pro 한도).

## 알려진 미검증 항목

- **HEIC 실파일 검증.** sharp 로 HEIC 를 만들 수 없어 픽스처가 없다. 실제 아이폰 사진으로
  Chrome(libheif 경로)과 Safari(네이티브 경로) 양쪽에서 수동 확인이 필요하다.
- **AVIF 인코딩.** 테스트 환경 Chromium 은 `convertToBlob('image/avif')` 를 지원하지 않아
  목록에서 자동으로 빠진다. 지원 브라우저에서의 동작은 미검증.
- **진짜 암호화 PDF.** `tests/fixtures/encrypted.pdf` 는 trailer 에 `/Encrypt` 참조만 주입한
  합성 파일이다. 오류 분기는 그대로 타지만 실제 RC4/AES 암호화 파일은 확인하지 못했다.
