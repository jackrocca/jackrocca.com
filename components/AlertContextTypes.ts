import type { ReactNode } from "react";

import type { ConfirmAlertProps } from "@/components/ConfirmAlert";
import type { ConfirmAlertDeleteProps } from "@/components/ConfirmAlertDelete";

export type AlertId = string;
export type AlertType = "confirm" | "delete";

export interface BaseAlert {
  id: AlertId;
  type: AlertType;
  open: boolean;
}

export interface ConfirmAlertData extends BaseAlert {
  type: "confirm";
  props: Omit<ConfirmAlertProps, "open" | "onOpenChange">;
}

export interface DeleteAlertData extends BaseAlert {
  type: "delete";
  props: Omit<ConfirmAlertDeleteProps, "open" | "onOpenChange">;
}

export type AlertData = ConfirmAlertData | DeleteAlertData;

export interface AlertContextState {
  alerts: AlertData[];
}

export type AlertAction =
  | { type: "ADD_ALERT"; payload: AlertData }
  | { type: "REMOVE_ALERT"; payload: { id: AlertId } }
  | { type: "SET_ALERT_OPEN"; payload: { id: AlertId; open: boolean } };

export interface AlertContextValue {
  alerts: AlertData[];
  confirmAlert: (
    props: Omit<ConfirmAlertProps, "open" | "onOpenChange">,
  ) => void;
  confirmAlertDelete: (
    props: Omit<ConfirmAlertDeleteProps, "open" | "onOpenChange">,
  ) => void;
  removeAlert: (id: AlertId) => void;
  handleOpenChange: (id: AlertId, open: boolean) => void;
}

export interface AlertProviderProps {
  children: ReactNode;
}
