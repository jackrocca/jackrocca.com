/**
 * RockUI catalog: the single source of truth for the public component library at /ui.
 *
 * Pure data. No React here: the llms.txt route, the site pages and tests all read it.
 * Interactive demos live in components/ui-library/demos/<slug>.tsx and are keyed by slug.
 * Every entry describes a component that exists in ui/; keep `files` accurate because the
 * library links to them and tests verify they exist.
 */

export const uiLibrary = {
  name: "RockUI",
  tagline: "Fewer lines of UI. Consistent on desktop and mobile.",
  basePath: "/ui",
  repo: "https://github.com/jackrocca/jackrocca.com",
  branch: "main",
  upstream: { name: "Kitze UI", url: "https://ui.kitze.io" },
} as const;

export const uiGroups = [
  "Enhanced",
  "Simplified",
  "Responsive",
  "Feedback",
  "Controls",
  "Display",
  "Conditionals",
  "Infrastructure",
  "Primitives",
] as const;
export type UIGroup = (typeof uiGroups)[number];

export const uiGroupDescriptions: Record<UIGroup, string> = {
  Enhanced:
    "Everyday controls with the extras already wired in: icons, loading, links, colors.",
  Simplified:
    "One prop API instead of five primitives. Standard presentation by default.",
  Responsive:
    "The same interaction, presented as a dialog on desktop and a drawer on touch.",
  Feedback:
    "Confirmation, managed dialogs and loading, opened from anywhere in the tree.",
  Controls: "Selection, search and header composition shared across screens.",
  Display: "Small presentational pieces that keep hints and shortcuts consistent.",
  Conditionals: "Wrap a child only when a condition holds; write the child once.",
  Infrastructure: "Providers and contexts the responsive components rely on.",
  Primitives: "Styled Base UI primitives. Compose these when no wrapper fits.",
};

export type UIEntryKind = "component" | "primitive" | "infrastructure";

export type UIProp = readonly [
  name: string,
  type: string,
  description: string,
  defaultValue?: string,
];

export interface UIEntry {
  /** URL segment under /ui and the demo file name. */
  slug: string;
  title: string;
  group: UIGroup;
  kind: UIEntryKind;
  /** One paragraph: what it is, what it saves, when to use it, when not to. */
  description: string;
  /** Import statements a consumer writes. First one is the primary export. */
  imports: readonly string[];
  /** Repository-relative source files, primary file first. */
  files: readonly string[];
  props?: readonly UIProp[];
  /** Slugs of components that pair with, or replace, this one. */
  related?: readonly string[];
  /** Differences from upstream Kitze UI worth knowing when comparing or updating. */
  localNotes?: string;
}

export const uiCatalog: readonly UIEntry[] = [
  // Enhanced
  {
    slug: "custom-button",
    title: "Custom Button",
    group: "Enhanced",
    kind: "component",
    description:
      "The shared button for application actions. It adds loading spinners, left/right icons and content, sizes, filled/light/outline/ghost/link variants, per-button colors, optional tooltips and link rendering to one prop API. Use it instead of repeating spinner, icon-spacing and disabled-state markup around a vanilla button; keep the button primitive for compositions outside this API.",
    imports: ['import { CustomButton } from "@/ui/components/CustomButton";'],
    files: [
      "ui/components/CustomButton.tsx",
      "ui/components/CustomButtonContent.tsx",
      "ui/components/CustomButtonStyles.ts",
      "ui/components/CustomButtonTypes.ts",
      "ui/hooks/useLinkableComponent.ts",
      "ui/lib/process-color.ts",
    ],
    props: [
      ["size", '"xs" | "sm" | "md" | "lg" | "xl"', "Control height and padding", '"md"'],
      [
        "variant",
        '"filled" | "light" | "outline" | "ghost" | "unstyled" | "link"',
        "Visual style",
        '"filled"',
      ],
      ["color", "string", "Accent color token"],
      ["circle", "boolean", "Round icon-only button", "false"],
      ["icon", "React.ElementType", "Centered icon"],
      ["iconSize", "number", "Icon pixel size"],
      ["leftIcon", "React.ElementType", "Leading icon"],
      ["rightIcon", "React.ElementType", "Trailing icon"],
      ["leftSide", "React.ReactNode", "Leading slot"],
      ["rightSide", "React.ReactNode", "Trailing slot"],
      ["loading", "boolean", "Spinner replaces content"],
      ["href", "string", "Render as a link"],
      ["external", "boolean", "Open href in a new tab"],
      ["as", "React.ElementType", "Underlying element", '"button"'],
      ["tooltip", "React.ReactNode", "Hover and focus hint"],
      ["classNames", "{ icon?, tooltip? }", "Slot class names"],
    ],
    related: ["button", "spinner", "conditional-tooltip", "social-login-button"],
    localNotes:
      'variant="unstyled" renders structured children directly so callers can supply their own layout. Transitions are property-specific and respect reduced motion.',
  },
  {
    slug: "custom-badge",
    title: "Custom Badge",
    group: "Enhanced",
    kind: "component",
    description:
      "A styled badge with shared size, color and default/outline/ghost variants plus optional icons and side content. Use it for statuses, tags and counts so the same semantic color and spacing choices are reused across screens instead of one-off pill markup.",
    imports: ['import { CustomBadge } from "@/ui/components/CustomBadge";'],
    files: ["ui/components/CustomBadge.tsx", "ui/lib/process-color.ts"],
    props: [
      ["color", "string", "Accent color token"],
      ["variant", '"default" | "outline" | "ghost"', "Visual style", '"default"'],
      ["size", '"xs" | "sm" | "md" | "lg" | "xl"', "Padding and type size", '"sm"'],
      ["icon", "React.ElementType", "Centered icon"],
      ["iconSize", "number", "Icon pixel size"],
      ["leftIcon", "React.ElementType", "Leading icon"],
      ["rightIcon", "React.ElementType", "Trailing icon"],
      ["leftSide", "React.ReactNode", "Leading slot"],
      ["rightSide", "React.ReactNode", "Trailing slot"],
      ["classNames", "{ root?, icon? }", "Slot class names"],
    ],
    related: ["custom-button"],
  },
  {
    slug: "input",
    title: "Input",
    group: "Enhanced",
    kind: "component",
    description:
      "An enhanced text input with left/right icons or content slots and an integrated loading state. Use it to avoid repeating adornment spacing, loading indicators and disabled styling around a vanilla input. It remains a normal input for forms; use the base input primitive for a plain field without these additions.",
    imports: ['import { Input } from "@/ui/components/Input";'],
    files: ["ui/components/Input.tsx", "ui/components/InputAffix.tsx"],
    props: [
      ["leftIcon", "ElementType", "Leading icon"],
      ["rightIcon", "ElementType", "Trailing icon"],
      ["leftItem", "ReactNode", "Leading slot"],
      ["rightItem", "ReactNode", "Trailing slot"],
      ["iconClassName", "string", "Shared icon class"],
      ["isLoading", "boolean", "Shows spinner and disables", "false"],
      ["spinnerSize", '"xs" | "sm" | "md" | "lg" | "xl"', "Loading spinner size", '"sm"'],
      [
        "classNames",
        "{ container?, input?, leftIcon?, rightIcon?, leftItem?, rightItem? }",
        "Slot class names",
      ],
    ],
    related: ["base-input", "input-group", "search-bar", "spinner"],
  },
  {
    slug: "social-login-button",
    title: "Social Login Button",
    group: "Enhanced",
    kind: "component",
    description:
      "Provider sign-in actions built on CustomButton, with inline brand marks for twelve providers and outline or brand styling. It adds provider labels, accessible icon-only presentation and stable loading dimensions. Connect onClick to your auth client; the button does not implement OAuth or manage auth errors.",
    imports: ['import { SocialLoginButton } from "@/ui/components/SocialLoginButton";'],
    files: [
      "ui/components/SocialLoginButton.tsx",
      "ui/components/SocialLoginBrandIcons.tsx",
      "ui/components/social-login-providers.ts",
    ],
    props: [
      [
        "provider",
        '"apple" | "discord" | "facebook" | "github" | "gitlab" | "google" | "linkedin" | "microsoft" | "slack" | "spotify" | "twitch" | "x"',
        "Brand mark and default label",
      ],
      ["label", "string", "Button text; defaults to Continue with {name}"],
      ["variant", '"outline" | "brand"', "Neutral or brand colors", '"outline"'],
      ["size", '"sm" | "md" | "lg"', "Height and padding", '"md"'],
      ["iconOnly", "boolean", "Icon without visible label", "false"],
      ["loading", "boolean", "Spinner and busy state", "false"],
    ],
    related: ["custom-button"],
    localNotes:
      "Icons render inline with no remote requests. The website sign-in screens restyle this button through the data-slot attribute rather than forking it.",
  },

  // Simplified
  {
    slug: "simple-dialog",
    title: "Simple Dialog",
    group: "Simplified",
    kind: "component",
    description:
      "A dialog with title, body and optional submit/cancel actions exposed as props. It centralizes overlay composition, controlled or uncontrolled opening, action layout and optional bottom-drawer behavior on mobile. Use it for standard dialogs instead of assembling every dialog primitive; reach for the dialog primitive when the structure is substantially custom.",
    imports: ['import { SimpleDialog } from "@/ui/components/SimpleDialog";'],
    files: [
      "ui/components/SimpleDialog.tsx",
      "ui/components/SimpleDialogActions.tsx",
      "ui/components/SimpleDialogTypes.ts",
      "ui/hooks/useControlledOpen.ts",
    ],
    props: [
      ["trigger", "React.ReactNode", "Opens when uncontrolled", '"Open"'],
      ["title", "string", "Header text"],
      ["open", "boolean", "Controlled open"],
      ["onOpenChange", "(open: boolean) => void", "Open state change"],
      ["onOpenChangeComplete", "(open: boolean) => void", "After open animation"],
      [
        "size",
        '"sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl" | "5xl" | "full"',
        "Max width",
        '"sm"',
      ],
      ["mobileView", '"keep" | "bottom-drawer"', "Mobile presentation", '"keep"'],
      ["drawerTitle", "string", "Drawer header override"],
      ["showCancel", "boolean", "Shows the cancel action", "Boolean(onSubmit)"],
      ["showCloseButton", "boolean", "Header close control", "true"],
      ["onCancel", "() => void", "Cancel handler"],
      ["onSubmit", "() => void", "Submit handler; closes after"],
      ["submitText", "string", "Submit label", '"Submit"'],
      ["cancelText", "string", "Cancel label", '"Cancel"'],
      [
        "classNames",
        "{ root?, content?, header?, title?, body?, footer?, submitButton?, cancelButton?, drawerRoot?, drawerContent?, drawerHeader?, drawerFooter? }",
        "Slot class names",
      ],
    ],
    related: ["responsive-dialog", "dialog", "dialog-manager", "bottom-drawer"],
  },
  {
    slug: "simple-select",
    title: "Simple Select",
    group: "Simplified",
    kind: "component",
    description:
      "A single-value select driven by an options array, value and onValueChange. It composes the trigger, option list and optional search, and can switch to a native select or a bottom-drawer menu on mobile. Use it to avoid repeating primitive composition and mobile branching for every field.",
    imports: ['import { SimpleSelect } from "@/ui/components/SimpleSelect";'],
    files: [
      "ui/components/SimpleSelect.tsx",
      "ui/components/SimpleSelectTrigger.tsx",
      "ui/components/SimpleSelectPopover.tsx",
      "ui/components/SimpleSelectNative.tsx",
      "ui/components/SimpleSelectTypes.ts",
    ],
    props: [
      ["id", "string", "Trigger id for labels"],
      ["aria-label", "string", "Accessible name"],
      ["options", "SelectOption[]", "Value, label, icon, disabled"],
      ["value", "string", "Selected value"],
      ["onValueChange", "(value: string) => void", "Selection change"],
      ["placeholder", "string", "Empty trigger text", '"Select an option"'],
      ["triggerClassName", "string", "Trigger class"],
      ["disabled", "boolean", "Blocks opening"],
      ["withSearch", "boolean", "Desktop search field", "false"],
      ["searchPlaceholder", "string", "Search field text", '"Search options..."'],
      [
        "mobileView",
        '"keep" | "native" | "bottom-drawer"',
        "Mobile presentation",
        '"keep"',
      ],
      ["mobileViewSearch", "boolean", "Search in mobile drawer", "false"],
      ["drawerTitle", "string", "Drawer header", '"Select an option"'],
    ],
    related: ["responsive-select-bottom-drawer-menu", "segmented-control", "command"],
    localNotes:
      "Accepts id and aria-label so a visible <label> can own it. Disabled options stay disabled in the mobile drawer, and reselecting the current value is stable.",
  },
  {
    slug: "simple-tooltip",
    title: "Simple Tooltip",
    group: "Simplified",
    kind: "component",
    description:
      "A content prop wrapped around the existing trigger, with optional popover or bottom-drawer presentation on mobile. It removes tooltip provider, trigger, portal and content markup while retaining hover and focus behavior. Use it for short explanations; choose a popover or drawer when touch users need to inspect richer content.",
    imports: ['import { SimpleTooltip } from "@/ui/components/SimpleTooltip";'],
    files: ["ui/components/SimpleTooltip.tsx"],
    props: [
      ["content", "string | React.ReactNode", "Tooltip body"],
      ["tooltipClassName", "string", "Content class"],
      [
        "mobileView",
        '"keep" | "popover" | "bottom-drawer"',
        "Mobile presentation",
        '"keep"',
      ],
      ["drawerTitle", "string", "Drawer header when used"],
    ],
    related: ["conditional-tooltip", "help-info-circle", "tooltip"],
  },
  {
    slug: "simple-accordion",
    title: "Simple Accordion",
    group: "Simplified",
    kind: "component",
    description:
      "An accordion built from an items array rather than repeated item, trigger and content primitives. Use it for FAQs and expandable settings with standard layout and behavior; choose the accordion primitive when individual items need substantially different composition.",
    imports: ['import { SimpleAccordion } from "@/ui/components/SimpleAccordion";'],
    files: ["ui/components/SimpleAccordion.tsx"],
    props: [
      ["items", "{ title, content }[]", "Panels in order"],
      [
        "classNames",
        "{ root?, item?, button?, title?, icon?, panel?, content? }",
        "Slot class names",
      ],
    ],
    related: ["accordion"],
  },

  // Responsive
  {
    slug: "responsive-dialog",
    title: "Responsive Dialog",
    group: "Responsive",
    kind: "component",
    description:
      'The standard dialog wrapper with bottom-drawer behavior enabled on mobile through the UI provider. It delegates content and actions to SimpleDialog so callers share one API across desktop and touch layouts. Use mobileView="keep" when a centered dialog is deliberately needed on both.',
    imports: ['import { ResponsiveDialog } from "@/ui/components/ResponsiveDialog";'],
    files: ["ui/components/ResponsiveDialog.tsx", "ui/components/SimpleDialog.tsx"],
    props: [
      ["trigger", "React.ReactNode", "Opens when uncontrolled", '"Open"'],
      ["title", "string", "Header text"],
      ["open", "boolean", "Controlled open"],
      ["onOpenChange", "(open: boolean) => void", "Open state change"],
      ["onOpenChangeComplete", "(open: boolean) => void", "After open animation"],
      [
        "size",
        '"sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl" | "5xl" | "full"',
        "Max width",
        '"sm"',
      ],
      [
        "mobileView",
        '"keep" | "bottom-drawer"',
        "Mobile presentation",
        '"bottom-drawer"',
      ],
      ["drawerTitle", "string", "Drawer header override"],
      ["showCancel", "boolean", "Shows the cancel action", "Boolean(onSubmit)"],
      ["showCloseButton", "boolean", "Header close control", "true"],
      ["onCancel", "() => void", "Cancel handler"],
      ["onSubmit", "() => void", "Submit handler; closes after"],
      ["submitText", "string", "Submit label", '"Submit"'],
      ["cancelText", "string", "Cancel label", '"Cancel"'],
      [
        "classNames",
        "{ root?, content?, header?, title?, body?, footer?, submitButton?, cancelButton?, drawerRoot?, drawerContent?, drawerHeader?, drawerFooter? }",
        "Slot class names",
      ],
    ],
    related: ["simple-dialog", "bottom-drawer", "ui-context"],
  },
  {
    slug: "bottom-drawer",
    title: "Bottom Drawer",
    group: "Responsive",
    kind: "component",
    description:
      "A Base UI Drawer wrapper with shared title, swipe handle, content and menu variants. Use it for touch-friendly sheets and action menus without rebuilding drawer anatomy and dismissal behavior. BottomDrawerMenu adds labeled items, groups and separators that close the sheet on selection.",
    imports: [
      'import { BottomDrawer } from "@/ui/components/BottomDrawer";',
      'import { BottomDrawerMenu } from "@/ui/components/BottomDrawerMenu";',
      'import { useDrawer } from "@/ui/components/DrawerContext";',
    ],
    files: [
      "ui/components/BottomDrawer.tsx",
      "ui/components/BottomDrawerMenu.tsx",
      "ui/components/BottomDrawerMenuItem.tsx",
      "ui/components/BottomDrawerMenuComponents.tsx",
      "ui/components/DrawerContext.tsx",
    ],
    props: [
      ["title", "string", "Header text"],
      ["open", "boolean", "Controlled open"],
      ["onOpenChange", "(open: boolean) => void", "Open state change"],
      ["onOpenChangeComplete", "(open: boolean) => void", "After open animation"],
      ["trigger", "React.ReactNode", "Opens the drawer"],
      [
        "renderHeader",
        "(({ handle, close }) => React.ReactNode) | null",
        "Custom or hidden header",
      ],
      [
        "classNames",
        "{ overlay?, content?, handle?, title?, headerWrapper?, childrenWrapper? }",
        "Slot class names",
      ],
      [
        "items",
        '(Omit<BottomDrawerMenuItemProps, "children"> & { label: string })[]',
        "BottomDrawerMenu labeled items",
      ],
      ["content", "React.ReactNode", "BottomDrawerMenu custom body"],
      ["closeOnClick", "boolean", "Close menu on item select", "true"],
      ["useDrawer", "{ close: () => void }", "Close the open drawer"],
    ],
    related: ["responsive-dialog", "page-header", "menu-context"],
    localNotes:
      "Backdrop and viewport measure window.innerWidth while open so scroll-locking gutters never leave an uncovered strip. Element triggers keep native button semantics.",
  },
  {
    slug: "responsive-select-bottom-drawer-menu",
    title: "Responsive Select Bottom Drawer Menu",
    group: "Responsive",
    kind: "component",
    description:
      'The mobile option-list surface used by SimpleSelect. It renders selection choices in a bottom-drawer menu, optionally with search, and connects selection to drawer closing. It is a building block; normally use SimpleSelect with mobileView="bottom-drawer" rather than composing this directly.',
    imports: [
      'import { ResponsiveSelectBottomDrawerMenu } from "@/ui/components/ResponsiveSelectBottomDrawerMenu";',
    ],
    files: ["ui/components/ResponsiveSelectBottomDrawerMenu.tsx"],
    props: [
      ["options", "SelectOption[]", "Value, label, icon, disabled"],
      ["value", "string", "Selected value"],
      ["onValueChange", "(value: string) => void", "Selection change"],
      ["placeholder", "string", "Default trigger text", '"Select an option"'],
      ["drawerTitle", "string", "Drawer header", '"Select an option"'],
      ["open", "boolean", "Controlled open"],
      ["onOpenChange", "(open: boolean) => void", "Open state change"],
      ["searchPlaceholder", "string", "Search field text", '"Search options..."'],
      ["showSearch", "boolean", "Filter field", "false"],
      ["triggerClassName", "string", "Default trigger class"],
      ["disabled", "boolean", "Blocks the default trigger"],
    ],
    related: ["simple-select", "bottom-drawer", "search-bar"],
  },

  // Feedback
  {
    slug: "ui-alert",
    title: "UI Alert",
    group: "Feedback",
    kind: "component",
    description:
      "Shared confirmation and delete dialogs opened through AlertProvider hooks. They centralize destructive styling, confirm/cancel callbacks, optional typed confirmationText and transition-aware cleanup. Use useConfirmAlert or useConfirmAlertDelete instead of embedding a new confirmation dialog beside every destructive button.",
    imports: [
      'import { useConfirmAlert, useConfirmAlertDelete } from "@/ui/components/AlertContext";',
      'import { AlertProvider } from "@/ui/components/AlertContext";',
    ],
    files: [
      "ui/components/AlertContext.tsx",
      "ui/components/AlertRenderer.tsx",
      "ui/components/ConfirmAlert.tsx",
      "ui/components/ConfirmAlertDelete.tsx",
      "ui/components/Alert.tsx",
      "ui/components/AlertContextState.ts",
      "ui/components/AlertContextStore.ts",
      "ui/components/AlertContextTypes.ts",
    ],
    props: [
      ["title", "string", "Heading; delete default Confirm Delete", '"Confirm"'],
      ["description", "string", "Body copy"],
      [
        "variant",
        '"default" | "destructive" | "success"',
        "Tone; delete is destructive",
        '"default"',
      ],
      ["confirmLabel", "string", "Confirm button; delete default Delete", '"Confirm"'],
      ["cancelLabel", "string", "Cancel button", '"Cancel"'],
      ["onConfirm", "() => void", "Confirm callback"],
      ["confirmationText", "string", "Phrase required to enable confirm"],
      ["itemName", "string", "Delete copy target"],
      ["onOpenChangeComplete", "(open: boolean) => void", "After close animation"],
    ],
    related: ["alert-dialog", "dialog-manager"],
  },
  {
    slug: "dialog-manager",
    title: "Dialog Manager",
    group: "Feedback",
    kind: "component",
    description:
      "Open and dismiss dialogs through useDialog instead of keeping a separate open boolean and mounted dialog beside every trigger. Managed dialogs use the responsive defaults, including mobile drawers, and stay mounted through their closing transitions. Use it for dialogs triggered from menus or distant parts of the tree.",
    imports: [
      'import { useDialog, DialogManager } from "@/ui/components/DialogManager";',
    ],
    files: ["ui/components/DialogManager.tsx", "ui/components/DialogList.tsx"],
    props: [
      [
        "mobileView",
        '"keep" | "bottom-drawer"',
        "Default mobile presentation",
        '"bottom-drawer"',
      ],
      ["classNames", "{ root? }", "Overlay wrapper class"],
      ["openDialog", "(config: OpenDialogProps) => string", "Open a managed dialog"],
      ["closeDialog", "(id: string) => void", "Dismiss one dialog"],
      ["closeAllDialogs", "() => void", "Dismiss every dialog"],
    ],
    related: ["simple-dialog", "responsive-dialog", "ui-alert"],
  },
  {
    slug: "spinner",
    title: "Spinner",
    group: "Feedback",
    kind: "component",
    description:
      "The shared loading indicator with size and default/circle/pinwheel variants. Use it in buttons and pending content so loading visuals stay consistent instead of choosing a different animated icon in every component.",
    imports: ['import { Spinner } from "@/ui/components/Spinner";'],
    files: ["ui/components/Spinner.tsx"],
    props: [
      ["variant", '"default" | "circle" | "pinwheel"', "Icon shape", '"default"'],
      ["size", '"xs" | "sm" | "md" | "lg" | "xl"', "Pixel size", '"md"'],
    ],
    related: ["custom-button", "input"],
  },

  // Controls
  {
    slug: "segmented-control",
    title: "Segmented Control",
    group: "Controls",
    kind: "component",
    description:
      "A compact controlled choice between a few values, with text, icon-and-text or icon-only presentation, per-option tooltips and disabled options. It provides shared selection styling and arrow/Home/End keyboard navigation, with optional native-select or bottom-drawer behavior on mobile. Use it for view, theme and mode switches instead of coordinating independent buttons.",
    imports: ['import { SegmentedControl } from "@/ui/components/SegmentedControl";'],
    files: [
      "ui/components/SegmentedControl.tsx",
      "ui/components/SegmentedControlStyles.ts",
    ],
    props: [
      ["options", "SegmentedControlOption[]", "Value, label, icons, tooltip, disabled"],
      ["iconOnly", "boolean", "Hide labels; keep accessible names", "false"],
      ["value", "string", "Selected value"],
      ["onChange", "(value: string) => void", "Selection change"],
      ["tabClassName", "string", "Every option button"],
      ["activeTabClassName", "string", "Selected option button"],
      ["size", '"sm" | "md" | "lg"', "Control height", '"md"'],
      [
        "mobileView",
        '"keep" | "native" | "bottom-drawer"',
        "Mobile presentation",
        '"keep"',
      ],
      ["mobileViewSearch", "boolean", "Search in mobile drawer", "false"],
      ["drawerTitle", "string", "Drawer header", '"Select an option"'],
      ["placeholder", "string", "Mobile empty text", '"Select an option"'],
      ["disabled", "boolean", "Blocks all options"],
    ],
    related: ["simple-select"],
    localNotes:
      "iconOnly hides visible labels while keeping accessible names; the mobile select presentations keep their labels.",
  },
  {
    slug: "search-bar",
    title: "Search Bar",
    group: "Controls",
    kind: "component",
    description:
      "A controlled search input with clear and Escape handling. Use it to share the same search entry interaction across lists and toolbars; it reports text changes and leaves filtering to the caller.",
    imports: ['import { SearchBar } from "@/ui/components/SearchBar";'],
    files: ["ui/components/SearchBar.tsx"],
    props: [
      ["value", "string", "Query text"],
      ["onChange", "(value: string) => void", "Text change"],
      ["placeholder", "string", "Empty field text", '"Search..."'],
      ["onClose", "() => void", "Blur callback"],
      ["onForceClose", "() => void", "Escape callback"],
      ["autoFocus", "boolean", "Focus on mount", "false"],
    ],
    related: ["input", "command"],
  },
  {
    slug: "page-header",
    title: "Page Header",
    group: "Controls",
    kind: "component",
    description:
      "An application header with left/middle/right slots, optional scroll-fixed positioning and a shared drawer-menu trigger. Use it to keep header sizing and mobile navigation composition consistent across screens instead of rebuilding header and drawer wiring together. The website header is built on it.",
    imports: ['import { PageHeader } from "@/ui/components/PageHeader";'],
    files: ["ui/components/PageHeader.tsx", "ui/hooks/useScrolledPast.ts"],
    props: [
      ["leftSide", "ReactNode", "Leading slot"],
      ["middle", "ReactNode", "Center slot"],
      ["drawerContent", "ReactNode", "Default menu drawer body"],
      ["height", "number", "Header height in px", "80"],
      ["fixedOnScroll", "boolean", "Stick after scrolling past height", "false"],
      [
        "renderRightSide",
        "({ menuButton, bottomDrawer }) => ReactNode",
        "Custom trailing slot",
      ],
      [
        "classNames",
        "{ root?, container?, leftSide?, middle?, rightSide?, menuButton?, pastScrolled? }",
        "Slot class names",
      ],
    ],
    related: ["bottom-drawer", "custom-button"],
  },

  // Display
  {
    slug: "kbd",
    title: "Keyboard Shortcut",
    group: "Display",
    kind: "component",
    description:
      "The shared keycap component for a sequence of keys. Use it to display shortcut hints with consistent sizing, borders and typography instead of plain strings. It is display only and binds no handlers.",
    imports: ['import { Kbd } from "@/ui/components/Kbd";'],
    files: ["ui/components/Kbd.tsx"],
    props: [
      ["keys", "string[]", "Keycaps in order"],
      ["classNames", "{ root?, key?, separator? }", "Slot class names"],
    ],
    related: ["kbd-shortcuts"],
  },
  {
    slug: "kbd-shortcuts",
    title: "Keyboard Shortcuts",
    group: "Display",
    kind: "component",
    description:
      "Render shortcut keys as individual keycaps with a configurable separator and shared style overrides. Menus use MenuShortcut on top of it so modifier keys and sizing stay consistent across surfaces. It displays hints; your application binds the shortcuts.",
    imports: [
      'import { KbdShortcuts } from "@/ui/components/KbdShortcuts";',
      'import { MenuShortcut } from "@/ui/components/MenuShortcut";',
    ],
    files: ["ui/components/KbdShortcuts.tsx", "ui/components/MenuShortcut.tsx"],
    props: [
      ["shortcuts", "string[]", "Individual keycaps"],
      ["separator", "string | null", "Between keycaps; null hides", '"+"'],
      ["classNames", "{ root?, key?, separator? }", "Slot class names"],
      ["shortcut", "string | string[]", "MenuShortcut keys"],
      ["destructive", "boolean", "MenuShortcut destructive tone"],
    ],
    related: ["kbd"],
  },
  {
    slug: "help-info-circle",
    title: "Help Info Circle",
    group: "Display",
    kind: "component",
    description:
      "A compact help icon connected to the shared tooltip/drawer explanation pattern. Use it beside a field or action when a label needs an optional explanation, so every screen does not invent its own help trigger and touch behavior. Defaults to a bottom drawer on mobile.",
    imports: ['import { HelpInfoCircle } from "@/ui/components/HelpInfoCircle";'],
    files: ["ui/components/HelpInfoCircle.tsx"],
    props: [
      ["content", "React.ReactNode", "Tooltip or drawer body"],
      ["iconClassName", "string", "Help icon class"],
      ["tooltipClassName", "string", "Content class"],
      ["drawerTitle", "string", "Drawer header", '"Help Information"'],
      [
        "mobileView",
        '"keep" | "popover" | "bottom-drawer"',
        "Mobile presentation",
        '"bottom-drawer"',
      ],
    ],
    related: ["simple-tooltip"],
  },

  // Conditionals
  {
    slug: "conditional-tooltip",
    title: "Conditional Tooltip",
    group: "Conditionals",
    kind: "component",
    description:
      "Add a SimpleTooltip only when a condition and content are present; otherwise render the original child. Use it for disabled explanations or context-dependent hints without duplicating the trigger in two branches.",
    imports: ['import { ConditionalTooltip } from "@/ui/components/ConditionalTooltip";'],
    files: ["ui/components/ConditionalTooltip.tsx"],
    props: [
      ["condition", "boolean", "When true and content set, wrap"],
      ["content", "string", "Tooltip text"],
      ["classNames", "{ wrapper?, tooltip?, content? }", "Slot class names"],
    ],
    related: ["simple-tooltip", "custom-button", "segmented-control"],
  },

  // Infrastructure
  {
    slug: "ui-context",
    title: "UI Context",
    group: "Infrastructure",
    kind: "infrastructure",
    description:
      "The application provider for shared configuration, including the isMobile value that responsive components read. Supply the breakpoint decision once so dialogs, selects and tooltips make the same desktop/mobile choice. Place AlertProvider and DialogManager inside it. Setup infrastructure, not a visible widget.",
    imports: [
      'import { KitzeUIProvider, useKitzeUI } from "@/ui/components/KitzeUIContext";',
    ],
    files: ["ui/components/KitzeUIContext.tsx"],
    props: [
      ["isMobile", "boolean", "Desktop vs mobile presentation"],
      [
        "portalContainer",
        "HTMLElement | null",
        "Where portalled surfaces mount; defaults to body",
      ],
      [
        "useKitzeUI",
        "{ isMobile: boolean; portalContainer?: HTMLElement | null }",
        "Provider values; isMobile defaults false",
      ],
    ],
    related: ["responsive-dialog", "dialog-manager", "ui-alert"],
    localNotes:
      "Export names keep the upstream KitzeUIProvider/useKitzeUI so upstream diffs stay small. The website provides isMobile from a (max-width: 767px) media query in components/providers.tsx.",
  },
  {
    slug: "menu-context",
    title: "Menu Context",
    group: "Infrastructure",
    kind: "infrastructure",
    description:
      "Internal context shared by menu surfaces. It tells menu items which surface they render in and how to close their owning menu. BottomDrawerMenu provides it automatically; use it when implementing a compatible menu surface, not as a standalone component.",
    imports: [
      'import { MenuProvider, useMenuContext } from "@/ui/components/MenuContext";',
    ],
    files: ["ui/components/MenuContext.tsx"],
    props: [
      ["menuType", '"dropdown" | "context" | "bottom-drawer"', "Owning surface"],
      ["open", "boolean", "Whether the menu is open", "true"],
      ["closeMenu", "() => void", "Dismiss the owning menu"],
      ["useMenuContext", "{ menuType, open?, closeMenu? }", "Reads the nearest menu"],
    ],
    related: ["bottom-drawer"],
  },

  // Primitives
  {
    slug: "button",
    title: "Button",
    group: "Primitives",
    kind: "primitive",
    description:
      "The styled Base UI button primitive with shadcn variants and sizes. Use it for compositions that need the raw primitive; CustomButton is the shared application button with icons, loading and links.",
    imports: ['import { Button, buttonVariants } from "@/ui/primitives/button";'],
    files: ["ui/primitives/button.tsx"],
    props: [
      [
        "variant",
        '"default" | "outline" | "secondary" | "ghost" | "destructive" | "link"',
        "Visual style",
        '"default"',
      ],
      [
        "size",
        '"default" | "xs" | "sm" | "lg" | "icon" | "icon-xs" | "icon-sm" | "icon-lg"',
        "Height and padding",
        '"default"',
      ],
      ["...", "Button.Props", "Base UI props pass through"],
    ],
    related: ["custom-button"],
  },
  {
    slug: "base-input",
    title: "Base Input",
    group: "Primitives",
    kind: "primitive",
    description:
      "The plain styled input primitive. Use it for a field without adornments or loading; the enhanced Input adds icon slots and a loading state on top.",
    imports: ['import { Input } from "@/ui/primitives/input";'],
    files: ["ui/primitives/input.tsx"],
    props: [["...", "Input.Props", "Base UI props pass through"]],
    related: ["input", "input-group", "textarea"],
  },
  {
    slug: "textarea",
    title: "Textarea",
    group: "Primitives",
    kind: "primitive",
    description:
      "The styled multiline input primitive, sharing border, focus ring and disabled styling with the input primitive.",
    imports: ['import { Textarea } from "@/ui/primitives/textarea";'],
    files: ["ui/primitives/textarea.tsx"],
    props: [["...", 'ComponentProps<"textarea">', "Base UI props pass through"]],
    related: ["base-input", "input-group"],
  },
  {
    slug: "input-group",
    title: "Input Group",
    group: "Primitives",
    kind: "primitive",
    description:
      "Compose an input or textarea with addons, inline buttons and text in one bordered group. Use it for prefixes, suffixes and attached actions when the enhanced Input's icon slots are not enough.",
    imports: [
      'import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput, InputGroupText, InputGroupTextarea } from "@/ui/primitives/input-group";',
    ],
    files: ["ui/primitives/input-group.tsx"],
    props: [
      [
        "align",
        '"inline-start" | "inline-end" | "block-start" | "block-end"',
        "InputGroupAddon placement",
        '"inline-start"',
      ],
      ["size", '"xs" | "sm" | "icon-xs" | "icon-sm"', "InputGroupButton size", '"xs"'],
      [
        "variant",
        '"default" | "outline" | "secondary" | "ghost" | "destructive" | "link"',
        "InputGroupButton style",
        '"ghost"',
      ],
      ["type", '"button" | "submit" | "reset"', "InputGroupButton type", '"button"'],
      ["...", 'ComponentProps<"div">', "Base UI props pass through"],
    ],
    related: ["input", "base-input", "textarea"],
  },
  {
    slug: "checkbox",
    title: "Checkbox",
    group: "Primitives",
    kind: "primitive",
    description:
      "The styled Base UI checkbox for boolean selection. Pair it with a visible label; it keeps the accessible primitive API and the library's visual conventions.",
    imports: ['import { Checkbox } from "@/ui/primitives/checkbox";'],
    files: ["ui/primitives/checkbox.tsx"],
    props: [["...", "Checkbox.Root.Props", "Base UI props pass through"]],
  },
  {
    slug: "accordion",
    title: "Accordion",
    group: "Primitives",
    kind: "primitive",
    description:
      "Styled Base UI primitives for expandable sections. Use them for custom compositions; SimpleAccordion covers the standard items-array case.",
    imports: [
      'import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/ui/primitives/accordion";',
    ],
    files: ["ui/primitives/accordion.tsx"],
    props: [["...", "Accordion.Root.Props", "Base UI props pass through"]],
    related: ["simple-accordion"],
  },
  {
    slug: "dialog",
    title: "Dialog",
    group: "Primitives",
    kind: "primitive",
    description:
      "Styled Base UI primitives for modal dialogs. Use them when the structure is substantially custom; SimpleDialog and ResponsiveDialog cover standard dialogs with a smaller API.",
    imports: [
      'import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/ui/primitives/dialog";',
    ],
    files: ["ui/primitives/dialog.tsx"],
    props: [
      ["showCloseButton", "boolean", "DialogContent close control", "true"],
      ["...", "Dialog.Root.Props", "Base UI props pass through"],
    ],
    related: ["simple-dialog", "responsive-dialog"],
  },
  {
    slug: "alert-dialog",
    title: "Alert Dialog",
    group: "Primitives",
    kind: "primitive",
    description:
      "Styled Base UI primitives for explicit confirmation dialogs that require a decision. UI Alert composes them behind hooks; use the primitives for a custom confirmation layout.",
    imports: [
      'import { AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogAction, AlertDialogCancel } from "@/ui/primitives/alert-dialog";',
    ],
    files: ["ui/primitives/alert-dialog.tsx"],
    props: [
      ["...", "AlertDialog.Root.Props", "Base UI props pass through"],
      ["variant", "Button variant", "AlertDialogAction button variant", '"default"'],
    ],
    related: ["ui-alert"],
  },
  {
    slug: "popover",
    title: "Popover",
    group: "Primitives",
    kind: "primitive",
    description:
      "Styled Base UI primitives for anchored panels. SimpleSelect uses them for its desktop option list; use them directly for custom anchored content.",
    imports: [
      'import { Popover, PopoverTrigger, PopoverContent } from "@/ui/primitives/popover";',
    ],
    files: ["ui/primitives/popover.tsx"],
    props: [
      [
        "side",
        '"top" | "bottom" | "left" | "right" | "inline-start" | "inline-end"',
        "PopoverContent placement",
        '"bottom"',
      ],
      ["sideOffset", "number", "Distance from trigger", "4"],
      ["align", '"start" | "center" | "end"', "Cross-axis alignment", '"center"'],
      ["...", "Popover.Root.Props", "Base UI props pass through"],
    ],
    related: ["simple-select", "simple-tooltip"],
  },
  {
    slug: "tooltip",
    title: "Tooltip",
    group: "Primitives",
    kind: "primitive",
    description:
      "Styled Base UI primitives for hover and focus hints. SimpleTooltip wraps them in a content prop; the website wraps the app in TooltipProvider once.",
    imports: [
      'import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/ui/primitives/tooltip";',
    ],
    files: ["ui/primitives/tooltip.tsx"],
    props: [
      ["delay", "number", "TooltipProvider open delay", "400"],
      [
        "side",
        '"top" | "bottom" | "left" | "right" | "inline-start" | "inline-end"',
        "TooltipContent placement",
        '"top"',
      ],
      ["sideOffset", "number", "Distance from trigger", "4"],
      ["align", '"start" | "center" | "end"', "Cross-axis alignment", '"center"'],
      ["...", "Tooltip.Root.Props", "Base UI props pass through"],
    ],
    related: ["simple-tooltip", "conditional-tooltip"],
  },
  {
    slug: "command",
    title: "Command",
    group: "Primitives",
    kind: "primitive",
    description:
      "A cmdk-based command list with input, groups, items, shortcuts and an optional dialog wrapper. SimpleSelect uses it for searchable option lists; use it directly for command palettes.",
    imports: [
      'import { Command, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem, CommandShortcut, CommandSeparator, CommandDialog } from "@/ui/primitives/command";',
    ],
    files: ["ui/primitives/command.tsx"],
    props: [
      ["title", "string", "CommandDialog accessible title", '"Command Palette"'],
      [
        "description",
        "string",
        "CommandDialog accessible description",
        '"Search for a command to run..."',
      ],
      ["showCloseButton", "boolean", "Dialog close control", "false"],
      ["...", "Command.Props", "Base UI props pass through"],
    ],
    related: ["simple-select", "search-bar", "kbd"],
  },
];

export const getUIEntry = (slug: string): UIEntry | undefined =>
  uiCatalog.find((entry) => entry.slug === slug);

export const uiEntriesByGroup = (): { group: UIGroup; entries: UIEntry[] }[] =>
  uiGroups
    .map((group) => ({
      group,
      entries: uiCatalog.filter((entry) => entry.group === group),
    }))
    .filter(({ entries }) => entries.length > 0);

export const uiEntryPath = (slug: string) => `${uiLibrary.basePath}/${slug}`;

export const uiSourceUrl = (file: string) =>
  `${uiLibrary.repo}/blob/${uiLibrary.branch}/${file}`;

/** Ordered neighbours for previous/next navigation, following group order. */
export const uiEntryNeighbours = (slug: string) => {
  const ordered = uiEntriesByGroup().flatMap(({ entries }) => entries);
  const index = ordered.findIndex((entry) => entry.slug === slug);
  return {
    previous: index > 0 ? ordered[index - 1] : undefined,
    next: index >= 0 && index < ordered.length - 1 ? ordered[index + 1] : undefined,
  };
};
