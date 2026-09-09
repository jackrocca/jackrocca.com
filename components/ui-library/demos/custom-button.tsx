"use client";

import { useState } from "react";
import { ArrowRight, Camera, Plus } from "lucide-react";

import { DemoNote, DemoRow, DemoSection } from "@/components/ui-library/demo";
import { CustomButton } from "@/ui/components/CustomButton";

export function CustomButtonDemo() {
  const [loading, setLoading] = useState(false);

  return (
    <>
      <DemoSection title="Variants">
        <DemoRow>
          <CustomButton>Filled</CustomButton>
          <CustomButton variant="light">Light</CustomButton>
          <CustomButton variant="outline">Outline</CustomButton>
          <CustomButton variant="ghost">Ghost</CustomButton>
          <CustomButton variant="link">Link</CustomButton>
          <CustomButton variant="unstyled">Unstyled</CustomButton>
        </DemoRow>
      </DemoSection>
      <DemoSection title="Sizes">
        <DemoRow>
          <CustomButton size="xs">XS</CustomButton>
          <CustomButton size="sm">SM</CustomButton>
          <CustomButton size="md">MD</CustomButton>
          <CustomButton size="lg">LG</CustomButton>
        </DemoRow>
      </DemoSection>
      <DemoSection title="With icons">
        <DemoRow>
          <CustomButton leftIcon={Camera}>Photography</CustomButton>
          <CustomButton rightIcon={ArrowRight}>Open Pick 4</CustomButton>
          <CustomButton icon={Plus} circle aria-label="Add project" />
          <CustomButton icon={Camera} aria-label="Open camera roll" />
        </DemoRow>
      </DemoSection>
      <DemoSection title="Loading">
        <DemoRow>
          <CustomButton loading={loading} onClick={() => setLoading((value) => !value)}>
            Save picks
          </CustomButton>
          <CustomButton loading>Publishing</CustomButton>
        </DemoRow>
      </DemoSection>
      <DemoSection title="Colors">
        <DemoRow>
          <CustomButton>Default</CustomButton>
          <CustomButton color="emerald-600">Emerald</CustomButton>
          <CustomButton color="sky-600" variant="outline">
            Sky
          </CustomButton>
          <CustomButton color="rose-600" variant="light">
            Rose
          </CustomButton>
          <CustomButton tooltip="Locks Week 3 after kickoff">Tooltip</CustomButton>
          <CustomButton href="/ui">Library home</CustomButton>
          <CustomButton disabled>Disabled</CustomButton>
        </DemoRow>
        <DemoNote>
          The link uses href=&quot;/ui&quot;. Hover Tooltip for the hint.
        </DemoNote>
      </DemoSection>
    </>
  );
}
