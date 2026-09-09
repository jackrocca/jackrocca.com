import type { ComponentType } from "react";

import { AccordionDemo } from "./accordion";
import { AlertDialogDemo } from "./alert-dialog";
import { BaseInputDemo } from "./base-input";
import { BottomDrawerDemo } from "./bottom-drawer";
import { ButtonDemo } from "./button";
import { CheckboxDemo } from "./checkbox";
import { CommandDemo } from "./command";
import { ConditionalTooltipDemo } from "./conditional-tooltip";
import { CustomBadgeDemo } from "./custom-badge";
import { CustomButtonDemo } from "./custom-button";
import { DialogDemo } from "./dialog";
import { DialogManagerDemo } from "./dialog-manager";
import { HelpInfoCircleDemo } from "./help-info-circle";
import { InputDemo } from "./input";
import { InputGroupDemo } from "./input-group";
import { KbdDemo } from "./kbd";
import { KbdShortcutsDemo } from "./kbd-shortcuts";
import { MenuContextDemo } from "./menu-context";
import { PageHeaderDemo } from "./page-header";
import { PopoverDemo } from "./popover";
import { ResponsiveDialogDemo } from "./responsive-dialog";
import { ResponsiveSelectBottomDrawerMenuDemo } from "./responsive-select-bottom-drawer-menu";
import { SearchBarDemo } from "./search-bar";
import { SegmentedControlDemo } from "./segmented-control";
import { SimpleAccordionDemo } from "./simple-accordion";
import { SimpleDialogDemo } from "./simple-dialog";
import { SimpleSelectDemo } from "./simple-select";
import { SimpleTooltipDemo } from "./simple-tooltip";
import { SocialLoginButtonDemo } from "./social-login-button";
import { SpinnerDemo } from "./spinner";
import { TextareaDemo } from "./textarea";
import { TooltipDemo } from "./tooltip";
import { UiAlertDemo } from "./ui-alert";
import { UiContextDemo } from "./ui-context";

/**
 * Interactive demos keyed by catalog slug (lib/ui-catalog.ts).
 * Every catalog entry must have a demo file at components/ui-library/demos/<slug>.tsx
 * registered here; tests/ui-catalog.test.ts enforces the pairing.
 */
export const uiDemos: Record<string, ComponentType> = {
  accordion: AccordionDemo,
  "alert-dialog": AlertDialogDemo,
  "base-input": BaseInputDemo,
  "bottom-drawer": BottomDrawerDemo,
  button: ButtonDemo,
  checkbox: CheckboxDemo,
  command: CommandDemo,
  "conditional-tooltip": ConditionalTooltipDemo,
  "custom-badge": CustomBadgeDemo,
  "custom-button": CustomButtonDemo,
  dialog: DialogDemo,
  "dialog-manager": DialogManagerDemo,
  "help-info-circle": HelpInfoCircleDemo,
  input: InputDemo,
  "input-group": InputGroupDemo,
  kbd: KbdDemo,
  "kbd-shortcuts": KbdShortcutsDemo,
  "menu-context": MenuContextDemo,
  "page-header": PageHeaderDemo,
  popover: PopoverDemo,
  "responsive-dialog": ResponsiveDialogDemo,
  "responsive-select-bottom-drawer-menu": ResponsiveSelectBottomDrawerMenuDemo,
  "search-bar": SearchBarDemo,
  "segmented-control": SegmentedControlDemo,
  "simple-accordion": SimpleAccordionDemo,
  "simple-dialog": SimpleDialogDemo,
  "simple-select": SimpleSelectDemo,
  "simple-tooltip": SimpleTooltipDemo,
  "social-login-button": SocialLoginButtonDemo,
  spinner: SpinnerDemo,
  textarea: TextareaDemo,
  tooltip: TooltipDemo,
  "ui-alert": UiAlertDemo,
  "ui-context": UiContextDemo,
};
