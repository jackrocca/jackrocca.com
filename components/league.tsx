"use client";
import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import {
  ArrowDown,
  ArrowRight,
  ArrowUp,
  ArrowUpRight,
  Check,
  ChevronLeft,
  ChevronRight,
  Clipboard,
  Clock3,
  Crown,
  Flag,
  Grid2X2,
  History,
  LockKeyhole,
  LogOut,
  ChevronUp,
  ChevronDown,
  RefreshCw,
  Shield,
  ShieldCheck,
  Trophy,
  X,
  Zap,
  Target,
  Sparkles,
  Download,
  UserRound,
  MessagesSquare,
} from "lucide-react";
import { CustomButton } from "@/ui/components/CustomButton";
import { Input } from "@/ui/components/Input";
import { Checkbox } from "@/ui/primitives/checkbox";
import { SignInPage } from "@/components/sign-in-page";
import { ResponsiveDialog } from "@/ui/components/ResponsiveDialog";
import { BottomDrawer } from "@/ui/components/BottomDrawer";
import { Spinner } from "@/ui/components/Spinner";
import { LeagueChat } from "@/components/league-chat";
import { PlayerAvatar, ProfilePhotoField } from "@/components/player-avatar";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/ui/primitives/accordion";
import { LeagueSelect, useConfirmation } from "@/components/league-controls";
import type { AppView } from "@/lib/view";
import { PICK_TYPES, PickInput, PickType, Game } from "@/lib/types";
import { signed } from "@/lib/rules";
const labels = {
  favorite: "Favorite",
  underdog: "Underdog",
  over: "Over",
  under: "Under",
};
const slotIcons = {
  favorite: Crown,
  underdog: Shield,
  over: ArrowUp,
  under: ArrowDown,
};
const blank = (): PickInput => ({
  week: 1,
  picks: { favorite: "", underdog: "", over: "", under: "" },
  superSpread: false,
  totalHelper: null,
  perfectPrediction: false,
  revision: 0,
});
async function api(path: string, data?: unknown) {
  const response = await fetch(`/api/${path}`, {
    method: data === undefined ? "GET" : "POST",
    headers: data === undefined ? {} : { "Content-Type": "application/json" },
    body: data === undefined ? undefined : JSON.stringify(data),
    cache: "no-store",
  });
  const result = await response.json();
  if (!response.ok)
    throw new Error(result.error ?? "Something went wrong. Please try again.");
  return result;
}
const date = (value: string | number, full = false) =>
  new Date(value).toLocaleString("en-US", {
    timeZone: "America/Los_Angeles",
    weekday: "short",
    month: "short",
    day: "numeric",
    ...(full ? { hour: "numeric", minute: "2-digit" } : {}),
  });
function TeamMark({ game, side }: { game: Game; side: "home" | "away" }) {
  const team = game[side];
  const [failedTeamId, setFailedTeamId] = useState<string | null>(null);
  return (
    <span className="team-mark" aria-hidden="true">
      {failedTeamId === team.id ? (
        <span className="team-mark-fallback">{team.abbreviation}</span>
      ) : (
        <Image
          src={`/nfl/${encodeURIComponent(team.id)}.png`}
          alt=""
          width={500}
          height={500}
          sizes="48px"
          onError={() => setFailedTeamId(team.id)}
        />
      )}
    </span>
  );
}
export default function League() {
  const { ask, dialog: confirmationDialog } = useConfirmation();
  const [data, setData] = useState<AppView | null>(null),
    [week, setWeek] = useState<number | null>(null),
    [tab, setTab] = useState("board"),
    [draft, setDraft] = useState<PickInput>(blank),
    [dirty, setDirty] = useState(false),
    [busy, setBusy] = useState(false),
    [notice, setNotice] = useState(""),
    [error, setError] = useState(""),
    [tick, setTick] = useState(Date.now()),
    [navigationOpen, setNavigationOpen] = useState(false),
    [accountOpen, setAccountOpen] = useState(false),
    [buyInOpen, setBuyInOpen] = useState(false);
  const load = useCallback(async (number: number | null) => {
    try {
      const result = (await api(`state${number ? `?week=${number}` : ""}`)) as AppView;
      setData(result);
      setWeek(result.week.number);
      setError("");
      return result;
    } catch (e) {
      setError((e as Error).message);
      return null;
    }
  }, []);
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const messages: Record<string, string> = {
      canceled: "Google sign-in was canceled. You can try again whenever you’re ready.",
      failed: "Google sign-in could not be completed. Please try again.",
      unavailable: "Google sign-in is being connected. Please check back shortly.",
    };
    const authError = params.get("authError");
    if (authError || params.has("invite") || params.has("setup"))
      history.replaceState(null, "", location.pathname);
    void load(null).then(() => {
      if (authError && messages[authError]) setError(messages[authError]);
    });
  }, [load]);
  useEffect(() => {
    if (!data || dirty) return;
    const own = data.entries.find((e) => e.userId === data.user?.id);
    setDraft(
      own && own.picks
        ? {
            week: data.week.number,
            picks: Object.fromEntries(
              PICK_TYPES.map((t) => [t, own.picks![t].gameId]),
            ) as PickInput["picks"],
            superSpread: own.superSpread,
            totalHelper: own.totalHelper,
            perfectPrediction: own.perfectPrediction,
            revision: own.revision,
          }
        : { ...blank(), week: data.week.number },
    );
  }, [data, dirty]);
  useEffect(() => {
    const interval = setInterval(() => setTick(Date.now()), 15000);
    return () => clearInterval(interval);
  }, []);
  useEffect(() => {
    if (!data?.user || !week) return;
    const interval = setInterval(async () => {
      try {
        await api("refresh", { week });
        await load(week);
      } catch {
        /* Keep existing state and indicate freshness by timestamp. */
      }
    }, 60_000);
    return () => clearInterval(interval);
  }, [data?.user?.id, week, load]);
  useEffect(() => {
    const before = (e: BeforeUnloadEvent) => {
      if (dirty) e.preventDefault();
    };
    window.addEventListener("beforeunload", before);
    return () => window.removeEventListener("beforeunload", before);
  }, [dirty]);
  async function act(fn: () => Promise<void>) {
    setBusy(true);
    setError("");
    setNotice("");
    try {
      await fn();
      return true;
    } catch (e) {
      setError((e as Error).message);
      return false;
    } finally {
      setBusy(false);
    }
  }
  async function changeWeek(number: number) {
    if (dirty && !(await ask("Discard your unsaved picks and change weeks?"))) return;
    setDirty(false);
    await load(number);
  }
  async function save() {
    return act(async () => {
      await api("picks", draft);
      setDirty(false);
      await load(week);
      setNotice("Your four picks are saved.");
    });
  }
  if (!data)
    return (
      <main id="main-content" className="league-app loading" aria-busy="true">
        <Spinner size="lg" />
        <div className="brand-mark">4</div>
        <h1>Pick 4</h1>
        <p>{error || "Getting the league ready…"}</p>
        {error && (
          <CustomButton variant="unstyled" onClick={() => load(null)}>
            Try again
          </CustomButton>
        )}
      </main>
    );
  const w = data.week,
    user = data.user,
    own = data.entries.find((e) => e.userId === user?.id),
    locked = tick >= w.deadline && Boolean(own),
    late = tick >= w.deadline && !own,
    canPick = Boolean(user && w.publishedAt && !locked),
    count = PICK_TYPES.filter((t) => draft.picks[t]).length,
    buyInPending = week === 1 && own?.buyIn?.status === "pending";
  function submit() {
    if (own && !dirty) {
      const board = document.getElementById("game-board");
      board?.scrollIntoView({ block: "start" });
      board?.querySelector<HTMLButtonElement>("button:not(:disabled)")?.focus({
        preventScroll: true,
      });
      setNotice("Choose a new pick, then save your updated card.");
      return;
    }
    if (week === 1 && !own) {
      setBuyInOpen(true);
      return;
    }
    void save();
  }
  const used = (power: "superSpread" | "totalHelper" | "perfectPrediction") =>
    data.history.some((e) => e.week !== week && e[power]);
  const updated = w.fetchedAt ? date(w.fetchedAt, true) : "Not yet synced";
  const stale = !w.fetchedAt || tick - Date.parse(w.fetchedAt) > 5 * 60_000;
  function choose(type: PickType, gameId: string) {
    if (!canPick) return;
    setDirty(true);
    setDraft((d) => ({
      ...d,
      picks: { ...d.picks, [type]: d.picks[type] === gameId ? "" : gameId },
    }));
    setNotice("");
  }
  const pages = [
    { value: "board", label: "Score Board", icon: Grid2X2 },
    { value: "standings", label: "Standings", icon: Trophy },
    { value: "chat", label: "Chat", icon: MessagesSquare },
    { value: "history", label: "My season", icon: History },
    { value: "rules", label: "How to play", icon: Flag },
    ...(user?.role === "admin"
      ? [{ value: "admin", label: "Commissioner", icon: ShieldCheck }]
      : []),
  ];
  const activePage = pages.find((page) => page.value === tab)!;
  const activePowerups =
    Number(draft.superSpread) +
    Number(Boolean(draft.totalHelper)) +
    Number(draft.perfectPrediction);
  return (
    <div className="league-app">
      {confirmationDialog}
      {user && (
        <div className="league-dock">
          <BottomDrawer
            title="Pick 4"
            open={navigationOpen}
            onOpenChange={setNavigationOpen}
            classNames={{ content: "league-navigation" }}
            trigger={
              <CustomButton
                variant="unstyled"
                className="league-menu-trigger"
                aria-label={`League menu: ${activePage.label}`}
              >
                <Image
                  src="/nfl/league.png"
                  alt=""
                  width={24}
                  height={28}
                  className="league-menu-logo"
                />
                <span>{activePage.label}</span>
                <ChevronUp size={16} />
              </CustomButton>
            }
          >
            <nav aria-label="League navigation" className="league-menu-items">
              {pages.map(({ value, label, icon: Icon }) => (
                <CustomButton
                  key={value}
                  variant="unstyled"
                  aria-current={tab === value ? "page" : undefined}
                  onClick={() => {
                    setTab(value);
                    setNavigationOpen(false);
                    window.scrollTo({ top: 0, behavior: "instant" });
                  }}
                >
                  <Icon size={19} />
                  <span>{label}</span>
                  {tab === value && <Check size={16} />}
                </CustomButton>
              ))}
            </nav>
            <div className="league-menu-account">
              <CustomButton
                variant="ghost"
                leftIcon={UserRound}
                onClick={() => {
                  setNavigationOpen(false);
                  setAccountOpen(true);
                }}
              >
                Account settings
              </CustomButton>
              <CustomButton
                variant="ghost"
                aria-label="Sign out"
                icon={LogOut}
                disabled={busy}
                onClick={() => {
                  setNavigationOpen(false);
                  void act(async () => {
                    if (dirty && !(await ask("Sign out and discard unsaved picks?")))
                      return;
                    await api("logout", {});
                    window.dispatchEvent(new Event("account-changed"));
                    setDirty(false);
                    await load(week);
                  });
                }}
              />
            </div>
          </BottomDrawer>
          {tab === "board" && (
            <a
              className="mobile-card-jump"
              href="#your-card"
              aria-label={`Review your card: ${count} of 4 picks${dirty ? ", unsaved" : ""}`}
            >
              <span>{count} / 4</span>
              Your card
              <ArrowRight size={16} />
            </a>
          )}
        </div>
      )}
      {(error || notice) && (
        <div
          className={`toast ${error ? "error" : "success"}`}
          role={error ? "alert" : "status"}
        >
          {error || notice}
          <CustomButton
            variant="unstyled"
            aria-label="Dismiss notification"
            onClick={() => {
              setError("");
              setNotice("");
            }}
          >
            <X size={16} />
          </CustomButton>
        </div>
      )}
      {!user ? (
        <SignInPage returnTo="/pick4" ready={data.authentication.ready} />
      ) : (
        <>
          <main id="main-content" className="app-shell">
            <div className="board-toolbar">
              <h1>{activePage.label}</h1>
            </div>
            {["board", "standings", "admin"].includes(tab) && (
              <div className="week-selector">
                <CustomButton
                  variant="unstyled"
                  aria-label="Previous week"
                  disabled={week === 1}
                  onClick={() => changeWeek(week! - 1)}
                >
                  <ChevronLeft size={18} />
                </CustomButton>
                <div className="week-scroll">
                  {Array.from({ length: 18 }, (_, i) => i + 1).map((n) => (
                    <CustomButton
                      variant="unstyled"
                      key={n}
                      aria-pressed={week === n}
                      className={week === n ? "selected" : ""}
                      onClick={() => changeWeek(n)}
                    >
                      <small>WEEK</small>
                      {n}
                      {n === data.currentWeek && <span className="current-dot" />}
                    </CustomButton>
                  ))}
                </div>
                <CustomButton
                  variant="unstyled"
                  aria-label="Next week"
                  disabled={week === 18}
                  onClick={() => changeWeek(week! + 1)}
                >
                  <ChevronRight size={18} />
                </CustomButton>
              </div>
            )}
            {tab === "board" && (
              <>
                <div className={`week-banner ${late ? "warning" : ""}`}>
                  <div>
                    <span className="live-dot" />
                    <strong>
                      {locked
                        ? "Your card is locked"
                        : w.publishedAt
                          ? late
                            ? "Late picks are open"
                            : "Picks are open"
                          : "Preview"}
                    </strong>
                    <span>
                      {locked
                        ? "Results update as games finish."
                        : late
                          ? "−1 point · No powerups · Unstarted games only"
                          : w.publishedAt
                            ? `Submit by ${date(w.deadline, true)} PT`
                            : `Lines freeze ${date(w.freezeAt, true)} PT`}
                    </span>
                  </div>
                  <CustomButton
                    variant="unstyled"
                    className="text-button"
                    aria-label="Refresh games"
                    title="Refresh games"
                    disabled={busy}
                    onClick={() =>
                      act(async () => {
                        await api("refresh", { week });
                        await load(week);
                        setNotice("Game board refreshed.");
                      })
                    }
                  >
                    <RefreshCw size={16} />
                  </CustomButton>
                </div>
                {(w.error || stale) && (
                  <p className="feed-note" role="status">
                    {w.error ?? "The board needs a fresh score update."} Last successful
                    sync: {updated} PT.
                  </p>
                )}
                <div className="board-layout">
                  <section>
                    <h2 className="sr-only">Week {week} matchups</h2>
                    <div className="game-grid" id="game-board">
                      {w.games.map((g) => {
                        const odds = w.publishedAt
                          ? w.lines[g.id]
                          : { homeSpread: g.homeSpread, total: g.total };
                        const spread = odds?.homeSpread ?? null,
                          total = odds?.total ?? null,
                          homeFavorite = spread !== null && spread < 0;
                        const closed =
                          tick >= Date.parse(g.kickoff) ||
                          g.state !== "scheduled" ||
                          !g.timeConfirmed;
                        const selected = PICK_TYPES.find((t) => draft.picks[t] === g.id);
                        const favorite = homeFavorite ? g.home : g.away,
                          underdog = homeFavorite ? g.away : g.home;
                        return (
                          <article
                            className={`game-card ${selected ? "has-pick" : ""}`}
                            key={g.id}
                          >
                            <div className="game-top">
                              <span>
                                {g.state === "final"
                                  ? "FINAL"
                                  : g.state === "live"
                                    ? g.detail
                                    : g.state === "postponed"
                                      ? "POSTPONED"
                                      : g.state === "canceled"
                                        ? "CANCELED"
                                        : g.timeConfirmed
                                          ? date(g.kickoff, true) + " PT"
                                          : "KICKOFF TBD"}
                              </span>
                              {selected ? (
                                <span className="picked-badge">
                                  <Check size={12} />
                                  {labels[selected]}
                                </span>
                              ) : (
                                <span>{g.broadcast}</span>
                              )}
                            </div>
                            <div className="matchup">
                              <div>
                                <TeamMark game={g} side="away" />
                                <span className="team-city">
                                  {g.away.name.slice(0, -g.away.short.length).trim()}
                                </span>
                                <strong>{g.away.short}</strong>
                              </div>
                              <span
                                className={`versus ${g.state === "live" ? "live-score" : ""}`}
                              >
                                {g.homeScore !== null && g.awayScore !== null ? (
                                  <>
                                    <b>{g.awayScore}</b>
                                    <span>–</span>
                                    <b>{g.homeScore}</b>
                                  </>
                                ) : (
                                  "at"
                                )}
                              </span>
                              <div>
                                <TeamMark game={g} side="home" />
                                <span className="team-city">
                                  {g.home.name.slice(0, -g.home.short.length).trim()}
                                </span>
                                <strong>{g.home.short}</strong>
                              </div>
                            </div>
                            <div className="game-options">
                              {PICK_TYPES.map((t) => {
                                const selectedThis = draft.picks[t] === g.id,
                                  conflict = Boolean(selected && selected !== t);
                                const unavailable =
                                  t === "over" || t === "under"
                                    ? total === null
                                    : spread === null || spread === 0;
                                const line =
                                  t === "favorite"
                                    ? `${favorite.abbreviation} ${signed(-Math.abs(spread ?? 0))}`
                                    : t === "underdog"
                                      ? `${underdog.abbreviation} ${signed(Math.abs(spread ?? 0))}`
                                      : `${t === "over" ? "O" : "U"} ${total ?? "—"}`;
                                return (
                                  <CustomButton
                                    variant="unstyled"
                                    key={t}
                                    className={selectedThis ? "chosen" : ""}
                                    aria-pressed={selectedThis}
                                    aria-label={`${labels[t]}: ${unavailable ? "line unavailable" : line}, ${g.away.short} at ${g.home.short}`}
                                    title={
                                      conflict
                                        ? "One pick per game"
                                        : closed
                                          ? "Game locked"
                                          : !w.publishedAt
                                            ? "Preview — lines not yet published"
                                            : labels[t]
                                    }
                                    disabled={
                                      !canPick || closed || conflict || unavailable
                                    }
                                    onClick={() => choose(t, g.id)}
                                  >
                                    <small>{labels[t]}</small>
                                    <strong>{unavailable ? "—" : line}</strong>
                                    {selectedThis && <Check size={12} />}
                                  </CustomButton>
                                );
                              })}
                            </div>
                          </article>
                        );
                      })}
                    </div>
                    <p className="source-note">
                      DraftKings lines via ESPN ·{" "}
                      {w.publishedAt
                        ? `Frozen ${date(w.publishedAt, true)} PT`
                        : "Preview lines may move until published"}
                      <br />
                      Scores updated {updated} PT · All times Pacific
                    </p>
                  </section>
                  <aside className="pick-rail" id="your-card">
                    <section className="pick-slip">
                      <div className="slip-heading">
                        <div>
                          <span className="eyebrow">
                            WEEK {week}
                            {dirty ? " · Unsaved" : own ? " · Saved" : ""}
                          </span>
                          <h2>Your picks</h2>
                        </div>
                        <span className="slip-count">
                          {count}
                          <small>/4</small>
                        </span>
                      </div>
                      <div className="progress">
                        <span style={{ width: `${count * 25}%` }} />
                      </div>
                      {PICK_TYPES.map((t) => {
                        const g = w.games.find((g) => g.id === draft.picks[t]);
                        let text = "Choose a game";
                        if (g) {
                          const odds = w.lines[g.id];
                          const spread = odds?.homeSpread ?? g.homeSpread ?? 0;
                          const home = (t === "favorite") === spread < 0;
                          text =
                            t === "favorite" || t === "underdog"
                              ? `${(home ? g.home : g.away).short} ${signed(home ? spread : -spread)}`
                              : `${g.away.abbreviation} @ ${g.home.abbreviation} · ${t === "over" ? "Over" : "Under"} ${odds?.total ?? g.total}`;
                        }
                        const Icon = slotIcons[t];
                        return (
                          <div className={`slip-slot ${g ? "filled" : ""}`} key={t}>
                            <span className="slot-icon">
                              <Icon size={18} />
                            </span>
                            <div>
                              <small>{labels[t]}</small>
                              <strong>{text}</strong>
                              {own && own.score.outcomes[t] !== "pending" && !dirty && (
                                <span className={`outcome ${own.score.outcomes[t]}`}>
                                  {own.score.outcomes[t]}
                                </span>
                              )}
                            </div>
                            {g && !locked && (
                              <CustomButton
                                variant="unstyled"
                                className="icon-button"
                                aria-label={`Remove ${labels[t]} pick`}
                                onClick={() => choose(t, "")}
                              >
                                <X size={14} />
                              </CustomButton>
                            )}
                          </div>
                        );
                      })}
                      <details
                        className="powerups"
                        key={`${week}-${own?.revision ?? "draft"}`}
                        open={activePowerups > 0 || undefined}
                      >
                        <summary>
                          <Zap size={16} />
                          <span>Powerups</span>
                          <small>
                            {activePowerups ? `${activePowerups} active` : "Optional"}
                          </small>
                          <ChevronDown size={16} />
                        </summary>
                        <p className="powerups-note">
                          Optional · Editable with your picks until the weekly deadline.
                        </p>
                        <label className="power-row">
                          <span>
                            <Zap size={16} />
                            <b>Super Spread</b>
                            <small>
                              {used("superSpread")
                                ? "Used this season"
                                : "Double the spread · 2.5 pts"}
                            </small>
                          </span>
                          <Checkbox
                            checked={draft.superSpread}
                            disabled={!canPick || late || used("superSpread")}
                            onCheckedChange={(checked) => {
                              setDirty(true);
                              setDraft((d) => ({
                                ...d,
                                superSpread: checked,
                              }));
                            }}
                          />
                        </label>
                        <label className="power-row">
                          <span>
                            <Target size={16} />
                            <b>Total Helper</b>
                            <small>
                              {used("totalHelper")
                                ? "Used this season"
                                : "5 points in your favor"}
                            </small>
                          </span>
                          <select
                            aria-label="Total Helper target"
                            value={draft.totalHelper ?? ""}
                            disabled={!canPick || late || used("totalHelper")}
                            onChange={(e) => {
                              setDirty(true);
                              setDraft((d) => ({
                                ...d,
                                totalHelper: (e.target.value ||
                                  null) as PickInput["totalHelper"],
                              }));
                            }}
                          >
                            <option value="">Off</option>
                            <option value="over">Over</option>
                            <option value="under">Under</option>
                          </select>
                        </label>
                        <label className="power-row">
                          <span>
                            <Sparkles size={16} />
                            <b>Perfect Prediction</b>
                            <small>
                              {used("perfectPrediction")
                                ? "Used this season"
                                : "Call a perfect week · 8 pts"}
                            </small>
                          </span>
                          <Checkbox
                            checked={draft.perfectPrediction}
                            disabled={!canPick || late || used("perfectPrediction")}
                            onCheckedChange={(checked) => {
                              setDirty(true);
                              setDraft((d) => ({
                                ...d,
                                perfectPrediction: checked,
                              }));
                            }}
                          />
                        </label>
                      </details>
                      <CustomButton
                        variant="unstyled"
                        className="primary save-button"
                        disabled={busy || count !== 4 || !canPick}
                        onClick={submit}
                      >
                        {busy
                          ? "Saving…"
                          : locked
                            ? "Picks locked"
                            : own && !dirty
                              ? "Edit picks"
                              : own
                                ? buyInPending
                                  ? "Update pending picks"
                                  : "Update picks"
                                : late
                                  ? "Submit late picks (−1)"
                                  : "Submit picks"}
                        {locked ? <LockKeyhole size={17} /> : <ArrowRight size={17} />}
                      </CustomButton>
                      <p className="slip-foot">
                        {buyInPending
                          ? `Payment is pending · You can edit until ${date(w.deadline, true)} PT`
                          : locked
                            ? "Your card is final for this week."
                            : own
                              ? `Saved ${date(own.updatedAt, true)} PT · Editable until ${date(w.deadline, true)} PT`
                              : w.publishedAt
                                ? "Your picks stay private until the weekly deadline."
                                : "Picks open when the weekly lines are published."}
                      </p>
                    </section>
                  </aside>
                </div>
              </>
            )}
            {tab === "standings" && (
              <section className="panel">
                <div className="section-heading">
                  <h2>Season standings</h2>
                  <span>
                    {data.standings.length} PLAYERS · WEEK {week}
                  </span>
                </div>
                <div className="table-scroll">
                  <table>
                    <thead>
                      <tr>
                        <th>Rank</th>
                        <th>Player</th>
                        <th>Points</th>
                        <th>Week {week}</th>
                        <th>Wins</th>
                        <th>Perfect</th>
                        <th>Played</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.standings.map((s, i) => (
                        <tr key={s.id} className={s.id === user.id ? "you" : ""}>
                          <td>
                            {s.points === 0
                              ? "—"
                              : data.standings.findIndex(
                                  (p) =>
                                    p.points === s.points &&
                                    p.perfect === s.perfect &&
                                    p.wins === s.wins,
                                ) + 1}
                          </td>
                          <td className="player-cell">
                            <PlayerAvatar
                              name={s.name}
                              userId={s.id}
                              revision={s.avatarRevision}
                            />
                            <b>{s.name}</b>
                            {s.id === user.id && <small className="you-label">YOU</small>}
                          </td>
                          <td className="points">{s.points}</td>
                          <td>
                            {s.weekPoints}
                            <small className="submitted-label">
                              {s.submitted ? "Submitted" : "No card"}
                            </small>
                          </td>
                          <td>{s.wins}</td>
                          <td>{s.perfect}</td>
                          <td>{s.played}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <p className="source-note">
                  Ties break by perfect weeks, then winning picks. Matching records share
                  a rank. Pending picks score only when final.
                </p>
                <h3 className="subheading">Week {week} cards</h3>
                <div className="entry-grid">
                  {data.entries.length ? (
                    data.entries.map((e) => (
                      <div className="entry-card" key={e.id}>
                        <div className="section-heading">
                          <strong className="player-cell">
                            <PlayerAvatar
                              name={
                                data.standings.find((s) => s.id === e.userId)?.name ??
                                "Player"
                              }
                              userId={e.userId}
                              revision={
                                data.standings.find((s) => s.id === e.userId)
                                  ?.avatarRevision ?? 0
                              }
                            />
                            {data.standings.find((s) => s.id === e.userId)?.name}
                          </strong>
                          <b>{e.score.points} pts</b>
                        </div>
                        {e.picks ? (
                          PICK_TYPES.map((t) => (
                            <div className="entry-pick" key={t}>
                              <span>
                                <small>{labels[t]}</small>
                                {e.picks![t].label}
                              </span>
                              <span className={`outcome ${e.score.outcomes[t]}`}>
                                {e.score.outcomes[t]}
                              </span>
                            </div>
                          ))
                        ) : (
                          <p>
                            <LockKeyhole size={16} /> Picks reveal at the weekly deadline.
                          </p>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="empty-state">
                      <Flag />
                      <h3>The first card is still to come.</h3>
                      <p>Submitted cards will appear here.</p>
                    </div>
                  )}
                </div>
              </section>
            )}
            {tab === "chat" && (
              <LeagueChat
                userId={user.id}
                busy={busy}
                onBusy={setBusy}
                onError={setError}
              />
            )}
            {tab === "history" && (
              <section className="panel">
                <div className="section-heading">
                  <h2>Your weekly cards</h2>
                  <span>
                    {data.history.length} {data.history.length === 1 ? "WEEK" : "WEEKS"}{" "}
                    PLAYED
                  </span>
                </div>
                {data.history.length ? (
                  <Accordion
                    defaultValue={data.history
                      .filter((e) => e.week === data.currentWeek)
                      .map((e) => e.id)}
                  >
                    {data.history.map((e) => (
                      <AccordionItem className="history-card" key={e.id} value={e.id}>
                        <AccordionTrigger>
                          <strong>Week {e.week}</strong>
                          <span>
                            {e.score.perfect
                              ? "Perfect week"
                              : `${e.score.wins} wins · ${e.score.complete ? "Final" : "In progress"}`}
                          </span>
                          <b>{e.score.points} pts</b>
                        </AccordionTrigger>
                        <AccordionContent>
                          <div className="history-picks">
                            {PICK_TYPES.map((t) => (
                              <div className="entry-pick" key={t}>
                                <span>
                                  <small>{labels[t]}</small>
                                  {e.picks[t].label}
                                </span>
                                <span className={`outcome ${e.score.outcomes[t]}`}>
                                  {e.score.outcomes[t]}
                                </span>
                              </div>
                            ))}
                          </div>
                          <p className="source-note">
                            Saved {date(e.updatedAt, true)} PT{" "}
                            {e.late ? "· Late entry (−1 point)" : ""}
                            {e.superSpread ? " · Super Spread" : ""}
                            {e.totalHelper ? ` · Total Helper: ${e.totalHelper}` : ""}
                            {e.perfectPrediction ? " · Perfect Prediction" : ""}
                          </p>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                ) : (
                  <div className="empty-state">
                    <History size={36} />
                    <h3>No picks yet</h3>
                    <p>Your submitted cards and results will appear here.</p>
                    <CustomButton
                      variant="unstyled"
                      className="primary"
                      onClick={() => setTab("board")}
                    >
                      Go to the game board
                      <ArrowRight size={17} />
                    </CustomButton>
                  </div>
                )}
              </section>
            )}
            {tab === "rules" && <Rules />}
            {tab === "admin" && data.admin && (
              <div className="admin-grid">
                <section className="panel">
                  <div className="section-heading">
                    <h2>Share the league</h2>
                    <UserRound size={20} />
                  </div>
                  <p>
                    Send friends the league link. Everyone who signs in with Google joins
                    this league automatically.
                  </p>
                  <CustomButton
                    variant="unstyled"
                    className="primary"
                    onClick={() =>
                      act(async () => {
                        await navigator.clipboard.writeText(`${location.origin}/pick4`);
                        setNotice("League link copied.");
                      })
                    }
                  >
                    <Clipboard size={17} /> Copy league link
                  </CustomButton>
                </section>
                <section className="panel">
                  <div className="section-heading">
                    <h2>Week 1 buy-ins</h2>
                    <span>$75 EACH</span>
                  </div>
                  {data.admin.pendingBuyIns.length ? (
                    <div className="buy-in-list">
                      {data.admin.pendingBuyIns.map((payment) => (
                        <div className="buy-in-row" key={payment.userId}>
                          <span>
                            <b>{payment.name}</b>
                            <small>Requested {date(payment.requestedAt, true)} PT</small>
                          </span>
                          <CustomButton
                            variant="unstyled"
                            className="secondary"
                            disabled={busy}
                            onClick={() =>
                              void act(async () => {
                                await api("admin/buy-ins/confirm", {
                                  userId: payment.userId,
                                });
                                await load(week);
                                setNotice(`${payment.name}'s $75 buy-in is confirmed.`);
                              })
                            }
                          >
                            <Check size={16} /> Confirm
                          </CustomButton>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="buy-in-empty">
                      No Week 1 payments are waiting to be confirmed.
                    </p>
                  )}
                </section>
                <section className="panel">
                  <h2>Week {week} operations</h2>
                  <div className="operation-status">
                    <span className="live-dot" />
                    <strong>
                      {w.publishedAt ? "Lines are frozen" : "Lines are in preview"}
                    </strong>
                  </div>
                  <p>
                    {w.publishedAt
                      ? `Published ${date(w.publishedAt, true)} PT. Everyone plays the same lines.`
                      : `Automatic publication: ${date(w.freezeAt, true)} PT. You can publish the current lines early to open picks now.`}
                  </p>
                  <CustomButton
                    variant="unstyled"
                    className="primary"
                    disabled={busy || Boolean(w.publishedAt) || tick >= w.deadline}
                    onClick={() =>
                      act(async () => {
                        if (
                          !(await ask(
                            `Freeze the current Week ${week} lines and open picks? Published lines cannot be changed.`,
                          ))
                        )
                          return;
                        await api("admin/publish", { week });
                        await load(week);
                        setNotice(`Week ${week} lines published. Picks are open.`);
                      })
                    }
                  >
                    Publish lines now
                    <Flag size={17} />
                  </CustomButton>
                  <CustomButton
                    variant="unstyled"
                    className="secondary"
                    disabled={busy}
                    onClick={() =>
                      act(async () => {
                        await api("refresh", { week });
                        await load(week);
                        setNotice("Scores and schedule refreshed.");
                      })
                    }
                  >
                    <RefreshCw size={16} />
                    Refresh scores & schedule
                  </CustomButton>
                  <a className="secondary" href="/api/export">
                    <Download size={16} />
                    Export league data
                  </a>
                  <p className="source-note">
                    Data includes all picks, frozen lines, results, and the audit log.
                    Google credentials are never included.
                  </p>
                </section>
                <section className="panel">
                  <h2>League members</h2>
                  {data.admin.members.map((m) => (
                    <div className="admin-row" key={m.id}>
                      <span className="player-cell">
                        <PlayerAvatar
                          name={m.name}
                          userId={m.id}
                          revision={m.avatarRevision}
                        />
                        <span>
                          <b>{m.name}</b>
                          <small>
                            {m.email} · {m.role === "admin" ? "Commissioner" : "Player"}
                          </small>
                        </span>
                      </span>
                    </div>
                  ))}
                </section>
                <section className="panel">
                  <h2>Set a missing line</h2>
                  <p>
                    Use a verified pregame line when the feed is unavailable. Home spread
                    is negative when the home team is favored. Published lines cannot be
                    changed.
                  </p>
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      const form = new FormData(e.currentTarget);
                      void act(async () => {
                        await api("admin/lines", {
                          week,
                          gameId: form.get("gameId"),
                          homeSpread:
                            form.get("homeSpread") === ""
                              ? null
                              : Number(form.get("homeSpread")),
                          total:
                            form.get("total") === "" ? null : Number(form.get("total")),
                          reason: form.get("reason"),
                        });
                        await load(week);
                        setNotice("Pregame line updated and logged.");
                      });
                    }}
                  >
                    <label>
                      Matchup
                      <LeagueSelect
                        name="gameId"
                        required
                        disabled={Boolean(w.publishedAt)}
                      >
                        <option value="">Select a game</option>
                        {w.games.map((g) => (
                          <option key={g.id} value={g.id}>
                            {g.away.short} @ {g.home.short}
                          </option>
                        ))}
                      </LeagueSelect>
                    </label>
                    <div className="form-columns">
                      <label>
                        Home spread
                        <Input
                          name="homeSpread"
                          type="number"
                          min={-50}
                          max={50}
                          step={0.5}
                          placeholder="−3.5"
                          disabled={Boolean(w.publishedAt)}
                        />
                      </label>
                      <label>
                        Total
                        <Input
                          name="total"
                          type="number"
                          min={1}
                          max={150}
                          step={0.5}
                          placeholder="44.5"
                          disabled={Boolean(w.publishedAt)}
                        />
                      </label>
                    </div>
                    <label>
                      Source and reason
                      <Input
                        name="reason"
                        minLength={8}
                        maxLength={300}
                        required
                        disabled={Boolean(w.publishedAt)}
                        placeholder="Verified source for this line"
                      />
                    </label>
                    <CustomButton
                      variant="unstyled"
                      className="secondary"
                      disabled={busy || Boolean(w.publishedAt) || tick >= w.deadline}
                    >
                      Save pregame line
                    </CustomButton>
                  </form>
                </section>
                <section className="panel">
                  <h2>Correct a result</h2>
                  <p>
                    Use only for a confirmed scoring error. Corrections are recorded and
                    standings recalculate automatically.
                  </p>
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      const form = new FormData(e.currentTarget);
                      void act(async () => {
                        await api("admin/score", {
                          week,
                          gameId: form.get("gameId"),
                          homeScore: Number(form.get("homeScore")),
                          awayScore: Number(form.get("awayScore")),
                          state: form.get("state"),
                          reason: form.get("reason"),
                        });
                        await load(week);
                        setNotice("Result corrected. Standings recalculated.");
                      });
                    }}
                  >
                    <label>
                      Game
                      <LeagueSelect name="gameId" required>
                        <option value="">Select a completed game</option>
                        {w.games
                          .filter((g) => tick >= Date.parse(g.kickoff))
                          .map((g) => (
                            <option value={g.id} key={g.id}>
                              {g.away.short} @ {g.home.short}
                            </option>
                          ))}
                      </LeagueSelect>
                    </label>
                    <div className="form-columns">
                      <label>
                        Away score
                        <Input
                          type="number"
                          name="awayScore"
                          min={0}
                          max={100}
                          required
                        />
                      </label>
                      <label>
                        Home score
                        <Input
                          type="number"
                          name="homeScore"
                          min={0}
                          max={100}
                          required
                        />
                      </label>
                    </div>
                    <label>
                      Result
                      <LeagueSelect name="state">
                        <option value="final">Final score</option>
                        <option value="canceled">Canceled / void</option>
                      </LeagueSelect>
                    </label>
                    <label>
                      Reason
                      <Input
                        name="reason"
                        minLength={8}
                        maxLength={300}
                        required
                        placeholder="Why is this correction needed?"
                      />
                    </label>
                    <CustomButton
                      variant="unstyled"
                      className="secondary"
                      disabled={busy}
                    >
                      Save correction
                    </CustomButton>
                  </form>
                </section>
                <section className="panel audit-panel">
                  <h2>League activity</h2>
                  {data.admin.audit.map((a, i) => (
                    <div className="audit-row" key={i}>
                      <time>{date(a.at, true)}</time>
                      <span>
                        <b>{a.action.replaceAll("-", " ")}</b>
                        <small>{a.detail}</small>
                      </span>
                    </div>
                  ))}
                </section>
              </div>
            )}
          </main>
        </>
      )}
      {user && (
        <ResponsiveDialog
          open={buyInOpen}
          onOpenChange={setBuyInOpen}
          title="Week 1 buy-in"
          size="sm"
        >
          <div className="buy-in-dialog">
            <p>
              Send your $75 season buy-in to Jack on Venmo, then mark this card as paid.
            </p>
            <div className="buy-in-amount">
              <span>Season buy-in</span>
              <strong>$75</strong>
            </div>
            <div className="venmo-code">
              <Image
                src="/nfl/venmo-jrocca.png"
                alt="Venmo QR code for Jack Rocca, @jrocca"
                width={1179}
                height={2556}
                sizes="280px"
              />
            </div>
            <p className="venmo-handle">
              <strong>@jrocca</strong>
              <span>Use the note “Pick 4 · {user.name}”.</span>
            </p>
            <a
              className="secondary venmo-link"
              href="https://venmo.com/u/jrocca"
              target="_blank"
              rel="noreferrer"
            >
              Open Venmo <ArrowUpRight size={16} />
            </a>
            <CustomButton
              variant="unstyled"
              className="primary buy-in-confirm"
              disabled={busy}
              onClick={() => {
                void save().then((saved) => {
                  if (saved) setBuyInOpen(false);
                });
              }}
            >
              I sent $75 <ArrowRight size={17} />
            </CustomButton>
            <p className="buy-in-disclaimer">
              Your card stays private and payment pending until Jack confirms the Venmo
              transfer.
            </p>
          </div>
        </ResponsiveDialog>
      )}
      {user && (
        <ResponsiveDialog
          open={accountOpen}
          onOpenChange={setAccountOpen}
          title="Your account"
          size="sm"
        >
          <div className="account-form">
            <p>Connected with Google · {user.email}</p>
            <ProfilePhotoField
              name={user.name}
              userId={user.id}
              revision={user.avatarRevision}
              disabled={busy}
              onRevision={() => void load(week)}
              onNotice={setNotice}
              onError={setError}
            />
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const form = new FormData(e.currentTarget);
                void act(async () => {
                  await api("profile", { name: form.get("name") });
                  window.dispatchEvent(new Event("account-changed"));
                  await load(week);
                  setAccountOpen(false);
                  setNotice("Display name updated.");
                });
              }}
            >
              <label>
                League display name
                <Input
                  name="name"
                  defaultValue={user.name}
                  minLength={2}
                  maxLength={40}
                  autoComplete="nickname"
                  required
                />
              </label>
              <CustomButton variant="unstyled" className="primary" disabled={busy}>
                Save display name
              </CustomButton>
            </form>
          </div>
        </ResponsiveDialog>
      )}
    </div>
  );
}
function Rules() {
  return (
    <div className="rules-grid">
      <section className="panel rules-intro">
        <span className="eyebrow">THE WEEKLY CARD</span>
        <h2>
          Four games.
          <br />
          Four ways to call it.
        </h2>
        <p>
          Each week, choose exactly one favorite against the spread, one underdog against
          the spread, one over, and one under. Every pick must be from a different game.
        </p>
        <div className="scoring-strip">
          <span>
            <strong>1</strong>win
          </span>
          <span>
            <strong>½</strong>push
          </span>
          <span>
            <strong>5</strong>perfect week
          </span>
        </div>
      </section>
      <section className="panel">
        <h2>The clock matters.</h2>
        <p>
          DraftKings lines freeze on Wednesday at 9 AM Pacific, or earlier if the
          commissioner publishes them. Everyone uses those same lines.
        </p>
        <p>
          The weekly deadline is usually the first scheduled kickoff. For Week 1, the
          Wednesday night Seahawks–Patriots opener and Thursday’s Australia game do not
          lock the board. You can submit or edit a card, punishment-free, until Sunday,
          September 13 at 10:00 AM Pacific, when the Sunday slate starts. Started games
          cannot be selected.
        </p>
        <p>
          Missed it? You may submit one late card using four games that have not started.
          Late cards lose one point (minimum zero), cannot use powerups, and lock
          immediately.
        </p>
        <p>
          Games with unconfirmed kickoff times or unavailable lines cannot be selected.
          Opponents’ cards reveal at the weekly deadline.
        </p>
      </section>
      <section className="panel">
        <Zap className="rule-icon" />
        <h2>Super Spread</h2>
        <p>
          Once per season, take a favorite of −5 or greater and double the spread. A −6
          favorite must cover −12.
        </p>
        <p>
          Beat the doubled line for 2.5 points. Push it for 1 point. Miss it for 0. The
          ordinary perfect-week bonus does not apply when Super Spread is active.
        </p>
      </section>
      <section className="panel">
        <Target className="rule-icon" />
        <h2>Total Helper</h2>
        <p>
          Once per season, give your over or under a five-point advantage. Over 45 becomes
          over 40; under 45 becomes under 50.
        </p>
        <p>
          Choose one total to help. It scores normally and can still contribute to a
          perfect week.
        </p>
      </section>
      <section className="panel">
        <Sparkles className="rule-icon" />
        <h2>Perfect Prediction</h2>
        <p>
          Once per season, call your shot. If all four picks win, your card scores 8
          points instead of the usual 5.
        </p>
        <p>
          Otherwise, normal scoring applies. You can combine powerups. If combined with
          Super Spread, the favorite must beat the doubled spread; a perfect card totals 8
          points.
        </p>
      </section>
      <section className="panel">
        <Trophy className="rule-icon" />
        <h2>The standings</h2>
        <p>
          Season points come first, followed by perfect weeks and winning picks. Matching
          records share a rank.
        </p>
        <p>
          Only final scores settle picks. Pushes earn half a point and do not count as
          wins. A canceled game is void and earns half a point; it cannot complete a
          perfect week. Postponed games remain pending.
        </p>
        <p>
          Results refresh automatically. Commissioner corrections are logged and
          recalculate the standings. Powerups can be changed before the weekly deadline;
          each is available once during the season.
        </p>
      </section>
    </div>
  );
}
