import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, writeFile, mkdir, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { createHash } from "node:crypto";
import { SignJWT } from "jose";
import { NextRequest } from "next/server";
import { initialState } from "../lib/store";
import { handleAtlasInterface } from "../lib/atlas-interface";
import { handleAtlasRPC } from "../lib/atlas-rpc";
import type { User } from "../lib/types";
process.env.SESSION_SECRET = "synthetic-atlas-interface-session-secret-32-characters";
const policy = {
  googleSubject: "owner-sub",
  email: "owner@example.invalid",
  origin: "https://archive.example.invalid",
};
const owner: User = {
  id: "owner",
  googleSub: policy.googleSubject,
  email: policy.email,
  name: "Synthetic",
  role: "player",
  sessionVersion: 1,
  createdAt: "2026-09-08",
};
const member = {
  ...owner,
  id: "member",
  googleSub: "member-sub",
  role: "admin" as const,
};
const dependencies = {
  ownerPolicy: policy,
  readState: async () => ({ ...initialState(), users: [owner, member] }),
};
async function req(pathname: string, user: User | null = owner, origin = policy.origin) {
  const token = user
    ? await new SignJWT({ version: 1, provider: "google" })
        .setProtectedHeader({ alg: "HS256" })
        .setSubject(user.id)
        .setIssuer("pick4")
        .setAudience("pick4-league")
        .setExpirationTime("5m")
        .sign(new TextEncoder().encode(process.env.SESSION_SECRET))
    : "";
  return new NextRequest(origin + pathname, {
    headers: token ? { cookie: "pick4-session=" + token } : {},
  });
}

test("private interface checks current owner for HTML, chunks, fonts and artwork; rejects unlisted files", async () => {
  const root = await mkdtemp(path.join(tmpdir(), "private-atlas-test-"));
  try {
    const files: Record<string, { size: number; sha256: string }> = {};
    for (const [name, text] of Object.entries({
      "index.html": "<html>Private Atlas</html>",
      "_next/static/app.js": "window.test=1",
      "_next/static/font.woff2": "font",
      "atlas/earth-night.jpg": "synthetic-artwork",
      "atlas-download-sw.js": "synthetic-service-worker",
    })) {
      await mkdir(path.dirname(path.join(root, name)), { recursive: true });
      await writeFile(path.join(root, name), text);
      files[name] = {
        size: Buffer.byteLength(text),
        sha256: createHash("sha256").update(text).digest("hex"),
      };
    }
    await writeFile(
      path.join(root, "manifest.json"),
      JSON.stringify({ version: 1, basePath: "/atlas", files }),
    );
    const deps = { ...dependencies, bundleRoot: root };
    for (const route of [
      "/atlas",
      "/atlas/_next/static/app.js",
      "/atlas/_next/static/font.woff2",
      "/atlas/earth-night.jpg",
      "/atlas/atlas-download-sw.js",
    ]) {
      const res = await handleAtlasInterface(await req(route), deps);
      assert.equal(res.status, 200);
      if (route.endsWith("atlas-download-sw.js"))
        assert.equal(res.headers.get("service-worker-allowed"), "/atlas");
      assert.match(res.headers.get("cache-control")!, /private.*no-store/);
      assert.equal(
        (await handleAtlasInterface(await req(route, member), deps)).status,
        403,
      );
      assert.equal(
        (
          await handleAtlasInterface(
            await req(route, owner, "https://preview.example.invalid"),
            deps,
          )
        ).status,
        403,
      );
      const anonymous = await handleAtlasInterface(await req(route, null), deps);
      assert.equal(anonymous.status, route === "/atlas" ? 303 : 401);
    }
    for (const route of [
      "/atlas/manifest.json",
      "/atlas/.env",
      "/atlas/_next/static/app.js.map",
      "/atlas/%2e%2e%2fsecret",
    ])
      assert.equal((await handleAtlasInterface(await req(route), deps)).status, 404);
    await writeFile(path.join(root, "_next/static/app.js"), "tampered");
    assert.equal(
      (await handleAtlasInterface(await req("/atlas/_next/static/app.js"), deps)).status,
      503,
    );
    const revoked = {
      ...deps,
      readState: async () => ({
        ...initialState(),
        users: [{ ...owner, sessionVersion: 2 }],
      }),
    };
    assert.equal(
      (await handleAtlasInterface(await req("/atlas/_next/static/app.js"), revoked))
        .status,
      401,
    );
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

const config = {
  origin: "https://control.example.invalid",
  environment: "preview",
  deploymentEnvironment: "preview",
  token: "synthetic-gateway-with-at-least-forty-characters",
};
const envelope = (extra: object) =>
  Response.json({ protocol: "atlas-control-v1", environment: "preview", ...extra });

test("existing UI reads use cloud grid and private image bytes; Mac reads fail clearly offline", async () => {
  const calls: string[] = [];
  const deps = {
    ...dependencies,
    config,
    fetch: async (input: string | URL | Request) => {
      calls.push(String(input));
      if (String(input).includes("/v1/worker")) return envelope({ online: false });
      return envelope({ items: [{ id: "synthetic" }], total_assets: 1 });
    },
  };
  const res = await handleAtlasRPC(await req("/api/atlas/rpc/assets?limit=3"), deps);
  assert.equal(res.status, 200);
  assert.equal((await res.json()).items[0].id, "synthetic");
  assert.equal(calls[0], config.origin + "/v1/catalog/assets?limit=3");
  const offline = await handleAtlasRPC(await req("/api/atlas/rpc/people"), deps);
  assert.equal(offline.status, 503);
  assert.match((await offline.json()).error, /Mac is offline/);
  calls.length = 0;
  for (const user of [null, member]) {
    assert.ok(
      [401, 403].includes(
        (await handleAtlasRPC(await req("/api/atlas/rpc/faces/1/crop", user), deps))
          .status,
      ),
    );
  }
  assert.deepEqual(calls, []);
});

test("private face transport verifies thumbnail hashes and never grants members access", async () => {
  const bytes = Buffer.from("synthetic thumbnail");
  const deps = {
    ...dependencies,
    config,
    fetch: async (input: string | URL | Request, init?: RequestInit) => {
      if (String(input).endsWith("/catalog/head")) return envelope({});
      if (String(input).endsWith("/worker")) return envelope({ online: true });
      const command = JSON.parse(String(init?.body)).command;
      assert.equal(command.target, "/api/faces/123/crop");
      return envelope({
        command: {
          id: command.id,
          state: "completed",
          result: {
            status: 200,
            body: {
              thumbnail: {
                content_type: "image/jpeg",
                size: bytes.length,
                sha256: createHash("sha256").update(bytes).digest("hex"),
                base64: bytes.toString("base64"),
              },
            },
          },
        },
      });
    },
  };
  const response = await handleAtlasRPC(await req("/api/atlas/rpc/faces/123/crop"), deps);
  assert.equal(response.status, 200);
  assert.equal(response.headers.get("content-type"), "image/jpeg");
  assert.deepEqual(Buffer.from(await response.arrayBuffer()), bytes);
});

test("offline portrait delivery is owner-only, bounded, and does not enqueue Mac reads", async () => {
  const bytes = Buffer.from("synthetic cloud portrait"),
    calls: string[] = [];
  let revoked = false;
  const deps = {
    ...dependencies,
    config,
    fetch: async (input: string | URL | Request) => {
      calls.push(String(input));
      if (String(input).endsWith("/catalog/head"))
        return envelope({ capabilities: ["face-thumbnails-v1"] });
      if (String(input).endsWith("/worker")) return envelope({ online: false });
      if (revoked)
        return Response.json({ error: { code: "not_found" } }, { status: 404 });
      return new Response(bytes, {
        headers: {
          "Content-Type": "image/png",
          "Content-Length": String(bytes.length),
          "X-Atlas-Protocol": "atlas-control-v1",
          "X-Atlas-Environment": "preview",
        },
      });
    },
  };
  const path = "/api/atlas/rpc/faces/synthetic-face/crop";
  const response = await handleAtlasRPC(await req(path), deps);
  assert.equal(response.status, 200);
  assert.deepEqual(Buffer.from(await response.arrayBuffer()), bytes);
  assert.deepEqual(calls, [
    config.origin + "/v1/catalog/head",
    config.origin + "/v1/catalog/faces/synthetic-face/crop",
  ]);
  for (const user of [null, member])
    assert.ok(
      [401, 403].includes((await handleAtlasRPC(await req(path, user), deps)).status),
    );
  assert.equal(calls.length, 2);
  assert.equal((await handleAtlasRPC(await req(path + "?anything=1"), deps)).status, 400);
  revoked = true;
  assert.equal((await handleAtlasRPC(await req(path), deps)).status, 404);
  assert.equal(calls.at(-1), config.origin + "/v1/worker");
  assert.ok(!calls.some((url) => url.includes("/commands")));
});

test("person-photo collections negotiate support and use bounded private pages", async () => {
  const calls: string[] = [];
  let supported = true,
    stale = false;
  const deps = {
    ...dependencies,
    config,
    fetch: async (input: string | URL | Request) => {
      calls.push(String(input));
      if (String(input).endsWith("/catalog/head"))
        return envelope({ capabilities: supported ? ["person-photos-v1"] : [] });
      if (String(input).endsWith("/worker")) return envelope({ online: false });
      if (stale) return Response.json({ error: { code: "stale" } }, { status: 409 });
      return envelope({
        snapshot: "a".repeat(32),
        workflowSnapshot: "b".repeat(64),
        synchronizedAt: 123,
        document: {
          person: { id: 1 },
          items: [{ id: "synthetic" }],
          total: 1,
          next_offset: null,
        },
      });
    },
  };
  const path = "/api/atlas/rpc/people/1/assets?limit=20000";
  const response = await handleAtlasRPC(await req(path), deps);
  assert.equal(response.status, 200);
  assert.equal(response.headers.get("X-Atlas-Collection-Paged"), "1");
  assert.equal(
    calls.at(-1),
    config.origin + "/v1/catalog/workflows/person-assets/1?limit=500",
  );
  assert.equal((await response.json()).person.id, 1);
  for (const user of [null, member])
    assert.ok(
      [401, 403].includes((await handleAtlasRPC(await req(path, user), deps)).status),
    );
  assert.equal(calls.length, 2);
  stale = true;
  assert.equal(
    (await handleAtlasRPC(await req(path + "&workflow_snapshot=" + "b".repeat(64)), deps))
      .status,
    409,
  );
  assert.ok(!calls.at(-1)?.endsWith("/worker"));
  supported = false;
  assert.equal((await handleAtlasRPC(await req(path), deps)).status, 503);
  assert.equal(calls.at(-1), config.origin + "/v1/worker");
});

test("private offline list views unwrap cloud documents without queueing Mac reads", async () => {
  const calls: string[] = [];
  const deps = {
    ...dependencies,
    config,
    fetch: async (input: string | URL | Request) => {
      calls.push(String(input));
      if (String(input).endsWith("/catalog/head"))
        return envelope({ capabilities: ["workflows-v1"] });
      return envelope({
        snapshot: "a".repeat(32),
        synchronizedAt: 123,
        document: { items: [{ name: "Synthetic private label" }] },
      });
    },
  };
  for (const name of ["places", "named-places", "tags", "saved-searches"]) {
    const path = "/api/atlas/rpc/" + name;
    const response = await handleAtlasRPC(await req(path), deps);
    assert.equal(response.status, 200);
    assert.equal(response.headers.get("X-Atlas-Synchronized-At"), "123");
    assert.equal((await response.json()).items[0].name, "Synthetic private label");
    assert.equal(calls.at(-1), config.origin + "/v1/catalog/workflows/" + name);
    for (const user of [null, member])
      assert.ok(
        [401, 403].includes((await handleAtlasRPC(await req(path, user), deps)).status),
      );
    assert.equal(
      (await handleAtlasRPC(await req(path + "?unexpected=1"), deps)).status,
      400,
    );
  }
  assert.equal(calls.length, 12);
});

test("workflow reads retain the existing Mac transport before the cloud advertises support", async () => {
  const calls: string[] = [];
  const deps = {
    ...dependencies,
    config,
    fetch: async (input: string | URL | Request) => {
      calls.push(String(input));
      if (String(input).endsWith("/catalog/head"))
        return envelope({ snapshot: "a".repeat(32) });
      return envelope({ online: false });
    },
  };
  const response = await handleAtlasRPC(
    await req("/api/atlas/rpc/albums?status=confirmed&limit=500"),
    deps,
  );
  assert.equal(response.status, 503);
  assert.match((await response.json()).error, /Mac is offline/);
  assert.deepEqual(calls, [
    config.origin + "/v1/catalog/head",
    config.origin + "/v1/worker",
  ]);
});

test("People cloud views preserve owner checks, filters, and stale-page failures", async () => {
  const calls: string[] = [];
  let stale = false;
  const deps = {
    ...dependencies,
    config,
    fetch: async (input: string | URL | Request) => {
      calls.push(String(input));
      if (String(input).endsWith("/catalog/head"))
        return envelope({ capabilities: ["people-views-v1"] });
      if (String(input).endsWith("/worker")) return envelope({ online: false });
      if (stale)
        return Response.json(
          { error: { code: "stale", message: "Reload People" } },
          { status: 409 },
        );
      return envelope({
        snapshot: "a".repeat(32),
        workflowSnapshot: "b".repeat(64),
        synchronizedAt: 123,
        document: { items: [{ id: 1, display_name: "Synthetic private person" }] },
      });
    },
  };
  for (const [path, target] of [
    ["people?limit=2&offset=1", "people?limit=2&offset=1"],
    ["people/relationships", "relationships"],
    ["people/graph", "people-graph"],
    ["people/graph?limit=500&edge_limit=240", "people-graph"],
  ]) {
    const response = await handleAtlasRPC(await req("/api/atlas/rpc/" + path), deps);
    assert.equal(response.status, 200);
    assert.equal(response.headers.get("X-Atlas-Workflow-Snapshot"), "b".repeat(64));
    assert.equal(calls.at(-1), config.origin + "/v1/catalog/workflows/" + target);
    const count = calls.length;
    for (const user of [null, member])
      assert.ok(
        [401, 403].includes(
          (await handleAtlasRPC(await req("/api/atlas/rpc/" + path, user), deps)).status,
        ),
      );
    assert.equal(calls.length, count);
  }
  // A nondefault graph query retains the exact local computation via the Mac.
  assert.equal(
    (await handleAtlasRPC(await req("/api/atlas/rpc/people/graph?limit=1"), deps)).status,
    503,
  );
  assert.equal(calls.at(-1), config.origin + "/v1/worker");
  stale = true;
  assert.equal(
    (
      await handleAtlasRPC(
        await req("/api/atlas/rpc/people?offset=1&workflow_snapshot=" + "b".repeat(64)),
        deps,
      )
    ).status,
    409,
  );
  assert.ok(!calls.at(-1)?.endsWith("/worker"));
});

test("photo details negotiate cloud support and never bypass owner or pinned revision checks", async () => {
  const calls: string[] = [];
  let available = true,
    status = 200,
    online = false;
  const document = {
    asset: { id: "synthetic-photo", user_caption: "Synthetic detail" },
    versions: [],
  };
  const deps = {
    ...dependencies,
    config,
    fetch: async (input: string | URL | Request) => {
      const path = String(input);
      calls.push(path);
      if (path.endsWith("/catalog/head"))
        return envelope({ capabilities: available ? ["photo-details-v1"] : [] });
      if (path.endsWith("/worker")) return envelope({ online });
      if (path.endsWith("/commands"))
        return envelope({ command: { id: "synthetic-command", state: "pending" } });
      if (status !== 200)
        return Response.json(
          { error: { code: "detail_unavailable", message: "Connect your Mac" } },
          { status },
        );
      return envelope({ snapshot: "a".repeat(32), document });
    },
  };
  const path = "/api/atlas/rpc/assets/synthetic-photo";
  let response = await handleAtlasRPC(await req(path), deps);
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), document);
  assert.equal(response.headers.get("X-Atlas-Snapshot"), "a".repeat(32));
  const count = calls.length;
  for (const user of [null, member])
    assert.ok(
      [401, 403].includes((await handleAtlasRPC(await req(path, user), deps)).status),
    );
  assert.equal(calls.length, count);
  assert.equal(
    (await handleAtlasRPC(await req(path + "?unexpected=1"), deps)).status,
    400,
  );
  assert.equal(
    (await handleAtlasRPC(await req(path + "?snapshot=a&snapshot=b"), deps)).status,
    400,
  );
  status = 409;
  assert.equal(
    (await handleAtlasRPC(await req(path + "?snapshot=" + "b".repeat(32)), deps)).status,
    409,
  );
  assert.ok(!calls.at(-1)?.endsWith("/worker"));
  status = 404;
  assert.equal((await handleAtlasRPC(await req(path), deps)).status, 404);
  online = true;
  response = await handleAtlasRPC(await req(path), deps);
  assert.equal(response.status, 200);
  assert.equal(calls.at(-1), config.origin + "/v1/commands");
  available = false;
  online = false;
  assert.equal((await handleAtlasRPC(await req(path), deps)).status, 503);
});
