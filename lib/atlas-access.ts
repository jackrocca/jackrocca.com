import { NextRequest } from "next/server";
import { session } from "./auth";
import type { State, User } from "./types";

export const atlasPrivateHeaders = {
  "Cache-Control": "private, no-store, max-age=0",
  Vary: "Cookie",
  "X-Content-Type-Options": "nosniff",
};

export class AtlasAccessError extends Error {
  constructor(
    readonly status: number,
    message: string,
  ) {
    super(message);
  }
}

export type AtlasOwnerPolicy = {
  googleSubject: string | undefined;
  email: string | undefined;
  origin: string | undefined;
};

export function configuredAtlasOwner(): AtlasOwnerPolicy {
  return {
    googleSubject: process.env.ATLAS_OWNER_GOOGLE_SUB,
    email: process.env.ATLAS_OWNER_EMAIL,
    origin: process.env.APP_URL,
  };
}

// Website membership and league admin roles never confer archive access.
// Resolve the current account on every request so revoked sessions stop working.
export async function requireAtlasOwner(
  req: NextRequest,
  readState: () => Promise<State>,
  policy: AtlasOwnerPolicy = configuredAtlasOwner(),
): Promise<User> {
  if (!req.cookies.has("pick4-session"))
    throw new AtlasAccessError(401, "Sign in to access your archive.");
  const user = await session(req, await readState());
  if (!user) throw new AtlasAccessError(401, "Sign in to access your archive.");
  if (!policy.googleSubject?.trim() || !policy.email?.trim() || !policy.origin)
    throw new AtlasAccessError(503, "Private archive access is not configured.");
  let origin: URL;
  try {
    origin = new URL(policy.origin);
    if (
      origin.protocol !== "https:" ||
      origin.username ||
      origin.password ||
      origin.search ||
      origin.hash ||
      origin.pathname !== "/"
    )
      throw new Error("Invalid origin");
  } catch {
    throw new AtlasAccessError(503, "Private archive access is not configured.");
  }
  if (
    user.googleSub !== policy.googleSubject ||
    user.email?.trim().toLowerCase() !== policy.email.trim().toLowerCase()
  )
    throw new AtlasAccessError(403, "This archive is private.");
  // Restrict the archive session to the canonical origin. Do not redirect API
  // mutations or accept forwarded Origin/owner/role headers as authorization.
  if (new URL(req.url).origin !== origin.origin)
    throw new AtlasAccessError(403, "Use the archive's canonical address.");
  if (
    !["GET", "HEAD"].includes(req.method) &&
    req.headers.get("origin") !== origin.origin
  )
    throw new AtlasAccessError(403, "This action must come from your archive.");
  if (req.headers.get("sec-fetch-site") === "cross-site")
    throw new AtlasAccessError(403, "This action must come from your archive.");
  return user;
}
