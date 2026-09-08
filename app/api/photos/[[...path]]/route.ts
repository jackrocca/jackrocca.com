import { NextRequest, NextResponse } from "next/server";
import { session } from "@/lib/auth";
import { readState } from "@/lib/store";
import { canViewPhoto, gallery } from "@/lib/photography";
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
    if (
      route.length &&
      !(route.length === 2 && route[0] === "image" && /^[a-f0-9]{24}$/.test(route[1]))
    )
      return NextResponse.json({ error: "Not found" }, { status: 404, headers });
    const catalog = await readCatalog();
    if (route[0] === "image") {
      const photo = catalog.photos.find((p) => p.id === route[1]);
      if (!photo || !canViewPhoto(photo, signedIn))
        return NextResponse.json({ error: "Not found" }, { status: 404, headers });
      return new Response(await readPreview(photo.preview), {
        headers: {
          ...headers,
          "Content-Type": "image/webp",
          "Content-Disposition": "inline",
        },
      });
    }
    const query = req.nextUrl.searchParams;
    if (!signedIn && ["person", "place", "q"].some((key) => query.has(key)))
      return NextResponse.json(
        { error: "Sign in to browse the archive." },
        { status: 401, headers },
      );
    if (
      query.has("offset") &&
      (!/^\d{1,6}$/.test(query.get("offset")!) || Number(query.get("offset")) > 100000)
    )
      return NextResponse.json({ error: "Invalid page" }, { status: 400, headers });
    if (query.has("rating") && !/^[1-5]$/.test(query.get("rating")!))
      return NextResponse.json({ error: "Invalid rating" }, { status: 400, headers });
    return NextResponse.json(gallery(catalog, signedIn, query), { headers });
  } catch {
    return NextResponse.json(
      { error: "Photographs are temporarily unavailable. Please try again." },
      { status: 503, headers },
    );
  }
}
