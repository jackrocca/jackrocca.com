import type { Metadata } from "next";
import League from "@/components/league";
import "./league.css";
export const metadata: Metadata = {
  title: "Pick 4 — 2026 league",
  icons: { icon: "/pick4-icon.svg" },
  openGraph: {
    title: "Pick 4 · Jack’s 2026 League",
    description: "Favorite. Underdog. Over. Under. Four picks, every week.",
  },
  robots: { index: false, follow: false },
};
export default function Page() {
  return <League />;
}
