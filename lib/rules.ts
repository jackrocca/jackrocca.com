import {
  Entry,
  Game,
  PICK_TYPES,
  PickInput,
  PickType,
  Score,
  SEASON,
  Selection,
  State,
  Week,
} from "./types";
export class AppError extends Error {
  constructor(
    message: string,
    public status = 400,
  ) {
    super(message);
  }
}
export const signed = (n: number) => (n > 0 ? `+${n}` : `${n}`);
function kickoffs(week: Week) {
  return week.games
    .filter((g) => g.state !== "canceled")
    .map((g) => Date.parse(g.kickoff));
}
export function openingKickoff(week: Week) {
  return Math.min(...kickoffs(week));
}
function losAngeles(time: number) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Los_Angeles",
    weekday: "short",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    hourCycle: "h23",
  }).formatToParts(new Date(time));
  const part = (key: string) => parts.find((p) => p.type === key)?.value ?? "";
  return {
    weekday: part("weekday"),
    year: Number(part("year")),
    month: Number(part("month")),
    day: Number(part("day")),
    hour: Number(part("hour")),
  };
}
/**
 * Card deadline: the first Sunday kickoff of the main slate (normally 10:00 PT).
 * Early international Sunday games (06:30 PT) count as pre-deadline games and,
 * like Thursday/Friday/Saturday games, lock only their own slot at kickoff.
 * Weeks without Sunday games fall back to the earliest kickoff.
 */
export function deadline(week: Week) {
  const times = kickoffs(week);
  const sunday = times.filter((time) => losAngeles(time).weekday === "Sun");
  const slate = sunday.filter((time) => losAngeles(time).hour >= 9);
  if (slate.length) return Math.min(...slate);
  if (sunday.length) return Math.min(...sunday);
  return Math.min(...times);
}
/** 09:00 America/Los_Angeles on the most recent `weekday` (0 = Sunday) on or before `anchor`'s Pacific date. */
function pacificNine(anchor: number, weekday: number) {
  const { year, month, day: date } = losAngeles(anchor);
  const day = new Date(Date.UTC(year, month - 1, date, 12));
  day.setUTCDate(day.getUTCDate() - ((day.getUTCDay() - weekday + 7) % 7));
  const offsetName = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Los_Angeles",
    timeZoneName: "shortOffset",
  })
    .formatToParts(day)
    .find((p) => p.type === "timeZoneName")!.value;
  const offset = Number(offsetName.replace("GMT", ""));
  day.setUTCHours(9 - offset, 0, 0, 0);
  return day.getTime();
}
/** Opening snapshot: Wednesday 09:00 PT of the NFL week containing the opening game. */
export function freezeTime(week: Week) {
  return pacificNine(openingKickoff(week), 3);
}
/** Weekend snapshot: Saturday 09:00 PT before the Sunday deadline. */
export function weekendFreezeTime(week: Week) {
  return pacificNine(deadline(week), 6);
}
/** Whether a game kicks off at or after the card deadline and so plays the weekend snapshot. */
export function weekendGame(week: Week, game: Game) {
  return Date.parse(game.kickoff) >= deadline(week);
}
/** When a game's slot locks and its picks reveal: its own kickoff, or the deadline if later. */
export function slotLockTime(week: Week, game: Game) {
  return Math.min(Date.parse(game.kickoff), deadline(week));
}
/** The late flag is derived on read so a rule change never strands a saved card. */
export function entryLate(entry: Pick<Entry, "submittedAt">, week: Week) {
  return Date.parse(entry.submittedAt) >= deadline(week);
}
export function currentWeek(weeks: Week[], now = Date.now()) {
  return (
    weeks.find(
      (w) =>
        now <
        Math.max(...w.games.map((g) => Date.parse(g.kickoff))) + 30 * 60 * 60 * 1000,
    )?.number ?? 18
  );
}
export function gameOpen(game: Game, now = Date.now()) {
  return (
    game.timeConfirmed && game.state === "scheduled" && Date.parse(game.kickoff) > now
  );
}
function spreadSelection(game: Game, teamId: string, homeSpread: number): Selection {
  const home = teamId === game.home.id;
  const team = home ? game.home : game.away;
  const line = home ? homeSpread : -homeSpread;
  return {
    gameId: game.id,
    teamId: team.id,
    line,
    label: `${team.name} ${signed(line)}`,
  };
}
function totalSelection(game: Game, type: "over" | "under", total: number): Selection {
  return {
    gameId: game.id,
    line: total,
    label: `${game.away.abbreviation} @ ${game.home.abbreviation} · ${type === "over" ? "Over" : "Under"} ${total}`,
  };
}
export function selection(week: Week, type: PickType, id: string): Selection {
  const game = week.games.find((g) => g.id === id);
  if (!game) throw new AppError("That game is not in this week.");
  const odds = week.lines[id];
  if (!odds) throw new AppError("Lines have not been published for this game.");
  if (type === "favorite" || type === "underdog") {
    if (odds.homeSpread === null || odds.homeSpread === 0)
      throw new AppError("This game has no eligible spread.");
    const home = (type === "favorite") === odds.homeSpread < 0;
    return spreadSelection(game, (home ? game.home : game.away).id, odds.homeSpread);
  }
  if (odds.total === null) throw new AppError("This game has no total.");
  return totalSelection(game, type, odds.total);
}
export function saveEntry(
  state: State,
  userId: string,
  input: PickInput,
  now = Date.now(),
) {
  const week = state.weeks.find((w) => w.number === input.week);
  if (!week || !week.publishedAt)
    throw new AppError("Picks open once the weekly lines are published.");
  const old = state.entries.find(
    (e) => e.userId === userId && e.week === input.week && e.season === SEASON,
  );
  const time = new Date(now).toISOString();
  // Equals `entryLate` for the saved card: a new card's submittedAt is `now`, and
  // an existing card can only be re-saved while the deadline is still ahead.
  const late = now >= deadline(week);
  if (old && late) throw new AppError("Your submitted picks are locked for the week.");
  if ((old?.revision ?? 0) !== input.revision)
    throw new AppError(
      "Your picks changed in another tab. Refresh before saving again.",
      409,
    );
  if (new Set(PICK_TYPES.map((t) => input.picks[t])).size !== 4)
    throw new AppError("Choose four different games.");
  // Slots whose saved game has kicked off: the pick and any powerup on it are final.
  const lockedSlots = new Set<PickType>();
  for (const type of PICK_TYPES) {
    const gameId = input.picks[type];
    const previousId = old?.picks[type].gameId;
    const previous = previousId
      ? week.games.find((game) => game.id === previousId)
      : undefined;
    // A started game already on the card stays in that slot; every other pick
    // must still be an unstarted game, so the card stays editable around early games.
    if (previous && !gameOpen(previous, now)) {
      if (gameId !== previousId)
        throw new AppError("A started game on your card is locked.");
      lockedSlots.add(type);
      continue;
    }
    const selected = week.games.find((game) => game.id === gameId);
    if (!selected || !gameOpen(selected, now))
      throw new AppError(
        "A selected game has started or is unavailable. Choose another game.",
      );
  }
  if (late && (input.superSpread || input.totalHelper || input.perfectPrediction))
    throw new AppError("Late entries cannot use powerups.");
  if (old && lockedSlots.has("favorite") && input.superSpread !== old.superSpread)
    throw new AppError(
      "Super Spread is locked once your favorite’s game has kicked off.",
    );
  for (const total of ["over", "under"] as const)
    if (
      old &&
      lockedSlots.has(total) &&
      (input.totalHelper === total) !== (old.totalHelper === total)
    )
      throw new AppError(
        `Total Helper is locked once your ${total}’s game has kicked off.`,
      );
  // A perfect week needs all four picks, so calling it after one result is in
  // would be a free look. It locks with the first game on the card.
  if (old && lockedSlots.size && input.perfectPrediction !== old.perfectPrediction)
    throw new AppError(
      "Perfect Prediction is locked once a game on your card has kicked off.",
    );
  const other = state.entries.filter(
    (e) => e.userId === userId && e.season === SEASON && e.week !== input.week,
  );
  for (const power of ["superSpread", "totalHelper", "perfectPrediction"] as const)
    if (input[power] && other.some((e) => e[power]))
      throw new AppError("That powerup has already been used this season.");
  const picks = Object.fromEntries(
    PICK_TYPES.map((t) =>
      // A locked slot keeps the frozen selection it was scored against.
      lockedSlots.has(t) ? [t, old!.picks[t]] : [t, selection(week, t, input.picks[t])],
    ),
  ) as Entry["picks"];
  if (input.superSpread && picks.favorite.line > -5)
    throw new AppError("Super Spread requires a favorite of -5 or greater.");
  const entry: Entry = {
    id: old?.id ?? crypto.randomUUID(),
    userId,
    week: input.week,
    season: SEASON,
    picks,
    superSpread: input.superSpread,
    totalHelper: input.totalHelper,
    perfectPrediction: input.perfectPrediction,
    late,
    submittedAt: old?.submittedAt ?? time,
    updatedAt: time,
    revision: (old?.revision ?? 0) + 1,
    buyIn:
      old?.buyIn ??
      (input.week === 1 ? { status: "pending", requestedAt: time } : undefined),
  };
  state.entries = state.entries.filter((e) => e.id !== entry.id).concat(entry);
  return entry;
}
export function buyInStatus(entry: Entry) {
  // Existing cards predate the payment flow and must not be retroactively blocked.
  return entry.buyIn?.status ?? "confirmed";
}
export function confirmBuyIn(state: State, userId: string, now = Date.now()) {
  const entry = state.entries.find(
    (item) => item.userId === userId && item.week === 1 && item.season === SEASON,
  );
  if (!entry || buyInStatus(entry) !== "pending")
    throw new AppError("There is no pending Week 1 buy-in for this player.", 404);
  entry.buyIn = {
    ...entry.buyIn!,
    status: "confirmed",
    confirmedAt: new Date(now).toISOString(),
  };
  return entry;
}
export function scoreEntry(entry: Entry, games: Game[]): Score {
  const outcomes = {} as Score["outcomes"];
  let points = 0,
    wins = 0;
  for (const type of PICK_TYPES) {
    const pick = entry.picks[type],
      game = games.find((g) => g.id === pick.gameId);
    if (game?.state === "canceled") {
      outcomes[type] = "void";
      points += 0.5;
      continue;
    }
    if (
      !game ||
      game.state !== "final" ||
      game.homeScore === null ||
      game.awayScore === null
    ) {
      outcomes[type] = "pending";
      continue;
    }
    let margin: number;
    if (type === "favorite" || type === "underdog") {
      const isHome = pick.teamId === game.home.id;
      if (!isHome && pick.teamId !== game.away.id) {
        outcomes[type] = "pending";
        continue;
      }
      const line =
        type === "favorite" && entry.superSpread && !entry.late
          ? pick.line * 2
          : pick.line;
      margin =
        (isHome ? game.homeScore - game.awayScore : game.awayScore - game.homeScore) +
        line;
    } else {
      const adjusted =
        pick.line +
        (entry.totalHelper === type && !entry.late ? (type === "over" ? -5 : 5) : 0);
      margin = (game.homeScore + game.awayScore - adjusted) * (type === "over" ? 1 : -1);
    }
    outcomes[type] = margin > 0 ? "win" : margin === 0 ? "push" : "loss";
    const superPick = type === "favorite" && entry.superSpread && !entry.late;
    if (margin > 0) {
      wins++;
      points += superPick ? 2.5 : 1;
    } else if (margin === 0) points += superPick ? 1 : 0.5;
  }
  const perfect = wins === 4,
    complete = Object.values(outcomes).every((o) => o !== "pending");
  if (perfect) {
    if (entry.perfectPrediction && !entry.late) points = 8;
    else if (!entry.superSpread) points += 1;
  }
  if (entry.late) points = Math.max(0, points - 1);
  return { points, wins, perfect, complete, outcomes };
}
/**
 * Opening snapshot. Freezes every unstarted game with a real line and opens picks.
 * Games kicking off before the deadline keep these numbers for good; weekend games
 * are refrozen by `publishWeekend`. A game that has already kicked off never gets
 * a line from potentially in-play odds.
 */
export function publishWeek(week: Week, now = Date.now()) {
  if (week.publishedAt) throw new AppError("This week’s lines are already frozen.", 409);
  if (now >= deadline(week))
    throw new AppError("Cannot publish new lines after the Sunday deadline.");
  const eligible = week.games.filter(
    (g) => gameOpen(g, now) && (g.homeSpread !== null || g.total !== null),
  );
  if (eligible.length < 4)
    throw new AppError("At least four games with real lines are needed.");
  week.lines = Object.fromEntries(
    eligible.map((g) => [
      g.id,
      { homeSpread: g.homeSpread, total: g.total, provider: g.provider },
    ]),
  );
  week.publishedAt = new Date(now).toISOString();
}
/**
 * Weekend snapshot. Refreezes every game at or after the Sunday deadline with the
 * current line, then rebases saved picks on those games so everyone is scored
 * against the same final number. A market the feed dropped keeps its opening value.
 */
export function publishWeekend(week: Week, entries: Entry[], now = Date.now()) {
  if (!week.publishedAt) throw new AppError("Publish the opening lines first.");
  if (week.weekendPublishedAt)
    throw new AppError("This weekend’s lines are already frozen.", 409);
  if (now >= deadline(week))
    throw new AppError("Cannot publish new lines after the Sunday deadline.");
  for (const g of week.games) {
    if (!weekendGame(week, g) || !gameOpen(g, now)) continue;
    if (g.homeSpread === null && g.total === null) continue;
    const old = week.lines[g.id];
    week.lines[g.id] = {
      homeSpread: g.homeSpread ?? old?.homeSpread ?? null,
      total: g.total ?? old?.total ?? null,
      provider: g.provider,
    };
  }
  week.weekendPublishedAt = new Date(now).toISOString();
  return rebaseWeekendPicks(week, entries);
}
/**
 * Moves saved weekend picks onto the refrozen lines. Spread picks keep their team
 * (a favorite whose line flipped stays that team at the new number); totals take
 * the new total. Moved picks remember the old line so the member can revisit.
 * Super Spread is released if the favorite no longer gives 5.
 */
export function rebaseWeekendPicks(week: Week, entries: Entry[]) {
  const moved: { entry: Entry; type: PickType; from: number; to: number }[] = [];
  const released: Entry[] = [];
  for (const entry of entries) {
    if (entry.week !== week.number || entry.season !== SEASON) continue;
    for (const type of PICK_TYPES) {
      const pick = entry.picks[type];
      const game = week.games.find((g) => g.id === pick.gameId);
      const odds = game && week.lines[game.id];
      if (!game || !odds || !weekendGame(week, game)) continue;
      let next: Selection | null = null;
      if (type === "favorite" || type === "underdog") {
        if (pick.teamId && odds.homeSpread !== null && odds.homeSpread !== 0)
          next = spreadSelection(game, pick.teamId, odds.homeSpread);
      } else if (odds.total !== null) next = totalSelection(game, type, odds.total);
      if (!next || next.line === pick.line) continue;
      moved.push({ entry, type, from: pick.line, to: next.line });
      entry.picks[type] = { ...next, movedFrom: pick.movedFrom ?? pick.line };
    }
    if (entry.superSpread && entry.picks.favorite.line > -5) {
      entry.superSpread = false;
      released.push(entry);
    }
  }
  return { moved, released };
}
