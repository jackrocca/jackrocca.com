import test from "node:test";
import assert from "node:assert/strict";
import { SignJWT } from "jose";
import { NextRequest } from "next/server";
import { AtlasAccessError, requireAtlasOwner } from "../lib/atlas-access";
import { initialState } from "../lib/store";
import type { User } from "../lib/types";

process.env.SESSION_SECRET = "synthetic-atlas-access-session-secret-at-least-32";
const policy = {
  googleSubject: "google-owner-subject",
  email: "owner@example.invalid",
  origin: "https://archive.example.invalid",
};
const owner: User = {
  id: "owner-user",
  googleSub: policy.googleSubject,
  email: policy.email,
  name: "Synthetic owner",
  role: "player",
  sessionVersion: 4,
  createdAt: "2026-09-08T00:00:00Z",
};
async function token(
  user = owner,
  options: {
    version?: number;
    audience?: string;
    provider?: string;
    expired?: boolean;
  } = {},
) {
  return new SignJWT({
    version: options.version ?? user.sessionVersion,
    provider: options.provider ?? "google",
  })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(user.id)
    .setIssuer("pick4")
    .setAudience(options.audience ?? "pick4-league")
    .setExpirationTime(options.expired ? 1 : "5m")
    .sign(new TextEncoder().encode(process.env.SESSION_SECRET));
}
const state =
  (users: User[] = [owner]) =>
  async () => ({ ...initialState(), users });
function request(
  cookie?: string,
  method = "GET",
  headers: Record<string, string> = {},
  origin = policy.origin,
) {
  return new NextRequest(origin + "/api/atlas/session", {
    method,
    headers: { ...(cookie ? { cookie: `pick4-session=${cookie}` } : {}), ...headers },
  });
}
const rejected = (status: number) => (error: unknown) =>
  error instanceof AtlasAccessError && error.status === status;

test("Atlas requires the exact pinned Google identity, independent of website role", async () => {
  assert.equal(
    (await requireAtlasOwner(request(await token()), state(), policy)).id,
    owner.id,
  );
  for (const intruder of [
    {
      ...owner,
      id: "member",
      googleSub: "different-subject",
      email: "member@example.invalid",
      role: "player" as const,
    },
    { ...owner, id: "admin", googleSub: "different-subject", role: "admin" as const },
    { ...owner, email: "different@example.invalid" },
  ]) {
    await assert.rejects(
      requireAtlasOwner(request(await token(intruder)), state([intruder]), policy),
      rejected(403),
    );
  }
});

test("anonymous, forged, expired, wrong-audience, non-Google, and revoked sessions are denied", async () => {
  let reads = 0;
  await assert.rejects(
    requireAtlasOwner(
      request(),
      async () => {
        reads++;
        return initialState();
      },
      policy,
    ),
    rejected(401),
  );
  assert.equal(reads, 0);
  for (const cookie of [
    "forged",
    await token(owner, { expired: true }),
    await token(owner, { audience: "other-app" }),
    await token(owner, { provider: "password" }),
    await token(owner, { version: 3 }),
  ]) {
    await assert.rejects(
      requireAtlasOwner(request(cookie), state(), policy),
      rejected(401),
    );
  }
  const cookie = await token();
  await requireAtlasOwner(request(cookie), state(), policy);
  await assert.rejects(
    requireAtlasOwner(request(cookie), state([{ ...owner, sessionVersion: 5 }]), policy),
    rejected(401),
  );
  await assert.rejects(
    requireAtlasOwner(request(cookie), state([]), policy),
    rejected(401),
  );
});

test("archive mutations require canonical same-origin requests; owner headers cannot grant access", async () => {
  const cookie = await token();
  assert.equal(
    (
      await requireAtlasOwner(
        request(cookie, "POST", { origin: policy.origin }),
        state(),
        policy,
      )
    ).id,
    owner.id,
  );
  for (const method of ["POST", "PUT", "PATCH", "DELETE"]) {
    for (const headers of [
      {},
      { origin: "https://evil.example.invalid" },
      { origin: policy.origin, "sec-fetch-site": "cross-site" },
    ] as Record<string, string>[]) {
      await assert.rejects(
        requireAtlasOwner(request(cookie, method, headers), state(), policy),
        rejected(403),
      );
    }
  }
  await assert.rejects(
    requireAtlasOwner(
      request(cookie, "GET", {}, "https://preview.example.invalid"),
      state(),
      policy,
    ),
    rejected(403),
  );
  await assert.rejects(
    requireAtlasOwner(
      request(undefined, "POST", {
        origin: policy.origin,
        "x-atlas-owner": policy.googleSubject,
      }),
      state(),
      policy,
    ),
    rejected(401),
  );
});

test("missing or unsafe owner configuration fails closed", async () => {
  const req = request(await token());
  for (const overrides of [
    { googleSubject: "" },
    { email: undefined },
    { origin: undefined },
    { origin: "http://archive.example.invalid" },
    { origin: "https://user:pass@archive.example.invalid" },
    { origin: policy.origin + "/path" },
  ]) {
    await assert.rejects(
      requireAtlasOwner(req, state(), { ...policy, ...overrides }),
      rejected(503),
    );
  }
});
