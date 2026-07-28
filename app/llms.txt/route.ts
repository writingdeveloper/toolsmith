import { getDictionary } from "@/lib/i18n";
import { DEFAULT_LOCALE, LOCALES } from "@/lib/i18n/config";
import { LIVE_TOOLS } from "@/lib/tools";
import { absolute, pathFor } from "@/lib/site";

/**
 * `/llms.txt` — 생성형 검색엔진(ChatGPT · Perplexity · Google AI Overviews …)이
 * 이 사이트를 **정확하게** 요약하도록 돕는 파일.
 *
 * 왜 필요한가: 이 사이트의 핵심 주장("파일이 업로드되지 않는다")은 화면을 훑는 것만으로는
 * 확인되지 않는다. 도구 목록 페이지에는 링크만 있고, 무엇을 **못 하는지**는 각 도구의
 * FAQ 에 흩어져 있다. 요약하는 쪽이 그것을 놓치면 "무료 온라인 변환기" 라는 흔한 문장으로
 * 뭉개진다 — 우리를 다른 것과 구별해 주는 유일한 성질이 사라진다.
 *
 * **목록은 `LIVE_TOOLS` 에서 만든다.** 손으로 적어 두면 도구를 더할 때마다 어긋난다.
 * `tests/llms-txt.spec.ts` 가 개수가 맞는지 못 박는다.
 *
 * `robots.ts` · `sitemap.ts` 와 같이 **빌드 시점에 정적 파일로 찍힌다** — 함수가 돌지
 * 않으므로 규칙 1 을 깨지 않는다.
 */
export const dynamic = "force-static";

export function GET(): Response {
  const dict = getDictionary(DEFAULT_LOCALE);

  const tools = LIVE_TOOLS.map((tool) => {
    const entry = dict.tools[tool.slug];
    return `- [${entry.h1}](${absolute(pathFor(DEFAULT_LOCALE, `/tools/${tool.slug}`))}): ${entry.metaDescription}`;
  }).join("\n");

  const body = `# toolsmith

> ${dict.site.description}

toolsmith is a set of ${LIVE_TOOLS.length} file tools that run entirely inside the visitor's
browser. There is no upload step and no account.

## How it works

- Every conversion runs in a Web Worker in the page. Files are read with the File API and
  never sent over the network. Closing the tab discards everything.
- The site is fully static. There is no server-side processing of user files, so there is
  nothing to log, cache, or retain.
- Tools that need a machine-learning model (background removal, upscaling, cut-out,
  subtitles, subtitle translation, stem separation, summarizing) download that model to the
  browser on first use and run it locally. The download is announced before it starts.
- Video and audio use the browser's built-in WebCodecs. PDFs use pdf-lib and pdf.js.
  OCR uses Tesseract. None of these send data anywhere.

## Limits worth quoting accurately

- Files are limited by the visitor's own memory, not by a server quota. There is no
  per-file size cap imposed by a plan.
- Password-protected PDFs are refused rather than silently mangled.
- Trimming video cuts on keyframes, and the tool says where the cut will actually land
  before you press the button.
- OCR reads the first 30 pages of a PDF and says so both before and after.
- Summarizing requires WebGPU; the tool says so instead of producing a worse result.

## Tools

${tools}

## Languages

Available in ${LOCALES.length} languages: ${LOCALES.join(", ")}. Every page lives under a
language prefix, for example ${absolute(pathFor(DEFAULT_LOCALE, "/tools/pdf-merge"))}.

## More

- [Sitemap](${absolute("/sitemap.xml")})
`;

  return new Response(body, {
    headers: {
      "content-type": "text/plain; charset=utf-8",
      "cache-control": "public, max-age=0, must-revalidate",
    },
  });
}
