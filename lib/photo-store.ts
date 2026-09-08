import { get } from "@vercel/blob";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { catalogSchema } from "./photography";

export function photoPrefix() {
  return (
    process.env.PHOTO_STORAGE_PREFIX ??
    `photography/${process.env.VERCEL_ENV === "production" ? "production" : process.env.VERCEL_ENV === "preview" ? "preview" : "development"}`
  );
}
const cloud = () =>
  Boolean(process.env.BLOB_READ_WRITE_TOKEN || process.env.BLOB_STORE_ID);
function localRoot() {
  if (process.env.VERCEL || process.env.NODE_ENV === "production")
    throw new Error("Photo storage is not configured");
  return process.env.PHOTO_LOCAL_DIR ?? path.join(process.cwd(), "work", "photography");
}
export async function readCatalog() {
  let raw: string;
  if (cloud()) {
    const result = await get(`${photoPrefix()}/catalog.json`, {
      access: "private",
      useCache: false,
      headers: { "Accept-Encoding": "identity" },
    });
    if (!result || result.statusCode !== 200 || !result.stream)
      throw new Error("Photo catalog unavailable");
    raw = await new Response(result.stream).text();
  } else
    raw = await readFile(
      /* turbopackIgnore: true */ path.join(localRoot(), "catalog.json"),
      "utf8",
    );
  return catalogSchema.parse(JSON.parse(raw));
}
export async function readPreview(relativePath: string) {
  if (!/^previews\/[a-f0-9]{64}\.webp$/.test(relativePath))
    throw new Error("Invalid preview path");
  if (cloud()) {
    const result = await get(`${photoPrefix()}/${relativePath}`, {
      access: "private",
      useCache: true,
    });
    if (!result || result.statusCode !== 200 || !result.stream)
      throw new Error("Preview unavailable");
    return result.stream;
  }
  return new Uint8Array(
    await readFile(
      /* turbopackIgnore: true */ path.join(
        /* turbopackIgnore: true */ localRoot(),
        relativePath,
      ),
    ),
  );
}
