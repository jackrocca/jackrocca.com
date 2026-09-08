"use client";
import { useCallback, useEffect, useState } from "react";
import {
  ArrowRight,
  ArrowUpRight,
  Check,
  ChevronLeft,
  ChevronRight,
  Clipboard,
  Flag,
  Grid2X2,
  History,
  LockKeyhole,
  LogOut,
  RefreshCw,
  ShieldCheck,
  Trophy,
  X,
  Zap,
  Target,
  Sparkles,
  Download,
  UserRound,
} from "lucide-react";
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
  favorite: Flag,
  underdog: Zap,
  over: ArrowUpRight,
  under: Target,
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
  return (
    <span className="team-mark" style={{ background: team.color }}>
      {team.abbreviation}
    </span>
  );
}
export default function League() {
  const [data, setData] = useState<AppView | null>(null),
    [week, setWeek] = useState<number | null>(null),
    [tab, setTab] = useState("board"),
    [draft, setDraft] = useState<PickInput>(blank),
    [dirty, setDirty] = useState(false),
    [busy, setBusy] = useState(false),
    [notice, setNotice] = useState(""),
    [error, setError] = useState(""),
    [tick, setTick] = useState(Date.now()),
    [filter, setFilter] = useState<PickType | "all">("all"),
    [accountOpen, setAccountOpen] = useState(false);
  const load = useCallback(async (number: number | null) => {
    try {
      const result = (await api(
        `state${number ? `?week=${number}` : ""}`,
      )) as AppView;
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
      canceled:
        "Google sign-in was canceled. You can try again whenever you’re ready.",
      failed: "Google sign-in could not be completed. Please try again.",
      unavailable:
        "Google sign-in is being connected. Please check back shortly.",
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
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  async function changeWeek(number: number) {
    if (dirty && !confirm("Discard your unsaved picks and change weeks?"))
      return;
    setDirty(false);
    setFilter("all");
    await load(number);
  }
  async function save() {
    await act(async () => {
      await api("picks", draft);
      setDirty(false);
      await load(week);
      setNotice("Your four picks are saved.");
    });
  }
  if (!data)
    return (
      <main className="loading">
        <div className="brand-mark">4</div>
        <h1>Pick 4</h1>
        <p>{error || "Getting the league ready…"}</p>
        {error && <button onClick={() => load(null)}>Try again</button>}
      </main>
    );
  const w = data.week,
    user = data.user,
    own = data.entries.find((e) => e.userId === user?.id),
    locked = tick >= w.deadline && Boolean(own),
    late = tick >= w.deadline && !own,
    canPick = Boolean(user && w.publishedAt && !locked),
    count = PICK_TYPES.filter((t) => draft.picks[t]).length;
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
  const games = w.games.filter(
    (g) =>
      filter === "all" ||
      (filter === "over" || filter === "under"
        ? (w.publishedAt ? w.lines[g.id]?.total : g.total) != null
        : (w.publishedAt ? w.lines[g.id]?.homeSpread : g.homeSpread) != null),
  );
  const leagueLeader = data.standings[0];
  return (
    <>
      <header className="topbar">
        <a className="brand" href="/" aria-label="Pick 4 home">
          <span className="brand-mark">4</span>
          <span>
            PICK <b>4</b>
            <small>THE LEAGUE</small>
          </span>
        </a>
        <div className="season-pill">
          <span />
          2026 SEASON
        </div>
        {user ? (
          <div className="user-menu">
            <button
              className="avatar-button"
              onClick={() => setAccountOpen(!accountOpen)}
              aria-label="Account settings"
            >
              <span className="avatar">{user.name.slice(0, 1)}</span>
              <span>{user.name}</span>
            </button>
            <button
              className="icon-button"
              title="Sign out"
              aria-label="Sign out"
              onClick={() =>
                act(async () => {
                  if (dirty && !confirm("Sign out and discard unsaved picks?"))
                    return;
                  await api("logout", {});
                  setDirty(false);
                  await load(week);
                })
              }
            >
              <LogOut size={18} />
            </button>
          </div>
        ) : (
          <span className="private-label">
            <LockKeyhole size={14} /> JACK’S LEAGUE
          </span>
        )}
      </header>
      {(error || notice) && (
        <div
          className={`toast ${error ? "error" : "success"}`}
          role={error ? "alert" : "status"}
        >
          {error || notice}
          <button
            aria-label="Dismiss notification"
            onClick={() => {
              setError("");
              setNotice("");
            }}
          >
            <X size={16} />
          </button>
        </div>
      )}
      {!user ? (
        <main className="welcome">
          <section className="welcome-copy">
            <div className="eyebrow">
              <span />
              THE 2026 NFL SEASON
            </div>
            <h1>
              Four picks.
              <br />
              One <em>perfect</em>
              <br />
              week.
            </h1>
            <p>
              A favorite. An underdog. An over. An under.
              <br />
              Back your instincts. Make every game count.
            </p>
            <div className="welcome-stat">
              <span>
                <strong>18</strong>weeks
              </span>
              <span>
                <strong>4</strong>picks
              </span>
              <span>
                <strong>1</strong>league
              </span>
            </div>
            <div className="kickoff-note">
              <Flag size={18} />
              <span>
                Season kickoff
                <br />
                <b>September 9 · 5:20 PM PT</b>
              </span>
            </div>
          </section>
          <section className="login-card">
            <span className="eyebrow">JACK’S PICK 4 LEAGUE</span>
            <h2>Get in the game.</h2>
            <p>
              Sign in with Google to join the league, make your picks, and
              follow the season.
            </p>
            {data.authentication.ready ? (
              <a className="google-signin" href="/api/auth/google">
                <GoogleMark /> Continue with Google
              </a>
            ) : (
              <button className="google-signin" disabled>
                <GoogleMark /> Google sign-in is being connected
              </button>
            )}
            <div className="login-foot">
              <ShieldCheck size={17} />
              <span>
                Your account automatically joins Jack’s league. Choose your
                league display name after signing in.
              </span>
            </div>
            <a className="text-button" href="/privacy">
              Privacy
            </a>
          </section>
          <footer>
            FAVORITE · UNDERDOG · OVER · UNDER<span>2026 / PICK 4</span>
          </footer>
        </main>
      ) : (
        <>
          <nav className="main-nav" aria-label="Main navigation">
            {[
              { key: "board", name: "Game board", Icon: Grid2X2 },
              { key: "standings", name: "Standings", Icon: Trophy },
              { key: "history", name: "My season", Icon: History },
              { key: "rules", name: "How to play", Icon: Flag },
              ...(user.role === "admin"
                ? [{ key: "admin", name: "Commissioner", Icon: ShieldCheck }]
                : []),
            ].map(({ key, name, Icon }) => (
              <button
                key={key}
                className={tab === key ? "active" : ""}
                onClick={() => setTab(key)}
              >
                <Icon size={17} />
                {name}
              </button>
            ))}
          </nav>
          <main className="app-shell">
            {tab === "board" && (
              <a className="mobile-card-jump" href="#your-card">
                <span>
                  {count} / 4 picks {dirty ? "· Unsaved" : own ? "· Saved" : ""}
                </span>
                Review your card
                <ArrowRight size={16} />
              </a>
            )}
            <section className="page-heading">
              <div>
                <div className="eyebrow">THE LEAGUE / 2026</div>
                <h1>
                  {tab === "board"
                    ? "Trust your picks."
                    : tab === "standings"
                      ? "The race is on."
                      : tab === "history"
                        ? "Your season, so far."
                        : tab === "admin"
                          ? "Commissioner’s desk."
                          : "Four picks. That’s it."}
                </h1>
                <p>
                  {tab === "board"
                    ? "Four different games. A whole week on the line."
                    : tab === "standings"
                      ? "Every half point counts."
                      : tab === "history"
                        ? "Every pick, every result, all season long."
                        : tab === "admin"
                          ? "Keep the league running smoothly."
                          : "A little strategy. A little conviction. A lot of football."}
                </p>
              </div>
              <div className="heading-stat">
                <span>
                  {tab === "board"
                    ? "YOUR WEEK"
                    : tab === "standings"
                      ? "LEAGUE MEMBERS"
                      : "REGULAR SEASON"}
                </span>
                <strong>
                  {tab === "board"
                    ? `${count} / 4`
                    : tab === "standings"
                      ? data.standings.length
                      : 18}
                </strong>
                <small>
                  {tab === "board"
                    ? dirty
                      ? "Unsaved changes"
                      : own
                        ? "Picks submitted"
                        : "Picks to make"
                    : tab === "standings"
                      ? "players competing"
                      : "weeks of football"}
                </small>
              </div>
            </section>
            {["board", "standings", "admin"].includes(tab) && (
              <div className="week-selector">
                <button
                  aria-label="Previous week"
                  disabled={week === 1}
                  onClick={() => changeWeek(week! - 1)}
                >
                  <ChevronLeft size={18} />
                </button>
                <div className="week-scroll">
                  {Array.from({ length: 18 }, (_, i) => i + 1).map((n) => (
                    <button
                      key={n}
                      aria-pressed={week === n}
                      className={week === n ? "selected" : ""}
                      onClick={() => changeWeek(n)}
                    >
                      <small>WEEK</small>
                      {n}
                      {n === data.currentWeek && (
                        <span className="current-dot" />
                      )}
                    </button>
                  ))}
                </div>
                <button
                  aria-label="Next week"
                  disabled={week === 18}
                  onClick={() => changeWeek(week! + 1)}
                >
                  <ChevronRight size={18} />
                </button>
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
                          : "Preview the week"}
                    </strong>
                    <span>
                      {locked
                        ? "Follow your picks as the games finish."
                        : late
                          ? "−1 point · No powerups · Unstarted games only"
                          : w.publishedAt
                            ? `Submit by ${date(w.deadline, true)} PT`
                            : `Lines freeze ${date(w.freezeAt, true)} PT`}
                    </span>
                  </div>
                  <button
                    className="text-button"
                    disabled={busy}
                    onClick={() =>
                      act(async () => {
                        await api("refresh", { week });
                        await load(week);
                        setNotice("Game board refreshed.");
                      })
                    }
                  >
                    <RefreshCw size={14} />
                    Refresh
                  </button>
                </div>
                {(w.error || stale) && (
                  <p className="feed-note" role="status">
                    {w.error ?? "The board needs a fresh score update."} Last
                    successful sync: {updated} PT.
                  </p>
                )}
                <div className="board-layout">
                  <section>
                    <div className="section-heading">
                      <h2>
                        Week {week} matchups <span>{w.games.length}</span>
                      </h2>
                      <div className="board-filter">
                        {(["all", ...PICK_TYPES] as const).map((t) => (
                          <button
                            key={t}
                            className={filter === t ? "active" : ""}
                            onClick={() => setFilter(t)}
                          >
                            {t === "all" ? "All" : labels[t]}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="game-grid">
                      {games.map((g, i) => {
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
                        const selected = PICK_TYPES.find(
                          (t) => draft.picks[t] === g.id,
                        );
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
                                  {g.away.name
                                    .slice(0, -g.away.short.length)
                                    .trim()}
                                </span>
                                <strong>{g.away.short}</strong>
                              </div>
                              <span
                                className={`versus ${g.state === "live" ? "live-score" : ""}`}
                              >
                                {g.homeScore !== null &&
                                g.awayScore !== null ? (
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
                                  {g.home.name
                                    .slice(0, -g.home.short.length)
                                    .trim()}
                                </span>
                                <strong>{g.home.short}</strong>
                              </div>
                            </div>
                            <div className="game-options">
                              {PICK_TYPES.map((t) => {
                                const selectedThis = draft.picks[t] === g.id,
                                  conflict = Boolean(
                                    selected && selected !== t,
                                  );
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
                                  <button
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
                                      !canPick ||
                                      closed ||
                                      conflict ||
                                      unavailable
                                    }
                                    onClick={() => choose(t, g.id)}
                                  >
                                    <small>{labels[t]}</small>
                                    <strong>{unavailable ? "—" : line}</strong>
                                    {selectedThis && <Check size={12} />}
                                  </button>
                                );
                              })}
                            </div>
                            <div className="game-footer">
                              <span>{g.venue}</span>
                              {closed ? (
                                <span>
                                  <LockKeyhole size={11} />
                                  Locked
                                </span>
                              ) : (
                                <span>
                                  {w.publishedAt
                                    ? "Frozen line"
                                    : "Preview line"}
                                </span>
                              )}
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
                          <span className="eyebrow">YOUR WEEK {week} CARD</span>
                          <h2>Make your four.</h2>
                        </div>
                        <span className="slip-count">
                          {count}
                          <small>/4</small>
                        </span>
                      </div>
                      <div className="progress">
                        <span style={{ width: `${count * 25}%` }} />
                      </div>
                      {PICK_TYPES.map((t, i) => {
                        const g = w.games.find((g) => g.id === draft.picks[t]);
                        let text = "Choose a game from the board";
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
                          <div
                            className={`slip-slot ${g ? "filled" : ""}`}
                            key={t}
                          >
                            <span className="slot-icon">
                              <Icon size={18} />
                            </span>
                            <div>
                              <small>{labels[t]}</small>
                              <strong>{text}</strong>
                              {own &&
                                own.score.outcomes[t] !== "pending" &&
                                !dirty && (
                                  <span
                                    className={`outcome ${own.score.outcomes[t]}`}
                                  >
                                    {own.score.outcomes[t]}
                                  </span>
                                )}
                            </div>
                            {g && !locked && (
                              <button
                                className="icon-button"
                                aria-label={`Remove ${labels[t]} pick`}
                                onClick={() => choose(t, "")}
                              >
                                <X size={14} />
                              </button>
                            )}
                          </div>
                        );
                      })}
                      <div className="powerups">
                        <div className="section-heading">
                          <h3>Season powerups</h3>
                          <span>ONE USE EACH</span>
                        </div>
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
                          <input
                            type="checkbox"
                            checked={draft.superSpread}
                            disabled={!canPick || late || used("superSpread")}
                            onChange={(e) => {
                              setDirty(true);
                              setDraft((d) => ({
                                ...d,
                                superSpread: e.target.checked,
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
                          <input
                            type="checkbox"
                            checked={draft.perfectPrediction}
                            disabled={
                              !canPick || late || used("perfectPrediction")
                            }
                            onChange={(e) => {
                              setDirty(true);
                              setDraft((d) => ({
                                ...d,
                                perfectPrediction: e.target.checked,
                              }));
                            }}
                          />
                        </label>
                      </div>
                      <button
                        className="primary save-button"
                        disabled={
                          busy ||
                          count !== 4 ||
                          !canPick ||
                          (!dirty && Boolean(own))
                        }
                        onClick={save}
                      >
                        {busy
                          ? "Saving…"
                          : locked
                            ? "Picks locked"
                            : own && !dirty
                              ? "Picks saved"
                              : own
                                ? "Update picks"
                                : late
                                  ? "Submit late picks (−1)"
                                  : "Submit picks"}
                        {locked ? (
                          <LockKeyhole size={17} />
                        ) : (
                          <ArrowRight size={17} />
                        )}
                      </button>
                      <p className="slip-foot">
                        {locked
                          ? "Your card is final for this week."
                          : own
                            ? `Saved ${date(own.updatedAt, true)} PT`
                            : w.publishedAt
                              ? "Your picks stay private until the weekly deadline."
                              : "Picks open when the weekly lines are published."}
                      </p>
                    </section>
                    <div className="rail-note">
                      <Trophy size={24} />
                      <div>
                        <strong>
                          {leagueLeader && leagueLeader.points > 0
                            ? `${leagueLeader.name} leads with ${leagueLeader.points}`
                            : "A clean slate. A new season."}
                        </strong>
                        <p>
                          {leagueLeader && leagueLeader.points > 0
                            ? "See how the whole league stacks up."
                            : "The leaderboard is waiting for its first points."}
                        </p>
                        <button
                          className="text-button"
                          onClick={() => setTab("standings")}
                        >
                          View standings
                          <ArrowUpRight size={14} />
                        </button>
                      </div>
                    </div>
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
                        <tr
                          key={s.id}
                          className={s.id === user.id ? "you" : ""}
                        >
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
                          <td>
                            <span className="avatar">{s.name[0]}</span>
                            <b>{s.name}</b>
                            {s.id === user.id && (
                              <small className="you-label">YOU</small>
                            )}
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
                  Ties break by perfect weeks, then winning picks. Matching
                  records share a rank. Pending picks score only when final.
                </p>
                <h3 className="subheading">Week {week} cards</h3>
                <div className="entry-grid">
                  {data.entries.length ? (
                    data.entries.map((e) => (
                      <div className="entry-card" key={e.id}>
                        <div className="section-heading">
                          <strong>
                            {
                              data.standings.find((s) => s.id === e.userId)
                                ?.name
                            }
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
                              <span
                                className={`outcome ${e.score.outcomes[t]}`}
                              >
                                {e.score.outcomes[t]}
                              </span>
                            </div>
                          ))
                        ) : (
                          <p>
                            <LockKeyhole size={16} /> Picks reveal at the weekly
                            deadline.
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
            {tab === "history" && (
              <section className="panel">
                <div className="section-heading">
                  <h2>Your weekly cards</h2>
                  <span>{data.history.length} WEEKS PLAYED</span>
                </div>
                {data.history.length ? (
                  data.history.map((e) => (
                    <details
                      className="history-card"
                      key={e.id}
                      open={e.week === data.currentWeek}
                    >
                      <summary>
                        <strong>Week {e.week}</strong>
                        <span>
                          {e.score.perfect
                            ? "Perfect week"
                            : `${e.score.wins} wins · ${e.score.complete ? "Final" : "In progress"}`}
                        </span>
                        <b>{e.score.points} pts</b>
                      </summary>
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
                        {e.totalHelper
                          ? ` · Total Helper: ${e.totalHelper}`
                          : ""}
                        {e.perfectPrediction ? " · Perfect Prediction" : ""}
                      </p>
                    </details>
                  ))
                ) : (
                  <div className="empty-state">
                    <History size={36} />
                    <h3>Your story starts with four picks.</h3>
                    <p>
                      Once you submit a card, your picks and results will be
                      here.
                    </p>
                    <button className="primary" onClick={() => setTab("board")}>
                      Go to the game board
                      <ArrowRight size={17} />
                    </button>
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
                    Send friends the league link. Everyone who signs in with
                    Google joins this league automatically.
                  </p>
                  <button
                    className="primary"
                    onClick={() =>
                      act(async () => {
                        await navigator.clipboard.writeText(location.origin);
                        setNotice("League link copied.");
                      })
                    }
                  >
                    <Clipboard size={17} /> Copy league link
                  </button>
                </section>
                <section className="panel">
                  <h2>Week {week} operations</h2>
                  <div className="operation-status">
                    <span className="live-dot" />
                    <strong>
                      {w.publishedAt
                        ? "Lines are frozen"
                        : "Lines are in preview"}
                    </strong>
                  </div>
                  <p>
                    {w.publishedAt
                      ? `Published ${date(w.publishedAt, true)} PT. Everyone plays the same lines.`
                      : `Automatic publication: ${date(w.freezeAt, true)} PT. You can publish the current lines early to open picks now.`}
                  </p>
                  <button
                    className="primary"
                    disabled={
                      busy || Boolean(w.publishedAt) || tick >= w.deadline
                    }
                    onClick={() =>
                      act(async () => {
                        if (
                          !confirm(
                            `Freeze the current Week ${week} lines and open picks? Published lines cannot be changed.`,
                          )
                        )
                          return;
                        await api("admin/publish", { week });
                        await load(week);
                        setNotice(
                          `Week ${week} lines published. Picks are open.`,
                        );
                      })
                    }
                  >
                    Publish lines now
                    <Flag size={17} />
                  </button>
                  <button
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
                  </button>
                  <a className="secondary" href="/api/export">
                    <Download size={16} />
                    Export league data
                  </a>
                  <p className="source-note">
                    Data includes all picks, frozen lines, results, and the
                    audit log. Google credentials are never included.
                  </p>
                </section>
                <section className="panel">
                  <h2>League members</h2>
                  {data.admin.members.map((m) => (
                    <div className="admin-row" key={m.id}>
                      <span>
                        <b>{m.name}</b>
                        <small>
                          {m.email} ·{" "}
                          {m.role === "admin" ? "Commissioner" : "Player"}
                        </small>
                      </span>
                    </div>
                  ))}
                </section>
                <section className="panel">
                  <h2>Set a missing line</h2>
                  <p>
                    Use a verified pregame line when the feed is unavailable.
                    Home spread is negative when the home team is favored.
                    Published lines cannot be changed.
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
                            form.get("total") === ""
                              ? null
                              : Number(form.get("total")),
                          reason: form.get("reason"),
                        });
                        await load(week);
                        setNotice("Pregame line updated and logged.");
                      });
                    }}
                  >
                    <label>
                      Matchup
                      <select
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
                      </select>
                    </label>
                    <div className="form-columns">
                      <label>
                        Home spread
                        <input
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
                        <input
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
                      <input
                        name="reason"
                        minLength={8}
                        maxLength={300}
                        required
                        disabled={Boolean(w.publishedAt)}
                        placeholder="Verified source for this line"
                      />
                    </label>
                    <button
                      className="secondary"
                      disabled={
                        busy || Boolean(w.publishedAt) || tick >= w.deadline
                      }
                    >
                      Save pregame line
                    </button>
                  </form>
                </section>
                <section className="panel">
                  <h2>Correct a result</h2>
                  <p>
                    Use only for a confirmed scoring error. Corrections are
                    recorded and standings recalculate automatically.
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
                      <select name="gameId" required>
                        <option value="">Select a completed game</option>
                        {w.games
                          .filter((g) => tick >= Date.parse(g.kickoff))
                          .map((g) => (
                            <option value={g.id} key={g.id}>
                              {g.away.short} @ {g.home.short}
                            </option>
                          ))}
                      </select>
                    </label>
                    <div className="form-columns">
                      <label>
                        Away score
                        <input
                          type="number"
                          name="awayScore"
                          min={0}
                          max={100}
                          required
                        />
                      </label>
                      <label>
                        Home score
                        <input
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
                      <select name="state">
                        <option value="final">Final score</option>
                        <option value="canceled">Canceled / void</option>
                      </select>
                    </label>
                    <label>
                      Reason
                      <input
                        name="reason"
                        minLength={8}
                        maxLength={300}
                        required
                        placeholder="Why is this correction needed?"
                      />
                    </label>
                    <button className="secondary" disabled={busy}>
                      Save correction
                    </button>
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
            <footer className="app-footer">
              <span>
                PICK 4 <b>·</b> THE 2026 LEAGUE
              </span>
              <span>Four picks. Every week.</span>
              <button className="text-button" onClick={() => setTab("rules")}>
                League rules
                <ArrowUpRight size={13} />
              </button>
            </footer>
          </main>
        </>
      )}
      {accountOpen && user && (
        <div className="modal-backdrop" onClick={() => setAccountOpen(false)}>
          <section
            className="modal panel"
            role="dialog"
            aria-modal="true"
            aria-labelledby="account-title"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="section-heading">
              <h2 id="account-title">Your account</h2>
              <button
                className="icon-button"
                aria-label="Close account"
                onClick={() => setAccountOpen(false)}
              >
                <X size={20} />
              </button>
            </div>
            <p>Connected with Google · {user.email}</p>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const form = new FormData(e.currentTarget);
                void act(async () => {
                  await api("profile", { name: form.get("name") });
                  await load(week);
                  setAccountOpen(false);
                  setNotice("Display name updated.");
                });
              }}
            >
              <label>
                League display name
                <input
                  name="name"
                  defaultValue={user.name}
                  minLength={2}
                  maxLength={40}
                  autoComplete="nickname"
                  required
                />
              </label>
              <button className="primary" disabled={busy}>
                Save display name
              </button>
            </form>
          </section>
        </div>
      )}
    </>
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
          Each week, choose exactly one favorite against the spread, one
          underdog against the spread, one over, and one under. Every pick must
          be from a different game.
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
          DraftKings lines freeze on Wednesday at 9 AM Pacific, or earlier if
          the commissioner publishes them. Everyone uses those same lines.
        </p>
        <p>
          The weekly deadline is the first scheduled kickoff. In Week 1, that is
          Wednesday, September 9 at 5:20 PM Pacific. You can edit your submitted
          card until that deadline.
        </p>
        <p>
          Missed it? You may submit one late card using four games that have not
          started. Late cards lose one point (minimum zero), cannot use
          powerups, and lock immediately.
        </p>
        <p>
          Games with unconfirmed kickoff times or unavailable lines cannot be
          selected. Opponents’ cards reveal at the weekly deadline.
        </p>
      </section>
      <section className="panel">
        <Zap className="rule-icon" />
        <h2>Super Spread</h2>
        <p>
          Once per season, take a favorite of −5 or greater and double the
          spread. A −6 favorite must cover −12.
        </p>
        <p>
          Beat the doubled line for 2.5 points. Push it for 1 point. Miss it for
          0. The ordinary perfect-week bonus does not apply when Super Spread is
          active.
        </p>
      </section>
      <section className="panel">
        <Target className="rule-icon" />
        <h2>Total Helper</h2>
        <p>
          Once per season, give your over or under a five-point advantage. Over
          45 becomes over 40; under 45 becomes under 50.
        </p>
        <p>
          Choose one total to help. It scores normally and can still contribute
          to a perfect week.
        </p>
      </section>
      <section className="panel">
        <Sparkles className="rule-icon" />
        <h2>Perfect Prediction</h2>
        <p>
          Once per season, call your shot. If all four picks win, your card
          scores 8 points instead of the usual 5.
        </p>
        <p>
          Otherwise, normal scoring applies. You can combine powerups. If
          combined with Super Spread, the favorite must beat the doubled spread;
          a perfect card totals 8 points.
        </p>
      </section>
      <section className="panel">
        <Trophy className="rule-icon" />
        <h2>The standings</h2>
        <p>
          Season points come first, followed by perfect weeks and winning picks.
          Matching records share a rank.
        </p>
        <p>
          Only final scores settle picks. Pushes earn half a point and do not
          count as wins. A canceled game is void and earns half a point; it
          cannot complete a perfect week. Postponed games remain pending.
        </p>
        <p>
          Results refresh automatically. Commissioner corrections are logged and
          recalculate the standings. Powerups can be changed before the weekly
          deadline; each is available once during the season.
        </p>
      </section>
    </div>
  );
}

function GoogleMark() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M21.6 12.23c0-.71-.06-1.39-.18-2.05H12v3.88h5.38a4.6 4.6 0 0 1-1.99 3.02v2.51h3.23c1.89-1.74 2.98-4.3 2.98-7.36Z"
      />
      <path
        fill="#34A853"
        d="M12 22c2.7 0 4.96-.9 6.62-2.41l-3.23-2.51c-.9.6-2.05.96-3.39.96-2.6 0-4.8-1.76-5.59-4.12H3.07v2.59A10 10 0 0 0 12 22Z"
      />
      <path
        fill="#FBBC05"
        d="M6.41 13.92a6 6 0 0 1 0-3.84V7.49H3.07a10 10 0 0 0 0 9.02l3.34-2.59Z"
      />
      <path
        fill="#EA4335"
        d="M12 5.96c1.47 0 2.79.5 3.83 1.5l2.87-2.87A9.62 9.62 0 0 0 12 2a10 10 0 0 0-8.93 5.49l3.34 2.59A6 6 0 0 1 12 5.96Z"
      />
    </svg>
  );
}
