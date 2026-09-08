import { z } from "zod";
import { State, User } from "./types";
import { AppError } from "./rules";
export const googleProfileSchema = z.object({
  sub: z.string().min(1).max(255),
  email: z.email(),
  email_verified: z.literal(true),
  name: z.string().optional(),
});
export type GoogleProfile = z.infer<typeof googleProfileSchema>;
// This is the one account directory and the one league. No client-supplied league or role is accepted.
export function joinLeagueWithGoogle(
  state: State,
  raw: unknown,
  ownerEmail: string,
): User {
  const profile = googleProfileSchema.parse(raw),
    email = profile.email.trim().toLowerCase();
  if (!z.email().safeParse(ownerEmail).success)
    throw new Error("OWNER_EMAIL is not configured.");
  const role = email === ownerEmail.toLowerCase() ? "admin" : "player";
  const existing = state.users.find((u) => u.googleSub === profile.sub);
  // Never link different Google subjects by email, display name, or a legacy username.
  if (
    state.users.some(
      (u) => u.googleSub !== profile.sub && u.email?.toLowerCase() === email,
    )
  )
    throw new AppError(
      "This email belongs to a different account. Contact the commissioner.",
      409,
    );
  if (existing) {
    existing.email = email;
    // A role change at sign-in also invalidates the account’s previous sessions.
    if (existing.role !== role) {
      existing.role = role;
      existing.sessionVersion++;
    }
    return existing;
  }
  const user: User = {
    id: crypto.randomUUID(),
    googleSub: profile.sub,
    email,
    name: (profile.name?.trim() || email.split("@")[0]).slice(0, 40),
    role,
    sessionVersion: 0,
    createdAt: new Date().toISOString(),
  };
  state.users.push(user);
  return user;
}
