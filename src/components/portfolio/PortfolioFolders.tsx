'use client';

import Link from 'next/link';
import { useCallback, useEffect, useRef, useState } from 'react';
import { gsap, prefersReducedMotion } from '@/lib/animation/gsap';

export type Folder = {
  id: number;
  slug: string;
  couple_names: string;
  location: string;
  wedding_date: string;
  description: string;
  cover_url: string | null;
  focal?: string;
  zoom?: number;
};

/**
 * Animated wedding-folder selector. One folder = one CMS wedding project, shown
 * by its cover photograph only; the full gallery loads on /portfolio/[slug].
 * Order is owned by React state (no DOM reordering); GSAP handles the transition.
 */
export function PortfolioFolders({ projects }: { projects: Folder[] }) {
  const [order, setOrder] = useState<number[]>(() => projects.map((p) => p.id));
  const [ghost, setGhost] = useState<string | null>(projects[0]?.cover_url ?? null);
  const direction = useRef<1 | -1>(1);
  const mounted = useRef(false);
  const stage = useRef<HTMLDivElement | null>(null);

  // keep state in sync if the CMS list changes (publish / delete / reorder)
  useEffect(() => {
    setOrder(projects.map((p) => p.id));
  }, [projects.map((p) => p.id).join(',')]);

  const byId = new Map(projects.map((p) => [p.id, p]));
  const sequence = order.map((id) => byId.get(id)).filter(Boolean) as Folder[];
  const active = sequence[0];
  const previews = sequence.slice(1);

  const go = useCallback((dir: 1 | -1) => {
    direction.current = dir;
    setOrder((current) => {
      if (current.length < 2) return current;
      return dir === 1
        ? [...current.slice(1), current[0]]
        : [current[current.length - 1], ...current.slice(0, -1)];
    });
  }, []);

  const promote = useCallback((id: number) => {
    direction.current = 1;
    setOrder((current) => {
      const index = current.indexOf(id);
      if (index <= 0) return current;
      return [...current.slice(index), ...current.slice(0, index)];
    });
  }, []);

  // cinematic transition whenever the active folder changes
  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true;
      return;
    }
    const scope = stage.current;
    if (!scope || !active) return;
    if (prefersReducedMotion()) {
      setGhost(active.cover_url ?? null);
      return;
    }

    const forward = direction.current === 1;
    const cover = scope.querySelector('[data-active-cover]');
    const lines = scope.querySelectorAll('[data-line]');
    const cards = scope.querySelectorAll('[data-preview]');

    const tl = gsap.timeline({
      defaults: { ease: 'power3.out' },
      onComplete: () => setGhost(active.cover_url ?? null),
    });

    if (cover) {
      tl.fromTo(
        cover,
        {
          clipPath: forward ? 'inset(0% 0% 0% 100%)' : 'inset(0% 100% 0% 0%)',
          scale: 1.06,
          filter: 'blur(6px)',
        },
        {
          clipPath: 'inset(0% 0% 0% 0%)',
          scale: 1,
          filter: 'blur(0px)',
          duration: 0.95,
          ease: 'power3.inOut',
        },
        0,
      );
    }
    tl.fromTo(lines, { y: 26, opacity: 0 }, { y: 0, opacity: 1, stagger: 0.07, duration: 0.6 }, 0.22)
      .fromTo(
        cards,
        { xPercent: forward ? 14 : -14, opacity: 0, scale: 0.94 },
        { xPercent: 0, opacity: 1, scale: 1, stagger: 0.06, duration: 0.7 },
        0.1,
      );

    return () => {
      // If a transition is interrupted (fast clicking), jump it to its finished
      // state before disposing so no layer is left mid-tween or invisible.
      tl.eventCallback('onComplete', null);
      tl.progress(1);
      tl.kill();
      gsap.set([cover, ...Array.from(lines), ...Array.from(cards)].filter(Boolean), {
        clearProps: 'clipPath,filter,opacity,scale,x,xPercent,y',
      });
    };
  }, [active?.id]);

  // touch swipe, without stealing vertical page scroll
  const touch = useRef<{ x: number; y: number } | null>(null);
  const onPointerDown = (event: React.PointerEvent) => {
    touch.current = { x: event.clientX, y: event.clientY };
  };
  const onPointerUp = (event: React.PointerEvent) => {
    if (!touch.current) return;
    const dx = event.clientX - touch.current.x;
    const dy = event.clientY - touch.current.y;
    touch.current = null;
    if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.5) go(dx < 0 ? 1 : -1);
  };

  if (!active) {
    return (
      <section className="bg-ivory text-ink">
        <div className="mx-auto w-full max-w-7xl px-5 py-32 sm:px-8">
          <h1 className="font-display text-4xl">Wedding stories</h1>
          <p className="mt-4 text-ink/60">
            Weddings published in the studio appear here as individual folders.
          </p>
        </div>
      </section>
    );
  }

  const meta = [active.wedding_date, active.location].filter(Boolean).join(' · ');

  return (
    <section
      className="bg-ivory text-ink"
      onKeyDown={(event) => {
        if (event.key === 'ArrowRight') {
          event.preventDefault();
          go(1);
        }
        if (event.key === 'ArrowLeft') {
          event.preventDefault();
          go(-1);
        }
      }}
    >
      <div className="mx-auto w-full max-w-7xl px-5 pb-16 pt-28 sm:px-8 sm:pt-32">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-[10px] uppercase tracking-[0.45em] text-ink/45">Wedding stories</p>
            <h1 className="mt-3 font-display text-3xl sm:text-5xl">Portfolio</h1>
          </div>
          <p className="font-display text-sm text-ink/45">
            {String(projects.findIndex((p) => p.id === active.id) + 1).padStart(2, '0')} /{' '}
            {String(projects.length).padStart(2, '0')}
          </p>
        </div>

        <div
          ref={stage}
          onPointerDown={onPointerDown}
          onPointerUp={onPointerUp}
          className="relative mt-8 aspect-[3/4] w-full overflow-hidden rounded-[26px] bg-char shadow-[0_45px_120px_rgba(10,9,8,0.35)] sm:aspect-[16/10] lg:aspect-[16/9]"
        >
          {/* previous cover stays beneath for visual continuity */}
          {ghost ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img src={ghost} alt="" aria-hidden className="hero-img absolute inset-0" />
          ) : null}

          {active.cover_url ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              key={active.id}
              data-active-cover
              src={active.cover_url}
              alt={`${active.couple_names} — wedding photography${
                active.location ? ` in ${active.location}` : ''
              }`}
              className="hero-img absolute inset-0"
              style={{
                ['--focal' as string]: active.focal || '50% 36%',
                ['--zoom' as string]: String(active.zoom || 1),
              }}
              sizes="(min-width: 1024px) 90vw, 100vw"
              decoding="async"
            />
          ) : null}

          <div
            className="absolute inset-0"
            style={{
              background:
                'linear-gradient(90deg, rgba(8,7,6,0.86) 0%, rgba(8,7,6,0.55) 38%, rgba(8,7,6,0.1) 68%, rgba(8,7,6,0.45) 100%)',
            }}
            aria-hidden
          />

          {/* active wedding information */}
          <div className="absolute inset-x-0 bottom-0 p-6 text-ivory sm:p-10 lg:max-w-[52%]">
            <h2 data-line className="font-display text-3xl leading-tight sm:text-5xl">
              {active.couple_names}
            </h2>
            {meta ? (
              <p data-line className="mt-3 text-[11px] uppercase tracking-[0.32em] text-gold">
                {meta}
              </p>
            ) : null}
            {active.description ? (
              <p data-line className="mt-4 line-clamp-2 max-w-md text-sm text-ivory/75">
                {active.description}
              </p>
            ) : null}
            <div data-line className="mt-6">
              <Link
                href={`/portfolio/${active.slug}`}
                className="inline-block border border-ivory/50 px-7 py-3 text-[11px] uppercase tracking-[0.3em] transition-colors hover:bg-ivory hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-gold"
              >
                See more
              </Link>
            </div>
          </div>

          {/* upcoming folders — desktop, inside the stage */}
          <div className="pointer-events-none absolute inset-y-0 right-6 hidden items-center gap-0 lg:flex xl:right-10">
            {previews.slice(0, 3).map((project) => (
              <button
                key={project.id}
                data-preview
                type="button"
                onClick={() => promote(project.id)}
                className="pointer-events-auto -ml-6 w-[13rem] shrink-0 text-left transition-transform duration-500 first:ml-0 hover:-translate-y-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-gold xl:w-[15rem]"
                aria-label={`Show ${project.couple_names}`}
              >
                <span className="block aspect-[2/3] w-full overflow-hidden rounded-[20px] shadow-[0_35px_70px_rgba(0,0,0,0.55)] ring-1 ring-white/10">
                  {project.cover_url ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={project.cover_url}
                      alt=""
                      className="hero-img"
                      style={{
                        ['--focal' as string]: project.focal || '50% 36%',
                        ['--zoom' as string]: String(project.zoom || 1),
                      }}
                      loading="lazy"
                      decoding="async"
                      sizes="15rem"
                    />
                  ) : (
                    <span className="block h-full w-full bg-white/5" />
                  )}
                </span>
                <span className="mt-3 block truncate px-1 font-display text-sm text-ivory/90 drop-shadow">
                  {project.couple_names}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* upcoming folders — mobile / tablet, recomposed below the stage */}
        <div className="mt-5 flex gap-4 lg:hidden">
          {previews.slice(0, 2).map((project) => (
            <button
              key={project.id}
              type="button"
              onClick={() => promote(project.id)}
              className="w-1/2 text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-gold"
              aria-label={`Show ${project.couple_names}`}
            >
              <span className="block aspect-[3/4] w-full overflow-hidden rounded-[18px] shadow-[0_20px_45px_rgba(10,9,8,0.3)]">
                {project.cover_url ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={project.cover_url}
                    alt=""
                    className="hero-img"
                    style={{
                      ['--focal' as string]: project.focal || '50% 36%',
                      ['--zoom' as string]: String(project.zoom || 1),
                    }}
                    loading="lazy"
                    decoding="async"
                    sizes="46vw"
                  />
                ) : (
                  <span className="block h-full w-full bg-white/5" />
                )}
              </span>
              <span className="mt-2 block truncate font-display text-sm text-ink/75">
                {project.couple_names}
              </span>
            </button>
          ))}
        </div>

        {projects.length > 1 ? (
          <div className="mt-6 flex items-center justify-between gap-6">
            <p className="text-[10px] uppercase tracking-[0.3em] text-ink/40">
              Swipe or use the arrows
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => go(-1)}
                aria-label="Previous wedding"
                className="flex h-12 w-12 items-center justify-center rounded-full border border-ink/25 text-lg transition-colors hover:border-gold hover:text-gold focus-visible:outline focus-visible:outline-2 focus-visible:outline-gold"
              >
                ←
              </button>
              <button
                type="button"
                onClick={() => go(1)}
                aria-label="Next wedding"
                className="flex h-12 w-12 items-center justify-center rounded-full border border-ink/25 text-lg transition-colors hover:border-gold hover:text-gold focus-visible:outline focus-visible:outline-2 focus-visible:outline-gold"
              >
                →
              </button>
            </div>
          </div>
        ) : null}

        <p aria-live="polite" className="sr-only">
          Showing {active.couple_names}
        </p>

        {/* crawlable / assistive list of every wedding folder */}
        <ul className="sr-only">
          {projects.map((project) => (
            <li key={project.id}>
              <Link href={`/portfolio/${project.slug}`}>
                {project.couple_names} — {project.location}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
