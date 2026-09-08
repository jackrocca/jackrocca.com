import { Dialog as DialogPrimitive } from "@base-ui/react/dialog";
import { XIcon } from "lucide-react";
import React from "react";

import {
  DialogClose,
  DialogOverlay,
  DialogPortal,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { CustomButton } from "@/registry/new-york/custom-button/CustomButton";
import type { DialogSize } from "@/registry/new-york/simple-dialog/SimpleDialogTypes";

export const sizeToMaxWidth: Record<DialogSize, string> = {
  "2xl": "sm:max-w-[1024px]",
  "3xl": "sm:max-w-[1280px]",
  "4xl": "sm:max-w-[1536px]",
  "5xl": "sm:max-w-[1920px]",
  full: "sm:max-w-[100vw]",
  lg: "sm:max-w-[680px]",
  md: "sm:max-w-[550px]",
  sm: "sm:max-w-[425px]",
  xl: "sm:max-w-[800px]",
};
export const CustomDialogContent = ({
  className,
  children,
  showCloseButton = true,
  ...props
}: DialogPrimitive.Popup.Props & {
  showCloseButton?: boolean;
}) => (
  <DialogPortal>
    <DialogOverlay />
    <DialogPrimitive.Popup
      data-slot="dialog-content"
      className={cn(
        "bg-background fixed top-[50%] left-[50%] z-50 grid w-full max-w-[calc(100%-2rem)] translate-x-[-50%] translate-y-[-50%] gap-4 rounded-2xl border p-6 shadow-lg transition-[opacity,scale] duration-200 ease-out data-ending-style:scale-95 data-ending-style:opacity-0 data-starting-style:scale-95 data-starting-style:opacity-0 motion-reduce:transition-none sm:max-w-lg",
        className
      )}
      {...props}
    >
      {children}
      {showCloseButton && (
        <DialogClose className="ring-offset-background focus:ring-ring hover:bg-accent text-muted-foreground absolute top-3 right-3 flex size-8 cursor-pointer items-center justify-center rounded-full opacity-70 transition-opacity hover:opacity-100 focus:ring-2 focus:ring-offset-2 focus:outline-hidden disabled:pointer-events-none [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4">
          <XIcon />
          <span className="sr-only">Close</span>
        </DialogClose>
      )}
    </DialogPrimitive.Popup>
  </DialogPortal>
);
export const toDialogTriggerElement = (
  trigger: React.ReactNode
): React.ReactNode =>
  React.isValidElement(trigger) ? (
    trigger
  ) : (
    <CustomButton>{trigger}</CustomButton>
  );
