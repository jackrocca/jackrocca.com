import { z } from "zod";

export interface IconSearchRequest {
  query: string;
  prefixes: string[];
  signal: AbortSignal;
}
export type IconSearch = (request: IconSearchRequest) => Promise<string[]>;
const catalogSchema = z.object({
  uncategorized: z.array(z.string().regex(/^[a-z0-9-]+$/u)),
});
let catalog: string[] | undefined;
export const searchIcons: IconSearch = async ({ query, signal }) => {
  if (!catalog) {
    const response = await fetch(
      "https://api.iconify.design/collection?prefix=lucide",
      { signal }
    );
    if (!response.ok) {
      throw new Error(`Icon catalog failed: ${response.status}`);
    }
    const result = catalogSchema.parse(await response.json());
    catalog = result.uncategorized.toSorted().map((name) => `lucide:${name}`);
  }
  const words = query.toLowerCase().trim().split(/\s+/u);
  return catalog.filter((name) =>
    words.every((word) => name.slice(7).includes(word))
  );
};
