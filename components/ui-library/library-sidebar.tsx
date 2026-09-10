"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ArrowUpRight,
  BookOpen,
  ChevronRight,
  FileText,
  Home,
  Search,
} from "lucide-react";
import { RockUIMark, RockUIWordmark } from "@/components/ui-library/wordmark";
import {
  getUIEntry,
  uiEntriesByGroup,
  uiEntryPath,
  uiGroups,
  uiLibrary,
  type UIEntry,
} from "@/lib/ui-catalog";

const docsLinks = [
  { href: "/ui", label: "Overview", icon: Home },
  { href: "/ui/guide", label: "Usage guide", icon: BookOpen },
  { href: "/ui/llms.txt", label: "llms.txt", icon: FileText },
] as const;

export function LibrarySidebar({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const [query, setQuery] = useState("");
  const [closed, setClosed] = useState<ReadonlySet<string>>(
    () => new Set(uiGroups.slice(2)),
  );
  const activeGroup = getUIEntry(pathname.slice("/ui/".length))?.group;
  useEffect(() => {
    if (activeGroup) {
      setClosed((current) => {
        if (!current.has(activeGroup)) return current;
        const next = new Set(current);
        next.delete(activeGroup);
        return next;
      });
    }
  }, [activeGroup]);
  const searching = query.trim().length > 0;
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
    <div className="flex h-full flex-col">
      <div className="flex flex-col gap-5 px-5 pt-6 pb-4">
        <Link href="/ui" onClick={onNavigate} className="flex items-center gap-3">
          <span className="flex size-9 -rotate-6 items-center justify-center rounded-lg bg-[var(--brand-teal)] text-[1.35rem] leading-none text-white">
            <RockUIMark />
          </span>
          <span>
            <RockUIWordmark className="block text-xl leading-none" />
            <span className="mt-1.5 block font-mono text-[10px] text-muted-foreground uppercase">
              Fewer lines of UI.
            </span>
          </span>
        </Link>
        <div className="relative">
          <Search
            aria-hidden
            className="pointer-events-none absolute top-1/2 left-3 size-3.5 -translate-y-1/2 text-muted-foreground"
          />
          <input
            type="search"
            aria-label="Search components"
            placeholder="Find a component…"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            className="h-10 w-full rounded-lg border bg-background pr-3 pl-9 text-xs outline-none focus:border-[var(--brand-teal)] focus:ring-2 focus:ring-[var(--brand-teal)]/15"
          />
        </div>
      </div>
      <div className="flex min-h-0 flex-1 flex-col gap-1 overflow-auto px-3 pb-4">
        <nav aria-label="Documentation" className="space-y-0.5">
          {docsLinks.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              onClick={onNavigate}
              aria-current={pathname === href ? "page" : undefined}
              className="docs-nav-link"
            >
              <Icon className="size-4" />
              {label}
            </Link>
          ))}
        </nav>
        <h2 className="mx-1 mt-4 border-t px-3 pt-5 pb-2 text-xs font-semibold">
          Components
        </h2>
        <nav aria-label="Components">
          {groups.map(({ group, entries }) => (
            <details
              key={group}
              className="group/section mb-2"
              open={searching || !closed.has(group)}
              onToggle={(event) => {
                if (searching) return;
                const isOpen = event.currentTarget.open;
                setClosed((current) => {
                  if (isOpen !== current.has(group)) return current;
                  const next = new Set(current);
                  if (isOpen) next.delete(group);
                  else next.add(group);
                  return next;
                });
              }}
            >
              <summary className="docs-nav-summary">
                <ChevronRight
                  aria-hidden
                  className="size-3 transition-transform group-open/section:rotate-90 motion-reduce:transition-none"
                />
                <span className="flex-1">{group}</span>
                <span className="font-mono text-[10px] font-normal">
                  {entries.length}
                </span>
              </summary>
              <ul className="space-y-0.5 pb-2">
                {entries.map((entry) => {
                  const href = uiEntryPath(entry.slug);
                  return (
                    <li key={entry.slug}>
                      <Link
                        href={href}
                        onClick={onNavigate}
                        aria-current={pathname === href ? "page" : undefined}
                        className="docs-nav-item"
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
      </div>
      <div className="border-t px-5 py-4">
        <a
          href="https://www.jackrocca.com"
          className="mb-3 flex items-center gap-1 text-xs font-medium"
        >
          Made by Jack Rocca
          <ArrowUpRight className="size-3" />
        </a>
        <p className="font-mono text-[10px] text-muted-foreground">
          Built on shadcn + Base UI
        </p>
        <p className="mt-1 font-mono text-[10px] text-muted-foreground">
          Forked from{" "}
          <a
            href={uiLibrary.upstream.url}
            target="_blank"
            rel="noreferrer"
            className="underline underline-offset-2"
          >
            {uiLibrary.upstream.name}
          </a>
        </p>
      </div>
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
