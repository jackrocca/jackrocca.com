"use client";
import { LockKeyhole } from "lucide-react";
import { PlayerAvatar } from "@/components/player-avatar";
import { labels, slotIcons } from "@/components/league-meta";
import { pickerNames } from "@/components/pick-avatars";
import { pacificDay } from "@/lib/game-format";
import { slotLine, type GameLine } from "@/lib/lines";
import { PICK_TYPES, type Game, type PickType } from "@/lib/types";
import type { GamePicker } from "@/lib/view";

export type GameSlotPicks = Record<PickType, GamePicker[]>;
export const countPicks = (picks: GameSlotPicks | undefined) =>
  PICK_TYPES.reduce((n, type) => n + (picks?.[type]?.length ?? 0), 0);

/** Pick distribution for one game: a bar per slot against the cards submitted this week. */
export function GamePicksTab({
  game,
  line,
  picks,
  revealed,
  deadline,
  viewerId,
  cardsSubmitted,
}: {
  game: Game;
  line: GameLine | null;
  picks: GameSlotPicks | undefined;
  revealed: boolean;
  deadline: number;
  viewerId: string;
  cardsSubmitted: number;
}) {
  const total = countPicks(picks);
  return (
    <section className="gs-section gs-picks" aria-label="League picks">
      <p className="gs-picks-summary">
        {revealed ? (
          total ? (
            <>
              <b>{total}</b> of {cardsSubmitted}{" "}
              {cardsSubmitted === 1 ? "card has" : "cards have"} this game
            </>
          ) : (
            "Nobody has this game on their card."
          )
        ) : (
          <>
            <LockKeyhole size={12} /> Other members’ picks reveal {pacificDay(deadline)}{" "}
            PT
          </>
        )}
      </p>
      <ul>
        {PICK_TYPES.map((type) => {
          const Icon = slotIcons[type];
          const members = picks?.[type] ?? [];
          const names = pickerNames(members, viewerId);
          const share = revealed && cardsSubmitted ? members.length / cardsSubmitted : 0;
          const mine = members.some((m) => m.userId === viewerId);
          const market = slotLine(game, line, type);
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
                    {market && <span> · {market}</span>}
                  </small>
                  <b>
                    {members.length}
                    {revealed && cardsSubmitted > 0 && (
                      <span> · {Math.round(share * 100)}%</span>
                    )}
                  </b>
                </div>
                <div className="gs-bar" aria-hidden="true">
                  <span style={{ transform: `scaleX(${share})` }} />
                </div>
                <div className="gs-pick-members">
                  {members.length ? (
                    <>
                      <span className="gs-pick-avatars">
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
