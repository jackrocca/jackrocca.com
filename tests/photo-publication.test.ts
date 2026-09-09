import test from "node:test";
import assert from "node:assert/strict";
import sharp from "sharp";
import {
  PhotoPublicationService,
  PROTOCOL,
  LIMITS,
  hash,
  publicationRequest,
} from "../lib/photo-publication";
import { MemoryPublicationStorage } from "./publication-storage-fixture";
import { canViewPhoto, gallery, newestFirst, type Catalog } from "../lib/photography";
import { R2PublicationStorage, publicationEnvironment } from "../lib/publication-storage";
import { S3Client } from "@aws-sdk/client-s3";

const token = "test-only-publisher-credential-at-least-32-chars";
async function fixture(rating = 3, count = 1) {
  const data = await sharp({
    create: { width: 24, height: 16, channels: 3, background: "#123456" },
  })
    .webp({ quality: 76 })
    .toBuffer();
  const photos = Array.from({ length: count }, (_, i) => ({
    id: (i + 1).toString(16).padStart(24, "0"),
    rating,
    width: 24,
    height: 16,
    preview: `previews/${hash(data)}.webp`,
    takenAt: "2026-01-01",
    capturedAt: "2026-01-01 12:00:00",
    place: "Synthetic place",
    people: [{ id: "f".repeat(24), name: "Synthetic Person" }],
  }));
  photos.sort(newestFirst);
  const catalog: Catalog = {
    version: 1,
    revision: hash(JSON.stringify(photos)),
    publishedAt: new Date().toISOString(),
    photos,
  };
  const manifest = Buffer.from(JSON.stringify(catalog));
  return { catalog, manifest, data };
}
async function stage(
  service: PhotoPublicationService,
  storage: MemoryPublicationStorage,
  f: Awaited<ReturnType<typeof fixture>>,
  base: string | null,
  key: string,
) {
  const job = await service.begin({
    protocol: PROTOCOL,
    baseRevision: base,
    revision: f.catalog.revision,
    idempotencyKey: key,
  });
  const result = await service.uploads(job.publicationId, {
    objects: [
      { sha256: hash(f.data), size: f.data.length, kind: "preview" },
      { sha256: hash(f.manifest), size: f.manifest.length, kind: "manifest" },
    ],
  });
  for (const item of result.missing)
    assert.ok(
      await storage.upload(item.url, item.sha256 === hash(f.data) ? f.data : f.manifest),
    );
  return job;
}
async function finish(
  service: PhotoPublicationService,
  pid: string,
  manifest: Uint8Array,
) {
  let state;
  do {
    state = await service.commit(pid, { manifestHash: hash(manifest) });
  } while (state.state === "validating");
  return state;
}

test("publication, revocation, redaction and duplicate retry use the current catalog", async () => {
  const storage = new MemoryPublicationStorage(),
    service = new PhotoPublicationService(storage, "development");
  const f = await fixture(3),
    job = await stage(service, storage, f, null, "first-publication-key");
  await assert.rejects(service.catalog());
  const success = await finish(service, job.publicationId, f.manifest);
  assert.equal(success.state, "succeeded");
  const control = await storage.read(`${service.prefix}/control.json`);
  assert.ok(control);
  assert.deepEqual(
    JSON.parse(Buffer.from(control.data).toString()).jobs[job.publicationId].declarations,
    {},
  );
  assert.deepEqual(
    await service.commit(job.publicationId, { manifestHash: hash(f.manifest) }),
    success,
  );
  assert.equal(
    gallery(await service.catalog(), false, new URLSearchParams()).photos[0].place,
    "",
  );
  const member = await fixture(2),
    next = await stage(
      service,
      storage,
      member,
      f.catalog.revision,
      "second-publication-key",
    );
  await finish(service, next.publicationId, member.manifest);
  assert.equal(canViewPhoto((await service.catalog()).photos[0], false), false);
  assert.equal(canViewPhoto((await service.catalog()).photos[0], true), true);
  // Successful receipts remain idempotent after subsequent catalog advances.
  assert.equal(
    (
      await service.begin({
        protocol: PROTOCOL,
        baseRevision: null,
        revision: f.catalog.revision,
        idempotencyKey: "first-publication-key",
      })
    ).state,
    "succeeded",
  );
  assert.equal((await service.status(job.publicationId)).state, "succeeded");
  const withdrawn = await fixture();
  withdrawn.catalog.photos = [];
  withdrawn.catalog.revision = hash("[]");
  withdrawn.manifest = Buffer.from(JSON.stringify(withdrawn.catalog));
  const empty = await stage(
    service,
    storage,
    withdrawn,
    member.catalog.revision,
    "withdraw-publication-key",
  );
  await finish(service, empty.publicationId, withdrawn.manifest);
  assert.equal((await service.catalog()).photos.length, 0);
});

test("interrupted or corrupt uploads preserve the old catalog", async () => {
  const storage = new MemoryPublicationStorage(),
    service = new PhotoPublicationService(storage, "development");
  const old = await fixture(3),
    first = await stage(service, storage, old, null, "first-publication-key");
  await finish(service, first.publicationId, old.manifest);
  const changed = await fixture(2),
    next = await service.begin({
      protocol: PROTOCOL,
      baseRevision: old.catalog.revision,
      revision: changed.catalog.revision,
      idempotencyKey: "second-publication-key",
    });
  await service.uploads(next.publicationId, {
    objects: [
      { sha256: hash(changed.manifest), size: changed.manifest.length, kind: "manifest" },
    ],
  });
  await assert.rejects(
    service.commit(next.publicationId, { manifestHash: hash(changed.manifest) }),
  );
  assert.equal((await service.catalog()).revision, old.catalog.revision);
  await stage(service, storage, changed, old.catalog.revision, "second-publication-key");
  await finish(service, next.publicationId, changed.manifest);
  assert.equal((await service.catalog()).revision, changed.catalog.revision);
});

test("concurrent commits cannot silently overwrite and compare-and-swap survives restarts", async () => {
  const storage = new MemoryPublicationStorage();
  const a = new PhotoPublicationService(storage, "development"),
    b = new PhotoPublicationService(storage, "development");
  const fa = await fixture(3),
    fb = await fixture(2);
  const ja = await stage(a, storage, fa, null, "publisher-a-long-key");
  const jb = await stage(b, storage, fb, null, "publisher-b-long-key");
  const results = await Promise.allSettled([
    finish(a, ja.publicationId, fa.manifest),
    finish(b, jb.publicationId, fb.manifest),
  ]);
  assert.equal(results.filter((v) => v.status === "fulfilled").length, 1);
  assert.equal(results.filter((v) => v.status === "rejected").length, 1);
  const restarted = new PhotoPublicationService(storage, "development");
  assert.ok(
    [fa.catalog.revision, fb.catalog.revision].includes(
      (await restarted.catalog()).revision,
    ),
  );
  await assert.rejects(
    restarted.begin({
      protocol: PROTOCOL,
      baseRevision: null,
      revision: fa.catalog.revision,
      idempotencyKey: "stale-publisher-long-key",
    }),
    /Website changed/,
  );
});

test("large validation is bounded and resumes without exposing a partial catalog", async () => {
  const storage = new MemoryPublicationStorage(),
    service = new PhotoPublicationService(storage, "development");
  const f = await fixture(3, LIMITS.validationBatch + 1),
    job = await stage(service, storage, f, null, "bounded-validation-key");
  const partial = await service.commit(job.publicationId, {
    manifestHash: hash(f.manifest),
  });
  assert.equal(partial.state, "validating");
  await assert.rejects(service.catalog());
  const restarted = new PhotoPublicationService(storage, "development");
  assert.equal(
    (await finish(restarted, job.publicationId, f.manifest)).state,
    "succeeded",
  );
});

test("credentials, browser requests, environment isolation, request and upload boundaries", async () => {
  const storage = new MemoryPublicationStorage(),
    service = new PhotoPublicationService(storage, "preview");
  const req = (authorization: string, body: string, origin?: string) =>
    new Request("https://example.test/api", {
      method: "POST",
      headers: {
        authorization,
        "Content-Type": "application/json",
        ...(origin ? { origin } : {}),
      },
      body,
    });
  assert.equal(
    (await publicationRequest(req("Bearer wrong", "{}"), ["begin"], service, token, true))
      .status,
    401,
  );
  assert.equal(
    (
      await publicationRequest(
        req(`Bearer ${token}`, "{}", "https://example.test"),
        ["begin"],
        service,
        token,
        true,
      )
    ).status,
    403,
  );
  assert.equal(
    (
      await publicationRequest(
        req(`Bearer ${token}`, "x".repeat(LIMITS.requestBytes + 1)),
        ["begin"],
        service,
        token,
        true,
      )
    ).status,
    413,
  );
  assert.equal(
    (
      await publicationRequest(
        req(`Bearer ${token}`, "{}"),
        ["begin"],
        service,
        token,
        false,
      )
    ).status,
    503,
  );
  const f = await fixture(),
    job = await stage(service, storage, f, null, "preview-publication-key");
  await finish(service, job.publicationId, f.manifest);
  await assert.rejects(new PhotoPublicationService(storage, "production").catalog());
  await assert.rejects(
    service.uploads(job.publicationId, {
      objects: Array.from({ length: 101 }, () => ({
        sha256: hash(f.data),
        size: f.data.length,
        kind: "preview",
      })),
    }),
  );
  const unauthorized = await publicationRequest(
    req(`Bearer ${token}`, "{}"),
    ["begin"],
    service,
    "new-token-long-enough-to-be-a-valid-credential",
    true,
  );
  assert.equal(unauthorized.status, 401);
});

test("R2 authorizations expire and never target served objects", async () => {
  const storage = new MemoryPublicationStorage(),
    service = new PhotoPublicationService(storage, "development");
  const f = await fixture(),
    job = await service.begin({
      protocol: PROTOCOL,
      baseRevision: null,
      revision: f.catalog.revision,
      idempotencyKey: "expiry-publication-key",
    });
  const signed = await service.uploads(job.publicationId, {
    objects: [{ sha256: hash(f.data), size: f.data.length, kind: "preview" }],
  });
  assert.ok([...storage.uploads.values()].every((v) => v.key.includes("/staging/")));
  storage.now = () => Date.now() + 301000;
  assert.equal(await storage.upload(signed.missing[0].url, f.data), false);
  storage.now = () => Date.now();
  const refreshed = await service.uploads(job.publicationId, {
    objects: [{ sha256: hash(f.data), size: f.data.length, kind: "preview" }],
  });
  assert.ok(await storage.upload(refreshed.missing[0].url, f.data));
});

test("presigned SDK URLs bind the staging key, method, content length and expiry without network", async () => {
  const client = new S3Client({
    region: "auto",
    endpoint: "https://" + "a".repeat(32) + ".r2.cloudflarestorage.com",
    forcePathStyle: true,
    credentials: { accessKeyId: "test-only-access", secretAccessKey: "test-only-secret" },
    requestChecksumCalculation: "WHEN_REQUIRED",
  });
  const store = new R2PublicationStorage(client, "synthetic-preview-gallery");
  const url = new URL(await store.signUpload("staging/example", 123, 300));
  assert.equal(url.searchParams.get("X-Amz-Expires"), "300");
  assert.ok(url.searchParams.get("X-Amz-SignedHeaders")?.includes("content-length"));
  assert.equal(url.pathname, "/synthetic-preview-gallery/staging/example");
});

test("a Vercel preview configuration cannot select production", () => {
  const old = { ...process.env };
  process.env.VERCEL_ENV = "preview";
  process.env.PHOTO_PUBLICATION_ENV = "production";
  try {
    assert.throws(publicationEnvironment, /Preview/);
  } finally {
    process.env = old;
  }
});

test("expired attempts retain receipts and cannot restart with the same key", async () => {
  let now = new Date("2026-01-01T00:00:00Z");
  const storage = new MemoryPublicationStorage();
  const service = new PhotoPublicationService(storage, "development", () => now);
  const f = await fixture();
  const input = {
    protocol: PROTOCOL,
    revision: f.catalog.revision,
    baseRevision: null,
    idempotencyKey: "expired-attempt-stable-key",
  };
  const first = await service.begin(input);
  now = new Date(now.getTime() + LIMITS.jobAgeMs + 1);
  const retry = await service.begin(input);
  assert.equal(retry.publicationId, first.publicationId);
  assert.equal(retry.state, "expired");
  assert.equal((await service.begin(input)).state, "expired");
  assert.equal(
    (await service.commit(first.publicationId, { manifestHash: hash(f.manifest) })).state,
    "expired",
  );
  await assert.rejects(service.catalog());
});

test("immutable caches save reads while a separate writer immediately revokes access", async () => {
  const { servePhotos } = await import("../lib/photo-http");
  const storage = new MemoryPublicationStorage();
  const writer = new PhotoPublicationService(storage, "development");
  const reader = new PhotoPublicationService(storage, "development");
  const first = await fixture(3);
  const job = await stage(writer, storage, first, null, "cache-first-publication");
  await finish(writer, job.publicationId, first.manifest);
  const reads: string[] = [];
  const originalRead = storage.read.bind(storage);
  storage.read = async (key) => {
    reads.push(key);
    return originalRead(key);
  };
  const id = first.catalog.photos[0].id;
  const request = new Request("https://example.test/api/photos/image/" + id);
  const route = () => servePhotos(request, ["image", id], false, reader);
  assert.equal((await route()).status, 200);
  reads.length = 0;
  assert.equal((await route()).status, 200);
  assert.deepEqual(reads, ["photography/development/publication-v1/control.json"]);
  const second = await fixture(2);
  const change = await stage(
    writer,
    storage,
    second,
    first.catalog.revision,
    "cache-restricted-publication",
  );
  await finish(writer, change.publicationId, second.manifest);
  assert.equal((await route()).status, 404);
  assert.equal((await servePhotos(request, ["image", id], true, reader)).status, 200);
  const withdrawn = await fixture(3, 0);
  const remove = await stage(
    writer,
    storage,
    withdrawn,
    second.catalog.revision,
    "cache-withdrawn-publication",
  );
  await finish(writer, remove.publicationId, withdrawn.manifest);
  assert.equal((await servePhotos(request, ["image", id], true, reader)).status, 404);
});
