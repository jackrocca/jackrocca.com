"use client";

import { DemoNote, DemoSection } from "@/components/ui-library/demo";
import { PageHeader } from "@/ui/components/PageHeader";

export function PageHeaderDemo() {
  return (
    <>
      <DemoSection title="Slots">
        <div className="overflow-hidden rounded-lg border">
          <PageHeader
            fixedOnScroll={false}
            leftSide={<span className="font-medium">Jack Rocca</span>}
            middle={<span className="text-sm">Photography</span>}
            renderRightSide={({ bottomDrawer }) =>
              bottomDrawer(
                <nav className="grid gap-3 pb-2 text-sm">
                  <a href="/ui">Library</a>
                  <a href="/pick4">Pick 4</a>
                  <a href="/">Home</a>
                </nav>,
              )
            }
          />
        </div>
        <DemoNote>
          fixedOnScroll is off so useScrolledPast does not pin this demo. The menu button
          opens the shared drawer.
        </DemoNote>
      </DemoSection>
      <DemoSection title="League">
        <div className="overflow-hidden rounded-lg border">
          <PageHeader
            fixedOnScroll={false}
            height={64}
            leftSide={<span className="font-medium">Pick 4</span>}
            middle={<span className="text-sm">Week 3</span>}
            renderRightSide={({ bottomDrawer }) =>
              bottomDrawer(
                <nav className="grid gap-3 pb-2 text-sm">
                  <a href="/pick4">Standings</a>
                  <a href="/pick4">Season pot</a>
                </nav>,
              )
            }
          />
        </div>
      </DemoSection>
    </>
  );
}
