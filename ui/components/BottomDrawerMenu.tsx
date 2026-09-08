"use client";

import React from "react";

import type { ReactFC } from "@/ui/lib/types";
import { cn } from "@/ui/lib/utils";
import { useControlledOpen } from "@/ui/hooks/useControlledOpen";
import type { BottomDrawerClassNames } from "@/ui/components/BottomDrawer";
import { BottomDrawer } from "@/ui/components/BottomDrawer";
import { BottomDrawerMenuItems } from "@/ui/components/BottomDrawerMenuComponents";
import type { BottomDrawerMenuItemProps } from "@/ui/components/BottomDrawerMenuItem";
import { BottomDrawerMenuItem } from "@/ui/components/BottomDrawerMenuItem";
import { MenuProvider } from "@/ui/components/MenuContext";

export interface BottomDrawerMenuProps {
  children: React.ReactNode;
  content?: React.ReactNode | undefined;
  items?: (Omit<BottomDrawerMenuItemProps, "children"> & { label: string })[] | undefined;
  title?: string | undefined;
  open?: boolean | undefined;
  onOpenChange?: ((open: boolean) => void) | undefined;
  closeOnClick?: boolean | undefined;
  classNames?: BottomDrawerClassNames | undefined;
}

export const BottomDrawerMenu: ReactFC<BottomDrawerMenuProps> = ({
  children,
  content,
  items,
  title,
  open,
  onOpenChange,
  closeOnClick = true,
  classNames,
}) => {
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

  // Determine what to render inside the drawer
  let drawerContent = content;

  // If items array is provided, render them as BottomDrawerMenuItems
  if (items && items.length > 0) {
    drawerContent = (
      <BottomDrawerMenuItems>
        {items.map((item, index) => {
          const { label, ...itemProps } = item;
          return (
            <BottomDrawerMenuItem
              key={item.label}
              {...itemProps}
              isLast={itemProps.isLast ?? index === items.length - 1}
            >
              {label}
            </BottomDrawerMenuItem>
          );
        })}
      </BottomDrawerMenuItems>
    );
  }

  return (
    <BottomDrawer
      title={title}
      trigger={children}
      open={isOpen}
      onOpenChange={setIsOpen}
      classNames={{
        ...classNames,
        childrenWrapper: cn("px-0", classNames?.childrenWrapper),
      }}
    >
      <MenuProvider menuType="bottom-drawer" closeMenu={closeMenu} open={isOpen}>
        {drawerContent}
      </MenuProvider>
    </BottomDrawer>
  );
};
