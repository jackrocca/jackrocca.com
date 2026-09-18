import { fetchGameSummary, GameSummary } from "./game-summary";
import { AppError } from "./rules";
// Per-instance memory only. Game detail is read on demand and never written into
// league state; a stale copy is kept so a feed hiccup still shows the last update.
const cache = new Map<string, { summary: GameSummary; at: number }>();
const ttl = (summary: GameSummary) =>
  summary.state === "live" ? 20_000 : summary.state === "pre" ? 5 * 60_000 : 10 * 60_000;
export type GameDetail = {
  summary: GameSummary;
  stale: boolean;
  error: string | null;
};
export async function loadGameDetail(
  eventId: string,
  fetcher: (id: string) => Promise<GameSummary> = fetchGameSummary,
  now = Date.now(),
): Promise<GameDetail> {
  const cached = cache.get(eventId);
  if (cached && now - cached.at < ttl(cached.summary))
    return { summary: cached.summary, stale: false, error: null };
  try {
    const summary = await fetcher(eventId);
    cache.set(eventId, { summary, at: now });
    if (cache.size > 64) cache.delete(cache.keys().next().value!);
    return { summary, stale: false, error: null };
  } catch (e) {
    console.warn(
      "Game summary unavailable:",
      e instanceof Error ? e.message : "Unknown error",
    );
    if (cached)
      return {
        summary: cached.summary,
        stale: true,
        error: "The live feed is temporarily unavailable. Showing the last update.",
      };
    throw new AppError("Game details are temporarily unavailable.", 503);
  }
}
export function resetGameDetailCache() {
  cache.clear();
}
