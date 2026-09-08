"use client";
import { Search } from "lucide-react";
import React, { useLayoutEffect, useRef, useState } from "react";

import { cn } from "@/lib/utils";
import { SearchBar } from "@/registry/new-york/search-bar/SearchBar";

interface WithSearchProps {
  children?: React.ReactNode | undefined;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string | undefined;
}
export const WithSearchBar = ({
  children,
  value,
  onChange,
  placeholder,
}: WithSearchProps) => {
  const [isSearching, setIsSearching] = useState(false);
  const trigger = useRef<HTMLButtonElement>(null);
  const restoreFocus = useRef(false);
  useLayoutEffect(() => {
    if (!isSearching && restoreFocus.current) {
      restoreFocus.current = false;
      trigger.current?.focus();
    }
  }, [isSearching]);
  const close = () => {
    restoreFocus.current = true;
    setIsSearching(false);
  };
  return (
    <div className="relative grid min-h-10 items-center">
      <div
        inert={isSearching}
        className={cn(
          "col-start-1 row-start-1 flex min-h-10 items-center justify-between gap-2 transition-opacity duration-150 motion-reduce:transition-none",
          isSearching && "pointer-events-none opacity-0"
        )}
      >
        {children}
        <button
          ref={trigger}
          type="button"
          onClick={() => setIsSearching(true)}
          className="text-muted-foreground hover:bg-muted hover:text-foreground flex size-10 cursor-pointer items-center justify-center rounded-lg focus-visible:outline-2"
          aria-label="Open search"
        >
          <Search className="size-4" />
        </button>
      </div>
      {isSearching && (
        <div className="absolute inset-x-0">
          <SearchBar
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            onClose={() => {
              if (!value) {
                setIsSearching(false);
              }
            }}
            onForceClose={close}
            autoFocus
          />
        </div>
      )}
    </div>
  );
};
