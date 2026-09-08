"use client";

import { createContext } from "react";

import type { AlertContextValue } from "@/registry/new-york/ui-alert/AlertContextTypes";

export const AlertContext = createContext<AlertContextValue | undefined>(
  undefined
);
