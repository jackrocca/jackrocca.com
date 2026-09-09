// Loopback-only synthetic integration harness. Never imported by application code.
import { createServer } from "node:http";
import { SignJWT } from "jose";
import { NextRequest } from "next/server";
import { handleAtlasInterface } from "../../lib/atlas-interface";
import { handleAtlasRPC } from "../../lib/atlas-rpc";
import { handleAtlasControl } from "../../lib/atlas-control";
import { handleAtlasTransfer } from "../../lib/atlas-transfers";
import { initialState } from "../../lib/store";
import type { User } from "../../lib/types";

process.env.SESSION_SECRET = "synthetic-atlas-http-integration-session-secret";
const control = new URL(process.env.ATLAS_TEST_CONTROL_ORIGIN!);
if (control.hostname !== "127.0.0.1" || control.protocol !== "http:")
  throw new Error("Synthetic control must be loopback");
const origin = "https://archive.example.invalid";
const owner: User = {
  id: "synthetic-owner",
  googleSub: "synthetic-owner-sub",
  email: "owner@example.invalid",
  name: "Synthetic owner",
  role: "player",
  sessionVersion: 1,
  createdAt: "2026-09-08T00:00:00Z",
};
const member: User = {
  ...owner,
  id: "synthetic-member",
  googleSub: "synthetic-member-sub",
  role: "admin",
};
async function token(user: User) {
  return new SignJWT({ version: 1, provider: "google" })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(user.id)
    .setIssuer("pick4")
    .setAudience("pick4-league")
    .setExpirationTime("1h")
    .sign(new TextEncoder().encode(process.env.SESSION_SECRET));
}
const server = createServer(async (req, res) => {
  try {
    const chunks: Buffer[] = [];
    let size = 0;
    for await (const chunk of req) {
      size += chunk.length;
      if (size > 3 * 1024 * 1024) {
        res.writeHead(413).end();
        return;
      }
      chunks.push(chunk);
    }
    const request = new NextRequest(origin + req.url, {
      method: req.method,
      headers: new Headers(
        Object.entries(req.headers).flatMap(([key, value]) =>
          value === undefined
            ? []
            : [[key, Array.isArray(value) ? value.join(",") : value] as [string, string]],
        ),
      ),
      ...(!["GET", "HEAD"].includes(req.method!) ? { body: Buffer.concat(chunks) } : {}),
    });
    // This loopback-only harness represents the canonical HTTPS website. Translate
    // only its exact local browser origin; preserve hostile origins for CSRF tests.
    if (request.headers.get("origin") === `http://${req.headers.host}`)
      request.headers.set("origin", origin);
    const handler = req.url?.startsWith("/atlas")
      ? handleAtlasInterface
      : req.url?.startsWith("/api/atlas/rpc/")
        ? handleAtlasRPC
        : req.url?.startsWith("/api/atlas/transfers")
          ? handleAtlasTransfer
          : handleAtlasControl;
    const response = await handler(request, {
      readState: async () => ({ ...initialState(), users: [owner, member] }),
      ownerPolicy: { googleSubject: owner.googleSub, email: owner.email, origin },
      config: {
        origin: "https://control.example.invalid",
        environment: "preview",
        deploymentEnvironment: "preview",
        token: "synthetic-gateway-credential-0123456789-abcdefghij",
      },
      fetch: (url, init) => {
        const target = new URL(String(url));
        if (target.origin !== "https://control.example.invalid")
          throw new Error("Unexpected fixture destination");
        return fetch(control.origin + target.pathname + target.search, init);
      },
    });
    res.writeHead(response.status, Object.fromEntries(response.headers));
    res.end(Buffer.from(await response.arrayBuffer()));
  } catch {
    res.writeHead(500).end();
  }
});
server.listen(0, "127.0.0.1", async () => {
  const address = server.address();
  if (!address || typeof address === "string") throw new Error("Missing fixture port");
  console.log(
    JSON.stringify({
      origin: `http://127.0.0.1:${address.port}`,
      ownerCookie: "pick4-session=" + (await token(owner)),
      memberCookie: "pick4-session=" + (await token(member)),
    }),
  );
});
process.on("SIGTERM", () => {
  server.close();
  server.closeAllConnections();
});
