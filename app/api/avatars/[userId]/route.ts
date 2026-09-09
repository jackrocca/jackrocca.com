import { NextRequest, NextResponse } from "next/server";
import { session, requireUser } from "@/lib/auth";
import { avatarUserId } from "@/lib/avatar";
import { readAvatar } from "@/lib/avatar-store";
import { leagueFailure, leagueApiHeaders } from "@/lib/league-http";
import { AppError } from "@/lib/rules";
import { readState } from "@/lib/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ userId: string }> },
) {
  try {
    const { state } = await readState();
    requireUser(await session(req, state));
    const userId = avatarUserId((await params).userId);
    const member = state.users.find((user) => user.id === userId);
    if (!member || !(member.avatarRevision ?? 0)) throw new AppError("Not found.", 404);
    const data = await readAvatar(userId);
    if (!data) throw new AppError("Not found.", 404);
    return new NextResponse(new Uint8Array(data), {
      headers: {
        ...leagueApiHeaders,
        "Content-Type": "image/webp",
        "Content-Disposition": "inline",
      },
    });
  } catch (e) {
    return leagueFailure(e);
  }
}
