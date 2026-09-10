"use client";

import { Check, Copy, Terminal } from "lucide-react";
import { useClipboardText } from "@/components/ui-library/copy-button";
import { cn } from "@/ui/lib/utils";

export function ImportBar({ text, className }: { text: string; className?: string }) {
  const { status, copy } = useClipboardText();
  const Icon = status === "copied" ? Check : Copy;
  return (
    <div
      className={cn(
        "flex min-w-0 items-center gap-3 rounded-lg bg-foreground px-4 py-3 text-background",
        className,
      )}
    >
      <Terminal aria-hidden className="size-4 shrink-0 text-background/60" />
      <pre className="min-w-0 flex-1 overflow-x-auto font-mono text-xs leading-5 whitespace-nowrap">
        {text}
      </pre>
      <button
        type="button"
        aria-label={
          status === "idle"
            ? "Copy import"
            : status === "copied"
              ? "Copied"
              : "Copy failed"
        }
        onClick={() => void copy(text)}
        className="rounded p-1 text-background/60 transition-colors hover:text-background"
      >
        <Icon className="size-4" />
      </button>
    </div>
  );
}
