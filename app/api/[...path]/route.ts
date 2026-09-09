import { NextRequest, NextResponse } from "next/server";
import { z, ZodError } from "zod";
import { readState, mutate, audit, rateLimit } from "@/lib/store";
import { session, requireUser, requireAdmin, sameOrigin, safeSecret } from "@/lib/auth";
import {
  AppError,
  confirmBuyIn,
  currentWeek,
  publishWeek,
  saveEntry,
  openingKickoff,
} from "@/lib/rules";
import { syncWeeks } from "@/lib/sync";
import { view } from "@/lib/view";
import { startGoogle, finishGoogle, googleConfigured } from "@/lib/google-auth";
import { chatView, postChatMessage } from "@/lib/chat";
import { mutateChat, readChat } from "@/lib/chat-store";
import { markFirstChat, markOnboarded } from "@/lib/onboarding";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;
const weekSchema = z.coerce.number().int().min(1).max(18);
const pickSchema = z.object({
  week: weekSchema,
  picks: z.object({
    favorite: z.string().min(1),
    underdog: z.string().min(1),
    over: z.string().min(1),
    under: z.string().min(1),
  }),
  superSpread: z.boolean(),
  totalHelper: z.enum(["over", "under"]).nullable(),
  perfectPrediction: z.boolean(),
  revision: z.number().int().nonnegative(),
});
async function body(req: NextRequest) {
  if (Number(req.headers.get("content-length") ?? 0) > 16_384)
    throw new AppError("Request too large.", 413);
  const text = await req.text();
  if (text.length > 16_384) throw new AppError("Request too large.", 413);
  try {
    return JSON.parse(text);
  } catch {
    throw new AppError("Invalid request.");
  }
}
function failure(e: unknown) {
  if (e instanceof ZodError)
    return NextResponse.json(
      { error: e.issues[0]?.message ?? "Check your form values." },
      { status: 400 },
    );
  if (e instanceof AppError)
    return NextResponse.json({ error: e.message }, { status: e.status });
  console.error(
    "Pick4 request failed:",
    e instanceof Error ? e.message : "Unknown error",
  );
  return NextResponse.json(
    { error: "The request could not be completed. Please try again." },
    { status: 503 },
  );
}
const json = (data: unknown) =>
  NextResponse.json(data, {
    headers: { "Cache-Control": "private, no-store" },
  });
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  try {
    const route = (await params).path.join("/");
    if (route === "auth/google") return await startGoogle(req);
    if (route === "auth/callback/google") return await finishGoogle(req);
    if (route === "cron") {
      if (
        !safeSecret(
          req.headers.get("authorization") ?? "",
          process.env.CRON_SECRET ? `Bearer ${process.env.CRON_SECRET}` : undefined,
        )
      )
        throw new AppError("Unauthorized.", 401);
      const results = await syncWeeks(undefined, true);
      return NextResponse.json(
        { results },
        { status: results.some((r) => "ok" in r && !r.ok) ? 503 : 200 },
      );
    }
    const { state } = await readState();
    const user = await session(req, state);
    if (route === "account")
      return json({
        user: user
          ? {
              id: user.id,
              name: user.name,
              email: user.email,
              role: user.role,
              avatarRevision: user.avatarRevision ?? 0,
            }
          : null,
        authentication: { provider: "google", ready: googleConfigured() },
      });
    if (route === "health")
      return json({
        ok: true,
        season: 2026,
        storage: "connected",
        configured: googleConfigured(),
        authentication: "google",
        currentWeek: currentWeek(state.weeks),
        updatedAt: state.weeks.find((w) => w.number === currentWeek(state.weeks))
          ?.fetchedAt,
      });
    if (route === "state") {
      const week = weekSchema.parse(
        req.nextUrl.searchParams.get("week") ?? currentWeek(state.weeks),
      );
      return json(view(state, user, week, googleConfigured()));
    }
    if (route === "chat") {
      requireUser(user);
      const after = req.nextUrl.searchParams.get("after");
      if (after && !z.uuid().safeParse(after).success)
        throw new AppError("Invalid chat cursor.");
      const { chat } = await readChat();
      return json(chatView(state, chat, after));
    }
    if (route === "export") {
      requireAdmin(user);
      return new NextResponse(
        JSON.stringify(
          {
            season: 2026,
            exportedAt: new Date().toISOString(),
            users: state.users.map(({ id, name, username, role }) => ({
              id,
              name,
              username,
              role,
            })),
            entries: state.entries,
            weeks: state.weeks,
            audit: state.audit,
          },
          null,
          2,
        ),
        {
          headers: {
            "Content-Type": "application/json",
            "Content-Disposition": 'attachment; filename="pick4-2026-export.json"',
            "Cache-Control": "no-store",
          },
        },
      );
    }
    throw new AppError("Not found.", 404);
  } catch (e) {
    return failure(e);
  }
}
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  try {
    sameOrigin(req);
    const route = (await params).path.join("/");
    const { state } = await readState();
    const user = await session(req, state);
    if (
      ["login", "join", "setup", "password", "admin/invite", "admin/revoke"].includes(
        route,
      )
    )
      throw new AppError("Use Google sign-in to join the league.", 410);
    if (route === "logout") {
      const response = json({ ok: true });
      response.cookies.delete("pick4-session");
      return response;
    }
    const member = requireUser(user);
    await rateLimit(`user:${member.id}`, 90, 60_000);
    if (route === "picks") {
      const input = pickSchema.parse(await body(req));
      await syncWeeks([input.week]);
      const entry = await mutate((s) => {
        const entry = saveEntry(s, member.id, input);
        audit(
          s,
          member.id,
          "save-picks",
          `Week ${input.week}, revision ${entry.revision}${entry.late ? ", late entry" : ""}`,
        );
        return entry;
      });
      return json({ ok: true, entry });
    }
    if (route === "profile") {
      const input = z
        .object({ name: z.string().trim().min(2).max(40) })
        .parse(await body(req));
      await mutate((s) => {
        const account = s.users.find((u) => u.id === member.id)!;
        account.name = input.name;
        audit(s, member.id, "update-profile", "Display name updated.");
      });
      return json({ ok: true });
    }
    if (route === "chat") {
      const input = z.object({ body: z.string().min(1).max(800) }).parse(await body(req));
      const message = await mutateChat((chat) =>
        postChatMessage(chat, member.id, input.body),
      );
      if (!member.firstChatAt) {
        // Best effort: the message is already posted, so a milestone write
        // failure must not surface as a failed send.
        await mutate((s) => markFirstChat(s, member.id)).catch(() => undefined);
      }
      return json({ ok: true, message });
    }
    if (route === "onboarding") {
      await mutate((s) => markOnboarded(s, member.id));
      return json({ ok: true });
    }
    if (route === "refresh") {
      const input = z.object({ week: weekSchema }).parse(await body(req));
      await syncWeeks([input.week]);
      return json({ ok: true });
    }
    const admin = requireAdmin(member);
    if (route === "admin/buy-ins/confirm") {
      const input = z
        .object({ userId: z.string().min(1).max(128) })
        .parse(await body(req));
      await mutate((s) => {
        const entry = confirmBuyIn(s, input.userId);
        audit(
          s,
          admin.id,
          "confirm-buy-in",
          `Week 1 buy-in confirmed for ${entry.userId}.`,
        );
      });
      return json({ ok: true });
    }
    if (route === "admin/publish") {
      const input = z.object({ week: weekSchema }).parse(await body(req));
      const results = await syncWeeks([input.week], true);
      if (results.some((r) => "ok" in r && !r.ok))
        throw new AppError("Refresh failed. Lines were not published.", 503);
      await mutate((s) => {
        const w = s.weeks.find((w) => w.number === input.week)!;
        if (!w.publishedAt) {
          publishWeek(w);
          audit(
            s,
            admin.id,
            "publish-lines",
            `Week ${input.week}: published early by commissioner.`,
          );
        }
      });
      return json({ ok: true });
    }
    if (route === "admin/lines") {
      const input = z
        .object({
          week: weekSchema,
          gameId: z.string(),
          homeSpread: z.number().min(-50).max(50).multipleOf(0.5).nullable(),
          total: z.number().min(1).max(150).multipleOf(0.5).nullable(),
          reason: z.string().trim().min(8).max(300),
        })
        .parse(await body(req));
      await mutate((s) => {
        const w = s.weeks.find((w) => w.number === input.week)!;
        if (w.publishedAt || Date.now() >= openingKickoff(w))
          throw new AppError("Published lines cannot be edited.");
        const g = w.games.find((g) => g.id === input.gameId);
        if (!g) throw new AppError("Game not found.");
        g.homeSpread = input.homeSpread;
        g.total = input.total;
        g.provider = "Commissioner";
        g.linesOverride = { homeSpread: input.homeSpread, total: input.total };
        audit(s, admin.id, "line-correction", JSON.stringify(input));
      });
      return json({ ok: true });
    }
    if (route === "admin/score") {
      const input = z
        .object({
          week: weekSchema,
          gameId: z.string(),
          homeScore: z.number().int().min(0).max(100),
          awayScore: z.number().int().min(0).max(100),
          state: z.enum(["final", "canceled"]),
          reason: z.string().trim().min(8).max(300),
        })
        .parse(await body(req));
      await mutate((s) => {
        const w = s.weeks.find((w) => w.number === input.week)!;
        const g = w.games.find((g) => g.id === input.gameId);
        if (!g || Date.now() < Date.parse(g.kickoff))
          throw new AppError("Scores may only be corrected after kickoff.");
        g.homeScore = input.homeScore;
        g.awayScore = input.awayScore;
        g.state = input.state;
        g.detail = "Commissioner correction";
        g.resultOverride = {
          homeScore: input.homeScore,
          awayScore: input.awayScore,
          state: input.state,
          reason: input.reason,
        };
        audit(s, admin.id, "score-correction", JSON.stringify(input));
      });
      return json({ ok: true });
    }
    throw new AppError("Not found.", 404);
  } catch (e) {
    return failure(e);
  }
}
