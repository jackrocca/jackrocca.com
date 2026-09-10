---
name: rockui-adopt-upstream
description: Bring a component from the upstream Kitze UI registry snapshot (vendor/kitze-ui) into the RockUI fork (ui/), or refresh the snapshot and merge upstream changes into already-adopted components. Covers npm run ui:prepare, import rewriting, primitive and npm dependency review, preserving local adaptations, and registering the result in the /ui catalog. Use when asked to add a Kitze UI component (advanced select, dropdown menu, icon picker, form fields, tab panels, theme switch, etc.), update from upstream, or compare the fork with upstream.
---

# Adopting from upstream Kitze UI

`vendor/kitze-ui/` is an immutable, checksummed snapshot of all 76 published Kitze UI registry entries and their 134 source files. `ui/` is our fork and carries only what the site uses. Adoption is a **reviewed copy**, never a blind install: upstream registry items contain explicit file targets that bypass `components.json` aliases, so **do not run `npx shadcn add` against ui.kitze.io in this repo**.

## Which upstream entries exist

`vendor/kitze-ui/llms.txt` lists every entry with its rationale. Source is under `vendor/kitze-ui/source/registry/new-york/<name>/`. Notable ones not yet in `ui/`: `advanced-select`, `simple-dropdown-menu` (+ `CommonMenuItem*`), `simple-context-menu`, `responsive-dropdown-menu`, `tab-panels`, `labeled-checkbox`, `labeled-switch`, `switch`, `radio-group`, `select`, `emoji-picker`, `icon-picker`, `picked-icon`, `theme-switch-*`, `form-field-*` (react-hook-form), `with-search-bar`, `hoverable-icon`, `gradient-text`, `mac-window`, `meta-image`.

## Adopt a new component

1. **Confirm the need** with `rockui-build-component` Step 0. Adoption still adds bundle weight and maintenance.
2. **Stage it**:
   ```bash
   npm run ui:prepare -- <registry-name>
   ```
   Writes to `work/ui-candidates/<name>/` (the directory must not already exist; remove the old candidate first). The script follows `registryDependencies`, rewrites `@/components/ui/ → @/ui/primitives/`, `@/components/ → @/ui/components/`, `@/hooks/ → @/ui/hooks/`, `@/lib/ → @/ui/lib/`, and emits:
   - `dependencies.json`: npm packages the entry needs.
   - `primitive-dependencies.json`: underlying shadcn primitives with `installed: true|false` against `ui/primitives/`.
3. **Review the candidate before copying anything.**
   - Diff each staged file against an existing `ui/` file of the same name. Existing files may carry local adaptations (see `ui/README.md` and `localNotes` in `lib/ui-catalog.ts`); merge, do not overwrite.
   - For each missing primitive, preview it from the official shadcn registry without writing: `./node_modules/.bin/shadcn add <primitive> --dry-run` shows the plan and `--view <primitive>` prints the source. Hand-copy the source to `ui/primitives/<name>.tsx` (the `components.json` aliases already map `ui` → `@/ui/primitives` and `utils` → `@/ui/lib/utils`; verify imports anyway). Keep `data-slot` attributes and the function-declaration shape.
   - Install only the npm packages in `dependencies.json` that are not already in `package.json`. Question anything heavy (`emoji-picker-react`, `@iconify/*`, `react-hook-form`): is the feature worth it for this site?
   - Remove upstream-only concerns that do not apply: `next-themes`, Polar, DataFast, `registry/` path comments.
4. **Copy accepted files into `ui/`** at the targets the script chose. Keep upstream file names so future diffs line up.
5. **Apply house conventions** where upstream lags (upstream is the shape; the fork is stricter):
   - property-specific transitions + `motion-reduce:transition-none`
   - `aria-label`/`id` passthrough on selects and icon-only buttons
   - disabled options stay disabled in mobile drawers
   - element triggers rendered via Base UI `render`, never nested buttons
   Record every deliberate divergence in the catalog entry's `localNotes`.
6. **Register**: catalog entry in `lib/ui-catalog.ts` + demo in `components/ui-library/demos/<slug>.tsx` + `demos/index.ts` (see `rockui-document-component`). Add the slug to `related` on neighbours.
7. **Verify**: `npm run check:boundaries` (nothing may import `vendor/`), `npm run typecheck`, `npm test`, then exercise `/ui/<slug>` at desktop and 390px with the Desktop/Mobile toggle. Delete `work/ui-candidates/<name>/` when done (`work/` is ignored but keep it clean).

## Refresh the snapshot / merge upstream changes

1. `npm run ui:snapshot` downloads the current registry to `work/kitze-candidate/` (must not exist yet). It does **not** modify `vendor/` or `ui/`.
2. Compare `work/kitze-candidate/manifest.json` with `vendor/kitze-ui/manifest.json` to find changed items, then diff the affected `source/` files.
3. Port changes by hand into `ui/`, re-applying local adaptations. Never mass-copy.
4. Replacing `vendor/kitze-ui/` with the new snapshot is a separate, explicit reviewed change (commit message says so). `npm run ui:verify` must pass afterwards; it recomputes every checksum and rejects unrecorded files.
5. Update `THIRD_PARTY_NOTICES.md` if licensing text changed upstream.

## Reading an upstream registry item

`vendor/kitze-ui/items/<name>.json`:

- `dependencies` — npm packages
- `registryDependencies` — other Kitze entries (URLs) or bare shadcn primitive names
- `files[]` — `{ path, target, type, content }`; `target` is where shadcn would write it; `type` is `registry:component | registry:hook | registry:lib | registry:ui`
- `description` — reuse it as the starting point for the catalog `description`, then edit for what the fork actually does.

## Do not

- Import from `vendor/` or `work/` anywhere in `app/`, `components/`, `lib/`, `ui/`.
- Edit files under `vendor/kitze-ui/` (checksum failure in `npm run check`).
- Adopt `form-field-*` without first deciding the site wants react-hook-form; today it does not use it.
- Rename upstream exports (`KitzeUIProvider`, `useKitzeUI`) in the fork; small diffs against upstream are worth more than a prettier name.
