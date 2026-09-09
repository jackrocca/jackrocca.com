"use client";
import { useEffect, useRef, useState } from "react";
import {
  ArrowRight,
  ArrowUpRight,
  Camera,
  Check,
  ChevronLeft,
  ChevronRight,
  Grid2X2,
  MessagesSquare,
  Wallet,
} from "lucide-react";
import { CustomButton } from "@/ui/components/CustomButton";
import { ProfilePhotoField } from "@/components/player-avatar";
import { TeamMark } from "@/components/team-mark";
import { buyIn, labels, powerups, slotHints, slotIcons } from "@/components/league-meta";
import { PICK_TYPES, type Game } from "@/lib/types";
import { signed } from "@/lib/rules";

/* ------------------------------------------------------------------ */
/* Welcome tour                                                        */
/* ------------------------------------------------------------------ */

export type TourUser = { id: string; name: string; avatarRevision: number };

type TourProps = {
  user: TourUser;
  /** A representative game with published lines, when one exists. */
  sampleGame: { game: Game; homeSpread: number | null; total: number | null } | null;
  /** Human-readable deadline for the current week, in Pacific time. */
  deadlineText: string;
  busy: boolean;
  onFinish: () => void;
  onSkip: () => void;
  onRevision: (revision: number) => void;
  onNotice: (message: string) => void;
  onError: (message: string) => void;
};

const STEPS = ["welcome", "picking", "powerups", "buyIn", "you"] as const;

export function WelcomeTour({
  user,
  sampleGame,
  deadlineText,
  busy,
  onFinish,
  onSkip,
  onRevision,
  onNotice,
  onError,
}: TourProps) {
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState<"forward" | "back">("forward");
  const heading = useRef<HTMLHeadingElement>(null);
  const last = index === STEPS.length - 1;

  function go(next: number) {
    if (next < 0 || next >= STEPS.length) return;
    setDirection(next > index ? "forward" : "back");
    setIndex(next);
  }

  useEffect(() => {
    heading.current?.focus({ preventScroll: true });
  }, [index]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (target && /^(input|textarea|select)$/i.test(target.tagName)) return;
      if (e.key === "ArrowRight") {
        e.preventDefault();
        if (last) onFinish();
        else go(index + 1);
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        go(index - 1);
      } else if (e.key === "Escape") {
        e.preventDefault();
        onSkip();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  const step = STEPS[index];
  const content = {
    welcome: {
      title: "Four games. Four ways to call it.",
      body: (
        <>
          Every week you pick one favorite, one underdog, one over, and one under, each
          from a different game. A win is 1 point, a push is ½, and a perfect 4‑for‑4 week
          is 5.
        </>
      ),
      visual: (
        <div className="tour-slots" aria-hidden="true">
          {PICK_TYPES.map((type) => {
            const Icon = slotIcons[type];
            return (
              <span className="tour-slot" key={type}>
                <span className="slot-icon">
                  <Icon size={18} />
                </span>
                <b>{labels[type]}</b>
                <small>{slotHints[type]}</small>
              </span>
            );
          })}
        </div>
      ),
    },
    picking: {
      title: "Tap a line. Fill a slot.",
      body: (
        <>
          Lines freeze Wednesday morning, so everyone plays the same numbers. Pick from
          the board until {deadlineText} PT, when the week locks. Your card stays private
          until then, and you can change it as often as you like.
        </>
      ),
      visual: <SampleCard sample={sampleGame} />,
    },
    powerups: {
      title: "Three powerups. Once each.",
      body: (
        <>
          Turn one on with your card any week before the deadline. Each is spent once for
          the whole season, so pick your spot.
        </>
      ),
      visual: (
        <ul className="tour-powerups" aria-hidden="true">
          {powerups.map(({ key, name, icon: Icon, short, example }) => (
            <li key={key}>
              <Icon size={16} />
              <span>
                <b>{name}</b>
                <small>{short}</small>
              </span>
              <em>{example}</em>
            </li>
          ))}
        </ul>
      ),
    },
    buyIn: {
      title: "One buy-in for the season.",
      body: (
        <>
          Venmo {buyIn.amount} to {buyIn.handle} with the note “Pick 4 · {user.name}”. The
          code shows up again when you save your Week 1 card. Jack confirms the transfer
          and your card goes live on the board.
        </>
      ),
      visual: (
        <div className="tour-buyin">
          <span className="tour-buyin-amount" aria-hidden="true">
            <small>Season buy-in</small>
            <strong>{buyIn.amount}</strong>
          </span>
          <a
            className="tour-buyin-handle"
            href={buyIn.url}
            target="_blank"
            rel="noreferrer"
            aria-label={`Open Venmo for ${buyIn.handle}`}
          >
            <Wallet size={16} aria-hidden="true" />
            {buyIn.handle}
            <ArrowUpRight size={14} aria-hidden="true" />
          </a>
        </div>
      ),
    },
    you: {
      title: "Make it yours.",
      body: (
        <>
          Add a photo so the league knows who’s talking, then say hi in the chat. That’s
          everything. Go make your picks.
        </>
      ),
      visual: (
        <div className="tour-you">
          <ProfilePhotoField
            name={user.name}
            userId={user.id}
            revision={user.avatarRevision}
            disabled={busy}
            onRevision={onRevision}
            onNotice={onNotice}
            onError={onError}
          />
        </div>
      ),
    },
  }[step];

  return (
    <main id="main-content" className="league-tour" aria-labelledby="tour-heading">
      <div className="tour-card">
        <header className="tour-top">
          <span className="eyebrow" aria-live="polite">
            {index + 1} of {STEPS.length}
          </span>
          {!last && (
            <CustomButton
              variant="unstyled"
              className="text-button tour-skip"
              onClick={onSkip}
              disabled={busy}
            >
              Skip
            </CustomButton>
          )}
        </header>
        <div className="tour-step" key={step} data-direction={direction}>
          <div className="tour-stage">{content.visual}</div>
          <h1 id="tour-heading" ref={heading} tabIndex={-1}>
            {content.title}
          </h1>
          <p>{content.body}</p>
        </div>
        <footer className="tour-controls">
          <CustomButton
            variant="unstyled"
            className="icon-button tour-back"
            aria-label="Previous step"
            disabled={index === 0}
            onClick={() => go(index - 1)}
          >
            <ChevronLeft size={18} />
          </CustomButton>
          <ol className="tour-dots" aria-hidden="true">
            {STEPS.map((name, i) => (
              <li key={name} data-active={i === index || undefined} />
            ))}
          </ol>
          <CustomButton
            variant="unstyled"
            className="primary tour-next"
            disabled={busy}
            onClick={() => (last ? onFinish() : go(index + 1))}
          >
            {last ? "Go to the board" : "Next"}
            {last ? <ArrowRight size={17} /> : <ChevronRight size={17} />}
          </CustomButton>
        </footer>
      </div>
    </main>
  );
}

function SampleCard({ sample }: { sample: TourProps["sampleGame"] }) {
  if (!sample)
    return (
      <div className="tour-sample tour-sample-empty" aria-hidden="true">
        <Grid2X2 size={22} />
        <span>The board opens once this week’s lines are published.</span>
      </div>
    );
  const { game, homeSpread, total } = sample;
  const spread = homeSpread ?? 0;
  const homeFavorite = spread < 0;
  const favorite = homeFavorite ? game.home : game.away;
  const underdog = homeFavorite ? game.away : game.home;
  return (
    <article className="game-card has-pick tour-sample" aria-hidden="true">
      <div className="game-top">
        <span>PREVIEW</span>
        <span className="picked-badge">
          <Check size={12} />
          Favorite
        </span>
      </div>
      <div className="matchup">
        <div>
          <TeamMark game={game} side="away" />
          <strong>{game.away.short}</strong>
        </div>
        <span className="versus">at</span>
        <div>
          <TeamMark game={game} side="home" />
          <strong>{game.home.short}</strong>
        </div>
      </div>
      <div className="game-options">
        {PICK_TYPES.map((type) => {
          const line =
            type === "favorite"
              ? `${favorite.abbreviation} ${signed(-Math.abs(spread))}`
              : type === "underdog"
                ? `${underdog.abbreviation} ${signed(Math.abs(spread))}`
                : `${type === "over" ? "O" : "U"} ${total ?? "—"}`;
          return (
            <span
              className={type === "favorite" ? "chosen" : undefined}
              key={type}
              role="presentation"
            >
              <small>{labels[type]}</small>
              <strong>{line}</strong>
              {type === "favorite" && <Check size={12} />}
            </span>
          );
        })}
      </div>
    </article>
  );
}

/* ------------------------------------------------------------------ */
/* Week 1 checklist                                                    */
/* ------------------------------------------------------------------ */

export type ChecklistProps = {
  picksChosen: number;
  hasEntry: boolean;
  buyInStatus: "none" | "pending" | "confirmed";
  hasPhoto: boolean;
  chatted: boolean;
  onPicks: () => void;
  onBuyIn: () => void;
  onPhoto: () => void;
  onChat: () => void;
  onTour: () => void;
};

export function checklistComplete(
  p: Pick<ChecklistProps, "hasEntry" | "buyInStatus" | "hasPhoto" | "chatted">,
) {
  return p.hasEntry && p.buyInStatus === "confirmed" && p.hasPhoto && p.chatted;
}

export function StartChecklist(p: ChecklistProps) {
  const items = [
    {
      key: "picks",
      icon: Grid2X2,
      label: "Make your four picks",
      done: p.hasEntry,
      meta: p.hasEntry ? "Saved" : `${p.picksChosen} of 4 chosen`,
      onClick: p.onPicks,
    },
    {
      key: "buyIn",
      icon: Wallet,
      label: `Send the ${buyIn.amount} buy-in`,
      done: p.buyInStatus === "confirmed",
      meta:
        p.buyInStatus === "confirmed"
          ? "Confirmed"
          : p.buyInStatus === "pending"
            ? "Waiting on Jack"
            : "Venmo details",
      onClick: p.onBuyIn,
    },
    {
      key: "photo",
      icon: Camera,
      label: "Add a profile photo",
      done: p.hasPhoto,
      meta: p.hasPhoto ? "Added" : "Account settings",
      onClick: p.onPhoto,
    },
    {
      key: "chat",
      icon: MessagesSquare,
      label: "Say hi in the chat",
      done: p.chatted,
      meta: p.chatted ? "Done" : "Open chat",
      onClick: p.onChat,
    },
  ];
  const done = items.filter((item) => item.done).length;
  return (
    <section className="start-panel" aria-labelledby="start-heading">
      <div className="start-heading">
        <h2 id="start-heading">Week 1 checklist</h2>
        <span aria-live="polite">
          {done} of {items.length}
        </span>
      </div>
      <ol className="start-list">
        {items.map(({ key, icon: Icon, label, done, meta, onClick }) => (
          <li key={key}>
            <CustomButton
              variant="unstyled"
              className="start-item"
              data-done={done || undefined}
              onClick={onClick}
              aria-label={`${label}: ${meta}`}
            >
              <span className="start-mark" aria-hidden="true">
                <Icon size={15} className="start-mark-icon" />
                <Check size={15} className="start-mark-check" strokeWidth={2.5} />
              </span>
              <span className="start-label">{label}</span>
              <span className="start-meta">
                {meta}
                {!done && <ChevronRight size={14} />}
              </span>
            </CustomButton>
          </li>
        ))}
      </ol>
      <CustomButton
        variant="unstyled"
        className="text-button start-tour"
        onClick={p.onTour}
      >
        Replay the tour
      </CustomButton>
    </section>
  );
}
