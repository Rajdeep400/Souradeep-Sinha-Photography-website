'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { ScrollTrigger, gsap, prefersReducedMotion } from '@/lib/animation/gsap';

export type SequenceItem = {
  id: number;
  title: string;
  meta?: string;
  body?: string;
  image: string | null;
  focal?: string;
  href?: string;
};

/**
 * Editorial scroll sequence: one sticky photographic stage, names scrolling beside it.
 * Photographs are stacked as a deck — each reveal is a clip wipe whose target state is
 * derived from the active index, so slow, fast and reverse scrolling all resolve correctly.
 */
export function StickyMediaSequence({
  items,
  eyebrow,
  heading,
  intro,
  mediaSide = 'left',
  numbered = false,
  isFeaturedSlot = false,
  theme = 'ivory',
}: {
  items: SequenceItem[];
  eyebrow: string;
  heading: string;
  intro?: string;
  mediaSide?: 'left' | 'right';
  numbered?: boolean;
  isFeaturedSlot?: boolean;
  theme?: 'ivory' | 'ink';
}) {
  const root = useRef<HTMLElement | null>(null);
  const media = useRef<(HTMLDivElement | null)[]>([]);
  const [active, setActive] = useState(0);

  useEffect(() => {
    const scope = root.current;
    if (!scope || items.length === 0) return;

    const list = scope.querySelector<HTMLElement>('[data-rows]');
    if (!list) return;

    // One trigger maps list progress to an index. Deterministic in both
    // directions and immune to the hero pin changing document height.
    const count = items.length;
    let current = -1;
    const trigger = ScrollTrigger.create({
      trigger: list,
      start: 'top 72%',
      end: 'bottom 55%',
      refreshPriority: -1,
      onUpdate: (self) => {
        const index = Math.max(0, Math.min(count - 1, Math.floor(self.progress * count)));
        if (index !== current) {
          current = index;
          setActive(index);
        }
      },
      onLeaveBack: () => {
        current = 0;
        setActive(0);
      },
    });

    return () => trigger.kill();
  }, [items.length]);

  useEffect(() => {
    const reduce = prefersReducedMotion();
    media.current.forEach((el, index) => {
      if (!el) return;
      const reveal = index <= active ? 0 : 100;
      if (reduce) {
        gsap.set(el, { ['--reveal']: reveal });
        return;
      }
      gsap.to(el, {
        ['--reveal']: reveal,
        duration: 1.15,
        ease: 'power3.inOut',
        overwrite: 'auto',
      });
      gsap.to(el.querySelector('img'), {
        scale: index === active ? 1 : 1.06,
        duration: 1.4,
        ease: 'power2.out',
        overwrite: 'auto',
      });
    });
  }, [active]);

  if (items.length === 0) return null;

  const dark = theme === 'ink';

  return (
    <section
      ref={root}
      className={dark ? 'relative bg-ink text-ivory' : 'relative bg-ivory text-ink'}
    >
      <div className="mx-auto w-full max-w-7xl px-5 pt-16 sm:px-8 sm:pt-24">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p
              className={`text-[10px] uppercase tracking-[0.45em] ${dark ? 'text-ivory/50' : 'text-ink/45'}`}
            >
              {eyebrow}
            </p>
            <h2 className="mt-3 font-display text-3xl sm:text-5xl">{heading}</h2>
          </div>
          {intro ? (
            <p className={`max-w-sm text-sm ${dark ? 'text-ivory/60' : 'text-ink/60'}`}>{intro}</p>
          ) : null}
        </div>
      </div>

      <div className="mx-auto grid w-full max-w-7xl gap-10 px-5 pb-20 sm:px-8 md:grid-cols-2 md:gap-16">
        {/* sticky photographic stage */}
        <div
          className={`top-[10vh] h-fit md:sticky md:top-[14vh] ${
            mediaSide === 'right' ? 'md:order-2' : ''
          }`}
        >
          <div
            {...(isFeaturedSlot ? { 'data-featured-slot': '' } : {})}
            className="relative aspect-[3/4] w-full overflow-hidden bg-black/5"
          >
            {items.map((item, index) => (
              <div
                key={item.id}
                ref={(el) => {
                  media.current[index] = el;
                }}
                className="seq-media absolute inset-0"
                style={{
                  zIndex: index,
                  ['--reveal' as string]: index === 0 ? 0 : 100,
                }}
              >
                {item.image ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={item.image}
                    alt={item.title}
                    className="hero-img"
                    style={{ ['--focal' as string]: item.focal || '50% 38%' }}
                    loading={index === 0 ? 'eager' : 'lazy'}
                    decoding="async"
                    sizes="(min-width: 768px) 46vw, 92vw"
                  />
                ) : (
                  <div className="h-full w-full bg-gradient-to-br from-char to-ink" />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* scrolling names */}
        <ol data-rows className={mediaSide === 'right' ? 'md:order-1' : ''}>
          {items.map((item, index) => {
            const isActive = index === active;
            const inner = (
              <>
                <div className="flex items-baseline gap-4">
                  {numbered ? (
                    <span
                      className={`font-display text-sm ${dark ? 'text-ivory/40' : 'text-ink/35'}`}
                    >
                      {String(index + 1).padStart(2, '0')}
                    </span>
                  ) : null}
                  <h3
                    className={`font-display text-2xl transition-all duration-700 sm:text-4xl ${
                      isActive
                        ? 'translate-x-0 opacity-100'
                        : dark
                          ? 'opacity-35 sm:-translate-x-1'
                          : 'opacity-30 sm:-translate-x-1'
                    }`}
                  >
                    {item.title}
                  </h3>
                </div>
                {item.meta ? (
                  <p
                    className={`mt-2 text-[11px] uppercase tracking-[0.3em] transition-opacity duration-700 ${
                      isActive ? 'opacity-100 text-gold' : 'opacity-0'
                    }`}
                  >
                    {item.meta}
                  </p>
                ) : null}
                {item.body ? (
                  <p
                    className={`mt-3 max-w-md text-sm transition-opacity duration-700 ${
                      dark ? 'text-ivory/65' : 'text-ink/65'
                    } ${isActive ? 'opacity-100' : 'opacity-0'}`}
                  >
                    {item.body}
                  </p>
                ) : null}
              </>
            );

            return (
              <li
                key={item.id}
                data-row
                className={`flex min-h-[52vh] flex-col justify-center border-t py-8 ${
                  dark ? 'border-ivory/10' : 'border-ink/10'
                }`}
              >
                {item.href ? (
                  <Link href={item.href} className="group block">
                    {inner}
                    <span
                      className={`mt-5 inline-block text-[11px] uppercase tracking-[0.3em] transition-opacity duration-700 ${
                        isActive ? 'opacity-70' : 'opacity-0'
                      }`}
                    >
                      View the wedding →
                    </span>
                  </Link>
                ) : (
                  inner
                )}
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
