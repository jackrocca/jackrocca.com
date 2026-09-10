import Link from "next/link";
import {
  AppWindow,
  ArrowDown,
  ArrowUpRight,
  ListFilter,
  MousePointerClick,
  Smartphone,
} from "lucide-react";
import { ImportBar } from "@/components/ui-library/import-bar";
import { OverviewHero } from "@/components/ui-library/overview-hero";
import { RockUIWordmark } from "@/components/ui-library/wordmark";
import { getUIEntry, uiCatalog, uiEntryPath, uiLibrary } from "@/lib/ui-catalog";

export const metadata = { title: { absolute: uiLibrary.name } };

const featured = [
  [
    "custom-button",
    "The button, finished.",
    "Icons, loading, links and colors, already wired in.",
    MousePointerClick,
  ],
  [
    "bottom-drawer",
    "Mobile, handled.",
    "Swipe to dismiss, safe areas, scroll lock. The details are done.",
    Smartphone,
  ],
  [
    "simple-select",
    "A select in one prop.",
    "Options in, value out. Native on mobile when you want it.",
    ListFilter,
  ],
  [
    "responsive-dialog",
    "One dialog, two screens.",
    "Centered on desktop, a drawer on touch. Same API.",
    AppWindow,
  ],
] as const;

const values = [
  [
    "Less boilerplate",
    "Useful defaults and composable props for the things you do every day.",
  ],
  [
    "Desktop meets mobile",
    "Dialogs become drawers. Interactions adapt. The component API stays the same.",
  ],
  ["The source is yours", "It lives in ui/ in this repository. Change every last pixel."],
] as const;

export default function UIOverviewPage() {
  return (
    <main
      id="main-content"
      className="mx-auto w-full max-w-6xl px-5 py-6 sm:px-8 lg:px-12"
    >
      <section className="grid items-center gap-12 py-6 lg:grid-cols-[1.15fr_1fr] lg:gap-10 lg:py-12">
        <div>
          <h1 className="text-6xl leading-none">
            <RockUIWordmark />
          </h1>
          <p className="mt-6 max-w-md text-base leading-relaxed text-muted-foreground">
            Reusable React components built on shadcn and Base UI, forked from{" "}
            <a
              href={uiLibrary.upstream.url}
              target="_blank"
              rel="noreferrer"
              className="underline underline-offset-4"
            >
              {uiLibrary.upstream.name}
            </a>
            . Small prop APIs for dialogs, drawers, selects and buttons, including their
            mobile behavior.
          </p>
          <p className="mt-3 max-w-md text-base leading-relaxed text-muted-foreground">
            Built so you and your coding agent write less UI code and reuse consistent
            interactions across desktop and mobile.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-5">
            <a href="#components" className="docs-primary-link">
              Components
              <ArrowDown className="size-4" />
            </a>
            <a
              href={uiLibrary.repo}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1 text-sm font-medium"
            >
              View source
              <ArrowUpRight className="size-3.5" />
            </a>
          </div>
          <p className="mt-7 font-mono text-[11px] text-muted-foreground">
            {uiCatalog.length} components &amp; primitives
          </p>
        </div>
        <OverviewHero />
      </section>
      <section className="my-8 grid items-center gap-5 rounded-xl border p-5 lg:grid-cols-[auto_1fr] lg:gap-8">
        <div>
          <p className="text-sm font-medium">Import a component</p>
          <p className="mt-1 text-xs text-muted-foreground">
            The source lives in <code className="font-mono">ui/</code>. Import it like any
            local module.
          </p>
        </div>
        <ImportBar text={getUIEntry("simple-dialog")?.imports[0] ?? ""} />
      </section>
      <section id="components" className="scroll-mt-24 border-t py-10">
        <div className="mb-7 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="docs-eyebrow mb-2">Start somewhere good</p>
            <h2 className="text-2xl font-semibold tracking-tight">
              Small components. Big time savers.
            </h2>
          </div>
          <span className="text-xs text-muted-foreground">
            Explore the full collection in the sidebar
          </span>
        </div>
        <div className="grid gap-x-8 sm:grid-cols-2">
          {featured.map(([slug, title, blurb, Icon], index) => (
            <Link
              key={slug}
              href={uiEntryPath(slug)}
              className="group flex items-start gap-4 border-b py-6"
            >
              <span className="docs-icon flex size-10 shrink-0 items-center justify-center rounded-xl">
                <Icon className="size-4" />
              </span>
              <div className="min-w-0 flex-1">
                <h3 className="font-medium underline-offset-4 group-hover:underline">
                  {title}
                </h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                  {blurb}
                </p>
              </div>
              <span className="flex items-center gap-2 font-mono text-xs text-muted-foreground">
                <span className="hidden xl:inline">0{index + 1}</span>
                <ArrowUpRight className="size-3.5" />
              </span>
            </Link>
          ))}
        </div>
      </section>
      <div className="grid gap-8 py-4 pb-12 text-sm sm:grid-cols-3">
        {values.map(([title, body]) => (
          <div key={title}>
            <h3 className="mb-2 font-medium">{title}</h3>
            <p className="leading-relaxed text-muted-foreground">{body}</p>
          </div>
        ))}
      </div>
      <footer className="flex flex-wrap justify-between gap-3 border-t py-6 font-mono text-[11px] text-muted-foreground">
        <span>{uiLibrary.name}</span>
        <a href="https://www.jackrocca.com" className="hover:text-foreground">
          By Jack Rocca ↗
        </a>
      </footer>
    </main>
  );
}
