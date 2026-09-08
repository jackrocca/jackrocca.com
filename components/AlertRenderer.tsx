"use client";

import React, { useContext } from "react";

import { AlertContext } from "@/components/AlertContextStore";
import { ConfirmAlert } from "@/components/ConfirmAlert";
import { ConfirmAlertDelete } from "@/components/ConfirmAlertDelete";

const AlertRendererComponent = () => {
  const context = useContext(AlertContext);
  if (!context) {
    return null;
  }
  const { alerts, handleOpenChange, removeAlert } = context;
  if (alerts.length === 0) {
    return null;
  }
  return (
    <>
      {alerts.map((alert) => {
        const onOpenChange = (open: boolean) =>
          handleOpenChange(alert.id, open);
        if (alert.type === "confirm") {
          const { props } = alert;
          return (
            <ConfirmAlert
              key={alert.id}
              open={alert.open}
              onOpenChange={onOpenChange}
              {...props}
              onOpenChangeComplete={(open) => {
                if (!open) {
                  removeAlert(alert.id);
                }
              }}
            />
          );
        }
        if (alert.type === "delete") {
          const { props } = alert;
          return (
            <ConfirmAlertDelete
              key={alert.id}
              open={alert.open}
              onOpenChange={onOpenChange}
              {...props}
              onOpenChangeComplete={(open) => {
                if (!open) {
                  removeAlert(alert.id);
                }
              }}
            />
          );
        }
        return null;
      })}
    </>
  );
};
export const AlertRenderer = React.memo(AlertRendererComponent);
AlertRenderer.displayName = "AlertRenderer";
