import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/providers";
import { SiteHeader, SiteFooter } from "@/components/site-shell";
import { Figtree, Geist_Mono } from "next/font/google";
import { cn } from "@/ui/lib/utils";

const figtree = Figtree({ subsets: ["latin"], variable: "--font-figtree" });
const geistMono = Geist_Mono({ subsets: ["latin"], variable: "--font-geist-mono" });

export const metadata: Metadata = {
  metadataBase: new URL("https://www.jackrocca.com"),
  title: {
    default: "Jack Rocca",
    template: "%s · Jack Rocca",
  },
  description: "Photographs and projects by Jack Rocca.",
  robots: { index: false, follow: false },
  icons: { icon: "/icon.svg" },
  openGraph: {
    title: "Jack Rocca",
    description: "Photographs and projects by Jack Rocca.",
    type: "website",
  },
};
export default function RootLayout({ children }: { children: React.ReactNode }) {
  // suppressHydrationWarning: /ui restores `data-sidebar` on <html> before hydration.
  return (
    <html
      lang="en"
      className={cn("font-sans", figtree.variable, geistMono.variable)}
      suppressHydrationWarning
    >
      <body>
        <Providers>
          <a href="#main-content" className="skip-link">
            Skip to content
          </a>
          <SiteHeader />
          {children}
          <SiteFooter />
        </Providers>
      </body>
    </html>
  );
}
