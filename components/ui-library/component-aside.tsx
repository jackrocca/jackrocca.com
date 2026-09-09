"use client";

import Link from "next/link";
import {
  getUIEntry,
  uiEntryNeighbours,
  uiEntryPath,
  uiSourceUrl,
  type UIEntry,
} from "@/lib/ui-catalog";

export function ComponentAside({ entry }: { entry: UIEntry }) {
  const { previous, next } = uiEntryNeighbours(entry.slug);
  const related = (entry.related ?? [])
    .map((slug) => getUIEntry(slug))
    .filter((item): item is UIEntry => item !== undefined);

  return (
    <>
      {entry.localNotes ? (
        <aside className="mt-10 max-w-prose">
          <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
            Local adaptations
          </p>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            {entry.localNotes}
          </p>
        </aside>
      ) : null}
      <section className="mt-10">
        <h2 className="text-sm font-medium">Files</h2>
        <ul className="mt-3 grid gap-1">
          {entry.files.map((file) => (
            <li key={file}>
              <a
                href={uiSourceUrl(file)}
                target="_blank"
                rel="noreferrer"
                className="inline-flex min-h-10 items-center font-mono text-xs text-muted-foreground hover:text-foreground"
              >
                {file}
              </a>
            </li>
          ))}
        </ul>
      </section>
      {related.length > 0 ? (
        <section className="mt-10">
          <h2 className="text-sm font-medium">Related</h2>
          <ul className="mt-3 flex flex-wrap gap-2">
            {related.map((item) => (
              <li key={item.slug}>
                <Link
                  href={uiEntryPath(item.slug)}
                  className="inline-flex min-h-10 items-center rounded-full bg-muted px-3 text-sm"
                >
                  {item.title}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
      <nav
        aria-label="Nearby components"
        className="mt-14 flex flex-wrap justify-between gap-4 border-t border-border pt-6 text-sm"
      >
        {previous ? (
          <Link
            href={uiEntryPath(previous.slug)}
            className="min-h-10 hover:text-[var(--brand-teal)]"
          >
            ← {previous.title}
          </Link>
        ) : (
          <span />
        )}
        {next ? (
          <Link
            href={uiEntryPath(next.slug)}
            className="ml-auto min-h-10 hover:text-[var(--brand-teal)]"
          >
            {next.title} →
          </Link>
        ) : null}
      </nav>
    </>
  );
}
