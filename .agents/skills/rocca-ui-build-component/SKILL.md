---
name: rocca-ui-build-component
description: Build or change a component in Rocca UI, the site's Kitze-UI-derived component library under ui/. Covers the decision of whether a new component is warranted, the file anatomy (Component / Types / Styles / Parts), the small-prop-API rules (classNames slots, mobileView, controlled-or-uncontrolled open, Base UI render props), styling with tailwind-variants and semantic tokens, accessibility requirements, and how the component is registered in the /ui catalog. Use when asked to add, extend, refactor or fix anything in ui/components, ui/primitives or ui/hooks, or when a page needs UI that no existing component covers.
---

# Building a Rocca UI component

Rocca UI is the source fork of [Kitze UI](https://ui.kitze.io) that lives in `ui/`. Its value is **smaller prop APIs and reusable desktop/mobile behavior**, not new visuals. A good component here lets a caller write one line where they used to write twelve, and behaves the same in every screen.

Read before touching code: `ui/README.md`, `lib/ui-catalog.ts` (what already exists), and the closest existing component to what you are building.

## Step 0: should this be a component at all?

Work down this list and stop at the first match.

1. **An existing component already has the prop.** Use it. Check the catalog description and the `Props` interface; `classNames` slots and `mobileView` cover most "I need it slightly different" cases.
2. **An existing component is missing one prop.** Add the prop to it (see "Extending"). Do not wrap it.
3. **The need is app-specific** (league, photography, account). Compose existing `@/ui` pieces in `components/`, never in `ui/`. `ui/` cannot import application code; `npm run check:boundaries` enforces it.
4. **Upstream Kitze UI has it.** Adopt it with the `rocca-ui-adopt-upstream` skill instead of writing from scratch. 76 entries are snapshotted in `vendor/kitze-ui/`; `ui/` only carries what the site uses.
5. **Genuinely new and reusable.** Build it here. Decide its tier first:
   - **Primitive** (`ui/primitives/kebab.tsx`): a styled Base UI/shadcn part with the primitive's own API. Lowercase file, named exports, `data-slot` attributes.
   - **Simple wrapper** (`ui/components/SimpleX.tsx`): one prop API over several primitives, standard presentation, `mobileView="keep"` by default.
   - **Responsive wrapper** (`ui/components/ResponsiveX.tsx`): the Simple component with the mobile presentation turned on by default. Dependency direction is Responsive → Simple, never the reverse.
   - **Enhanced control** (`CustomX`, `Input`): a familiar element plus the extras everyone re-implements (icons, loading, link rendering, colors).

## Step 1: design the prop API before writing JSX

Write the `Props` interface first, in a `XTypes.ts` file if it has more than ~6 props. Rules:

- **Data in, events out.** `options`, `value`, `onValueChange`; `open`, `onOpenChange`; `items`. Arrays of plain objects beat children-of-children.
- **Every prop has a reason a caller would set it.** If you cannot describe the situation, delete the prop.
- **`classNames` object, not many `xClassName` props.** One slot per meaningful part: `{ root, content, header, title, body, footer }`. Keep `className` for the root as well. Default it to a module-level `EMPTY_CLASS_NAMES` constant so destructuring never allocates.
- **`mobileView`** is the only way a component changes presentation on touch. Values are a small union the component actually implements: `"keep" | "bottom-drawer"`, `"keep" | "native" | "bottom-drawer"`, `"keep" | "popover" | "bottom-drawer"`. Read `isMobile` from `useKitzeUI()`; never from `window` directly.
- **Controlled or uncontrolled, never one.** Anything that opens uses `useControlledOpen({ open, onOpenChange })` and exposes `open`, `onOpenChange`, and `onOpenChangeComplete` (Base UI fires it after the exit transition; managers use it to unmount).
- **Triggers accept a node.** If `trigger` is a valid element, pass it to Base UI's `render` prop; otherwise wrap it in `CustomButton` (see `toDialogTriggerElement`). Never nest a `<button>` in a `<button>`.
- **Links are a prop, not a variant.** `href` + `external` via `useLinkableComponent`; it picks `next/link`, `<a target=_blank rel=noopener noreferrer>`, or the `as` element.
- **Sizes use the shared `Size` union** from `ui/lib/types.ts` (`xs | sm | md | lg | xl`) even if you only implement three.
- **Mark every optional prop `| undefined`** in the interface (`exactOptionalPropertyTypes` style, matching upstream) so `{...rest}` spreads type-check.

## Step 2: file anatomy

One folder-less flat file set per component, PascalCase, prefixed by the component name so related files sort together:

```
ui/components/SimpleDialog.tsx         # the component, "use client", default props, branching
ui/components/SimpleDialogTypes.ts     # Props, ClassNames, unions  (when > ~6 props)
ui/components/SimpleDialogStyles.ts    # tv() variants, size maps    (when variants exist)
ui/components/SimpleDialogParts.tsx    # sub-pieces used only by this component
ui/components/SimpleDialogActions.tsx  # a sub-component large enough to read on its own
```

Re-export the types from the main file (`export type SimpleDialogProps = Types.SimpleDialogProps`) so consumers import one path. Hooks go in `ui/hooks/useX.ts`; pure helpers in `ui/lib/`. See [ANATOMY.md](ANATOMY.md) for the reference implementation patterns and the code shapes to copy.

## Step 3: styling

- Variants with `tv()` from `tailwind-variants` (`base`, `variants`, `compoundVariants`, `defaultVariants`); primitives copied from shadcn keep `cva`. Do not hand-roll class ternaries for more than two states.
- Colors come from semantic tokens in `ui/theme.css` (`bg-background`, `text-muted-foreground`, `border-input`, `ring-ring`, `text-destructive`). Per-instance colors (buttons, badges) go through a CSS variable set in `style` (`--button-color: var(--color-emerald-600)`) via `processColor`, never through dynamic class-name concatenation, which Tailwind cannot see.
- A `var(--color-…)` reference only works if Tailwind emitted that variable. The shadcn tokens are always emitted (`@theme inline static` in `app/globals.css`), but a palette color like `emerald-600` is emitted only when some scanned utility uses it. If you pass a new palette color as a `color` prop, add it to the `@source inline("bg-{…}-600")` line in `app/globals.css`, or the button/badge renders transparent.
- Transitions name their properties: `transition-[opacity,transform]`, `transition-colors` — never bare `transition-all`. Add `motion-reduce:transition-none` on anything that moves. Entrances use Base UI's `data-starting-style` / `data-ending-style`.
- Touch targets ≥ 40px; `min-h-10` on tappable rows. `cursor-pointer` only on enabled interactive elements.
- Dark mode classes are kept where upstream has them (`dark:`) so future theming works, even though the site is light-only today.

## Step 4: accessibility is part of the definition of done

- Every dialog/drawer has a `Title` and `Description` (sr-only if not visible). Base UI warns otherwise, and the site's tests fail on console errors.
- Icon-only controls get `aria-label`; decorative icons get `aria-hidden="true"`.
- Selects: `aria-haspopup="listbox"`, `aria-expanded`, `aria-controls={listId}` on the trigger; accept `id` and `aria-label` so a visible `<label htmlFor>` can own the control.
- Roving focus for grouped buttons (`role="tablist"` + `role="tab"` + arrow/Home/End handling as in `SegmentedControlStyles.handleSegmentKey`).
- Disabled state disables the real element (`disabled` on `<button>`), and loading implies disabled.
- Focus returns to the trigger on close (Base UI does this when the trigger is the `render`ed element — another reason not to fake triggers).

## Step 5: register it

A component does not exist until it is in the library:

1. Add an entry to `lib/ui-catalog.ts` (slug, title, group, kind, one-paragraph rationale, `imports`, `files`, `related`, `localNotes` if it differs from upstream).
2. Add `components/ui-library/demos/<slug>.tsx` and register it in `demos/index.ts`. Use the `rocca-ui-document-component` skill for what a good demo shows.
3. `tests/ui-catalog.test.ts` enforces catalog ↔ demo ↔ file pairing.

## Step 6: verify

Run the checklist in [CHECKLIST.md](CHECKLIST.md). Minimum: `npm run typecheck`, `npm run check:boundaries`, `npm test`, then open `/ui/<slug>` in `npm run dev` at desktop width and 390px, flip the preview's Desktop/Mobile toggle, and drive it with the keyboard. `npm run check` before a PR.

## Extending an existing component

- Add the prop with a default that preserves current behavior; every current call site must render identically.
- Prefer widening a union (`mobileView`) or adding a `classNames` slot over a boolean flag.
- If the change diverges from upstream, add a one-line comment saying why and record it in the catalog entry's `localNotes` so the next upstream merge does not undo it.

## Anti-patterns that get a change reverted

- A `components/` file re-implementing a drawer, dialog, select or tooltip.
- `useMediaQuery` or `window.matchMedia` inside `ui/` (only `components/providers.tsx` decides `isMobile`).
- `transition-all`, `!important` overrides, hard-coded hex colors, or `bg-[#…]` outside `ui/theme.css`.
- A prop named `variant2`, `alt`, `custom`, or a boolean that only makes sense with another boolean.
- Editing anything in `vendor/kitze-ui/` (the checksum check fails) or importing from it.
