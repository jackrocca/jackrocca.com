"use client";

import { useState } from "react";
import { ArrowRight, Check, Layers, Rocket } from "lucide-react";
import { CustomButton } from "@/ui/components/CustomButton";
import { KitzeUIProvider } from "@/ui/components/KitzeUIContext";
import { ResponsiveDialog } from "@/ui/components/ResponsiveDialog";
import { SegmentedControl } from "@/ui/components/SegmentedControl";

export function OverviewHero() {
  const [mode, setMode] = useState("desktop");
  const [container, setContainer] = useState<HTMLElement | null>(null);

  return (
    <div
      ref={setContainer}
      className="relative isolate min-w-0 contain-layout overflow-hidden rounded-2xl border bg-card p-5 shadow-lg shadow-black/5 sm:p-6"
    >
      <div className="mb-8 flex items-center justify-between gap-2 border-b pb-4">
        <span className="flex items-center gap-2 font-mono text-[11px] text-muted-foreground uppercase">
          <span aria-hidden className="size-1.5 rounded-full bg-[var(--brand-teal)]" />
          Live component
        </span>
        <Layers aria-hidden className="size-4 text-muted-foreground" />
      </div>
      <div className="docs-icon mb-5 flex size-12 items-center justify-center rounded-xl">
        <Rocket className="size-5" />
      </div>
      <h2 className="text-xl font-semibold tracking-tight">One dialog. Two screens.</h2>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
        A centered dialog on desktop, a swipeable drawer on mobile. Same component, same
        props. Try it.
      </p>
      <div className="mt-6 flex flex-wrap items-center gap-3">
        <SegmentedControl
          size="sm"
          value={mode}
          onChange={setMode}
          options={[
            { value: "desktop", label: "Desktop" },
            { value: "mobile", label: "Mobile" },
          ]}
        />
        <KitzeUIProvider isMobile={mode === "mobile"} portalContainer={container}>
          <ResponsiveDialog
            title="Week 3 picks"
            trigger={
              <CustomButton size="sm" rightIcon={ArrowRight}>
                Try the dialog
              </CustomButton>
            }
          >
            <p className="text-sm leading-relaxed text-muted-foreground">
              Four teams, one week. Saving keeps them until kickoff.
            </p>
          </ResponsiveDialog>
        </KitzeUIProvider>
      </div>
      <p className="mt-6 flex min-h-5 items-center gap-2 font-mono text-xs text-muted-foreground">
        <Check aria-hidden className="size-3.5" />
        Keyboard friendly. Mobile ready.
      </p>
    </div>
  );
}
