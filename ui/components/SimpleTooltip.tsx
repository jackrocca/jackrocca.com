"use client";

import * as React from "react";

import { Popover, PopoverContent, PopoverTrigger } from "@/ui/primitives/popover";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/ui/primitives/tooltip";
import { cn } from "@/ui/lib/utils";
import { BottomDrawer } from "@/ui/components/BottomDrawer";
import { useKitzeUI } from "@/ui/components/KitzeUIContext";

export type TooltipMobileViewType = "keep" | "popover" | "bottom-drawer";
export interface SimpleTooltipProps {
  children: React.ReactNode;
  content: string | React.ReactNode;
  className?: string | undefined;
  tooltipClassName?: string | undefined;
  mobileView?: TooltipMobileViewType | undefined;
  drawerTitle?: string | undefined;
}
export const SimpleTooltip: React.FC<SimpleTooltipProps> = ({
  children,
  content,
  className,
  tooltipClassName,
  mobileView = "keep",
  drawerTitle,
}): React.ReactNode => {
  const { isMobile } = useKitzeUI();
  if (!content) {
    return children;
  }
  if (isMobile) {
    if (mobileView === "popover") {
      return (
        <Popover>
          <PopoverTrigger
            render={
              React.isValidElement(children) ? (
                children
              ) : (
                <button type="button">{children}</button>
              )
            }
            className={className}
          />
          <PopoverContent className={cn("w-auto max-w-[250px]", tooltipClassName)}>
            {content}
          </PopoverContent>
        </Popover>
      );
    }
    if (mobileView === "bottom-drawer") {
      return (
        <BottomDrawer
          trigger={children}
          title={drawerTitle}
          classNames={{
            content: tooltipClassName,
          }}
        >
          <div className="p-4">{content}</div>
        </BottomDrawer>
      );
    }
  }
  return (
    <Tooltip>
      <TooltipTrigger
        render={
          React.isValidElement(children) ? (
            children
          ) : (
            <button type="button">{children}</button>
          )
        }
        className={className}
      />
      <TooltipContent className={cn("max-w-[200px]", tooltipClassName)}>
        {content}
      </TooltipContent>
    </Tooltip>
  );
};
