/** Public identity and external links. Never put account secrets in this module. */
export const site = {
  name: "Jack Rocca",
  substack: "https://substack.com/@jackrocca",
  github: "https://github.com/jackrocca",
  navigation: [
    { label: "Photography", href: "/photography" },
    { label: "Writing", href: "/writing" },
    { label: "Projects", href: "/projects" },
  ],
} as const;
