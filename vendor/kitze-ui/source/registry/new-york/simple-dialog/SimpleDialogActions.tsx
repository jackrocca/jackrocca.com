"use client";

import { CustomButton } from "@/registry/new-york/custom-button/CustomButton";
import type { SimpleDialogProps } from "@/registry/new-york/simple-dialog/SimpleDialogTypes";

type DialogActionsProps = Pick<
  SimpleDialogProps,
  "classNames" | "showCancel" | "onSubmit" | "submitText" | "cancelText"
> & {
  onCancel: () => void;
  onConfirm: () => void;
};

export const SimpleDialogActions = ({
  classNames,
  showCancel,
  onSubmit,
  submitText,
  cancelText,
  onCancel,
  onConfirm,
}: DialogActionsProps) => (
  <>
    {showCancel && (
      <CustomButton
        variant="outline"
        onClick={onCancel}
        className={classNames?.cancelButton}
      >
        {cancelText}
      </CustomButton>
    )}
    {onSubmit && (
      <CustomButton onClick={onConfirm} className={classNames?.submitButton}>
        {submitText}
      </CustomButton>
    )}
  </>
);
