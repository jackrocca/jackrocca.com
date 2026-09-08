"use client";

import React from "react";

import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
} from "@/ui/primitives/alert-dialog";
import { cn } from "@/ui/lib/utils";

export interface AlertProps {
  open: boolean;
  onOpenChangeComplete?: ((open: boolean) => void) | undefined;
  onOpenChange: (open: boolean) => void;
  title?: string | undefined;
  description?: string | undefined;
  variant?: "default" | "destructive" | "success" | undefined;
  children?: React.ReactNode | undefined;
  body?: React.ReactNode | undefined;
}
const AlertRender = ({
  open,
  onOpenChange,
  onOpenChangeComplete,
  title = "Alert",
  description,
  variant = "default",
  children,
  body,
}: AlertProps) => (
  <AlertDialog
    open={open}
    onOpenChange={onOpenChange}
    onOpenChangeComplete={onOpenChangeComplete}
  >
    <AlertDialogContent className={cn(variant === "success" && "border-primary")}>
      <AlertDialogHeader>
        <AlertDialogTitle>{title}</AlertDialogTitle>
        {description && <AlertDialogDescription>{description}</AlertDialogDescription>}
      </AlertDialogHeader>
      {body}
      <AlertDialogFooter>{children}</AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
);
export const Alert = React.memo(AlertRender);
Alert.displayName = "Alert";
