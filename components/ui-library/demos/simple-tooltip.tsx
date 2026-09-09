"use client";

import { DemoNote, DemoRow, DemoSection } from "@/components/ui-library/demo";
import { CustomButton } from "@/ui/components/CustomButton";
import { SimpleTooltip } from "@/ui/components/SimpleTooltip";

export function SimpleTooltipDemo() {
  return (
    <>
      <DemoSection title="Hover">
        <SimpleTooltip content="Picks lock at Sunday kickoff.">
          <CustomButton variant="outline">Week 3 lock</CustomButton>
        </SimpleTooltip>
      </DemoSection>
      <DemoSection title="Popover">
        <DemoRow>
          <SimpleTooltip
            content="The season pot is $40. Winner takes it after Week 18."
            mobileView="popover"
          >
            <CustomButton variant="outline">Season pot</CustomButton>
          </SimpleTooltip>
        </DemoRow>
        <DemoNote>
          Switch the preview to Mobile to see the popover instead of a hover tip.
        </DemoNote>
      </DemoSection>
      <DemoSection title="Drawer">
        <DemoRow>
          <SimpleTooltip
            content="Photography, Projects, and Pick 4 share this header pattern."
            mobileView="bottom-drawer"
            drawerTitle="Site sections"
          >
            <CustomButton>Why three sections?</CustomButton>
          </SimpleTooltip>
        </DemoRow>
        <DemoNote>Switch the preview to Mobile to see the drawer.</DemoNote>
      </DemoSection>
    </>
  );
}
