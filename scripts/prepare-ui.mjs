// Prepare components from the accepted offline snapshot. Never overwrite the working fork.
import { access, mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
const name = process.argv[2];
if (!name || !/^[a-z0-9-]+$/.test(name))
  throw new Error("Usage: npm run ui:prepare -- component-name");
const root = path.resolve("vendor/kitze-ui");
const index = JSON.parse(await readFile(path.join(root, "registry.json"), "utf8"));
const names = new Set(index.items.map((item) => item.name));
if (!names.has(name)) throw new Error(`Unknown component: ${name}`);
const destination = path.resolve("work/ui-candidates", name);
await mkdir(path.dirname(destination), { recursive: true });
await mkdir(destination); // Explicit review/removal is required before regenerating a candidate.
const visited = new Set();
const packages = new Set();
const outputs = new Map();
const primitives = new Map();
function targetFor(original) {
  if (original.startsWith("components/ui/"))
    return original.replace("components/ui/", "ui/primitives/");
  if (original.startsWith("components/"))
    return original.replace("components/", "ui/components/");
  if (original.startsWith("hooks/")) return original.replace("hooks/", "ui/hooks/");
  if (original.startsWith("lib/")) return original.replace("lib/", "ui/lib/");
  throw new Error(`Review unsupported upstream target: ${original}`);
}
async function prepare(component) {
  if (visited.has(component)) return;
  if (!names.has(component)) {
    if (!/^[a-z0-9-]+$/.test(component))
      throw new Error(`Review external dependency: ${component}`);
    let installed = true;
    try {
      await access(`ui/primitives/${component}.tsx`);
    } catch {
      installed = false;
    }
    primitives.set(component, {
      name: component,
      installed,
      path: `ui/primitives/${component}.tsx`,
    });
    return;
  }
  visited.add(component);
  const item = JSON.parse(
    await readFile(path.join(root, "items", `${component}.json`), "utf8"),
  );
  for (const dependency of item.registryDependencies ?? []) {
    const match = /^https:\/\/ui\.kitze\.io\/r\/([a-z0-9-]+)\.json$/.exec(dependency);
    await prepare(match ? match[1] : dependency);
  }
  for (const dependency of item.dependencies ?? []) packages.add(dependency);
  for (const file of item.files ?? []) {
    const target = targetFor(file.target ?? file.path);
    const absolute = path.resolve(destination, target);
    if (!absolute.startsWith(destination + path.sep))
      throw new Error("Unsafe component path");
    const content = file.content
      .replaceAll("@/components/ui/", "@/ui/primitives/")
      .replaceAll("@/components/", "@/ui/components/")
      .replaceAll("@/hooks/", "@/ui/hooks/")
      .replaceAll("@/lib/", "@/ui/lib/");
    if (outputs.has(target) && outputs.get(target) !== content)
      throw new Error(`Conflicting source: ${target}`);
    outputs.set(target, content);
  }
}
await prepare(name);
for (const [target, content] of outputs) {
  await mkdir(path.dirname(path.join(destination, target)), { recursive: true });
  await writeFile(path.join(destination, target), content);
}
await writeFile(
  path.join(destination, "primitive-dependencies.json"),
  JSON.stringify([...primitives.values()], null, 2) + "\n",
);
await writeFile(
  path.join(destination, "dependencies.json"),
  JSON.stringify([...packages].sort(), null, 2) + "\n",
);
console.log(
  `Prepared ${outputs.size} files from ${visited.size} entries in ${destination}. Review the diff, dependencies.json, and primitive-dependencies.json before copying changes into ui/.`,
);
