import React from "react";

import type { ReactFC } from "@/ui/lib/types";
import { cn } from "@/ui/lib/utils";

// Label
export interface BottomDrawerMenuLabelProps {
  children: React.ReactNode;
  className?: string | undefined;
}

export const BottomDrawerMenuLabel: ReactFC<BottomDrawerMenuLabelProps> = ({
  children,
  className,
}) => (
  <div
    className={cn(
      "px-4 py-2 text-left text-sm font-medium text-muted-foreground",
      className,
    )}
  >
    {children}
  </div>
);

// Separator
export interface BottomDrawerMenuSeparatorProps {
  className?: string | undefined;
}

export const BottomDrawerMenuSeparator: ReactFC<BottomDrawerMenuSeparatorProps> = ({
  className,
}) => (
  <hr
    data-slot="bottom-drawer-menu-separator"
    className={cn("my-1 h-px w-full shrink-0 border-0 bg-border", className)}
  />
);

// Group
export interface BottomDrawerMenuGroupProps {
  children: React.ReactNode;
  className?: string | undefined;
}

export const BottomDrawerMenuGroup: ReactFC<BottomDrawerMenuGroupProps> = ({
  children,
  className,
}) => <div className={cn("flex w-full flex-col", className)}>{children}</div>;

// Consecutive items provide their own separators.
export interface BottomDrawerMenuItemsProps {
  children: React.ReactNode;
  className?: string | undefined;
}

export const BottomDrawerMenuItems: ReactFC<BottomDrawerMenuItemsProps> = ({
  children,
  className,
}) => <div className={cn("flex flex-col", className)}>{children}</div>;

// Group with title and items
export interface BottomDrawerGroupProps {
  title?: string | undefined;
  children: React.ReactNode;
  className?: string | undefined;
  titleClassName?: string | undefined;
}

export const BottomDrawerGroup: ReactFC<BottomDrawerGroupProps> = ({
  title,
  children,
  className,
  titleClassName,
}) => (
  <div className={cn("flex w-full flex-col", className)}>
    {title && (
      <BottomDrawerMenuLabel className={titleClassName}>{title}</BottomDrawerMenuLabel>
    )}
    <BottomDrawerMenuItems>{children}</BottomDrawerMenuItems>
  </div>
);
