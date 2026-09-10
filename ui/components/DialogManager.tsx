"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  memo,
} from "react";

import { cn } from "@/ui/lib/utils";
import { DialogList } from "@/ui/components/DialogList";
import type { SimpleDialogProps } from "@/ui/components/SimpleDialog";

export interface OpenDialogProps<TProps extends object = object> {
  title?: string | undefined;
  component: React.ElementType;
  props?: TProps | undefined;
  size?: SimpleDialogProps["size"] | undefined;
  classNames?: SimpleDialogProps["classNames"] | undefined;
  mobileView?: SimpleDialogProps["mobileView"] | undefined;
  drawerTitle?: SimpleDialogProps["drawerTitle"] | undefined;
  showCancel?: SimpleDialogProps["showCancel"] | undefined;
  showCloseButton?: SimpleDialogProps["showCloseButton"] | undefined;
  onCancel?: SimpleDialogProps["onCancel"] | undefined;
  onSubmit?: SimpleDialogProps["onSubmit"] | undefined;
  submitText?: SimpleDialogProps["submitText"] | undefined;
  cancelText?: SimpleDialogProps["cancelText"] | undefined;
}
export type DialogConfig = OpenDialogProps & {
  id: string;
  open: boolean;
};
interface DialogContextType {
  openDialog: <TProps extends object>(config: OpenDialogProps<TProps>) => string;
  closeDialog: (id: string) => void;
  closeAllDialogs: () => void;
}
const DialogContext = createContext<DialogContextType | null>(null);
export const useDialog = () => {
  const context = useContext(DialogContext);
  if (!context) {
    throw new Error("useDialog must be used within a DialogProvider");
  }
  return context;
};
export interface DialogManagerProps {
  classNames?:
    | {
        root?: string | undefined;
      }
    | undefined;
  mobileView?: SimpleDialogProps["mobileView"] | undefined;
  children?: React.ReactNode | undefined;
}
const DialogManagerRender = ({
  classNames,
  mobileView = "bottom-drawer",
  children,
}: DialogManagerProps) => {
  const [dialogs, setDialogs] = useState<DialogConfig[]>([]);
  const idRef = useRef(0);
  const openDialog = useCallback((config: OpenDialogProps) => {
    const id = String(++idRef.current);
    setDialogs((prev) => {
      const newDialogs = [
        ...prev,
        {
          ...config,
          id,
          open: true,
        },
      ];
      return newDialogs;
    });
    return id;
  }, []);
  const closeDialog = useCallback((id: string) => {
    setDialogs((prev) =>
      prev.map((dialog) => (dialog.id === id ? { ...dialog, open: false } : dialog)),
    );
  }, []);
  const closeAllDialogs = useCallback(() => {
    setDialogs((prev) => prev.map((dialog) => ({ ...dialog, open: false })));
  }, []);
  const contextValue = useMemo(
    () => ({
      closeAllDialogs,
      closeDialog,
      openDialog,
    }),
    [openDialog, closeDialog, closeAllDialogs],
  );
  return (
    <DialogContext.Provider value={contextValue}>
      {children}
      <div className={cn("pointer-events-none fixed inset-0 z-[100]", classNames?.root)}>
        <DialogList
          dialogs={dialogs}
          onClose={closeDialog}
          onRemove={(id) =>
            setDialogs((prev) => prev.filter((dialog) => dialog.id !== id))
          }
          defaultMobileView={mobileView}
        />
      </div>
    </DialogContext.Provider>
  );
};
export const DialogManager = memo(DialogManagerRender);
