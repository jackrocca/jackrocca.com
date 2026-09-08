export const processColor = (c: string | undefined): string | undefined => {
  if (!c) {
    return undefined;
  }
  return c.startsWith("bg-") ? c.slice(3) : c;
};
