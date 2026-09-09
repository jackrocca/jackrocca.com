"use client";

import { useId, useState } from "react";

import { DemoNote, DemoSection, DemoStack } from "@/components/ui-library/demo";
import { Checkbox } from "@/ui/primitives/checkbox";

export function CheckboxDemo() {
  const weekId = useId();
  const potId = useId();
  const allId = useId();
  const lockedId = useId();
  const [week, setWeek] = useState(true);
  const [pot, setPot] = useState(false);

  return (
    <>
      <DemoSection title="Labeled">
        <DemoStack>
          <div className="flex items-center gap-2">
            <Checkbox
              id={weekId}
              checked={week}
              onCheckedChange={(checked) => setWeek(checked === true)}
            />
            <label htmlFor={weekId}>Include Week 3</label>
          </div>
          <div className="flex items-center gap-2">
            <Checkbox
              id={potId}
              checked={pot}
              onCheckedChange={(checked) => setPot(checked === true)}
            />
            <label htmlFor={potId}>Chip in to the season pot</label>
          </div>
        </DemoStack>
      </DemoSection>
      <DemoSection title="Indeterminate">
        <div className="flex items-center gap-2">
          <Checkbox id={allId} indeterminate={week !== pot} checked={week && pot} />
          <label htmlFor={allId}>Both league options</label>
        </div>
        <DemoNote>
          Indeterminate while Week 3 and the pot disagree. This box is display-only.
        </DemoNote>
      </DemoSection>
      <DemoSection title="Disabled">
        <div className="flex items-center gap-2">
          <Checkbox id={lockedId} disabled checked />
          <label htmlFor={lockedId}>Picks already locked</label>
        </div>
      </DemoSection>
    </>
  );
}
