import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { parseGameSummary } from "../lib/game-summary";
import { loadGameDetail, resetGameDetailCache } from "../lib/game-detail";
const fixture = (name: string) =>
  JSON.parse(readFileSync(new URL(`./fixtures/${name}.json`, import.meta.url), "utf8"));
test("a final summary yields scores, leaders, sorted box score, drives, and scoring", () => {
  const summary = parseGameSummary(fixture("espn-summary-final"), new Date(0));
  assert.equal(summary.id, "401872656");
  assert.equal(summary.state, "final");
  assert.equal(summary.fetchedAt, "1970-01-01T00:00:00.000Z");
  assert.equal(summary.home.abbreviation, "SEA");
  assert.equal(summary.home.score, 13);
  assert.equal(summary.away.score, 10);
  assert.deepEqual(summary.home.linescores, ["0", "0", "3", "10"]);
  assert.equal(summary.home.record, "1-0");
  assert.deepEqual(
    summary.home.leaders.map((l) => l.label),
    ["Passing", "Rushing", "Receiving"],
  );
  assert.equal(summary.home.leaders[0].player, "Drew Lock");
  const passing = summary.home.box.find((b) => b.key === "passing")!;
  assert.equal(passing.columns[1], "YDS");
  assert.equal(passing.players[0].name, "Drew Lock");
  assert.ok(Number(passing.players[0].stats[1]) >= Number(passing.players[1].stats[1]));
  assert.equal(passing.totals.length, passing.columns.length);
  assert.ok(summary.drives.length > 0);
  assert.ok(summary.drives.every((d) => !d.current));
  assert.ok(summary.drives.every((d) => typeof d.period === "number"));
  assert.equal(summary.situation, null);
  assert.ok(summary.scoring.length > 0);
  assert.equal(summary.scoring[0].type, "TD");
  assert.deepEqual(summary.available, {
    situation: false,
    drives: true,
    boxscore: true,
    scoring: true,
  });
});
test("a pregame summary reports every live section as unavailable", () => {
  const raw = fixture("espn-summary-pregame");
  // ESPN lists season leaders before kickoff; they must not read as game stats.
  raw.leaders = [
    {
      team: { id: raw.header.competitions[0].competitors[0].team.id },
      leaders: [
        {
          name: "passingYards",
          displayName: "Passing Yards",
          leaders: [
            { displayValue: "300 YDS", athlete: { id: "1", displayName: "Someone" } },
          ],
        },
      ],
    },
  ];
  const summary = parseGameSummary(raw);
  assert.equal(summary.state, "pre");
  assert.equal(summary.home.score, null);
  assert.deepEqual(summary.home.box, []);
  assert.deepEqual(summary.home.leaders, []);
  assert.deepEqual(summary.available, {
    situation: false,
    drives: false,
    boxscore: false,
    scoring: false,
  });
});
function liveFixture() {
  const raw = fixture("espn-summary-final");
  const competition = raw.header.competitions[0];
  competition.status = {
    type: {
      name: "STATUS_IN_PROGRESS",
      state: "in",
      completed: false,
      shortDetail: "8:12 - 3rd",
    },
    period: 3,
    displayClock: "8:12",
  };
  competition.competitors.find(
    (c: { homeAway: string }) => c.homeAway === "home",
  ).possession = true;
  raw.drives.current = {
    id: "current",
    description: "4 plays, 38 yards, 1:51",
    team: { id: "26", abbreviation: "SEA" },
    start: { text: "SEA 25" },
    timeElapsed: { displayValue: "1:51" },
    yards: 38,
    offensivePlays: 4,
    isScore: false,
    plays: [
      {
        id: "p1",
        text: "Drew Lock pass complete for 12 yards.",
        end: { yardsToEndzone: 45 },
      },
      {
        id: "p2",
        text: "Jadarian Price rush for 26 yards to the NE 19.",
        end: {
          down: 1,
          distance: 10,
          yardsToEndzone: 19,
          shortDownDistanceText: "1st & 10",
          downDistanceText: "1st & 10 at NE 19",
          possessionText: "NE 19",
          team: { id: "26" },
        },
      },
    ],
  };
  return raw;
}
test("a live summary derives the situation from the current drive", () => {
  const summary = parseGameSummary(liveFixture());
  assert.equal(summary.state, "live");
  assert.equal(summary.period, 3);
  assert.equal(summary.clock, "8:12");
  assert.equal(summary.home.possession, true);
  assert.ok(summary.situation);
  assert.equal(summary.situation.possessionTeamId, "26");
  assert.equal(summary.situation.downDistance, "1st & 10");
  assert.equal(summary.situation.ballOn, "NE 19");
  assert.equal(summary.situation.down, 1);
  assert.equal(summary.situation.distance, 10);
  assert.equal(summary.situation.yardsToEndzone, 19);
  assert.equal(summary.situation.redZone, true);
  assert.equal(
    summary.situation.lastPlay,
    "Jadarian Price rush for 26 yards to the NE 19.",
  );
  assert.deepEqual(
    { plays: summary.situation.drive?.plays, yards: summary.situation.drive?.yards },
    { plays: 4, yards: 38 },
  );
  assert.equal(summary.drives[0].current, true);
  assert.equal(summary.drives[0].result, null);
  assert.equal(summary.available.situation, true);
});
test("an explicit situation block wins over the drive-derived fallback", () => {
  const raw = liveFixture();
  raw.header.competitions[0].situation = {
    downDistanceText: "3rd & 2 at NE 4",
    shortDownDistanceText: "3rd & 2",
    possessionText: "NE 4",
    isRedZone: false,
    possession: "17",
    down: 3,
    distance: 2,
    yardLine: 96,
    homeTimeouts: 2,
    awayTimeouts: 3,
    lastPlay: { text: "Timeout Seahawks." },
  };
  delete raw.drives.current.plays;
  const summary = parseGameSummary(raw);
  assert.equal(summary.situation?.possessionTeamId, "17");
  assert.equal(summary.situation?.downDistance, "3rd & 2");
  assert.equal(summary.situation?.lastPlay, "Timeout Seahawks.");
  // Away team (NE) backed up at its own 4: yard lines count from the home goal line.
  assert.equal(summary.situation?.yardsToEndzone, 96);
  assert.equal(summary.home.timeouts, 2);
  assert.equal(summary.away.timeouts, 3);
});
test("a live game without any drive data shows the situation as unavailable", () => {
  const raw = liveFixture();
  delete raw.drives;
  const summary = parseGameSummary(raw);
  assert.equal(summary.state, "live");
  assert.equal(summary.situation, null);
  assert.equal(summary.available.situation, false);
  assert.equal(summary.available.drives, false);
});
test("game detail caches briefly and serves the last update when the feed fails", async () => {
  resetGameDetailCache();
  let calls = 0;
  const fetcher = async () => {
    calls++;
    if (calls > 1) throw new Error("ESPN is down");
    return parseGameSummary(liveFixture());
  };
  const first = await loadGameDetail("401872656", fetcher, 1_000);
  assert.equal(first.stale, false);
  assert.equal(calls, 1);
  // Inside the live TTL nothing is refetched.
  await loadGameDetail("401872656", fetcher, 10_000);
  assert.equal(calls, 1);
  const stale = await loadGameDetail("401872656", fetcher, 60_000);
  assert.equal(calls, 2);
  assert.equal(stale.stale, true);
  assert.equal(stale.summary.id, first.summary.id);
  assert.match(stale.error ?? "", /last update/);
  resetGameDetailCache();
  await assert.rejects(() => loadGameDetail("401872656", fetcher, 90_000), /unavailable/);
});
test("malformed summaries are rejected instead of fabricated", () => {
  assert.throws(() => parseGameSummary({}));
  assert.throws(() => parseGameSummary({ header: { id: "1", competitions: [] } }));
});
