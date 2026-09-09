"use client";

import Link from "next/link";
import { Clipboard, Copy } from "lucide-react";
import { uiDemos } from "@/components/ui-library/demos";
import { CopyButton } from "@/components/ui-library/copy-button";
import { PreviewFrame } from "@/components/ui-library/preview-frame";
import { renderAgentCopy } from "@/lib/ui-catalog-text";
import { ComponentAside } from "@/components/ui-library/component-aside";
import { uiLibrary, uiSourceUrl, type UIEntry } from "@/lib/ui-catalog";

export function ComponentPage({ entry }: { entry: UIEntry }) {
  const Demo = uiDemos[entry.slug];

  return (
    <main id="main-content" className="pb-8">
      <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
        <nav
          aria-label="Breadcrumb"
          className="flex min-w-0 flex-wrap items-center gap-1.5"
        >
          <Link href="/ui" className="text-muted-foreground hover:text-foreground">
            {uiLibrary.name}
          </Link>
          <span aria-hidden className="text-muted-foreground">
            ›
          </span>
          <Link
            href={`/ui#group-${entry.group.toLowerCase()}`}
            className="text-muted-foreground hover:text-foreground"
          >
            {entry.group}
          </Link>
          <span aria-hidden className="text-muted-foreground">
            ›
          </span>
          <span className="text-foreground">{entry.title}</span>
        </nav>
        <a
          href={uiSourceUrl(entry.files[0])}
          target="_blank"
          rel="noreferrer"
          className="inline-flex min-h-10 items-center text-sm text-muted-foreground hover:text-foreground"
        >
          Source ↗
        </a>
      </div>
      <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <h1 className="text-3xl font-medium tracking-tight sm:text-4xl">{entry.title}</h1>
        <CopyButton
          text={() => renderAgentCopy(entry, window.location.origin)}
          label="Copy for agents"
          leftIcon={Clipboard}
          className="min-h-10 shrink-0"
        />
      </div>
      <p className="mt-4 max-w-prose text-base leading-7 text-muted-foreground">
        {entry.description}
      </p>
      <div className="mt-8 flex items-stretch gap-2 overflow-hidden rounded-xl bg-foreground text-background">
        <pre className="min-w-0 flex-1 overflow-x-auto p-4 font-mono text-xs leading-6 whitespace-nowrap">
          {entry.imports.join("\n")}
        </pre>
        <div className="flex items-start p-2">
          <CopyButton
            text={entry.imports.join("\n")}
            label="Copy import"
            aria-label="Copy import"
            tooltip="Copy import"
            variant="ghost"
            circle
            icon={Copy}
            color="zinc-100"
            size="md"
          />
        </div>
      </div>
      <h2 className="sr-only">Preview</h2>
      <div className="mt-10">
        <PreviewFrame>
          {Demo ? (
            <Demo />
          ) : (
            <p className="text-sm text-muted-foreground">Demo in progress.</p>
          )}
        </PreviewFrame>
      </div>
      <ComponentAside entry={entry} />
    </main>
  );
}
