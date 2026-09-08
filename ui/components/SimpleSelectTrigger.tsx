import { ChevronsUpDown } from "lucide-react";
import * as React from "react";

import { Button } from "@/ui/primitives/button";
import type { SelectOption } from "@/ui/lib/types";
import { cn } from "@/ui/lib/utils";

export const SimpleSelectTrigger = ({
  id,
  ariaLabel,
  className,
  disabled,
  isOpen,
  listId,
  onClick,
  placeholder,
  selectedOption,
  triggerClassName,
  value,
  ...buttonProps
}: Omit<React.ComponentProps<typeof Button>, "onClick"> & {
  id?: string;
  ariaLabel?: string;
  className?: string | undefined;
  disabled?: boolean | undefined;
  isOpen: boolean;
  listId: string;
  onClick?: (() => void) | undefined;
  placeholder: string;
  selectedOption?: SelectOption | undefined;
  triggerClassName?: string | undefined;
  value?: string | undefined;
}) => (
  <Button
    id={id}
    aria-label={ariaLabel}
    type="button"
    variant="outline"
    aria-haspopup="listbox"
    aria-expanded={isOpen}
    aria-controls={listId}
    className={cn("w-full justify-between", triggerClassName, className)}
    onClick={onClick}
    disabled={disabled}
    {...buttonProps}
  >
    {value && selectedOption ? (
      <span className="flex items-center truncate">
        {selectedOption.icon &&
          React.createElement(selectedOption.icon, {
            className: "mr-2 h-4 w-4",
          })}
        {selectedOption.emoji && <span className="mr-2">{selectedOption.emoji}</span>}
        {selectedOption.label || selectedOption.value}
      </span>
    ) : (
      placeholder
    )}
    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
  </Button>
);
