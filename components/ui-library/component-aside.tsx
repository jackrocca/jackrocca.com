"use client";

import Link from "next/link";
import { getUIEntry, uiEntryPath, uiSourceUrl, type UIEntry } from "@/lib/ui-catalog";

const cell = "py-2 pr-4 align-top";

export function ComponentAside({ entry }: { entry: UIEntry }) {
  const related = (entry.related ?? [])
    .map((slug) => getUIEntry(slug))
    .filter((item): item is UIEntry => item !== undefined);

  return (
    <>
      {entry.props?.length ? (
        <section className="mt-10">
          <h2 className="docs-eyebrow mb-3">Props</h2>
          <div className="overflow-x-auto rounded-xl border">
            <table className="w-full border-collapse text-xs">
              <thead className="bg-card text-left text-muted-foreground">
                <tr className="border-b">
                  <th className={`${cell} pl-4 font-medium`}>Prop</th>
                  <th className={`${cell} font-medium`}>Type</th>
                  <th className={`${cell} font-medium`}>Default</th>
                  <th className={`${cell} font-medium`}>Description</th>
                </tr>
              </thead>
              <tbody>
                {entry.props.map(([name, type, description, defaultValue]) => (
                  <tr key={name} className="border-b last:border-0">
                    <td className={`${cell} pl-4 font-mono whitespace-nowrap`}>{name}</td>
                    <td className={`${cell} font-mono text-muted-foreground`}>{type}</td>
                    <td
                      className={`${cell} font-mono whitespace-nowrap text-muted-foreground`}
                    >
                      {defaultValue ?? "—"}
                    </td>
                    <td className={`${cell} min-w-48 text-muted-foreground`}>
                      {description}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}
      {entry.localNotes ? (
        <section className="mt-10 max-w-2xl">
          <h2 className="docs-eyebrow mb-3">Local adaptations</h2>
          <p className="text-sm leading-relaxed text-muted-foreground">
            {entry.localNotes}
          </p>
        </section>
      ) : null}
      <section className="mt-10">
        <h2 className="docs-eyebrow mb-3">Files</h2>
        <ul className="space-y-1.5">
          {entry.files.map((file) => (
            <li key={file}>
              <a
                href={uiSourceUrl(file)}
                target="_blank"
                rel="noreferrer"
                className="font-mono text-xs text-muted-foreground hover:text-foreground"
              >
                {file}
              </a>
            </li>
          ))}
        </ul>
      </section>
      {related.length > 0 ? (
        <section className="mt-10">
          <h2 className="docs-eyebrow mb-3">Related</h2>
          <ul className="flex flex-wrap gap-2">
            {related.map((item) => (
              <li key={item.slug}>
                <Link
                  href={uiEntryPath(item.slug)}
                  className="inline-flex items-center rounded-full border px-3 py-1.5 text-xs transition-colors hover:bg-muted"
                >
                  {item.title}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </>
  );
}
