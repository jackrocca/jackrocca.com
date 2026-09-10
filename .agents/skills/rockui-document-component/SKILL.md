---
name: rockui-document-component
description: Add or improve a component's page in the public RockUI library at /ui - the catalog entry in lib/ui-catalog.ts (title, group, rationale, imports, files, related, local notes) and its interactive demo in components/ui-library/demos. Covers what a rationale paragraph must say, how demos are structured with DemoSection/DemoRow/DemoStack/DemoNote, how to make the Desktop/Mobile preview toggle meaningful, and how llms.txt and "Copy for agents" are generated. Use when asked to document, showcase, or add a demo for a ui/ component, fix a component page, or update the library's agent-facing text.
---

# Documenting a component in the RockUI library

The library at `/ui` follows [ui.kitze.io](https://ui.kitze.io): no props tables, no code dumps. A page is **a rationale paragraph, an import line, and a live preview** whose demos show every behavior the paragraph promises. Agents read the same data through `/ui/llms.txt` and the "Copy for agents" button, so the catalog text has to be precise.

## Where things live

| Piece | Path | Rendered by |
| --- | --- | --- |
| Catalog entry (data only) | `lib/ui-catalog.ts` | overview, component page, llms.txt, tests |
| Agent text renderers | `lib/ui-catalog-text.ts` | "Copy for agents", `/ui/llms.txt`, guide |
| Demo | `components/ui-library/demos/<slug>.tsx` + `demos/index.ts` | `PreviewFrame` on `/ui/<slug>` |
| Demo layout helpers | `components/ui-library/demo.tsx` | — |
| Page chrome | `components/ui-library/*.tsx`, `app/ui/**` | — |

`tests/ui-catalog.test.ts` fails if a slug lacks a demo, a demo lacks a slug, a listed file is missing, or a `related` slug is unknown.

## 1. Catalog entry

```ts
{
  slug: "simple-select",              // kebab-case; URL and demo file name
  title: "Simple Select",
  group: "Simplified",                // one of uiGroups; pick by tier, not by look
  kind: "component",                  // "component" | "primitive" | "infrastructure"
  description: "…",                   // see below
  imports: ['import { SimpleSelect } from "@/ui/components/SimpleSelect";'],
  files: ["ui/components/SimpleSelect.tsx", /* primary first, then parts, hooks, lib */],
  related: ["responsive-select-bottom-drawer-menu", "segmented-control", "command"],
  localNotes: "Accepts id and aria-label so a visible <label> can own it. …",
}
```

**The description paragraph** (3–4 sentences, ~60–90 words) answers, in order:

1. What it is, concretely ("A single-value select driven by an options array, value and onValueChange").
2. What it composes or saves ("composes the trigger, option list and optional search, and can switch to a native select or bottom-drawer menu on mobile").
3. When to use it, and the alternative when not ("use AdvancedSelect for multiple values" / "choose the dialog primitive when the structure is substantially custom").

Rules: present tense, no marketing adjectives, no "easily/simply", name real props in code style only when they are the point (`mobileView="keep"`). Never claim features that only upstream has. Groups:

| Group | Contains |
| --- | --- |
| Enhanced | familiar controls with the extras (CustomButton, Input, badges, social login) |
| Simplified | one-prop-API wrappers, standard presentation (`Simple*`) |
| Responsive | wrappers whose mobile presentation is on by default, and the drawer they use |
| Feedback | confirmation, managed dialogs, loading |
| Controls | selection, search, header composition |
| Display | keycaps, hints, purely presentational bits |
| Conditionals | wrap-a-child-only-if helpers |
| Infrastructure | providers/contexts with no visible widget |
| Primitives | styled Base UI/shadcn parts in `ui/primitives` |

`localNotes` is for divergences from upstream Kitze UI and site-specific integration facts; it is shown on the page and in the agent copy. Leave it out when there is nothing to say.

## 2. Demo

File contract:

```tsx
"use client";
import { useState } from "react";
import { DemoSection, DemoRow, DemoStack, DemoNote } from "@/components/ui-library/demo";
import { SimpleSelect } from "@/ui/components/SimpleSelect";

export function SimpleSelectDemo() {
  const [value, setValue] = useState("photography");
  return (
    <>
      <DemoSection title="Basic">…</DemoSection>
      <DemoSection title="On mobile" description="Switch the preview to Mobile to see the drawer.">…</DemoSection>
    </>
  );
}
```

Then add `"simple-select": SimpleSelectDemo` to `demos/index.ts`.

Imports allowed in a demo: `react`, `lucide-react`, `@/ui/*`, `@/components/ui-library/demo`. Nothing from `@/lib`, `next/*`, or app components — a demo must read like consumer code.

**What a good demo shows** (2–5 sections, short noun titles):

- Every variant/size union value, in one `DemoRow`.
- Every `mobileView` value, each in its own example, with a `DemoNote` telling the reader to flip the toggle. The `PreviewFrame` nests its own `KitzeUIProvider`, `AlertProvider` and `DialogManager`, so responsive components and `useDialog`/`useConfirmAlert` inside the demo follow the Desktop/Mobile switch.
- Loading, disabled, and controlled states when the component has them.
- One realistic composition (a labeled field, a menu with a destructive item, a dialog with a real submit path).
- Real labels from the site's world (Photography, Projects, Pick 4, Week 3, Season pot) instead of foo/bar.

**What a demo must not do**: restyle the component with heavy `className` overrides, import app data, use `any`, leave dead examples, nest buttons, or omit `aria-label` on icon-only controls. Keep it under ~140 lines; inline sub-components (a dialog body for `DialogManager`) live above the demo in the same file.

## 3. Generated text

- `renderAgentCopy(entry, origin)` → what "Copy for agents" writes: title, URL, description, imports, source URLs, local notes, related links, and the one-paragraph library context. Change the shape in `lib/ui-catalog-text.ts` only; never hard-code text in the page.
- `renderLlmsTxt(origin)` → `/ui/llms.txt`: intro, guide, documentation links, then every group with its entries. If you change a description, both update automatically.
- `renderGuideText()` → the philosophy section shared by the guide page and llms.txt. Edit it when a convention changes (providers, Simple vs Responsive, import paths).

## 4. Verify

```bash
npm test                      # catalog ↔ demo ↔ files pairing
npm run typecheck
npm run dev                   # open /ui/<slug>
```

On the page: read the paragraph, then confirm each promised behavior is demonstrable; flip Desktop/Mobile; tab through; check 390px width; click "Copy for agents" and paste the result somewhere to confirm it is coherent. Check `/ui/llms.txt` renders the entry.

## Refining an existing page

When Jack asks to "refine" a component, start from the page, not the source: does the paragraph still describe what the component does, does the demo show the case he is asking about, and does the mobile toggle change anything? Fix the documentation gap in the same change as the component fix so the library never lags the code.
