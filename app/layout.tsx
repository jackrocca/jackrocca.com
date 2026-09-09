import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/providers";
import { SiteHeader, SiteFooter } from "@/components/site-shell";
import { Geist } from "next/font/google";
import { cn } from "@/ui/lib/utils";

const geist = Geist({ subsets: ["latin"], variable: "--font-geist" });

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
  return (
    <html lang="en" className={cn("font-sans", geist.variable)}>
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
