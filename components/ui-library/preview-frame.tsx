"use client";

import { useState, type ReactNode } from "react";
import { Monitor, Smartphone } from "lucide-react";
import { AlertProvider } from "@/ui/components/AlertContext";
import { DialogManager } from "@/ui/components/DialogManager";
import { KitzeUIProvider } from "@/ui/components/KitzeUIContext";
import { TooltipProvider } from "@/ui/primitives/tooltip";
import { cn } from "@/ui/lib/utils";

const modes = [
  { value: "desktop", label: "Desktop", icon: Monitor },
  { value: "mobile", label: "Mobile", icon: Smartphone },
] as const;

export function PreviewFrame({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<(typeof modes)[number]["value"]>("desktop");
  const [portalContainer, setPortalContainer] = useState<HTMLElement | null>(null);

  return (
    <div className="overflow-hidden rounded-xl border">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b bg-card px-4 py-3">
        <span className="flex items-center gap-2 font-mono text-[11px] text-muted-foreground uppercase">
          <span aria-hidden className="size-1.5 rounded-full bg-[var(--brand-teal)]" />
          Interactive preview
        </span>
        <fieldset
          aria-label="Preview device"
          className="flex rounded-lg border bg-background p-1"
        >
          {modes.map(({ value, label, icon: Icon }) => (
            <button
              key={value}
              type="button"
              aria-pressed={mode === value}
              onClick={() => setMode(value)}
              className={cn(
                "flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs transition-colors",
                mode === value
                  ? "bg-foreground text-background"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <Icon className="size-3.5" />
              {label}
            </button>
          ))}
        </fieldset>
      </div>
      <div className="docs-preview-grid flex min-h-80 items-center justify-center px-3 py-10 sm:px-6">
        <KitzeUIProvider isMobile={mode === "mobile"} portalContainer={portalContainer}>
          <TooltipProvider>
            <AlertProvider>
              <DialogManager>
                <div
                  ref={setPortalContainer}
                  className={cn(
                    "relative isolate min-w-0 contain-layout overflow-hidden",
                    mode === "mobile"
                      ? "min-h-[560px] w-full max-w-[390px] rounded-2xl border bg-background px-4 py-6"
                      : "flex-1 p-4",
                  )}
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
