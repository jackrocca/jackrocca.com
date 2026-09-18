"use client";
import type { CSSProperties } from "react";
import { FieldStrip } from "@/components/field-strip";
import { pacificDay, periodName, quarterLabel } from "@/lib/game-format";
import type {
  DriveSummary,
  GameSituation,
  GameSummary,
  ScoringPlay,
  TeamSummary,
} from "@/lib/game-summary";
import { slotLine, type GameLine } from "@/lib/lines";
import type { Game } from "@/lib/types";

/** Inline custom properties (`--team`) typed without casting at every call site. */
export const cssVars = (vars: Record<`--${string}`, string>) => vars as CSSProperties;
export const teamFor = (game: Game, id: string | null) =>
  id === game.home.id ? game.home : id === game.away.id ? game.away : null;
export const Empty = ({ children }: { children: string }) => (
  <p className="gs-empty">{children}</p>
);

export function LineStrip({
  line,
  published,
  game,
}: {
  line: GameLine | null;
  published: boolean;
  game: Game;
}) {
  return (
    <dl className="gs-line">
      <div>
        <dt>Spread</dt>
        <dd>{slotLine(game, line, "favorite") ?? "—"}</dd>
      </div>
      <div>
        <dt>Total</dt>
        <dd>{line?.total ?? "—"}</dd>
      </div>
      <div>
        <dt>{published ? "Frozen" : "Preview"}</dt>
        <dd>{line?.provider ?? (published ? "League" : "Unpublished")}</dd>
      </div>
    </dl>
  );
}

export function LineScores({ away, home }: { away: TeamSummary; home: TeamSummary }) {
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
              {quarterLabel(i + 1)}
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

const driveText = (drive: DriveSummary | null) =>
  drive?.description ??
  (drive
    ? [
        drive.plays !== null ? `${drive.plays} plays` : null,
        drive.yards !== null ? `${drive.yards} yds` : null,
        drive.time,
      ]
        .filter(Boolean)
        .join(", ")
    : "—");

export function LiveSituation({
  game,
  situation,
  waiting,
}: {
  game: Game;
  situation: GameSituation | null;
  waiting: boolean;
}) {
  return (
    <section className="gs-live" aria-label="Live situation">
      {situation ? (
        <>
          <FieldStrip
            away={game.away}
            home={game.home}
            possessionTeamId={situation.possessionTeamId}
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
              <dd>{driveText(situation.drive)}</dd>
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
        <Empty>
          {waiting
            ? "Loading the live drive…"
            : "Drive details aren’t in the feed right now. The score above still updates."}
        </Empty>
      )}
    </section>
  );
}

export function PregameFacts({
  game,
  picks,
  revealed,
  deadline,
}: {
  game: Game;
  picks: number;
  revealed: boolean;
  deadline: number;
}) {
  return (
    <dl className="gs-facts">
      <div>
        <dt>Kickoff</dt>
        <dd>{game.timeConfirmed ? `${pacificDay(game.kickoff)} PT` : "Time TBD"}</dd>
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
          {picks
            ? `${picks} on this game`
            : revealed
              ? "None"
              : `Reveal ${pacificDay(deadline)} PT`}
        </dd>
      </div>
    </dl>
  );
}

export function Leaders({ summary, game }: { summary: GameSummary; game: Game }) {
  const rows = ["passingYards", "rushingYards", "receivingYards"]
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
                style={cssVars({ "--team": team.color })}
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

function groupByPeriod<T extends { period: number | null }>(items: T[]) {
  const groups = new Map<string, T[]>();
  for (const item of items) {
    const key = periodName(item.period);
    groups.set(key, [...(groups.get(key) ?? []), item]);
  }
  return [...groups.entries()];
}

export function ScoringList({ plays, game }: { plays: ScoringPlay[]; game: Game }) {
  return (
    <section className="gs-section" aria-label="Scoring summary">
      <h3>Scoring</h3>
      {groupByPeriod(plays).map(([label, items]) => (
        <div className="gs-group" key={label || "scoring"}>
          {label && <h4>{label}</h4>}
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

export function Drives({ drives, game }: { drives: DriveSummary[]; game: Game }) {
  return (
    <section className="gs-section" aria-label="Drives">
      {groupByPeriod(drives).map(([label, items]) => (
        <div className="gs-group" key={label || "drives"}>
          {label && <h4>{label}</h4>}
          <ol className="gs-drives">
            {items.map((drive) => {
              const team = teamFor(game, drive.teamId);
              return (
                <li
                  key={drive.id}
                  className={`${drive.current ? "current" : ""} ${drive.score ? "scored" : ""}`}
                  style={cssVars({ "--team": team?.color ?? "var(--border)" })}
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

export function TeamBox({ team }: { team: TeamSummary }) {
  if (!team.box.length)
    return <Empty>{`No player stats for ${team.abbreviation} yet.`}</Empty>;
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
