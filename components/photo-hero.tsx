"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import type { Gallery, PhotoView } from "@/lib/photography";

const HOLD_MS = 3500;
const FADE_MS = 1400;

export function PhotoHero() {
  const lastChange = useRef<number | null>(null);
  const [photos, setPhotos] = useState<PhotoView[]>([]);
  const [slots, setSlots] = useState<[number, number]>([0, 1]);
  const [front, setFront] = useState(0);
  const [ready, setReady] = useState<Record<string, boolean>>({});
  const [reducedMotion, setReducedMotion] = useState(true);
  const [hidden, setHidden] = useState(false);
  const [error, setError] = useState(false);
  const [reload, setReload] = useState(0);

  useEffect(() => {
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const syncMotion = () => setReducedMotion(motion.matches);
    const syncVisibility = () => setHidden(document.hidden);
    syncMotion();
    syncVisibility();
    motion.addEventListener("change", syncMotion);
    document.addEventListener("visibilitychange", syncVisibility);
    return () => {
      motion.removeEventListener("change", syncMotion);
      document.removeEventListener("visibilitychange", syncVisibility);
    };
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    setError(false);
    async function loadRating(rating: number) {
      const result: PhotoView[] = [];
      let offset: number | null = 0;
      do {
        const response = await fetch(`/api/photos?rating=${rating}&offset=${offset}`, {
          cache: "no-store",
          credentials: "omit",
          signal: controller.signal,
        });
        if (!response.ok) throw new Error("Photos unavailable");
        const page: Gallery = await response.json();
        result.push(...page.photos.filter((photo) => photo.rating === rating));
        offset = page.nextOffset;
      } while (offset !== null);
      return result;
    }
    Promise.all([loadRating(5), loadRating(4)])
      .then(([five, four]) => {
        if (controller.signal.aborted) return;
        // Mix both ratings throughout the rotation, keeping the strongest opener.
        const selection = Array.from({ length: Math.max(five.length, four.length) })
          .flatMap((_, index) => [five[index], four[index]])
          .filter((photo): photo is PhotoView => Boolean(photo));
        setPhotos(selection);
        setSlots([0, selection.length > 1 ? 1 : 0]);
        setFront(0);
        setReady({});
      })
      .catch(() => {
        if (!controller.signal.aborted) setError(true);
      });
    return () => controller.abort();
  }, [reload]);

  const current = photos[slots[front]];
  const next = photos[slots[1 - front]];
  const playing = !reducedMotion;

  useEffect(() => {
    if (photos.length < 2 || !playing || hidden || !current || !next) {
      lastChange.current = null;
      return;
    }
    if (!ready[current.id] || !ready[next.id]) return;
    lastChange.current ??= Date.now();
    const timer = window.setTimeout(
      () => {
        lastChange.current = Date.now();
        setFront(1 - front);
      },
      Math.max(0, HOLD_MS - (Date.now() - lastChange.current)),
    );
    return () => window.clearTimeout(timer);
  }, [current, next, front, ready, playing, hidden, photos.length]);

  useEffect(() => {
    if (photos.length < 2) return;
    // Keep the outgoing image mounted for the entire dissolve, then preload one ahead.
    const timer = window.setTimeout(() => {
      setSlots((previous) => {
        const upcoming = (previous[front] + 1) % photos.length;
        if (previous[1 - front] === upcoming) return previous;
        const updated: [number, number] = [...previous];
        updated[1 - front] = upcoming;
        return updated;
      });
    }, FADE_MS);
    return () => window.clearTimeout(timer);
  }, [front, photos.length]);

  return (
    <main id="main-content" className="photo-welcome">
      <h1 className="sr-only">Welcome — Jack Rocca</h1>
      <div className="photo-hero" aria-label="Selected photographs by Jack Rocca">
        {slots.map((photoIndex, slot) => {
          const photo = photos[photoIndex];
          if (!photo || (slot === 1 && photos.length === 1)) return null;
          return (
            <div
              key={slot}
              className="photo-hero-slide"
              data-visible={slot === front && Boolean(ready[photo.id])}
              aria-hidden={slot !== front}
            >
              <Image
                key={photo.id}
                src={`/api/photos/image/${photo.id}`}
                alt="Photograph by Jack Rocca"
                fill
                unoptimized
                loading="eager"
                className="object-contain"
                onLoad={() => setReady((previous) => ({ ...previous, [photo.id]: true }))}
                onError={() => {
                  // A withdrawn or unavailable preview must not create a blank slide.
                  setPhotos((previous) =>
                    previous.filter((item) => item.id !== photo.id),
                  );
                  setSlots([0, 0]);
                  setFront(0);
                }}
              />
            </div>
          );
        })}
        {!current && (
          <div className="photo-hero-status" role="status">
            {error ? (
              <button onClick={() => setReload((value) => value + 1)}>Try again</button>
            ) : (
              <span>Welcome.</span>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
