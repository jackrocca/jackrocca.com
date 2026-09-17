import { randomBytes, timingSafeEqual, createHash } from "node:crypto";
import { SignJWT, jwtVerify } from "jose";
import { NextRequest, NextResponse } from "next/server";
import { AppError } from "./rules";
import { State, User } from "./types";
export const tokenHash = (token: string) =>
  createHash("sha256").update(token).digest("hex");
export const newToken = () => randomBytes(32).toString("base64url");
export function secret() {
  const value = process.env.SESSION_SECRET;
  if (!value || value.length < 32) throw new Error("SESSION_SECRET is not configured.");
  return new TextEncoder().encode(value);
}
export function safeSecret(input: string, expected: string | undefined) {
  if (!expected) return false;
  return timingSafeEqual(Buffer.from(tokenHash(input)), Buffer.from(tokenHash(expected)));
}
// Session rename, phase A: the site cookie and issuer are read alongside the
// league-era ones, but sign-in still issues only the league-era cookie so a
// rollback to the previous deploy keeps every current member signed in.
export const SESSION_COOKIE = "jackrocca-session";
export const LEGACY_SESSION_COOKIE = "pick4-session";
export const SESSION_ISSUERS = ["jackrocca.com", "pick4"] as const;
export const SESSION_AUDIENCES = ["jackrocca.com", "pick4-league"] as const;
const SESSION_COOKIES = [SESSION_COOKIE, LEGACY_SESSION_COOKIE] as const;
// Cheap pre-check for routes that skip reading state when nobody is signed in.
export function hasSessionCookie(req: NextRequest) {
  return SESSION_COOKIES.some((name) => req.cookies.has(name));
}
async function verifySession(token: string, state: State): Promise<User | null> {
  try {
    const { payload } = await jwtVerify(token, secret(), {
      issuer: [...SESSION_ISSUERS],
      audience: [...SESSION_AUDIENCES],
      algorithms: ["HS256"],
    });
    if (payload.provider !== "google") return null;
    return (
      state.users.find(
        (u) =>
          u.id === payload.sub && u.googleSub && u.sessionVersion === payload.version,
      ) ?? null
    );
  } catch {
    return null;
  }
}
export async function session(req: NextRequest, state: State): Promise<User | null> {
  for (const name of SESSION_COOKIES) {
    const token = req.cookies.get(name)?.value;
    if (!token) continue;
    const user = await verifySession(token, state);
    if (user) return user;
  }
  return null;
}
export async function loginResponse(
  user: User,
  response: NextResponse = NextResponse.json({ ok: true }),
) {
  if (!user.googleSub) throw new Error("A verified Google identity is required.");
  const token = await new SignJWT({
    version: user.sessionVersion,
    provider: "google",
  })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(user.id)
    .setIssuer("pick4")
    .setAudience("pick4-league")
    .setIssuedAt()
    .setExpirationTime("14d")
    .sign(secret());
  response.cookies.set(LEGACY_SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 14 * 86400,
  });
  return response;
}
export function logoutResponse(response: NextResponse) {
  for (const name of SESSION_COOKIES) response.cookies.delete(name);
  return response;
}
export function requireUser(user: User | null) {
  if (!user) throw new AppError("Sign in to continue.", 401);
  return user;
}
export function requireAdmin(user: User | null) {
  if (requireUser(user).role !== "admin")
    throw new AppError("Commissioner access required.", 403);
  return user!;
}
export function sameOrigin(req: NextRequest) {
  if (req.headers.get("origin") !== new URL(req.url).origin)
    throw new AppError("This request must come from the league app.", 403);
}
