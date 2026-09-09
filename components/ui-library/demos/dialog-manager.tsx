"use client";

import { useId, useState } from "react";

import { DemoNote, DemoRow, DemoSection } from "@/components/ui-library/demo";
import { CustomButton } from "@/ui/components/CustomButton";
import { useDialog } from "@/ui/components/DialogManager";
import { Input } from "@/ui/components/Input";

function InviteBody({ close }: { close?: () => void }) {
  const fieldId = useId();
  const [name, setName] = useState("");

  return (
    <div className="grid gap-3">
      <div className="grid gap-2">
        <label htmlFor={fieldId}>Invite to Pick 4</label>
        <Input
          id={fieldId}
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="Player name"
        />
      </div>
      <CustomButton type="button" variant="outline" onClick={() => close?.()}>
        Dismiss
      </CustomButton>
    </div>
  );
}

function WeekNote({ week }: { week: string; close?: () => void }) {
  return <p>Lock {week} before the first Sunday kickoff or the picks stay a draft.</p>;
}

export function DialogManagerDemo() {
  const { openDialog } = useDialog();
  const [status, setStatus] = useState("No dialog yet");

  return (
    <>
      <DemoSection title="Open">
        <DemoRow>
          <CustomButton
            onClick={() =>
              openDialog({
                title: "Invite player",
                component: InviteBody,
                submitText: "Send invite",
                onSubmit: () => setStatus("Invite sent"),
              })
            }
          >
            Invite to league
          </CustomButton>
          <CustomButton
            variant="outline"
            onClick={() =>
              openDialog({
                title: "Week 3 note",
                component: WeekNote,
                props: { week: "Week 3" },
                showCancel: true,
                cancelText: "Close",
              })
            }
          >
            Week note
          </CustomButton>
        </DemoRow>
        <DemoNote>
          Switch the preview to Mobile to see the drawer. Dialogs stay mounted through the
          close transition.
        </DemoNote>
      </DemoSection>
      <DemoSection title="Status">
        <DemoNote>{status}</DemoNote>
      </DemoSection>
    </>
  );
}
