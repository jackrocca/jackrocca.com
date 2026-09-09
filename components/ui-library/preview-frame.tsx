"use client";

import { useState, type ReactNode } from "react";
import { Monitor, Smartphone } from "lucide-react";
import { AlertProvider } from "@/ui/components/AlertContext";
import { DialogManager } from "@/ui/components/DialogManager";
import { KitzeUIProvider } from "@/ui/components/KitzeUIContext";
import { SegmentedControl } from "@/ui/components/SegmentedControl";
import { TooltipProvider } from "@/ui/primitives/tooltip";
import { cn } from "@/ui/lib/utils";

const modes = [
  { value: "desktop", label: "Desktop", icon: Monitor },
  { value: "mobile", label: "Mobile", icon: Smartphone },
] as const;

export function PreviewFrame({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<(typeof modes)[number]["value"]>("desktop");

  return (
    <div className="overflow-hidden rounded-2xl bg-card shadow-[0_2px_12px_rgba(0,0,0,0.04),0_0_0_1px_rgba(0,0,0,0.06)]">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/70 px-4 py-3 sm:px-6">
        <p className="flex items-center gap-2 text-[11px] font-medium tracking-[0.16em] text-muted-foreground uppercase">
          <span aria-hidden className="size-1.5 rounded-full bg-[var(--brand-teal)]" />
          Interactive preview
        </p>
        <SegmentedControl
          size="sm"
          className="min-h-10"
          value={mode}
          onChange={(value) => setMode(value as typeof mode)}
          options={[...modes]}
        />
      </div>
      <div
        className={cn(
          "bg-[radial-gradient(circle,color-mix(in_srgb,var(--border)_80%,transparent)_1px,transparent_1px)] bg-size-[14px_14px] p-6 sm:p-8",
          mode === "mobile" && "flex justify-center",
        )}
      >
        <KitzeUIProvider isMobile={mode === "mobile"}>
          <TooltipProvider>
            <AlertProvider>
              <DialogManager>
                <div
                  className={
                    mode === "mobile"
                      ? "w-full max-w-[390px] rounded-2xl border border-border bg-background p-4"
                      : "w-full"
                  }
                >
                  {children}
                </div>
              </DialogManager>
            </AlertProvider>
          </TooltipProvider>
        </KitzeUIProvider>
      </div>
    </div>
  );
}
