import { cn } from "@/ui/lib/utils";
import { uiLibrary } from "@/lib/ui-catalog";

/** RockUI set in JetBrains Mono. Docs branding only — do not use inside `ui/`. */
export function RockUIWordmark({ className }: { className?: string }) {
  return <span className={cn("docs-brand", className)}>{uiLibrary.name}</span>;
}

export function RockUIMark({ className }: { className?: string }) {
  return (
    <span className={cn("docs-brand leading-none", className)} aria-hidden>
      R
    </span>
  );
}
