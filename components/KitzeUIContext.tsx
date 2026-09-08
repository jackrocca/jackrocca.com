"use client";

import { createContext, useContext, useMemo } from "react";

import type { ReactFC } from "@/lib/kitze-types";

interface KitzeUIContextType {
  isMobile: boolean;
}
const KitzeUIContext = createContext<KitzeUIContextType | undefined>(undefined);
export interface KitzeUIProviderProps {
  isMobile: boolean;
  children: React.ReactNode;
}
export const KitzeUIProvider: ReactFC<KitzeUIProviderProps> = ({
  children,
  isMobile,
}) => {
  const value = useMemo(() => ({ isMobile }), [isMobile]);
  return (
    <KitzeUIContext.Provider value={value}>{children}</KitzeUIContext.Provider>
  );
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
