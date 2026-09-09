"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { LibrarySidebar } from "@/components/ui-library/library-sidebar";
import { BottomDrawer } from "@/ui/components/BottomDrawer";
import { CustomButton } from "@/ui/components/CustomButton";
import { useDrawer } from "@/ui/components/DrawerContext";
import { getUIEntry } from "@/lib/ui-catalog";

export function LibraryShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="site-container grid pb-16 pt-6 lg:grid-cols-[16.5rem_minmax(0,1fr)] lg:gap-12 lg:pb-20 lg:pt-8">
      <aside className="sticky top-0 hidden max-h-dvh overflow-y-auto lg:block">
        <LibrarySidebar />
      </aside>
      <div className="min-w-0">
        <div className="ui-library-toolbar mb-6 lg:hidden">
          <p className="min-w-0 truncate text-sm font-medium">{pageLabel(pathname)}</p>
          <BottomDrawer
            title="Browse components"
            trigger={
              <CustomButton variant="outline" className="min-h-10 shrink-0">
                Browse components
              </CustomButton>
            }
          >
            <LibraryDrawerNav />
          </BottomDrawer>
        </div>
        <div className="mx-auto max-w-[960px]">{children}</div>
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
  if (pathname.startsWith("/ui/")) {
    return getUIEntry(pathname.slice("/ui/".length))?.title ?? "Rocca UI";
  }
  return "Rocca UI";
}
