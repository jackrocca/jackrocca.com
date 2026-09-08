"use client";

import React from "react";

import { ContextMenuGroup } from "@/components/ui/context-menu";
import { DropdownMenuGroup } from "@/components/ui/dropdown-menu";
import type { ReactFC } from "@/lib/types";
import { BottomDrawerMenuGroup } from "@/registry/new-york/bottom-drawer/BottomDrawerMenuComponents";
import { useMenuContext } from "@/registry/new-york/menu-context/MenuContext";

/**
 * Base UI requires menu group labels to live inside a `Menu.Group`. This
 * context lets `CommonMenuLabel` know whether it already sits inside a
 * `CommonMenuGroup` (plain label) or is used standalone (wraps itself).
 */
const CommonMenuGroupContext = React.createContext(false);

export const useIsInsideCommonMenuGroup = () =>
  React.useContext(CommonMenuGroupContext);

export interface CommonMenuGroupProps {
  children: React.ReactNode;
  className?: string;
}

export const CommonMenuGroup: ReactFC<CommonMenuGroupProps> = ({
  children,
  className,
}) => {
  const { menuType } = useMenuContext();

  // If bottom drawer, use BottomDrawerMenuGroup
  if (menuType === "bottom-drawer") {
    return (
      <BottomDrawerMenuGroup className={className}>
        {children}
      </BottomDrawerMenuGroup>
    );
  }

  // Otherwise use dropdown or context menu group
  const MenuGroup =
    menuType === "dropdown" ? DropdownMenuGroup : ContextMenuGroup;

  return (
    <CommonMenuGroupContext.Provider value={true}>
      <MenuGroup className={className}>{children}</MenuGroup>
    </CommonMenuGroupContext.Provider>
  );
};
