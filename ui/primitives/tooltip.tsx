"use client";

import { Tooltip as TooltipPrimitive } from "@base-ui/react/tooltip";

import { useKitzeUI } from "@/ui/components/KitzeUIContext";
import { cn } from "@/ui/lib/utils";

const TooltipProvider = ({ delay = 400, ...props }: TooltipPrimitive.Provider.Props) => (
  <TooltipPrimitive.Provider data-slot="tooltip-provider" delay={delay} {...props} />
);
const Tooltip = ({ ...props }: TooltipPrimitive.Root.Props) => (
  <TooltipPrimitive.Root data-slot="tooltip" {...props} />
);
const TooltipTrigger = ({ ...props }: TooltipPrimitive.Trigger.Props) => (
  <TooltipPrimitive.Trigger data-slot="tooltip-trigger" {...props} />
);
const TooltipContent = ({
  className,
  side = "top",
  sideOffset = 4,
  align = "center",
  alignOffset = 0,
  children,
  ...props
}: TooltipPrimitive.Popup.Props &
  Pick<
    TooltipPrimitive.Positioner.Props,
    "align" | "alignOffset" | "side" | "sideOffset"
  >) => {
  const { portalContainer } = useKitzeUI();
  return (
    <TooltipPrimitive.Portal container={portalContainer ?? undefined}>
      <TooltipPrimitive.Positioner
        align={align}
        alignOffset={alignOffset}
        side={side}
        sideOffset={sideOffset}
        className="isolate z-50"
      >
        <TooltipPrimitive.Popup
          data-slot="tooltip-content"
          className={cn(
            "bg-primary text-primary-foreground z-50 origin-(--transform-origin) overflow-hidden rounded-md px-3 py-1.5 text-xs transition-[opacity,scale] duration-150 data-instant:transition-none data-ending-style:scale-95 data-ending-style:opacity-0 data-starting-style:scale-95 data-starting-style:opacity-0 motion-reduce:transition-none",
            className,
          )}
          {...props}
        >
          {children}
          <TooltipPrimitive.Arrow className="bg-primary fill-primary z-50 size-2.5 translate-y-[calc(-50%-2px)] rotate-45 rounded-[2px] data-[side=bottom]:top-1 data-[side=inline-end]:top-1/2! data-[side=inline-end]:-left-1 data-[side=inline-end]:-translate-y-1/2 data-[side=inline-start]:top-1/2! data-[side=inline-start]:-right-1 data-[side=inline-start]:-translate-y-1/2 data-[side=left]:top-1/2! data-[side=left]:-right-1 data-[side=left]:-translate-y-1/2 data-[side=right]:top-1/2! data-[side=right]:-left-1 data-[side=right]:-translate-y-1/2 data-[side=top]:-bottom-2.5" />
        </TooltipPrimitive.Popup>
      </TooltipPrimitive.Positioner>
    </TooltipPrimitive.Portal>
  );
};
export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider };
