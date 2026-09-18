import { NextRequest, NextResponse } from "next/server";
import { session, requireUser } from "@/lib/auth";
import { loadGameDetail } from "@/lib/game-detail";
import { leagueApiHeaders, leagueFailure } from "@/lib/league-http";
import { AppError } from "@/lib/rules";
import { readState } from "@/lib/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 30;

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { state } = await readState();
    requireUser(await session(req, state));
    const id = (await params).id;
    // Only games on the league schedule are fetched, so the route is not an open proxy.
    const game = /^\d{1,12}$/.test(id)
      ? state.weeks.flatMap((w) => w.games).find((g) => g.id === id)
      : undefined;
    if (!game) throw new AppError("Game not found.", 404);
    const detail = await loadGameDetail(id);
    return NextResponse.json(detail, {
      headers: {
        ...leagueApiHeaders,
        "Cache-Control": `private, max-age=${detail.summary.state === "live" ? 15 : 60}`,
      },
    });
  } catch (e) {
    return leagueFailure(e);
  }
}
