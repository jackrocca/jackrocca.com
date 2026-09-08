import * as React from "react";

import type { ReactFC } from "@/lib/types";
import { cn } from "@/lib/utils";
import { KbdShortcuts } from "@/registry/new-york/kbd-shortcuts/KbdShortcuts";
import type { KbdClassNames } from "@/registry/new-york/kbd/Kbd";

export interface ShortcutItem {
  label: string;
  shortcuts: string[];
  separator?: string | null | undefined;
}
export interface KbdShortcutsListClassNames extends KbdClassNames {
  list?: string;
  item?: string;
  label?: string;
}
export interface KbdShortcutsListProps {
  shortcuts: ShortcutItem[];
  classNames?: KbdShortcutsListClassNames | undefined;
}
export const KbdShortcutsList: ReactFC<KbdShortcutsListProps> = ({
  shortcuts,
  classNames,
}) => (
  <div className={cn("space-y-3", classNames?.list)}>
    {shortcuts.map((item, index) => (
      <div
        key={`${item.label}-${index}`}
        className={cn(
          "hover:bg-muted/60 dark:hover:bg-muted/25 flex items-center justify-between rounded-md px-3 py-1.5 transition-colors",
          classNames?.item
        )}
      >
        <span className={cn("text-sm", classNames?.label)}>{item.label}</span>
        <KbdShortcuts
          shortcuts={item.shortcuts}
          separator={item.separator}
          classNames={{
            key: classNames?.key,
            root: classNames?.root,
            separator: classNames?.separator,
          }}
        />
      </div>
    ))}
  </div>
);
