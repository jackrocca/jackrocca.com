import { z } from "zod";

const id = z.string().regex(/^[a-f0-9]{24}$/);
export const photoSchema = z.object({
  id,
  rating: z.number().int().min(1).max(5),
  width: z.number().int().min(1).max(1280),
  height: z.number().int().min(1).max(1280),
  preview: z.string().regex(/^previews\/[a-f0-9]{64}\.webp$/),
  takenAt: z.string().max(10),
  capturedAt: z.string().max(40).optional(),
  place: z.string().max(500),
  people: z.array(z.object({ id, name: z.string().min(1).max(200) })).max(200),
});
export const catalogSchema = z
  .object({
    version: z.literal(1),
    revision: z.string().regex(/^[a-f0-9]{64}$/),
    publishedAt: z.string().datetime(),
    photos: z.array(photoSchema).max(100000),
  })
  .superRefine((catalog, ctx) => {
    if (new Set(catalog.photos.map((p) => p.id)).size !== catalog.photos.length)
      ctx.addIssue({ code: "custom", message: "Duplicate photo IDs" });
  });
export type Catalog = z.infer<typeof catalogSchema>;
export type Photo = z.infer<typeof photoSchema>;
export type PhotoView = Omit<Photo, "preview" | "capturedAt">;
export type Collection = { id: string; name: string; count: number; cover: PhotoView };
export type Gallery = {
  signedIn: boolean;
  revision: string;
  photos: PhotoView[];
  total: number;
  nextOffset: number | null;
  people: Collection[];
  places: Collection[];
};
export const PUBLIC_MIN_RATING = 3;
export const canViewPhoto = (photo: Photo, signedIn: boolean) =>
  photo.rating >= (signedIn ? 1 : PUBLIC_MIN_RATING) && photo.rating <= 5;
export function photoView(photo: Photo, signedIn: boolean): PhotoView {
  const { preview: _privatePath, capturedAt: _captureTime, ...view } = photo;
  return signedIn ? view : { ...view, people: [], place: "", takenAt: "" };
}
// Unknown capture dates follow dated photos; IDs stabilize ties across pages.
export function newestFirst(a: Photo, b: Photo) {
  const timestamp = (photo: Photo) => {
    const value = photo.capturedAt || photo.takenAt;
    if (!value) return Number.NEGATIVE_INFINITY;
    // Atlas stores wall-clock capture times without zones. Compare those in UTC
    // so local publication and Vercel produce the same ordering.
    const normalized = value.replace(" ", "T");
    const date =
      normalized.length > 10 && !/(Z|[+-]\d{2}:?\d{2})$/i.test(normalized)
        ? `${normalized}Z`
        : normalized;
    const time = Date.parse(date);
    return Number.isFinite(time) ? time : Number.NEGATIVE_INFINITY;
  };
  return timestamp(b) - timestamp(a) || a.id.localeCompare(b.id);
}

export function gallery(
  catalog: Catalog,
  signedIn: boolean,
  query: URLSearchParams,
): Gallery {
  const visible = catalog.photos
    .filter((p) => canViewPhoto(p, signedIn))
    .sort(newestFirst);
  const view = (p: Photo) => photoView(p, signedIn);
  const collect = (kind: "people" | "places") => {
    const groups = new Map<string, Collection>();
    for (const photo of visible) {
      const labels =
        kind === "people"
          ? photo.people
          : photo.place
            ? [{ id: photo.place, name: photo.place }]
            : [];
      for (const label of labels) {
        const group = groups.get(label.id);
        if (group) group.count++;
        else groups.set(label.id, { ...label, count: 1, cover: view(photo) });
      }
    }
    // First appearance is the collection’s newest visible photograph.
    return [...groups.values()];
  };
  const offset = Math.max(0, Number(query.get("offset")) || 0);
  if (!Number.isSafeInteger(offset) || offset > 100000) throw new Error("Invalid offset");
  const rating = query.get("rating");
  const q = (query.get("q") ?? "").slice(0, 200).toLocaleLowerCase();
  const filtered = visible.filter(
    (p) =>
      (!rating || String(p.rating) === rating) &&
      (!signedIn ||
        ((!query.get("person") || p.people.some((v) => v.id === query.get("person"))) &&
          (!query.get("place") || p.place === query.get("place")) &&
          (!q ||
            `${p.place} ${p.takenAt} ${p.people.map((v) => v.name).join(" ")}`
              .toLocaleLowerCase()
              .includes(q)))),
  );
  return {
    signedIn,
    revision: catalog.revision,
    photos: filtered.slice(offset, offset + 48).map(view),
    total: filtered.length,
    nextOffset: offset + 48 < filtered.length ? offset + 48 : null,
    people: signedIn ? collect("people") : [],
    places: signedIn ? collect("places") : [],
  };
}
