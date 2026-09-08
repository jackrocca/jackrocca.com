"use client";

import type { ReactNode } from "react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { EmojiPickerContent } from "@/registry/new-york/emoji-picker/EmojiPickerContent";
import type { IconPickerContentProps } from "@/registry/new-york/icon-picker/IconPickerContent";
import { IconPickerContent } from "@/registry/new-york/icon-picker/IconPickerContent";
import type { IconValue } from "@/registry/new-york/picked-icon/icon-types";
import { PickedIcon } from "@/registry/new-york/picked-icon/PickedIcon";
import { PickerPopover } from "@/registry/new-york/picker-popover/PickerPopover";
import { SegmentedControl } from "@/registry/new-york/segmented-control/SegmentedControl";

export type EmojiIconValue =
  | { type: "emoji"; emoji: string }
  | { type: "icon"; icon: IconValue };
export interface EmojiIconPickerProps extends Omit<
  IconPickerContentProps,
  "value" | "onSelect"
> {
  value?: EmojiIconValue;
  onChange: (value: EmojiIconValue) => void;
  trigger?: ReactNode;
  disabled?: boolean;
  label?: string;
  theme?: "light" | "dark" | "auto";
}
const CombinedContent = ({
  value,
  onChange,
  theme,
  ...props
}: Omit<EmojiIconPickerProps, "trigger" | "disabled" | "label">) => {
  const [tab, setTab] = useState(value?.type ?? "emoji");
  return (
    <div>
      <div className="p-3 pb-0">
        <SegmentedControl
          options={[
            { label: "Emoji", value: "emoji" },
            { label: "Icons", value: "icon" },
          ]}
          value={tab}
          onChange={(next) => {
            if (next === "emoji" || next === "icon") {
              setTab(next);
            }
          }}
          className="w-full"
          tabClassName="flex-1"
        />
      </div>
      {tab === "emoji" ? (
        <EmojiPickerContent
          theme={theme}
          onSelect={(emoji) => onChange({ emoji, type: "emoji" })}
        />
      ) : (
        <IconPickerContent
          {...props}
          value={value?.type === "icon" ? value.icon : undefined}
          onSelect={(icon) => onChange({ icon, type: "icon" })}
        />
      )}
    </div>
  );
};
export const EmojiIconPicker = ({
  trigger,
  disabled,
  label = "Choose emoji or icon",
  ...props
}: EmojiIconPickerProps) => (
  <PickerPopover
    label={label}
    disabled={disabled}
    trigger={
      trigger ?? (
        <Button
          variant="outline"
          disabled={disabled}
          aria-label={label}
          className="size-10 cursor-pointer p-0 text-xl shadow-none"
        >
          {props.value?.type === "icon" ? (
            <PickedIcon value={props.value.icon} />
          ) : (
            props.value?.emoji || "😀"
          )}
        </Button>
      )
    }
  >
    {(close) => (
      <CombinedContent
        {...props}
        onChange={(value) => {
          props.onChange(value);
          close();
        }}
      />
    )}
  </PickerPopover>
);
