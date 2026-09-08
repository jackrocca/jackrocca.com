import { ChevronsUpDown } from "lucide-react";
import * as React from "react";

import { Button } from "@/components/ui/button";
import type { SelectOption } from "@/lib/types";
import { cn } from "@/lib/utils";

export const SimpleSelectTrigger = ({
  className,
  disabled,
  isOpen,
  listId,
  onClick,
  placeholder,
  selectedOption,
  triggerClassName,
  value,
}: {
  className?: string | undefined;
  disabled?: boolean | undefined;
  isOpen: boolean;
  listId: string;
  onClick: () => void;
  placeholder: string;
  selectedOption?: SelectOption | undefined;
  triggerClassName?: string | undefined;
  value?: string | undefined;
}) => (
  <Button
    variant="outline"
    aria-haspopup="listbox"
    aria-expanded={isOpen}
    aria-controls={listId}
    className={cn("w-full justify-between", triggerClassName, className)}
    onClick={onClick}
    disabled={disabled}
  >
    {value && selectedOption ? (
      <span className="flex items-center truncate">
        {selectedOption.icon &&
          React.createElement(selectedOption.icon, {
            className: "mr-2 h-4 w-4",
          })}
        {selectedOption.emoji && (
          <span className="mr-2">{selectedOption.emoji}</span>
        )}
        {selectedOption.label || selectedOption.value}
      </span>
    ) : (
      placeholder
    )}
    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
  </Button>
);
