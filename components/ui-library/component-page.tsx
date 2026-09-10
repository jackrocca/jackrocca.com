"use client";

import { Clipboard } from "lucide-react";
import { uiDemos } from "@/components/ui-library/demos";
import { CopyButton } from "@/components/ui-library/copy-button";
import { ImportBar } from "@/components/ui-library/import-bar";
import { PreviewFrame } from "@/components/ui-library/preview-frame";
import { ComponentAside } from "@/components/ui-library/component-aside";
import { renderAgentCopy } from "@/lib/ui-catalog-text";
import type { UIEntry } from "@/lib/ui-catalog";

export function ComponentPage({ entry }: { entry: UIEntry }) {
  const Demo = uiDemos[entry.slug];

  return (
    <main
      id="main-content"
      className="mx-auto w-full max-w-5xl px-5 py-10 sm:px-8 lg:px-12"
    >
      <div className="mb-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h1 className="text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">
            {entry.title}
          </h1>
          <CopyButton
            text={() => renderAgentCopy(entry, window.location.origin)}
            label="Copy for agents"
            leftIcon={Clipboard}
          />
        </div>
        <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground">
          {entry.description}
        </p>
      </div>
      <ImportBar text={entry.imports.join("\n")} />
      <div className="mt-8">
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
