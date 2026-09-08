"use client";

import React from "react";

import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";

export interface LabeledCheckboxProps {
  id?: string;
  label: React.ReactNode;
  classNames?: { root?: string; checkbox?: string; label?: string };
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  disabled?: boolean;
  invert?: boolean;
  name?: string;
  value?: string;
  required?: boolean;
}

export const LabeledCheckbox: React.FC<LabeledCheckboxProps> = ({
  id,
  label,
  classNames,
  checked,
  onCheckedChange,
  disabled,
  invert = false,
  ...checkboxProps
}) => {
  const generatedId = React.useId();
  const checkboxId = id || `labeled-checkbox-${generatedId}`;
  return (
    <label
      htmlFor={checkboxId}
      className={cn(
        "flex items-center gap-2",
        !disabled && "cursor-pointer",
        classNames?.root
      )}
    >
      <Checkbox
        id={checkboxId}
        checked={checked}
        onCheckedChange={onCheckedChange}
        disabled={disabled}
        className={cn(invert && "order-last", classNames?.checkbox)}
        {...checkboxProps}
      />
      <span
        className={cn(
          "text-sm leading-none font-medium",
          disabled && "cursor-not-allowed opacity-70",
          classNames?.label
        )}
      >
        {label}
      </span>
    </label>
  );
};
