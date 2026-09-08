"use client";

import type { SimpleDialogProps } from "@/registry/new-york/simple-dialog/SimpleDialog";
import { SimpleDialog } from "@/registry/new-york/simple-dialog/SimpleDialog";

export type DialogMobileViewType = "keep" | "bottom-drawer";
export type ResponsiveDialogProps = SimpleDialogProps;
export const ResponsiveDialog = ({
  mobileView = "bottom-drawer",
  ...props
}: ResponsiveDialogProps) => (
  <SimpleDialog {...props} mobileView={mobileView} />
);
