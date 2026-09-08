// In-process API integration with isolated local storage and test-only identities.
// This never contacts Google or substitutes for a real Google sign-in smoke test.
import assert from "node:assert/strict";
import { mkdir, mkdtemp, rm } from "node:fs/promises";
import path from "node:path";
import { NextRequest } from "next/server";
import { randomBytes } from "node:crypto";
async function main() {
  if (process.env.VERCEL || process.env.NODE_ENV === "production")
    throw new Error("Run locally only.");
  delete process.env.BLOB_READ_WRITE_TOKEN;
  delete process.env.BLOB_STORE_ID;
  delete process.env.LEAGUE_STORAGE_PREFIX;
  await mkdir(path.join(process.cwd(), "work"), { recursive: true });
  const directory = await mkdtemp(path.join(process.cwd(), "work/api-google-"));
  process.env.LOCAL_STORE_PATH = path.join(directory, "state.json");
  process.env.SESSION_SECRET = randomBytes(32).toString("hex");
  process.env.GOOGLE_CLIENT_ID = "test-client.apps.googleusercontent.com";
  process.env.GOOGLE_CLIENT_SECRET = "test-only";
  process.env.OWNER_EMAIL = "owner@gmail.com";
  const base = (process.env.APP_URL = "http://localhost:3106");
  const { GET, POST } = await import("../app/api/[...path]/route");
  const { mutate, readState } = await import("../lib/store");
  const { joinLeagueWithGoogle } = await import("../lib/google-account");
  const { loginResponse } = await import("../lib/auth");
  const { publishWeek } = await import("../lib/rules");
  let checks = 0;
  async function request(
    route: string,
    data?: unknown,
    expected = 200,
    cookie = "",
    origin = base,
  ) {
    const req = new NextRequest(`${base}/api/${route}`, {
      method: data === undefined ? "GET" : "POST",
      headers: { origin, cookie, "content-type": "application/json" },
      body: data === undefined ? undefined : JSON.stringify(data),
    });
    const ctx = {
      params: Promise.resolve({ path: route.split("?")[0].split("/") }),
    };
    const response =
      data === undefined ? await GET(req, ctx) : await POST(req, ctx);
    assert.equal(response.status, expected, `${route} status`);
    checks++;
    return response;
  }
  try {
    const initial = await (await request("state")).json();
    assert.equal(initial.user, null);
    assert.equal(initial.authentication.provider, "google");
    assert.equal(initial.authentication.ready, true);
    for (const route of [
      "setup",
      "login",
      "join",
      "password",
      "admin/invite",
      "admin/revoke",
    ])
      await request(route, { role: "admin", email: "owner@gmail.com" }, 410);
    await request("picks", {}, 401);
    await request("profile", { name: "Fake" }, 401);
    await request("export", undefined, 401);
    await request("cron", undefined, 401);
    const start = await request("auth/google", undefined, 307);
    const url = new URL(start.headers.get("location")!);
    assert.equal(url.origin, "https://accounts.google.com");
    assert.equal(
      url.searchParams.get("redirect_uri"),
      `${base}/api/auth/callback/google`,
    );
    assert.equal(url.searchParams.get("code_challenge_method"), "S256");
    assert.deepEqual(url.searchParams.get("scope")!.split(" ").sort(), [
      "email",
      "openid",
      "profile",
    ]);
    assert.ok(url.searchParams.get("state"));
    assert.ok(url.searchParams.get("nonce"));
    assert.match(start.headers.get("set-cookie")!, /HttpOnly/);
    assert.equal(start.headers.get("cache-control"), "no-store");
    const failed = await request(
      "auth/callback/google?code=fake&state=fake",
      undefined,
      307,
    );
    assert.ok(failed.headers.get("location")?.endsWith("authError=failed"));
    assert.equal((await readState()).state.users.length, 0);
    // Seed verified-profile fixtures through the internal function, never a public login endpoint.
    const users = await mutate((s) => {
      const users = ["owner", "player", "second"].map((id) =>
        joinLeagueWithGoogle(
          s,
          {
            sub: `fixture-${id}`,
            email: `${id}@gmail.com`,
            email_verified: true,
            name: id,
          },
          process.env.OWNER_EMAIL!,
        ),
      );
      const w = s.weeks[0];
      for (const g of w.games)
        g.kickoff = new Date(Date.now() + 7 * 86400_000).toISOString();
      w.fetchedAt = new Date().toISOString();
      publishWeek(w);
      return users;
    });
    const cookies = await Promise.all(
      users.map(
        async (u) =>
          (await loginResponse(u)).headers.get("set-cookie")!.split(";")[0],
      ),
    );
    const [admin, player, second] = cookies;
    await request(
      "profile",
      { name: "Bad origin" },
      403,
      player,
      "https://evil.example",
    );
    await request("profile", { name: "x" }, 400, player);
    await request(
      "profile",
      { name: "New nickname", role: "admin", email: "owner@gmail.com" },
      200,
      player,
    );
    const profile = await (
      await request("state", undefined, 200, player)
    ).json();
    assert.equal(profile.user.name, "New nickname");
    assert.equal(profile.user.role, "player");
    assert.equal(profile.user.email, "player@gmail.com");
    assert.equal(profile.admin, null);
    await request("admin/lines", {}, 403, player);
    await request("export", undefined, 403, player);
    const state = (await readState()).state;
    const ids = state.weeks[0].games.slice(0, 4).map((g) => g.id);
    const input = {
      week: 1,
      picks: {
        favorite: ids[0],
        underdog: ids[1],
        over: ids[2],
        under: ids[3],
      },
      superSpread: false,
      totalHelper: null,
      perfectPrediction: false,
      revision: 0,
    };
    await request(
      "picks",
      { ...input, picks: { ...input.picks, under: ids[0] } },
      400,
      player,
    );
    await Promise.all([
      request("picks", input, 200, player),
      request("picks", input, 200, second),
    ]);
    await request("picks", input, 409, player);
    const saved = await (
      await request("state?week=1", undefined, 200, player)
    ).json();
    assert.equal(saved.entries.length, 2);
    assert.ok(
      saved.entries.find((e: { userId: string }) => e.userId === users[1].id)
        .picks,
    );
    assert.equal(
      saved.entries.find((e: { userId: string }) => e.userId === users[2].id)
        .picks,
      null,
    );
    assert.ok(!JSON.stringify(saved).includes("fixture-"));
    assert.ok(!JSON.stringify(saved).includes("owner@gmail.com"));
    const exported = await (
      await request("export", undefined, 200, admin)
    ).json();
    assert.equal(exported.entries.length, 2);
    assert.ok(!JSON.stringify(exported).includes("googleSub"));
    const logout = await request("logout", {}, 200, player);
    assert.match(logout.headers.get("set-cookie")!, /pick4-session=;/);
    await mutate((s) => {
      s.users.find((u) => u.id === users[1].id)!.sessionVersion++;
    });
    await request("profile", { name: "Revoked session" }, 401, player);
    console.log(
      `${checks} isolated API checks passed: OAuth redirect, retired endpoints, CSRF, profile changes, roles, concurrent picks, privacy, exports, and session invalidation. Real Google authentication still requires a browser smoke test.`,
    );
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
}
main().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
