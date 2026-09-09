"use client";

import { useState } from "react";

import { DemoNote, DemoRow, DemoSection } from "@/components/ui-library/demo";
import { useConfirmAlert, useConfirmAlertDelete } from "@/ui/components/AlertContext";
import { CustomButton } from "@/ui/components/CustomButton";

export function UiAlertDemo() {
  const confirm = useConfirmAlert();
  const confirmDelete = useConfirmAlertDelete();
  const [status, setStatus] = useState("No action yet");

  return (
    <>
      <DemoSection title="Confirm">
        <CustomButton
          onClick={() =>
            confirm({
              title: "Lock Week 3?",
              description: "Picks cannot change after the first Sunday kickoff.",
              confirmLabel: "Lock picks",
              onConfirm: () => setStatus("Week 3 locked"),
            })
          }
        >
          Lock Week 3
        </CustomButton>
      </DemoSection>
      <DemoSection title="Delete">
        <DemoRow>
          <CustomButton
            color="rose-600"
            onClick={() =>
              confirmDelete({
                itemName: "Week 3 pick",
                onConfirm: () => setStatus("Week 3 pick deleted"),
              })
            }
          >
            Delete pick
          </CustomButton>
          <CustomButton
            color="rose-600"
            variant="outline"
            onClick={() =>
              confirmDelete({
                title: "Delete season pot?",
                itemName: "Season pot",
                confirmationText: "DELETE",
                onConfirm: () => setStatus("Season pot deleted"),
              })
            }
          >
            Delete pot
          </CustomButton>
        </DemoRow>
        <DemoNote>The pot requires typing DELETE. Last action: {status}</DemoNote>
      </DemoSection>
    </>
  );
}
