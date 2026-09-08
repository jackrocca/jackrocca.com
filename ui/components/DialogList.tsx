"use client";
import React, { memo } from "react";

import type { DialogConfig } from "@/ui/components/DialogManager";
import type { SimpleDialogProps } from "@/ui/components/SimpleDialog";
import { SimpleDialog } from "@/ui/components/SimpleDialog";

const isIntrinsicComponent = (
  component: React.ElementType,
): component is keyof React.JSX.IntrinsicElements => typeof component === "string";

const DialogListRender = ({
  dialogs,
  onClose,
  onRemove,
  defaultMobileView,
}: {
  dialogs: DialogConfig[];
  onClose: (id: string) => void;
  onRemove: (id: string) => void;
  defaultMobileView?: SimpleDialogProps["mobileView"] | undefined;
}) => (
  <>
    {dialogs.map(
      ({
        id,
        open,
        title,
        component: Component,
        props,
        size,
        classNames,
        mobileView,
        drawerTitle,
        showCancel,
        showCloseButton,
        onCancel,
        onSubmit,
        submitText,
        cancelText,
      }) => (
        <div key={id} className="pointer-events-auto">
          <SimpleDialog
            title={title}
            open={open}
            onOpenChangeComplete={(next) => {
              if (!next) {
                onRemove(id);
              }
            }}
            onOpenChange={(nextOpen: boolean) => {
              if (!nextOpen) {
                onClose(id);
              }
            }}
            size={size}
            classNames={classNames}
            mobileView={mobileView ?? defaultMobileView}
            drawerTitle={drawerTitle}
            showCancel={showCancel}
            showCloseButton={showCloseButton}
            onCancel={() => {
              if (onCancel) {
                onCancel();
              }
              onClose(id);
            }}
            {...(onSubmit && {
              onSubmit: () => {
                onSubmit();
                onClose(id);
              },
            })}
            submitText={submitText}
            cancelText={cancelText}
          >
            {isIntrinsicComponent(Component) ? (
              <Component {...props} />
            ) : (
              <Component {...props} close={() => onClose(id)} />
            )}
          </SimpleDialog>
        </div>
      ),
    )}
  </>
);
export const DialogList = memo(DialogListRender);
