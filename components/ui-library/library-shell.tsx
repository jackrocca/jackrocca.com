"use client";

import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowUpRight, ChevronRight, PanelLeft } from "lucide-react";
import { LibrarySidebar } from "@/components/ui-library/library-sidebar";
import { SIDEBAR_KEY } from "@/components/ui-library/sidebar-state";
import { BottomDrawer } from "@/ui/components/BottomDrawer";
import { useDrawer } from "@/ui/components/DrawerContext";
import { getUIEntry, uiLibrary } from "@/lib/ui-catalog";

const triggerClass =
  "size-8 shrink-0 items-center justify-center rounded-md text-foreground transition-colors hover:bg-muted";

export function LibraryShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(true);
  useEffect(() => setOpen(document.documentElement.dataset.sidebar !== "closed"), []);
  const toggle = () => {
    const next = !open;
    setOpen(next);
    document.documentElement.dataset.sidebar = next ? "open" : "closed";
    try {
      localStorage.setItem(SIDEBAR_KEY, next ? "open" : "closed");
    } catch {}
  };

  return (
    <div className="flex min-h-svh">
      <aside className="docs-sidebar sticky top-0 hidden h-svh w-64 shrink-0 border-r bg-sidebar text-sidebar-foreground lg:block">
        <LibrarySidebar />
      </aside>
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="docs-topbar sticky top-0 z-30 flex h-16 shrink-0 items-center justify-between gap-4 border-b px-4 backdrop-blur-xl sm:px-8">
          <div className="flex min-w-0 items-center gap-3 text-sm">
            <button
              type="button"
              aria-label="Toggle sidebar"
              aria-pressed={open}
              onClick={toggle}
              className={`${triggerClass} hidden lg:inline-flex`}
            >
              <PanelLeft className="size-4" />
            </button>
            <BottomDrawer
              title="Browse components"
              trigger={
                <button
                  type="button"
                  aria-label="Browse components"
                  className={`${triggerClass} inline-flex lg:hidden`}
                >
                  <PanelLeft className="size-4" />
                </button>
              }
            >
              <LibraryDrawerNav />
            </BottomDrawer>
            <Link href="/ui" className="hidden text-muted-foreground sm:block">
              {uiLibrary.name}
            </Link>
            <ChevronRight
              aria-hidden
              className="hidden size-3.5 text-muted-foreground sm:block"
            />
            <span className="truncate font-medium">{pageLabel(pathname)}</span>
          </div>
          <a
            href={uiLibrary.repo}
            target="_blank"
            rel="noreferrer"
            className="flex shrink-0 items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground"
          >
            Source
            <ArrowUpRight className="size-3" />
          </a>
        </header>
        {children}
      </div>
    </div>
  );
}

function LibraryDrawerNav() {
  const { close } = useDrawer();
  return <LibrarySidebar onNavigate={close} />;
}

function pageLabel(pathname: string) {
  if (pathname === "/ui") return "Overview";
  if (pathname === "/ui/guide") return "Usage guide";
  return getUIEntry(pathname.slice("/ui/".length))?.title ?? uiLibrary.name;
}
