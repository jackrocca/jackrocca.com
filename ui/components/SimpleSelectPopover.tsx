import { Check } from "lucide-react";
import * as React from "react";

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/ui/primitives/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/ui/primitives/popover";
import type { SelectOption } from "@/ui/lib/types";
import { cn } from "@/ui/lib/utils";

export const SimpleSelectPopover = ({
  className,
  listId,
  onOpenChange,
  onValueChange,
  open,
  options,
  searchPlaceholder,
  triggerButton,
  value,
  withSearch,
}: {
  className?: string | undefined;
  listId: string;
  onOpenChange: (open: boolean) => void;
  onValueChange?: ((value: string) => void) | undefined;
  open: boolean;
  options: SelectOption[];
  searchPlaceholder: string;
  triggerButton: React.ReactElement;
  value?: string | undefined;
  withSearch: boolean;
}) => (
  <Popover open={open} onOpenChange={onOpenChange}>
    <PopoverTrigger render={triggerButton} />
    <PopoverContent
      className={cn("w-[var(--anchor-width)] p-0", className)}
      style={{
        minWidth: "var(--anchor-width)",
      }}
    >
      <Command>
        {withSearch && <CommandInput placeholder={searchPlaceholder} />}
        <CommandList id={listId}>
          <CommandEmpty>No options found.</CommandEmpty>
          <CommandGroup>
            {options.map((option) => (
              <CommandItem
                key={option.value}
                value={option.value}
                disabled={option.disabled}
                keywords={[option.label ?? option.value]}
                onSelect={(currentValue) => {
                  onValueChange?.(currentValue);
                  onOpenChange(false);
                }}
              >
                <Check
                  className={cn(
                    "size-4",
                    value === option.value ? "opacity-100" : "opacity-0",
                  )}
                />
                {option.icon &&
                  React.createElement(option.icon, {
                    className: "size-4",
                  })}
                {option.emoji && <span>{option.emoji}</span>}
                {option.label}
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </Command>
    </PopoverContent>
  </Popover>
);
