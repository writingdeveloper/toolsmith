import Link from "next/link";
import { LIVE_TOOLS, UPCOMING_TOOLS } from "@/lib/tools";

export default function Home() {
  return (
    <div className="space-y-12">
      <section className="space-y-4">
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          파일을 업로드하지 않는 변환 도구
        </h1>
        <p className="max-w-2xl text-lg text-muted">
          이미지·영상·PDF를 브라우저 안에서 직접 처리합니다. 파일이 기기를 떠나지 않으니 업로드를
          기다릴 필요도, 삭제를 걱정할 필요도 없습니다.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-sm font-medium tracking-wide text-muted uppercase">사용 가능</h2>
        <ul className="grid gap-4 sm:grid-cols-2">
          {LIVE_TOOLS.map((tool) => (
            <li key={tool.slug}>
              <Link
                href={`/tools/${tool.slug}`}
                className="block h-full rounded-xl border border-border bg-panel p-5 transition-colors hover:border-accent"
              >
                <p className="font-medium">{tool.name}</p>
                <p className="mt-1 text-sm text-muted">{tool.blurb}</p>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="space-y-4">
        <h2 className="text-sm font-medium tracking-wide text-muted uppercase">준비 중</h2>
        <ul className="flex flex-wrap gap-2">
          {UPCOMING_TOOLS.map((tool) => (
            <li
              key={tool.slug}
              className="rounded-lg border border-border px-3 py-1.5 text-sm text-muted"
            >
              {tool.name}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
