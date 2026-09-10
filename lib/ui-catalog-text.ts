/**
 * Plain-text renderers for the RockUI catalog: the "Copy for agents" button on every
 * component page and the /ui/llms.txt index share these so agents read one consistent story.
 */
import {
  uiCatalog,
  uiEntriesByGroup,
  uiEntryPath,
  uiGroupDescriptions,
  uiLibrary,
  uiSourceUrl,
  type UIEntry,
  type UIProp,
} from "@/lib/ui-catalog";

const formatAgentProp = ([name, type, description, defaultValue]: UIProp) =>
  `  ${name}: ${type}${defaultValue === undefined ? "" : ` = ${defaultValue}`} — ${description}`;

const absolute = (origin: string, path: string) => `${origin.replace(/\/$/, "")}${path}`;

/** What an agent needs to use one component: where it is, what it is for, how to import it. */
export const renderAgentCopy = (entry: UIEntry, origin: string): string => {
  const lines = [
    `${entry.title} — ${uiLibrary.name}`,
    absolute(origin, uiEntryPath(entry.slug)),
    "",
    entry.description,
    "",
    "Import:",
    ...entry.imports.map((statement) => `  ${statement}`),
    "",
    "Source:",
    ...entry.files.map((file) => `  ${uiSourceUrl(file)}`),
  ];
  if (entry.props?.length) {
    lines.push("", "Props:", ...entry.props.map(formatAgentProp));
  }
  if (entry.localNotes) lines.push("", `Local notes: ${entry.localNotes}`);
  if (entry.related?.length) {
    lines.push(
      "",
      `Related: ${entry.related.map((slug) => absolute(origin, uiEntryPath(slug))).join(", ")}`,
    );
  }
  lines.push(
    "",
    `${uiLibrary.name} is a source fork of ${uiLibrary.upstream.name} (${uiLibrary.upstream.url}) living in the ${uiLibrary.repo} repository under ui/. Import from @/ui/…; do not add one-off wrappers when a prop already exists.`,
  );
  return lines.join("\n");
};

export const renderGuideText = (): string =>
  [
    "## Philosophy and conventions",
    "",
    `${uiLibrary.name} is the component library used by jackrocca.com. It is a customized source fork of ${uiLibrary.upstream.name}: React components on shadcn, Base UI and Tailwind CSS with deliberately small prop APIs, so a person or a coding agent writes less UI code and reuses the same desktop and mobile interactions everywhere.`,
    "",
    "Use an existing component before composing primitives or inventing a mobile variant. Prefer its props over duplicating layout, confirmation state or mobile branching. Preserve accessible names, focus management, keyboard controls and reduced-motion behavior when changing the source.",
    "",
    'Wrap the application in KitzeUIProvider with isMobile from a breakpoint query, and place AlertProvider and DialogManager inside it. ResponsiveDialog and DialogManager default to bottom drawers on mobile; SimpleDialog keeps a centered dialog unless mobileView="bottom-drawer". mobileView="keep" is the explicit opt-out.',
    "",
    "Simple and Responsive components have distinct purposes. Simple gives the smaller API for the standard presentation. Responsive adds the choice of a mobile presentation to the same interaction. The dependency direction is Responsive → Simple.",
    "",
    `Source lives in ui/ inside ${uiLibrary.repo}. Import from @/ui/components, @/ui/primitives, @/ui/hooks and @/ui/lib. The library never imports application code. vendor/kitze-ui/ is the unmodified upstream snapshot and is not imported at runtime.`,
  ].join("\n");

/** The full machine-readable index served at /ui/llms.txt. */
export const renderLlmsTxt = (origin: string): string => {
  const sections: string[] = [
    `# ${uiLibrary.name}`,
    "",
    `> ${uiLibrary.tagline} ${uiCatalog.length} components and primitives, documented at ${absolute(origin, uiLibrary.basePath)}.`,
    "",
    renderGuideText(),
    "",
    "## Documentation",
    "",
    `- [Overview](${absolute(origin, uiLibrary.basePath)}): interactive desktop/mobile examples for every component.`,
    `- [Usage guide](${absolute(origin, `${uiLibrary.basePath}/guide`)}): providers, responsive defaults and conventions.`,
    `- [Source](${uiLibrary.repo}/tree/${uiLibrary.branch}/ui): the component fork.`,
    `- [Upstream](${uiLibrary.upstream.url}): ${uiLibrary.upstream.name}, which this library customizes.`,
  ];
  for (const { group, entries } of uiEntriesByGroup()) {
    sections.push("", `## ${group}`, "", uiGroupDescriptions[group], "");
    for (const entry of entries) {
      const props = entry.props?.length
        ? ` Props: ${entry.props.map(([name, type]) => `${name} (${type})`).join(", ")}`
        : "";
      sections.push(
        `- [${entry.title}](${absolute(origin, uiEntryPath(entry.slug))}): ${entry.description} Import: ${entry.imports[0]} Source: ${uiSourceUrl(entry.files[0])}${props}`,
      );
    }
  }
  return `${sections.join("\n")}\n`;
};
