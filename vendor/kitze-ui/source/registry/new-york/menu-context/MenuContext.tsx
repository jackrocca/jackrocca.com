"use client";

import React, { createContext, useContext, useMemo } from "react";

type MenuType = "dropdown" | "context" | "bottom-drawer";

interface MenuContextValue {
  menuType: MenuType;
  open?: boolean | undefined;
  closeMenu?: (() => void) | undefined;
}

const MenuContext = createContext<MenuContextValue | undefined>(undefined);

export const MenuProvider = ({
  children,
  menuType,
  closeMenu,
  open = true,
}: {
  children: React.ReactNode;
  menuType: MenuType;
  open?: boolean | undefined;
  closeMenu?: (() => void) | undefined;
}) => {
  const value = useMemo(
    () => ({ closeMenu, menuType, open }),
    [menuType, closeMenu, open]
  );

  return <MenuContext.Provider value={value}>{children}</MenuContext.Provider>;
};

export const useMenuContext = (): MenuContextValue => {
  const context = useContext(MenuContext);
  if (!context) {
    throw new Error("Menu components must be used within a MenuProvider");
  }
  return context;
};
