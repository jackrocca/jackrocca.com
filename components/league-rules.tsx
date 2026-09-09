"use client";
import { ArrowUpRight, Play } from "lucide-react";
import { CustomButton } from "@/ui/components/CustomButton";
import { buyIn, labels, powerups, slotIcons } from "@/components/league-meta";
import { PICK_TYPES, type PickType } from "@/lib/types";

/** Plain-English version of each slot, written for someone who has never bet a game. */
const slotStories: Record<PickType, string> = {
  favorite: "The team expected to win. You think it wins by more than the spread.",
  underdog:
    "The team expected to lose. You think it keeps the game closer than the spread, or wins.",
  over: "You think the two teams combine for more points than the total.",
  under: "You think the two teams combine for fewer points than the total.",
};

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
    <article className="panel rules-article">
      <header className="rules-header">
        <h2 className="rules-title">Four picks a week. That’s the whole game.</h2>
        <p className="rules-lede">
          Pick 4 is a season-long game you play with friends during the NFL season. Every
          week you make four picks. Get them right and you earn points. The most points at
          the end of the season wins. This page explains everything from the start, so you
          don’t need to know anything about betting to follow along.
        </p>
      </header>

      <section>
        <h2>Start here: the two numbers</h2>
        <p>
          Before every NFL game, sportsbooks publish two numbers for it. Pick 4 uses the
          numbers from DraftKings. We call them <strong>lines</strong>. Once you
          understand these two lines, you understand the game.
        </p>

        <h3>The spread</h3>
        <p>
          In most games, one team is expected to win. The spread evens things out by
          giving the weaker team a head start, on paper.
        </p>
        <p>
          Say the Eagles play the Giants and the spread is <strong>Eagles −6.5</strong>.
          The minus sign marks the team expected to win. That’s the{" "}
          <strong>favorite</strong>. The Giants are the <strong>underdog</strong>, and
          they get the same number the other way: <strong>Giants +6.5</strong>.
        </p>
        <ul>
          <li>
            Pick the Eagles and they have to win by 7 or more. That’s called{" "}
            <strong>covering</strong> the spread.
          </li>
          <li>
            Pick the Giants and they can lose by 6 or fewer, or win the game, and your
            pick still wins.
          </li>
        </ul>
        <p>
          If the Eagles win 24–20, a Giants pick wins, even though the Giants lost the
          game. Pick 4 is about beating the number, not about who wins.
        </p>

        <h3>The total</h3>
        <p>
          The second line is the total: how many points both teams together are expected
          to score. Say the total is <strong>44.5</strong>.
        </p>
        <ul>
          <li>
            Pick the <strong>over</strong> and you need the two teams to score 45 or more
            between them.
          </li>
          <li>
            Pick the <strong>under</strong> and you need 44 or fewer.
          </li>
        </ul>
        <p>Who wins the game doesn’t matter here. Only the two scores added together.</p>

        <h3>When it lands right on the number</h3>
        <p>
          Most lines end in .5 so there is always a winner. Some don’t. If a spread is −7
          and the favorite wins by exactly 7, that’s a <strong>push</strong>. Same if the
          total is 44 and the game ends 24–20. Nobody wins and nobody loses. You get half
          a point.
        </p>
      </section>

      <section>
        <h2>Your four picks</h2>
        <p>
          Every week you fill out one card. A card is four picks, and each one is a
          different kind:
        </p>
        <ul className="rules-slots" aria-label="The four pick types">
          {PICK_TYPES.map((type) => {
            const Icon = slotIcons[type];
            return (
              <li key={type}>
                <Icon size={16} aria-hidden="true" />
                <b>{labels[type]}</b>
                <small>{slotStories[type]}</small>
              </li>
            );
          })}
        </ul>
        <p>
          One rule ties them together:{" "}
          <strong>each pick comes from a different game</strong>. Your card touches four
          games a week. You can’t take the Eagles to cover and also take the over in that
          same game.
        </p>
        <p>
          A game can’t be picked until it has a confirmed kickoff time and a line. Once a
          game has kicked off, it can’t be picked either.
        </p>
      </section>

      <section>
        <h2>How you score</h2>
        <p>Each pick is worth up to one point.</p>
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
        </dl>
        <p>
          Go 4 for 4 and you get a bonus point on top. A perfect week is worth{" "}
          <strong>5</strong>, not 4. Your season total is your weekly points added up, and
          the standings on the board show where everyone sits.
        </p>
      </section>

      <section>
        <h2>What a week looks like</h2>
        <ol className="rules-timeline">
          <li>
            <b>Wednesday, 9 AM PT · Lines freeze</b>
            <span>
              The spreads and totals for the week lock in for everyone. (The commissioner
              can freeze them earlier.) From here on the numbers don’t move, whatever the
              sportsbooks do. Everyone in the league plays the same numbers.
            </span>
          </li>
          <li>
            <b>Until kickoff · Make your picks</b>
            <span>
              Open the board, choose your four, and save your card. You can change your
              mind and save again as often as you like, right up to the deadline. The
              deadline is the first kickoff of the week. For Week {weekNumber}, that’s{" "}
              {deadlineText} PT.
              {weekNumber === 1 &&
                " Week 1 is the one exception: the Wednesday and Thursday opening games don’t lock your card, so you have until the Sunday games. You still can’t pick a game that has already started."}
            </span>
          </li>
          <li>
            <b>At the deadline · Cards are revealed</b>
            <span>
              Your picks stay private until the deadline. Then every card locks and the
              whole league can see them.
            </span>
          </li>
          <li>
            <b>As games end · Picks settle</b>
            <span>
              A pick counts only once the game’s final score is in. Results update on
              their own, and the standings move as each game goes final.
            </span>
          </li>
        </ol>
      </section>

      <section>
        <h2>Powerups</h2>
        <p>
          You get three powerups for the whole season, and each can be used{" "}
          <strong>once</strong>. Turn one on when you save your card, before the deadline,
          and it applies to that week only. Think of them as three chances to make a week
          count for more, so pick your spots.
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

      <section>
        <h2>Joining the league</h2>
        <p>
          The buy-in is <strong>{buyIn.amount}</strong> per player, once for the season,
          on Venmo. Send it to <strong>{buyIn.handle}</strong> with the note “Pick 4 ·
          your name”.
        </p>
        <p>
          You don’t need to pay before you pick. Save your Week 1 card as normal. A Venmo
          code appears, and your card waits as pending until Jack confirms the payment.
          Then it goes live on the board.
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

      <section>
        <h2>The small stuff</h2>
        <p>A few things that come up once or twice a season.</p>
        <ul className="rules-fine">
          <li>
            <b>Missed the deadline?</b> You can still submit one late card, using four
            games that haven’t started yet. It costs a point (your week can’t go below
            zero), it can’t use powerups, and it locks the moment you save it.
          </li>
          <li>
            <b>Canceled games.</b> If a game is canceled, that pick is void: you get half
            a point, and it can’t be part of a perfect week. A postponed game simply waits
            until it’s played.
          </li>
          <li>
            <b>Ties in the standings.</b> Players are ranked by season points. If that’s
            tied, more perfect weeks ranks higher, then more winning picks. Still tied?
            You share the spot.
          </li>
          <li>
            <b>Corrections.</b> If the commissioner has to fix a score or a line, the
            change is logged and the standings recalculate.
          </li>
        </ul>
      </section>

      <footer className="rules-footer">
        <h2>That’s it</h2>
        <p>
          Four picks, four different games, beat the number. Everything else is detail. If
          you’d rather see it on the board than read about it, the tour walks you through
          the app in about a minute.
        </p>
        <CustomButton
          variant="unstyled"
          className="secondary rules-tour"
          onClick={onTour}
        >
          <Play size={15} />
          Take the tour again
        </CustomButton>
      </footer>
    </article>
  );
}
