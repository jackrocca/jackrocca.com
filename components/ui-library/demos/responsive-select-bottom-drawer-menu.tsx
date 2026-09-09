"use client";

import { useState } from "react";

import { DemoNote, DemoSection } from "@/components/ui-library/demo";
import { CustomButton } from "@/ui/components/CustomButton";
import { ResponsiveSelectBottomDrawerMenu } from "@/ui/components/ResponsiveSelectBottomDrawerMenu";

const sections = [
  { value: "photography", label: "Photography" },
  { value: "projects", label: "Projects" },
  { value: "pick4", label: "Pick 4" },
  { value: "week-3", label: "Week 3" },
  { value: "season-pot", label: "Season pot" },
];

export function ResponsiveSelectBottomDrawerMenuDemo() {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("photography");
  const selected = sections.find((option) => option.value === value);

  return (
    <>
      <DemoSection title="Controlled">
        <ResponsiveSelectBottomDrawerMenu
          options={sections}
          value={value}
          onValueChange={setValue}
          open={open}
          onOpenChange={setOpen}
          showSearch
          searchPlaceholder="Find a section…"
          drawerTitle="Choose a section"
        >
          <CustomButton variant="outline">
            {selected?.label ?? "Choose a section"}
          </CustomButton>
        </ResponsiveSelectBottomDrawerMenu>
        <DemoNote>
          Building block for SimpleSelect. Prefer SimpleSelect with
          mobileView=&quot;bottom-drawer&quot; unless you need this surface on its own.
        </DemoNote>
      </DemoSection>
      <DemoSection title="Selection">
        <DemoNote>Selected: {selected?.label}</DemoNote>
      </DemoSection>
    </>
  );
}
