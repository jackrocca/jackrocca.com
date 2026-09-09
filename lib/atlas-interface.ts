import { createHash } from "node:crypto";
import { readFile, realpath } from "node:fs/promises";
import path from "node:path";
import { NextRequest } from "next/server";
import {
  AtlasAccessError,
  atlasPrivateHeaders,
  requireAtlasOwner,
  type AtlasOwnerPolicy,
} from "./atlas-access";
import type { State } from "./types";

const types: Record<string, string> = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".ttf": "font/ttf",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
};
const headers = {
  ...atlasPrivateHeaders,
  "X-Robots-Tag": "noindex, nofollow, noarchive",
  "Referrer-Policy": "no-referrer",
  "X-Frame-Options": "DENY",
};

// The static export is deliberately outside public/. Every byte goes through the
// current owner session. A build manifest is the only file-serving allowlist.
export async function handleAtlasInterface(
  req: NextRequest,
  dependencies: {
    readState: () => Promise<State>;
    ownerPolicy?: AtlasOwnerPolicy;
    bundleRoot?: string;
  },
): Promise<Response> {
  try {
    await requireAtlasOwner(req, dependencies.readState, dependencies.ownerPolicy);
    if (!["GET", "HEAD"].includes(req.method))
      return new Response(null, { status: 405, headers });
    const pathname = new URL(req.url).pathname;
    if (pathname !== "/atlas" && !pathname.startsWith("/atlas/"))
      return new Response(null, { status: 404, headers });
    const relative = pathname.replace(/^\/atlas\/?/, "") || "index.html";
    if (
      !/^[a-zA-Z0-9_./-]+$/.test(relative) ||
      relative.split("/").some((part) => !part || part === "." || part === "..")
    )
      return new Response(null, { status: 404, headers });
    const root = await realpath(
      /* turbopackIgnore: true */
      dependencies.bundleRoot ?? path.join(process.cwd(), "private-atlas-build"),
    );
    const manifest = JSON.parse(
      await readFile(
        /* turbopackIgnore: true */ path.join(root, "manifest.json"),
        "utf8",
      ),
    );
    if (manifest.version !== 1 || manifest.basePath !== "/atlas")
      throw new Error("Invalid bundle");
    // Legacy artwork uses /atlas/earth-night.jpg; the export keeps public/atlas/.
    const file = Object.hasOwn(manifest.files, relative)
      ? relative
      : relative === "earth-night.jpg"
        ? "atlas/earth-night.jpg"
        : relative;
    const entry = Object.hasOwn(manifest.files, file) ? manifest.files[file] : null;
    const contentType = types[path.extname(file)];
    if (!entry || !contentType) return new Response(null, { status: 404, headers });
    const location = await realpath(/* turbopackIgnore: true */ path.join(root, file));
    if (!location.startsWith(root + path.sep)) throw new Error("Invalid bundle path");
    const bytes = await readFile(/* turbopackIgnore: true */ location);
    if (
      bytes.length !== entry.size ||
      createHash("sha256").update(bytes).digest("hex") !== entry.sha256
    )
      throw new Error("Invalid bundle integrity");
    return new Response(req.method === "HEAD" ? null : bytes, {
      headers: {
        ...headers,
        "Content-Type": contentType,
        "Content-Length": String(bytes.length),
        ...(file === "atlas-download-sw.js"
          ? { "Service-Worker-Allowed": "/atlas" }
          : {}),
      },
    });
  } catch (error) {
    const status = error instanceof AtlasAccessError ? error.status : 503;
    if (
      status === 401 &&
      /^\/atlas\/?$/.test(new URL(req.url).pathname) &&
      req.method === "GET"
    )
      return new Response(null, {
        status: 303,
        headers: { ...headers, Location: "/api/auth/google?returnTo=%2Fatlas" },
      });
    return Response.json(
      {
        error:
          error instanceof AtlasAccessError
            ? error.message
            : "The private archive interface is not available yet.",
      },
      { status, headers },
    );
  }
}
