"use client";
/**
 * Layout helpers shared by every demo in components/ui-library/demos/.
 * Demos import only from @/ui/* and this file, so a demo page reads like consumer code.
 */
import type { ReactNode } from "react";
import { cn } from "@/ui/lib/utils";

/** One titled example group inside a component preview. */
export function DemoSection({
  title,
  description,
  children,
  className,
}: {
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("ui-demo-section", className)}>
      <div className="ui-demo-heading">
        <h3>{title}</h3>
        {description ? <p>{description}</p> : null}
      </div>
      {children}
    </section>
  );
}

/** Horizontal row of examples that wraps on narrow widths. */
export function DemoRow({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-wrap items-center gap-3", className)}>{children}</div>
  );
}

/** Vertical stack for forms and fields. */
export function DemoStack({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={cn("grid w-full max-w-sm gap-4", className)}>{children}</div>;
}

/** Small explanatory text under an example. */
export function DemoNote({ children }: { children: ReactNode }) {
  return <p className="text-muted-foreground text-sm leading-6">{children}</p>;
}
