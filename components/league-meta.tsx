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
      "Take a favorite of −5 or bigger and double the line. Cover it for 2.5 points, push for 1, miss for 0. The regular perfect-week bonus is off while it’s active.",
    example: "−6 becomes −12",
  },
  {
    key: "totalHelper",
    name: "Total Helper",
    icon: Target,
    short: "Move one total five points your way.",
    detail:
      "Pick your over or your under. The line moves five points in your favor and scores normally, so it can still be part of a perfect week.",
    example: "Over 45 becomes Over 40",
  },
  {
    key: "perfectPrediction",
    name: "Perfect Prediction",
    icon: Sparkles,
    short: "Call a perfect week for 8 points.",
    detail:
      "Turn it on before the deadline. Go 4-for-4 and the card scores 8 instead of 5. Miss one and it scores normally. Stack it with Super Spread and the doubled line still has to cover.",
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
