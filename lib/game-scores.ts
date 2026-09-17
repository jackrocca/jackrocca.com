import type { GameSummary } from "./game-summary";
import type { Game } from "./types";
export type DisplayScores = {
  awayScore: number | null;
  homeScore: number | null;
  /** Which record the numbers came from. */
  source: "league" | "summary";
};
/**
 * Scores for the game sheet header. The league record is authoritative: it
 * carries commissioner corrections (`resultOverride`) and the state the board
 * shows. ESPN's summary is used only while it is at least as far along as the
 * league record, so a cached live summary never overrides a final.
 */
export function displayScores(game: Game, summary: GameSummary | null): DisplayScores {
  const league: DisplayScores = {
    awayScore: game.awayScore,
    homeScore: game.homeScore,
    source: "league",
  };
  if (!summary || game.resultOverride) return league;
  if (game.state === "final" && summary.state !== "final") return league;
  if (game.state === "canceled" || game.state === "postponed") return league;
  if (summary.away.score === null || summary.home.score === null) return league;
  return {
    awayScore: summary.away.score,
    homeScore: summary.home.score,
    source: "summary",
  };
}
