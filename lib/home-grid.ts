import { site } from "./site";

export type HomeTile = {
  href: string;
  label: string;
  mark: "photography" | "pick4" | "writing";
  external?: boolean;
  /** Add selected portfolio images from public/photos; no stock substitutes. */
  image?: string;
};

export const homeTiles: HomeTile[] = [
  { href: "/photography", label: "Photography", mark: "photography" },
  { href: "/pick4", label: "Open Pick 4", mark: "pick4" },
  {
    href: site.substack,
    label: "Read Jack Rocca on Substack",
    mark: "writing",
    external: true,
  },
];
