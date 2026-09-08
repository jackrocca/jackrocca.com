import * as React from "react";

import type { ReactFC } from "@/lib/types";
import { cn } from "@/lib/utils";
import type { KbdClassNames } from "@/registry/new-york/kbd/Kbd";
import { Kbd } from "@/registry/new-york/kbd/Kbd";

export interface KbdShortcutsProps {
  shortcuts: string[];
  separator?: string | null | undefined;
  classNames?: KbdClassNames | undefined;
}
export const KbdShortcuts: ReactFC<KbdShortcutsProps> = ({
  shortcuts,
  separator = "+",
  classNames,
}) => (
  <div className={cn("flex items-center gap-1.5", classNames?.root)}>
    {shortcuts.map((shortcut: string, index: number) => (
      <React.Fragment key={`${shortcut}-${index}`}>
        <Kbd
          keys={[shortcut]}
          classNames={{
            key: classNames?.key,
            root: "",
            separator: classNames?.separator,
          }}
        />
        {separator !== null && index !== shortcuts.length - 1 && (
          <span
            className={cn(
              "text-muted-foreground text-xs",
              classNames?.separator
            )}
          >
            {separator}
          </span>
        )}
      </React.Fragment>
    ))}
  </div>
);
