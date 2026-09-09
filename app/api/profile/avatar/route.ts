import { NextRequest } from "next/server";
import { session, requireUser, sameOrigin } from "@/lib/auth";
import { AVATAR_MAX_UPLOAD_BYTES, processAvatar } from "@/lib/avatar";
import { deleteAvatar, writeAvatar } from "@/lib/avatar-store";
import { leagueFailure, leagueJson } from "@/lib/league-http";
import { AppError } from "@/lib/rules";
import { audit, mutate, rateLimit, readState } from "@/lib/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    sameOrigin(req);
    const { state } = await readState();
    const member = requireUser(await session(req, state));
    await rateLimit(`user:${member.id}`, 90, 60_000);
    const length = Number(req.headers.get("content-length") ?? 0);
    if (length > AVATAR_MAX_UPLOAD_BYTES + 16_384)
      throw new AppError("Keep photos under 4 MB.", 413);
    const form = await req.formData();
    const photo = form.get("photo");
    if (!(photo instanceof File)) throw new AppError("Choose a photo to upload.");
    if (photo.size > AVATAR_MAX_UPLOAD_BYTES)
      throw new AppError("Keep photos under 4 MB.", 413);
    const processed = await processAvatar(Buffer.from(await photo.arrayBuffer()));
    await writeAvatar(member.id, processed);
    const avatarRevision = await mutate((s) => {
      const account = s.users.find((u) => u.id === member.id)!;
      account.avatarRevision = (account.avatarRevision ?? 0) + 1;
      audit(s, member.id, "update-avatar", "Profile photo updated.");
      return account.avatarRevision;
    });
    return leagueJson({ ok: true, avatarRevision });
  } catch (e) {
    return leagueFailure(e);
  }
}

export async function DELETE(req: NextRequest) {
  try {
    sameOrigin(req);
    const { state } = await readState();
    const member = requireUser(await session(req, state));
    await rateLimit(`user:${member.id}`, 90, 60_000);
    await deleteAvatar(member.id);
    await mutate((s) => {
      const account = s.users.find((u) => u.id === member.id)!;
      account.avatarRevision = 0;
      audit(s, member.id, "remove-avatar", "Profile photo removed.");
    });
    return leagueJson({ ok: true, avatarRevision: 0 });
  } catch (e) {
    return leagueFailure(e);
  }
}
