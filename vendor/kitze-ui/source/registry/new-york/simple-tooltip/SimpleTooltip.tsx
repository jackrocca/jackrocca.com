"use client";

import * as React from "react";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { BottomDrawer } from "@/registry/new-york/bottom-drawer/BottomDrawer";
import { useKitzeUI } from "@/registry/new-york/kitze-ui-context/KitzeUIContext";

// Define MobileViewType for SimpleTooltip
export type TooltipMobileViewType = "keep" | "popover" | "bottom-drawer";
export interface SimpleTooltipProps {
  children: React.ReactNode;
  // Allow ReactNode for popover/drawer
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

  // --- Mobile Rendering ---
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
          <PopoverContent
            className={cn("w-auto max-w-[250px]", tooltipClassName)}
          >
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
          // Pass tooltipClassName to drawer content
          classNames={{
            content: tooltipClassName,
          }}
        >
          <div className="p-4">{content}</div>
        </BottomDrawer>
      );
    }
    // If mobileView is 'keep', fall through to default Tooltip rendering
  }

  // --- Default Tooltip Rendering (Desktop or mobileView='keep') ---
  return (
    <TooltipProvider delay={0}>
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
    </TooltipProvider>
  );
};
