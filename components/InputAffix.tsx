import type { ElementType, ReactNode } from "react";

import { cn } from "@/lib/utils";

export const InputAffix = ({
  icon: Icon,
  item,
  className,
  iconClassName,
  itemClassName,
}: {
  icon: ElementType | undefined;
  item: ReactNode;
  className: string;
  iconClassName: string;
  itemClassName: string | undefined;
}) => {
  if (!Icon && !item) {
    return null;
  }
  return (
    <div className={className}>
      {Icon && (
        <div
          className={cn(
            "text-foreground/70 flex size-5 items-center justify-center transition-colors duration-200",
            iconClassName,
          )}
        >
          <Icon />
        </div>
      )}
      {item && (
        <div className={cn("text-foreground", itemClassName)}>{item}</div>
      )}
    </div>
  );
};
