"use client";

import { useState } from "react";

import { DemoNote, DemoRow, DemoSection } from "@/components/ui-library/demo";
import { CustomButton } from "@/ui/components/CustomButton";
import { ResponsiveDialog } from "@/ui/components/ResponsiveDialog";

export function ResponsiveDialogDemo() {
  const [saved, setSaved] = useState(false);

  return (
    <>
      <DemoSection title="Default">
        <ResponsiveDialog
          title="Week 3 picks"
          trigger={<CustomButton>Review picks</CustomButton>}
          submitText="Save"
          onSubmit={() => setSaved(true)}
        >
          Four teams, one week. Saving keeps them until kickoff.
        </ResponsiveDialog>
        <DemoNote>
          Switch the preview to Mobile to see the drawer. Desktop stays a centered dialog.
        </DemoNote>
      </DemoSection>
      <DemoSection title="Keep dialog">
        <DemoRow>
          <ResponsiveDialog
            title="Season rules"
            mobileView="keep"
            trigger={<CustomButton variant="outline">Always a dialog</CustomButton>}
          >
            mobileView=&quot;keep&quot; leaves this centered on both desktop and mobile.
          </ResponsiveDialog>
        </DemoRow>
      </DemoSection>
      <DemoSection title="Submit">
        <DemoNote>{saved ? "Week 3 picks saved." : "Picks are still a draft."}</DemoNote>
      </DemoSection>
    </>
  );
}
