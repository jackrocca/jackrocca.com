import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
async function walk(root) {
  const entries = await readdir(root, { withFileTypes: true });
  return (
    await Promise.all(
      entries.map((e) =>
        e.isDirectory() ? walk(`${root}/${e.name}`) : [`${root}/${e.name}`],
      ),
    )
  ).flat();
}
function localImport(file, specifier) {
  if (specifier.startsWith("@/")) return path.resolve(specifier.slice(2));
  if (specifier.startsWith(".")) return path.resolve(path.dirname(file), specifier);
  return null;
}
const ui = path.resolve("ui") + path.sep;
const forbidden = ["vendor", "legacy"].map((p) => path.resolve(p) + path.sep);
const errors = [];
for (const root of ["app", "components", "lib", "ui"]) {
  for (const file of (await walk(root)).filter((f) => /\.[jt]sx?$/.test(f))) {
    const content = await readFile(file, "utf8");
    for (const match of content.matchAll(
      /(?:from\s+|import\s*\(|import\s+)(["'])([^"']+)\1/g,
    )) {
      const target = localImport(file, match[2]);
      if (!target) continue;
      if (root === "ui" && !target.startsWith(ui))
        errors.push(`${file}: UI cannot import ${match[2]}`);
      if (forbidden.some((prefix) => target.startsWith(prefix)))
        errors.push(`${file}: runtime cannot import ${match[2]}`);
    }
  }
}
if (errors.length) throw new Error(errors.join("\n"));
console.log(
  "UI is independent of application code; runtime excludes upstream snapshots and legacy code.",
);
