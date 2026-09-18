/**
 * Geometry for the field strip. The away team defends the left end zone (x = 0)
 * and the home team the right one (x = 100), so a team always drives toward the
 * far side. Positions are percentages along the 100-yard playing field.
 */
export type FieldPosition = {
  direction: "left" | "right" | "none";
  ballX: number | null;
  firstDownX: number | null;
};
const clamp = (n: number) => Math.min(100, Math.max(0, n));
export function fieldPosition({
  possession,
  yardsToEndzone,
  distance,
}: {
  possession: "home" | "away" | null;
  yardsToEndzone: number | null;
  distance: number | null;
}): FieldPosition {
  if (!possession || yardsToEndzone === null)
    return { direction: "none", ballX: null, firstDownX: null };
  // Home drives toward the away end zone on the left; away drives right.
  const direction = possession === "home" ? "left" : "right";
  const toX = (yards: number) => clamp(direction === "left" ? yards : 100 - yards);
  const firstDown =
    distance !== null && yardsToEndzone - distance > 0 ? yardsToEndzone - distance : null;
  return {
    direction,
    ballX: toX(yardsToEndzone),
    firstDownX: firstDown === null ? null : toX(firstDown),
  };
}
