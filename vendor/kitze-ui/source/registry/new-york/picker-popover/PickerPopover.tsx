"use client";

import type { ReactNode } from "react";
import { useState } from "react";

import { SimplePopover } from "@/registry/new-york/simple-popover/index";

export interface PickerPopoverProps {
  label: string;
  trigger?: ReactNode;
  disabled?: boolean | undefined;
  children: (close: () => void) => ReactNode;
}
export const PickerPopover = ({
  label,
  trigger,
  disabled,
  children,
}: PickerPopoverProps) => {
  const [open, setOpen] = useState(false);
  const handleOpenChange = (next: boolean) => setOpen(next && !disabled);
  return (
    <SimplePopover
      trigger={trigger}
      open={open && !disabled}
      onOpenChange={handleOpenChange}
      align="start"
      mobileView="bottom-drawer"
      drawerTitle={label}
      classNames={{
        content:
          "max-h-[var(--available-height)] w-[352px] max-w-[calc(100vw-2rem)] overflow-x-hidden overflow-y-auto overscroll-contain rounded-2xl p-0 shadow-none",
      }}
      drawerProps={{
        classNames: {
          childrenWrapper:
            "px-3 [--picker-surface:white] dark:[--picker-surface:var(--color-zinc-900)]",
          content: "w-[calc(100%-2rem)] max-w-[400px] rounded-t-2xl",
        },
      }}
      content={
        <div
          aria-label={label}
          className="[&_.EmojiPickerReact_*]:font-[inherit] [&_button]:cursor-pointer"
        >
          {children(() => setOpen(false))}
        </div>
      }
    />
  );
};
