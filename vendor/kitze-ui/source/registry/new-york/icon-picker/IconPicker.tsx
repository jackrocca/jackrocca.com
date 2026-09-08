"use client";

import type { ReactNode } from "react";

import { Button } from "@/components/ui/button";
import type { IconPickerContentProps } from "@/registry/new-york/icon-picker/IconPickerContent";
import { IconPickerContent } from "@/registry/new-york/icon-picker/IconPickerContent";
import type { IconValue } from "@/registry/new-york/picked-icon/icon-types";
import { PickedIcon } from "@/registry/new-york/picked-icon/PickedIcon";
import { PickerPopover } from "@/registry/new-york/picker-popover/PickerPopover";

export interface IconPickerProps extends Omit<
  IconPickerContentProps,
  "onSelect"
> {
  onChange: (value: IconValue) => void;
  trigger?: ReactNode;
  disabled?: boolean;
  label?: string;
}
export const IconPicker = ({
  onChange,
  trigger,
  disabled,
  label = "Choose icon",
  ...props
}: IconPickerProps) => (
  <PickerPopover
    label={label}
    disabled={disabled}
    trigger={
      trigger ?? (
        <Button
          variant="outline"
          disabled={disabled}
          aria-label={label}
          className="size-10 cursor-pointer p-0 shadow-none"
        >
          <PickedIcon value={props.value ?? { name: "lucide:smile" }} />
        </Button>
      )
    }
  >
    {(close) => (
      <IconPickerContent
        {...props}
        onSelect={(value) => {
          onChange(value);
          close();
        }}
      />
    )}
  </PickerPopover>
);
