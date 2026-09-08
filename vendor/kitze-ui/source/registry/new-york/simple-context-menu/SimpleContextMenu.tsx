"use client";

import React from "react";
import { useLongPress } from "use-long-press";

import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import type { ReactFC } from "@/lib/types";
import { cn } from "@/lib/utils";
import { useControlledOpen } from "@/registry/hooks/useControlledOpen";
import { BottomDrawerMenu } from "@/registry/new-york/bottom-drawer/BottomDrawerMenu";
import { useKitzeUI } from "@/registry/new-york/kitze-ui-context/KitzeUIContext";
import { MenuProvider } from "@/registry/new-york/menu-context/MenuContext";

// Define MobileViewType for ContextMenu
export type ContextMenuMobileViewType = "keep" | "bottom-drawer";
export interface SimpleContextMenuClassNames {
  content?: string | undefined;
  drawerContent?: string | undefined;
}
export interface SimpleContextMenuProps {
  // The element that triggers the menu
  children: React.ReactNode;
  // The menu content
  content: React.ReactNode;
  classNames?: SimpleContextMenuClassNames | undefined;
  closeOnClick?: boolean | undefined;
  open?: boolean | undefined;
  onOpenChange?: ((open: boolean) => void) | undefined;
  // Mobile specific props
  mobileView?: ContextMenuMobileViewType | undefined;
  drawerTitle?: string | undefined;
}
export const SimpleContextMenu: ReactFC<SimpleContextMenuProps> = ({
  children,
  content,
  classNames,
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
      // Close controlled state
      close();
    }
  };

  // Long press binding for mobile drawer trigger
  const bind = useLongPress(
    () => {
      // Only open drawer if mobileView is set and we're on mobile
      if (isMobile && mobileView === "bottom-drawer") {
        setIsOpen(true);
      }
    },
    {
      cancelOnMovement: false,
      // Prevent default context menu on mobile long press
      captureEvent: true,
      // Only detect long press on mobile when drawer is the intended view
      filterEvents: () => isMobile && mobileView === "bottom-drawer",
      threshold: 500,
    }
  );

  // --- Mobile Rendering (Bottom Drawer via Long Press) ---
  if (isMobile && mobileView === "bottom-drawer") {
    return (
      <>
        {/* Bind long press to the children wrapper */}
        <div className="select-none" {...bind()}>
          {children}
        </div>
        {/* Drawer renders separately and is controlled by isOpen state */}
        <BottomDrawerMenu
          open={isOpen}
          onOpenChange={setIsOpen}
          title={drawerTitle}
          closeOnClick={closeOnClick}
          content={content}
          classNames={{ content: classNames?.drawerContent }}
        >
          {/* Trigger is handled by the long press bind, no visual trigger needed here */}
          {null}
        </BottomDrawerMenu>
      </>
    );
  }

  // --- Default Context Menu Rendering (Desktop or mobileView='keep') ---
  return (
    <MenuProvider menuType="context" closeMenu={closeMenu} open={isOpen}>
      <ContextMenu open={isOpen} onOpenChange={setIsOpen}>
        <ContextMenuTrigger
          render={
            <div className="select-none" {...bind()}>
              {children}
            </div>
          }
        />
        <ContextMenuContent className={cn(classNames?.content, "select-none")}>
          {content}
        </ContextMenuContent>
      </ContextMenu>
    </MenuProvider>
  );
};
