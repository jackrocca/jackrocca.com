"use client";
import { useEffect, useState } from "react";
import { Check, LockKeyhole, RefreshCw } from "lucide-react";
import { ResponsiveDialog } from "@/ui/components/ResponsiveDialog";
import { SegmentedControl } from "@/ui/components/SegmentedControl";
import { PlayerAvatar } from "@/components/player-avatar";
import { TeamMark } from "@/components/team-mark";
import { labels, slotIcons } from "@/components/league-meta";
import { pickerNames } from "@/components/pick-avatars";
import type { GameDetail } from "@/lib/game-detail";
import type { TeamSummary } from "@/lib/game-summary";
import { signed } from "@/lib/rules";
import { PICK_TYPES, PickType, type Game } from "@/lib/types";
import type { GamePicker } from "@/lib/view";

export type GameLine = {
  homeSpread: number | null;
  total: number | null;
  provider: string | null;
};

const time = (value: string | number) =>
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

function statusText(game: Game, live: string | null) {
  if (game.state === "final") return "Final";
  if (game.state === "live") return live || game.detail || "Live";
  if (game.state === "postponed") return "Postponed";
  if (game.state === "canceled") return "Canceled";
  return game.timeConfirmed ? `${day(game.kickoff)} PT` : "Kickoff TBD";
}

function LineScores({ away, home }: { away: TeamSummary; home: TeamSummary }) {
  const periods = Math.max(away.linescores.length, home.linescores.length);
  if (!periods) return null;
  const heading = (i: number) =>
    i < 4 ? `Q${i + 1}` : periods === 5 ? "OT" : `OT${i - 3}`;
  return (
    <table className="game-sheet-periods">
      <thead>
        <tr>
          <th scope="col">
            <span className="sr-only">Team</span>
          </th>
          {Array.from({ length: periods }, (_, i) => (
            <th scope="col" key={i}>
              {heading(i)}
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

function TeamBox({ team }: { team: TeamSummary }) {
  if (!team.leaders.length && !team.box.length)
    return (
      <p className="game-sheet-empty">No player stats for {team.abbreviation} yet.</p>
    );
  return (
    <div className="game-sheet-team">
      {team.leaders.length > 0 && (
        <ul className="game-sheet-leaders">
          {team.leaders.map((leader) => (
            <li key={leader.key}>
              <small>{leader.label}</small>
              <strong>
                {leader.player}
                {leader.position && <span> · {leader.position}</span>}
              </strong>
              <span>{leader.line}</span>
            </li>
          ))}
        </ul>
      )}
      {team.box.map((category) => (
        <div className="game-sheet-stat" key={category.key}>
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

export function GameDetailSheet({
  game,
  line,
  published,
  picks,
  revealed,
  deadline,
  viewerId,
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
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onClosed: () => void;
}) {
  const [detail, setDetail] = useState<GameDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [failure, setFailure] = useState("");
  const [team, setTeam] = useState<string>("");
  const gameId = open ? game?.id : undefined;
  const live = game?.state === "live";
  useEffect(() => {
    if (!gameId) return;
    let cancelled = false;
    setDetail(null);
    setFailure("");
    setTeam("");
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
  const away = summary?.away,
    home = summary?.home;
  const awayScore = away?.score ?? game.awayScore,
    homeScore = home?.score ?? game.homeScore;
  const spread = line?.homeSpread ?? null,
    total = line?.total ?? null;
  const favorite = spread !== null && spread < 0 ? game.home : game.away;
  const situation = summary?.situation ?? null;
  const possession =
    situation?.possessionTeamId === game.home.id
      ? game.home
      : situation?.possessionTeamId === game.away.id
        ? game.away
        : null;
  const activeTeam = team || game.away.id;
  const picked = (type: PickType) => picks?.[type] ?? [];
  const anyPicks = PICK_TYPES.some((type) => picked(type).length > 0);
  const updated = summary ? `${time(summary.fetchedAt)} PT` : null;
  return (
    <ResponsiveDialog
      open={open}
      onOpenChange={onOpenChange}
      onOpenChangeComplete={(next) => {
        if (!next) onClosed();
      }}
      title={`${game.away.short} at ${game.home.short}`}
      size="md"
      classNames={{ content: "game-sheet-dialog", drawerContent: "game-sheet-drawer" }}
    >
      <div className="league-app game-sheet" data-state={game.state}>
        <header className="game-sheet-score">
          <div className="game-sheet-side">
            <TeamMark game={game} side="away" />
            <strong>{game.away.abbreviation}</strong>
            <small>{away?.record ?? game.away.short}</small>
          </div>
          <div className="game-sheet-tally">
            {awayScore !== null && homeScore !== null ? (
              <span className={`versus ${live ? "live-score" : ""}`}>
                <b>{awayScore}</b>
                <span>–</span>
                <b>{homeScore}</b>
              </span>
            ) : (
              <span className="versus">at</span>
            )}
            <em className={live ? "live" : ""}>
              {live && <span className="live-dot" />}
              {statusText(game, summary?.state === "live" ? summary.detail : null)}
            </em>
          </div>
          <div className="game-sheet-side">
            <TeamMark game={game} side="home" />
            <strong>{game.home.abbreviation}</strong>
            <small>{home?.record ?? game.home.short}</small>
          </div>
        </header>
        {(game.venue || game.broadcast) && (
          <p className="game-sheet-meta">
            {[game.venue, game.broadcast].filter(Boolean).join(" · ")}
          </p>
        )}
        <dl className="game-sheet-line">
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
            <dt>{published ? "Frozen line" : "Preview line"}</dt>
            <dd>{line?.provider ?? (published ? "League" : "Not yet published")}</dd>
          </div>
        </dl>
        {away && home && (awayScore !== null || homeScore !== null) && (
          <LineScores away={away} home={home} />
        )}
        {live && (
          <section className="game-sheet-live" aria-label="Live situation">
            <h3>
              <span className="live-dot" />
              Live
              {situation?.redZone && <span className="red-zone">Red zone</span>}
            </h3>
            {situation ? (
              <>
                <div className="game-sheet-situation">
                  <div>
                    <small>Possession</small>
                    <strong>
                      {possession ? (
                        <>
                          <TeamMark
                            game={game}
                            side={possession === game.home ? "home" : "away"}
                          />
                          {possession.abbreviation}
                        </>
                      ) : (
                        "—"
                      )}
                    </strong>
                  </div>
                  <div>
                    <small>Down & distance</small>
                    <strong>{situation.downDistance ?? "—"}</strong>
                  </div>
                  <div>
                    <small>Ball on</small>
                    <strong>{situation.ballOn ?? "—"}</strong>
                  </div>
                  <div>
                    <small>This drive</small>
                    <strong>
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
                    </strong>
                  </div>
                </div>
                {situation.lastPlay && (
                  <p className="game-sheet-last-play">
                    <small>Last play</small>
                    {situation.lastPlay}
                  </p>
                )}
              </>
            ) : (
              <p className="game-sheet-empty">
                {loading && !summary
                  ? "Loading the live drive…"
                  : "Drive details aren’t available from the feed right now. Scores still update on the board."}
              </p>
            )}
          </section>
        )}
        <section className="game-sheet-picks" aria-label="League picks">
          <h3>League picks</h3>
          {!revealed && (
            <p className="game-sheet-reveal">
              <LockKeyhole size={13} />
              Other members’ picks reveal {day(deadline)} PT.
            </p>
          )}
          {anyPicks ? (
            <ul>
              {PICK_TYPES.map((type) => {
                const Icon = slotIcons[type];
                const members = picked(type);
                if (!members.length) return null;
                const names = pickerNames(members, viewerId);
                return (
                  <li key={type}>
                    <span className="slot-icon">
                      <Icon size={15} />
                    </span>
                    <div>
                      <small>{labels[type]}</small>
                      <strong>{names.join(", ")}</strong>
                    </div>
                    <span className="game-sheet-pickers">
                      {members.slice(0, 5).map((member) => (
                        <PlayerAvatar
                          key={member.userId}
                          name={member.name}
                          userId={member.userId}
                          revision={member.avatarRevision}
                          size="xs"
                        />
                      ))}
                    </span>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="game-sheet-empty">
              {revealed
                ? "Nobody picked this game."
                : "None of your picks are on this game."}
            </p>
          )}
        </section>
        {summary && summary.scoring.length > 0 && (
          <section className="game-sheet-scoring" aria-label="Scoring">
            <h3>Scoring</h3>
            <ol>
              {summary.scoring.map((play) => (
                <li key={play.id}>
                  <span className="game-sheet-play-team">
                    {play.teamId === game.home.id
                      ? game.home.abbreviation
                      : play.teamId === game.away.id
                        ? game.away.abbreviation
                        : "—"}
                    <small>
                      {play.type}
                      {play.period ? ` · Q${play.period}` : ""}
                      {play.clock ? ` ${play.clock}` : ""}
                    </small>
                  </span>
                  <span className="game-sheet-play-text">{play.text}</span>
                  {play.awayScore !== null && play.homeScore !== null && (
                    <b>
                      {play.awayScore}–{play.homeScore}
                    </b>
                  )}
                </li>
              ))}
            </ol>
          </section>
        )}
        <section className="game-sheet-box" aria-label="Player stats">
          <div className="game-sheet-box-heading">
            <h3>Player stats</h3>
            {summary && summary.available.boxscore && (
              <SegmentedControl
                size="sm"
                value={activeTeam}
                onChange={setTeam}
                options={[
                  { value: game.away.id, label: game.away.abbreviation },
                  { value: game.home.id, label: game.home.abbreviation },
                ]}
              />
            )}
          </div>
          {loading && !summary ? (
            <p className="game-sheet-empty">Loading box score…</p>
          ) : failure && !summary ? (
            <p className="game-sheet-empty" role="status">
              {failure}
            </p>
          ) : summary && summary.available.boxscore ? (
            <TeamBox team={activeTeam === game.home.id ? summary.home : summary.away} />
          ) : (
            <p className="game-sheet-empty">
              {game.state === "scheduled"
                ? "Player stats appear once the game kicks off."
                : "Player stats aren’t available from the feed for this game."}
            </p>
          )}
        </section>
        {summary && summary.drives.length > 0 && (
          <details className="game-sheet-drives">
            <summary>
              Drive log <small>{summary.drives.length}</small>
            </summary>
            <ol>
              {summary.drives.map((drive) => (
                <li key={drive.id} className={drive.current ? "current" : ""}>
                  <span className="game-sheet-play-team">
                    {drive.teamId === game.home.id
                      ? game.home.abbreviation
                      : drive.teamId === game.away.id
                        ? game.away.abbreviation
                        : "—"}
                    {drive.current && <small>In progress</small>}
                  </span>
                  <span className="game-sheet-play-text">
                    {drive.description ?? "—"}
                    {drive.start ? ` · from ${drive.start}` : ""}
                  </span>
                  <b className={drive.score ? "scored" : ""}>
                    {drive.score && <Check size={11} />}
                    {drive.result ?? ""}
                  </b>
                </li>
              ))}
            </ol>
          </details>
        )}
        <p className="source-note game-sheet-foot">
          {detail?.error ? (
            <>
              <RefreshCw size={11} /> {detail.error}{" "}
            </>
          ) : null}
          {updated
            ? `Game details via ESPN · Updated ${updated}${detail?.stale ? " (stale)" : ""}`
            : failure
              ? `Game details via ESPN · ${failure}`
              : "Game details via ESPN"}
        </p>
      </div>
    </ResponsiveDialog>
  );
}
