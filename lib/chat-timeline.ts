import type { ChatMessage } from "./types";

const ZONE = "America/Los_Angeles";
/* Same author inside this window reads as one voice: shared bubble edges, one avatar. */
export const CHAT_GROUP_GAP = 5 * 60_000;
/* A quiet spell longer than this earns a timestamp divider. */
export const CHAT_DIVIDER_GAP = 20 * 60_000;

export type TimelineItem =
  | { kind: "divider"; id: string; at: number }
  | { kind: "message"; message: ChatMessage; first: boolean; last: boolean };

const dayOf = (ms: number) =>
  new Date(ms).toLocaleDateString("en-US", { timeZone: ZONE });

export function clockLabel(ms: number) {
  return new Date(ms).toLocaleTimeString("en-US", {
    timeZone: ZONE,
    hour: "numeric",
    minute: "2-digit",
  });
}

export function dividerLabel(ms: number, now = Date.now()) {
  const day = dayOf(ms);
  if (day === dayOf(now)) return `Today ${clockLabel(ms)}`;
  if (day === dayOf(now - 86_400_000)) return `Yesterday ${clockLabel(ms)}`;
  const thisWeek = now - ms < 6 * 86_400_000;
  return new Date(ms).toLocaleString("en-US", {
    timeZone: ZONE,
    ...(thisWeek ? { weekday: "long" } : { month: "short", day: "numeric" }),
    hour: "numeric",
    minute: "2-digit",
  });
}

function sameGroup(a: ChatMessage, aAt: number, b: ChatMessage, bAt: number) {
  return (
    a.userId === b.userId && bAt - aAt <= CHAT_GROUP_GAP && dayOf(aAt) === dayOf(bAt)
  );
}

export function chatTimeline(messages: ChatMessage[]): TimelineItem[] {
  const items: TimelineItem[] = [];
  messages.forEach((message, index) => {
    const at = Date.parse(message.createdAt);
    const previous = messages[index - 1];
    const previousAt = previous ? Date.parse(previous.createdAt) : 0;
    const next = messages[index + 1];
    const nextAt = next ? Date.parse(next.createdAt) : 0;
    if (
      !previous ||
      at - previousAt > CHAT_DIVIDER_GAP ||
      dayOf(at) !== dayOf(previousAt)
    )
      items.push({ kind: "divider", id: `divider-${message.id}`, at });
    items.push({
      kind: "message",
      message,
      first: !previous || !sameGroup(previous, previousAt, message, at),
      last: !next || !sameGroup(message, at, next, nextAt),
    });
  });
  return items;
}
