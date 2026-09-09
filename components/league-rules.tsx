"use client";
import { ArrowUpRight, Play } from "lucide-react";
import { CustomButton } from "@/ui/components/CustomButton";
import { buyIn, labels, powerups, slotHints, slotIcons } from "@/components/league-meta";
import { PICK_TYPES } from "@/lib/types";

export function Rules({
  deadlineText,
  weekNumber,
  onTour,
}: {
  /** Deadline of the week being viewed, already formatted in Pacific time. */
  deadlineText: string;
  weekNumber: number;
  onTour: () => void;
}) {
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
          Every week, pick one favorite against the spread, one underdog against the
          spread, one over, and one under. Each pick comes from a different game.
        </p>
        <ul className="rules-slots" aria-label="The four pick types">
          {PICK_TYPES.map((type) => {
            const Icon = slotIcons[type];
            return (
              <li key={type}>
                <Icon size={16} aria-hidden="true" />
                <b>{labels[type]}</b>
                <small>{slotHints[type]}</small>
              </li>
            );
          })}
        </ul>
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
        <h2>How a week works</h2>
        <ol className="rules-timeline">
          <li>
            <b>Wednesday, 9 AM PT</b>
            <span>
              Lines freeze. DraftKings spreads and totals lock for everyone, or earlier if
              the commissioner publishes them. Once frozen, the numbers never move.
            </span>
          </li>
          <li>
            <b>Until the deadline</b>
            <span>
              Make your picks. Choose one line from each of four different games, then
              save. Edit as often as you like; the deadline is the first kickoff of the
              week. For Week {weekNumber}, that’s {deadlineText} PT.
              {weekNumber === 1 &&
                " The Wednesday and Thursday openers don’t lock the board, though started games can’t be picked."}
            </span>
          </li>
          <li>
            <b>As games go final</b>
            <span>
              Cards reveal to the league at the deadline. Only final scores settle picks,
              results refresh automatically, and the standings update as each game ends.
            </span>
          </li>
        </ol>
      </section>

      <section className="panel">
        <h2>Scoring</h2>
        <dl className="rules-scoring">
          <div>
            <dt>Win</dt>
            <dd>1</dd>
          </div>
          <div>
            <dt>Push</dt>
            <dd>½</dd>
          </div>
          <div>
            <dt>Loss</dt>
            <dd>0</dd>
          </div>
          <div className="rules-scoring-highlight">
            <dt>Perfect week · 4 for 4</dt>
            <dd>5</dd>
          </div>
          <div>
            <dt>Canceled game</dt>
            <dd>½</dd>
          </div>
          <div>
            <dt>Late card</dt>
            <dd>−1</dd>
          </div>
        </dl>
        <p className="rules-note">
          A canceled game is void: it earns half a point and can’t complete a perfect
          week. Postponed games stay pending until they’re played.
        </p>
      </section>

      <section className="panel">
        <h2>Season buy-in</h2>
        <p>
          {buyIn.amount} per player, once, on Venmo. Send it to{" "}
          <strong>{buyIn.handle}</strong> with the note “Pick 4 · your name”. When you
          save your Week 1 card, the Venmo code appears and the card waits as pending
          until Jack confirms the transfer. Then it goes live on the board.
        </p>
        <a
          className="secondary venmo-link"
          href={buyIn.url}
          target="_blank"
          rel="noreferrer"
        >
          Open Venmo <ArrowUpRight size={16} />
        </a>
      </section>

      <section className="panel rules-powerups">
        <div className="section-heading">
          <h2>Powerups</h2>
          <span>ONCE EACH · PER SEASON</span>
        </div>
        <p>
          Turn one on with your card before the deadline. Each is spent once for the
          season, so choose your spot. Late cards can’t use them.
        </p>
        <div className="rules-powerup-grid">
          {powerups.map(({ key, name, icon: Icon, detail, example }) => (
            <article key={key} className="rules-powerup">
              <Icon className="rule-icon" size={20} aria-hidden="true" />
              <h3>{name}</h3>
              <p>{detail}</p>
              <em>{example}</em>
            </article>
          ))}
        </div>
      </section>

      <section className="panel rules-fine">
        <h2>Fine print</h2>
        <ul>
          <li>
            Missed the deadline? You may submit one late card using four games that
            haven’t started. It loses one point (never below zero), can’t use powerups,
            and locks the moment you save it.
          </li>
          <li>
            Games with unconfirmed kickoff times or unavailable lines can’t be selected.
            Started games can’t be selected.
          </li>
          <li>
            Standings rank by season points, then perfect weeks, then winning picks.
            Matching records share a rank.
          </li>
          <li>
            Pushes earn half a point and don’t count as wins. Commissioner corrections are
            logged and recalculate the standings.
          </li>
        </ul>
        <CustomButton
          variant="unstyled"
          className="secondary rules-tour"
          onClick={onTour}
        >
          <Play size={15} />
          Take the tour again
        </CustomButton>
      </section>
    </div>
  );
}
