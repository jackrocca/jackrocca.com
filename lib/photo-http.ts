import { NextResponse } from "next/server";
import { canViewPhoto, gallery, type Catalog } from "./photography";
const headers = {
  "Cache-Control": "private, no-store",
  Vary: "Cookie",
  "X-Content-Type-Options": "nosniff",
};
export type GalleryReader = {
  catalog(): Promise<Catalog>;
  preview(path: string): Promise<Uint8Array | ReadableStream<Uint8Array>>;
};
export async function servePhotos(
  req: Request,
  route: string[],
  signedIn: boolean,
  reader: GalleryReader,
) {
  try {
    if (
      route.length &&
      !(route.length === 2 && route[0] === "image" && /^[a-f0-9]{24}$/.test(route[1]))
    )
      return NextResponse.json({ error: "Not found" }, { status: 404, headers });
    const catalog = await reader.catalog();
    if (route[0] === "image") {
      const photo = catalog.photos.find((p) => p.id === route[1]);
      if (!photo || !canViewPhoto(photo, signedIn))
        return NextResponse.json({ error: "Not found" }, { status: 404, headers });
      const preview = await reader.preview(photo.preview);
      return new Response(
        preview instanceof Uint8Array ? new Uint8Array(preview) : preview,
        {
          headers: {
            ...headers,
            "Content-Type": "image/webp",
            "Content-Disposition": "inline",
          },
        },
      );
    }
    const query = new URL(req.url).searchParams;
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
