"use client";
import { Radio } from "@base-ui/react/radio";
import { RadioGroup as RadioGroupPrimitive } from "@base-ui/react/radio-group";

import { cn } from "@/lib/utils";

const RadioGroup = ({ className, ...props }: RadioGroupPrimitive.Props) => (
  <RadioGroupPrimitive
    data-slot="radio-group"
    className={cn("grid gap-3", className)}
    {...props}
  />
);
const RadioGroupItem = ({ className, ...props }: Radio.Root.Props) => (
  <Radio.Root
    data-slot="radio-group-item"
    className={cn(
      "border-muted-foreground/40 data-checked:border-primary focus-visible:ring-ring flex size-5 shrink-0 cursor-pointer items-center justify-center rounded-full border-2 transition-colors duration-150 outline-none focus-visible:ring-2 focus-visible:ring-offset-2 data-disabled:cursor-not-allowed data-disabled:opacity-40 motion-reduce:transition-none",
      className
    )}
    {...props}
  >
    <Radio.Indicator
      keepMounted
      className="bg-primary size-2.5 rounded-full transition-[opacity,scale] duration-150 data-unchecked:scale-50 data-unchecked:opacity-0 motion-reduce:transition-none"
    />
  </Radio.Root>
);
export { RadioGroup, RadioGroupItem };
