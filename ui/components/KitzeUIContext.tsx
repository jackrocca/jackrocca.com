"use client";

import { createContext, useContext, useMemo } from "react";

import type { ReactFC } from "@/ui/lib/types";

interface KitzeUIContextType {
  isMobile: boolean;
  /** Where portalled surfaces (dialogs, drawers, popovers) mount. Defaults to document.body. */
  portalContainer?: HTMLElement | null;
}
const KitzeUIContext = createContext<KitzeUIContextType | undefined>(undefined);
export interface KitzeUIProviderProps {
  isMobile: boolean;
  portalContainer?: HTMLElement | null;
  children: React.ReactNode;
}
export const KitzeUIProvider: ReactFC<KitzeUIProviderProps> = ({
  children,
  isMobile,
  portalContainer,
}) => {
  const value = useMemo(
    () => ({ isMobile, portalContainer }),
    [isMobile, portalContainer],
  );
  return <KitzeUIContext.Provider value={value}>{children}</KitzeUIContext.Provider>;
};

export const useKitzeUI = () => {
  const context = useContext(KitzeUIContext);
  if (context === undefined) {
    console.warn(
      "useKitzeUI should be used within a KitzeUIProvider, otherwise it will assume that mobile is false",
    );
    return {
      isMobile: false,
    };
  }
  return context;
};
