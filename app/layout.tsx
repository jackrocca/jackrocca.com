import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = {
  title: "Pick 4 · The 2026 League",
  description:
    "Four picks. One perfect week. Your private NFL pick’em league for the 2026 season.",
  robots: { index: false, follow: false },
  icons: { icon: "/icon.svg" },
  openGraph: {
    title: "Pick 4 · The 2026 League",
    description: "Favorite. Underdog. Over. Under. A new season starts here.",
    type: "website",
  },
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
