import {
  ArrowDown,
  ArrowUp,
  Crown,
  Shield,
  Sparkles,
  Target,
  Zap,
  type LucideIcon,
} from "lucide-react";
import { BUY_IN_DOLLARS, type PickType } from "@/lib/types";

export const labels: Record<PickType, string> = {
  favorite: "Favorite",
  underdog: "Underdog",
  over: "Over",
  under: "Under",
};

export const slotIcons: Record<PickType, LucideIcon> = {
  favorite: Crown,
  underdog: Shield,
  over: ArrowUp,
  under: ArrowDown,
};

/** One-line explanations shared by the tour, the rules page, and the pick slip. */
export const slotHints: Record<PickType, string> = {
  favorite: "Covers the spread",
  underdog: "Covers or wins outright",
  over: "Total goes over",
  under: "Total stays under",
};

export type PowerupKey = "superSpread" | "totalHelper" | "perfectPrediction";

export const powerups: {
  key: PowerupKey;
  name: string;
  icon: LucideIcon;
  short: string;
  detail: string;
  example: string;
}[] = [
  {
    key: "superSpread",
    name: "Super Spread",
    icon: Zap,
    short: "Double your favorite’s spread for 2.5 points.",
    detail:
      "Pick a favorite that is giving at least 5 points, and double the spread. −6 becomes −12. If your team still covers that bigger number, the pick is worth 2.5 points instead of 1. A push is worth 1, and a miss is 0. One trade-off: while Super Spread is on, a perfect week doesn’t earn its extra bonus point.",
    example: "−6 becomes −12",
  },
  {
    key: "totalHelper",
    name: "Total Helper",
    icon: Target,
    short: "Move one total five points your way.",
    detail:
      "Move the total five points in your favor on your over or your under. Over 45 becomes Over 40. Under 45 becomes Under 50. The pick scores normally, so it can still be part of a perfect week.",
    example: "Over 45 becomes Over 40",
  },
  {
    key: "perfectPrediction",
    name: "Perfect Prediction",
    icon: Sparkles,
    short: "Call a perfect week for 8 points.",
    detail:
      "Call your shot. If you go 4 for 4 that week, your card scores 8 points instead of 5. Miss even one pick and the card simply scores like normal, though the powerup is used up. You can run it in the same week as Super Spread, but then the doubled spread has to cover too.",
    example: "4 wins = 8 points",
  },
];

export const buyIn = {
  dollars: BUY_IN_DOLLARS,
  amount: `$${BUY_IN_DOLLARS}`,
  handle: "@jrocca",
  url: "https://venmo.com/u/jrocca",
  qr: "/nfl/venmo-jrocca.png",
};
