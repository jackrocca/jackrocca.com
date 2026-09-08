import type React from "react";
import { tv } from "tailwind-variants";

export const segmentedControl = tv({
  base: "bg-muted inline-flex items-center justify-start rounded-md p-1",
  defaultVariants: {
    size: "md",
  },
  variants: {
    size: {
      lg: "h-12",
      md: "h-10",
      sm: "h-8",
    },
  },
});
export const segmentedItem = tv({
  base: "ring-offset-background focus-visible:ring-ring hover:bg-background/50 inline-flex cursor-pointer items-center justify-center rounded-sm whitespace-nowrap transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 motion-reduce:transition-none",
  defaultVariants: {
    active: false,
    size: "md",
  },
  variants: {
    active: {
      false: "",
      true: "bg-background text-foreground hover:bg-background shadow-sm",
    },
    size: {
      lg: "px-4 py-2 text-base",
      md: "px-3 py-1.5 text-sm",
      sm: "px-2 py-1 text-xs",
    },
  },
});
export const iconSize = {
  lg: "h-5 w-5",
  md: "h-4 w-4",
  sm: "h-3 w-3",
};
export const handleSegmentKey = (
  event: React.KeyboardEvent<HTMLButtonElement>,
) => {
  if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) {
    return;
  }
  const parent = event.currentTarget.closest('[role="tablist"]');
  if (!parent) {
    return;
  }
  const buttons = [
    ...parent.querySelectorAll<HTMLButtonElement>(
      'button[role="tab"]:not(:disabled)',
    ),
  ];
  const index = buttons.indexOf(event.currentTarget);
  const direction = getComputedStyle(parent).direction === "rtl" ? -1 : 1;
  let nextIndex =
    (index +
      (event.key === "ArrowRight" ? direction : -direction) +
      buttons.length) %
    buttons.length;
  if (event.key === "Home") {
    nextIndex = 0;
  }
  if (event.key === "End") {
    nextIndex = buttons.length - 1;
  }
  event.preventDefault();
  buttons[nextIndex]?.focus();
  buttons[nextIndex]?.click();
};
