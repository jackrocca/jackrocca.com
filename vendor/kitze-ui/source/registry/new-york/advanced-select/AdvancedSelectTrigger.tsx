"use client";

import { ChevronDown, XIcon } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import * as React from "react";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type {
  AdvancedSelectOption,
  AdvancedSelectVariant,
} from "@/registry/new-york/advanced-select/AdvancedSelectTypes";
import {
  advancedSelectVariants,
  badgeAnimationVariants,
} from "@/registry/new-york/advanced-select/AdvancedSelectVariants";

const AdvancedSelectBadgeItem = ({
  onMiddleClick,
  onRemove,
  option,
  value,
  variant,
}: {
  onMiddleClick: (
    value: string,
    event: React.MouseEvent<HTMLDivElement>
  ) => void;
  onRemove: (value: string) => void;
  option?: AdvancedSelectOption | undefined;
  value: string;
  variant: AdvancedSelectVariant;
}) => {
  const IconComponent = option?.icon;

  return (
    <motion.div
      variants={badgeAnimationVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      layout
      onMouseDown={(event) => onMiddleClick(value, event)}
    >
      <Badge
        className={cn(advancedSelectVariants({ variant }))}
        data-slot="advanced-select-badge"
      >
        {IconComponent && <IconComponent className="mr-2 h-4 w-4" />}
        {option?.emoji && <span className="mr-2">{option.emoji}</span>}
        {option?.label || option?.value || value}
        <XIcon
          className="ml-2 h-3 w-3 cursor-pointer opacity-70 hover:opacity-100"
          onClick={(event) => {
            event.stopPropagation();
            onRemove(value);
          }}
        />
      </Badge>
    </motion.div>
  );
};

const AdvancedSelectBadgeList = ({
  maxCount,
  onClearExtra,
  onMiddleClick,
  onRemove,
  optionsByValue,
  selectedValues,
  variant,
}: {
  maxCount: number;
  onClearExtra: () => void;
  onMiddleClick: (
    value: string,
    event: React.MouseEvent<HTMLDivElement>
  ) => void;
  onRemove: (value: string) => void;
  optionsByValue: Map<string, AdvancedSelectOption>;
  selectedValues: string[];
  variant: AdvancedSelectVariant;
}) => (
  <div className="flex w-full flex-wrap items-center gap-1">
    <AnimatePresence>
      {selectedValues.slice(0, maxCount).map((value) => (
        <AdvancedSelectBadgeItem
          key={value}
          onMiddleClick={onMiddleClick}
          onRemove={onRemove}
          option={optionsByValue.get(value)}
          value={value}
          variant={variant}
        />
      ))}
    </AnimatePresence>
    {selectedValues.length > maxCount && (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <Badge variant="outline" className="ml-1" onClick={onClearExtra}>
          +{selectedValues.length - maxCount} more
        </Badge>
      </motion.div>
    )}
  </div>
);

export const AdvancedSelectTriggerContent = ({
  LeftIcon,
  loading,
  maxCount,
  onClearExtra,
  onMiddleClick,
  onRemove,
  optionsByValue,
  placeholder,
  selectedValues,
  variant,
}: {
  LeftIcon?: React.ElementType | undefined;
  loading: boolean;
  maxCount: number;
  onClearExtra: () => void;
  onMiddleClick: (
    value: string,
    event: React.MouseEvent<HTMLDivElement>
  ) => void;
  onRemove: (value: string) => void;
  optionsByValue: Map<string, AdvancedSelectOption>;
  placeholder: string;
  selectedValues: string[];
  variant: AdvancedSelectVariant;
}) => {
  if (loading) {
    return (
      <div className="flex items-center">
        <div className="border-primary mr-2 h-4 w-4 animate-spin rounded-full border-2 border-t-transparent" />
        <span className="text-muted-foreground">Loading...</span>
      </div>
    );
  }

  return (
    <>
      {LeftIcon && (
        <LeftIcon className="text-muted-foreground mr-2 h-4 w-4 shrink-0" />
      )}
      {selectedValues.length > 0 ? (
        <AdvancedSelectBadgeList
          maxCount={maxCount}
          onClearExtra={onClearExtra}
          onMiddleClick={onMiddleClick}
          onRemove={onRemove}
          optionsByValue={optionsByValue}
          selectedValues={selectedValues}
          variant={variant}
        />
      ) : (
        <div className="text-muted-foreground truncate px-2">{placeholder}</div>
      )}
    </>
  );
};

export const AdvancedSelectTriggerIcon = ({
  RightIcon,
}: {
  RightIcon?: React.ElementType | undefined;
}) =>
  RightIcon ? (
    <RightIcon className="text-foreground h-5 w-5" />
  ) : (
    <ChevronDown className="h-4 w-4 opacity-50" />
  );
