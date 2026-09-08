"use client";

import React from "react";

import type { ConfirmAlertProps } from "@/components/ConfirmAlert";
import { ConfirmAlert } from "@/components/ConfirmAlert";

export interface ConfirmAlertDeleteProps extends Omit<
  ConfirmAlertProps,
  "variant"
> {
  title?: string;
  itemName?: string;
}
const ConfirmAlertDeleteRender = ({
  open,
  onOpenChange,
  onOpenChangeComplete,
  title = "Confirm Delete",
  description,
  itemName,
  confirmLabel = "Delete",
  cancelLabel = "Cancel",
  onConfirm,
  confirmationText,
}: ConfirmAlertDeleteProps) => {
  const finalDescription =
    description ||
    `Are you sure you want to delete ${itemName ? `"${itemName}"` : "this item"}? This action cannot be undone.`;
  return (
    <ConfirmAlert
      open={open}
      onOpenChange={onOpenChange}
      onOpenChangeComplete={onOpenChangeComplete}
      title={title}
      description={finalDescription}
      variant="destructive"
      confirmLabel={confirmLabel}
      cancelLabel={cancelLabel}
      onConfirm={onConfirm}
      confirmationText={confirmationText}
    />
  );
};
export const ConfirmAlertDelete = React.memo(ConfirmAlertDeleteRender);
ConfirmAlertDelete.displayName = "ConfirmAlertDelete";
