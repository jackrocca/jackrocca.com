"use client";

import { Drawer } from "@base-ui/react/drawer";
import React from "react";

import type { ReactFC } from "@/ui/lib/types";
import { cn } from "@/ui/lib/utils";
import { useControlledOpen } from "@/ui/hooks/useControlledOpen";
import { DrawerContext } from "@/ui/components/DrawerContext";
import { useKitzeUI } from "@/ui/components/KitzeUIContext";

export interface BottomDrawerClassNames {
  overlay?: string | undefined;
  content?: string | undefined;
  handle?: string | undefined;
  title?: string | undefined;
  headerWrapper?: string | undefined;
  childrenWrapper?: string | undefined;
}

export interface BottomDrawerProps {
  title?: string | undefined;
  open?: boolean | undefined;
  onOpenChangeComplete?: ((open: boolean) => void) | undefined;
  onOpenChange?: ((open: boolean) => void) | undefined;
  trigger?: React.ReactNode | undefined;
  classNames?: BottomDrawerClassNames | undefined;
  renderHeader?:
    ((props: { handle: React.ReactNode; close: () => void }) => React.ReactNode) | null;
}

export const BottomDrawer: ReactFC<BottomDrawerProps> = ({
  children,
  title,
  open,
  onOpenChange,
  onOpenChangeComplete,
  trigger,
  classNames,
  renderHeader,
}) => {
  const { isOpen, setIsOpen, close } = useControlledOpen({
    onOpenChange,
    open,
  });
  const { portalContainer } = useKitzeUI();

  const [viewportWidth, setViewportWidth] = React.useState<number>();
  React.useLayoutEffect(() => {
    if (!isOpen || portalContainer) {
      return;
    }
    const updateWidth = () => setViewportWidth(window.innerWidth);
    updateWidth();
    window.addEventListener("resize", updateWidth);
    return () => window.removeEventListener("resize", updateWidth);
  }, [isOpen, portalContainer]);

  const contextValue = React.useMemo(() => ({ close }), [close]);

  const handle = (
    <div
      aria-hidden="true"
      className={cn(
        "mx-auto mb-4 h-1.5 w-12 shrink-0 rounded-full bg-muted-foreground/30",
        classNames?.handle,
      )}
    />
  );

  const defaultHeader = (
    <>
      {handle}
      <Drawer.Title
        className={cn(
          "mb-4 text-lg font-semibold text-foreground",
          classNames?.title,
          !title && "sr-only",
        )}
      >
        {title || "Drawer"}
      </Drawer.Title>
      <Drawer.Description className="sr-only">
        {title ? `${title} drawer` : "Drawer content"}
      </Drawer.Description>
    </>
  );

  const noHeader = renderHeader === null;

  return (
    <DrawerContext.Provider value={contextValue}>
      <Drawer.Root
        open={isOpen}
        onOpenChange={setIsOpen}
        onOpenChangeComplete={onOpenChangeComplete}
        swipeDirection="down"
      >
        {trigger &&
          (React.isValidElement(trigger) ? (
            <Drawer.Trigger render={trigger} />
          ) : (
            <Drawer.Trigger>{trigger}</Drawer.Trigger>
          ))}

        <Drawer.Portal container={portalContainer ?? undefined}>
          <Drawer.Backdrop
            data-slot="bottom-drawer-backdrop"
            style={portalContainer ? undefined : { width: viewportWidth }}
            className={cn(
              "fixed z-[9999] bg-black/40 opacity-[calc(1-var(--drawer-swipe-progress,0))] transition-opacity duration-200 data-ending-style:opacity-0 data-starting-style:opacity-0 data-swiping:duration-0 motion-reduce:transition-none",
              portalContainer ? "inset-0" : "inset-y-0 left-0 w-screen",
              classNames?.overlay,
            )}
          />
          <Drawer.Viewport
            style={portalContainer ? undefined : { width: viewportWidth }}
            className={cn(
              "pointer-events-none fixed z-[9999] flex items-end justify-center",
              portalContainer ? "inset-0" : "inset-y-0 left-0 w-screen",
            )}
          >
            <Drawer.Popup
              data-slot="bottom-drawer-content"
              className={cn(
                "relative flex w-[95%] min-w-0 flex-col rounded-t-[10px] bg-background",
                "pointer-events-auto max-h-[90dvh] max-w-[500px] transform-[translateY(var(--drawer-swipe-movement-y,0px))] transition-transform duration-[280ms] ease-drawer outline-none data-ending-style:translate-y-full data-ending-style:duration-200 data-starting-style:translate-y-full data-swiping:duration-0 motion-reduce:transition-none",
                classNames?.content,
                {
                  "pt-6": !noHeader,
                },
              )}
            >
              {(noHeader || renderHeader) && (
                <>
                  <Drawer.Title className="sr-only">{title || "Drawer"}</Drawer.Title>
                  <Drawer.Description className="sr-only">
                    {title ? `${title} drawer` : "Drawer content"}
                  </Drawer.Description>
                </>
              )}
              {!noHeader && (
                <div
                  className={cn(
                    "shrink-0 rounded-t-[10px] bg-background px-4 text-left",
                    classNames?.headerWrapper,
                  )}
                >
                  {renderHeader ? renderHeader({ close, handle }) : defaultHeader}
                </div>
              )}
              <Drawer.Content
                className={cn(
                  "min-h-0 flex-1 overflow-x-hidden overflow-y-auto overscroll-contain bg-background px-4 pt-0 pb-[max(1rem,env(safe-area-inset-bottom))] text-left",
                  noHeader && "rounded-t-[10px] pt-6",
                  classNames?.childrenWrapper,
                )}
              >
                {children}
              </Drawer.Content>
            </Drawer.Popup>
          </Drawer.Viewport>
        </Drawer.Portal>
      </Drawer.Root>
    </DrawerContext.Provider>
  );
};
