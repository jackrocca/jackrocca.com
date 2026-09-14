"use client";
import { PlayerAvatar } from "@/components/player-avatar";
import { SimpleTooltip } from "@/ui/components/SimpleTooltip";
import type { GamePicker } from "@/lib/view";

const MAX_SHOWN = 3;

export function pickerNames(pickers: GamePicker[], viewerId: string) {
  return pickers.map((p) => (p.userId === viewerId ? "You" : p.name));
}

/**
 * One pick slot's members: a count and stacked avatars so a card reads at a
 * glance. Hover or focus shows names on desktop; a tap opens the same list as a
 * popover on touch screens.
 */
export function PickAvatars({
  pickers,
  viewerId,
  label,
  size = "xs",
  showCount = true,
}: {
  pickers: GamePicker[];
  viewerId: string;
  label: string;
  size?: "xs" | "sm";
  showCount?: boolean;
}) {
  if (!pickers.length) return null;
  const names = pickerNames(pickers, viewerId);
  const shown = pickers.slice(0, MAX_SHOWN);
  const extra = pickers.length - shown.length;
  const mine = pickers.some((p) => p.userId === viewerId);
  const summary =
    names.length <= 2
      ? names.join(" and ")
      : `${names.slice(0, -1).join(", ")}, and ${names[names.length - 1]}`;
  return (
    <SimpleTooltip
      mobileView="popover"
      content={
        <ul className="pick-avatars-list" aria-label={`${label} picks`}>
          {pickers.map((p, i) => (
            <li key={p.userId}>
              <PlayerAvatar
                name={p.name}
                userId={p.userId}
                revision={p.avatarRevision}
                size="sm"
              />
              <span>{names[i]}</span>
            </li>
          ))}
        </ul>
      }
      tooltipClassName="pick-avatars-popup"
    >
      <button
        type="button"
        className={`pick-avatars pick-avatars-${size} ${mine ? "mine" : ""}`}
        aria-label={`${label}: ${pickers.length} ${pickers.length === 1 ? "pick" : "picks"} — ${summary}`}
      >
        {showCount && <b className="pick-count">{pickers.length}</b>}
        <span className="pick-stack">
          {shown.map((p) => (
            <PlayerAvatar
              key={p.userId}
              name={p.name}
              userId={p.userId}
              revision={p.avatarRevision}
              size={size}
            />
          ))}
          {extra > 0 && (
            <span className={`avatar avatar-${size} avatar-more`}>+{extra}</span>
          )}
        </span>
      </button>
    </SimpleTooltip>
  );
}
