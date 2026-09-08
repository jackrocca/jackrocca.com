"use client";

import * as React from "react";

import type { SelectOption } from "@/lib/types";
import { cn } from "@/lib/utils";
import { BottomDrawerMenu } from "@/registry/new-york/bottom-drawer/BottomDrawerMenu";
import { BottomDrawerMenuItem } from "@/registry/new-york/bottom-drawer/BottomDrawerMenuItem";
import { SearchBar } from "@/registry/new-york/search-bar/SearchBar";

export interface ResponsiveSelectBottomDrawerMenuProps {
  options: SelectOption[];
  value?: string | undefined;
  onValueChange?: ((value: string) => void) | undefined;
  placeholder?: string | undefined;
  drawerTitle?: string | undefined;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  searchPlaceholder?: string | undefined;
  showSearch?: boolean | undefined;
  triggerClassName?: string | undefined;
  className?: string | undefined;
  disabled?: boolean | undefined;
  children?: React.ReactNode | undefined;
}
export const ResponsiveSelectBottomDrawerMenu = ({
  options,
  value,
  onValueChange,
  placeholder = "Select an option",
  drawerTitle = "Select an option",
  open,
  onOpenChange,
  searchPlaceholder = "Search options...",
  showSearch = false,
  triggerClassName,
  className,
  disabled,
  children,
}: ResponsiveSelectBottomDrawerMenuProps) => {
  const [searchQuery, setSearchQuery] = React.useState("");

  // Filter options based on search query
  const filteredOptions = React.useMemo(() => {
    if (!showSearch || !searchQuery.trim()) {
      return options;
    }
    const lowercaseQuery = searchQuery.toLowerCase();
    return options.filter((option) => {
      const label = (option.label || option.value).toLowerCase();
      return label.includes(lowercaseQuery);
    });
  }, [options, searchQuery, showSearch]);
  const trigger = children ? (
    <div
      className={cn(
        disabled && "pointer-events-none opacity-50",
        triggerClassName,
        className
      )}
      aria-disabled={disabled || undefined}
      aria-label={placeholder}
    >
      {children}
    </div>
  ) : (
    <button
      type="button"
      aria-label={placeholder}
      className={cn(
        "border-input bg-background flex h-10 w-full items-center justify-between rounded-md border px-3 py-2 text-sm",
        "disabled:cursor-not-allowed disabled:opacity-50",
        triggerClassName,
        className
      )}
      disabled={disabled}
    >
      {placeholder}
    </button>
  );
  return (
    <BottomDrawerMenu
      title={drawerTitle}
      open={open}
      onOpenChange={onOpenChange}
      content={
        <div className="flex flex-col">
          {showSearch && (
            <div className="p-3">
              <SearchBar
                value={searchQuery}
                onChange={setSearchQuery}
                placeholder={searchPlaceholder}
                autoFocus
              />
            </div>
          )}
          {filteredOptions.length === 0 ? (
            <div className="text-muted-foreground px-3 py-4 text-center">
              No options found
            </div>
          ) : (
            filteredOptions.map((option) => (
              <BottomDrawerMenuItem
                key={option.value}
                leftIcon={option.icon}
                emoji={option.emoji}
                closeOnClick={option.closeOnClick}
                onClick={() => {
                  onValueChange?.(option.value);
                  onOpenChange(false);
                }}
                className={value === option.value ? "bg-muted" : ""}
              >
                {option.label || option.value}
              </BottomDrawerMenuItem>
            ))
          )}
        </div>
      }
    >
      {trigger}
    </BottomDrawerMenu>
  );
};
