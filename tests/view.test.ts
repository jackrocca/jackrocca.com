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
test("before the deadline a member sees only their own picks on the board", () => {
  const { s, w, ada } = league();
  const result = view(s, ada, 1, false, deadline(w) - 1);
  assert.equal(result.week.picksRevealed, false);
  const pickers = Object.values(result.gamePicks).flatMap((slots) =>
    Object.values(slots).flat(),
  );
  assert.ok(pickers.length === 4);
  assert.ok(pickers.every((p) => p.userId === "ada"));
  assert.ok(!JSON.stringify(result.gamePicks).includes("bea"));
  assert.equal(result.gamePicks[w.games[0].id].favorite[0].name, "Ada");
  assert.deepEqual(result.gamePicks[w.games[0].id].underdog, []);
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
  const result = view(s, cy, 1, false, deadline(w) - 1);
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
  // Before the reveal only the viewer's own card counts.
  assert.equal(view(s, ada, 1, false, deadline(w) - 1).pickCardCount, 1);
  assert.equal(view(s, null, 1, false, deadline(w)).pickCardCount, 0);
});
