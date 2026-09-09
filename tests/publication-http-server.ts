// Local synthetic harness only. Never installed as an application route.
import { createServer } from "node:http";
import { PhotoPublicationService, publicationRequest } from "../lib/photo-publication";
import { servePhotos } from "../lib/photo-http";
import { MemoryPublicationStorage } from "./publication-storage-fixture";
if (process.env.VERCEL || process.env.NODE_ENV === "production")
  throw new Error("Local tests only");
const storage = new MemoryPublicationStorage();
const service = new PhotoPublicationService(storage, "development");
const token = "synthetic-atlas-publisher-secret-at-least-32-characters";
const server = createServer(async (incoming, outgoing) => {
  try {
    const chunks: Buffer[] = [];
    for await (const chunk of incoming) chunks.push(Buffer.from(chunk));
    const data = Buffer.concat(chunks);
    const url = new URL(incoming.url!, storage.origin);
    const req = new Request(url, {
      method: incoming.method,
      headers: incoming.headers as HeadersInit,
      ...(data.length ? { body: data } : {}),
    });
    let response: Response;
    if (url.pathname.startsWith("/test-upload/")) {
      response = new Response(null, {
        status: (await storage.upload(url.href, data)) ? 200 : 403,
      });
    } else if (url.pathname.startsWith("/api/photo-publications/v1/")) {
      response = await publicationRequest(
        req,
        url.pathname.split("/").slice(4),
        service,
        token,
        true,
      );
    } else if (url.pathname.startsWith("/api/photos")) {
      // Synthetic viewer assertion is confined to this non-deployable harness.
      response = await servePhotos(
        req,
        url.pathname.split("/").slice(3),
        incoming.headers["x-synthetic-member"] === "yes",
        service,
      );
    } else response = new Response(null, { status: 404 });
    outgoing.writeHead(response.status, Object.fromEntries(response.headers));
    outgoing.end(Buffer.from(await response.arrayBuffer()));
  } catch {
    outgoing.writeHead(500);
    outgoing.end();
  }
});
server.listen(0, "127.0.0.1", () => {
  const address = server.address();
  if (!address || typeof address === "string") throw new Error("No local address");
  storage.origin = `http://127.0.0.1:${address.port}`;
  process.stdout.write(JSON.stringify({ origin: storage.origin }) + "\n");
});
process.on("SIGTERM", () => server.close(() => process.exit()));
