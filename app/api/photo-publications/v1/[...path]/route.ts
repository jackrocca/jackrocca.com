import { NextRequest } from "next/server";
import { PhotoPublicationService, publicationRequest } from "@/lib/photo-publication";
import { publicationEnvironment, r2PublicationStorage } from "@/lib/publication-storage";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;
async function handle(
  req: NextRequest,
  context: { params: Promise<{ path: string[] }> },
) {
  // Fail closed before constructing a client; a normal deploy does not enable uploads.
  if (process.env.PHOTO_PUBLICATION_ENABLED !== "true")
    return Response.json(
      { error: { code: "disabled", message: "Publication API is not enabled." } },
      { status: 503, headers: { "Cache-Control": "private, no-store" } },
    );
  try {
    const service = new PhotoPublicationService(
      r2PublicationStorage(),
      publicationEnvironment(),
    );
    return publicationRequest(
      req,
      (await context.params).path,
      service,
      process.env.PHOTO_PUBLISHER_TOKEN,
      true,
    );
  } catch {
    return Response.json(
      {
        error: {
          code: "configuration",
          message: "Publication service is not configured.",
        },
      },
      { status: 503, headers: { "Cache-Control": "private, no-store" } },
    );
  }
}
export const GET = handle;
export const POST = handle;
