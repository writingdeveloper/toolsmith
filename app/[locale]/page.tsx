import Link from "next/link";
import { notFound } from "next/navigation";
import { getDictionary } from "@/lib/i18n";
import { isLocale } from "@/lib/i18n/config";
import { LIVE_TOOLS, UPCOMING_TOOLS } from "@/lib/tools";

export default async function Home({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const dict = getDictionary(locale);

  return (
    <div className="space-y-12">
      <section className="space-y-4">
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">{dict.home.title}</h1>
        <p className="max-w-2xl text-lg text-muted">{dict.home.lead}</p>
      </section>

      <section className="space-y-4">
        <h2 className="text-sm font-medium tracking-wide text-muted uppercase">
          {dict.home.availableHeading}
        </h2>
        <ul className="grid gap-4 sm:grid-cols-2">
          {LIVE_TOOLS.map((tool) => (
            <li key={tool.slug}>
              <Link
                href={`/${locale}/tools/${tool.slug}`}
                className="block h-full rounded-xl border border-border bg-panel p-5 transition-colors hover:border-accent"
              >
                <p className="font-medium">{dict.toolNames[tool.slug]}</p>
                <p className="mt-1 text-sm text-muted">
                  {tool.slug in dict.tools
                    ? dict.tools[tool.slug as keyof typeof dict.tools].blurb
                    : null}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="space-y-4">
        <h2 className="text-sm font-medium tracking-wide text-muted uppercase">
          {dict.home.upcomingHeading}
        </h2>
        <ul className="flex flex-wrap gap-2">
          {UPCOMING_TOOLS.map((tool) => (
            <li
              key={tool.slug}
              className="rounded-lg border border-border px-3 py-1.5 text-sm text-muted"
            >
              {dict.toolNames[tool.slug]}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
