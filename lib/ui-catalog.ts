/**
 * Rocca UI catalog: the single source of truth for the public component library at /ui.
 *
 * Pure data. No React here: the llms.txt route, the site pages and tests all read it.
 * Interactive demos live in components/ui-library/demos/<slug>.tsx and are keyed by slug.
 * Every entry describes a component that exists in ui/; keep `files` accurate because the
 * library links to them and tests verify they exist.
 */

export const uiLibrary = {
  name: "Rocca UI",
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
      "ui/components/SimpleDialogParts.tsx",
      "ui/components/SimpleDialogTypes.ts",
      "ui/hooks/useControlledOpen.ts",
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
