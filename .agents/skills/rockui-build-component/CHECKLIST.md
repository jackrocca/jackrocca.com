# Definition of done for a RockUI change

Copy this into your working notes and tick every line. A change that skips a line is not finished.

## API

- [ ] Every prop has a caller scenario I can name; no speculative props.
- [ ] Optional props typed `| undefined`; `classNames` defaults to a module constant.
- [ ] Opening state works both controlled (`open` + `onOpenChange`) and uncontrolled.
- [ ] `mobileView` union lists only presentations the component implements; `"keep"` is honored.
- [ ] Types re-exported from the main component file.
- [ ] No behavior change for existing call sites (grep the repo for the component name).

## Styling

- [ ] Variants via `tv()` / `cva`; no class-name string concatenation with dynamic color names.
- [ ] Only semantic tokens or `--thing-color` variables; no hex, no `bg-[#…]`.
- [ ] Transitions list their properties and include `motion-reduce:transition-none`.
- [ ] Touch targets ≥ 40px; `cursor-pointer` only on enabled controls.

## Accessibility

- [ ] Dialog/drawer has Title + Description (sr-only allowed).
- [ ] Icon-only controls have `aria-label`; decorative icons `aria-hidden`.
- [ ] Keyboard: Tab reaches every control, Enter/Space activate, Escape closes, arrows move within groups.
- [ ] Focus returns to the trigger after close.
- [ ] Disabled disables the real element; loading implies disabled.
- [ ] No console warnings in dev (Base UI missing-title, nested buttons, key warnings).

## Library registration

- [ ] `lib/ui-catalog.ts` entry: slug, title, group, kind, rationale paragraph, `imports`, `files` (all exist), `related` (all exist), `localNotes` if diverging from upstream.
- [ ] `components/ui-library/demos/<slug>.tsx` exists and is in `demos/index.ts`.
- [ ] Demo exercises every `mobileView` value and the loading/disabled states.

## Verification commands

```bash
npm run typecheck
npm run check:boundaries
npm test                       # includes tests/ui-catalog.test.ts
npx prettier --check ui components lib tests
npm run dev                    # open /ui/<slug>; test at ≥1024px and 390px; flip Desktop/Mobile
npm run check                  # before opening a PR (also builds)
```

## Manual pass at `/ui/<slug>`

- [ ] Desktop: hover, focus ring, click, keyboard-only run-through.
- [ ] Mobile toggle: drawers open from the bottom, swipe/Escape/backdrop dismiss, body scroll locked, no uncovered strip at the right edge.
- [ ] 390px viewport: nothing overflows horizontally; text does not truncate mid-word.
- [ ] Reduced motion (DevTools → Rendering → emulate): no movement, content still appears.
