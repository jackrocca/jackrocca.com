// Display helpers shared by the board and the game detail sheet. All clock text is
// Pacific, matching the rest of the league UI.
const PACIFIC = "America/Los_Angeles";
export const pacificClock = (value: string | number) =>
  new Date(value).toLocaleString("en-US", {
    timeZone: PACIFIC,
    hour: "numeric",
    minute: "2-digit",
  });
export const pacificDay = (value: string | number) =>
  new Date(value).toLocaleString("en-US", {
    timeZone: PACIFIC,
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
/** `Q1`…`Q4`, then `OT`, `OT2`, … */
export const quarterLabel = (period: number | null) =>
  period === null
    ? ""
    : period <= 4
      ? `Q${period}`
      : period === 5
        ? "OT"
        : `OT${period - 4}`;
export const ordinal = (n: number) =>
  n === 1 ? "st" : n === 2 ? "nd" : n === 3 ? "rd" : "th";
/** "2nd quarter", "Overtime", "2nd overtime". */
export const periodName = (period: number | null) =>
  period === null
    ? ""
    : period <= 4
      ? `${period}${ordinal(period)} quarter`
      : period === 5
        ? "Overtime"
        : `${period - 4}${ordinal(period - 4)} overtime`;
