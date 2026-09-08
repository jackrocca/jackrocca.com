"use client";

import { useState } from "react";

import { cn } from "@/lib/utils";
import { PickedIcon } from "@/registry/new-york/picked-icon/PickedIcon";

const pageSize = 32;
export const IconGrid = ({
  icons,
  selected,
  onSelect,
}: {
  icons: string[];
  selected: string;
  onSelect: (name: string) => void;
}) => {
  const [page, setPage] = useState(0);
  const pages = Math.max(1, Math.ceil(icons.length / pageSize));
  return (
    <div className="flex min-h-0 flex-1 flex-col gap-1">
      <div className="grid min-h-0 flex-1 grid-cols-8 content-start gap-1 overflow-y-auto overscroll-contain">
        {icons.slice(page * pageSize, (page + 1) * pageSize).map((name) => (
          <button
            key={name}
            type="button"
            aria-label={name}
            title={name.slice(7)}
            aria-pressed={selected === name}
            onClick={() => onSelect(name)}
            className={cn(
              "hover:bg-muted flex h-8 cursor-pointer items-center justify-center rounded-lg focus-visible:outline-2",
              selected === name &&
                "bg-muted ring-foreground/30 ring-1 ring-inset"
            )}
          >
            <PickedIcon value={{ name }} size={30} />
          </button>
        ))}
      </div>
      <nav
        aria-label="Icon pages"
        className="text-muted-foreground flex h-6 shrink-0 items-center justify-between text-xs"
      >
        <button
          type="button"
          aria-label="Previous icon page"
          disabled={page === 0}
          onClick={() => setPage(page - 1)}
          className="hover:text-foreground cursor-pointer rounded px-1 focus-visible:outline-2 disabled:cursor-default disabled:opacity-30"
        >
          Previous
        </button>
        <output>
          {page + 1} / {pages} · {icons.length} icons
        </output>
        <button
          type="button"
          aria-label="Next icon page"
          disabled={page + 1 >= pages}
          onClick={() => setPage(page + 1)}
          className="hover:text-foreground cursor-pointer rounded px-1 focus-visible:outline-2 disabled:cursor-default disabled:opacity-30"
        >
          Next
        </button>
      </nav>
    </div>
  );
};
