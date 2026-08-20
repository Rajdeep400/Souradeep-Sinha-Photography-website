'use client';

import { useEffect, useRef } from 'react';
import { ScrollTrigger, gsap, prefersReducedMotion } from '@/lib/animation/gsap';

export type Review = {
  id: number;
  name: string;
  quote: string;
  image_url: string | null;
  rating: number;
};

/**
 * Scroll-controlled cylindrical drum. Each review sits on the surface of an
 * invisible cylinder: scroll progress rotates the drum, bringing one review to
 * the flat, readable front while the previous one curves backward and fades.
 * Pure CSS 3D + GSAP ScrollTrigger — no extra libraries.
 */
export function TestimonialDrum({ heading, items }: { heading: string; items: Review[] }) {
  const root = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const scope = root.current;
    if (!scope || items.length === 0) return;

    const mm = gsap.matchMedia();

    const build = (mode: 'desktop' | 'mobile') => () => {
      const cards = gsap.utils.toArray<HTMLElement>('[data-review]', scope);
      const stage = scope.querySelector('[data-drum-stage]') as HTMLElement;
      const step = mode === 'desktop' ? 34 : 42; // degrees between reviews
      const radius = mode === 'desktop' ? 340 : 230; // px from the axis
      const visible = mode === 'desktop' ? 62 : 50; // degrees still on screen

      const place = (progress: number) => {
        const active = progress * (cards.length - 1);
        cards.forEach((card, index) => {
          const offset = index - active;
          const angle = offset * step;
          const distance = Math.abs(angle);
          const opacity = distance > visible ? 0 : 1 - Math.min(1, distance / visible) ** 1.4;
          gsap.set(card, {
            rotateX: -angle,
            y: 0,
            z: -radius,
            transformOrigin: `50% 50% ${radius}px`,
            opacity,
            scale: 1 - Math.min(0.18, distance / 320),
            zIndex: 100 - Math.round(distance),
            pointerEvents: distance < step / 2 ? 'auto' : 'none',
          });
        });
      };

      place(0);

      const trigger = ScrollTrigger.create({
        trigger: scope,
        start: 'top top',
        end: () => `+=${window.innerHeight * Math.max(1.2, cards.length * (mode === 'desktop' ? 0.75 : 0.6))}`,
        pin: stage,
        pinSpacing: true,
        scrub: 0.8,
        invalidateOnRefresh: true,
        onUpdate: (self) => place(self.progress),
      });

      return () => {
        trigger.kill();
        gsap.set(cards, { clearProps: 'all' });
      };
    };

    const ok = '(prefers-reduced-motion: no-preference)';
    mm.add(`(min-width: 768px) and ${ok}`, build('desktop'));
    mm.add(`(max-width: 767.98px) and ${ok}`, build('mobile'));
    mm.add('(prefers-reduced-motion: reduce)', () => {
      gsap.set(gsap.utils.toArray('[data-review]', scope), {
        opacity: 1,
        position: 'relative',
        rotateX: 0,
        z: 0,
      });
    });

    return () => mm.revert();
  }, [items.map((i) => i.id).join(',')]);

  if (items.length === 0) return null;

  return (
    <section ref={root} className="bg-ink text-ivory">
      <div data-drum-stage className="relative flex h-[100svh] w-full flex-col justify-center overflow-hidden">
        <div className="mx-auto w-full max-w-6xl px-5 sm:px-8">
          <h2 className="font-display text-3xl sm:text-5xl">{heading}</h2>
        </div>

        <div
          className="relative mx-auto mt-10 flex w-full max-w-3xl flex-1 items-center px-5 sm:px-8"
          style={{ perspective: '1100px', perspectiveOrigin: '50% 50%' }}
        >
          <div className="relative h-[42vh] w-full" style={{ transformStyle: 'preserve-3d' }}>
            {items.map((item) => (
              <figure
                key={item.id}
                data-review
                className="absolute inset-x-0 top-1/2 mx-auto w-full -translate-y-1/2 text-center"
                style={{ transformStyle: 'preserve-3d', backfaceVisibility: 'hidden' }}
              >
                {item.image_url ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={item.image_url}
                    alt={item.name}
                    className="mx-auto h-16 w-16 rounded-full object-cover sm:h-20 sm:w-20"
                    loading="lazy"
                    decoding="async"
                  />
                ) : null}
                <blockquote className="mx-auto mt-6 max-w-2xl font-display text-2xl leading-snug sm:text-4xl">
                  “{item.quote}”
                </blockquote>
                <figcaption className="mt-5 text-[11px] uppercase tracking-[0.4em] text-gold">
                  {item.name}
                </figcaption>
                {item.rating > 0 ? (
                  <p className="mt-2 text-sm text-gold" aria-label={`${item.rating} out of 5`}>
                    {'★'.repeat(Math.min(5, Math.max(1, item.rating)))}
                  </p>
                ) : null}
              </figure>
            ))}
          </div>
        </div>

        <p className="pb-10 text-center text-[10px] uppercase tracking-[0.4em] text-ivory/35">
          Scroll
        </p>
      </div>
    </section>
  );
}
