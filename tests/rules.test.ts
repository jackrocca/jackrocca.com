import test from "node:test";
import assert from "node:assert/strict";
import { initialState } from "../lib/store";
import {
  currentWeek,
  buyInStatus,
  confirmBuyIn,
  deadline,
  freezeTime,
  openingKickoff,
  publishWeek,
  saveEntry,
  scoreEntry,
} from "../lib/rules";
import { parseFeed } from "../lib/feed";
import { PICK_TYPES, BUY_IN_DOLLARS, Entry, Game, PickInput, User } from "../lib/types";
import { view } from "../lib/view";
import { readFileSync } from "node:fs";
const now = Date.parse("2026-09-08T20:00:00Z");
function fixture() {
  const s = initialState(),
    w = s.weeks[0];
  publishWeek(w, now);
  const ids = w.games.slice(0, 4).map((g) => g.id);
  const input: PickInput = {
    week: 1,
    picks: Object.fromEntries(
      PICK_TYPES.map((t, i) => [t, ids[i]]),
    ) as PickInput["picks"],
    superSpread: false,
    totalHelper: null,
    perfectPrediction: false,
    revision: 0,
  };
  return { s, w, input };
}
function scoreFixture() {
  const { s, w, input } = fixture();
  const e = saveEntry(s, "one", input, now);
  const games = structuredClone(w.games);
  for (const g of games) {
    g.state = "final";
    g.homeScore = 30;
    g.awayScore = 20;
  }
  e.picks.favorite = {
    gameId: games[0].id,
    teamId: games[0].home.id,
    line: -5,
    label: "favorite",
  };
  e.picks.underdog = {
    gameId: games[1].id,
    teamId: games[1].away.id,
    line: 11,
    label: "underdog",
  };
  e.picks.over = { gameId: games[2].id, line: 49, label: "over" };
  e.picks.under = { gameId: games[3].id, line: 51, label: "under" };
  return { e, games };
}
test("all 272 games have unique ids, 18 weeks, and 32 teams with 17 games each", () => {
  const s = initialState(),
    g = s.weeks.flatMap((w) => w.games);
  assert.equal(s.weeks.length, 18);
  assert.equal(g.length, 272);
  assert.equal(new Set(g.map((x) => x.id)).size, 272);
  const teams = new Map<string, number>();
  for (const game of g)
    for (const t of [game.home, game.away]) teams.set(t.id, (teams.get(t.id) ?? 0) + 1);
  assert.equal(teams.size, 32);
  assert.ok([...teams.values()].every((n) => n === 17));
});
test("opening kickoff is Wednesday September 9 at 5:20 PM Pacific", () => {
  assert.equal(
    openingKickoff(initialState().weeks[0]),
    Date.parse("2026-09-10T00:20:00Z"),
  );
});
test("Week 1 pick deadline is the Sunday slate, not the Wednesday opener", () => {
  const week = initialState().weeks[0];
  assert.equal(deadline(week), Date.parse("2026-09-13T17:00:00Z"));
  assert.equal(
    deadline(initialState().weeks[1]),
    openingKickoff(initialState().weeks[1]),
  );
});
test("freeze is Wednesday 9 AM Pacific; winter DST handled", () => {
  const s = initialState();
  assert.equal(freezeTime(s.weeks[0]), Date.parse("2026-09-09T16:00:00Z"));
  assert.equal(new Date(freezeTime(s.weeks[12])).getUTCHours(), 17);
});
test("season selection supports pre-season and January", () => {
  const s = initialState();
  assert.equal(currentWeek(s.weeks, now), 1);
  assert.equal(currentWeek(s.weeks, Date.parse("2027-01-10T12:00Z")), 18);
});
test("publishing snapshots real lines and prevents changes", () => {
  const { w } = fixture();
  const old = w.lines[w.games[0].id].homeSpread;
  w.games[0].homeSpread = -22;
  assert.equal(w.lines[w.games[0].id].homeSpread, old);
  assert.throws(() => publishWeek(w, now), /already frozen/);
});
test("unpublished weeks reject picks", () => {
  const { input } = fixture();
  assert.throws(() => saveEntry(initialState(), "one", input, now), /published/);
});
test("four distinct games required", () => {
  const { s, input } = fixture();
  input.picks.over = input.picks.favorite;
  assert.throws(() => saveEntry(s, "one", input, now), /different/);
});
test("server constructs lines, never trusts a client line", () => {
  const { s, w, input } = fixture();
  const e = saveEntry(s, "one", input, now);
  assert.equal(
    e.picks.favorite.line,
    -Math.abs(w.lines[input.picks.favorite].homeSpread!),
  );
});
test("a first-week card stays pending until the commissioner confirms its buy-in", () => {
  const { s, input } = fixture();
  const entry = saveEntry(s, "one", input, now);
  assert.equal(buyInStatus(entry), "pending");
  confirmBuyIn(s, "one", now + 1);
  assert.equal(buyInStatus(entry), "confirmed");
  assert.equal(entry.buyIn?.confirmedAt, new Date(now + 1).toISOString());
});
test("a commissioner cannot confirm a nonexistent or already confirmed buy-in", () => {
  const { s, input } = fixture();
  assert.throws(() => confirmBuyIn(s, "one", now), /no pending/);
  saveEntry(s, "one", input, now);
  confirmBuyIn(s, "one", now);
  assert.throws(() => confirmBuyIn(s, "one", now), /no pending/);
});
test("the league pot is winner-take-all from confirmed players", () => {
  const { s, input } = fixture();
  const one: User = {
    id: "one",
    name: "Ada",
    role: "player",
    sessionVersion: 0,
    createdAt: new Date(now).toISOString(),
  };
  s.users.push(one);
  saveEntry(s, "one", input, now);
  assert.deepEqual(view(s, one, 1).pot, { players: 0, dollars: 0 });
  confirmBuyIn(s, "one", now);
  assert.deepEqual(view(s, one, 1).pot, { players: 1, dollars: BUY_IN_DOLLARS });
  s.users.push({
    id: "two",
    name: "Bea",
    role: "player",
    sessionVersion: 0,
    createdAt: new Date(now).toISOString(),
  });
  saveEntry(s, "two", input, now);
  confirmBuyIn(s, "two", now);
  assert.deepEqual(view(s, one, 1).pot, { players: 2, dollars: BUY_IN_DOLLARS * 2 });
});
test("a legacy card without a buy-in still counts toward the pot", () => {
  const { s, input } = fixture();
  const one: User = {
    id: "one",
    name: "Ada",
    role: "player",
    sessionVersion: 0,
    createdAt: new Date(now).toISOString(),
  };
  s.users.push(one);
  const entry = saveEntry(s, "one", input, now);
  delete entry.buyIn;
  assert.equal(buyInStatus(entry), "confirmed");
  assert.deepEqual(view(s, one, 1).pot, { players: 1, dollars: BUY_IN_DOLLARS });
});
test("a pending Week 1 buy-in does not count toward the pot after a later card", () => {
  const { s, input } = fixture();
  const one: User = {
    id: "one",
    name: "Ada",
    role: "player",
    sessionVersion: 0,
    createdAt: new Date(now).toISOString(),
  };
  s.users.push(one);
  const week1 = saveEntry(s, "one", input, now);
  s.entries.push({ ...week1, id: "later", week: 2, buyIn: undefined });
  assert.equal(buyInStatus(s.entries.find((e) => e.week === 2)!), "confirmed");
  assert.deepEqual(view(s, one, 2).pot, { players: 0, dollars: 0 });
});
test("a later-week card with no Week 1 entry still counts toward the pot", () => {
  const { s, input } = fixture();
  const one: User = {
    id: "one",
    name: "Ada",
    role: "player",
    sessionVersion: 0,
    createdAt: new Date(now).toISOString(),
  };
  s.users.push(one);
  const week1 = saveEntry(s, "one", input, now);
  s.entries = [{ ...week1, id: "later", week: 2, buyIn: undefined }];
  assert.deepEqual(view(s, one, 2).pot, { players: 1, dollars: BUY_IN_DOLLARS });
});
test("revision rejects an overwrite from a stale tab", () => {
  const { s, input } = fixture();
  saveEntry(s, "one", input, now);
  assert.throws(() => saveEntry(s, "one", input, now), /another tab/);
});
test("every player can edit submitted picks and powerups until the weekly deadline", () => {
  const { s, input } = fixture();
  saveEntry(s, "one", input, now);
  const replacement = s.weeks[0].games[4].id;
  const updated = saveEntry(
    s,
    "one",
    {
      ...input,
      picks: { ...input.picks, favorite: replacement },
      totalHelper: "over",
      perfectPrediction: true,
      revision: 1,
    },
    now + 1,
  );
  assert.equal(updated.picks.favorite.gameId, replacement);
  assert.equal(updated.totalHelper, "over");
  assert.equal(updated.perfectPrediction, true);
  assert.equal(updated.revision, 2);
});
test("existing card locks precisely at the weekly deadline", () => {
  const { s, w, input } = fixture();
  saveEntry(s, "one", input, now);
  assert.throws(
    () => saveEntry(s, "one", { ...input, revision: 1 }, deadline(w)),
    /locked/,
  );
});
test("Week 1 stays punishment-free after the Wednesday opener", () => {
  const { s, w, input } = fixture();
  const afterOpener = openingKickoff(w) + 1;
  assert.throws(() => saveEntry(s, "one", input, afterOpener), /started/);
  input.picks = Object.fromEntries(
    PICK_TYPES.map((t, i) => [t, w.games[i + 1].id]),
  ) as PickInput["picks"];
  const first = saveEntry(s, "one", input, afterOpener);
  assert.equal(first.late, false);
  const replacement = w.games[5].id;
  const updated = saveEntry(
    s,
    "one",
    { ...input, picks: { ...input.picks, under: replacement }, revision: 1 },
    afterOpener + 1,
  );
  assert.equal(updated.late, false);
  assert.equal(updated.picks.under.gameId, replacement);
});
test("a started game already on a card stays locked while other picks stay editable", () => {
  const { s, w, input } = fixture();
  saveEntry(s, "one", input, now);
  const afterOpener = openingKickoff(w) + 1;
  const replacement = w.games[4].id;
  assert.throws(
    () =>
      saveEntry(
        s,
        "one",
        { ...input, picks: { ...input.picks, favorite: replacement }, revision: 1 },
        afterOpener,
      ),
    /started game on your card is locked/,
  );
  const updated = saveEntry(
    s,
    "one",
    { ...input, picks: { ...input.picks, under: replacement }, revision: 1 },
    afterOpener,
  );
  assert.equal(updated.picks.favorite.gameId, input.picks.favorite);
  assert.equal(updated.picks.under.gameId, replacement);
  assert.equal(updated.late, false);
});
test("a card that missed the opener cannot add it after kickoff", () => {
  const { s, w, input } = fixture();
  input.picks = Object.fromEntries(
    PICK_TYPES.map((t, i) => [t, w.games[i + 1].id]),
  ) as PickInput["picks"];
  saveEntry(s, "one", input, now);
  assert.throws(
    () =>
      saveEntry(
        s,
        "one",
        { ...input, picks: { ...input.picks, favorite: w.games[0].id }, revision: 1 },
        openingKickoff(w) + 1,
      ),
    /started/,
  );
});
test("late entry may only choose unstarted games, locks immediately", () => {
  const { s, w, input } = fixture();
  const time = deadline(w) + 1;
  const open = w.games.filter((g) => Date.parse(g.kickoff) > time);
  assert.throws(() => saveEntry(s, "one", input, time), /started/);
  input.picks = Object.fromEntries(
    PICK_TYPES.map((t, i) => [t, open[i].id]),
  ) as PickInput["picks"];
  const e = saveEntry(s, "one", input, time);
  assert.equal(e.late, true);
  assert.throws(() => saveEntry(s, "one", { ...input, revision: 1 }, time + 1), /locked/);
});
test("late entries cannot use any powerup", () => {
  const { s, w, input } = fixture();
  const time = deadline(w) + 1;
  const open = w.games.filter((g) => Date.parse(g.kickoff) > time);
  input.picks = Object.fromEntries(
    PICK_TYPES.map((t, i) => [t, open[i].id]),
  ) as PickInput["picks"];
  input.totalHelper = "over";
  assert.throws(() => saveEntry(s, "one", input, time), /powerups/);
});
test("powerups cannot be reused in another week", () => {
  const { s, input } = fixture();
  input.totalHelper = "over";
  const e = saveEntry(s, "one", input, now);
  s.entries.push({ ...e, id: "old", week: 2 });
  assert.throws(
    () => saveEntry(s, "one", { ...input, revision: 1 }, now),
    /already been used/,
  );
});
test("cannot pick live, canceled, postponed, or time-TBD games", () => {
  for (const state of ["live", "canceled", "postponed"] as const) {
    const { s, w, input } = fixture();
    w.games[0].state = state;
    assert.throws(() => saveEntry(s, "one", input, now), /unavailable/);
  }
  const { s, w, input } = fixture();
  w.games[0].timeConfirmed = false;
  assert.throws(() => saveEntry(s, "one", input, now), /unavailable/);
});
test("pending games are pending, never losses", () => {
  const { e, games } = scoreFixture();
  games[0].state = "live";
  const result = scoreEntry(e, games);
  assert.equal(result.outcomes.favorite, "pending");
  assert.equal(result.complete, false);
  assert.equal(result.points, 3);
});
test("4 wins earns 5 points, scoring is idempotent", () => {
  const { e, games } = scoreFixture();
  assert.equal(scoreEntry(e, games).points, 5);
  assert.deepEqual(scoreEntry(e, games), scoreEntry(e, games));
});
test("push earns 0.5 and is not a perfect week", () => {
  const { e, games } = scoreFixture();
  e.picks.under.line = 50;
  const r = scoreEntry(e, games);
  assert.equal(r.points, 3.5);
  assert.equal(r.perfect, false);
});
test("super spread scores against DOUBLE line: 2.5 win, 1 push, 0 loss", () => {
  const { e, games } = scoreFixture();
  e.superSpread = true;
  games[0].homeScore = 31;
  assert.equal(scoreEntry(e, games).points, 5.5);
  games[0].homeScore = 30;
  assert.equal(scoreEntry(e, games).points, 4);
  assert.equal(scoreEntry(e, games).outcomes.favorite, "push");
  games[0].homeScore = 29;
  assert.equal(scoreEntry(e, games).points, 3);
  games[0].homeScore = 10;
  assert.equal(scoreEntry(e, games).points, 3);
});
test("total helper changes only the chosen total, in the right direction", () => {
  const { e, games } = scoreFixture();
  e.picks.over.line = 54;
  e.picks.under.line = 49;
  e.totalHelper = "over";
  let r = scoreEntry(e, games);
  assert.equal(r.outcomes.over, "win");
  assert.equal(r.outcomes.under, "loss");
  e.totalHelper = "under";
  r = scoreEntry(e, games);
  assert.equal(r.outcomes.over, "loss");
  assert.equal(r.outcomes.under, "win");
});
test("perfect prediction earns exactly 8 and combines with super spread", () => {
  const { e, games } = scoreFixture();
  e.perfectPrediction = true;
  assert.equal(scoreEntry(e, games).points, 8);
  e.superSpread = true;
  games[0].homeScore = 31;
  assert.equal(scoreEntry(e, games).points, 8);
  games[0].homeScore = 29;
  assert.equal(scoreEntry(e, games).points, 3);
});
test("late penalty is once, clamped at zero", () => {
  const { e, games } = scoreFixture();
  e.late = true;
  assert.equal(scoreEntry(e, games).points, 4);
  for (const g of games) g.state = "scheduled";
  assert.equal(scoreEntry(e, games).points, 0);
});
test("canceled games are void half-points; postponed remain pending", () => {
  const { e, games } = scoreFixture();
  games[0].state = "canceled";
  let r = scoreEntry(e, games);
  assert.equal(r.points, 3.5);
  assert.equal(r.outcomes.favorite, "void");
  assert.equal(r.perfect, false);
  games[0].state = "postponed";
  assert.equal(scoreEntry(e, games).outcomes.favorite, "pending");
});
test("feed rejects incorrect season and malformed responses", () => {
  assert.throws(() =>
    parseFeed({ season: { year: 2025, type: 2 }, week: { number: 1 }, events: [] }, 1),
  );
  assert.throws(() => parseFeed({}, 1));
});
