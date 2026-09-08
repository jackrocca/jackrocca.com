"use client";

import React, { useId, useState } from "react";

import {
  AlertDialogAction,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import type { AlertProps } from "@/components/Alert";
import { Alert } from "@/components/Alert";

export interface ConfirmAlertProps extends Omit<
  AlertProps,
  "children" | "body"
> {
  confirmLabel?: string | undefined;
  cancelLabel?: string | undefined;
  onConfirm: () => void;
  /** Require this exact phrase before enabling confirmation. */
  confirmationText?: string | undefined;
}
const ConfirmAlertRender = ({
  open,
  onOpenChange,
  onOpenChangeComplete,
  title = "Confirm",
  description,
  variant = "default",
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  onConfirm,
  confirmationText,
}: ConfirmAlertProps) => {
  const [phrase, setPhrase] = useState("");
  const inputId = useId();
  const canConfirm = !confirmationText || phrase === confirmationText;
  const handleConfirm = () => {
    if (canConfirm) {
      onConfirm();
    }
  };
  const handleOpenChangeComplete = (isOpen: boolean) => {
    if (!isOpen) {
      setPhrase("");
    }
    onOpenChangeComplete?.(isOpen);
  };
  return (
    <Alert
      open={open}
      onOpenChange={onOpenChange}
      onOpenChangeComplete={handleOpenChangeComplete}
      title={title}
      description={description}
      variant={variant}
      body={
        confirmationText ? (
          <div className="flex flex-col gap-2">
            <label htmlFor={inputId} className="text-sm">
              Type <strong>{confirmationText}</strong> to confirm
            </label>
            <Input
              id={inputId}
              value={phrase}
              onChange={(event) => setPhrase(event.target.value)}
              autoComplete="off"
              spellCheck={false}
            />
          </div>
        ) : undefined
      }
    >
      <AlertDialogCancel>{cancelLabel}</AlertDialogCancel>
      <AlertDialogAction
        disabled={!canConfirm}
        onClick={handleConfirm}
        className={
          variant === "destructive"
            ? "cursor-pointer bg-red-500/10 text-red-700 shadow-none hover:bg-red-500/20 dark:bg-red-400/10 dark:text-red-300 dark:hover:bg-red-400/20"
            : undefined
        }
      >
        {confirmLabel}
      </AlertDialogAction>
    </Alert>
  );
};
export const ConfirmAlert = React.memo(ConfirmAlertRender);
ConfirmAlert.displayName = "ConfirmAlert";
