import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import path from "node:path";

// Next 16.3.4's Vercel launcher imports this before invoking a route. The global
// next-server trace contained it, but deployed route packages omitted it and all
// API requests failed with MODULE_NOT_FOUND. Check the actual route manifests.
const root = process.cwd();
const required = path.join(
  root,
  "node_modules/next/dist/lib/framework/boundary-constants.js",
);
let checked = 0;
async function visit(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const file = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      await visit(file);
      continue;
    }
    if (!entry.name.endsWith("route.js.nft.json")) continue;
    const manifest = JSON.parse(await readFile(file, "utf8"));
    assert(
      manifest.files.some((item) => path.resolve(directory, item) === required),
      `Missing Next launcher dependency in ${path.relative(root, file)}`,
    );
    checked++;
  }
}
await visit(path.join(root, ".next/server/app"));
assert(checked > 0, "Build the application before checking server traces.");
console.log(`Next launcher dependency verified in ${checked} route packages.`);
