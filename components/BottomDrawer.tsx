"use client";

import { Drawer } from "@base-ui/react/drawer";
import React from "react";

import type { ReactFC } from "@/lib/kitze-types";
import { cn } from "@/lib/utils";
import { useControlledOpen } from "@/hooks/useControlledOpen";
import { DrawerContext } from "@/components/DrawerContext";

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
    | ((props: {
        handle: React.ReactNode;
        close: () => void;
      }) => React.ReactNode)
    | null;
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

  const [viewportWidth, setViewportWidth] = React.useState<number>();
  React.useLayoutEffect(() => {
    if (!isOpen) {
      return;
    }
    // Scroll locking reserves a root scrollbar gutter, which also shrinks vw.
    // Both portal layers must cover the actual window, including that gutter.
    const updateWidth = () => setViewportWidth(window.innerWidth);
    updateWidth();
    window.addEventListener("resize", updateWidth);
    return () => window.removeEventListener("resize", updateWidth);
  }, [isOpen]);

  const contextValue = React.useMemo(() => ({ close }), [close]);

  const handle = (
    <div
      aria-hidden="true"
      className={cn(
        "mx-auto mb-4 h-1.5 w-12 shrink-0 rounded-full bg-zinc-300 dark:bg-zinc-700",
        classNames?.handle,
      )}
    />
  );

  const defaultHeader = (
    <>
      {handle}
      <Drawer.Title
        className={cn(
          "mb-4 text-lg font-semibold text-zinc-900 dark:text-white",
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

        <Drawer.Portal>
          <Drawer.Backdrop
            data-slot="bottom-drawer-backdrop"
            style={{ width: viewportWidth }}
            className={cn(
              "fixed inset-y-0 left-0 z-[9999] w-screen bg-black/40 opacity-[calc(1-var(--drawer-swipe-progress,0))] transition-opacity duration-300 data-ending-style:opacity-0 data-starting-style:opacity-0 data-swiping:duration-0 motion-reduce:transition-none dark:bg-black/60",
              classNames?.overlay,
            )}
          />
          <Drawer.Viewport
            style={{ width: viewportWidth }}
            className="pointer-events-none fixed inset-y-0 left-0 z-[9999] flex w-screen items-end justify-center"
          >
            <Drawer.Popup
              data-slot="bottom-drawer-content"
              className={cn(
                "relative flex w-[95%] min-w-0 flex-col rounded-t-[10px] bg-white dark:bg-zinc-900",
                "dark:border-t dark:border-zinc-800",
                "pointer-events-auto max-h-[90dvh] max-w-[500px] transform-[translateY(var(--drawer-swipe-movement-y,0px))] transition-transform duration-300 ease-out outline-none data-ending-style:translate-y-full data-starting-style:translate-y-full data-swiping:duration-0 motion-reduce:transition-none",
                classNames?.content,
                {
                  "pt-6": !noHeader,
                },
              )}
            >
              {(noHeader || renderHeader) && (
                <>
                  <Drawer.Title className="sr-only">
                    {title || "Drawer"}
                  </Drawer.Title>
                  <Drawer.Description className="sr-only">
                    {title ? `${title} drawer` : "Drawer content"}
                  </Drawer.Description>
                </>
              )}
              {!noHeader && (
                <div
                  className={cn(
                    "shrink-0 rounded-t-[10px] bg-white px-4 text-left dark:bg-zinc-900",
                    classNames?.headerWrapper,
                  )}
                >
                  {renderHeader
                    ? renderHeader({ close, handle })
                    : defaultHeader}
                </div>
              )}
              <Drawer.Content
                className={cn(
                  "min-h-0 flex-1 overflow-x-hidden overflow-y-auto overscroll-contain bg-white px-4 pt-0 pb-[max(1rem,env(safe-area-inset-bottom))] text-left dark:bg-zinc-900",
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
