"use client";

import { Camera, Trophy } from "lucide-react";

import { DemoRow, DemoSection } from "@/components/ui-library/demo";
import { CustomBadge } from "@/ui/components/CustomBadge";

export function CustomBadgeDemo() {
  return (
    <>
      <DemoSection title="Variants">
        <DemoRow>
          <CustomBadge color="zinc-900">Live</CustomBadge>
          <CustomBadge color="emerald-600" variant="outline">
            Locked
          </CustomBadge>
          <CustomBadge color="sky-600" variant="ghost">
            Draft
          </CustomBadge>
        </DemoRow>
      </DemoSection>
      <DemoSection title="Sizes">
        <DemoRow>
          <CustomBadge color="emerald-600" size="xs">
            XS
          </CustomBadge>
          <CustomBadge color="emerald-600" size="sm">
            SM
          </CustomBadge>
          <CustomBadge color="emerald-600" size="md">
            MD
          </CustomBadge>
          <CustomBadge color="emerald-600" size="lg">
            LG
          </CustomBadge>
        </DemoRow>
      </DemoSection>
      <DemoSection title="With icons">
        <DemoRow>
          <CustomBadge color="sky-600" leftIcon={Camera}>
            Photography
          </CustomBadge>
          <CustomBadge color="emerald-600" rightIcon={Trophy}>
            Week 3
          </CustomBadge>
          <CustomBadge color="rose-600" icon={Trophy} />
        </DemoRow>
      </DemoSection>
      <DemoSection title="Colors">
        <DemoRow>
          <CustomBadge color="zinc-900">Default</CustomBadge>
          <CustomBadge color="emerald-600">Season pot</CustomBadge>
          <CustomBadge color="sky-600">Projects</CustomBadge>
          <CustomBadge color="rose-600">Needs pick</CustomBadge>
        </DemoRow>
      </DemoSection>
    </>
  );
}
