"use client";

import { PreviewFrame } from "@/components/ui-library/preview-frame";
import { CustomButton } from "@/ui/components/CustomButton";
import { ResponsiveDialog } from "@/ui/components/ResponsiveDialog";

export function OverviewHero() {
  return (
    <figure className="max-w-xl">
      <h2 className="sr-only">Preview</h2>
      <PreviewFrame>
        <ResponsiveDialog
          title="Example dialog"
          trigger={<CustomButton variant="outline">Open</CustomButton>}
        >
          <p className="text-sm leading-6 text-muted-foreground">
            This surface follows the Desktop / Mobile toggle above.
          </p>
        </ResponsiveDialog>
      </PreviewFrame>
      <figcaption className="mt-3 text-sm text-muted-foreground">
        A dialog on desktop, a drawer on mobile. Try the toggle.
      </figcaption>
    </figure>
  );
}
