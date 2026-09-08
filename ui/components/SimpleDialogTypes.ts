import React from "react";

export type DialogMobileViewType = "keep" | "bottom-drawer";

export type DialogSize =
  "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl" | "5xl" | "full";

export interface DialogClassNames {
  root?: string | undefined;
  content?: string | undefined;
  header?: string | undefined;
  title?: string | undefined;
  body?: string | undefined;
  footer?: string | undefined;
  submitButton?: string | undefined;
  cancelButton?: string | undefined;
  drawerRoot?: string | undefined;
  drawerContent?: string | undefined;
  drawerHeader?: string | undefined;
  drawerFooter?: string | undefined;
}

export interface SimpleDialogProps {
  trigger?: React.ReactNode | undefined;
  title?: string | undefined;
  children: React.ReactNode;
  open?: boolean | undefined;
  onOpenChangeComplete?: ((open: boolean) => void) | undefined;
  onOpenChange?: ((open: boolean) => void) | undefined;
  size?: DialogSize | undefined;
  classNames?: DialogClassNames | undefined;
  mobileView?: DialogMobileViewType | undefined;
  drawerTitle?: string | undefined;
  showCancel?: boolean | undefined;
  showCloseButton?: boolean | undefined;
  onCancel?: (() => void) | undefined;
  onSubmit?: (() => void) | undefined;
  submitText?: string | undefined;
  cancelText?: string | undefined;
}
