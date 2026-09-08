"use client";

import React from "react";

import {
  Dialog,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { useControlledOpen } from "@/hooks/useControlledOpen";
import { BottomDrawer } from "@/components/BottomDrawer";
import { useKitzeUI } from "@/components/KitzeUIContext";
import { SimpleDialogActions } from "@/components/SimpleDialogActions";
import {
  CustomDialogContent,
  sizeToMaxWidth,
  toDialogTriggerElement,
} from "@/components/SimpleDialogParts";
import type * as SimpleDialogTypesModule from "@/components/SimpleDialogTypes";

export type DialogClassNames = SimpleDialogTypesModule.DialogClassNames;
export type DialogMobileViewType = SimpleDialogTypesModule.DialogMobileViewType;
export type DialogSize = SimpleDialogTypesModule.DialogSize;
export type SimpleDialogProps = SimpleDialogTypesModule.SimpleDialogProps;
const EMPTY_CLASS_NAMES: NonNullable<SimpleDialogProps["classNames"]> = {};

export const SimpleDialog = ({
  trigger = "Open",
  title,
  children,
  open,
  onOpenChange,
  onOpenChangeComplete,
  size = "sm",
  classNames = EMPTY_CLASS_NAMES,
  mobileView = "keep",
  drawerTitle,
  showCloseButton = true,
  onCancel,
  onSubmit,
  showCancel = Boolean(onSubmit),
  submitText = "Submit",
  cancelText = "Cancel",
}: SimpleDialogProps) => {
  const { isMobile } = useKitzeUI();
  const { isOpen, setIsOpen, close } = useControlledOpen({
    onOpenChange,
    open,
  });
  const handleCancel = () => {
    close();
    if (onCancel) {
      onCancel();
    }
  };
  const handleSubmit = () => {
    if (onSubmit) {
      onSubmit();
    }
    close();
  };
  const actions = (
    <SimpleDialogActions
      classNames={classNames}
      showCancel={showCancel}
      onSubmit={onSubmit}
      submitText={submitText}
      cancelText={cancelText}
      onCancel={handleCancel}
      onConfirm={handleSubmit}
    />
  );
  const hasFooter = Boolean(onSubmit || showCancel);
  const triggerNode =
    open === undefined ? toDialogTriggerElement(trigger) : undefined;
  if (isMobile && mobileView === "bottom-drawer") {
    return (
      <BottomDrawer
        open={isOpen}
        onOpenChange={setIsOpen}
        onOpenChangeComplete={onOpenChangeComplete}
        trigger={triggerNode}
        title={drawerTitle || title}
        classNames={{
          childrenWrapper: classNames.drawerRoot,
          content: classNames.drawerContent,
          headerWrapper: classNames.drawerHeader,
        }}
      >
        <div className={classNames.body}>{children}</div>
        {hasFooter && (
          <div className={cn(classNames.drawerFooter, "pt-4")}>
            <div className={cn("flex justify-end gap-2", classNames.footer)}>
              {actions}
            </div>
          </div>
        )}
      </BottomDrawer>
    );
  }
  return (
    <Dialog
      open={isOpen}
      onOpenChange={setIsOpen}
      onOpenChangeComplete={onOpenChangeComplete}
    >
      {triggerNode ? (
        <DialogTrigger
          render={
            React.isValidElement(triggerNode) ? (
              triggerNode
            ) : (
              <button type="button">{triggerNode}</button>
            )
          }
        />
      ) : null}
      <CustomDialogContent
        className={cn(
          sizeToMaxWidth[size],
          classNames.root,
          classNames.content,
        )}
        showCloseButton={showCloseButton}
      >
        {title ? (
          <DialogHeader className={classNames.header}>
            <DialogTitle className={classNames.title}>{title}</DialogTitle>
            <DialogDescription className="sr-only">
              {title} dialog
            </DialogDescription>
          </DialogHeader>
        ) : (
          <>
            <DialogTitle className="sr-only">Dialog</DialogTitle>
            <DialogDescription className="sr-only">
              Dialog content
            </DialogDescription>
          </>
        )}
        <div className={cn("text-sm", classNames.body)}>{children}</div>
        {hasFooter && (
          <DialogFooter className={classNames.footer}>{actions}</DialogFooter>
        )}
      </CustomDialogContent>
    </Dialog>
  );
};
