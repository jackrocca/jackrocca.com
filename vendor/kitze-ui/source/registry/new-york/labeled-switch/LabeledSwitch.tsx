"use client";

import React from "react";

import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

export interface LabeledSwitchProps {
  id?: string;
  label: React.ReactNode;
  className?: string;
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  disabled?: boolean;
}
export const LabeledSwitch: React.FC<LabeledSwitchProps> = ({
  id,
  label,
  className,
  checked,
  onCheckedChange,
  disabled,
  ...switchProps
}) => {
  const generatedId = React.useId();
  const switchId = id || `labeled-switch-${generatedId}`;
  return (
    <div className={cn("flex min-h-8 items-center gap-3", className)}>
      <Switch
        id={switchId}
        checked={checked}
        onCheckedChange={onCheckedChange}
        disabled={disabled}
        {...switchProps}
      />
      <label
        htmlFor={switchId}
        className="cursor-pointer text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
      >
        {label}
      </label>
    </div>
  );
};
