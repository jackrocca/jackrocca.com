"use client";

import { useState } from "react";
import { Camera, FolderKanban, Trophy } from "lucide-react";

import { DemoNote, DemoSection } from "@/components/ui-library/demo";
import { SegmentedControl } from "@/ui/components/SegmentedControl";

export function SegmentedControlDemo() {
  const [section, setSection] = useState("photography");
  const [view, setView] = useState("grid");
  const [mobile, setMobile] = useState("pick4");

  return (
    <>
      <DemoSection title="Text">
        <SegmentedControl
          value={section}
          onChange={setSection}
          options={[
            { value: "photography", label: "Photography" },
            { value: "projects", label: "Projects" },
            { value: "pick4", label: "Pick 4" },
          ]}
        />
      </DemoSection>
      <DemoSection title="With icons">
        <SegmentedControl
          value={view}
          onChange={setView}
          options={[
            { value: "grid", label: "Grid", icon: Camera, tooltip: "Frame grid" },
            { value: "sets", label: "Sets", icon: FolderKanban },
            {
              value: "league",
              label: "League",
              icon: Trophy,
              disabled: true,
              tooltip: "Opens after Week 1",
            },
          ]}
        />
      </DemoSection>
      <DemoSection title="Icon only">
        <SegmentedControl
          iconOnly
          value={section}
          onChange={setSection}
          options={[
            { value: "photography", label: "Photography", icon: Camera },
            { value: "projects", label: "Projects", icon: FolderKanban },
            { value: "pick4", label: "Pick 4", icon: Trophy },
          ]}
        />
      </DemoSection>
      <DemoSection title="Mobile">
        <SegmentedControl
          value={mobile}
          onChange={setMobile}
          mobileView="bottom-drawer"
          drawerTitle="Choose a section"
          options={[
            { value: "photography", label: "Photography" },
            { value: "projects", label: "Projects" },
            { value: "pick4", label: "Pick 4" },
          ]}
        />
        <DemoNote>
          Switch the preview to Mobile to see the drawer. Labels stay visible there.
        </DemoNote>
      </DemoSection>
    </>
  );
}
