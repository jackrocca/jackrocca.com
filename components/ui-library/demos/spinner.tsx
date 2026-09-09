"use client";

import { DemoRow, DemoSection } from "@/components/ui-library/demo";
import { Spinner } from "@/ui/components/Spinner";

export function SpinnerDemo() {
  return (
    <>
      <DemoSection title="Variants">
        <DemoRow>
          <Spinner />
          <Spinner variant="circle" />
          <Spinner variant="pinwheel" />
        </DemoRow>
      </DemoSection>
      <DemoSection title="Sizes">
        <DemoRow>
          <Spinner size="xs" />
          <Spinner size="sm" />
          <Spinner size="md" />
          <Spinner size="lg" />
          <Spinner size="xl" />
        </DemoRow>
      </DemoSection>
      <DemoSection title="In context">
        <DemoRow>
          <span className="text-muted-foreground text-sm">Saving Week 3 picks</span>
          <Spinner size="sm" variant="circle" />
        </DemoRow>
      </DemoSection>
    </>
  );
}
