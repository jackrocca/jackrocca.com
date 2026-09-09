import type { Metadata } from "next";
import type { ReactNode } from "react";
import { LibraryShell } from "@/components/ui-library/library-shell";

export const metadata: Metadata = {
  title: {
    default: "Rocca UI",
    template: "%s · Rocca UI",
  },
};

export default function UILibraryLayout({ children }: { children: ReactNode }) {
  return <LibraryShell>{children}</LibraryShell>;
}
