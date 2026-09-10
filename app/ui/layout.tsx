import type { Metadata } from "next";
import type { ReactNode } from "react";
import { JetBrains_Mono } from "next/font/google";
import { LibraryShell } from "@/components/ui-library/library-shell";
import { sidebarScript } from "@/components/ui-library/sidebar-state";

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
});

export const metadata: Metadata = {
  title: {
    default: "RockUI",
    template: "%s · RockUI",
  },
};

export default function UILibraryLayout({ children }: { children: ReactNode }) {
  return (
    <div className={`${jetbrainsMono.variable} min-h-svh`}>
      <script dangerouslySetInnerHTML={{ __html: sidebarScript }} />
      <LibraryShell>{children}</LibraryShell>
    </div>
  );
}
