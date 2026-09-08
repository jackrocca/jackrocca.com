"use client";
import { useEffect, useState } from "react";
import { KitzeUIProvider } from "@/components/KitzeUIContext";
import { AlertProvider } from "@/components/AlertContext";
import { DialogManager } from "@/components/DialogManager";
import { TooltipProvider } from "@/components/ui/tooltip";
export function Providers({ children }: { children: React.ReactNode }) {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const query = window.matchMedia("(max-width: 767px)");
    const update = () => setIsMobile(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);
  return (
    <KitzeUIProvider isMobile={isMobile}>
      <TooltipProvider>
        <AlertProvider>
          <DialogManager>{children}</DialogManager>
        </AlertProvider>
      </TooltipProvider>
    </KitzeUIProvider>
  );
}
