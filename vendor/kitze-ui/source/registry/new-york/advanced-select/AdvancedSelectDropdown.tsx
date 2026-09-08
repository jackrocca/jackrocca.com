"use client";

import * as React from "react";

import { Command, CommandInput, CommandList } from "@/components/ui/command";
import {
  AdvancedSelectEmptyState,
  AdvancedSelectFooter,
  AdvancedSelectOptionsGroup,
} from "@/registry/new-york/advanced-select/AdvancedSelectDropdownParts";
import type { AdvancedSelectOption } from "@/registry/new-york/advanced-select/AdvancedSelectTypes";

export const AdvancedSelectDropdown = ({
  filteredOptions,
  handleClearClick,
  handleCloseClick,
  handleCreateOption,
  handleInputKeyDown,
  handleOptionClick,
  handleSearchChange,
  handleSelectAllClick,
  optionsLength,
  searchable,
  searchQuery,
  selectedValues,
  toggleOption,
}: {
  filteredOptions: AdvancedSelectOption[];
  handleClearClick: (event: React.MouseEvent) => void;
  handleCloseClick: (event: React.MouseEvent) => void;
  handleCreateOption: () => void;
  handleInputKeyDown: (event: React.KeyboardEvent<HTMLInputElement>) => void;
  handleOptionClick: (value: string, event: React.MouseEvent) => void;
  handleSearchChange: (value: string) => void;
  handleSelectAllClick: (event: React.MouseEvent) => void;
  optionsLength: number;
  searchable: boolean;
  searchQuery: string;
  selectedValues: string[];
  toggleOption: (value: string) => void;
}) => (
  <Command shouldFilter={false}>
    {searchable && (
      <CommandInput
        placeholder="Search..."
        onKeyDown={handleInputKeyDown}
        onValueChange={handleSearchChange}
        value={searchQuery}
        data-slot="advanced-select-search"
      />
    )}
    <CommandList className="max-h-[300px]">
      <AdvancedSelectEmptyState
        filteredOptions={filteredOptions}
        onCreate={handleCreateOption}
        searchable={searchable}
        searchQuery={searchQuery}
      />
      <AdvancedSelectOptionsGroup
        filteredOptions={filteredOptions}
        onCreate={handleCreateOption}
        onOptionClick={handleOptionClick}
        onSelectAll={handleSelectAllClick}
        onToggleOption={toggleOption}
        optionsLength={optionsLength}
        searchable={searchable}
        searchQuery={searchQuery}
        selectedValues={selectedValues}
      />
      <AdvancedSelectFooter
        hasSelection={selectedValues.length > 0}
        onClear={handleClearClick}
        onClose={handleCloseClick}
      />
    </CommandList>
  </Command>
);
