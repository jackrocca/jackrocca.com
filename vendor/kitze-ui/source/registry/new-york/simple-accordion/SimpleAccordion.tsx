import * as React from "react";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { cn } from "@/lib/utils";

export interface AccordionItemProps {
  title: React.ReactNode;
  content: React.ReactNode;
}
export interface AccordionClassNames {
  root?: string;
  item?: string;
  button?: string;
  title?: string;
  icon?: string;
  panel?: string;
  content?: string;
}
export interface AccordionProps {
  items: AccordionItemProps[];
  classNames?: AccordionClassNames;
}
export const SimpleAccordion = ({ items, classNames }: AccordionProps) => (
  <Accordion className={cn("w-full", classNames?.root)}>
    {items.map((item, index) => (
      <AccordionItem
        key={index}
        value={`item-${index}`}
        className={cn("border-b", classNames?.item)}
      >
        <AccordionTrigger
          className={cn(
            "flex flex-1 cursor-pointer items-center justify-between py-4 font-medium transition-colors [&[data-panel-open]>svg]:rotate-180",
            classNames?.button
          )}
        >
          <span className={classNames?.title}>{item.title}</span>
        </AccordionTrigger>
        <AccordionContent className={cn("text-sm", classNames?.panel)}>
          <div className={cn(classNames?.content)}>{item.content}</div>
        </AccordionContent>
      </AccordionItem>
    ))}
  </Accordion>
);
