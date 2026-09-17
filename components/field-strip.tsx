"use client";
import { fieldPosition } from "@/lib/field-position";
import type { Team } from "@/lib/types";

/**
 * A 100-yard field strip. The away team defends the left end zone and the home
 * team the right one, matching the score header. Ball and first-down positions
 * are data, so they are placed without transitions.
 */
export function FieldStrip({
  away,
  home,
  possessionTeamId,
  yardsToEndzone,
  distance,
  redZone,
  ballOn,
}: {
  away: Team;
  home: Team;
  possessionTeamId: string | null;
  yardsToEndzone: number | null;
  distance: number | null;
  redZone: boolean | null;
  ballOn: string | null;
}) {
  const possession =
    possessionTeamId === home.id ? "home" : possessionTeamId === away.id ? "away" : null;
  const { direction, ballX, firstDownX } = fieldPosition({
    possession,
    yardsToEndzone,
    distance,
  });
  const team = possession === "home" ? home : possession === "away" ? away : null;
  const label = team
    ? `${team.abbreviation} ball${ballOn ? ` on the ${ballOn}` : ""}${
        yardsToEndzone !== null ? `, ${yardsToEndzone} yards to the end zone` : ""
      }${redZone ? ", red zone" : ""}`
    : "Possession unknown";
  return (
    <figure
      className={`field-strip ${redZone ? "red-zone" : ""}`}
      data-direction={direction}
    >
      <figcaption className="sr-only">{label}</figcaption>
      <div
        className="field-endzone field-endzone-away"
        style={{ background: away.color }}
      >
        <span>{away.abbreviation}</span>
      </div>
      <div className="field-turf" aria-hidden="true">
        {Array.from({ length: 9 }, (_, i) => (
          <span
            key={i}
            className={`field-yard ${i === 4 ? "midfield" : ""}`}
            style={{ left: `${(i + 1) * 10}%` }}
          />
        ))}
        {redZone && direction !== "none" && (
          <span className={`field-redzone ${direction}`} />
        )}
        {firstDownX !== null && (
          <span className="field-first-down" style={{ left: `${firstDownX}%` }} />
        )}
        {ballX !== null && team && (
          <span className="field-ball" style={{ left: `${ballX}%` }}>
            <i />
          </span>
        )}
      </div>
      <div
        className="field-endzone field-endzone-home"
        style={{ background: home.color }}
      >
        <span>{home.abbreviation}</span>
      </div>
    </figure>
  );
}
