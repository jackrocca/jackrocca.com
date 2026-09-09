"use client";

import { DemoSection } from "@/components/ui-library/demo";
import { SimpleAccordion } from "@/ui/components/SimpleAccordion";

export function SimpleAccordionDemo() {
  return (
    <>
      <DemoSection title="FAQ">
        <SimpleAccordion
          items={[
            {
              title: "How do Pick 4 picks lock?",
              content:
                "Each week locks at the first Sunday kickoff. After that, the four teams cannot change.",
            },
            {
              title: "What is the season pot?",
              content:
                "Everyone chips in at the start. The best record after Week 18 takes the pot.",
            },
            {
              title: "Where do new photos land?",
              content:
                "New frames go under Photography first, then into a project when a set is ready.",
            },
          ]}
        />
      </DemoSection>
      <DemoSection title="Settings">
        <SimpleAccordion
          items={[
            {
              title: "Desktop preview",
              content: "Dialogs stay centered. Selects open as popovers.",
            },
            {
              title: "Mobile preview",
              content:
                "The same triggers open bottom drawers when the preview is set to Mobile.",
            },
          ]}
        />
      </DemoSection>
    </>
  );
}
