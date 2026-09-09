"use client";

import { useState } from "react";

import { DemoNote, DemoRow, DemoSection } from "@/components/ui-library/demo";
import { CustomButton } from "@/ui/components/CustomButton";
import { SimpleDialog } from "@/ui/components/SimpleDialog";

export function SimpleDialogDemo() {
  const [locked, setLocked] = useState(false);
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState("Unlocked");

  return (
    <>
      <DemoSection title="Basic">
        <SimpleDialog
          title="Week 3"
          trigger={<CustomButton variant="outline">Open week</CustomButton>}
        >
          Review your four picks before kickoff. Closing uses the X control.
        </SimpleDialog>
      </DemoSection>
      <DemoSection title="Submit">
        <DemoRow>
          <SimpleDialog
            title="Lock picks"
            trigger={<CustomButton>Lock Week 3</CustomButton>}
            submitText="Lock"
            cancelText="Keep editing"
            onSubmit={() => setLocked(true)}
            onCancel={() => setLocked(false)}
          >
            Once locked, Week 3 picks cannot change.
          </SimpleDialog>
        </DemoRow>
        <DemoNote>{locked ? "Week 3 is locked." : "Week 3 is still open."}</DemoNote>
      </DemoSection>
      <DemoSection title="Controlled">
        <DemoRow>
          <CustomButton variant="outline" onClick={() => setOpen(true)}>
            Review season pot
          </CustomButton>
          <SimpleDialog
            title="Season pot"
            open={open}
            onOpenChange={setOpen}
            submitText="Got it"
            onSubmit={() => setStatus("Reviewed")}
          >
            Eight players, $40 total. Winner takes the pot after Week 18.
          </SimpleDialog>
        </DemoRow>
        <DemoNote>{status}</DemoNote>
      </DemoSection>
    </>
  );
}
