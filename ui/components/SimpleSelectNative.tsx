import { ChevronsUpDown } from "lucide-react";
import * as React from "react";

import type { SelectOption } from "@/ui/lib/types";
import { cn } from "@/ui/lib/utils";

export const SimpleSelectNative = ({
  className,
  disabled,
  onValueChange,
  options,
  placeholder,
  selectedOption,
  triggerClassName,
  value,
}: {
  className?: string | undefined;
  disabled?: boolean | undefined;
  onValueChange?: ((value: string) => void) | undefined;
  options: SelectOption[];
  placeholder: string;
  selectedOption?: SelectOption | undefined;
  triggerClassName?: string | undefined;
  value?: string | undefined;
}) => (
  <div className={cn("relative w-full", className)}>
    <div
      className={cn(
        "border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-within:ring-ring flex h-10 w-full items-center justify-between rounded-md border px-3 py-2 text-sm focus-within:ring-2 focus-within:ring-offset-2 focus-within:outline-none disabled:cursor-not-allowed disabled:opacity-50",
        triggerClassName,
        disabled && "cursor-not-allowed opacity-50",
      )}
      aria-disabled={disabled}
    >
      <span className="flex-grow truncate">
        {selectedOption?.icon &&
          React.createElement(selectedOption.icon, {
            className: "mr-2 h-4 w-4 inline",
          })}
        {selectedOption?.emoji && <span className="mr-2">{selectedOption.emoji}</span>}
        {value && selectedOption ? selectedOption.label || value : placeholder}
      </span>
      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
    </div>
    <select
      value={value || ""}
      onChange={(event) => onValueChange?.(event.target.value)}
      disabled={disabled}
      className="absolute inset-0 z-10 h-full w-full cursor-pointer opacity-0"
    >
      {placeholder && (
        <option value="" disabled hidden>
          {placeholder}
        </option>
      )}
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label || option.value}
        </option>
      ))}
    </select>
  </div>
);
