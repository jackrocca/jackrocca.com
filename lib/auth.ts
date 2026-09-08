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
  if (!value || value.length < 32)
    throw new Error("SESSION_SECRET is not configured.");
  return new TextEncoder().encode(value);
}
export function safeSecret(input: string, expected: string | undefined) {
  if (!expected) return false;
  return timingSafeEqual(
    Buffer.from(tokenHash(input)),
    Buffer.from(tokenHash(expected)),
  );
}
export async function session(
  req: NextRequest,
  state: State,
): Promise<User | null> {
  const token = req.cookies.get("pick4-session")?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret(), {
      issuer: "pick4",
      audience: "pick4-league",
      algorithms: ["HS256"],
    });
    if (payload.provider !== "google") return null;
    return (
      state.users.find(
        (u) =>
          u.id === payload.sub &&
          u.googleSub &&
          u.sessionVersion === payload.version,
      ) ?? null
    );
  } catch {
    return null;
  }
}
export async function loginResponse(
  user: User,
  response: NextResponse = NextResponse.json({ ok: true }),
) {
  if (!user.googleSub)
    throw new Error("A verified Google identity is required.");
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
  response.cookies.set("pick4-session", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 14 * 86400,
  });
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
