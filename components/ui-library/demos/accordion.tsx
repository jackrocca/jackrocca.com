"use client";

import { DemoSection } from "@/components/ui-library/demo";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/ui/primitives/accordion";

export function AccordionDemo() {
  return (
    <>
      <DemoSection title="Composition">
        <Accordion className="w-full">
          <AccordionItem value="photography">
            <AccordionTrigger>Photography</AccordionTrigger>
            <AccordionContent>
              New frames land here first, then move into a named set when the edit is
              ready.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="projects">
            <AccordionTrigger>Projects</AccordionTrigger>
            <AccordionContent>
              Longer builds — branding, this site, and the Pick 4 league tools.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="pick4">
            <AccordionTrigger>Pick 4</AccordionTrigger>
            <AccordionContent>
              Four teams each week. The season pot pays out after Week 18.
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </DemoSection>
    </>
  );
}
