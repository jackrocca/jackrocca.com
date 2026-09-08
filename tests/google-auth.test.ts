import test from "node:test";
import assert from "node:assert/strict";
import { SignJWT } from "jose";
import { NextRequest } from "next/server";
import { initialState } from "../lib/store";
import { joinLeagueWithGoogle } from "../lib/google-account";
import { loginResponse, session, secret } from "../lib/auth";
import { validateGoogleFlow, finishGoogle } from "../lib/google-auth";
import { view } from "../lib/view";
process.env.SESSION_SECRET = "test-only-session-secret-with-at-least-32-characters";
process.env.APP_URL = "http://localhost:3106";
const owner = "owner@gmail.com";
const profile = (sub = "google-player", email = "player@gmail.com") => ({
  sub,
  email,
  email_verified: true,
  name: "Player",
});

test("first Google sign-in joins the single league as player; only owner is commissioner", () => {
  const s = initialState();
  assert.equal(
    joinLeagueWithGoogle(s, { ...profile(), role: "admin", leagueId: "other" }, owner)
      .role,
    "player",
  );
  assert.equal(joinLeagueWithGoogle(s, profile("owner-id", owner), owner).role, "admin");
  assert.equal(s.users.length, 2);
  assert.equal(s.invites.length, 0);
});
test("repeated sign-in uses stable Google subject and preserves chosen display name", () => {
  const s = initialState();
  const first = joinLeagueWithGoogle(s, profile(), owner);
  first.name = "League nickname";
  const again = joinLeagueWithGoogle(
    s,
    profile("google-player", "updated@gmail.com"),
    owner,
  );
  assert.equal(again.id, first.id);
  assert.equal(again.email, "updated@gmail.com");
  assert.equal(again.name, "League nickname");
  assert.equal(s.users.length, 1);
});
test("unverified email and missing provider identity cannot create accounts", () => {
  for (const invalid of [
    { ...profile(), email_verified: false },
    { ...profile(), sub: "" },
    { email: owner },
    { ...profile(), email: "invalid" },
  ]) {
    const s = initialState();
    assert.throws(() => joinLeagueWithGoogle(s, invalid, owner));
    assert.equal(s.users.length, 0);
  }
});
test("different Google subjects cannot take over an existing account through email", () => {
  const s = initialState();
  const user = joinLeagueWithGoogle(s, profile(), owner);
  assert.throws(
    () => joinLeagueWithGoogle(s, profile("different-sub"), owner),
    /different account/,
  );
  joinLeagueWithGoogle(s, profile("other-sub", "other@gmail.com"), owner);
  assert.throws(
    () => joinLeagueWithGoogle(s, profile("other-sub", "player@gmail.com"), owner),
    /different account/,
  );
  assert.equal(s.users[0].id, user.id);
  assert.equal(s.users.length, 2);
});
test("owner email is normalized and role changes invalidate prior sessions", () => {
  const s = initialState();
  const user = joinLeagueWithGoogle(s, profile("owner-id", "Owner@gmail.com"), owner);
  assert.equal(user.role, "admin");
  joinLeagueWithGoogle(s, profile("owner-id", owner), "new-owner@gmail.com");
  assert.equal(user.role, "player");
  assert.equal(user.sessionVersion, 1);
});
test("Google sessions are HTTP-only and version checked; legacy sessions are rejected", async () => {
  const s = initialState();
  const user = joinLeagueWithGoogle(s, profile(), owner);
  const response = await loginResponse(user);
  const cookie = response.headers.get("set-cookie")!;
  assert.match(cookie, /HttpOnly/);
  assert.match(cookie, /SameSite=lax/i);
  const req = new NextRequest("http://localhost:3106", {
    headers: { cookie: cookie.split(";")[0] },
  });
  assert.equal((await session(req, s))?.id, user.id);
  user.sessionVersion++;
  assert.equal(await session(req, s), null);
  const legacy = await new SignJWT({ version: user.sessionVersion })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(user.id)
    .setIssuer("pick4")
    .setAudience("pick4-league")
    .setExpirationTime("1h")
    .sign(secret());
  assert.equal(
    await session(
      new NextRequest("http://localhost:3106", {
        headers: { cookie: `pick4-session=${legacy}` },
      }),
      s,
    ),
    null,
  );
});
async function flow(expiration = "10m", issuer = "pick4-oauth", returnTo = "/pick4") {
  return new SignJWT({
    returnTo,
    state: "random-state",
    nonce: "random-nonce",
    codeVerifier: "random-verifier",
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuer(issuer)
    .setAudience("google-sign-in")
    .setExpirationTime(expiration)
    .sign(secret());
}
test("OAuth binds state, nonce and PKCE verifier and rejects tampering or expiry", async () => {
  const valid = await flow();
  assert.deepEqual(await validateGoogleFlow(valid, "random-state"), {
    nonce: "random-nonce",
    codeVerifier: "random-verifier",
    returnTo: "/pick4",
  });
  await assert.rejects(validateGoogleFlow(valid, "attacker-state"));
  await assert.rejects(
    validateGoogleFlow(valid.slice(0, -8) + "tampered", "random-state"),
  );
  await assert.rejects(validateGoogleFlow(await flow("-1s"), "random-state"));
  await assert.rejects(
    validateGoogleFlow(await flow("10m", "wrong-issuer"), "random-state"),
  );
});
test("unsolicited callback cannot log in and clears temporary flow cookie", async () => {
  const result = await finishGoogle(
    new NextRequest(
      "http://localhost:3106/api/auth/callback/google?code=attacker&state=attacker",
    ),
  );
  assert.equal(
    result.headers.get("location"),
    "http://localhost:3106/pick4?authError=failed",
  );
  assert.equal(result.cookies.has("pick4-session"), false);
  assert.match(result.headers.get("set-cookie")!, /Max-Age=0/);
  assert.equal(result.headers.get("cache-control"), "no-store");
});
test("canceled Google flow returns a safe error instead of creating an account", async () => {
  const result = await finishGoogle(
    new NextRequest(
      "http://localhost:3106/api/auth/callback/google?error=access_denied&state=random-state",
      { headers: { cookie: `pick4-google-flow=${await flow()}` } },
    ),
  );
  assert.equal(
    result.headers.get("location"),
    "http://localhost:3106/pick4?authError=canceled",
  );
  assert.equal(result.cookies.has("pick4-session"), false);
});
test("members see only their own email and no Google identifiers; commissioner sees member emails", () => {
  const s = initialState();
  const player = joinLeagueWithGoogle(s, profile(), owner);
  const admin = joinLeagueWithGoogle(s, profile("owner-sub", owner), owner);
  const memberView = JSON.stringify(view(s, player, 1, true));
  assert.ok(!memberView.includes(owner));
  assert.ok(!memberView.includes("googleSub"));
  assert.ok(!memberView.includes("google-player"));
  assert.equal(view(s, admin, 1, true).admin?.members.length, 2);
  const guest = view(s, null, 1, true);
  assert.equal(guest.standings.length, 0);
  assert.equal(guest.user, null);
});

import { authReturnPath } from "../lib/auth-navigation";
test("OAuth return destinations allow site pages and reject external or unrecognized URLs", () => {
  for (const value of ["/", "/account", "/pick4"])
    assert.equal(authReturnPath(value), value);
  for (const value of [
    "https://evil.example",
    "//evil.example",
    "/\\evil.example",
    "/api/export",
    "javascript:alert(1)",
    null,
  ])
    assert.equal(authReturnPath(value), "/pick4");
});

test("signed OAuth flow preserves the account destination on cancellation", async () => {
  const cookie = await flow("10m", "pick4-oauth", "/account");
  assert.equal((await validateGoogleFlow(cookie, "random-state")).returnTo, "/account");
  const response = await finishGoogle(
    new NextRequest(
      "http://localhost:3106/api/auth/callback/google?error=access_denied&state=random-state",
      { headers: { cookie: `pick4-google-flow=${cookie}` } },
    ),
  );
  assert.equal(
    response.headers.get("location"),
    "http://localhost:3106/account?authError=canceled",
  );
  assert.equal(
    (
      await validateGoogleFlow(
        await flow("10m", "pick4-oauth", "https://evil.example"),
        "random-state",
      )
    ).returnTo,
    "/pick4",
  );
});
