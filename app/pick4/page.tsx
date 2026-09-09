import type { Metadata } from "next";
import League from "@/components/league";
import "./league.css";
const title = "Pick 4 Fantasy League";
const description = "Four picks. Every week. Join Jack’s NFL pick’em league.";
export const metadata: Metadata = {
  metadataBase: new URL("https://www.jackrocca.com"),
  title: { absolute: title },
  description,
  alternates: { canonical: "/pick4" },
  icons: {
    icon: [{ url: "/nfl/league.png", type: "image/png", sizes: "500x500" }],
    apple: "/nfl/league.png",
  },
  openGraph: {
    title,
    description,
    url: "/pick4",
    siteName: "Pick 4 Fantasy League",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: [
      { url: "/pick4/opengraph-image", alt: "NFL shield — Pick 4 Fantasy League" },
    ],
  },
  robots: { index: false, follow: false },
};
export default function Page() {
  return <League />;
}
