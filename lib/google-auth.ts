import { OAuth2Client, CodeChallengeMethod } from "google-auth-library";
import { SignJWT, jwtVerify } from "jose";
import { NextRequest, NextResponse } from "next/server";
import { newToken, safeSecret, secret, loginResponse, tokenHash } from "./auth";
import { googleProfileSchema, joinLeagueWithGoogle } from "./google-account";
import { mutate, audit, rateLimit } from "./store";
const FLOW_COOKIE = "pick4-google-flow";
export function googleConfigured() {
  return Boolean(
    process.env.GOOGLE_CLIENT_ID &&
    process.env.GOOGLE_CLIENT_SECRET &&
    process.env.OWNER_EMAIL &&
    process.env.APP_URL,
  );
}
export function appOrigin() {
  const url = new URL(process.env.APP_URL ?? "http://localhost:3106");
  if (process.env.NODE_ENV === "production" && url.protocol !== "https:")
    throw new Error("APP_URL must use HTTPS.");
  return url.origin;
}
function client() {
  if (!googleConfigured()) throw new Error("Google sign-in is not configured.");
  return new OAuth2Client({
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    redirectUri: `${appOrigin()}/api/auth/callback/google`,
  });
}
export async function startGoogle(req: NextRequest) {
  const origin = appOrigin();
  if (new URL(req.url).origin !== origin)
    return NextResponse.redirect(`${origin}/api/auth/google`);
  if (!googleConfigured())
    return NextResponse.redirect(`${origin}/?authError=unavailable`);
  const ip =
    req.headers.get("x-vercel-forwarded-for")?.split(",")[0] ??
    req.headers.get("x-forwarded-for")?.split(",")[0] ??
    "local";
  await rateLimit(`google:${tokenHash(ip)}`, 30);
  const oauth = client(),
    state = newToken(),
    nonce = newToken();
  const { codeVerifier, codeChallenge } =
    await oauth.generateCodeVerifierAsync();
  const flow = await new SignJWT({ state, nonce, codeVerifier })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuer("pick4-oauth")
    .setAudience("google-sign-in")
    .setIssuedAt()
    .setExpirationTime("10m")
    .sign(secret());
  const url = oauth.generateAuthUrl({
    scope: ["openid", "email", "profile"],
    state,
    nonce,
    code_challenge: codeChallenge,
    code_challenge_method: CodeChallengeMethod.S256,
    access_type: "online",
    prompt: "select_account",
  });
  const response = NextResponse.redirect(url);
  response.cookies.set(FLOW_COOKIE, flow, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/api/auth",
    maxAge: 600,
  });
  response.headers.set("Cache-Control", "no-store");
  return response;
}
export async function validateGoogleFlow(flow: string, state: string) {
  const { payload } = await jwtVerify(flow, secret(), {
    issuer: "pick4-oauth",
    audience: "google-sign-in",
    algorithms: ["HS256"],
  });
  if (
    typeof payload.state !== "string" ||
    typeof payload.nonce !== "string" ||
    typeof payload.codeVerifier !== "string" ||
    !safeSecret(state, payload.state)
  )
    throw new Error("Invalid OAuth state.");
  return { nonce: payload.nonce, codeVerifier: payload.codeVerifier };
}
export async function finishGoogle(req: NextRequest) {
  const origin = appOrigin();
  let response = NextResponse.redirect(`${origin}/?authError=failed`);
  try {
    const flow = req.cookies.get(FLOW_COOKIE)?.value;
    const state = req.nextUrl.searchParams.get("state");
    if (!flow || !state) throw new Error("Missing OAuth state.");
    const { nonce, codeVerifier } = await validateGoogleFlow(flow, state);
    if (req.nextUrl.searchParams.get("error")) {
      response = NextResponse.redirect(`${origin}/?authError=canceled`);
    } else {
      const code = req.nextUrl.searchParams.get("code");
      if (!code || code.length > 4096) throw new Error("Missing OAuth code.");
      const oauth = client();
      const { tokens } = await oauth.getToken({ code, codeVerifier });
      if (!tokens.id_token) throw new Error("Missing ID token.");
      const ticket = await oauth.verifyIdToken({
        idToken: tokens.id_token,
        audience: process.env.GOOGLE_CLIENT_ID,
      });
      const payload = ticket.getPayload();
      if (
        !payload ||
        !safeSecret(
          String((payload as unknown as Record<string, unknown>).nonce ?? ""),
          nonce,
        )
      )
        throw new Error("Invalid OAuth nonce.");
      const profile = googleProfileSchema.parse(payload);
      const user = await mutate((state) => {
        const existed = state.users.some((u) => u.googleSub === profile.sub);
        const user = joinLeagueWithGoogle(
          state,
          profile,
          process.env.OWNER_EMAIL!,
        );
        if (!existed)
          audit(
            state,
            user.id,
            "join",
            `${user.name} joined the league with Google.`,
          );
        return user;
      });
      response = await loginResponse(user, NextResponse.redirect(origin));
    }
  } catch {
    // OAuth errors can contain tokens or authorization codes. Never log the raw error.
    console.warn("Google sign-in failed verification or account creation.");
  }
  response.cookies.set(FLOW_COOKIE, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/api/auth",
    maxAge: 0,
  });
  response.headers.set("Cache-Control", "no-store");
  return response;
}
