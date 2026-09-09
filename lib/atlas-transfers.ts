import { createHash } from "node:crypto";
import { NextRequest } from "next/server";
import { AtlasAccessError, atlasPrivateHeaders, requireAtlasOwner } from "./atlas-access";
import {
  configuredAtlasControl,
  configuration,
  type handleAtlasControl,
} from "./atlas-control";

type Dependencies = Parameters<typeof handleAtlasControl>[1];
const limit = 3 * 1024 * 1024;
async function bytes(message: Request | Response, maximum: number) {
  if (!message.body) return new Uint8Array();
  const reader = message.body.getReader(),
    chunks: Uint8Array[] = [];
  let size = 0;
  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      size += value.length;
      if (size > maximum) throw new Error("Transfer exceeds its size limit");
      chunks.push(value);
    }
  } finally {
    await reader.cancel();
  }
  const result = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) {
    result.set(chunk, offset);
    offset += chunk.length;
  }
  return result;
}
export async function handleAtlasTransfer(
  req: NextRequest,
  dependencies: Dependencies,
): Promise<Response> {
  const json = (body: unknown, status: number) =>
    Response.json(body, { status, headers: atlasPrivateHeaders });
  try {
    await requireAtlasOwner(req, dependencies.readState, dependencies.ownerPolicy);
    const url = new URL(req.url);
    const match =
      /^\/api\/atlas\/transfers(\/[a-f0-9]{32}(?:\/(?:complete|revoke|parts\/[0-9]+))?)?$/.exec(
        url.pathname,
      );
    if (!match || !["GET", "POST", "PUT"].includes(req.method) || url.search.length > 128)
      return json({ error: "Unknown file transfer route." }, 404);
    const config = configuration(dependencies.config ?? configuredAtlasControl());
    const isPart = /\/parts\/[0-9]+$/.test(url.pathname);
    if (req.method === "PUT" && !isPart)
      return json({ error: "Use the part upload route." }, 405);
    if (Number(req.headers.get("content-length")) > (req.method === "PUT" ? limit : 4096))
      return json({ error: "Transfer request is too large." }, 413);
    const payload =
      req.method === "GET"
        ? undefined
        : await bytes(req, req.method === "PUT" ? limit : 4096);
    const response = await (dependencies.fetch ?? fetch)(
      config.origin + "/v1/transfers" + (match[1] ?? "") + url.search,
      {
        method: req.method,
        body: payload,
        redirect: "error",
        cache: "no-store",
        signal: AbortSignal.timeout(30000),
        headers: {
          Authorization: "Bearer " + config.token,
          "Content-Type":
            req.method === "PUT" ? "application/octet-stream" : "application/json",
          "X-Atlas-Protocol": "atlas-control-v1",
          "X-Atlas-Environment": config.environment,
          ...(req.headers.has("x-atlas-sha256")
            ? { "X-Atlas-SHA256": req.headers.get("x-atlas-sha256")! }
            : {}),
        },
      },
    );
    if (!response.ok) {
      await response.body?.cancel();
      const status = [400, 403, 404, 409, 410, 413, 429].includes(response.status)
        ? response.status
        : 503;
      return json(
        {
          error:
            status === 410
              ? "This transfer expired or was discarded. Select the file again."
              : status === 409
                ? "The transfer is incomplete or its bytes changed. Check the file and resume."
                : "The private file transfer is unavailable.",
        },
        status,
      );
    }
    if (isPart && req.method === "GET") {
      const length = Number(response.headers.get("content-length")),
        hash = response.headers.get("x-atlas-sha256");
      if (
        !Number.isSafeInteger(length) ||
        length < 1 ||
        length > limit ||
        !hash ||
        !/^([a-f0-9]{64})$/.test(hash) ||
        response.headers.get("x-atlas-protocol") !== "atlas-control-v1" ||
        response.headers.get("x-atlas-environment") !== config.environment
      )
        throw new Error("Invalid part");
      const data = await bytes(response, limit);
      if (
        data.length !== length ||
        createHash("sha256").update(data).digest("hex") !== hash
      )
        throw new Error("Invalid part integrity");
      return new Response(data, {
        headers: {
          ...atlasPrivateHeaders,
          "Content-Type": "application/octet-stream",
          "Content-Length": String(length),
          "X-Atlas-SHA256": hash,
        },
      });
    }
    const data = JSON.parse(new TextDecoder().decode(await bytes(response, 300000)));
    if (data.protocol !== "atlas-control-v1" || data.environment !== config.environment)
      throw new Error("Invalid transfer response");
    return json(data, response.status);
  } catch (error) {
    return json(
      {
        error:
          error instanceof AtlasAccessError
            ? error.message
            : "The file transfer was interrupted. Its verified parts are retained for resume.",
      },
      error instanceof AtlasAccessError ? error.status : 503,
    );
  }
}
