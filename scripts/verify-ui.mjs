import { readFile, readdir } from "node:fs/promises";
import { createHash } from "node:crypto";
import path from "node:path";
const root = path.resolve("vendor/kitze-ui");
const manifest = JSON.parse(await readFile(path.join(root, "manifest.json"), "utf8"));
for (const [file, expected] of Object.entries(manifest.files)) {
  const target = path.resolve(root, file);
  if (!target.startsWith(root + path.sep))
    throw new Error(`Unsafe snapshot path: ${file}`);
  const actual = createHash("sha256")
    .update(await readFile(target))
    .digest("hex");
  if (actual !== expected)
    throw new Error(`Upstream snapshot changed: ${file}. Customize ui/, not vendor/.`);
}
console.log(
  `${manifest.items} upstream entries verified (${Object.keys(manifest.files).length} checksums).`,
);

async function list(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  return (
    await Promise.all(
      entries.map((e) =>
        e.isDirectory()
          ? list(path.join(directory, e.name))
          : [path.relative(root, path.join(directory, e.name))],
      ),
    )
  ).flat();
}
for (const file of await list(root)) {
  if (file !== "manifest.json" && !(file in manifest.files))
    throw new Error(`Unrecorded snapshot file: ${file}`);
}
