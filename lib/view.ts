import { currentWeek, deadline, freezeTime, scoreEntry } from "./rules";
import { State, User } from "./types";
export function view(
  state: State,
  user: User | null,
  weekNumber: number,
  googleReady = false,
) {
  const week = state.weeks.find((w) => w.number === weekNumber)!;
  const allGames = state.weeks.flatMap((w) => w.games);
  const scores = state.entries.map((e) => ({
    ...e,
    score: scoreEntry(e, allGames),
  }));
  const standings = user
    ? state.users
        .map((u) => {
          const entries = scores.filter((e) => e.userId === u.id);
          return {
            id: u.id,
            name: u.name,
            points: entries.reduce((s, e) => s + e.score.points, 0),
            wins: entries.reduce((s, e) => s + e.score.wins, 0),
            perfect: entries.filter((e) => e.score.perfect).length,
            played: entries.length,
            weekPoints:
              entries.find((e) => e.week === weekNumber)?.score.points ?? 0,
            submitted: entries.some((e) => e.week === weekNumber),
          };
        })
        .sort(
          (a, b) =>
            b.points - a.points ||
            b.perfect - a.perfect ||
            b.wins - a.wins ||
            a.name.localeCompare(b.name),
        )
    : [];
  return {
    season: 2026,
    currentWeek: currentWeek(state.weeks),
    user: user
      ? {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        }
      : null,
    authentication: { provider: "google", ready: googleReady },
    week: {
      ...week,
      error: week.error
        ? "The live feed is temporarily unavailable. Showing the last successful update."
        : null,
      deadline: deadline(week),
      freezeAt: freezeTime(week),
    },
    standings,
    entries: user
      ? scores
          .filter((e) => e.week === weekNumber)
          .map((e) => {
            const own = e.userId === user.id;
            const reveal = Date.now() >= deadline(week);
            return {
              ...e,
              picks: own || reveal ? e.picks : null,
              superSpread: own || reveal ? e.superSpread : false,
              totalHelper: own || reveal ? e.totalHelper : null,
              perfectPrediction: own || reveal ? e.perfectPrediction : false,
            };
          })
      : [],
    history: user
      ? scores
          .filter((e) => e.userId === user.id)
          .sort((a, b) => b.week - a.week)
      : [],
    admin:
      user?.role === "admin"
        ? {
            audit: state.audit.slice(-40).reverse(),
            members: state.users.map(({ id, name, email, role }) => ({
              id,
              name,
              email,
              role,
            })),
          }
        : null,
  };
}
export type AppView = ReturnType<typeof view>;
