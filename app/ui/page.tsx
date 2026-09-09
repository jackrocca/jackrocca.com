import Link from "next/link";
import { OverviewHero } from "@/components/ui-library/overview-hero";
import {
  uiCatalog,
  uiEntriesByGroup,
  uiEntryPath,
  uiGroupDescriptions,
  uiLibrary,
} from "@/lib/ui-catalog";

export const metadata = { title: "Overview" };

const cardClass =
  "rounded-2xl bg-card p-6 shadow-[0_2px_12px_rgba(0,0,0,0.04),0_0_0_1px_rgba(0,0,0,0.06)] transition-[background-color,box-shadow] duration-200 hover:bg-muted/40 hover:shadow-[0_4px_20px_rgba(0,0,0,0.07),0_0_0_1px_rgba(0,0,0,0.08)]";

export default function UIOverviewPage() {
  return (
    <main id="main-content" className="pb-8">
      <p className="text-xs font-medium tracking-[0.16em] text-muted-foreground uppercase">
        Rocca UI
      </p>
      <h1 className="mt-3 max-w-2xl text-3xl font-medium tracking-tight sm:text-4xl">
        {uiLibrary.tagline}
      </h1>
      <p className="mt-5 max-w-prose text-base leading-7 text-muted-foreground">
        A source fork of{" "}
        <a href={uiLibrary.upstream.url} target="_blank" rel="noreferrer">
          {uiLibrary.upstream.name}
        </a>
        , built on shadcn, Base UI, and Tailwind. This site uses these components for its
        header, dialogs, drawers, and forms.
      </p>
      <p className="mt-3 text-sm text-muted-foreground">
        {uiCatalog.length} components and primitives.
      </p>
      <div className="mt-10">
        <OverviewHero />
      </div>
      {uiEntriesByGroup().map(({ group, entries }) => (
        <section
          key={group}
          id={`group-${group.toLowerCase()}`}
          className="mt-14 scroll-mt-8"
        >
          <h2 className="text-xl font-medium tracking-tight">{group}</h2>
          <p className="mt-2 max-w-prose text-sm leading-6 text-muted-foreground">
            {uiGroupDescriptions[group]}
          </p>
          <ul className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {entries.map((entry) => (
              <li key={entry.slug}>
                <Link
                  href={uiEntryPath(entry.slug)}
                  className={`block h-full ${cardClass}`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="text-base font-medium tracking-tight">
                      {entry.title}
                    </h3>
                    {entry.kind !== "component" ? (
                      <span className="shrink-0 rounded-full bg-muted px-2 py-0.5 text-[11px] text-muted-foreground capitalize">
                        {entry.kind}
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    {firstSentence(entry.description)}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </main>
  );
}

function firstSentence(text: string) {
  const match = text.match(/^[^.!?]+[.!?]/);
  return match ? match[0] : text;
}
