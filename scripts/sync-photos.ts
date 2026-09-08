/** Explicit local export/publish; never runs on deploy or inside the website. */
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile, rename } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import { get, put, BlobPreconditionFailedError } from "@vercel/blob";
import { catalogSchema, type Photo } from "../lib/photography";
async function main() {
  const args = process.argv.slice(2);
  const arg = (name: string, fallback: string) => {
    const i = args.indexOf(name);
    return i < 0 ? fallback : args[i + 1];
  };
  const root = arg("--archive-root", "/Users/jack/jack-os/media/photography");
  const output = path.resolve(arg("--output", "work/photography"));
  if (!output.startsWith(path.resolve("work") + path.sep))
    throw new Error("Export output must be under ignored work/");
  const publish = args.includes("--publish");
  const prefix = arg("--prefix", "photography/production");
  if (!/^photography\/(production|preview|development)$/.test(prefix))
    throw new Error("Invalid photo storage prefix");
  if (publish && !(process.env.BLOB_READ_WRITE_TOKEN || process.env.BLOB_STORE_ID))
    throw new Error("Private Blob credentials required");
  const hash = (data: string | Buffer) => createHash("sha256").update(data).digest("hex");
  const opaque = (value: string) => hash(`rocca-photo-v1:${value}`).slice(0, 24);
  type Source = {
    sourceId: string;
    preview: string;
    rating: number;
    takenAt: string;
    place: string;
    people: { id: string; name: string }[];
  };
  const source = JSON.parse(
    execFileSync("python3", ["scripts/photography/read_catalog.py", "--root", root], {
      maxBuffer: 64 * 1024 * 1024,
    }).toString(),
  ) as { photos: Source[] };
  await mkdir(path.join(output, "previews"), { recursive: true, mode: 0o700 });
  const photos: Photo[] = [];
  let bytes = 0;
  for (const [index, photo] of source.photos.entries()) {
    // Sharp strips metadata by default. Read only the existing small preview,
    // normalize its orientation, and encode a web copy; never touch originals.
    const { data, info } = await sharp(photo.preview)
      .rotate()
      .resize({ width: 1280, height: 1280, fit: "inside", withoutEnlargement: true })
      .webp({ quality: 76 })
      .toBuffer({ resolveWithObject: true });
    const preview = `previews/${hash(data)}.webp`;
    await writeFile(path.join(output, preview), data, { mode: 0o600 });
    bytes += data.length;
    photos.push({
      id: opaque(photo.sourceId),
      rating: photo.rating,
      width: info.width,
      height: info.height,
      preview,
      takenAt: photo.takenAt,
      place: photo.place,
      people: photo.people.map((p) => ({ id: opaque(`person:${p.id}`), name: p.name })),
    });
    if (index % 100 === 0)
      console.log(`Prepared ${index + 1}/${source.photos.length} previews`);
  }
  photos.sort(
    (a, b) =>
      b.rating - a.rating ||
      b.takenAt.localeCompare(a.takenAt) ||
      a.id.localeCompare(b.id),
  );
  const catalog = catalogSchema.parse({
    version: 1,
    revision: hash(JSON.stringify(photos)),
    publishedAt: new Date().toISOString(),
    photos,
  });
  await writeFile(path.join(output, "catalog.next.json"), JSON.stringify(catalog), {
    mode: 0o600,
  });
  await rename(path.join(output, "catalog.next.json"), path.join(output, "catalog.json"));
  console.log(
    JSON.stringify({
      photos: photos.length,
      publicPhotos: photos.filter((p) => p.rating >= 4).length,
      previewMB: Math.round(bytes / 1024 / 1024),
      people: new Set(photos.flatMap((p) => p.people.map((v) => v.id))).size,
      places: new Set(photos.map((p) => p.place).filter(Boolean)).size,
      mode: publish ? "publish" : "local",
    }),
  );
  if (publish) {
    const key = `${prefix}/catalog.json`;
    const old = await get(key, {
      access: "private",
      useCache: false,
      headers: { "Accept-Encoding": "identity" },
    });
    let known = new Set<string>();
    if (old?.statusCode === 200 && old.stream)
      known = new Set(
        catalogSchema
          .parse(await new Response(old.stream).json())
          .photos.map((p) => p.preview),
      );
    const pending = [...new Set(photos.map((p) => p.preview))].filter(
      (p) => !known.has(p),
    );
    let done = 0;
    // Bounded upload concurrency. The catalog pointer only changes after every
    // object exists; rating removals take effect together, with no public blobs.
    await Promise.all(
      Array.from({ length: 4 }, async () => {
        for (;;) {
          const preview = pending.pop();
          if (!preview) break;
          await put(`${prefix}/${preview}`, await readFile(path.join(output, preview)), {
            access: "private",
            addRandomSuffix: false,
            allowOverwrite: true,
            contentType: "image/webp",
            cacheControlMaxAge: 31536000,
          });
          if (++done % 100 === 0) console.log(`Uploaded ${done} previews`);
        }
      }),
    );
    try {
      await put(key, JSON.stringify(catalog), {
        access: "private",
        addRandomSuffix: false,
        allowOverwrite: Boolean(old),
        ...(old ? { ifMatch: old.blob.etag } : {}),
        contentType: "application/json",
        cacheControlMaxAge: 60,
      });
    } catch (error) {
      if (error instanceof BlobPreconditionFailedError)
        throw new Error(
          "Another publisher changed the catalog. Rerun sync to reconcile.",
        );
      throw error;
    }
    console.log(`Published ${photos.length} ranked previews to ${prefix}`);
  }
}
main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
