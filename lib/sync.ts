import { fetchWeek } from "./feed";
import { audit, mutate, readState } from "./store";
import type { Entry, Week } from "./types";
import {
  currentWeek,
  deadline,
  freezeTime,
  publishWeek,
  publishWeekend,
  weekendFreezeTime,
} from "./rules";
/**
 * Runs whichever scheduled snapshot is due: the opening freeze from Wednesday
 * 09:00 PT, then the weekend freeze from Saturday 09:00 PT. Both refuse to run
 * once the Sunday deadline has passed. Returns the audit line to record, if any.
 */
export function autoPublish(
  state: { weeks: Week[]; entries: Entry[] },
  week: Week,
  now = Date.now(),
) {
  if (now >= deadline(week)) return null;
  if (!week.publishedAt) {
    if (now < freezeTime(week)) return null;
    publishWeek(week, now);
    return `Week ${week.number}: opening lines frozen.`;
  }
  if (!week.weekendPublishedAt && now >= weekendFreezeTime(week)) {
    const { moved, released } = publishWeekend(week, state.entries, now);
    return `Week ${week.number}: Sunday and Monday lines frozen. ${moved.length} saved pick${moved.length === 1 ? "" : "s"} moved to the final line${released.length ? `; Super Spread released on ${released.length} card${released.length === 1 ? "" : "s"}` : ""}.`;
  }
  return null;
}
export async function syncWeeks(numbers?: number[], force = false) {
  const { state } = await readState();
  const current = currentWeek(state.weeks);
  const unresolved = state.weeks
    .filter(
      (w) =>
        w.number < current - 1 &&
        w.games.some(
          (g) =>
            Date.parse(g.kickoff) < Date.now() &&
            !["final", "canceled"].includes(g.state),
        ),
    )
    .slice(0, 3)
    .map((w) => w.number);
  const selected = numbers ?? [
    ...new Set([
      Math.max(1, current - 1),
      current,
      Math.min(18, current + 1),
      ...unresolved,
    ]),
  ];
  const results = await Promise.all(
    selected.map(async (number) => {
      const week = state.weeks.find((w) => w.number === number)!;
      if (!force && week.fetchedAt && Date.now() - Date.parse(week.fetchedAt) < 60_000)
        return { number, skipped: true };
      try {
        const games = await fetchWeek(number),
          at = new Date().toISOString();
        await mutate((s) => {
          const w = s.weeks.find((w) => w.number === number)!;
          if (w.fetchedAt && Date.parse(w.fetchedAt) > Date.parse(at)) return;
          w.games = games.map((g) => {
            const old = w.games.find((old) => old.id === g.id);
            if (old?.resultOverride) {
              g.resultOverride = old.resultOverride;
              g.homeScore = old.resultOverride.homeScore;
              g.awayScore = old.resultOverride.awayScore;
              g.state = old.resultOverride.state;
              g.detail = "Commissioner correction";
            }
            if (old?.linesOverride) {
              g.linesOverride = old.linesOverride;
              g.homeSpread = old.linesOverride.homeSpread;
              g.total = old.linesOverride.total;
              g.provider = "Commissioner";
            }
            return g;
          });
          w.fetchedAt = at;
          w.error = null;
          try {
            const published = autoPublish(s, w);
            if (published) audit(s, "system", "publish-lines", published);
          } catch (e) {
            w.error = (e as Error).message;
          }
        });
        return { number, ok: true, games: games.length };
      } catch (e) {
        const message = e instanceof Error ? e.message : "Feed unavailable";
        await mutate((s) => {
          s.weeks.find((w) => w.number === number)!.error = message;
        });
        return { number, ok: false, error: message };
      }
    }),
  );
  return results;
}
