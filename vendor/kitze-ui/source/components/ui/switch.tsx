"use client";

import { Switch as SwitchPrimitive } from "@base-ui/react/switch";

import { cn } from "@/lib/utils";

const Switch = ({ className, ...props }: SwitchPrimitive.Root.Props) => (
  <SwitchPrimitive.Root
    data-slot="switch"
    className={cn(
      "peer group bg-muted-foreground/25 data-checked:bg-primary focus-visible:ring-ring relative inline-flex h-6 w-10 shrink-0 cursor-pointer items-center rounded-full border-0 p-[3px] transition-colors duration-200 outline-none focus-visible:ring-2 focus-visible:ring-offset-2 data-disabled:cursor-not-allowed data-disabled:opacity-40 motion-reduce:transition-none",
      className
    )}
    {...props}
  >
    <SwitchPrimitive.Thumb
      data-slot="switch-thumb"
      className="data-checked:bg-primary-foreground pointer-events-none block size-[18px] rounded-full bg-white shadow-sm transition-transform duration-200 ease-[cubic-bezier(.2,.8,.2,1)] data-checked:translate-x-4 data-unchecked:translate-x-0 motion-reduce:transition-none"
    />
  </SwitchPrimitive.Root>
);
export { Switch };
