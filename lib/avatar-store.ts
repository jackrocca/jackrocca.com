import { del, get, put } from "@vercel/blob";
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { avatarUserId } from "./avatar";
import { hasCloudStorage, leaguePrefix, localLeagueDir } from "./store";

function blobPath(userId: string) {
  return `${leaguePrefix()}/avatars/${avatarUserId(userId)}.webp`;
}
function localPath(userId: string) {
  return path.join(localLeagueDir(), "avatars", `${avatarUserId(userId)}.webp`);
}

export async function readAvatar(userId: string): Promise<Uint8Array | null> {
  const id = avatarUserId(userId);
  if (hasCloudStorage()) {
    const result = await get(blobPath(id), { access: "private", useCache: true });
    if (!result || result.statusCode !== 200 || !result.stream) return null;
    return new Uint8Array(await new Response(result.stream).arrayBuffer());
  }
  try {
    return new Uint8Array(await readFile(/* turbopackIgnore: true */ localPath(id)));
  } catch (e) {
    if ((e as NodeJS.ErrnoException).code === "ENOENT") return null;
    throw e;
  }
}

export async function writeAvatar(userId: string, data: Buffer) {
  const id = avatarUserId(userId);
  if (hasCloudStorage()) {
    await put(blobPath(id), data, {
      access: "private",
      addRandomSuffix: false,
      allowOverwrite: true,
      contentType: "image/webp",
      cacheControlMaxAge: 60,
    });
    return;
  }
  const file = localPath(id);
  await mkdir(path.dirname(file), { recursive: true });
  await writeFile(file, data, { mode: 0o600 });
}

export async function deleteAvatar(userId: string) {
  const id = avatarUserId(userId);
  if (hasCloudStorage()) {
    await del(blobPath(id));
    return;
  }
  await rm(localPath(id), { force: true });
}
