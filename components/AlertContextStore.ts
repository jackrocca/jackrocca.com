"use client";

import { createContext } from "react";

import type { AlertContextValue } from "@/components/AlertContextTypes";

export const AlertContext = createContext<AlertContextValue | undefined>(
  undefined,
);
