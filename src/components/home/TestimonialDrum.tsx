'use client';

import Link from 'next/link';
import {
  useEffect,
  useRef,
  useState,
  type PointerEvent,
} from 'react';

export type Review = {
  id: number;
  name: string;
  quote: string;
  image_url: string | null;
  rating: number;
};

const MAX_REVIEWS = 6;
const AUTOPLAY_TIME = 5000;

export function TestimonialDrum({
  heading,
  items,
}: {
  heading: string;
  items: Review[];
}) {
  const reviews = items.slice(0, MAX_REVIEWS);

  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);

  const swipeStart = useRef<number | null>(null);

  useEffect(() => {
    if (reviews.length <= 1 || paused) return;

    const timer = window.setInterval(() => {
      setActive((current) => (current + 1) % reviews.length);
    }, AUTOPLAY_TIME);

    return () => window.clearInterval(timer);
  }, [reviews.length, paused]);

  if (reviews.length === 0) return null;

  function goTo(index: number) {
    const total = reviews.length;

    setActive(
      ((index % total) + total) % total,
    );
  }

  function getRelativePosition(index: number) {
    const total = reviews.length;

    let position = index - active;

    if (position > total / 2) {
      position -= total;
    }

    if (position < -total / 2) {
      position += total;
    }

    return position;
  }

  function handlePointerDown(
    event: PointerEvent<HTMLDivElement>,
  ) {
    swipeStart.current = event.clientX;
  }

  function handlePointerUp(
    event: PointerEvent<HTMLDivElement>,
  ) {
    if (swipeStart.current === null) return;

    const movement =
      event.clientX - swipeStart.current;

    if (movement > 55) {
      goTo(active - 1);
    }

    if (movement < -55) {
      goTo(active + 1);
    }

    swipeStart.current = null;
  }

  return (
    <section
      className="relative overflow-hidden bg-[#080706] text-ivory"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* ambient gold light */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-[45%] h-[480px] w-[700px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-25 blur-[120px]"
        style={{
          background:
            'radial-gradient(circle, rgba(188,143,70,0.40), transparent 68%)',
        }}
      />

      {/* subtle texture lines */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,.4) 1px, transparent 1px)',
          backgroundSize: '100% 90px',
        }}
      />

      <div className="relative mx-auto max-w-7xl px-5 py-20 sm:px-8 sm:py-24">

        {/* heading */}
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-[10px] uppercase tracking-[0.5em] text-gold">
            Love notes
          </p>

          <h2 className="mt-4 font-display text-4xl sm:text-6xl">
            {heading}
          </h2>

          <p className="mx-auto mt-4 max-w-lg text-sm leading-relaxed text-ivory/45">
            Words from couples whose celebrations
            became part of our story.
          </p>
        </div>

        {/* carousel */}
        <div
          className="relative mx-auto mt-14 h-[420px] max-w-5xl touch-pan-y sm:h-[460px]"
          onPointerDown={handlePointerDown}
          onPointerUp={handlePointerUp}
        >
          {reviews.map((review, index) => {
            const position =
              getRelativePosition(index);

            const isActive = position === 0;
            const isPrevious = position === -1;
            const isNext = position === 1;

            let transform =
              'translate(-50%, -50%) scale(0.72)';

            let opacity = 0;
            let zIndex = 0;
            let filter = 'blur(10px)';

            if (isActive) {
              transform =
                'translate(-50%, -50%) translateX(0) rotateY(0deg) scale(1)';

              opacity = 1;
              zIndex = 30;
              filter = 'blur(0px)';
            }

            if (isPrevious) {
              transform =
                'translate(-50%, -50%) translateX(-57%) rotateY(18deg) scale(0.82)';

              opacity = 0.22;
              zIndex = 10;
              filter = 'blur(2px)';
            }

            if (isNext) {
              transform =
                'translate(-50%, -50%) translateX(57%) rotateY(-18deg) scale(0.82)';

              opacity = 0.22;
              zIndex = 10;
              filter = 'blur(2px)';
            }

            return (
              <article
                key={review.id}
                className="absolute left-1/2 top-1/2 w-[88%] max-w-[680px] transition-all duration-[1100ms] ease-[cubic-bezier(.16,1,.3,1)]"
                style={{
                  transform,
                  opacity,
                  filter,
                  zIndex,
                  pointerEvents:
                    isActive ? 'auto' : 'none',
                }}
              >
                <div className="relative overflow-hidden border border-ivory/10 bg-[#100e0c]/95 px-7 py-10 text-center shadow-[0_30px_90px_rgba(0,0,0,.55)] sm:px-14 sm:py-12">

                  {/* card glow */}
                  <div
                    aria-hidden
                    className="pointer-events-none absolute inset-0"
                    style={{
                      background:
                        'linear-gradient(135deg, rgba(190,145,70,.12), transparent 35%, transparent 70%, rgba(190,145,70,.07))',
                    }}
                  />

                  <div className="relative">
                    {review.image_url ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        src={review.image_url}
                        alt={review.name}
                        className="mx-auto h-16 w-16 rounded-full border border-gold/40 object-cover sm:h-20 sm:w-20"
                        loading="lazy"
                        decoding="async"
                      />
                    ) : (
                      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-gold/35 font-display text-2xl uppercase text-gold sm:h-20 sm:w-20">
                        {review.name.charAt(0)}
                      </div>
                    )}

                    {review.rating > 0 ? (
                      <div
                        className="mt-5 text-xs tracking-[0.35em] text-gold"
                        aria-label={`${review.rating} out of 5 stars`}
                      >
                        {'★'.repeat(
                          Math.min(
                            5,
                            Math.max(
                              1,
                              Math.round(review.rating),
                            ),
                          ),
                        )}
                      </div>
                    ) : null}

                    <blockquote className="mx-auto mt-6 max-w-xl font-display text-2xl leading-[1.35] text-ivory sm:text-[34px]">
                      “{review.quote}”
                    </blockquote>

                    <div className="mx-auto mt-7 h-px w-12 bg-gold/60" />

                    <p className="mt-5 text-[10px] uppercase tracking-[0.42em] text-gold">
                      {review.name}
                    </p>
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        {/* controls */}
        <div className="mt-4 flex items-center justify-center gap-6">
          <button
            type="button"
            onClick={() => goTo(active - 1)}
            aria-label="Previous review"
            className="flex h-11 w-11 items-center justify-center rounded-full border border-ivory/15 text-ivory/60 transition duration-300 hover:border-gold hover:text-gold"
          >
            ←
          </button>

          <div className="flex items-center gap-2">
            {reviews.map((review, index) => (
              <button
                key={review.id}
                type="button"
                onClick={() => goTo(index)}
                aria-label={`Review ${index + 1}`}
                className={`h-[3px] rounded-full transition-all duration-500 ${
                  index === active
                    ? 'w-8 bg-gold'
                    : 'w-3 bg-ivory/20'
                }`}
              />
            ))}
          </div>

          <button
            type="button"
            onClick={() => goTo(active + 1)}
            aria-label="Next review"
            className="flex h-11 w-11 items-center justify-center rounded-full border border-ivory/15 text-ivory/60 transition duration-300 hover:border-gold hover:text-gold"
          >
            →
          </button>
        </div>

        <p className="mt-4 text-center text-[9px] uppercase tracking-[0.4em] text-ivory/30">
          {String(active + 1).padStart(2, '0')}
          {'  /  '}
          {String(reviews.length).padStart(2, '0')}
        </p>

        <div className="mt-8 text-center">
          <Link
            href="/about#reviews"
            className="inline-flex items-center gap-4 border-b border-gold/50 pb-2 text-[10px] uppercase tracking-[0.4em] text-gold transition hover:border-gold hover:text-ivory"
          >
            View all reviews
            <span>→</span>
          </Link>
        </div>
      </div>
    </section>
  );
}