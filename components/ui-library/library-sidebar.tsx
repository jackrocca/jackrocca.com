"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown } from "lucide-react";
import { SearchBar } from "@/ui/components/SearchBar";
import { uiEntriesByGroup, uiEntryPath, uiLibrary, type UIEntry } from "@/lib/ui-catalog";

export function LibrarySidebar({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const [query, setQuery] = useState("");
  const [collapsed, setCollapsed] = useState<ReadonlySet<string>>(() => new Set());
  const searching = query.trim().length > 0;
  const toggleGroup = (group: string, open: boolean) =>
    setCollapsed((current) => {
      if (open === !current.has(group)) return current;
      const next = new Set(current);
      if (open) next.delete(group);
      else next.add(group);
      return next;
    });
  const groups = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return uiEntriesByGroup()
      .map(({ group, entries }) => ({
        group,
        entries: entries.filter((entry) => matchesEntry(entry, needle)),
      }))
      .filter(({ entries }) => entries.length > 0);
  }, [query]);

  return (
    <div className="flex flex-col gap-6 pb-8">
      <div>
        <p className="text-base font-medium tracking-tight">{uiLibrary.name}</p>
        <p className="mt-1 text-xs text-muted-foreground">Fewer lines of UI.</p>
      </div>
      <SearchBar value={query} onChange={setQuery} placeholder="Search components" />
      <nav aria-label="Library" className="grid gap-1">
        <Link
          href="/ui"
          onClick={onNavigate}
          aria-current={pathname === "/ui" ? "page" : undefined}
          className="ui-library-link"
        >
          Overview
        </Link>
        <Link
          href="/ui/guide"
          onClick={onNavigate}
          aria-current={pathname === "/ui/guide" ? "page" : undefined}
          className="ui-library-link"
        >
          Usage guide
        </Link>
        <a href="/ui/llms.txt" className="ui-library-link" onClick={onNavigate}>
          llms.txt
        </a>
      </nav>
      <nav aria-label="Components" className="grid gap-2">
        {groups.map(({ group, entries }) => (
          <details
            key={group}
            className="ui-library-group"
            open={searching || !collapsed.has(group)}
            onToggle={(event) => {
              if (!searching) toggleGroup(group, event.currentTarget.open);
            }}
          >
            <summary className="ui-library-summary">
              <span>{group}</span>
              <span className="ui-library-count">{entries.length}</span>
              <ChevronDown aria-hidden className="ui-library-chevron" size={14} />
            </summary>
            <ul className="mt-1 grid gap-0.5">
              {entries.map((entry) => {
                const href = uiEntryPath(entry.slug);
                return (
                  <li key={entry.slug}>
                    <Link
                      href={href}
                      onClick={onNavigate}
                      aria-current={pathname === href ? "page" : undefined}
                      className="ui-library-link"
                    >
                      {entry.title}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </details>
        ))}
      </nav>
      <p className="ui-library-credit text-[11px] leading-5 text-muted-foreground">
        Built on{" "}
        <a href="https://ui.shadcn.com" target="_blank" rel="noreferrer">
          shadcn
        </a>{" "}
        +{" "}
        <a href="https://base-ui.com" target="_blank" rel="noreferrer">
          Base UI
        </a>
        {" · "}
        Forked from{" "}
        <a href="https://ui.kitze.io" target="_blank" rel="noreferrer">
          Kitze UI
        </a>
      </p>
    </div>
  );
}

function matchesEntry(entry: UIEntry, needle: string) {
  if (!needle) return true;
  return (
    entry.title.toLowerCase().includes(needle) ||
    entry.slug.includes(needle) ||
    entry.group.toLowerCase().includes(needle)
  );
}
