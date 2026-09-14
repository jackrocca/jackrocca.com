"use client";

import { Tabs as TabsPrimitive } from "@base-ui/react/tabs";

import { cn } from "@/ui/lib/utils";

const Tabs = ({ className, ...props }: TabsPrimitive.Root.Props) => (
  <TabsPrimitive.Root
    data-slot="tabs"
    className={cn("flex flex-col gap-3", className)}
    {...props}
  />
);
const TabsList = ({ className, ...props }: TabsPrimitive.List.Props) => (
  <TabsPrimitive.List
    data-slot="tabs-list"
    className={cn(
      "text-muted-foreground relative flex items-stretch border-b border-(--border)",
      className,
    )}
    {...props}
  />
);
const TabsTab = ({ className, ...props }: TabsPrimitive.Tab.Props) => (
  <TabsPrimitive.Tab
    data-slot="tabs-tab"
    className={cn(
      "focus-visible:ring-ring relative inline-flex min-h-10 flex-1 cursor-pointer items-center justify-center gap-1.5 px-2 text-sm font-medium whitespace-nowrap transition-colors duration-150 outline-none focus-visible:ring-2 focus-visible:ring-inset disabled:pointer-events-none disabled:opacity-50 motion-reduce:transition-none data-active:text-foreground",
      className,
    )}
    {...props}
  />
);
/**
 * Sliding underline positioned from Base UI's `--active-tab-left` variable. Only
 * `transform` animates; the width follows the active tab without transitioning.
 */
const TabsIndicator = ({ className, ...props }: TabsPrimitive.Indicator.Props) => (
  <TabsPrimitive.Indicator
    data-slot="tabs-indicator"
    renderBeforeHydration
    className={cn(
      "bg-foreground pointer-events-none absolute bottom-0 left-0 h-0.5 w-(--active-tab-width) translate-x-(--active-tab-left) rounded-full transition-transform duration-200 ease-[cubic-bezier(0.23,1,0.32,1)] motion-reduce:transition-none",
      className,
    )}
    {...props}
  />
);
const TabsPanel = ({ className, ...props }: TabsPrimitive.Panel.Props) => (
  <TabsPrimitive.Panel
    data-slot="tabs-panel"
    className={cn("outline-none", className)}
    {...props}
  />
);
export { Tabs, TabsList, TabsTab, TabsIndicator, TabsPanel };
