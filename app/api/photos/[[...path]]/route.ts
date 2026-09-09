import { NextRequest, NextResponse } from "next/server";
import { session } from "@/lib/auth";
import { readState } from "@/lib/store";
import { servePhotos } from "@/lib/photo-http";
import { readCatalog, readPreview } from "@/lib/photo-store";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const headers = {
  "Cache-Control": "private, no-store",
  Vary: "Cookie",
  "X-Content-Type-Options": "nosniff",
};
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ path?: string[] }> },
) {
  try {
    // Never trust a client flag, an image URL, or a cached member response.
    const user = req.cookies.has("pick4-session")
      ? await session(req, (await readState()).state)
      : null;
    const signedIn = Boolean(user);
    const route = (await params).path ?? [];
    return servePhotos(req, route, signedIn, {
      catalog: readCatalog,
      preview: readPreview,
    });
  } catch {
    return NextResponse.json(
      { error: "Photographs are temporarily unavailable. Please try again." },
      { status: 503, headers },
    );
  }
}
