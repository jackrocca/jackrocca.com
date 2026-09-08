// Exact, same-origin destinations only; never accept arbitrary OAuth return URLs.
export function authReturnPath(value: unknown) {
  return typeof value === "string" &&
    ["/", "/photography", "/pick4", "/account"].includes(value)
    ? value
    : "/pick4";
}
