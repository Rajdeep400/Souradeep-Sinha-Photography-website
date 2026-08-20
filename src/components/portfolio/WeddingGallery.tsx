'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { gsap, prefersReducedMotion } from '@/lib/animation/gsap';
import { useGsapScope } from '@/lib/animation/useGsapScope';

export type GalleryItem = {
  id: number;
  url: string;
  medium_url?: string | null;
  thumb_url?: string | null;
  alt: string;
};

/**
 * Editorial wedding gallery: an asymmetric rhythm of full-width, paired and
 * offset photographs with restrained reveals, plus a minimal lightbox.
 * Motion is deliberately lighter than the homepage hero.
 */
export function WeddingGallery({
  items,
  couple,
  videoUrl,
  poster,
}: {
  items: GalleryItem[];
  couple: string;
  videoUrl: string | null;
  poster: string | null;
}) {
  const [open, setOpen] = useState<number | null>(null);

  const scope = useGsapScope<HTMLDivElement>(({ gsap: g }) => {
    g.utils.toArray<HTMLElement>('[data-reveal]').forEach((figure) => {
      const image = figure.querySelector('img');
      g.fromTo(
        figure,
        { clipPath: 'inset(14% 6% 14% 6%)', opacity: 0.55 },
        {
          clipPath: 'inset(0% 0% 0% 0%)',
          opacity: 1,
          ease: 'power2.out',
          scrollTrigger: { trigger: figure, start: 'top 88%', end: 'top 52%', scrub: 1 },
        },
      );
      if (image) {
        g.fromTo(
          image,
          { scale: 1.08 },
          {
            scale: 1,
            ease: 'none',
            scrollTrigger: { trigger: figure, start: 'top bottom', end: 'bottom top', scrub: 1 },
          },
        );
      }
    });
  }, [items.length]);

  const step = useCallback(
    (delta: number) => {
      setOpen((current) => {
        if (current == null) return current;
        return (current + delta + items.length) % items.length;
      });
    },
    [items.length],
  );

  // lightbox keyboard controls + scroll lock while open
  const lightbox = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    if (open == null) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(null);
      if (event.key === 'ArrowRight') step(1);
      if (event.key === 'ArrowLeft') step(-1);
    };
    window.addEventListener('keydown', onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    lightbox.current?.focus();
    if (!prefersReducedMotion() && lightbox.current) {
      gsap.fromTo(lightbox.current, { opacity: 0 }, { opacity: 1, duration: 0.3 });
    }
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = previous;
    };
  }, [open, step]);

  // repeating editorial rhythm: full, pair, pair, offset
  const layout = (index: number) => {
    const slot = index % 6;
    if (slot === 0) return 'md:col-span-12 aspect-[16/9]';
    if (slot === 1 || slot === 2) return 'md:col-span-6 aspect-[4/5]';
    if (slot === 3) return 'md:col-span-7 aspect-[3/2]';
    if (slot === 4) return 'md:col-span-5 md:mt-16 aspect-[4/5]';
    return 'md:col-span-12 aspect-[2/1]';
  };

  const current = open != null ? items[open] : null;

  return (
    <>
      <div ref={scope} className="grid grid-cols-1 gap-6 md:grid-cols-12 md:gap-8">
        {items.map((item, index) => (
          <figure
            key={item.id}
            data-reveal
            className={`relative w-full overflow-hidden bg-ink/5 ${layout(index)}`}
          >
            <button
              type="button"
              onClick={() => setOpen(index)}
              className="group block h-full w-full cursor-zoom-in focus-visible:outline focus-visible:outline-2 focus-visible:outline-gold"
              aria-label={`Open photograph ${index + 1} of ${items.length} larger`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={item.medium_url || item.url}
                srcSet={
                  [
                    item.thumb_url ? `${item.thumb_url} 600w` : null,
                    item.medium_url ? `${item.medium_url} 1400w` : null,
                    `${item.url} 2400w`,
                  ]
                    .filter(Boolean)
                    .join(', ') || undefined
                }
                sizes="(min-width: 768px) 60vw, 92vw"
                alt={item.alt || `${couple} wedding photograph`}
                className="hero-img"
                loading={index < 2 ? 'eager' : 'lazy'}
                decoding="async"
              />
            </button>
          </figure>
        ))}
      </div>

      {videoUrl ? (
        <div className="mt-16">
          <p className="text-[10px] uppercase tracking-[0.4em] text-ink/45">The film</p>
          <video
            className="mt-5 w-full max-w-full bg-ink"
            src={videoUrl}
            poster={poster ?? undefined}
            controls
            playsInline
            preload="none"
          />
        </div>
      ) : null}

      {current ? (
        <div
          ref={lightbox}
          role="dialog"
          aria-modal="true"
          aria-label={`${couple} — photograph ${open! + 1} of ${items.length}`}
          tabIndex={-1}
          className="fixed inset-0 z-[100] flex flex-col bg-ink/97 outline-none"
          onClick={(event) => {
            if (event.target === event.currentTarget) setOpen(null);
          }}
        >
          <div className="flex items-center justify-between px-5 py-4 text-ivory sm:px-8">
            <p className="text-[11px] uppercase tracking-[0.3em] text-ivory/60">
              {open! + 1} / {items.length}
            </p>
            <button
              type="button"
              onClick={() => setOpen(null)}
              aria-label="Close photograph"
              className="flex h-11 w-11 items-center justify-center border border-ivory/30 text-ivory hover:border-gold hover:text-gold focus-visible:outline focus-visible:outline-2 focus-visible:outline-gold"
            >
              ✕
            </button>
          </div>

          <div className="flex min-h-0 flex-1 items-center justify-center px-4 pb-4 sm:px-8">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              key={current.id}
              src={current.url}
              alt={current.alt || `${couple} wedding photograph`}
              className="max-h-full max-w-full object-contain"
              decoding="async"
            />
          </div>

          <div className="flex items-center justify-center gap-4 px-5 pb-8 sm:px-8">
            <button
              type="button"
              onClick={() => step(-1)}
              aria-label="Previous photograph"
              className="flex h-12 w-12 items-center justify-center border border-ivory/30 text-ivory hover:border-gold hover:text-gold focus-visible:outline focus-visible:outline-2 focus-visible:outline-gold"
            >
              ←
            </button>
            <button
              type="button"
              onClick={() => step(1)}
              aria-label="Next photograph"
              className="flex h-12 w-12 items-center justify-center border border-ivory/30 text-ivory hover:border-gold hover:text-gold focus-visible:outline focus-visible:outline-2 focus-visible:outline-gold"
            >
              →
            </button>
          </div>
        </div>
      ) : null}
    </>
  );
}
