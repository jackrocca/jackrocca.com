# RockUI

Our local source fork of Kitze UI: small prop APIs, accessible Base UI behavior, and shared Tailwind tokens. Application imports come from `@/ui/…`. This is part of the website repository rather than a separately published npm package.

- `components/`: ergonomic APIs such as `CustomButton`, `SimpleSelect`, and `ResponsiveDialog`.
- `primitives/`: low-level Base UI compositions.
- `hooks/` and `lib/`: UI-only helpers and types. Never import the league or account model here.
- `theme.css`: the shared visual tokens. Start theme changes here.
- `../vendor/kitze-ui/`: complete, unmodified published registry snapshot, extracted source, documentation, and checksums.

## Working on components

The public library is at `/ui`. Catalog entries live in `lib/ui-catalog.ts`; interactive demos live in `components/ui-library/demos/<slug>.tsx`. Adding a component means adding a catalog entry and a demo — `tests/ui-catalog.test.ts` enforces that pairing. Keep component APIs small; customize tokens or a shared component before adding one-off wrappers. Preserve labels, native button semantics, disabled behavior, keyboard focus, mobile dismissal, and reduced motion. Add app-specific combinations in `components/`, not here.

`components.json` defines UI-specific aliases, but Kitze registry entries also contain explicit file targets that can bypass those aliases. **Do not run upstream `shadcn add` directly in this app.** Use `npm run ui:prepare -- component-name` to stage a component and its registry dependencies under `work/ui-candidates/`. It rewrites source imports and file targets into our UI structure, records required npm packages, and never overwrites the working fork. The destination must be new. UI `lib/types.ts` stays separate from the league model.

## Updating from upstream

1. `npm run ui:snapshot` downloads a candidate to `work/kitze-candidate`. It does not alter this fork or the accepted snapshot. The destination must be a new directory under `work/`; remove or rename the previous candidate before downloading another.
2. Compare that candidate with `vendor/kitze-ui`; compare the affected files with this directory. Each registry item includes its dependencies and original targets.
3. Port desired changes manually. To adopt a new component from the accepted snapshot, run `npm run ui:prepare -- advanced-select` (or another registry name). Review the staged sources, `dependencies.json`, and `primitive-dependencies.json`. The last file lists underlying shadcn primitives and whether they already exist locally; obtain missing primitives with a reviewed shadcn dry run before adopting the component. Install only the required npm dependencies, then copy accepted changes into `ui/`. Existing local adaptations require a manual merge.
4. Run `npm run check`, then exercise the changed component in the workshop at desktop and phone widths.
5. Replace the accepted upstream snapshot only as an explicit reviewed change. `npm run ui:verify` verifies its checksums offline.

The snapshot contains all 76 published registry entries and 134 original source files; the live fork includes the components actually used by this app. Unused upstream components are available to adopt without adding their dependencies to the production bundle.

Local adaptations include structured children for unstyled buttons, labeled form selects, disabled mobile choices, native drawer trigger semantics, stable reselection, property-specific transitions, and reduced-motion support. Preserve upstream provenance; see `THIRD_PARTY_NOTICES.md`.
