"use client";

import Image from "next/image";
import { useCallback, useEffect, useMemo, useState } from "react";

type Img = { url: string; alt: string };

export default function NewsGallery({ images }: { images: Img[] }) {
  const pics = useMemo(() => images?.filter((i) => !!i.url) ?? [], [images]);
  const [open, setOpen] = useState(false);
  const [idx, setIdx] = useState(0);

  const hasMoreThan4 = pics.length > 4;
  const tiles = pics.slice(0, 4); // los primeros 4 para la cuadrícula

  const openAt = (i: number) => {
    setIdx(i);
    setOpen(true);
  };

  const close = () => setOpen(false);

  const prev = useCallback(() => setIdx((i) => (i - 1 + pics.length) % pics.length), [pics.length]);
  const next = useCallback(() => setIdx((i) => (i + 1) % pics.length), [pics.length]);

  // Teclado (ESC, flechas)
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, prev, next]);

  if (!pics.length) return null;

  return (
    <div>
      {/* Grid 2x2 (hasta 4). Si hay >4, el último es "View All" */}
      <div className="grid grid-cols-2 gap-4 max-w-3xl mx-auto">
        {tiles.map((g, i) => {
          const isLastViewAll = hasMoreThan4 && i === 3;
          if (isLastViewAll) {
            return (
              <button
                key={`${g.url}-${i}-viewall`}
                type="button"
                onClick={() => openAt(0)}
                className="relative rounded-xl overflow-hidden border bg-white"
                style={{ borderColor: "#d0d0e0" }}
              >
                <div className="relative w-full h-[200px] md:h-[230px]">
                  <Image
                    src={g.url}
                    alt={g.alt || "View all"}
                    fill
                    className="object-cover"
                    sizes="(min-width:768px) 25vw, 45vw"
                  />
                  <div className="absolute inset-0 bg-black/35" />
                  <span className="absolute inset-0 flex items-center justify-center">
                    <span className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-white font-semibold bg-black/50 backdrop-blur">
                      View All Photos
                      <svg
                        className="h-4 w-4"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden
                      >
                        <path d="M5 12h14" />
                        <path d="M12 5l7 7-7 7" />
                      </svg>
                    </span>
                  </span>
                </div>
              </button>
            );
          }

          return (
            <button
              key={`${g.url}-${i}`}
              type="button"
              onClick={() => openAt(i)}
              className="group relative rounded-xl overflow-hidden border bg-white"
              style={{ borderColor: "#d0d0e0" }}
            >
              <div className="relative w-full h-[200px] md:h-[230px]">
                <Image
                  src={g.url}
                  alt={g.alt || `Photo ${i + 1}`}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                  sizes="(min-width:768px) 25vw, 45vw"
                />
              </div>
            </button>
          );
        })}
      </div>

      {/* LIGHTBOX */}
      {open && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 md:p-6"
          role="dialog"
          aria-modal="true"
          onClick={close}
        >
          <div className="relative w-full max-w-5xl" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={close}
              className="absolute -top-10 right-0 text-white/90 hover:text-white font-semibold"
              aria-label="Close"
            >
              Close ✕
            </button>

            <div className="relative w-full aspect-[16/10] md:aspect-[16/9] rounded-2xl overflow-hidden">
              <Image
                key={pics[idx].url}
                src={pics[idx].url}
                alt={pics[idx].alt || `Photo ${idx + 1}`}
                fill
                className="object-contain bg-black"
                sizes="(min-width:1024px) 900px, 100vw"
                priority
              />
            </div>

            {/* Flechas */}
            <button
              onClick={prev}
              aria-label="Previous"
              className="absolute left-2 top-1/2 -translate-y-1/2 inline-flex h-11 w-11 items-center justify-center rounded-full border-2 text-white/95 bg-black/50 hover:bg-black/70"
              style={{ borderColor: "var(--hs-yellow)" }}
            >
              <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M15 18l-6-6 6-6" />
              </svg>
            </button>
            <button
              onClick={next}
              aria-label="Next"
              className="absolute right-2 top-1/2 -translate-y-1/2 inline-flex h-11 w-11 items-center justify-center rounded-full border-2 text-white/95 bg-black/50 hover:bg-black/70"
              style={{ borderColor: "var(--hs-yellow)" }}
            >
              <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 18l6-6-6-6" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
