"use client";

import { CheckIcon } from "lucide-react";
import { motion } from "motion/react";
import * as React from "react";

import { cn } from "@/lib/utils";
import type { AdvancedSelectOption } from "@/registry/new-york/advanced-select/AdvancedSelectTypes";
import { optionMatchesSearch } from "@/registry/new-york/advanced-select/AdvancedSelectUtils";
import { optionAnimationVariants } from "@/registry/new-york/advanced-select/AdvancedSelectVariants";

const AdvancedSelectCheckbox = ({ checked }: { checked: boolean }) => (
  <div
    className={cn(
      "border-primary mr-2 flex h-4 w-4 items-center justify-center rounded-sm border",
      checked
        ? "bg-primary text-primary-foreground"
        : "opacity-50 [&_svg]:invisible"
    )}
  >
    <CheckIcon className="h-4 w-4" />
  </div>
);
export const AdvancedSelectSelectAllOption = ({
  allSelected,
  onClick,
}: {
  allSelected: boolean;
  onClick: (event: React.MouseEvent) => void;
}) => (
  <motion.div
    variants={optionAnimationVariants}
    initial="hidden"
    animate="visible"
    custom={0}
    className="hover:bg-accent hover:text-accent-foreground relative flex cursor-pointer items-center rounded-sm px-2 py-1.5 text-sm select-none"
    onClick={onClick}
    data-select-all="true"
  >
    <AdvancedSelectCheckbox checked={allSelected} />
    <span>(Select All)</span>
  </motion.div>
);
export const AdvancedSelectOptionRow = ({
  index,
  onClick,
  onToggle,
  option,
  selected,
}: {
  index: number;
  onClick: (value: string, event: React.MouseEvent) => void;
  onToggle: (value: string) => void;
  option: AdvancedSelectOption;
  selected: boolean;
}) => {
  const IconComponent = option.icon;
  return (
    <motion.div
      variants={optionAnimationVariants}
      initial="hidden"
      animate="visible"
      custom={index + 1}
      className={cn(
        "relative flex cursor-pointer items-center rounded-sm px-2 py-1.5 text-sm transition-colors select-none",
        selected
          ? "bg-accent text-accent-foreground"
          : "hover:bg-accent hover:text-accent-foreground"
      )}
      onClick={(event) => onClick(option.value, event)}
      onMouseDown={(event) => {
        if (event.button === 1) {
          event.preventDefault();
          onToggle(option.value);
        }
      }}
    >
      <AdvancedSelectCheckbox checked={selected} />
      {IconComponent && (
        <IconComponent className="text-muted-foreground mr-2 h-4 w-4" />
      )}
      {option.emoji && <span className="mr-2">{option.emoji}</span>}
      <span>{option.label || option.value}</span>
    </motion.div>
  );
};
export const AdvancedSelectCreateSuggestion = ({
  filteredOptions,
  onCreate,
  searchQuery,
  searchable,
}: {
  filteredOptions: AdvancedSelectOption[];
  onCreate?: (() => void) | undefined;
  searchable: boolean;
  searchQuery: string;
}) => {
  const normalizedQuery = searchQuery.toLowerCase();
  const hasExactMatch = filteredOptions.some((option) =>
    optionMatchesSearch(option, normalizedQuery)
  );
  const showCreateSuggestion =
    searchable &&
    Boolean(onCreate) &&
    Boolean(searchQuery) &&
    filteredOptions.length > 0 &&
    !hasExactMatch;
  if (!(showCreateSuggestion && onCreate)) {
    return null;
  }
  return (
    <motion.div
      variants={optionAnimationVariants}
      initial="hidden"
      animate="visible"
      custom={filteredOptions.length + 1}
      className="hover:bg-accent hover:text-accent-foreground relative flex cursor-pointer items-center rounded-sm px-2 py-1.5 text-sm transition-colors select-none"
      onClick={onCreate}
    >
      <div className="mr-2 flex h-4 w-4 items-center justify-center rounded-sm">
        <span className="text-xl">+</span>
      </div>
      <span>Create &quot;{searchQuery}&quot;</span>
    </motion.div>
  );
};
