import { get, put, BlobPreconditionFailedError } from "@vercel/blob";
import { readFile, mkdir, writeFile, rename } from "node:fs/promises";
import path from "node:path";
import schedule from "../data/schedule-2026.json";
import { State, Week } from "./types";
import { AppError } from "./rules";
const blobPath = process.env.LEAGUE_STORAGE_PREFIX
  ? `${process.env.LEAGUE_STORAGE_PREFIX}/state.json`
  : process.env.VERCEL_ENV === "production"
    ? "pick4/2026/state.json"
    : process.env.VERCEL_ENV === "preview"
      ? "pick4/preview/state.json"
      : "pick4/development/state.json";
export function initialState(): State {
  return {
    version: 1,
    revision: 0,
    users: [],
    entries: [],
    invites: [],
    weeks: structuredClone(schedule) as Week[],
    audit: [],
    rates: {},
  };
}
const cloud = () =>
  Boolean(process.env.BLOB_READ_WRITE_TOKEN || process.env.BLOB_STORE_ID);
function localPath() {
  if (process.env.VERCEL || process.env.NODE_ENV === "production")
    throw new Error("Private league storage is not configured.");
  return (
    process.env.LOCAL_STORE_PATH ??
    path.join(process.cwd(), "work", "league.local.json")
  );
}
export async function readState(): Promise<{ state: State; etag?: string }> {
  if (cloud()) {
    const result = await get(blobPath, {
      access: "private",
      useCache: false,
      headers: { "Accept-Encoding": "identity" },
    });
    if (!result) return { state: initialState() };
    if (result.statusCode !== 200 || !result.stream)
      throw new Error("Could not read league storage.");
    return {
      state: JSON.parse(await new Response(result.stream).text()) as State,
      etag: result.blob.etag,
    };
  }
  try {
    return {
      state: JSON.parse(
        await readFile(/* turbopackIgnore: true */ localPath(), "utf8"),
      ) as State,
    };
  } catch (e) {
    if ((e as NodeJS.ErrnoException).code === "ENOENT")
      return { state: initialState() };
    throw e;
  }
}
let queue: Promise<unknown> = Promise.resolve();
export async function mutate<T>(fn: (state: State) => T): Promise<T> {
  async function run() {
    for (let i = 0; i < 8; i++) {
      const { state, etag } = await readState();
      const result = fn(state);
      state.revision++;
      if (cloud()) {
        try {
          await put(blobPath, JSON.stringify(state), {
            access: "private",
            addRandomSuffix: false,
            allowOverwrite: Boolean(etag),
            ...(etag ? { ifMatch: etag } : {}),
            contentType: "application/json",
            cacheControlMaxAge: 60,
          });
          return result;
        } catch (e) {
          if (
            e instanceof BlobPreconditionFailedError ||
            (e instanceof Error &&
              /already exists|conditional request cannot succeed due to a conflicting operation/i.test(
                e.message,
              ))
          ) {
            await new Promise((r) => setTimeout(r, 25 + Math.random() * 80));
            continue;
          }
          throw e;
        }
      }
      const file = localPath();
      await mkdir(path.dirname(file), { recursive: true });
      await writeFile(`${file}.tmp`, JSON.stringify(state), { mode: 0o600 });
      await rename(`${file}.tmp`, file);
      return result;
    }
    throw new AppError("The league is busy. Please try saving again.", 409);
  }
  if (cloud()) return run();
  const result = queue.then(run);
  queue = result.catch(() => {});
  return result;
}
export function audit(
  state: State,
  actor: string,
  action: string,
  detail: string,
) {
  state.audit.push({ at: new Date().toISOString(), actor, action, detail });
  state.audit = state.audit.slice(-2000);
}
export async function rateLimit(
  key: string,
  limit = 12,
  windowMs = 15 * 60 * 1000,
) {
  const allowed = await mutate((state) => {
    const now = Date.now();
    for (const [k, v] of Object.entries(state.rates))
      if (v.reset < now) delete state.rates[k];
    if (Object.keys(state.rates).length > 3000) return false;
    const item = state.rates[key] ?? { count: 0, reset: now + windowMs };
    item.count++;
    state.rates[key] = item;
    return item.count <= limit;
  });
  if (!allowed)
    throw new AppError(
      "Too many attempts. Please try again in a few minutes.",
      429,
    );
}
