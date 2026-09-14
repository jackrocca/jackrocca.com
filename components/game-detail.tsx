"use client";
import { useEffect, useState } from "react";
import { LockKeyhole } from "lucide-react";
import { ResponsiveDialog } from "@/ui/components/ResponsiveDialog";
import { SegmentedControl } from "@/ui/components/SegmentedControl";
import { TabPanels } from "@/ui/components/TabPanels";
import { PlayerAvatar } from "@/components/player-avatar";
import { TeamMark } from "@/components/team-mark";
import { FieldStrip } from "@/components/field-strip";
import { labels, slotIcons } from "@/components/league-meta";
import { pickerNames } from "@/components/pick-avatars";
import type { GameDetail } from "@/lib/game-detail";
import type {
  DriveSummary,
  GameSummary,
  ScoringPlay,
  TeamSummary,
} from "@/lib/game-summary";
import { signed } from "@/lib/rules";
import { PICK_TYPES, PickType, type Game, type Team } from "@/lib/types";
import type { GamePicker } from "@/lib/view";

export type GameLine = {
  homeSpread: number | null;
  total: number | null;
  provider: string | null;
};

const clock = (value: string | number) =>
  new Date(value).toLocaleString("en-US", {
    timeZone: "America/Los_Angeles",
    hour: "numeric",
    minute: "2-digit",
  });
const day = (value: string | number) =>
  new Date(value).toLocaleString("en-US", {
    timeZone: "America/Los_Angeles",
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
const quarter = (n: number | null) =>
  n === null ? "" : n <= 4 ? `Q${n}` : n === 5 ? "OT" : `OT${n - 4}`;

function status(game: Game, summary: GameSummary | null) {
  if (game.state === "final")
    return {
      label: summary?.detail === "Final/OT" ? "Final · OT" : "Final",
      live: false,
    };
  if (game.state === "live") {
    const detail =
      summary?.state === "live" && summary.clock && summary.period
        ? `${quarter(summary.period)} · ${summary.clock}`
        : summary?.state === "live" && summary.detail
          ? summary.detail
          : game.detail || "Live";
    return { label: detail, live: true };
  }
  if (game.state === "postponed") return { label: "Postponed", live: false };
  if (game.state === "canceled") return { label: "Canceled", live: false };
  return {
    label: game.timeConfirmed ? `${day(game.kickoff)} PT` : "Kickoff TBD",
    live: false,
  };
}

function Timeouts({ count }: { count: number | null }) {
  if (count === null) return null;
  return (
    <span className="gs-timeouts" aria-label={`${count} timeouts left`}>
      {[0, 1, 2].map((i) => (
        <i key={i} className={i < count ? "on" : ""} />
      ))}
    </span>
  );
}

function Side({
  team,
  summary,
  possession,
  redZone,
  live,
  muted,
}: {
  team: Team;
  summary: TeamSummary | undefined;
  possession: boolean;
  redZone: boolean;
  live: boolean;
  muted: boolean;
}) {
  return (
    <div className={`gs-side ${muted ? "muted" : ""} ${possession ? "has-ball" : ""}`}>
      <span className="gs-mark">
        <TeamMark team={team} />
        {possession && (
          <span
            className={`gs-ball ${redZone ? "red-zone" : ""}`}
            role="img"
            aria-label={`${team.abbreviation} has the ball${redZone ? " in the red zone" : ""}`}
          />
        )}
      </span>
      <strong>{team.abbreviation}</strong>
      <small>{summary?.record ?? team.short}</small>
      {live && <Timeouts count={summary?.timeouts ?? null} />}
    </div>
  );
}

function LineStrip({
  line,
  published,
  game,
}: {
  line: GameLine | null;
  published: boolean;
  game: Game;
}) {
  const spread = line?.homeSpread ?? null,
    total = line?.total ?? null;
  const favorite = spread !== null && spread < 0 ? game.home : game.away;
  return (
    <dl className="gs-line">
      <div>
        <dt>Spread</dt>
        <dd>
          {spread === null || spread === 0
            ? "—"
            : `${favorite.abbreviation} ${signed(-Math.abs(spread))}`}
        </dd>
      </div>
      <div>
        <dt>Total</dt>
        <dd>{total === null ? "—" : total}</dd>
      </div>
      <div>
        <dt>{published ? "Frozen" : "Preview"}</dt>
        <dd>{line?.provider ?? (published ? "League" : "Unpublished")}</dd>
      </div>
    </dl>
  );
}

function LineScores({ away, home }: { away: TeamSummary; home: TeamSummary }) {
  const periods = Math.max(away.linescores.length, home.linescores.length);
  if (!periods) return null;
  return (
    <table className="gs-periods">
      <thead>
        <tr>
          <th scope="col">
            <span className="sr-only">Team</span>
          </th>
          {Array.from({ length: periods }, (_, i) => (
            <th scope="col" key={i}>
              {quarter(i + 1)}
            </th>
          ))}
          <th scope="col">T</th>
        </tr>
      </thead>
      <tbody>
        {[away, home].map((team) => (
          <tr key={team.id}>
            <th scope="row">{team.abbreviation}</th>
            {Array.from({ length: periods }, (_, i) => (
              <td key={i}>{team.linescores[i] ?? "–"}</td>
            ))}
            <td>
              <b>{team.score ?? "–"}</b>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function teamFor(game: Game, id: string | null) {
  return id === game.home.id ? game.home : id === game.away.id ? game.away : null;
}

function Leaders({ summary, game }: { summary: GameSummary; game: Game }) {
  const keys = ["passingYards", "rushingYards", "receivingYards"];
  const rows = keys
    .map((key) => ({
      key,
      away: summary.away.leaders.find((l) => l.key === key),
      home: summary.home.leaders.find((l) => l.key === key),
    }))
    .filter((row) => row.away || row.home);
  if (!rows.length) return null;
  return (
    <section className="gs-section" aria-label="Top performers">
      <h3>Top performers</h3>
      <ul className="gs-leaders">
        {rows.map((row) => (
          <li key={row.key}>
            <small>{(row.away ?? row.home)!.label}</small>
            {[
              { leader: row.away, team: game.away },
              { leader: row.home, team: game.home },
            ].map(({ leader, team }) => (
              <div
                key={team.id}
                className="gs-leader"
                style={{ ["--team" as string]: team.color }}
              >
                {leader ? (
                  <>
                    <strong>
                      {leader.player}
                      <span>
                        {" "}
                        {team.abbreviation}
                        {leader.position ? ` · ${leader.position}` : ""}
                      </span>
                    </strong>
                    <span>{leader.line}</span>
                  </>
                ) : (
                  <span>—</span>
                )}
              </div>
            ))}
          </li>
        ))}
      </ul>
    </section>
  );
}

function ScoringList({ plays, game }: { plays: ScoringPlay[]; game: Game }) {
  const groups = new Map<string, ScoringPlay[]>();
  for (const play of plays) {
    const key = quarter(play.period) || "Scoring";
    groups.set(key, [...(groups.get(key) ?? []), play]);
  }
  return (
    <section className="gs-section" aria-label="Scoring summary">
      <h3>Scoring</h3>
      {[...groups.entries()].map(([label, items]) => (
        <div className="gs-group" key={label}>
          <h4>
            {label === "Scoring"
              ? ""
              : `${label.replace("Q", "")}${/^Q/.test(label) ? ordinal(Number(label.slice(1))) : ""} quarter`}
          </h4>
          <ol>
            {items.map((play) => {
              const team = teamFor(game, play.teamId);
              return (
                <li key={play.id}>
                  <span className={`gs-chip ${play.type === "TD" ? "td" : ""}`}>
                    {play.type}
                  </span>
                  <span className="gs-play">
                    <b>{team?.abbreviation ?? "—"}</b>
                    {play.clock && <small> {play.clock}</small>}
                    <span>{play.text}</span>
                  </span>
                  {play.awayScore !== null && play.homeScore !== null && (
                    <b className="gs-running">
                      {play.awayScore}–{play.homeScore}
                    </b>
                  )}
                </li>
              );
            })}
          </ol>
        </div>
      ))}
    </section>
  );
}
const ordinal = (n: number) => (n === 1 ? "st" : n === 2 ? "nd" : n === 3 ? "rd" : "th");

function Drives({ drives, game }: { drives: DriveSummary[]; game: Game }) {
  const groups = new Map<string, DriveSummary[]>();
  for (const drive of drives) {
    const key = quarter(drive.period) || "Drives";
    groups.set(key, [...(groups.get(key) ?? []), drive]);
  }
  return (
    <section className="gs-section" aria-label="Drives">
      {[...groups.entries()].map(([label, items]) => (
        <div className="gs-group" key={label}>
          {label !== "Drives" && (
            <h4>
              {/^Q/.test(label)
                ? `${label.slice(1)}${ordinal(Number(label.slice(1)))} quarter`
                : label}
            </h4>
          )}
          <ol className="gs-drives">
            {items.map((drive) => {
              const team = teamFor(game, drive.teamId);
              return (
                <li
                  key={drive.id}
                  className={`${drive.current ? "current" : ""} ${drive.score ? "scored" : ""}`}
                  style={{ ["--team" as string]: team?.color ?? "var(--border)" }}
                >
                  <span className="gs-drive-team">
                    <b>{team?.abbreviation ?? "—"}</b>
                    {drive.current ? (
                      <small>Now</small>
                    ) : drive.start ? (
                      <small>{drive.start}</small>
                    ) : null}
                  </span>
                  <span className="gs-drive-text">{drive.description ?? "—"}</span>
                  <span className={`gs-chip ${drive.score ? "td" : "quiet"}`}>
                    {drive.current ? "Live" : (drive.result ?? "—")}
                  </span>
                </li>
              );
            })}
          </ol>
        </div>
      ))}
    </section>
  );
}

function TeamBox({ team }: { team: TeamSummary }) {
  if (!team.box.length)
    return <p className="gs-empty">No player stats for {team.abbreviation} yet.</p>;
  return (
    <div className="gs-team">
      {team.leaders.length > 0 && (
        <ul className="gs-leader-cards">
          {team.leaders.map((leader) => (
            <li key={leader.key}>
              <small>{leader.label}</small>
              <strong>{leader.player}</strong>
              <span>
                {leader.position && <em>{leader.position}</em>}
                {leader.line}
              </span>
            </li>
          ))}
        </ul>
      )}
      {team.box.map((category) => (
        <div className="gs-stat" key={category.key}>
          <h4>{category.label}</h4>
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th scope="col">Player</th>
                  {category.columns.map((column) => (
                    <th scope="col" key={column}>
                      {column}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {category.players.map((player) => (
                  <tr key={player.id}>
                    <th scope="row">
                      {player.name}
                      {player.jersey && <small> #{player.jersey}</small>}
                    </th>
                    {category.columns.map((column, i) => (
                      <td key={column}>{player.stats[i] ?? "–"}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
              {category.totals.length === category.columns.length && (
                <tfoot>
                  <tr>
                    <th scope="row">Team</th>
                    {category.totals.map((total, i) => (
                      <td key={i}>{total}</td>
                    ))}
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        </div>
      ))}
    </div>
  );
}

function Picks({
  picks,
  revealed,
  deadline,
  viewerId,
  cards,
  game,
  line,
}: {
  picks: Record<PickType, GamePicker[]> | undefined;
  revealed: boolean;
  deadline: number;
  viewerId: string;
  cards: number;
  game: Game;
  line: GameLine | null;
}) {
  const spread = line?.homeSpread ?? null,
    total = line?.total ?? null;
  const homeFavorite = spread !== null && spread < 0;
  const slotLine = (type: PickType) =>
    type === "favorite"
      ? spread === null || spread === 0
        ? null
        : `${(homeFavorite ? game.home : game.away).abbreviation} ${signed(-Math.abs(spread))}`
      : type === "underdog"
        ? spread === null || spread === 0
          ? null
          : `${(homeFavorite ? game.away : game.home).abbreviation} ${signed(Math.abs(spread))}`
        : total === null
          ? null
          : `${type === "over" ? "O" : "U"} ${total}`;
  const totalPicks = PICK_TYPES.reduce((n, type) => n + (picks?.[type]?.length ?? 0), 0);
  return (
    <section className="gs-section gs-picks" aria-label="League picks">
      <p className="gs-picks-summary">
        {revealed ? (
          totalPicks ? (
            <>
              <b>{totalPicks}</b> of {cards} {cards === 1 ? "card has" : "cards have"}{" "}
              this game
            </>
          ) : (
            "Nobody has this game on their card."
          )
        ) : (
          <>
            <LockKeyhole size={12} /> Other members’ picks reveal {day(deadline)} PT
          </>
        )}
      </p>
      <ul>
        {PICK_TYPES.map((type) => {
          const Icon = slotIcons[type];
          const members = picks?.[type] ?? [];
          const names = pickerNames(members, viewerId);
          const share = cards ? Math.round((members.length / cards) * 100) : 0;
          const mine = members.some((m) => m.userId === viewerId);
          return (
            <li
              key={type}
              className={`${members.length ? "" : "empty"} ${mine ? "mine" : ""}`}
            >
              <span className="slot-icon">
                <Icon size={15} />
              </span>
              <div className="gs-pick-body">
                <div className="gs-pick-head">
                  <small>
                    {labels[type]}
                    {slotLine(type) && <span> · {slotLine(type)}</span>}
                  </small>
                  <b>
                    {members.length}
                    {revealed && cards > 0 && <span> · {share}%</span>}
                  </b>
                </div>
                <div className="gs-bar" aria-hidden="true">
                  <span
                    style={{
                      transform: `scaleX(${revealed && cards ? members.length / cards : 0})`,
                    }}
                  />
                </div>
                <div className="gs-pick-members">
                  {members.length ? (
                    <>
                      <span className="game-sheet-pickers">
                        {members.slice(0, 6).map((member) => (
                          <PlayerAvatar
                            key={member.userId}
                            name={member.name}
                            userId={member.userId}
                            revision={member.avatarRevision}
                            size="xs"
                          />
                        ))}
                      </span>
                      <span className="gs-pick-names">{names.join(", ")}</span>
                    </>
                  ) : (
                    <span className="gs-pick-names">{revealed ? "No picks" : "—"}</span>
                  )}
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

export function GameDetailSheet({
  game,
  line,
  published,
  picks,
  revealed,
  deadline,
  viewerId,
  cards,
  open,
  onOpenChange,
  onClosed,
}: {
  game: Game | null;
  line: GameLine | null;
  published: boolean;
  picks: Record<PickType, GamePicker[]> | undefined;
  revealed: boolean;
  deadline: number;
  viewerId: string;
  /** Cards submitted this week; the denominator for pick shares. */
  cards: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onClosed: () => void;
}) {
  const [detail, setDetail] = useState<GameDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [failure, setFailure] = useState("");
  const [team, setTeam] = useState("");
  const [tab, setTab] = useState("summary");
  const gameId = open ? game?.id : undefined;
  const live = game?.state === "live";
  useEffect(() => {
    if (!gameId) return;
    let cancelled = false;
    setDetail(null);
    setFailure("");
    setTeam("");
    setTab("summary");
    async function load() {
      setLoading(true);
      try {
        const response = await fetch(`/api/game/${encodeURIComponent(gameId!)}`, {
          cache: "no-store",
        });
        const result = await response.json();
        if (cancelled) return;
        if (!response.ok)
          throw new Error(result.error ?? "Game details are unavailable.");
        setDetail(result as GameDetail);
        setFailure("");
      } catch (e) {
        if (!cancelled) setFailure((e as Error).message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void load();
    const interval = live ? window.setInterval(() => void load(), 20_000) : undefined;
    return () => {
      cancelled = true;
      if (interval) window.clearInterval(interval);
    };
  }, [gameId, live]);
  if (!game) return null;
  const summary = detail?.summary ?? null;
  const awayScore = summary?.away.score ?? game.awayScore,
    homeScore = summary?.home.score ?? game.homeScore;
  const scored = awayScore !== null && homeScore !== null;
  const final = game.state === "final";
  const pregame = game.state === "scheduled";
  const situation = live ? (summary?.situation ?? null) : null;
  const possessionId = situation?.possessionTeamId ?? null;
  const redZone = Boolean(situation?.redZone);
  const state = status(game, summary);
  const activeTeam = team || game.away.id;
  const updated = summary ? `${clock(summary.fetchedAt)} PT` : null;
  const totalPicks = PICK_TYPES.reduce((n, type) => n + (picks?.[type]?.length ?? 0), 0);
  const waiting = loading && !summary;
  const empty = (text: string) => <p className="gs-empty">{text}</p>;

  const summaryTab = (
    <div className="gs-stack">
      <LineStrip line={line} published={published} game={game} />
      {live && (
        <section className="gs-live" aria-label="Live situation">
          {situation ? (
            <>
              <FieldStrip
                away={game.away}
                home={game.home}
                possessionTeamId={possessionId}
                yardsToEndzone={situation.yardsToEndzone}
                distance={situation.distance}
                redZone={situation.redZone}
                ballOn={situation.ballOn}
              />
              <dl className="gs-situation">
                <div>
                  <dt>Down</dt>
                  <dd>{situation.downDistance ?? "—"}</dd>
                </div>
                <div>
                  <dt>Ball on</dt>
                  <dd>{situation.ballOn ?? "—"}</dd>
                </div>
                <div>
                  <dt>Drive</dt>
                  <dd>
                    {situation.drive?.description ??
                      (situation.drive
                        ? [
                            situation.drive.plays !== null
                              ? `${situation.drive.plays} plays`
                              : null,
                            situation.drive.yards !== null
                              ? `${situation.drive.yards} yds`
                              : null,
                            situation.drive.time,
                          ]
                            .filter(Boolean)
                            .join(", ")
                        : "—")}
                  </dd>
                </div>
              </dl>
              {situation.lastPlay && (
                <p className="gs-last-play">
                  <small>Last play</small>
                  {situation.lastPlay}
                </p>
              )}
            </>
          ) : (
            <p className="gs-empty">
              {waiting
                ? "Loading the live drive…"
                : "Drive details aren’t in the feed right now. The score above still updates."}
            </p>
          )}
        </section>
      )}
      {pregame && (
        <dl className="gs-facts">
          <div>
            <dt>Kickoff</dt>
            <dd>{game.timeConfirmed ? `${day(game.kickoff)} PT` : "Time TBD"}</dd>
          </div>
          {game.venue && (
            <div>
              <dt>Venue</dt>
              <dd>{game.venue}</dd>
            </div>
          )}
          {game.broadcast && (
            <div>
              <dt>TV</dt>
              <dd>{game.broadcast}</dd>
            </div>
          )}
          <div>
            <dt>League picks</dt>
            <dd>
              {totalPicks
                ? `${totalPicks} on this game`
                : revealed
                  ? "None"
                  : `Reveal ${day(deadline)} PT`}
            </dd>
          </div>
        </dl>
      )}
      {summary && scored && <LineScores away={summary.away} home={summary.home} />}
      {summary && <Leaders summary={summary} game={game} />}
      {summary && summary.scoring.length > 0 && (
        <ScoringList plays={summary.scoring} game={game} />
      )}
      {!pregame && waiting && empty("Loading game details…")}
      {!pregame && !waiting && !summary && failure && empty(failure)}
    </div>
  );

  const playsTab = (
    <div className="gs-stack">
      {summary?.drives.length ? (
        <Drives drives={summary.drives} game={game} />
      ) : (
        empty(
          pregame
            ? "Drives appear once the game kicks off."
            : waiting
              ? "Loading drives…"
              : "Drive data isn’t available from the feed for this game.",
        )
      )}
    </div>
  );

  const boxTab = (
    <div className="gs-stack">
      {summary?.available.boxscore ? (
        <>
          <SegmentedControl
            size="sm"
            className="gs-team-toggle"
            value={activeTeam}
            onChange={setTeam}
            options={[
              { value: game.away.id, label: game.away.short },
              { value: game.home.id, label: game.home.short },
            ]}
          />
          <TeamBox team={activeTeam === game.home.id ? summary.home : summary.away} />
        </>
      ) : (
        empty(
          pregame
            ? "Player stats appear once the game kicks off."
            : waiting
              ? "Loading box score…"
              : "Player stats aren’t available from the feed for this game.",
        )
      )}
    </div>
  );

  return (
    <ResponsiveDialog
      open={open}
      onOpenChange={onOpenChange}
      onOpenChangeComplete={(next) => {
        if (!next) onClosed();
      }}
      title={`${game.away.short} at ${game.home.short}`}
      size="md"
      classNames={{
        header: "sr-only",
        title: "sr-only",
        content: "game-sheet-dialog",
        drawerContent: "game-sheet-drawer",
        drawerHeader: "game-sheet-drawer-header",
        drawerRoot: "game-sheet-drawer-body",
      }}
    >
      <div className="league-app game-sheet" data-state={game.state}>
        <header className="gs-header">
          <Side
            team={game.away}
            summary={summary?.away}
            possession={possessionId === game.away.id}
            redZone={redZone}
            live={live}
            muted={final && scored && awayScore < homeScore}
          />
          <div className="gs-center">
            {scored ? (
              <span className={`gs-score ${live ? "live" : ""}`}>
                <b className={final && awayScore < homeScore ? "muted" : ""}>
                  {awayScore}
                </b>
                <span>–</span>
                <b className={final && homeScore < awayScore ? "muted" : ""}>
                  {homeScore}
                </b>
              </span>
            ) : (
              <span className="gs-score pregame">
                <span>at</span>
              </span>
            )}
            <em className={`gs-status ${state.live ? "live" : ""}`}>
              {state.live && <span className="live-dot" />}
              {state.label}
            </em>
            {!pregame && (game.venue || game.broadcast) && (
              <span className="gs-meta">
                {[game.broadcast, game.venue].filter(Boolean).join(" · ")}
              </span>
            )}
          </div>
          <Side
            team={game.home}
            summary={summary?.home}
            possession={possessionId === game.home.id}
            redZone={redZone}
            live={live}
            muted={final && scored && homeScore < awayScore}
          />
        </header>
        <TabPanels
          aria-label="Game details"
          activeTab={tab}
          onTabChange={setTab}
          classNames={{
            root: "gs-tabs",
            list: "gs-tablist",
            tab: "gs-tab",
            panel: "gs-panel",
          }}
          tabs={[
            { value: "summary", label: "Summary", content: summaryTab },
            { value: "plays", label: "Plays", content: playsTab },
            { value: "box", label: "Box score", content: boxTab },
            {
              value: "picks",
              label: "Picks",
              badge: totalPicks ? (
                <span className="gs-tab-count">{totalPicks}</span>
              ) : undefined,
              content: (
                <Picks
                  picks={picks}
                  revealed={revealed}
                  deadline={deadline}
                  viewerId={viewerId}
                  cards={cards}
                  game={game}
                  line={line}
                />
              ),
            },
          ]}
        />
        <p className="source-note gs-foot" role="status">
          {detail?.error ? `${detail.error} ` : failure && !summary ? `${failure} ` : ""}
          {updated
            ? `ESPN · Updated ${updated}${detail?.stale ? " (stale)" : ""}`
            : waiting
              ? "ESPN · Loading…"
              : "ESPN"}
        </p>
      </div>
    </ResponsiveDialog>
  );
}
