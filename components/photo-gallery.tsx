"use client";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, Images, MapPin, Search, Users, X } from "lucide-react";
import { CustomButton } from "@/ui/components/CustomButton";
import { SimpleDialog } from "@/ui/components/SimpleDialog";
import { SegmentedControl } from "@/ui/components/SegmentedControl";
import { SimpleSelect } from "@/ui/components/SimpleSelect";
import { Input } from "@/ui/components/Input";
import type { Collection, Gallery, PhotoView } from "@/lib/photography";

const imageUrl = (photo: PhotoView) => `/api/photos/image/${photo.id}`;
export function PhotoGallery() {
  const [data, setData] = useState<Gallery | null>(null);
  const [mode, setMode] = useState("photos"),
    [filter, setFilter] = useState<{
      kind: "person" | "place";
      id: string;
      name: string;
    } | null>(null);
  const [rating, setRating] = useState("all"),
    [search, setSearch] = useState(""),
    [query, setQuery] = useState("");
  const [authError, setAuthError] = useState(false);
  useEffect(() => {
    setAuthError(new URLSearchParams(window.location.search).has("authError"));
  }, []);
  const [error, setError] = useState(""),
    [busy, setBusy] = useState(false),
    [selected, setSelected] = useState<number | null>(null);
  const [reload, setReload] = useState(0);
  const requestId = useRef(0);
  const tileRefs = useRef(new Map<string, HTMLButtonElement>());
  useEffect(() => {
    const t = setTimeout(() => setQuery(search), 250);
    return () => clearTimeout(t);
  }, [search]);
  const load = useCallback(
    async (offset = 0) => {
      const request = ++requestId.current;
      setBusy(true);
      setError("");
      if (!offset) setSelected(null);
      const params = new URLSearchParams();
      if (filter) params.set(filter.kind, filter.id);
      if (rating !== "all") params.set("rating", rating);
      if (query) params.set("q", query);
      if (offset) params.set("offset", String(offset));
      try {
        const response = await fetch(`/api/photos?${params}`, { cache: "no-store" });
        const result = await response.json();
        if (!response.ok) throw new Error(result.error);
        if (request !== requestId.current) return;
        setData((previous) =>
          offset && previous && previous.revision === result.revision
            ? { ...result, photos: [...previous.photos, ...result.photos] }
            : result,
        );
      } catch (e) {
        if (request === requestId.current) {
          setError((e as Error).message);
          setData(null);
        }
      } finally {
        if (request === requestId.current) setBusy(false);
      }
    },
    [filter, rating, query],
  );
  useEffect(() => {
    void load();
    return () => {
      requestId.current++;
    };
  }, [load, reload]);
  useEffect(() => {
    const refresh = () => {
      setData(null);
      setFilter(null);
      setSearch("");
      setQuery("");
      setRating("all");
      setSelected(null);
      setReload((v) => v + 1);
    };
    window.addEventListener("account-changed", refresh);
    // Recheck access after returning from another tab (including signing out).
    const visible = () => {
      if (document.visibilityState === "visible") refresh();
    };
    document.addEventListener("visibilitychange", visible);
    return () => {
      window.removeEventListener("account-changed", refresh);
      document.removeEventListener("visibilitychange", visible);
    };
  }, []);
  const photo = selected === null ? null : data?.photos[selected];
  const closePhoto = () => {
    const id = photo?.id;
    setSelected(null);
    if (id) requestAnimationFrame(() => tileRefs.current.get(id)?.focus());
  };
  const openCollection = (item: Collection, kind: "person" | "place") => {
    setFilter({ kind, id: item.id, name: item.name });
    setMode("photos");
  };
  const collections =
    (mode === "people" ? data?.people : data?.places)?.filter(
      (v) => !search || v.name.toLocaleLowerCase().includes(search.toLocaleLowerCase()),
    ) ?? [];
  return (
    <main
      id="main-content"
      aria-busy={busy}
      className="mx-auto w-full max-w-[1800px] px-3 pb-12 pt-3 sm:px-6 sm:pt-6"
    >
      <h1 className="sr-only">Jack Rocca photography</h1>
      {authError && (
        <p role="alert" className="py-4 text-center text-sm">
          Sign-in was not completed. Please try again.
        </p>
      )}
      {data?.signedIn && (
        <div className="flex flex-wrap items-center justify-between gap-3 py-5">
          <SegmentedControl
            value={mode}
            onChange={(v) => {
              setMode(v);
              setFilter(null);
              setSearch("");
            }}
            options={[
              { value: "photos", label: "Photos", icon: Images },
              { value: "people", label: "People", icon: Users },
              { value: "places", label: "Places", icon: MapPin },
            ]}
          />
          <div
            className={`grid w-full items-center gap-2 sm:w-[360px] ${mode === "photos" ? "grid-cols-[minmax(0,1fr)_140px]" : "grid-cols-1"}`}
          >
            <Input
              aria-label="Search photographs"
              placeholder="Search"
              leftIcon={Search}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="min-h-10 min-w-0 w-full"
              classNames={{ input: "min-w-0" }}
            />
            {mode === "photos" && (
              <SimpleSelect
                aria-label="Star rating"
                value={rating}
                onValueChange={(v) => setRating(v ?? "all")}
                options={[
                  { value: "all", label: "All ratings" },
                  ...[5, 4, 3, 2, 1].map((n) => ({
                    value: String(n),
                    label: `${n} ${n === 1 ? "star" : "stars"}`,
                  })),
                ]}
              />
            )}
          </div>
        </div>
      )}
      {filter && (
        <div className="flex items-center gap-2 pb-4 text-sm">
          <CustomButton
            variant="ghost"
            icon={ArrowLeft}
            aria-label="Clear collection"
            onClick={() => setFilter(null)}
          />
          <span>{filter.name}</span>
          <CustomButton
            variant="ghost"
            icon={X}
            aria-label="Clear collection filter"
            onClick={() => setFilter(null)}
          />
        </div>
      )}
      {error && (
        <div role="alert" className="py-16 text-center text-sm">
          <p>{error}</p>
          <CustomButton variant="ghost" onClick={() => void load()} className="mt-3">
            Try again
          </CustomButton>
        </div>
      )}
      {!data && !error && (
        <div
          role="status"
          aria-label="Loading photographs"
          className="py-24 text-center text-sm text-muted-foreground"
        >
          Loading photographs…
        </div>
      )}
      {data &&
        (mode === "photos" || !data.signedIn ? (
          <>
            <div
              className={`photo-masonry ${data.photos.length <= 2 ? "photo-masonry-small" : ""}`}
            >
              {data.photos.map((item, index) => (
                <CustomButton
                  key={item.id}
                  variant="unstyled"
                  aria-label={`Open photograph ${index + 1}${data.signedIn && item.place ? ` · ${item.place}` : ""}`}
                  onClick={() => setSelected(index)}
                  ref={(node: HTMLButtonElement | null) => {
                    if (node) tileRefs.current.set(item.id, node);
                    else tileRefs.current.delete(item.id);
                  }}
                  className="photo-tile group"
                >
                  <Image
                    src={imageUrl(item)}
                    alt={
                      data.signedIn && item.place
                        ? `Photograph from ${item.place}`
                        : "Photograph by Jack Rocca"
                    }
                    width={item.width}
                    height={item.height}
                    unoptimized
                    loading={index < 2 ? "eager" : "lazy"}
                    className="block h-auto w-full transition-opacity group-hover:opacity-90"
                  />
                </CustomButton>
              ))}
            </div>
            {!data.photos.length && (
              <p className="py-24 text-center text-sm text-muted-foreground">
                No photographs here yet.
              </p>
            )}
            {data.nextOffset !== null && (
              <div className="flex justify-center py-8">
                <CustomButton
                  variant="ghost"
                  loading={busy}
                  onClick={() => void load(data.nextOffset!)}
                >
                  More photographs
                </CustomButton>
              </div>
            )}
          </>
        ) : (
          <div className="grid grid-cols-2 gap-x-3 gap-y-7 sm:grid-cols-3 lg:grid-cols-4">
            {collections.map((item) => (
              <CustomButton
                key={item.id}
                variant="unstyled"
                className="block h-auto w-full p-0 text-left"
                onClick={() =>
                  openCollection(item, mode === "people" ? "person" : "place")
                }
              >
                <Image
                  src={imageUrl(item.cover)}
                  alt=""
                  width={item.cover.width}
                  height={item.cover.height}
                  unoptimized
                  className="aspect-[4/3] w-full object-cover"
                />
                <span className="mt-2 flex items-center justify-between gap-3 text-sm">
                  <span className="truncate">{item.name}</span>
                  <span className="text-muted-foreground tabular-nums">{item.count}</span>
                </span>
              </CustomButton>
            ))}
            {!collections.length && (
              <p className="col-span-full py-20 text-center text-sm text-muted-foreground">
                No {mode} found.
              </p>
            )}
          </div>
        ))}
      {data && !data.signedIn && (
        <div className="flex justify-center py-10">
          <CustomButton
            href="/api/auth/google?returnTo=/"
            variant="ghost"
            rightIcon={ArrowRight}
          >
            Sign in to see more photographs
          </CustomButton>
        </div>
      )}
      <SimpleDialog
        open={Boolean(photo)}
        onOpenChange={(open) => {
          if (!open) closePhoto();
        }}
        title="Photograph"
        size="4xl"
        mobileView="keep"
        classNames={{ content: "photo-loupe", header: "sr-only", body: "min-h-0" }}
      >
        {photo && (
          <div
            onKeyDown={(event) => {
              if (event.key === "ArrowRight" && selected! < data!.photos.length - 1)
                setSelected(selected! + 1);
              if (event.key === "ArrowLeft" && selected! > 0) setSelected(selected! - 1);
            }}
          >
            <Image
              src={imageUrl(photo)}
              alt={
                data?.signedIn && photo.place
                  ? `Photograph from ${photo.place}`
                  : "Photograph by Jack Rocca"
              }
              width={photo.width}
              height={photo.height}
              unoptimized
              className="max-h-[75dvh] w-full object-contain"
            />
            <div className="flex min-h-12 items-center justify-between gap-2 pt-2">
              <CustomButton
                icon={ArrowLeft}
                aria-label="Previous photograph"
                variant="ghost"
                disabled={selected === 0}
                onClick={() => setSelected(selected! - 1)}
              />
              {data?.signedIn && (
                <div className="min-w-0 text-center text-xs text-muted-foreground">
                  <p>{photo.place || photo.takenAt}</p>
                  <p>{photo.people.map((p) => p.name).join(", ")}</p>
                  <span aria-label={`${photo.rating} stars`}>
                    {"★".repeat(photo.rating)}
                  </span>
                </div>
              )}
              <CustomButton
                icon={ArrowRight}
                aria-label="Next photograph"
                variant="ghost"
                disabled={selected === data!.photos.length - 1}
                onClick={() => setSelected(selected! + 1)}
              />
            </div>
          </div>
        )}
      </SimpleDialog>
    </main>
  );
}
