"use client";
import { useState } from "react";
import { CustomButton } from "@/ui/components/CustomButton";
import { Input } from "@/ui/components/Input";
import { SimpleSelect } from "@/ui/components/SimpleSelect";
import { SegmentedControl } from "@/ui/components/SegmentedControl";
import { ResponsiveDialog } from "@/ui/components/ResponsiveDialog";
import { Checkbox } from "@/ui/primitives/checkbox";
import { Editorial } from "@/components/personal-pages";
export function UIGallery() {
  const [open, setOpen] = useState(false);
  const [choice, setChoice] = useState("photography");
  const [checked, setChecked] = useState(false);
  const options = [
    { value: "photography", label: "Photography" },
    { value: "writing", label: "Writing" },
    { value: "projects", label: "Projects" },
  ];
  return (
    <Editorial
      title="UI workshop"
      intro="Local component development. Changes here do not affect league data."
    >
      <div className="grid gap-12 sm:grid-cols-2">
        <section className="space-y-5">
          <h2 className="text-sm font-medium">Buttons</h2>
          <div className="flex flex-wrap gap-3">
            <CustomButton>Primary</CustomButton>
            <CustomButton variant="outline">Secondary</CustomButton>
            <CustomButton variant="ghost">Quiet</CustomButton>
            <CustomButton disabled>Disabled</CustomButton>
          </div>
        </section>
        <section className="space-y-5">
          <h2 className="text-sm font-medium">Input</h2>
          <label className="grid gap-2 text-sm">
            Display name
            <Input placeholder="Your name" />
          </label>
          <label className="flex min-h-10 items-center gap-3 text-sm">
            <Checkbox checked={checked} onCheckedChange={setChecked} />
            Include in collection
          </label>
        </section>
        <section className="space-y-5">
          <h2 className="text-sm font-medium">Select</h2>
          <SimpleSelect
            aria-label="Collection"
            options={options}
            value={choice}
            onValueChange={setChoice}
            mobileView="bottom-drawer"
            drawerTitle="Collection"
          />
        </section>
        <section className="space-y-5">
          <h2 className="text-sm font-medium">Segmented control</h2>
          <SegmentedControl options={options} value={choice} onChange={setChoice} />
        </section>
        <section className="space-y-5">
          <h2 className="text-sm font-medium">Responsive dialog</h2>
          <CustomButton variant="outline" onClick={() => setOpen(true)}>
            Open dialog
          </CustomButton>
          <ResponsiveDialog title="A simple dialog" open={open} onOpenChange={setOpen}>
            <div className="space-y-6 p-1">
              <p className="text-sm leading-7 text-muted-foreground">
                A dialog on desktop, a drawer on mobile. Try the keyboard and focus
                behavior.
              </p>
              <CustomButton onClick={() => setOpen(false)}>Done</CustomButton>
            </div>
          </ResponsiveDialog>
        </section>
      </div>
    </Editorial>
  );
}
