"use client";
import Image from "next/image";
import { useState } from "react";
import type { Game, Team } from "@/lib/types";

type Props = { game: Game; side: "home" | "away"; team?: never } | { team: Team };

export function TeamMark(props: Props) {
  const team = "team" in props && props.team ? props.team : props.game![props.side!];
  const [failedTeamId, setFailedTeamId] = useState<string | null>(null);
  return (
    <span className="team-mark" aria-hidden="true">
      {failedTeamId === team.id ? (
        <span className="team-mark-fallback">{team.abbreviation}</span>
      ) : (
        <Image
          src={`/nfl/${encodeURIComponent(team.id)}.png`}
          alt=""
          width={500}
          height={500}
          sizes="48px"
          onError={() => setFailedTeamId(team.id)}
        />
      )}
    </span>
  );
}
