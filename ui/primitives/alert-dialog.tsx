"use client";

import { AlertDialog as AlertDialogPrimitive } from "@base-ui/react/alert-dialog";
import * as React from "react";

import { useKitzeUI } from "@/ui/components/KitzeUIContext";
import { cn } from "@/ui/lib/utils";
import { dialogOverlayClassName, dialogPopupClassName } from "@/ui/primitives/dialog";
import { Button } from "@/ui/primitives/button";

const AlertDialog = ({ ...props }: AlertDialogPrimitive.Root.Props) => (
  <AlertDialogPrimitive.Root data-slot="alert-dialog" {...props} />
);
const AlertDialogTrigger = ({ ...props }: AlertDialogPrimitive.Trigger.Props) => (
  <AlertDialogPrimitive.Trigger data-slot="alert-dialog-trigger" {...props} />
);
const AlertDialogPortal = ({ ...props }: AlertDialogPrimitive.Portal.Props) => {
  const { portalContainer } = useKitzeUI();
  return (
    <AlertDialogPrimitive.Portal
      data-slot="alert-dialog-portal"
      container={portalContainer ?? undefined}
      {...props}
    />
  );
};
const AlertDialogOverlay = ({
  className,
  ...props
}: AlertDialogPrimitive.Backdrop.Props) => (
  <AlertDialogPrimitive.Backdrop
    data-slot="alert-dialog-overlay"
    className={cn(dialogOverlayClassName, className)}
    {...props}
  />
);
const AlertDialogContent = ({
  className,
  ...props
}: AlertDialogPrimitive.Popup.Props) => (
  <AlertDialogPortal>
    <AlertDialogOverlay />
    <AlertDialogPrimitive.Popup
      data-slot="alert-dialog-content"
      className={cn(dialogPopupClassName, "sm:max-w-lg", className)}
      {...props}
    />
  </AlertDialogPortal>
);
const AlertDialogHeader = ({ className, ...props }: React.ComponentProps<"div">) => (
  <div
    data-slot="alert-dialog-header"
    className={cn("flex flex-col gap-2 text-center sm:text-left", className)}
    {...props}
  />
);
const AlertDialogFooter = ({ className, ...props }: React.ComponentProps<"div">) => (
  <div
    data-slot="alert-dialog-footer"
    className={cn("flex flex-col-reverse gap-2 sm:flex-row sm:justify-end", className)}
    {...props}
  />
);
const AlertDialogTitle = ({ className, ...props }: AlertDialogPrimitive.Title.Props) => (
  <AlertDialogPrimitive.Title
    data-slot="alert-dialog-title"
    className={cn("text-lg font-semibold", className)}
    {...props}
  />
);
const AlertDialogDescription = ({
  className,
  ...props
}: AlertDialogPrimitive.Description.Props) => (
  <AlertDialogPrimitive.Description
    data-slot="alert-dialog-description"
    className={cn("text-muted-foreground text-sm", className)}
    {...props}
  />
);
const AlertDialogAction = ({
  variant = "default",
  ...props
}: AlertDialogPrimitive.Close.Props &
  Pick<React.ComponentProps<typeof Button>, "variant">) => (
  <AlertDialogPrimitive.Close
    data-slot="alert-dialog-action"
    render={<Button variant={variant} />}
    {...props}
  />
);
const AlertDialogCancel = (props: AlertDialogPrimitive.Close.Props) => (
  <AlertDialogPrimitive.Close
    data-slot="alert-dialog-cancel"
    render={<Button variant="outline" />}
    {...props}
  />
);
export {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  AlertDialogPortal,
  AlertDialogTitle,
  AlertDialogTrigger,
};
