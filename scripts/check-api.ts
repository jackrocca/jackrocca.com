import assert from "node:assert/strict";
import { readFileSync, writeFileSync } from "node:fs";
import { randomBytes } from "node:crypto";
async function main() {
  const base = process.env.TEST_BASE ?? "http://localhost:3106";
  if (!/localhost|127\.0\.0\.1/.test(base) && !process.env.ALLOW_REMOTE_TEST)
    throw new Error(
      "Set ALLOW_REMOTE_TEST only for an isolated test deployment.",
    );
  const env = Object.fromEntries(
    readFileSync(".env.local", "utf8")
      .split("\n")
      .filter((l) => l.includes("="))
      .map((l) => {
        const i = l.indexOf("=");
        return [l.slice(0, i), l.slice(i + 1).replace(/^"|"$/g, "")];
      }),
  );
  let cookie = "";
  let checks = 0;
  async function request(
    path: string,
    data?: unknown,
    expected = 200,
    auth = cookie,
    origin = base,
  ) {
    const r = await fetch(`${base}/api/${path}`, {
      method: data === undefined ? "GET" : "POST",
      headers: {
        ...(data ? { "Content-Type": "application/json", Origin: origin } : {}),
        ...(auth ? { Cookie: auth } : {}),
      },
      body: data === undefined ? undefined : JSON.stringify(data),
    });
    const result = await r.json();
    assert.equal(r.status, expected, `${path}: ${JSON.stringify(result)}`);
    checks++;
    return { result, cookie: r.headers.get("set-cookie")?.split(";")[0] };
  }
  const suffix = randomBytes(4).toString("hex");
  const password = randomBytes(24).toString("base64url");
  const health = await request("health");
  assert.equal(
    health.result.configured,
    false,
    "Test namespace must be empty.",
  );
  await request("picks", {}, 401);
  const created = await request("setup", {
    name: "Test Commissioner",
    username: `admin-${suffix}`,
    password,
    token: env.SETUP_TOKEN,
  });
  cookie = created.cookie!;
  await request(
    "setup",
    {
      name: "Second Admin",
      username: "second",
      password,
      token: env.SETUP_TOKEN,
    },
    403,
  );
  await request(
    "login",
    { username: `admin-${suffix}`, password: "wrong" },
    401,
  );
  const logged = await request("login", {
    username: `admin-${suffix}`,
    password,
  });
  assert.ok(logged.cookie);
  await request(
    "admin/invite",
    { name: "CSRF test" },
    403,
    cookie,
    "https://wrong.example",
  );
  await request("admin/publish", { week: 1 });
  const data = (await request("state?week=1")).result;
  assert.equal(data.week.games.length, 16);
  assert.ok(data.week.publishedAt);
  const ids = data.week.games.slice(0, 4).map((g: { id: string }) => g.id);
  const payload = {
    week: 1,
    picks: { favorite: ids[0], underdog: ids[1], over: ids[2], under: ids[3] },
    superSpread: false,
    totalHelper: "over",
    perfectPrediction: false,
    revision: 0,
  };
  await request(
    "picks",
    { ...payload, picks: { ...payload.picks, under: ids[0] } },
    400,
  );
  await request("picks", payload);
  await request("picks", payload, 409);
  const saved = (await request("state?week=1")).result;
  assert.equal(saved.entries[0].picks.favorite.gameId, ids[0]);
  assert.equal(saved.history.length, 1);
  const invite = (await request("admin/invite", { name: "Test Player" }))
    .result;
  const token = new URL(invite.url).searchParams.get("invite");
  const joined = await request("join", {
    name: "Test Player",
    username: `player-${suffix}`,
    password,
    token,
  });
  const playerCookie = joined.cookie!;
  await request(
    "join",
    { name: "Other Player", username: `other-${suffix}`, password, token },
    403,
  );
  await request("admin/invite", { name: "Unauthorized" }, 403, playerCookie);
  const playerView = (
    await request("state?week=1", undefined, 200, playerCookie)
  ).result;
  assert.equal(playerView.admin, null);
  assert.equal(playerView.entries[0].picks, null);
  assert.equal(playerView.entries[0].totalHelper, null);
  assert.equal(JSON.stringify(playerView).includes("passwordHash"), false);
  assert.equal(JSON.stringify(playerView).includes(env.SETUP_TOKEN), false);
  const anon = (await request("state", undefined, 200, "")).result;
  assert.equal(anon.entries.length, 0);
  assert.equal(anon.standings.length, 0);
  assert.equal(anon.user, null);
  await request("export", undefined, 401, "");
  const exported = (await request("export")).result;
  assert.equal(JSON.stringify(exported).includes("passwordHash"), false);
  // Two independent players save concurrently; both must survive cloud CAS updates.
  const inv2 = (await request("admin/invite", { name: "Concurrent Player" }))
    .result;
  const joined2 = await request("join", {
    name: "Concurrent Player",
    username: `concurrent-${suffix}`,
    password,
    token: new URL(inv2.url).searchParams.get("invite"),
  });
  await Promise.all([
    request("picks", { ...payload, totalHelper: null }, 200, playerCookie),
    request("picks", { ...payload, totalHelper: null }, 200, joined2.cookie!),
  ]);
  const concurrent = (await request("state?week=1")).result;
  assert.equal(concurrent.entries.length, 3);
  const uid = concurrent.standings.find(
    (u: { name: string }) => u.name === "Test Player",
  ).id;
  const recovery = (
    await request("admin/invite", { name: "Test Player", resetUserId: uid })
  ).result;
  await request("join", {
    name: "Ignored",
    username: "ignored",
    password: `${password}new`,
    token: new URL(recovery.url).searchParams.get("invite"),
  });
  assert.equal(
    (await request("state", undefined, 200, playerCookie)).result.user,
    null,
  );
  await request("login", { username: `player-${suffix}`, password }, 401);
  await request("login", {
    username: `player-${suffix}`,
    password: `${password}new`,
  });
  await request("cron", undefined, 401, "");
  writeFileSync(
    "work/browser-login.js",
    `(async()=>{const response=await fetch('/api/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(${JSON.stringify({ username: `admin-${suffix}`, password })})});if(!response.ok)throw new Error('Login failed');return 'Signed in for browser verification';})()`,
    { mode: 0o600 },
  );
  console.log(
    `${checks} API checks passed, including real private Blob writes, concurrent saves, invite reuse, authorization, privacy, and session revocation.`,
  );
}
main().catch((e) => {
  console.error(e);
  process.exit(1);
});
