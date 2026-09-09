"use client";

import { useId, useState } from "react";

import { DemoNote, DemoSection, DemoStack } from "@/components/ui-library/demo";
import { SimpleSelect } from "@/ui/components/SimpleSelect";

const sections = [
  { value: "photography", label: "Photography" },
  { value: "projects", label: "Projects" },
  { value: "pick4", label: "Pick 4" },
];

const weeks = [
  { value: "week-1", label: "Week 1" },
  { value: "week-2", label: "Week 2" },
  { value: "week-3", label: "Week 3" },
  { value: "week-4", label: "Week 4", disabled: true },
];

export function SimpleSelectDemo() {
  const fieldId = useId();
  const [section, setSection] = useState("photography");
  const [week, setWeek] = useState("week-3");
  const [native, setNative] = useState("projects");
  const [drawer, setDrawer] = useState("pick4");
  const [labeled, setLabeled] = useState("photography");

  return (
    <>
      <DemoSection title="Basic">
        <DemoStack>
          <SimpleSelect
            aria-label="Site section"
            options={sections}
            value={section}
            onValueChange={setSection}
            placeholder="Choose a section"
          />
        </DemoStack>
      </DemoSection>
      <DemoSection title="With search">
        <DemoStack>
          <SimpleSelect
            options={weeks}
            value={week}
            onValueChange={setWeek}
            withSearch
            searchPlaceholder="Find a week…"
            placeholder="Choose a week"
          />
        </DemoStack>
      </DemoSection>
      <DemoSection title="Mobile views">
        <DemoStack>
          <SimpleSelect
            options={sections}
            value={native}
            onValueChange={setNative}
            mobileView="native"
            placeholder="Native on mobile"
          />
          <SimpleSelect
            options={sections}
            value={drawer}
            onValueChange={setDrawer}
            mobileView="bottom-drawer"
            mobileViewSearch
            drawerTitle="Choose a section"
            placeholder="Drawer on mobile"
          />
        </DemoStack>
        <DemoNote>
          Switch the preview to Mobile to see the native select and drawer.
        </DemoNote>
      </DemoSection>
      <DemoSection title="Labeled">
        <DemoStack>
          <div className="grid gap-2">
            <label htmlFor={fieldId}>Portfolio section</label>
            <SimpleSelect
              id={fieldId}
              options={sections}
              value={labeled}
              onValueChange={setLabeled}
            />
          </div>
        </DemoStack>
        <DemoNote>Week 4 is disabled in the search example.</DemoNote>
      </DemoSection>
    </>
  );
}
