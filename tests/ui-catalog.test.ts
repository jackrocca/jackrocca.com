import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, readdirSync } from "node:fs";
import path from "node:path";
import { uiCatalog } from "../lib/ui-catalog";
import { renderAgentCopy, renderLlmsTxt } from "../lib/ui-catalog-text";

const root = path.resolve(import.meta.dirname, "..");
const demosDir = path.join(root, "components/ui-library/demos");
const kebab = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

test("catalog slugs are unique and kebab-case", () => {
  const slugs = uiCatalog.map((entry) => entry.slug);
  assert.equal(new Set(slugs).size, slugs.length);
  for (const slug of slugs) assert.match(slug, kebab);
});

test("every catalog file exists on disk", () => {
  for (const entry of uiCatalog) {
    for (const file of entry.files) {
      assert.ok(existsSync(path.join(root, file)), `${file} is missing`);
    }
  }
});

test("every related slug exists in the catalog", () => {
  const slugs = new Set(uiCatalog.map((entry) => entry.slug));
  for (const entry of uiCatalog) {
    for (const related of entry.related ?? []) {
      assert.ok(slugs.has(related), `${entry.slug} related ${related} is unknown`);
    }
  }
});

test("every catalog slug has a matching demo file and vice versa", () => {
  const slugs = new Set(uiCatalog.map((entry) => entry.slug));
  const demoFiles = readdirSync(demosDir).filter(
    (name) => name.endsWith(".tsx") && name !== "index.ts",
  );
  for (const slug of slugs) {
    assert.ok(existsSync(path.join(demosDir, `${slug}.tsx`)), `missing demo for ${slug}`);
  }
  for (const name of demoFiles) {
    const slug = name.replace(/\.tsx$/, "");
    assert.ok(slugs.has(slug), `demo ${name} has no catalog entry`);
  }
});

test("renderLlmsTxt includes titles, absolute urls, and imports", () => {
  const origin = "https://example.test";
  const text = renderLlmsTxt(origin);
  for (const entry of uiCatalog) {
    assert.ok(text.includes(entry.title), `missing title ${entry.title}`);
    assert.ok(
      text.includes(`${origin}/ui/${entry.slug}`),
      `missing url for ${entry.slug}`,
    );
    assert.ok(text.includes(entry.imports[0]), `missing import for ${entry.slug}`);
  }
});

test("renderAgentCopy includes the entry url, description, and import", () => {
  const entry = uiCatalog[0];
  assert.ok(entry);
  const origin = "https://example.test";
  const text = renderAgentCopy(entry, origin);
  assert.ok(text.includes(`${origin}/ui/${entry.slug}`));
  assert.ok(text.includes(entry.description));
  assert.ok(text.includes(entry.imports[0]));
});
