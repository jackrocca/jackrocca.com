"use client";

import type { SimpleDialogProps } from "@/components/SimpleDialog";
import { SimpleDialog } from "@/components/SimpleDialog";

export type DialogMobileViewType = "keep" | "bottom-drawer";
export type ResponsiveDialogProps = SimpleDialogProps;
export const ResponsiveDialog = ({
  mobileView = "bottom-drawer",
  ...props
}: ResponsiveDialogProps) => (
  <SimpleDialog {...props} mobileView={mobileView} />
);
