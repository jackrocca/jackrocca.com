import { z } from "zod";
// ESPN's public event summary. Everything beyond the header is optional: pregame
// payloads omit drives and box scores, and live fields vary by game state. The
// parser keeps what it can prove and reports the rest as unavailable.
const clock = z.object({ displayValue: z.string().optional() }).loose();
const period = z.object({ number: z.number().optional() }).loose();
const spot = z
  .object({
    down: z.number().optional(),
    distance: z.number().optional(),
    yardLine: z.number().optional(),
    yardsToEndzone: z.number().optional(),
    downDistanceText: z.string().optional(),
    shortDownDistanceText: z.string().optional(),
    possessionText: z.string().optional(),
    team: z.object({ id: z.string().optional() }).loose().optional(),
  })
  .loose();
const playSchema = z
  .object({
    id: z.string(),
    text: z.string().optional(),
    type: z
      .object({ text: z.string().optional(), abbreviation: z.string().optional() })
      .loose()
      .optional(),
    period: period.optional(),
    clock: clock.optional(),
    scoringPlay: z.boolean().optional(),
    start: spot.optional(),
    end: spot.optional(),
  })
  .loose();
const driveSchema = z
  .object({
    id: z.string(),
    description: z.string().optional(),
    team: z
      .object({ id: z.string().optional(), abbreviation: z.string().optional() })
      .loose()
      .optional(),
    start: z
      .object({
        period: period.optional(),
        clock: clock.optional(),
        text: z.string().optional(),
      })
      .loose()
      .optional(),
    end: z
      .object({
        period: period.optional(),
        clock: clock.optional(),
        text: z.string().optional(),
      })
      .loose()
      .optional(),
    timeElapsed: clock.optional(),
    yards: z.number().optional(),
    offensivePlays: z.number().optional(),
    isScore: z.boolean().optional(),
    result: z.string().optional(),
    displayResult: z.string().optional(),
    plays: z.array(playSchema).optional(),
  })
  .loose();
const situationSchema = z
  .object({
    down: z.number().optional(),
    distance: z.number().optional(),
    yardLine: z.number().optional(),
    downDistanceText: z.string().optional(),
    shortDownDistanceText: z.string().optional(),
    possessionText: z.string().optional(),
    isRedZone: z.boolean().optional(),
    possession: z.string().optional(),
    homeTimeouts: z.number().optional(),
    awayTimeouts: z.number().optional(),
    lastPlay: z.object({ text: z.string().optional() }).loose().optional(),
  })
  .loose();
const competitorSchema = z
  .object({
    id: z.string(),
    homeAway: z.enum(["home", "away"]),
    score: z.string().optional(),
    winner: z.boolean().optional(),
    possession: z.boolean().optional(),
    timeouts: z.number().optional(),
    linescores: z
      .array(z.object({ displayValue: z.string().optional() }).loose())
      .optional(),
    record: z
      .array(
        z.object({ type: z.string().optional(), summary: z.string().optional() }).loose(),
      )
      .optional(),
    team: z
      .object({
        id: z.string(),
        abbreviation: z.string(),
        displayName: z.string(),
        name: z.string().optional(),
        location: z.string().optional(),
        color: z.string().optional(),
      })
      .loose(),
  })
  .loose();
const athleteSchema = z
  .object({
    athlete: z
      .object({
        id: z.string(),
        displayName: z.string(),
        jersey: z.string().optional(),
        position: z.object({ abbreviation: z.string().optional() }).loose().optional(),
      })
      .loose(),
    stats: z.array(z.string()),
  })
  .loose();
const summarySchema = z
  .object({
    header: z
      .object({
        id: z.string(),
        competitions: z
          .array(
            z
              .object({
                id: z.string(),
                date: z.string().optional(),
                competitors: z.array(competitorSchema),
                status: z
                  .object({
                    type: z
                      .object({
                        name: z.string(),
                        state: z.string(),
                        completed: z.boolean(),
                        detail: z.string().optional(),
                        shortDetail: z.string().optional(),
                      })
                      .loose(),
                    period: z.number().optional(),
                    displayClock: z.string().optional(),
                  })
                  .loose(),
                situation: situationSchema.optional(),
              })
              .loose(),
          )
          .min(1),
      })
      .loose(),
    situation: situationSchema.optional(),
    drives: z
      .object({
        current: driveSchema.optional(),
        previous: z.array(driveSchema).optional(),
      })
      .loose()
      .optional(),
    boxscore: z
      .object({
        players: z
          .array(
            z
              .object({
                team: z
                  .object({ id: z.string(), abbreviation: z.string().optional() })
                  .loose(),
                statistics: z.array(
                  z
                    .object({
                      name: z.string(),
                      text: z.string().optional(),
                      labels: z.array(z.string()).optional(),
                      keys: z.array(z.string()).optional(),
                      totals: z.array(z.string()).optional(),
                      athletes: z.array(athleteSchema).optional(),
                    })
                    .loose(),
                ),
              })
              .loose(),
          )
          .optional(),
      })
      .loose()
      .optional(),
    scoringPlays: z
      .array(
        z
          .object({
            id: z.string(),
            text: z.string().optional(),
            type: z
              .object({
                text: z.string().optional(),
                abbreviation: z.string().optional(),
              })
              .loose()
              .optional(),
            awayScore: z.number().optional(),
            homeScore: z.number().optional(),
            period: period.optional(),
            clock: clock.optional(),
            team: z.object({ id: z.string().optional() }).loose().optional(),
          })
          .loose(),
      )
      .optional(),
    leaders: z
      .array(
        z
          .object({
            team: z.object({ id: z.string() }).loose(),
            leaders: z
              .array(
                z
                  .object({
                    name: z.string(),
                    displayName: z.string().optional(),
                    leaders: z
                      .array(
                        z
                          .object({
                            displayValue: z.string().optional(),
                            athlete: z
                              .object({
                                id: z.string(),
                                displayName: z.string(),
                                position: z
                                  .object({ abbreviation: z.string().optional() })
                                  .loose()
                                  .optional(),
                              })
                              .loose(),
                          })
                          .loose(),
                      )
                      .optional(),
                  })
                  .loose(),
              )
              .optional(),
          })
          .loose(),
      )
      .optional(),
  })
  .loose();
export const BOX_CATEGORIES = ["passing", "rushing", "receiving"] as const;
export type BoxCategoryKey = (typeof BOX_CATEGORIES)[number];
export type BoxPlayer = {
  id: string;
  name: string;
  jersey: string | null;
  position: string | null;
  stats: string[];
};
export type BoxCategory = {
  key: BoxCategoryKey;
  label: string;
  columns: string[];
  players: BoxPlayer[];
  totals: string[];
};
export type TeamLeader = {
  key: string;
  label: string;
  player: string;
  position: string | null;
  line: string;
};
export type TeamSummary = {
  id: string;
  abbreviation: string;
  name: string;
  score: number | null;
  linescores: string[];
  record: string | null;
  possession: boolean;
  timeouts: number | null;
  leaders: TeamLeader[];
  box: BoxCategory[];
};
export type DriveSummary = {
  id: string;
  teamId: string | null;
  period: number | null;
  description: string | null;
  result: string | null;
  plays: number | null;
  yards: number | null;
  time: string | null;
  start: string | null;
  end: string | null;
  score: boolean;
  current: boolean;
};
export type GameSituation = {
  possessionTeamId: string | null;
  down: number | null;
  distance: number | null;
  downDistance: string | null;
  ballOn: string | null;
  /** Yards from the ball to the end zone the possessing team is driving toward. */
  yardsToEndzone: number | null;
  redZone: boolean | null;
  lastPlay: string | null;
  drive: DriveSummary | null;
};
export type ScoringPlay = {
  id: string;
  teamId: string | null;
  type: string;
  text: string;
  period: number | null;
  clock: string | null;
  awayScore: number | null;
  homeScore: number | null;
};
export type GameSummary = {
  id: string;
  fetchedAt: string;
  state: "pre" | "live" | "final";
  detail: string;
  period: number | null;
  clock: string | null;
  home: TeamSummary;
  away: TeamSummary;
  situation: GameSituation | null;
  drives: DriveSummary[];
  scoring: ScoringPlay[];
  available: { situation: boolean; drives: boolean; boxscore: boolean; scoring: boolean };
};
const categoryLabels: Record<BoxCategoryKey, string> = {
  passing: "Passing",
  rushing: "Rushing",
  receiving: "Receiving",
};
const leaderLabels: Record<string, string> = {
  passingYards: "Passing",
  rushingYards: "Rushing",
  receivingYards: "Receiving",
};
const number = (value: string | undefined) =>
  value !== undefined && value !== "" && Number.isFinite(Number(value))
    ? Number(value)
    : null;
function drive(raw: z.infer<typeof driveSchema>, current: boolean): DriveSummary {
  return {
    id: raw.id,
    teamId: raw.team?.id ?? null,
    period: raw.start?.period?.number ?? null,
    description: raw.description ?? null,
    result: current ? null : (raw.displayResult ?? raw.result ?? null),
    plays: raw.offensivePlays ?? null,
    yards: raw.yards ?? null,
    time: raw.timeElapsed?.displayValue ?? null,
    start: raw.start?.text ?? null,
    end: current ? null : (raw.end?.text ?? null),
    score: raw.isScore ?? false,
    current,
  };
}
export function parseGameSummary(raw: unknown, fetchedAt = new Date()): GameSummary {
  const data = summarySchema.parse(raw);
  const competition = data.header.competitions[0];
  const homeRaw = competition.competitors.find((c) => c.homeAway === "home");
  const awayRaw = competition.competitors.find((c) => c.homeAway === "away");
  if (!homeRaw || !awayRaw) throw new Error("Summary is missing a competitor.");
  const status = competition.status.type;
  const state: GameSummary["state"] = status.completed
    ? "final"
    : status.state === "in"
      ? "live"
      : "pre";
  const players = data.boxscore?.players ?? [];
  const team = (raw: typeof homeRaw): TeamSummary => {
    const teamId = raw.team.id;
    const box: BoxCategory[] = [];
    const stats = players.find((p) => p.team.id === teamId)?.statistics ?? [];
    for (const key of BOX_CATEGORIES) {
      const category = stats.find((s) => s.name === key);
      if (!category || !category.athletes?.length) continue;
      const columns = category.labels ?? [];
      const yards = columns.indexOf("YDS");
      const rows = category.athletes
        .map((a) => ({
          id: a.athlete.id,
          name: a.athlete.displayName,
          jersey: a.athlete.jersey ?? null,
          position: a.athlete.position?.abbreviation ?? null,
          stats: a.stats,
        }))
        .sort((a, b) =>
          yards === -1
            ? 0
            : (number(b.stats[yards]) ?? 0) - (number(a.stats[yards]) ?? 0),
        );
      box.push({
        key,
        label: categoryLabels[key],
        columns,
        players: rows,
        totals: category.totals ?? [],
      });
    }
    const leaders: TeamLeader[] = [];
    // Pregame payloads carry season leaders, which are not this game's numbers.
    const groups =
      state === "pre"
        ? []
        : (data.leaders?.find((l) => l.team.id === teamId)?.leaders ?? []);
    for (const group of groups) {
      const label = leaderLabels[group.name];
      const top = group.leaders?.[0];
      if (!label || !top?.displayValue) continue;
      leaders.push({
        key: group.name,
        label,
        player: top.athlete.displayName,
        position: top.athlete.position?.abbreviation ?? null,
        line: top.displayValue,
      });
    }
    return {
      id: teamId,
      abbreviation: raw.team.abbreviation,
      name: raw.team.displayName,
      score: state === "pre" ? null : number(raw.score),
      linescores: (raw.linescores ?? []).map((l) => l.displayValue ?? "-"),
      record: raw.record?.find((r) => r.type === "total")?.summary ?? null,
      possession: raw.possession ?? false,
      timeouts: raw.timeouts ?? null,
      leaders,
      box,
    };
  };
  const home = team(homeRaw),
    away = team(awayRaw);
  const current = data.drives?.current ? drive(data.drives.current, true) : null;
  const drives = [
    ...(current ? [current] : []),
    ...(data.drives?.previous ?? []).map((d) => drive(d, false)).reverse(),
  ].slice(0, 40);
  let situation: GameSituation | null = null;
  if (state === "live") {
    const live = competition.situation ?? data.situation;
    const plays = data.drives?.current?.plays ?? [];
    const last = plays[plays.length - 1];
    const spot = last?.end;
    const possessionTeamId =
      live?.possession ??
      spot?.team?.id ??
      (homeRaw.possession ? home.id : awayRaw.possession ? away.id : null);
    if (live || last) {
      // ESPN yard lines count from the home goal line, so the distance to the
      // target end zone depends on who has the ball.
      const yardLine = live?.yardLine ?? spot?.yardLine;
      const yardsToEndzone =
        spot?.yardsToEndzone ??
        (yardLine !== undefined && possessionTeamId
          ? possessionTeamId === home.id
            ? 100 - yardLine
            : yardLine
          : null);
      situation = {
        possessionTeamId: possessionTeamId ?? null,
        down: live?.down ?? spot?.down ?? null,
        distance: live?.distance ?? spot?.distance ?? null,
        yardsToEndzone,
        downDistance:
          live?.shortDownDistanceText ??
          live?.downDistanceText ??
          spot?.shortDownDistanceText ??
          spot?.downDistanceText ??
          null,
        ballOn: live?.possessionText ?? spot?.possessionText ?? null,
        redZone:
          live?.isRedZone ??
          (spot?.yardsToEndzone !== undefined ? spot.yardsToEndzone <= 20 : null),
        lastPlay: live?.lastPlay?.text ?? last?.text ?? null,
        drive: current,
      };
      if (live?.homeTimeouts !== undefined) home.timeouts = live.homeTimeouts;
      if (live?.awayTimeouts !== undefined) away.timeouts = live.awayTimeouts;
    }
  }
  const scoring: ScoringPlay[] = (data.scoringPlays ?? []).map((p) => ({
    id: p.id,
    teamId: p.team?.id ?? null,
    type: p.type?.abbreviation ?? p.type?.text ?? "Score",
    text: p.text ?? "",
    period: p.period?.number ?? null,
    clock: p.clock?.displayValue ?? null,
    awayScore: p.awayScore ?? null,
    homeScore: p.homeScore ?? null,
  }));
  return {
    id: data.header.id,
    fetchedAt: fetchedAt.toISOString(),
    state,
    detail: status.shortDetail ?? status.detail ?? "",
    period: competition.status.period ?? null,
    clock: competition.status.displayClock ?? null,
    home,
    away,
    situation,
    drives,
    scoring,
    available: {
      situation: situation !== null,
      drives: drives.length > 0,
      boxscore: home.box.length > 0 || away.box.length > 0,
      scoring: scoring.length > 0,
    },
  };
}
export async function fetchGameSummary(eventId: string) {
  const response = await fetch(
    `https://site.api.espn.com/apis/site/v2/sports/football/nfl/summary?event=${encodeURIComponent(eventId)}`,
    { cache: "no-store", signal: AbortSignal.timeout(10_000) },
  );
  if (!response.ok) throw new Error(`Game summary provider returned ${response.status}.`);
  const summary = parseGameSummary(await response.json());
  if (summary.id !== eventId) throw new Error("Game summary did not match the request.");
  return summary;
}
