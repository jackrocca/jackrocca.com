"use client";

import React from "react";
import type { FieldValues, UseFormReturn } from "react-hook-form";

import { cn } from "@/lib/utils";

interface FormDebugProps<T extends FieldValues> {
  form: UseFormReturn<T>;
  className?: string | undefined;
  /**
   * Show only when NODE_ENV is development or when forced
   */
  showInProduction?: boolean | undefined;
}
export const FormDebug = <T extends FieldValues>({
  form,
  className,
  showInProduction = false,
}: FormDebugProps<T>) => {
  // Don't render in production unless forced
  if (process.env.NODE_ENV === "production" && !showInProduction) {
    return null;
  }
  const { formState, watch } = form;
  const values = watch();
  const { errors, isValid, isDirty, isSubmitting, isSubmitted } = formState;
  return (
    <div
      className={cn(
        "bg-muted/40 vertical fixed bottom-4 left-4 w-[350px] rounded-lg border border-dashed p-4 font-mono text-xs",
        className
      )}
    >
      <div className="mb-2 flex items-center justify-between">
        <h3 className="font-semibold">Form Debug</h3>
        <div className="flex items-center gap-2">
          <span title="Is Valid" className="flex items-center gap-1">
            Valid: {isValid ? "✅" : "❌"}
          </span>
          <span title="Is Dirty" className="flex items-center gap-1">
            Changed: {isDirty ? "✅" : "❌"}
          </span>
          <span title="Is Submitting" className="flex items-center gap-1">
            Submitting: {isSubmitting ? "⏳" : "⏸️"}
          </span>
          <span title="Is Submitted" className="flex items-center gap-1">
            Submitted: {isSubmitted ? "✅" : "❌"}
          </span>
        </div>
      </div>

      <div className="vertical grid-cols-2 gap-4">
        <div>
          <h4 className="mb-1 font-semibold">Values</h4>
          <pre className="bg-muted max-h-96 overflow-auto rounded p-2">
            {JSON.stringify(values, null, 2)}
          </pre>
        </div>
        <div>
          <h4 className="mb-1 font-semibold">Errors</h4>
          <pre className="bg-muted max-h-96 overflow-auto rounded p-2">
            {Object.keys(errors).length
              ? JSON.stringify(errors, null, 2)
              : "No errors 🎉"}
          </pre>
        </div>
      </div>
    </div>
  );
};
