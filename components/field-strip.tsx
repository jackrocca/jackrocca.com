"use client";
import type { Team } from "@/lib/types";

/**
 * A 100-yard field strip. The away team defends the left end zone and the home
 * team the right one, matching the score header, so the possessing team always
 * drives toward the opponent's end zone on the far side.
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
  const homeBall = possessionTeamId === home.id;
  const awayBall = possessionTeamId === away.id;
  const known = yardsToEndzone !== null && (homeBall || awayBall);
  const clamp = (n: number) => Math.min(100, Math.max(0, n));
  // Home drives toward the left (away) end zone; away drives right.
  const ballX = known ? clamp(homeBall ? yardsToEndzone : 100 - yardsToEndzone) : null;
  const firstDownX =
    known && distance !== null && yardsToEndzone - distance > 0
      ? clamp(homeBall ? yardsToEndzone - distance : 100 - (yardsToEndzone - distance))
      : null;
  const team = homeBall ? home : awayBall ? away : null;
  const label = team
    ? `${team.abbreviation} ball${ballOn ? ` on the ${ballOn}` : ""}${
        yardsToEndzone !== null ? `, ${yardsToEndzone} yards to the end zone` : ""
      }${redZone ? ", red zone" : ""}`
    : "Possession unknown";
  return (
    <figure
      className={`field-strip ${redZone ? "red-zone" : ""}`}
      data-direction={homeBall ? "left" : awayBall ? "right" : "none"}
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
        {redZone && <span className={`field-redzone ${homeBall ? "left" : "right"}`} />}
        {firstDownX !== null && (
          <span className="field-first-down" style={{ left: `${firstDownX}%` }} />
        )}
        {ballX !== null && team && (
          <span
            className="field-ball"
            style={{ left: `${ballX}%`, ["--team" as string]: team.color }}
          >
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
