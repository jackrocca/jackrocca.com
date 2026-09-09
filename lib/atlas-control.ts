import { NextRequest } from "next/server";
import { z } from "zod";
import operations from "./atlas-control-operations.json";
import {
  AtlasAccessError,
  atlasPrivateHeaders,
  requireAtlasOwner,
  type AtlasOwnerPolicy,
} from "./atlas-access";
import type { State } from "./types";

const protocol = "atlas-control-v1";
const identifier = /^[a-f0-9]{32}$/;
const routes = operations.map(({ method, path }) => ({
  method,
  pattern: new RegExp("^" + path.replace(/\{[^}]+\}/g, "[a-zA-Z0-9_-]+") + "$"),
}));
const commandSchema = z
  .object({
    id: z.string().regex(identifier),
    method: z.string(),
    target: z.string(),
    body: z.record(z.string(), z.unknown()),
  })
  .strict()
  .refine(
    (c) =>
      c.target.length <= 4096 &&
      !/[\\\s#\x00-\x1f]/.test(c.target) &&
      (c.method === "GET" ? Object.keys(c.body).length === 0 : !c.target.includes("?")) &&
      routes.some((r) => r.method === c.method && r.pattern.test(c.target.split("?")[0])),
  );
const envelopeSchema = z.object({ command: commandSchema }).strict();
export type AtlasControlConfig = {
  origin?: string;
  environment?: string;
  token?: string;
  deploymentEnvironment?: string;
};
export function configuredAtlasControl(): AtlasControlConfig {
  return {
    origin: process.env.ATLAS_CONTROL_ORIGIN,
    environment: process.env.ATLAS_CONTROL_ENVIRONMENT,
    token: process.env.ATLAS_CONTROL_GATEWAY_TOKEN,
    deploymentEnvironment: process.env.VERCEL_ENV,
  };
}
class ControlError extends Error {
  constructor(
    readonly status: number,
    message: string,
  ) {
    super(message);
  }
}
export function configuration(config: AtlasControlConfig) {
  try {
    const origin = new URL(config.origin ?? "");
    if (
      origin.protocol !== "https:" ||
      origin.username ||
      origin.password ||
      origin.pathname !== "/" ||
      origin.search ||
      origin.hash ||
      !config.token ||
      config.token.length < 40 ||
      !["preview", "production", "development"].includes(config.environment ?? "")
    )
      throw new Error();
    if (
      config.deploymentEnvironment &&
      config.environment !== config.deploymentEnvironment
    )
      throw new Error();
    return {
      origin: origin.origin,
      environment: config.environment!,
      token: config.token,
    };
  } catch {
    throw new ControlError(503, "Private archive connection is not configured.");
  }
}
async function boundedJSON(message: Request | Response, limit: number) {
  if (message.headers.get("content-type")?.split(";")[0].trim() !== "application/json")
    throw new ControlError(415, "JSON is required.");
  if (!message.body) throw new ControlError(400, "A JSON body is required.");
  const reader = message.body.getReader();
  const chunks: Uint8Array[] = [];
  let size = 0;
  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      size += value.length;
      if (size > limit)
        throw new ControlError(413, "Archive request exceeds its size limit.");
      chunks.push(value);
    }
  } finally {
    await reader.cancel();
  }
  const data = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) {
    data.set(chunk, offset);
    offset += chunk.length;
  }
  try {
    return JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(data));
  } catch {
    throw new ControlError(400, "Invalid JSON.");
  }
}
const upstreamErrors: Record<number, string> = {
  400: "Unsupported archive command.",
  404: "Archive item not found.",
  409: "This command conflicts with existing work. Check its status before retrying.",
  413: "Archive request exceeds its size limit.",
  429: "Finish queued archive work before adding more.",
};

// Internal dependency injection supports synthetic integration tests; production
// routes always use current website state and server-only environment credentials.
export async function handleAtlasControl(
  req: NextRequest,
  dependencies: {
    readState: () => Promise<State>;
    ownerPolicy?: AtlasOwnerPolicy;
    config?: AtlasControlConfig;
    fetch?: typeof fetch;
  },
): Promise<Response> {
  const respond = (body: unknown, status = 200) =>
    Response.json(body, { status, headers: atlasPrivateHeaders });
  try {
    await requireAtlasOwner(req, dependencies.readState, dependencies.ownerPolicy);
    const path = new URL(req.url).pathname;
    let endpoint: string;
    let body: string | undefined;
    const catalog =
      /^\/api\/atlas\/catalog\/(head|assets|timeline|suggestions\/(?:person\/[1-9][0-9]*|review-queue)|clusters\/list|clusters\/[1-9][0-9]*\/assets|assets\/[a-zA-Z0-9_-]+|details\/[a-zA-Z0-9_-]+|media\/[a-f0-9]{64}|faces\/[a-zA-Z0-9_-]{1,128}\/crop|workflows\/(?:duplicates|duplicates-summary|summary|places|named-places|tags|saved-searches|people|people-graph|relationships|albums|album-assets\/[1-9][0-9]*|person-assets\/[1-9][0-9]*))$/.exec(
        path,
      );
    const face = !!catalog?.[1].startsWith("faces/");
    const media = face || !!catalog?.[1].startsWith("media/");
    const status = /^\/api\/atlas\/commands\/([a-f0-9]{32})$/.exec(path);
    const review = /^\/api\/atlas\/commands\/([a-f0-9]{32})\/review$/.exec(path);
    const request = /^\/api\/atlas\/commands\/([a-f0-9]{32})\/request$/.exec(path);
    const config = configuration(dependencies.config ?? configuredAtlasControl());
    if (req.method === "POST" && path === "/api/atlas/commands") {
      const parsed = envelopeSchema.safeParse(await boundedJSON(req, 68000));
      if (!parsed.success) throw new ControlError(400, "Unsupported archive command.");
      if (new TextEncoder().encode(JSON.stringify(parsed.data.command)).length > 65536)
        throw new ControlError(413, "Archive request exceeds its size limit.");
      endpoint = "/v1/commands";
      body = JSON.stringify({
        protocol,
        environment: config.environment,
        ...parsed.data,
      });
    } else if (req.method === "GET" && path === "/api/atlas/commands") {
      const query = new URL(req.url).searchParams;
      if (
        [...query.keys()].some((key) => key !== "after") ||
        query.getAll("after").length > 1 ||
        (query.has("after") && !identifier.test(query.get("after")!))
      )
        throw new ControlError(400, "Invalid action-list cursor.");
      endpoint = "/v1/commands" + (query.size ? "?" + query.toString() : "");
    } else if (req.method === "POST" && review) {
      const parsed = z
        .object({ outcome: z.enum(["applied", "not_applied"]) })
        .strict()
        .safeParse(await boundedJSON(req, 256));
      if (!parsed.success)
        throw new ControlError(400, "Choose the outcome you verified in your archive.");
      endpoint = "/v1/commands/" + review[1] + "/review";
      body = JSON.stringify({
        protocol,
        environment: config.environment,
        ...parsed.data,
      });
    } else if (req.method === "GET" && request)
      endpoint = "/v1/commands/" + request[1] + "/request";
    else if (req.method === "GET" && status) endpoint = "/v1/commands/" + status[1];
    else if (req.method === "GET" && path === "/api/atlas/worker")
      endpoint = "/v1/worker";
    else if (req.method === "GET" && catalog) {
      const query = new URL(req.url).search;
      if (query.length > 4096)
        throw new ControlError(400, "Catalog filters are too long.");
      endpoint = "/v1/catalog/" + catalog[1] + query;
    } else throw new ControlError(404, "Unknown archive route.");
    // Forward catalog filters only to fixed read routes. Never forward browser
    // credentials or arbitrary URLs, or retry a mutation with a new identifier.
    let response: Response, payload: unknown;
    try {
      response = await (dependencies.fetch ?? fetch)(config.origin + endpoint, {
        method: req.method,
        redirect: "error",
        cache: "no-store",
        signal: AbortSignal.timeout(15000),
        headers: {
          Authorization: "Bearer " + config.token,
          ...(body ? { "Content-Type": "application/json" } : {}),
        },
        body,
      });
      if (media && response.ok)
        return privatePreview(response, config.environment, face ? 524288 : 16777216);
      payload = await boundedJSON(response, 1100000);
    } catch {
      throw new ControlError(
        503,
        req.method === "POST"
          ? "Archive connection interrupted. Check the same command's status before retrying."
          : "Private archive connection interrupted. Reload this view.",
      );
    }
    if (!response.ok)
      throw new ControlError(
        upstreamErrors[response.status] ? response.status : 503,
        catalog && response.status === 409
          ? "Archive changed. Reload this view to continue."
          : (upstreamErrors[response.status] ??
              "Private archive connection is unavailable."),
      );
    if (
      !payload ||
      typeof payload !== "object" ||
      !("protocol" in payload) ||
      payload.protocol !== protocol ||
      !("environment" in payload) ||
      payload.environment !== config.environment
    )
      throw new ControlError(503, "Private archive response could not be verified.");
    return respond(payload, response.status);
  } catch (error) {
    return respond(
      {
        error:
          error instanceof AtlasAccessError || error instanceof ControlError
            ? error.message
            : "Private archive connection is unavailable.",
      },
      error instanceof AtlasAccessError || error instanceof ControlError
        ? error.status
        : 503,
    );
  }
}

function privatePreview(
  response: Response,
  environment: string,
  maximumBytes: number,
): Response {
  const contentType = response.headers.get("content-type") ?? "";
  const length = Number(response.headers.get("content-length"));
  if (
    !["image/jpeg", "image/png", "image/webp"].includes(contentType) ||
    !response.body ||
    !Number.isSafeInteger(length) ||
    length <= 0 ||
    length > maximumBytes ||
    response.headers.get("x-atlas-protocol") !== protocol ||
    response.headers.get("x-atlas-environment") !== environment
  ) {
    void response.body?.cancel();
    throw new ControlError(503, "Private preview could not be verified.");
  }
  let received = 0;
  const bounded = response.body.pipeThrough(
    new TransformStream<Uint8Array, Uint8Array>({
      transform(chunk, controller) {
        received += chunk.length;
        if (received > length) throw new Error("Invalid preview length");
        controller.enqueue(chunk);
      },
      flush() {
        if (received !== length) throw new Error("Incomplete preview");
      },
    }),
  );
  return new Response(bounded, {
    headers: {
      ...atlasPrivateHeaders,
      "Content-Type": contentType,
      "Content-Length": String(length),
    },
  });
}
