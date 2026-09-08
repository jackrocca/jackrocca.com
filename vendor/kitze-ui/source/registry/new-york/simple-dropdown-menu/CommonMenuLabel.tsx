"use client";

import React from "react";

import {
  ContextMenuGroup,
  ContextMenuLabel,
} from "@/components/ui/context-menu";
import {
  DropdownMenuGroup,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import type { ReactFC } from "@/lib/types";
import { cn } from "@/lib/utils";
import { BottomDrawerMenuLabel } from "@/registry/new-york/bottom-drawer/BottomDrawerMenuComponents";
import { useMenuContext } from "@/registry/new-york/menu-context/MenuContext";
import { useIsInsideCommonMenuGroup } from "@/registry/new-york/simple-dropdown-menu/CommonMenuGroup";

export interface CommonMenuLabelProps {
  children: React.ReactNode;
  className?: string;
}

export const CommonMenuLabel: ReactFC<CommonMenuLabelProps> = ({
  children,
  className,
}) => {
  const { menuType } = useMenuContext();
  const isInsideGroup = useIsInsideCommonMenuGroup();

  // If bottom drawer, use BottomDrawerMenuLabel
  if (menuType === "bottom-drawer") {
    return (
      <BottomDrawerMenuLabel className={className}>
        {children}
      </BottomDrawerMenuLabel>
    );
  }

  // Otherwise use dropdown or context menu label
  const isDropdown = menuType === "dropdown";
  const MenuLabel = isDropdown ? DropdownMenuLabel : ContextMenuLabel;
  const label = <MenuLabel className={cn(className)}>{children}</MenuLabel>;

  if (isInsideGroup) {
    return label;
  }

  // Base UI menu labels must be rendered inside a group; a standalone
  // <CommonMenuLabel> (the documented usage) wraps itself in one.
  const MenuGroup = isDropdown ? DropdownMenuGroup : ContextMenuGroup;

  return <MenuGroup>{label}</MenuGroup>;
};
