"use client";

import { useState } from "react";

import { DemoNote, DemoRow, DemoSection } from "@/components/ui-library/demo";
import { ConditionalTooltip } from "@/ui/components/ConditionalTooltip";
import { CustomButton } from "@/ui/components/CustomButton";

export function ConditionalTooltipDemo() {
  const [locked, setLocked] = useState(true);

  return (
    <>
      <DemoSection title="Condition">
        <DemoRow>
          <ConditionalTooltip
            condition={locked}
            content="Week 3 is locked. Picks cannot change after kickoff."
          >
            <CustomButton disabled={locked}>Edit picks</CustomButton>
          </ConditionalTooltip>
          <CustomButton variant="outline" onClick={() => setLocked((value) => !value)}>
            {locked ? "Unlock" : "Lock"}
          </CustomButton>
        </DemoRow>
        <DemoNote>
          The same trigger stays mounted. The tooltip wraps it only while the week is
          locked.
        </DemoNote>
      </DemoSection>
      <DemoSection title="No content">
        <ConditionalTooltip condition={true} content={undefined}>
          <CustomButton variant="ghost">Season pot</CustomButton>
        </ConditionalTooltip>
        <DemoNote>Without content, the child renders unchanged.</DemoNote>
      </DemoSection>
    </>
  );
}
