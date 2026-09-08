"use client";

import { createContext } from "react";

import type { AlertContextValue } from "@/ui/components/AlertContextTypes";

export const AlertContext = createContext<AlertContextValue | undefined>(undefined);
