import { get, put, BlobPreconditionFailedError } from "@vercel/blob";
import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";
import { ChatState } from "./types";
import { AppError } from "./rules";
import { hasCloudStorage, leaguePrefix, localLeagueDir } from "./store";
import { initialChat } from "./chat";

function blobPath() {
  return `${leaguePrefix()}/chat.json`;
}
function localPath() {
  return path.join(localLeagueDir(), "chat.json");
}

export async function readChat(): Promise<{ chat: ChatState; etag?: string }> {
  if (hasCloudStorage()) {
    const result = await get(blobPath(), {
      access: "private",
      useCache: false,
      headers: { "Accept-Encoding": "identity" },
    });
    if (!result) return { chat: initialChat() };
    if (result.statusCode !== 200 || !result.stream)
      throw new Error("Could not read league chat.");
    return {
      chat: JSON.parse(await new Response(result.stream).text()) as ChatState,
      etag: result.blob.etag,
    };
  }
  try {
    return {
      chat: JSON.parse(
        await readFile(/* turbopackIgnore: true */ localPath(), "utf8"),
      ) as ChatState,
    };
  } catch (e) {
    if ((e as NodeJS.ErrnoException).code === "ENOENT") return { chat: initialChat() };
    throw e;
  }
}

let queue: Promise<unknown> = Promise.resolve();
export async function mutateChat<T>(fn: (chat: ChatState) => T): Promise<T> {
  async function run() {
    for (let i = 0; i < 8; i++) {
      const { chat, etag } = await readChat();
      const result = fn(chat);
      chat.revision++;
      if (hasCloudStorage()) {
        try {
          await put(blobPath(), JSON.stringify(chat), {
            access: "private",
            addRandomSuffix: false,
            allowOverwrite: Boolean(etag),
            ...(etag ? { ifMatch: etag } : {}),
            contentType: "application/json",
            cacheControlMaxAge: 15,
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
      await writeFile(`${file}.tmp`, JSON.stringify(chat), { mode: 0o600 });
      await rename(`${file}.tmp`, file);
      return result;
    }
    throw new AppError("Chat is busy. Please try sending again.", 409);
  }
  if (hasCloudStorage()) return run();
  const result = queue.then(run);
  queue = result.catch(() => {});
  return result;
}
