# Rocca UI component anatomy: reference shapes

These are the code shapes the existing library uses. Copy the shape, not the component.

## 1. A Simple wrapper with mobile branching (from `SimpleDialog`)

```tsx
"use client";

import React from "react";
import { cn } from "@/ui/lib/utils";
import { useControlledOpen } from "@/ui/hooks/useControlledOpen";
import { useKitzeUI } from "@/ui/components/KitzeUIContext";
import { BottomDrawer } from "@/ui/components/BottomDrawer";
import type * as Types from "@/ui/components/SimpleThingTypes";

export type SimpleThingProps = Types.SimpleThingProps;
const EMPTY_CLASS_NAMES: NonNullable<SimpleThingProps["classNames"]> = {};

export const SimpleThing = ({
  trigger = "Open",
  title,
  children,
  open,
  onOpenChange,
  onOpenChangeComplete,
  classNames = EMPTY_CLASS_NAMES,
  mobileView = "keep", // Responsive* variants flip this default and nothing else
}: SimpleThingProps) => {
  const { isMobile } = useKitzeUI();
  const { isOpen, setIsOpen, close } = useControlledOpen({ open, onOpenChange });
  // Only render our own trigger when uncontrolled; controlled callers own the trigger.
  const triggerNode = open === undefined ? toTriggerElement(trigger) : undefined;

  if (isMobile && mobileView === "bottom-drawer") {
    return (
      <BottomDrawer open={isOpen} onOpenChange={setIsOpen} onOpenChangeComplete={onOpenChangeComplete} trigger={triggerNode} title={title}>
        <div className={classNames.body}>{children}</div>
      </BottomDrawer>
    );
  }
  return /* desktop primitives composition, same children, same classNames slots */;
};
```

The Responsive variant is one line of real code:

```tsx
export const ResponsiveThing = ({ mobileView = "bottom-drawer", ...props }: SimpleThingProps) => (
  <SimpleThing {...props} mobileView={mobileView} />
);
```

## 2. Types file (from `SimpleDialogTypes.ts`)

```ts
export type ThingMobileViewType = "keep" | "bottom-drawer";
export interface ThingClassNames {
  root?: string | undefined;
  content?: string | undefined;
  header?: string | undefined;
  body?: string | undefined;
  footer?: string | undefined;
  drawerContent?: string | undefined; // mobile-only slots are named drawer*
}
export interface SimpleThingProps {
  children: React.ReactNode;
  trigger?: React.ReactNode | undefined;
  title?: string | undefined;
  open?: boolean | undefined;
  onOpenChange?: ((open: boolean) => void) | undefined;
  onOpenChangeComplete?: ((open: boolean) => void) | undefined;
  classNames?: ThingClassNames | undefined;
  mobileView?: ThingMobileViewType | undefined;
}
```

## 3. Styles file with `tv()` (from `CustomButtonStyles.ts`, `SegmentedControlStyles.ts`)

```ts
import { tv } from "tailwind-variants";
import type { Size } from "@/ui/lib/types";

export const thing = tv({
  base: "inline-flex items-center gap-2 rounded-md font-medium transition-colors focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-hidden disabled:pointer-events-none disabled:opacity-50 motion-reduce:transition-none",
  variants: {
    size: { xs: "h-7 px-2 text-xs", sm: "h-9 px-3 text-sm", md: "h-10 px-4 text-sm", lg: "h-12 px-5 text-base", xl: "h-14 px-6 text-lg" },
    variant: {
      filled: "bg-(--thing-color) text-white hover:opacity-90",
      light: "bg-(--thing-color)/10 text-(--thing-color) hover:bg-(--thing-color)/20",
      outline: "border border-(--thing-color)/50 text-(--thing-color) hover:bg-(--thing-color)/10",
      ghost: "text-(--thing-color) hover:bg-(--thing-color)/10",
    },
  },
  compoundVariants: [{ size: "md", iconOnly: true, class: "size-10 px-0" }],
  defaultVariants: { size: "md", variant: "filled" },
});
export const iconSizes: Record<Size, number> = { xs: 14, sm: 16, md: 16, lg: 20, xl: 24 };
```

Per-instance color is a CSS variable, resolved through Tailwind's palette:

```tsx
const color = processColor(props.color ?? "bg-primary"); // "bg-emerald-600" → "emerald-600"
<Component style={{ "--thing-color": `var(--color-${color})` } as React.CSSProperties} />
```

## 4. Base UI trigger with `render` (from `SimpleDialogParts`, `BottomDrawer`, `SimpleTooltip`)

```tsx
<DialogTrigger
  render={React.isValidElement(trigger) ? trigger : <button type="button">{trigger}</button>}
/>
```

Base UI merges props and refs onto the rendered element, so the caller's element stays the real focusable trigger. Never wrap a caller's button in another button.

## 5. Options-driven control with a mobile select fallback (from `SegmentedControl`)

```tsx
if (isMobile && mobileView !== "keep") {
  return <SimpleSelect options={options} value={value} onValueChange={onChange} mobileView={mobileView} />;
}
return (
  <div role="tablist" aria-orientation="horizontal" className={thing({ size, className })}>
    {options.map((option) => (
      <ConditionalTooltip key={option.value} condition={Boolean(option.tooltip)} content={option.tooltip}>
        <button type="button" role="tab" aria-selected={active} tabIndex={active ? 0 : -1} onKeyDown={handleSegmentKey} disabled={disabled || option.disabled}>
          {Icon && <Icon aria-hidden="true" className={iconSize[size]} />}
          <span className={hideLabel ? "sr-only" : undefined}>{option.label}</span>
        </button>
      </ConditionalTooltip>
    ))}
  </div>
);
```

## 6. Conditional wrapper (from `ConditionalTooltip`)

```tsx
export const ConditionalThing: ReactFC<Props> = ({ condition, content, children }) => {
  if (!condition || !content) return children;
  return <SimpleThing content={content}>{children}</SimpleThing>;
};
```

Callers write the child once; the component decides whether to wrap.

## 7. Provider + hook for global behavior (from `AlertContext`, `DialogManager`)

- Provider renders `{children}` followed by a renderer (`<AlertRenderer />`, `<DialogList />`).
- State lives in a reducer/store file (`AlertContextState.ts`, `AlertContextStore.ts`); types in their own file.
- Hooks throw a clear error outside the provider (`useDialog must be used within a DialogProvider`), except `useKitzeUI`, which warns and assumes desktop so library code never crashes in isolation.
- Items stay mounted with `open: false` until `onOpenChangeComplete(false)` removes them, so exit transitions finish.

## 8. Enhanced control with affixes and loading (from `Input`)

- Compute `hasLeft`/`hasRight`; when neither, return the bare element with the border classes so the plain case stays a plain `<input>`.
- With affixes, move border/focus styling to the wrapper (`focus-within:ring-1`) and make the inner input borderless.
- `isLoading` swaps the left slot for `<Spinner size="sm" />` and disables the field.
- Forward `ref` as a plain prop (React 19), not `forwardRef`.

## 9. Primitive (from `ui/primitives/button.tsx`)

```tsx
import { Button as ButtonPrimitive } from "@base-ui/react/button";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "cn";

const buttonVariants = cva("…", { variants: { variant: {…}, size: {…} }, defaultVariants: {…} });
function Button({ className, variant = "default", size = "default", ...props }: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  return <ButtonPrimitive data-slot="button" className={cn(buttonVariants({ variant, size, className }))} {...props} />;
}
export { Button, buttonVariants };
```

Primitives keep shadcn's shape (function declarations, `data-slot`, `cva`) so a future `shadcn diff` stays readable. Site-level CSS targets `[data-slot="…"]` rather than forking the primitive.

## Naming

| Kind | File | Export |
| --- | --- | --- |
| Primitive | `ui/primitives/alert-dialog.tsx` | `AlertDialog`, `AlertDialogContent`, … |
| Simple wrapper | `ui/components/SimpleSelect.tsx` | `SimpleSelect`, `SimpleSelectProps` |
| Responsive wrapper | `ui/components/ResponsiveDialog.tsx` | `ResponsiveDialog` |
| Enhanced control | `ui/components/CustomButton.tsx` | `CustomButton` |
| Conditional | `ui/components/ConditionalTooltip.tsx` | `ConditionalTooltip` |
| Provider | `ui/components/AlertContext.tsx` | `AlertProvider`, `useConfirmAlert` |
| Hook | `ui/hooks/useControlledOpen.ts` | `useControlledOpen` |
| Helper | `ui/lib/process-color.ts` | `processColor` |
