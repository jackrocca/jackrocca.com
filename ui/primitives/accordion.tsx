import { Accordion as AccordionPrimitive } from "@base-ui/react/accordion";
import { ChevronDown } from "lucide-react";

import { cn } from "@/ui/lib/utils";

const Accordion = AccordionPrimitive.Root;
const AccordionItem = ({ className, ...props }: AccordionPrimitive.Item.Props) => (
  <AccordionPrimitive.Item className={cn("border-b", className)} {...props} />
);
const AccordionTrigger = ({
  className,
  children,
  ...props
}: AccordionPrimitive.Trigger.Props) => (
  <AccordionPrimitive.Header className="flex">
    <AccordionPrimitive.Trigger
      className={cn(
        "hover:text-muted-foreground flex flex-1 cursor-pointer items-center justify-between py-4 font-medium transition-colors focus-visible:outline-2 [&[data-panel-open]>svg]:rotate-180",
        className,
      )}
      {...props}
    >
      {children}
      <ChevronDown className="h-4 w-4 shrink-0 transition-transform duration-200 motion-reduce:transition-none" />
    </AccordionPrimitive.Trigger>
  </AccordionPrimitive.Header>
);
const AccordionContent = ({
  className,
  children,
  ...props
}: AccordionPrimitive.Panel.Props) => (
  <AccordionPrimitive.Panel
    className="h-(--accordion-panel-height) overflow-hidden text-sm transition-[height,opacity] duration-200 data-ending-style:h-0 data-ending-style:opacity-0 data-starting-style:h-0 data-starting-style:opacity-0 motion-reduce:transition-none"
    {...props}
  >
    <div className={cn("pb-4", className)}>{children}</div>
  </AccordionPrimitive.Panel>
);
export { Accordion, AccordionItem, AccordionTrigger, AccordionContent };
