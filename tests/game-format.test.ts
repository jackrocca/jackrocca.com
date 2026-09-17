import test from "node:test";
import assert from "node:assert/strict";
import { fieldPosition } from "../lib/field-position";
import { periodName, quarterLabel } from "../lib/game-format";
import { gameLine, slotLine } from "../lib/lines";
import { initialState } from "../lib/store";
import { publishWeek } from "../lib/rules";
test("field position puts the ball the right distance from the target end zone", () => {
  // Home drives left: 18 yards out sits 18% from the left edge; first down 7 yards further.
  assert.deepEqual(
    fieldPosition({ possession: "home", yardsToEndzone: 18, distance: 7 }),
    { direction: "left", ballX: 18, firstDownX: 11 },
  );
  // Away drives right: own 4 (96 to go) sits 4% from the left edge.
  assert.deepEqual(
    fieldPosition({ possession: "away", yardsToEndzone: 96, distance: 10 }),
    { direction: "right", ballX: 4, firstDownX: 14 },
  );
  // Goal to go: no first-down marker; unknown possession draws nothing.
  assert.equal(
    fieldPosition({ possession: "away", yardsToEndzone: 3, distance: 3 }).firstDownX,
    null,
  );
  assert.deepEqual(
    fieldPosition({ possession: null, yardsToEndzone: 50, distance: 10 }),
    {
      direction: "none",
      ballX: null,
      firstDownX: null,
    },
  );
  assert.equal(
    fieldPosition({ possession: "home", yardsToEndzone: 120, distance: null }).ballX,
    100,
  );
});
test("period labels cover regulation and overtime", () => {
  assert.equal(quarterLabel(1), "Q1");
  assert.equal(quarterLabel(5), "OT");
  assert.equal(quarterLabel(6), "OT2");
  assert.equal(quarterLabel(null), "");
  assert.equal(periodName(2), "2nd quarter");
  assert.equal(periodName(3), "3rd quarter");
  assert.equal(periodName(5), "Overtime");
  assert.equal(periodName(6), "2nd overtime");
});
test("slot lines name the favorite, underdog, and totals from the frozen line", () => {
  const s = initialState(),
    w = s.weeks[0];
  const game = w.games[0];
  // Preview line before publication, frozen snapshot after.
  const preview = gameLine(w, game.id);
  assert.equal(preview?.homeSpread, game.homeSpread);
  publishWeek(w, Date.parse("2026-09-08T20:00:00Z"));
  game.homeSpread = -22;
  const frozen = gameLine(w, game.id)!;
  assert.equal(frozen.homeSpread, preview?.homeSpread);
  const favorite = frozen.homeSpread! < 0 ? game.home : game.away;
  const underdog = favorite === game.home ? game.away : game.home;
  assert.equal(
    slotLine(game, frozen, "favorite"),
    `${favorite.abbreviation} -${Math.abs(frozen.homeSpread!)}`,
  );
  assert.equal(
    slotLine(game, frozen, "underdog"),
    `${underdog.abbreviation} +${Math.abs(frozen.homeSpread!)}`,
  );
  assert.equal(slotLine(game, frozen, "over"), `O ${frozen.total}`);
  assert.equal(slotLine(game, frozen, "under"), `U ${frozen.total}`);
  assert.equal(
    slotLine(game, { homeSpread: 0, total: null, provider: null }, "favorite"),
    null,
  );
  assert.equal(slotLine(game, null, "over"), null);
  assert.equal(gameLine(w, "missing"), null);
});
test("period 0 (pregame in ESPN payloads) renders no label", () => {
  assert.equal(quarterLabel(0), "");
  assert.equal(periodName(0), "");
  assert.equal(periodName(-1), "");
});
