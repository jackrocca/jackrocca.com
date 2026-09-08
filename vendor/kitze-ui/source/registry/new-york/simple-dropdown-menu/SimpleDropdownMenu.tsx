"use client";

import React from "react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { ReactFC } from "@/lib/types";
import { useControlledOpen } from "@/registry/hooks/useControlledOpen";
import { BottomDrawerMenu } from "@/registry/new-york/bottom-drawer/BottomDrawerMenu";
import { useKitzeUI } from "@/registry/new-york/kitze-ui-context/KitzeUIContext";
import { MenuProvider } from "@/registry/new-york/menu-context/MenuContext";

// Define MobileViewType for Dropdown
export type DropdownMobileViewType = "keep" | "bottom-drawer";
export interface SimpleDropdownMenuClassNames {
  content?: string | undefined;
  drawerContent?: string | undefined;
}
export interface SimpleDropdownMenuProps {
  // This is the trigger
  children: React.ReactNode;
  // This is the menu content
  content: React.ReactNode;
  classNames?: SimpleDropdownMenuClassNames | undefined;
  align?: "start" | "center" | "end" | undefined;
  side?: "top" | "right" | "bottom" | "left" | undefined;
  closeOnClick?: boolean | undefined;
  open?: boolean | undefined;
  onOpenChange?: ((open: boolean) => void) | undefined;
  // Mobile specific props
  mobileView?: DropdownMobileViewType | undefined;
  drawerTitle?: string | undefined;
}
export const SimpleDropdownMenu: ReactFC<SimpleDropdownMenuProps> = ({
  children,
  content,
  classNames,
  align = "center",
  side = "bottom",
  closeOnClick = true,
  open,
  onOpenChange,
  mobileView = "keep",
  drawerTitle,
}) => {
  const { isMobile } = useKitzeUI();
  const { isOpen, setIsOpen, close } = useControlledOpen({
    onOpenChange,
    open,
  });

  // Function to close the menu when clicking on menu items
  const closeMenu = () => {
    if (closeOnClick) {
      close();
    }
  };

  // --- Mobile Rendering (Bottom Drawer) ---
  if (isMobile && mobileView === "bottom-drawer") {
    return (
      <BottomDrawerMenu
        title={drawerTitle}
        open={isOpen}
        onOpenChange={setIsOpen}
        content={content}
        closeOnClick={closeOnClick}
        classNames={{ content: classNames?.drawerContent }}
      >
        {children}
      </BottomDrawerMenu>
    );
  }

  // --- Default Dropdown Rendering (Desktop or mobileView='keep') ---
  return (
    <MenuProvider menuType="dropdown" closeMenu={closeMenu} open={isOpen}>
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger
          render={
            React.isValidElement(children) ? (
              children
            ) : (
              <button type="button">{children}</button>
            )
          }
        />
        <DropdownMenuContent
          // Class for desktop dropdown
          className={classNames?.content}
          align={align}
          side={side}
        >
          {content}
        </DropdownMenuContent>
      </DropdownMenu>
    </MenuProvider>
  );
};
