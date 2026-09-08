"use client";

import { lazy, Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";

const EmojiLibrary = lazy(() => import("./EmojiLibrary"));

export interface EmojiPickerContentProps {
  onSelect: (emoji: string) => void;
  theme?: "light" | "dark" | "auto" | undefined;
}
export const EmojiPickerContent = ({
  onSelect,
  theme = "auto",
}: EmojiPickerContentProps) => (
  <ErrorBoundary
    fallback={
      <p role="alert" className="block h-[440px] p-4 text-sm">
        Emoji picker could not load. Reload the page to retry.
      </p>
    }
  >
    <Suspense
      fallback={
        <output className="block h-[440px] p-4 text-sm">Loading emoji…</output>
      }
    >
      <EmojiLibrary theme={theme} onSelect={onSelect} />
    </Suspense>
  </ErrorBoundary>
);
