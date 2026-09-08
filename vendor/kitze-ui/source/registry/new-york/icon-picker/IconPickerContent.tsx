"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import type { IconSearch } from "@/registry/new-york/icon-picker/icon-search";
import { searchIcons } from "@/registry/new-york/icon-picker/icon-search";
import type { IconAppearanceProps } from "@/registry/new-york/icon-picker/IconAppearance";
import { IconAppearance } from "@/registry/new-york/icon-picker/IconAppearance";
import { IconGrid } from "@/registry/new-york/icon-picker/IconGrid";
import { useIconSearch } from "@/registry/new-york/icon-picker/use-icon-search";
import type { IconValue } from "@/registry/new-york/picked-icon/icon-types";
import { PickedIcon } from "@/registry/new-york/picked-icon/PickedIcon";

export interface IconPickerContentProps extends Pick<
  IconAppearanceProps,
  "colorMode" | "presets" | "allowFrame"
> {
  value?: IconValue | undefined;
  onSelect: (value: IconValue) => void;
  search?: IconSearch | undefined;
}
export const IconPickerContent = ({
  value,
  onSelect,
  search = searchIcons,
  ...appearance
}: IconPickerContentProps) => {
  const [draft, setDraft] = useState<IconValue>(
    value ?? { name: "lucide:smile" }
  );
  const [query, setQuery] = useState("");
  const result = useIconSearch(query, ["lucide"], search);
  return (
    <div className="flex h-[440px] flex-col gap-3 p-3">
      <input
        aria-label="Search icons"
        placeholder="Search Lucide icons…"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        className="bg-muted/60 focus-visible:ring-ring h-9 w-full shrink-0 rounded-lg border border-transparent px-3 text-sm outline-none focus-visible:ring-2"
      />
      <div
        aria-label="Icons"
        aria-busy={result.loading}
        className="flex min-h-24 flex-1 flex-col"
      >
        {result.loading && (
          <output className="text-muted-foreground p-3 text-sm">
            Loading icons…
          </output>
        )}
        {result.error && (
          <div
            role="alert"
            className="flex items-center justify-between p-3 text-sm"
          >
            Icons could not load.
            <Button variant="ghost" onClick={result.handleRetry}>
              Retry
            </Button>
          </div>
        )}
        {!result.loading &&
          !result.error &&
          (result.icons.length ? (
            <IconGrid
              key={query}
              icons={result.icons}
              selected={draft.name}
              onSelect={(name) => setDraft({ ...draft, name })}
            />
          ) : (
            <output className="p-3 text-sm">No icons found.</output>
          ))}
      </div>
      <IconAppearance value={draft} onChange={setDraft} {...appearance} />
      <div className="flex shrink-0 items-center gap-2 border-t pt-3">
        <PickedIcon value={draft} size={32} />
        <span
          className="text-muted-foreground min-w-0 flex-1 truncate text-xs"
          title={draft.name}
        >
          {draft.name.slice(7)}
        </span>
        <Button
          size="sm"
          className="cursor-pointer shadow-none"
          onClick={() => onSelect(draft)}
        >
          Use icon
        </Button>
      </div>
    </div>
  );
};
