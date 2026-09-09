import test from "node:test";
import assert from "node:assert/strict";
import { SignJWT } from "jose";
import { NextRequest } from "next/server";
import { handleAtlasControl } from "../lib/atlas-control";
import { initialState } from "../lib/store";
import type { User } from "../lib/types";

process.env.SESSION_SECRET = "synthetic-atlas-control-session-secret-at-least-32";
const policy = {
  googleSubject: "synthetic-owner-sub",
  email: "owner@example.invalid",
  origin: "https://archive.example.invalid",
};
const owner: User = {
  id: "owner",
  googleSub: policy.googleSubject,
  email: policy.email,
  name: "Synthetic owner",
  role: "player",
  sessionVersion: 1,
  createdAt: "2026-09-08T00:00:00Z",
};
const member: User = { ...owner, id: "member", googleSub: "member-sub", role: "admin" };
const config = {
  origin: "https://control.example.invalid",
  environment: "preview",
  token: "synthetic-gateway-token-with-at-least-forty-characters",
  deploymentEnvironment: "preview",
};
const command = {
  id: "a".repeat(32),
  method: "POST",
  target: "/api/assets/synthetic-photo/star",
  body: { star_rating: 3 },
};
async function token(user = owner) {
  return new SignJWT({ version: user.sessionVersion, provider: "google" })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(user.id)
    .setIssuer("pick4")
    .setAudience("pick4-league")
    .setExpirationTime("5m")
    .sign(new TextEncoder().encode(process.env.SESSION_SECRET));
}
async function request(
  path = "/commands",
  user: User | null = owner,
  body: unknown = undefined,
  headers: Record<string, string> = {},
) {
  return new NextRequest(policy.origin + "/api/atlas" + path, {
    method: body === undefined ? "GET" : "POST",
    headers: {
      ...(user ? { cookie: "pick4-session=" + (await token(user)) } : {}),
      origin: policy.origin,
      "content-type": "application/json",
      ...headers,
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
}
const dependencies = {
  readState: async () => ({ ...initialState(), users: [owner, member] }),
  ownerPolicy: policy,
  config,
};
const envelope = (extra = {}) => ({
  protocol: "atlas-control-v1",
  environment: "preview",
  ...extra,
});

test("every gateway route checks owner and CSRF before contacting Cloudflare", async () => {
  let calls = 0;
  const upstream: typeof fetch = async () => {
    calls++;
    return Response.json(envelope());
  };
  for (const [path, body] of [
    ["/commands", { command }],
    ["/commands", undefined],
    ["/commands/" + command.id, undefined],
    ["/commands/" + command.id + "/request", undefined],
    ["/commands/" + command.id + "/review", { outcome: "applied" }],
    ["/worker", undefined],
  ] as const) {
    for (const [user, status] of [
      [null, 401],
      [member, 403],
    ] as const) {
      const res = await handleAtlasControl(await request(path, user, body), {
        ...dependencies,
        fetch: upstream,
      });
      assert.equal(res.status, status);
      assert.match(res.headers.get("cache-control")!, /no-store/);
    }
  }
  for (const origin of ["", "https://evil.invalid"])
    for (const [path, body] of [
      ["/commands", { command }],
      ["/commands/" + command.id + "/review", { outcome: "applied" }],
    ] as const)
      assert.equal(
        (
          await handleAtlasControl(await request(path, owner, body, { origin }), {
            ...dependencies,
            fetch: upstream,
          })
        ).status,
        403,
      );
  assert.equal(calls, 0);
});

test("owner command and receipt use the fixed server origin without forwarding browser credentials", async () => {
  const sent: { url: string; options: RequestInit }[] = [];
  const upstream: typeof fetch = async (url, options) => {
    sent.push({ url: String(url), options: options! });
    return Response.json(
      envelope({
        command: {
          id: command.id,
          state: options?.method === "POST" ? "queued" : "completed",
          result: null,
        },
      }),
      { status: options?.method === "POST" ? 202 : 200 },
    );
  };
  const queued = await handleAtlasControl(
    await request(
      "/commands?origin=https://evil.invalid",
      owner,
      { command },
      { authorization: "Bearer attacker", "x-atlas-worker": "attacker" },
    ),
    { ...dependencies, fetch: upstream },
  );
  assert.equal(queued.status, 202);
  assert.equal(sent[0].url, config.origin + "/v1/commands");
  assert.deepEqual(JSON.parse(sent[0].options.body as string), envelope({ command }));
  assert.deepEqual(sent[0].options.headers, {
    Authorization: "Bearer " + config.token,
    "Content-Type": "application/json",
  });
  assert.equal(sent[0].options.redirect, "error");
  assert.equal(sent[0].options.cache, "no-store");
  assert.equal(
    (
      await handleAtlasControl(await request("/commands/" + command.id), {
        ...dependencies,
        fetch: upstream,
      })
    ).status,
    200,
  );
  assert.equal(sent[1].url, config.origin + "/v1/commands/" + command.id);
});

test("gateway denies destructive, binary, arbitrary, and oversized commands before transport", async () => {
  let calls = 0;
  const upstream: typeof fetch = async () => {
    calls++;
    return Response.json(envelope());
  };
  for (const target of [
    "/api/trash/empty",
    "/api/assets/permanent-delete",
    "/api/uploads/file",
    "https://evil.invalid",
    "/api/assets/a/star/../trash",
    "/api/unknown",
  ]) {
    assert.equal(
      (
        await handleAtlasControl(
          await request("/commands", owner, { command: { ...command, target } }),
          { ...dependencies, fetch: upstream },
        )
      ).status,
      400,
    );
  }
  for (const body of [
    { command, token: "attacker" },
    { command: { ...command, body: [] } },
  ])
    assert.equal(
      (
        await handleAtlasControl(await request("/commands", owner, body), {
          ...dependencies,
          fetch: upstream,
        })
      ).status,
      400,
    );
  assert.equal(
    (
      await handleAtlasControl(
        await request("/commands", owner, {
          command: { ...command, body: { text: "x".repeat(70000) } },
        }),
        { ...dependencies, fetch: upstream },
      )
    ).status,
    413,
  );
  assert.equal(calls, 0);
});

test("gateway fails closed for wrong environment, unsafe config, unverified responses, and lost acknowledgments", async () => {
  let calls = 0;
  const upstream: typeof fetch = async () => {
    calls++;
    return Response.json(envelope());
  };
  for (const override of [
    { origin: "http://control.invalid" },
    { origin: config.origin + "/other" },
    { origin: "https://user:pass@control.invalid" },
    { token: "short" },
    { environment: "production" },
  ])
    assert.equal(
      (
        await handleAtlasControl(await request("/worker"), {
          ...dependencies,
          config: { ...config, ...override },
          fetch: upstream,
        })
      ).status,
      503,
    );
  assert.equal(calls, 0);
  for (const reply of [
    Response.json({ ...envelope(), environment: "production" }),
    new Response("redirect secret", { status: 302 }),
    Response.json({ error: { message: config.token } }, { status: 401 }),
    Response.json({ text: "x".repeat(1100001) }),
  ]) {
    const res = await handleAtlasControl(await request("/worker"), {
      ...dependencies,
      fetch: async () => reply,
    });
    assert.equal(res.status, 503);
    assert.ok(!(await res.text()).includes(config.token));
  }
  const lost = await handleAtlasControl(await request("/commands", owner, { command }), {
    ...dependencies,
    fetch: async () => {
      throw new Error(config.token);
    },
  });
  assert.equal(lost.status, 503);
  assert.match(await lost.text(), /same command/);
});

test("catalog and media reads remain owner-only and cannot reach writer routes", async () => {
  let calls = 0;
  const upstream: typeof fetch = async () => {
    calls++;
    return Response.json(envelope({ items: [] }));
  };
  for (const path of [
    "/catalog/head",
    "/catalog/assets",
    "/catalog/assets/synthetic",
    "/catalog/timeline",
    ...["places", "named-places", "tags", "saved-searches"].map(
      (name) => "/catalog/workflows/" + name,
    ),
    "/catalog/media/" + "a".repeat(64),
  ]) {
    for (const [user, status] of [
      [null, 401],
      [member, 403],
    ] as const)
      assert.equal(
        (
          await handleAtlasControl(await request(path, user), {
            ...dependencies,
            fetch: upstream,
          })
        ).status,
        status,
      );
  }
  for (const path of [
    "/catalog/begin",
    "/catalog/workflows",
    "/catalog/workflows/status",
    "/catalog/batch",
    "/catalog/commit",
    "/catalog/media/not-a-hash",
  ])
    assert.equal(
      (
        await handleAtlasControl(await request(path), {
          ...dependencies,
          fetch: upstream,
        })
      ).status,
      404,
    );
  assert.equal(calls, 0);
  let destination = "";
  const response = await handleAtlasControl(
    await request("/catalog/assets?rating=5&q=mountain"),
    {
      ...dependencies,
      fetch: async (url) => {
        destination = String(url);
        return Response.json(envelope({ items: [] }));
      },
    },
  );
  assert.equal(response.status, 200);
  assert.equal(destination, config.origin + "/v1/catalog/assets?rating=5&q=mountain");
});

test("private image gateway streams bounded verified bytes without shared caching", async () => {
  const path = "/catalog/media/" + "a".repeat(64);
  const bytes = new Uint8Array([1, 2, 3, 4]);
  const headers = {
    "Content-Type": "image/png",
    "Content-Length": "4",
    "X-Atlas-Protocol": "atlas-control-v1",
    "X-Atlas-Environment": "preview",
  };
  const image = await handleAtlasControl(await request(path), {
    ...dependencies,
    fetch: async () => new Response(bytes, { headers }),
  });
  assert.equal(image.status, 200);
  assert.match(image.headers.get("cache-control")!, /private.*no-store/);
  assert.equal(image.headers.get("vary"), "Cookie");
  assert.deepEqual(new Uint8Array(await image.arrayBuffer()), bytes);
  for (const override of [
    { "Content-Type": "text/html" },
    { "Content-Length": "16777217" },
    { "X-Atlas-Environment": "production" },
    { "X-Atlas-Protocol": "wrong" },
  ]) {
    const rejected = await handleAtlasControl(await request(path), {
      ...dependencies,
      fetch: async () => new Response(bytes, { headers: { ...headers, ...override } }),
    });
    assert.equal(rejected.status, 503);
  }
  const truncated = await handleAtlasControl(await request(path), {
    ...dependencies,
    fetch: async () => new Response(bytes.slice(0, 2), { headers }),
  });
  await assert.rejects(truncated.arrayBuffer(), /Incomplete preview/);
});
