import { onboardingFlags } from "./onboarding";
import {
  buyInStatus,
  currentWeek,
  deadline,
  entryLate,
  freezeTime,
  scoreEntry,
  slotLockTime,
  weekendFreezeTime,
} from "./rules";
import {
  BUY_IN_DOLLARS,
  Entry,
  PICK_TYPES,
  PickType,
  Selection,
  State,
  User,
} from "./types";
export type GamePicker = { userId: string; name: string; avatarRevision: number };
export type GamePicks = Record<string, Record<PickType, GamePicker[]>>;
/** A card as another member may see it: hidden slots are null until they reveal. */
export type RedactedPicks = Record<PickType, Selection | null>;
/**
 * Members grouped by the game and slot they picked. Callers pass only entries
 * whose picks the viewer may see, so redaction happens before grouping; a
 * redacted (null) slot is simply skipped.
 */
export function gamePicks(
  entries: { userId: string; picks: RedactedPicks | Entry["picks"] | null }[],
  users: User[],
  viewerId: string | null,
): GamePicks {
  const byGame: GamePicks = {};
  const ordered = [...entries].sort((a, b) =>
    a.userId === viewerId ? -1 : b.userId === viewerId ? 1 : 0,
  );
  for (const entry of ordered) {
    const member = users.find((u) => u.id === entry.userId);
    if (!member) continue;
    for (const type of PICK_TYPES) {
      const gameId = entry.picks?.[type]?.gameId;
      if (!gameId) continue;
      byGame[gameId] ??= { favorite: [], underdog: [], over: [], under: [] };
      byGame[gameId][type].push({
        userId: member.id,
        name: member.name,
        avatarRevision: member.avatarRevision ?? 0,
      });
    }
  }
  return byGame;
}
export function view(
  state: State,
  user: User | null,
  weekNumber: number,
  googleReady = false,
  now = Date.now(),
) {
  const week = state.weeks.find((w) => w.number === weekNumber)!;
  const reveal = now >= deadline(week);
  // A slot reveals at its game's kickoff or at the deadline, whichever is first.
  // A canceled game is void for everyone and can no longer be picked, so it
  // reveals at once; otherwise its half point would leak the slot through `score`.
  const slotRevealed = (pick: Selection) => {
    const game = week.games.find((g) => g.id === pick.gameId);
    if (!game) return reveal;
    return game.state === "canceled" || now >= slotLockTime(week, game);
  };
  const anyRevealed = reveal || week.games.some((g) => now >= slotLockTime(week, g));
  const allGames = state.weeks.flatMap((w) => w.games);
  const weekOf = (entry: Entry) => state.weeks.find((w) => w.number === entry.week);
  const allScores = state.entries.map((raw) => {
    const home = weekOf(raw);
    const e = home ? { ...raw, late: entryLate(raw, home) } : raw;
    return { ...e, score: scoreEntry(e, allGames) };
  });
  const scores = allScores.filter((entry) => buyInStatus(entry) === "confirmed");
  // Week 2+ cards omit buyIn (treated as confirmed); the pot follows Week 1.
  const paidPlayers = new Set(
    allScores
      .filter((entry) => {
        const week1 = allScores.find((e) => e.userId === entry.userId && e.week === 1);
        return buyInStatus(week1 ?? entry) === "confirmed";
      })
      .map((entry) => entry.userId),
  ).size;
  const visibleScores = user
    ? allScores.filter(
        (entry) => entry.userId === user.id || buyInStatus(entry) === "confirmed",
      )
    : [];
  const standings = user
    ? state.users
        .map((u) => {
          const entries = scores.filter((e) => e.userId === u.id);
          return {
            id: u.id,
            name: u.name,
            avatarRevision: u.avatarRevision ?? 0,
            points: entries.reduce((s, e) => s + e.score.points, 0),
            wins: entries.reduce((s, e) => s + e.score.wins, 0),
            perfect: entries.filter((e) => e.score.perfect).length,
            played: entries.length,
            weekPoints: entries.find((e) => e.week === weekNumber)?.score.points ?? 0,
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
  // Other members' cards, slot by slot as the viewer may see them right now.
  const redact = <T extends Entry>(e: T, own: boolean) => {
    if (own || reveal) return { ...e, picks: e.picks as RedactedPicks | null };
    const picks = Object.fromEntries(
      PICK_TYPES.map((t) => [t, slotRevealed(e.picks[t]) ? e.picks[t] : null]),
    ) as RedactedPicks;
    const shown = (t: PickType) => picks[t] !== null;
    return {
      ...e,
      picks: PICK_TYPES.some(shown) ? picks : null,
      superSpread: shown("favorite") ? e.superSpread : false,
      totalHelper: e.totalHelper && shown(e.totalHelper) ? e.totalHelper : null,
      perfectPrediction: PICK_TYPES.some(shown) ? e.perfectPrediction : false,
    };
  };
  // Once any game has kicked off every card's slot for it is public (even as
  // "not picked"), so every visible card counts toward pick shares.
  const pickCards = user
    ? visibleScores
        .filter((e) => e.week === weekNumber && (e.userId === user.id || anyRevealed))
        .map((e) => redact(e, e.userId === user.id))
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
          avatarRevision: user.avatarRevision ?? 0,
          ...onboardingFlags(user),
        }
      : null,
    authentication: { provider: "google", ready: googleReady },
    week: {
      ...week,
      error: week.error
        ? "The live feed is temporarily unavailable. Showing the last successful update."
        : null,
      weekendPublishedAt: week.weekendPublishedAt ?? null,
      deadline: deadline(week),
      freezeAt: freezeTime(week),
      weekendFreezeAt: weekendFreezeTime(week),
      // The whole board is public once the deadline passes; single games reveal
      // earlier at their own kickoff (see `slotLockTime`).
      picksRevealed: reveal,
    },
    pot: {
      players: paidPlayers,
      dollars: paidPlayers * BUY_IN_DOLLARS,
    },
    standings,
    entries: user
      ? visibleScores
          .filter((e) => e.week === weekNumber)
          .map((e) => {
            const own = e.userId === user.id;
            return {
              ...redact(e, own),
              buyIn: own
                ? {
                    status: buyInStatus(e),
                    requestedAt: e.buyIn?.requestedAt ?? e.submittedAt,
                    confirmedAt: e.buyIn?.confirmedAt,
                  }
                : undefined,
            };
          })
      : [],
    // Same redaction as `entries`: a member's own card always, other slots as they reveal.
    gamePicks: user ? gamePicks(pickCards, state.users, user.id) : {},
    // Denominator for pick shares: the very cards `gamePicks` was built from, so a
    // viewer whose own buy-in is still pending never sees "2 of 1 cards".
    pickCardCount: pickCards.length,
    history: user
      ? allScores.filter((e) => e.userId === user.id).sort((a, b) => b.week - a.week)
      : [],
    admin:
      user?.role === "admin"
        ? {
            audit: state.audit.slice(-40).reverse(),
            members: state.users.map(({ id, name, email, role, avatarRevision }) => ({
              id,
              name,
              email,
              role,
              avatarRevision: avatarRevision ?? 0,
            })),
            pendingBuyIns: state.entries
              .filter((entry) => entry.week === 1 && buyInStatus(entry) === "pending")
              .map((entry) => ({
                userId: entry.userId,
                name:
                  state.users.find((member) => member.id === entry.userId)?.name ??
                  "Player",
                requestedAt: entry.buyIn!.requestedAt,
              })),
          }
        : null,
  };
}
export type AppView = ReturnType<typeof view>;
