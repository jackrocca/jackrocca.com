import test from "node:test";
import assert from "node:assert/strict";
import { initialState } from "../lib/store";
import { confirmBuyIn, deadline, publishWeek, saveEntry } from "../lib/rules";
import { PICK_TYPES, PickInput, User } from "../lib/types";
import { gamePicks, view } from "../lib/view";
const now = Date.parse("2026-09-08T20:00:00Z");
function member(id: string, name: string): User {
  return {
    id,
    name,
    role: "player",
    sessionVersion: 0,
    createdAt: new Date(now).toISOString(),
    avatarRevision: id === "bea" ? 3 : 0,
  };
}
function league() {
  const s = initialState(),
    w = s.weeks[0];
  publishWeek(w, now);
  const [ada, bea, cy] = [member("ada", "Ada"), member("bea", "Bea"), member("cy", "Cy")];
  s.users.push(ada, bea, cy);
  const card = (offset: number): PickInput => ({
    week: 1,
    picks: Object.fromEntries(
      PICK_TYPES.map((t, i) => [t, w.games[i + offset].id]),
    ) as PickInput["picks"],
    superSpread: false,
    totalHelper: null,
    perfectPrediction: false,
    revision: 0,
  });
  // Ada and Bea share the first game (Ada favorite, Bea underdog); Cy never pays.
  saveEntry(s, "ada", card(0), now);
  saveEntry(
    s,
    "bea",
    { ...card(0), picks: { ...card(4).picks, underdog: w.games[0].id } },
    now,
  );
  saveEntry(s, "cy", card(8), now);
  confirmBuyIn(s, "ada", now);
  confirmBuyIn(s, "bea", now);
  return { s, w, ada, bea, cy };
}
test("before any kickoff a member sees only their own picks on the board", () => {
  const { s, w, ada } = league();
  const result = view(s, ada, 1, false, now + 1);
  assert.equal(result.week.picksRevealed, false);
  const pickers = Object.values(result.gamePicks).flatMap((slots) =>
    Object.values(slots).flat(),
  );
  assert.ok(pickers.length === 4);
  assert.ok(pickers.every((p) => p.userId === "ada"));
  assert.ok(!JSON.stringify(result.gamePicks).includes("bea"));
  assert.equal(result.gamePicks[w.games[0].id].favorite[0].name, "Ada");
  assert.deepEqual(result.gamePicks[w.games[0].id].underdog, []);
  assert.equal(result.entries.find((e) => e.userId === "bea")!.picks, null);
  assert.equal(result.pickCardCount, 1);
});
test("once the opener kicks off only that game's picks reveal; the rest wait for Sunday", () => {
  const { s, w, ada, bea } = league();
  const opener = w.games[0];
  const afterOpener = Date.parse(opener.kickoff) + 1;
  assert.ok(afterOpener < deadline(w));
  const result = view(s, ada, 1, false, afterOpener);
  assert.equal(result.week.picksRevealed, false);
  assert.deepEqual(result.gamePicks[opener.id].underdog, [
    { userId: "bea", name: "Bea", avatarRevision: 3 },
  ]);
  // Bea's other three picks (games 4–7) stay hidden from Ada.
  assert.ok(!JSON.stringify(result.gamePicks[w.games[4].id] ?? {}).includes("bea"));
  const beaCard = result.entries.find((e) => e.userId === "bea")!;
  assert.equal(beaCard.picks!.underdog!.gameId, opener.id);
  assert.equal(beaCard.picks!.favorite, null);
  assert.equal(beaCard.picks!.over, null);
  assert.equal(beaCard.picks!.under, null);
  // Every confirmed card is now public for the opener, so both count toward shares.
  assert.equal(result.pickCardCount, 2);
  // Bea sees her own full card, and Ada's favorite on the opener.
  const own = view(s, bea, 1, false, afterOpener).entries.find(
    (e) => e.userId === "bea",
  )!;
  assert.ok(PICK_TYPES.every((t) => own.picks![t] !== null));
  assert.deepEqual(
    view(s, bea, 1, false, afterOpener).gamePicks[opener.id].favorite.map(
      (p) => p.userId,
    ),
    ["ada"],
  );
});
test("powerups reveal with the slot they affect", () => {
  const { s, w, ada, bea } = league();
  const opener = w.games[0];
  const beaEntry = s.entries.find((e) => e.userId === "bea")!;
  // Bea: Total Helper on the over (a Sunday game), Perfect Prediction on the card.
  beaEntry.totalHelper = "over";
  beaEntry.perfectPrediction = true;
  const adaEntry = s.entries.find((e) => e.userId === "ada")!;
  adaEntry.superSpread = true; // favorite on the opener
  const afterOpener = Date.parse(opener.kickoff) + 1;
  const adaSees = view(s, ada, 1, false, afterOpener).entries.find(
    (e) => e.userId === "bea",
  )!;
  assert.equal(adaSees.totalHelper, null);
  // Perfect Prediction locked with Bea's opener slot, so it is public with it.
  assert.equal(adaSees.perfectPrediction, true);
  const beaSees = view(s, bea, 1, false, afterOpener).entries.find(
    (e) => e.userId === "ada",
  )!;
  assert.equal(beaSees.superSpread, true);
  const beforeKickoff = view(s, bea, 1, false, now + 1).entries.find(
    (e) => e.userId === "ada",
  )!;
  assert.equal(beforeKickoff.superSpread, false);
  assert.equal(beforeKickoff.perfectPrediction, false);
  const atDeadline = view(s, ada, 1, false, deadline(w)).entries.find(
    (e) => e.userId === "bea",
  )!;
  assert.equal(atDeadline.totalHelper, "over");
});
test("a member's own hidden slots never leak through gamePicks before Sunday", () => {
  const { s, w, cy } = league();
  const afterOpener = Date.parse(w.games[0].kickoff) + 1;
  const result = view(s, cy, 1, false, afterOpener);
  // Cy's card (games 8–11) has no opener; Cy still sees all four of their own picks and nobody else's.
  const pickers = Object.values(result.gamePicks).flatMap((slots) =>
    Object.values(slots).flat(),
  );
  assert.ok(pickers.some((p) => p.userId === "cy"));
  assert.ok(
    pickers
      .filter((p) => p.userId !== "cy")
      .every((p) => p.userId === "ada" || p.userId === "bea"),
  );
  assert.ok(
    Object.entries(result.gamePicks).every(
      ([gameId, slots]) =>
        gameId === w.games[0].id ||
        Object.values(slots)
          .flat()
          .every((p) => p.userId === "cy"),
    ),
  );
});
test("at the deadline confirmed members' picks reveal, pending buy-ins stay hidden", () => {
  const { s, w, ada, bea } = league();
  const result = view(s, ada, 1, false, deadline(w));
  assert.equal(result.week.picksRevealed, true);
  const opener = result.gamePicks[w.games[0].id];
  assert.deepEqual(
    opener.favorite.map((p) => p.userId),
    ["ada"],
  );
  assert.deepEqual(opener.underdog, [{ userId: "bea", name: "Bea", avatarRevision: 3 }]);
  assert.ok(!JSON.stringify(result.gamePicks).includes("cy"));
  // The viewer always sorts first inside a cluster.
  const shared = view(s, bea, 1, false, deadline(w));
  assert.ok(Object.values(shared.gamePicks).length > 0);
  assert.deepEqual(result.entries.map((e) => e.userId).sort(), ["ada", "bea"]);
});
test("a pending player still sees their own pending card on the board", () => {
  const { s, w, cy } = league();
  const result = view(s, cy, 1, false, now + 1);
  assert.equal(result.gamePicks[w.games[8].id].favorite[0].userId, "cy");
  assert.equal(Object.keys(result.gamePicks).length, 4);
});
test("signed-out visitors get no board picks", () => {
  const { s, w } = league();
  assert.deepEqual(view(s, null, 1, false, deadline(w)).gamePicks, {});
});
test("gamePicks orders the viewer first and skips unknown members", () => {
  const { s, w } = league();
  const grouped = gamePicks(s.entries, s.users, "bea");
  assert.equal(grouped[w.games[0].id].favorite[0].userId, "ada");
  assert.deepEqual(
    grouped[w.games[4].id].favorite.map((p) => p.userId),
    ["bea"],
  );
  const orphan = gamePicks(s.entries, [], "ada");
  assert.deepEqual(orphan, {});
});
test("the pick-share denominator counts exactly the cards behind gamePicks", () => {
  const { s, w, ada, cy } = league();
  // Cy's buy-in is pending: after the reveal Cy sees the two confirmed cards plus their own.
  const pending = view(s, cy, 1, false, deadline(w));
  const pickers = new Set(
    Object.values(pending.gamePicks)
      .flatMap((slots) => Object.values(slots).flat())
      .map((p) => p.userId),
  );
  assert.deepEqual([...pickers].sort(), ["ada", "bea", "cy"]);
  assert.equal(pending.pickCardCount, 3);
  assert.equal(pending.standings.filter((member) => member.submitted).length, 2);
  // Confirmed viewers never see the pending card, and the count matches.
  const confirmed = view(s, ada, 1, false, deadline(w));
  assert.equal(confirmed.pickCardCount, 2);
  assert.ok(!JSON.stringify(confirmed.gamePicks).includes("cy"));
  // Before any kickoff only the viewer's own card counts.
  assert.equal(view(s, ada, 1, false, now + 1).pickCardCount, 1);
  assert.equal(view(s, null, 1, false, deadline(w)).pickCardCount, 0);
});
