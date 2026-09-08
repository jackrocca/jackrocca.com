import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, mkdir, writeFile, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { NextRequest } from "next/server";
import { GET } from "../app/api/photos/[[...path]]/route";
import { catalogSchema, type Catalog } from "../lib/photography";
import { initialState } from "../lib/store";
import { loginResponse } from "../lib/auth";
import { joinLeagueWithGoogle } from "../lib/google-account";

test("gallery and preview endpoints enforce the same current rating and Google session", async () => {
  const dir = await mkdtemp(path.join(os.tmpdir(), "photo-access-"));
  process.env.PHOTO_LOCAL_DIR = dir;
  process.env.LOCAL_STORE_PATH = path.join(dir, "state.json");
  process.env.SESSION_SECRET = "test-only-photo-session-secret-longer-than-32-characters";
  delete process.env.BLOB_READ_WRITE_TOKEN;
  delete process.env.BLOB_STORE_ID;
  const catalog: Catalog = {
    version: 1,
    revision: "a".repeat(64),
    publishedAt: new Date().toISOString(),
    photos: [1, 2, 3, 4, 5].map((rating) => ({
      id: String(rating).repeat(24),
      rating,
      width: 100,
      height: 150,
      preview: `previews/${String(rating).repeat(64)}.webp`,
      takenAt: "2026-01-01",
      place: "Test place",
      people: [{ id: "b".repeat(24), name: "Test person" }],
    })),
  };
  const state = initialState();
  const user = joinLeagueWithGoogle(
    state,
    {
      sub: "photo-reader",
      email: "reader@example.com",
      email_verified: true,
      name: "Reader",
    },
    "owner@example.com",
  );
  await mkdir(path.join(dir, "previews"));
  for (const photo of catalog.photos)
    await writeFile(path.join(dir, photo.preview), "test-preview");
  const save = () => writeFile(path.join(dir, "catalog.json"), JSON.stringify(catalog));
  await save();
  await writeFile(process.env.LOCAL_STORE_PATH, JSON.stringify(state));
  const token = (await loginResponse(user)).cookies.get("pick4-session")!.value;
  const request = (suffix = "", cookie?: string) => {
    const url = new URL(`http://localhost/api/photos${suffix}`);
    const route = url.pathname.split("/").slice(3);
    return GET(
      new NextRequest(url, {
        headers: cookie ? { cookie: `pick4-session=${cookie}` } : {},
      }),
      { params: Promise.resolve({ path: route }) },
    );
  };
  try {
    const anonymous = await request();
    const pub = await anonymous.json();
    assert.deepEqual(
      pub.photos.map((p: any) => p.rating),
      [4, 5],
    );
    assert.equal(pub.total, 2);
    assert.deepEqual(pub.people, []);
    assert.deepEqual(pub.places, []);
    assert.ok(
      pub.photos.every(
        (p: any) => !p.preview && !p.place && !p.people.length && !p.takenAt,
      ),
    );
    assert.equal(anonymous.headers.get("cache-control"), "private, no-store");
    assert.equal(anonymous.headers.get("vary"), "Cookie");
    assert.equal((await request("?rating=1")).status, 200);
    assert.equal((await (await request("?rating=1")).json()).total, 0);
    assert.equal((await request("?person=someone")).status, 401);
    assert.equal((await request("?offset=-1")).status, 400);
    assert.equal((await request("?rating=0")).status, 400);
    const member = await (await request("", token)).json();
    assert.equal(member.total, 5);
    assert.equal(member.people[0].count, 5);
    assert.equal(member.places[0].name, "Test place");
    const low = `/image/${"1".repeat(24)}`;
    assert.equal((await request(low)).status, 404);
    assert.equal((await request(low, "forged-session")).status, 404);
    assert.equal((await request(low, token)).status, 200);
    assert.equal((await request(`/image/${"4".repeat(24)}`)).status, 200);
    // A new publication can lower a public rating; old URLs lose access.
    catalog.photos[3].rating = 2;
    await save();
    assert.equal((await request(`/image/${"4".repeat(24)}`)).status, 404);
    catalog.photos = catalog.photos.filter((p) => p.rating !== 1);
    await save();
    assert.equal((await request(low, token)).status, 404);
    user.sessionVersion++;
    await writeFile(process.env.LOCAL_STORE_PATH, JSON.stringify(state));
    assert.equal((await (await request("", token)).json()).signedIn, false);
    assert.equal((await request(`/image/${"2".repeat(24)}`, token)).status, 404);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});
test("publication schema rejects unrated photos, original paths and duplicate IDs", () => {
  const photo = {
    id: "a".repeat(24),
    rating: 4,
    width: 100,
    height: 100,
    preview: `previews/${"b".repeat(64)}.webp`,
    takenAt: "",
    place: "",
    people: [],
  };
  const catalog = {
    version: 1,
    revision: "c".repeat(64),
    publishedAt: new Date().toISOString(),
    photos: [photo],
  };
  assert.ok(catalogSchema.safeParse(catalog).success);
  for (const change of [
    { rating: 0 },
    { rating: 6 },
    { preview: "../../original.jpg" },
    { width: 6000 },
  ])
    assert.equal(
      catalogSchema.safeParse({ ...catalog, photos: [{ ...photo, ...change }] }).success,
      false,
    );
  assert.equal(
    catalogSchema.safeParse({ ...catalog, photos: [photo, photo] }).success,
    false,
  );
});

test("all grids use capture chronology before rating, filtering and pagination", async () => {
  const { gallery } = await import("../lib/photography");
  const photos = Array.from({ length: 55 }, (_, i) => ({
    id: i.toString(16).padStart(24, "0"),
    rating: i % 2 ? 5 : 1,
    width: 100,
    height: 100,
    preview: `previews/${"a".repeat(64)}.webp`,
    takenAt: "2026-01-01",
    capturedAt: `2026-01-01T12:${String(i).padStart(2, "0")}:00`,
    place: i >= 50 ? "Recent place" : "Older place",
    people: [
      {
        id: (i >= 50 ? "a" : "b").repeat(24),
        name: i >= 50 ? "Recent person" : "Older person",
      },
    ],
  }));
  const catalog: Catalog = {
    version: 1,
    revision: "a".repeat(64),
    publishedAt: new Date().toISOString(),
    photos,
  };
  const member = gallery(catalog, true, new URLSearchParams());
  assert.deepEqual(
    member.photos.map((p) => p.id),
    photos
      .slice()
      .reverse()
      .slice(0, 48)
      .map((p) => p.id),
  );
  assert.equal(member.people[0].name, "Recent person");
  assert.equal(member.places[0].name, "Recent place");
  const next = gallery(catalog, true, new URLSearchParams("offset=48"));
  assert.deepEqual(
    next.photos.map((p) => p.id),
    photos
      .slice()
      .reverse()
      .slice(48)
      .map((p) => p.id),
  );
  const pub = gallery(catalog, false, new URLSearchParams());
  assert.deepEqual(
    pub.photos.map((p) => p.id),
    photos
      .filter((p) => p.rating >= 4)
      .reverse()
      .map((p) => p.id),
  );
  assert.ok(pub.photos.every((p) => !("capturedAt" in p) && !p.takenAt));
  const filtered = gallery(
    catalog,
    true,
    new URLSearchParams("place=Recent+place&rating=5"),
  );
  assert.deepEqual(
    filtered.photos.map((p) => p.id),
    photos
      .filter((p) => p.place === "Recent place" && p.rating === 5)
      .reverse()
      .map((p) => p.id),
  );
  assert.equal(
    catalog.photos[0].id,
    photos[0].id,
    "reading a gallery does not mutate its catalog",
  );
});

test("undated photos sort last, equal times remain stable, and zones compare chronologically", async () => {
  const { newestFirst } = await import("../lib/photography");
  const base = {
    rating: 4,
    width: 100,
    height: 100,
    preview: `previews/${"a".repeat(64)}.webp`,
    place: "",
    people: [],
  };
  const photos = [
    { ...base, id: "a".repeat(24), takenAt: "" },
    {
      ...base,
      id: "b".repeat(24),
      takenAt: "2026-01-01",
      capturedAt: "2026-01-01T12:00:00-08:00",
    },
    {
      ...base,
      id: "c".repeat(24),
      takenAt: "2026-01-01",
      capturedAt: "2026-01-01 13:00:00",
    },
    { ...base, id: "d".repeat(24), takenAt: "2025-12-31" },
  ];
  assert.deepEqual(
    photos.sort(newestFirst).map((p) => p.id[0]),
    ["b", "c", "d", "a"],
  );
});
