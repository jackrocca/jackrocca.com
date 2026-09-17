// Exact, same-origin destinations only; never accept arbitrary OAuth return URLs.
export const AUTH_RETURN_PATHS = [
  "/",
  "/photography",
  "/projects",
  "/pick4",
  "/account",
  "/atlas",
] as const;
export type AuthReturnPath = (typeof AUTH_RETURN_PATHS)[number];
// Unrecognized destinations land on the site account page, not inside the league.
export const DEFAULT_AUTH_RETURN_PATH: AuthReturnPath = "/account";
export function authReturnPath(value: unknown): AuthReturnPath {
  return typeof value === "string" &&
    (AUTH_RETURN_PATHS as readonly string[]).includes(value)
    ? (value as AuthReturnPath)
    : DEFAULT_AUTH_RETURN_PATH;
}
