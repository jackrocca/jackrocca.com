import { signed } from "./rules";
import type { Game, PickType, Week } from "./types";
export type GameLine = {
  homeSpread: number | null;
  total: number | null;
  provider: string | null;
};
/** The line a member plays against: the frozen snapshot once published, else the preview. */
export function gameLine(
  week: Pick<Week, "publishedAt" | "lines" | "games">,
  gameId: string,
): GameLine | null {
  if (week.publishedAt) return week.lines[gameId] ?? null;
  const game = week.games.find((g) => g.id === gameId);
  return game
    ? { homeSpread: game.homeSpread, total: game.total, provider: game.provider }
    : null;
}
/** Short label for one pick slot ("SEA -3", "NE +3", "O 44.5"), or null when the market is missing. */
export function slotLine(game: Game, line: GameLine | null, type: PickType) {
  const spread = line?.homeSpread ?? null,
    total = line?.total ?? null;
  if (type === "over" || type === "under")
    return total === null ? null : `${type === "over" ? "O" : "U"} ${total}`;
  if (spread === null || spread === 0) return null;
  const homeFavorite = spread < 0;
  const team = (type === "favorite") === homeFavorite ? game.home : game.away;
  const number = type === "favorite" ? -Math.abs(spread) : Math.abs(spread);
  return `${team.abbreviation} ${signed(number)}`;
}
