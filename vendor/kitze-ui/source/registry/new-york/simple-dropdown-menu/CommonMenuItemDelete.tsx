"use client";

import { Trash } from "lucide-react";
import React, { useState } from "react";

import type { ReactFC } from "@/lib/types";
import { useMenuContext } from "@/registry/new-york/menu-context/MenuContext";
import type { CommonMenuItemProps } from "@/registry/new-york/simple-dropdown-menu/CommonMenuItem";
import { CommonMenuItem } from "@/registry/new-york/simple-dropdown-menu/CommonMenuItem";
import { useConfirmAlertDelete } from "@/registry/new-york/ui-alert/AlertContext";

export interface CommonMenuItemDeleteProps extends Omit<
  CommonMenuItemProps,
  "children" | "leftIcon" | "destructive" | "onSelect"
> {
  label?: string;
  itemName?: string;
  onDelete?: () => void;
  /** "inline"/true: Sure?; false/"none": immediate; "dialog": confirmation dialog. */
  confirm?: boolean | "dialog" | "inline" | "none";
  confirmLabel?: string;
  /** With confirm="dialog", require this exact phrase before deletion. */
  confirmationText?: string;
}

interface DeleteActionProps extends CommonMenuItemDeleteProps {
  requestConfirmation?: (() => void) | undefined;
}

const DeleteAction = ({
  label = "Delete",
  confirmLabel = "Sure?",
  confirm,
  itemName = "item",
  onDelete,
  onClick,
  requestConfirmation,
  confirmationText,
  ...props
}: DeleteActionProps) => {
  const [isConfirming, setIsConfirming] = useState(false);
  const { closeMenu } = useMenuContext();

  const handleDelete = (event: React.MouseEvent<HTMLElement>) => {
    // Keep the first activation in the menu, including keyboard activation.
    event.preventDefault();
    if (
      (requestConfirmation && confirmationText) ||
      (!event.metaKey && !event.ctrlKey)
    ) {
      if (requestConfirmation) {
        closeMenu?.();
        requestConfirmation();
        return;
      }
      if ((confirm === true || confirm === "inline") && !isConfirming) {
        setIsConfirming(true);
        return;
      }
    }
    setIsConfirming(false);
    onDelete?.();
    onClick?.(event);
    closeMenu?.();
  };

  return (
    <CommonMenuItem
      {...props}
      leftIcon={Trash}
      destructive
      closeOnClick={false}
      onSelect={handleDelete}
    >
      <span className="inline-grid" aria-live="polite">
        <span
          className={
            isConfirming
              ? "invisible col-start-1 row-start-1"
              : "col-start-1 row-start-1"
          }
          aria-hidden={isConfirming || undefined}
        >
          {label}
        </span>
        <span
          className={
            isConfirming
              ? "col-start-1 row-start-1"
              : "invisible col-start-1 row-start-1"
          }
          aria-hidden={!isConfirming || undefined}
          aria-label={isConfirming ? `Confirm delete ${itemName}` : undefined}
        >
          {confirmLabel}
        </span>
      </span>
    </CommonMenuItem>
  );
};

const DeleteWithDialog = (props: CommonMenuItemDeleteProps) => {
  const confirmDelete = useConfirmAlertDelete();
  const { itemName = "item", onDelete, confirmationText } = props;
  const handleRequestConfirmation = () => {
    confirmDelete({
      confirmationText,
      description: `Are you sure you want to delete this ${itemName}? This action cannot be undone.`,
      onConfirm: () => {
        onDelete?.();
      },
      title: `Delete ${itemName}`,
    });
  };

  return (
    <DeleteAction {...props} requestConfirmation={handleRequestConfirmation} />
  );
};

export const CommonMenuItemDelete: ReactFC<CommonMenuItemDeleteProps> = ({
  confirm = "dialog",
  ...props
}) => {
  const { open } = useMenuContext();
  return confirm === "dialog" ? (
    <DeleteWithDialog {...props} />
  ) : (
    <DeleteAction key={String(open)} {...props} confirm={confirm} />
  );
};
