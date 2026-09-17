import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { parseGameSummary } from "../lib/game-summary";
import { displayScores } from "../lib/game-scores";
import { initialState } from "../lib/store";
import type { Game } from "../lib/types";
const summary = () =>
  parseGameSummary(
    JSON.parse(
      readFileSync(
        new URL("./fixtures/espn-summary-final.json", import.meta.url),
        "utf8",
      ),
    ),
  );
function game(overrides: Partial<Game> = {}): Game {
  return {
    ...initialState().weeks[0].games[0],
    state: "final",
    awayScore: 10,
    homeScore: 13,
    ...overrides,
  };
}
test("a commissioner correction wins over the ESPN summary", () => {
  const corrected = game({
    awayScore: 17,
    homeScore: 13,
    resultOverride: { awayScore: 17, homeScore: 13, state: "final", reason: "Stat fix" },
  });
  assert.deepEqual(displayScores(corrected, summary()), {
    awayScore: 17,
    homeScore: 13,
    source: "league",
  });
});
test("a final summary is used for a final game, never a summary that lags the league", () => {
  const final = summary();
  assert.deepEqual(displayScores(game(), final), {
    awayScore: 10,
    homeScore: 13,
    source: "summary",
  });
  const stale = { ...final, state: "live" as const };
  stale.home.score = 6;
  assert.deepEqual(displayScores(game(), stale), {
    awayScore: 10,
    homeScore: 13,
    source: "league",
  });
});
test("live games take the fresher summary score; missing or void games keep the league record", () => {
  const live = { ...summary(), state: "live" as const };
  live.away.score = 3;
  live.home.score = 0;
  assert.equal(
    displayScores(game({ state: "live", awayScore: 0, homeScore: 0 }), live).awayScore,
    3,
  );
  assert.equal(displayScores(game(), null).source, "league");
  assert.equal(
    displayScores(game({ state: "canceled", awayScore: null, homeScore: null }), live)
      .awayScore,
    null,
  );
  const partial = { ...summary() };
  partial.home.score = null;
  assert.equal(displayScores(game(), partial).source, "league");
});
