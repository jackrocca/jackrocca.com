// Fetch an upstream candidate without overwriting the local UI fork or accepted snapshot.
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { createHash } from "node:crypto";
const origin = "https://ui.kitze.io";
const destination = path.resolve(process.argv[2] ?? "work/kitze-candidate");
const workRoot = path.resolve("work");
if (!destination.startsWith(workRoot + path.sep))
  throw new Error("Download candidates into work/, then review before accepting them.");
const sourceRoot = path.join(destination, "source");
const files = new Map();
const hash = (value) => createHash("sha256").update(value).digest("hex");
async function download(url) {
  const response = await fetch(url, { signal: AbortSignal.timeout(30000) });
  if (!response.ok) throw new Error(`${url}: HTTP ${response.status}`);
  return response.text();
}
await mkdir(path.dirname(destination), { recursive: true });
await mkdir(destination); // Refuse an existing candidate so stale files cannot survive a refresh.
const indexText = await download(`${origin}/registry.json`);
const index = JSON.parse(indexText);
await writeFile(path.join(destination, "registry.json"), indexText);
files.set("registry.json", hash(indexText));
const queue = [...index.items];
let count = 0;
await Promise.all(
  Array.from({ length: 5 }, async () => {
    while (queue.length) {
      const entry = queue.shift();
      if (!/^[a-z0-9-]+$/.test(entry.name)) throw new Error("Invalid registry name");
      const raw = await download(`${origin}/r/${entry.name}.json`);
      const item = JSON.parse(raw);
      await mkdir(path.join(destination, "items"), { recursive: true });
      await writeFile(path.join(destination, "items", `${entry.name}.json`), raw);
      files.set(`items/${entry.name}.json`, hash(raw));
      for (const file of item.files ?? []) {
        if (typeof file.content !== "string")
          throw new Error(`Missing source: ${file.path}`);
        const target = path.resolve(sourceRoot, file.path);
        if (!target.startsWith(sourceRoot + path.sep))
          throw new Error("Unsafe registry path");
        const relative = path.relative(destination, target);
        const digest = hash(file.content);
        if (files.has(relative) && files.get(relative) !== digest)
          throw new Error(`Conflicting source: ${relative}`);
        files.set(relative, digest);
        await mkdir(path.dirname(target), { recursive: true });
        await writeFile(target, file.content);
      }
      count++;
    }
  }),
);
const docs = await download(`${origin}/llms.txt`);
await writeFile(path.join(destination, "llms.txt"), docs);
files.set("llms.txt", hash(docs));
await writeFile(
  path.join(destination, "manifest.json"),
  JSON.stringify(
    {
      upstream: origin,
      retrievedAt: new Date().toISOString(),
      items: count,
      files: Object.fromEntries([...files].sort(([a], [b]) => a.localeCompare(b))),
    },
    null,
    2,
  ) + "\n",
);
console.log(
  `Downloaded ${count} registry entries and ${[...files.keys()].filter((f) => f.startsWith("source/")).length} source files to ${destination}`,
);
