"use client";

import React, { useCallback, useContext, useMemo, useReducer } from "react";

import {
  alertReducer,
  generateId,
  initialState,
} from "@/ui/components/AlertContextState";
import { AlertContext } from "@/ui/components/AlertContextStore";
import type * as AlertContextTypesModule from "@/ui/components/AlertContextTypes";
import * as AlertRendererModule from "@/ui/components/AlertRenderer";
import type { ConfirmAlertProps } from "@/ui/components/ConfirmAlert";
import type { ConfirmAlertDeleteProps } from "@/ui/components/ConfirmAlertDelete";

export const { AlertRenderer } = AlertRendererModule;
export type AlertData = AlertContextTypesModule.AlertData;
export type AlertId = AlertContextTypesModule.AlertId;
export type AlertProviderProps = AlertContextTypesModule.AlertProviderProps;
export type AlertType = AlertContextTypesModule.AlertType;
export type BaseAlert = AlertContextTypesModule.BaseAlert;
export type ConfirmAlertData = AlertContextTypesModule.ConfirmAlertData;
export type DeleteAlertData = AlertContextTypesModule.DeleteAlertData;

export const AlertProvider: React.FC<AlertProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(alertReducer, initialState);

  const handleOpenChange = useCallback((id: AlertId, open: boolean) => {
    dispatch({ payload: { id, open }, type: "SET_ALERT_OPEN" });
  }, []);
  const removeAlert = useCallback((id: AlertId) => {
    dispatch({ payload: { id }, type: "REMOVE_ALERT" });
  }, []);

  const confirmAlert = useCallback(
    (props: Omit<ConfirmAlertProps, "open" | "onOpenChange">) => {
      const id = generateId();
      dispatch({
        payload: { id, open: true, props, type: "confirm" },
        type: "ADD_ALERT",
      });
    },
    [],
  );

  const confirmAlertDelete = useCallback(
    (props: Omit<ConfirmAlertDeleteProps, "open" | "onOpenChange">) => {
      const id = generateId();
      dispatch({
        payload: { id, open: true, props, type: "delete" },
        type: "ADD_ALERT",
      });
    },
    [],
  );

  const value = useMemo(
    () => ({
      alerts: state.alerts,
      confirmAlert,
      confirmAlertDelete,
      handleOpenChange,
      removeAlert,
    }),
    [confirmAlert, confirmAlertDelete, handleOpenChange, removeAlert, state.alerts],
  );

  return (
    <AlertContext.Provider value={value}>
      {children}
      <AlertRenderer />
    </AlertContext.Provider>
  );
};

export const useAlerts = () => {
  const context = useContext(AlertContext);

  if (context === undefined) {
    throw new Error("useAlerts must be used within an AlertProvider");
  }

  return context;
};

export const useConfirmAlert = () => {
  const { confirmAlert } = useAlerts();
  return confirmAlert;
};

export const useConfirmAlertDelete = () => {
  const { confirmAlertDelete } = useAlerts();
  return confirmAlertDelete;
};
