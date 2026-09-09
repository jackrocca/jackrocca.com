"use client";

import { Plus } from "lucide-react";

import { DemoRow, DemoSection } from "@/components/ui-library/demo";
import { Button } from "@/ui/primitives/button";

export function ButtonDemo() {
  return (
    <>
      <DemoSection title="Variants">
        <DemoRow>
          <Button>Default</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="destructive">Destructive</Button>
          <Button variant="link">Link</Button>
        </DemoRow>
      </DemoSection>
      <DemoSection title="Sizes">
        <DemoRow>
          <Button size="xs">XS</Button>
          <Button size="sm">SM</Button>
          <Button size="default">Default</Button>
          <Button size="lg">LG</Button>
          <Button size="icon" aria-label="Add pick">
            <Plus />
          </Button>
        </DemoRow>
      </DemoSection>
      <DemoSection title="States">
        <DemoRow>
          <Button disabled>Disabled</Button>
          <Button variant="outline">Save Week 3</Button>
        </DemoRow>
      </DemoSection>
    </>
  );
}
