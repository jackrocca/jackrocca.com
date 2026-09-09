"use client";

import { DemoNote, DemoSection, DemoStack } from "@/components/ui-library/demo";
import { HelpInfoCircle } from "@/ui/components/HelpInfoCircle";

export function HelpInfoCircleDemo() {
  return (
    <>
      <DemoSection title="Beside a label">
        <DemoStack>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Season pot</span>
            <HelpInfoCircle content="Everyone chips in at the start. Winner takes $40 after Week 18." />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Week 3 lock</span>
            <HelpInfoCircle
              content="Picks lock at the first Sunday kickoff."
              drawerTitle="Lock time"
            />
          </div>
        </DemoStack>
        <DemoNote>
          Switch the preview to Mobile to see the drawer. That is the default mobile view.
        </DemoNote>
      </DemoSection>
      <DemoSection title="Popover">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Photography sets</span>
          <HelpInfoCircle
            content="A set is a named group of frames, not a single photo."
            mobileView="popover"
            drawerTitle="Sets"
          />
        </div>
        <DemoNote>
          Switch the preview to Mobile to see a popover instead of a drawer.
        </DemoNote>
      </DemoSection>
    </>
  );
}
