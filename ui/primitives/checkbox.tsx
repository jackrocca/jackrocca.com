"use client";

import { Checkbox as CheckboxPrimitive } from "@base-ui/react/checkbox";
import { CheckIcon, MinusIcon } from "lucide-react";

import { cn } from "@/ui/lib/utils";

const Checkbox = ({
  className,
  indeterminate,
  ...props
}: CheckboxPrimitive.Root.Props) => (
  <CheckboxPrimitive.Root
    data-slot="checkbox"
    indeterminate={indeterminate}
    className={cn(
      "peer border-muted-foreground/40 text-primary-foreground data-checked:border-primary data-checked:bg-primary data-indeterminate:border-primary data-indeterminate:bg-primary focus-visible:ring-ring aria-invalid:border-destructive relative flex size-5 shrink-0 cursor-pointer items-center justify-center rounded-md border-2 bg-transparent transition-[background-color,border-color] duration-150 outline-none focus-visible:ring-2 focus-visible:ring-offset-2 data-disabled:cursor-not-allowed data-disabled:opacity-40 motion-reduce:transition-none",
      className,
    )}
    {...props}
  >
    <CheckboxPrimitive.Indicator
      data-slot="checkbox-indicator"
      keepMounted
      className="flex items-center justify-center text-current transition-[opacity,scale] duration-150 data-unchecked:scale-50 data-unchecked:opacity-0 motion-reduce:transition-none"
    >
      {indeterminate ? (
        <MinusIcon className="size-3.5" strokeWidth={3} />
      ) : (
        <CheckIcon className="size-3.5" strokeWidth={3} />
      )}
    </CheckboxPrimitive.Indicator>
  </CheckboxPrimitive.Root>
);
export { Checkbox };
