"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { ResponsiveDialog } from "@/ui/components/ResponsiveDialog";
import { SegmentedControl } from "@/ui/components/SegmentedControl";
import { TabPanels } from "@/ui/components/TabPanels";
import { TeamMark } from "@/components/team-mark";
import {
  Drives,
  Empty,
  Leaders,
  LineScores,
  LineStrip,
  LiveSituation,
  PregameFacts,
  ScoringList,
  TeamBox,
} from "@/components/game-detail-sections";
import {
  GamePicksTab,
  countPicks,
  type GameSlotPicks,
} from "@/components/game-picks-tab";
import type { GameDetail } from "@/lib/game-detail";
import { pacificClock, pacificDay, quarterLabel } from "@/lib/game-format";
import type { GameSummary, TeamSummary } from "@/lib/game-summary";
import type { GameLine } from "@/lib/lines";
import { displayScores } from "@/lib/game-scores";
import type { Game, Team } from "@/lib/types";

function gameStatus(game: Game, summary: GameSummary | null) {
  if (game.state === "final")
    return {
      label: summary?.detail === "Final/OT" ? "Final · OT" : "Final",
      live: false,
    };
  if (game.state === "live") {
    const detail =
      summary?.state === "live" && summary.clock && summary.period
        ? `${quarterLabel(summary.period)} · ${summary.clock}`
        : summary?.state === "live" && summary.detail
          ? summary.detail
          : game.detail || "Live";
    return { label: detail, live: true };
  }
  if (game.state === "postponed") return { label: "Postponed", live: false };
  if (game.state === "canceled") return { label: "Canceled", live: false };
  return {
    label: game.timeConfirmed ? `${pacificDay(game.kickoff)} PT` : "Kickoff TBD",
    live: false,
  };
}

function Timeouts({ count }: { count: number | null }) {
  if (count === null) return null;
  return (
    <span className="gs-timeouts" role="img" aria-label={`${count} timeouts left`}>
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
    <div className={`gs-side ${muted ? "muted" : ""}`}>
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

/**
 * Loads `/api/game/:id` while the sheet is open and polls every 20 s for a live
 * game. Detail is only cleared when the game changes, so a game turning live
 * mid-view keeps its content until the refetch lands.
 */
function useGameDetail(gameId: string | undefined, live: boolean) {
  const [detail, setDetail] = useState<GameDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [failure, setFailure] = useState("");
  const request = useRef(0);
  const load = useCallback(async () => {
    if (!gameId) return;
    const id = ++request.current;
    setLoading(true);
    try {
      const response = await fetch(`/api/game/${encodeURIComponent(gameId)}`, {
        cache: "no-store",
      });
      const result = (await response.json().catch(() => null)) as
        (GameDetail & { error?: string }) | null;
      if (id !== request.current) return;
      if (!response.ok || !result?.summary)
        throw new Error(result?.error ?? "Game details are unavailable right now.");
      setDetail(result);
      setFailure("");
    } catch (e) {
      if (id === request.current) setFailure((e as Error).message);
    } finally {
      if (id === request.current) setLoading(false);
    }
  }, [gameId]);
  useEffect(() => {
    if (!gameId) return;
    setDetail(null);
    setFailure("");
    void load();
    return () => {
      request.current++;
    };
  }, [gameId, load]);
  useEffect(() => {
    if (!gameId || !live) return;
    const interval = window.setInterval(() => void load(), 20_000);
    return () => window.clearInterval(interval);
  }, [gameId, live, load]);
  return { detail, failure, waiting: loading && !detail };
}

export function GameDetailSheet({
  game,
  line,
  published,
  picks,
  revealed,
  deadline,
  viewerId,
  cardsSubmitted,
  open,
  onOpenChange,
  onClosed,
}: {
  game: Game | null;
  line: GameLine | null;
  published: boolean;
  picks: GameSlotPicks | undefined;
  revealed: boolean;
  deadline: number;
  viewerId: string;
  /** Cards submitted this week; the denominator for pick shares. */
  cardsSubmitted: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onClosed: () => void;
}) {
  const live = game?.state === "live";
  const { detail, failure, waiting } = useGameDetail(open ? game?.id : undefined, live);
  const [team, setTeam] = useState("");
  const [tab, setTab] = useState("summary");
  useEffect(() => {
    if (open) {
      setTeam("");
      setTab("summary");
    }
  }, [open, game?.id]);
  if (!game) return null;
  const summary = detail?.summary ?? null;
  const scores = displayScores(game, summary);
  const { awayScore, homeScore } = scores;
  const scored = awayScore !== null && homeScore !== null;
  const final = game.state === "final";
  const pregame = game.state === "scheduled";
  const situation = live ? (summary?.situation ?? null) : null;
  const possessionId = situation?.possessionTeamId ?? null;
  const status = gameStatus(game, summary);
  const activeTeam = team || game.away.id;
  const totalPicks = countPicks(picks);
  const unavailable = (what: string) =>
    pregame
      ? `${what} appear once the game kicks off.`
      : waiting
        ? `Loading ${what.toLowerCase()}…`
        : `${what} aren’t available from the feed for this game.`;

  const summaryTab = (
    <div className="gs-stack">
      <LineStrip line={line} published={published} game={game} />
      {live && <LiveSituation game={game} situation={situation} waiting={waiting} />}
      {pregame && (
        <PregameFacts
          game={game}
          picks={totalPicks}
          revealed={revealed}
          deadline={deadline}
        />
      )}
      {summary && scored && scores.source === "summary" && (
        <LineScores away={summary.away} home={summary.home} />
      )}
      {summary && <Leaders summary={summary} game={game} />}
      {summary && summary.scoring.length > 0 && (
        <ScoringList plays={summary.scoring} game={game} />
      )}
      {!pregame && waiting && <Empty>Loading game details…</Empty>}
      {!pregame && !waiting && !summary && failure && <Empty>{failure}</Empty>}
    </div>
  );
  const playsTab = (
    <div className="gs-stack">
      {summary?.drives.length ? (
        <Drives drives={summary.drives} game={game} />
      ) : (
        <Empty>{unavailable("Drives")}</Empty>
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
        <Empty>{unavailable("Player stats")}</Empty>
      )}
    </div>
  );
  const updated = summary ? `${pacificClock(summary.fetchedAt)} PT` : null;
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
            redZone={Boolean(situation?.redZone)}
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
            <em className={`gs-status ${status.live ? "live" : ""}`}>
              {status.live && <span className="live-dot" />}
              {status.label}
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
            redZone={Boolean(situation?.redZone)}
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
                <GamePicksTab
                  game={game}
                  line={line}
                  picks={picks}
                  revealed={revealed}
                  deadline={deadline}
                  viewerId={viewerId}
                  cardsSubmitted={cardsSubmitted}
                />
              ),
            },
          ]}
        />
        <p className="source-note gs-foot">
          <span role="status">
            {detail?.error
              ? `${detail.error} `
              : failure && !summary
                ? `${failure} `
                : ""}
          </span>
          {game.resultOverride ? "Score set by the commissioner · " : ""}
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
