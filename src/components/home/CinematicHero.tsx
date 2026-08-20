'use client';

import Link from 'next/link';
import { useEffect, useRef } from 'react';
import { ScrollTrigger, gsap } from '@/lib/animation/gsap';

export type HeroFrame = { url: string; alt: string; focal?: string };

type Props = {
  copy: Record<string, string>;
  studioName: string;
  frames: HeroFrame[];
  /** first Featured Wedding — the photograph the hero hands off to */
  handoff: (HeroFrame & { couple: string; location: string; slug: string }) | null;
};

type Mode = 'desktop' | 'tablet' | 'mobile';

const CONFIG: Record<Mode, { scroll: number; push: number; depth: boolean; extras: boolean }> = {
  desktop: { scroll: 6.4, push: 1.34, depth: true, extras: true },
  tablet: { scroll: 4.4, push: 1.26, depth: true, extras: false },
  mobile: { scroll: 2.6, push: 1.16, depth: false, extras: false },
};

/**
 * One pinned master timeline drives all eight scenes:
 * memory -> camera push -> photograph becomes an object -> alpona wipe ->
 * second memory -> memory depth -> brand payoff -> handoff into Featured Weddings.
 * Only transform / opacity / clip-path (CSS vars) are animated.
 */
export function CinematicHero({ copy, studioName, frames, handoff }: Props) {
  const root = useRef<HTMLElement | null>(null);

  const pick = (index: number): HeroFrame | null =>
    frames.length > 0 ? frames[index % frames.length] : null;

  const shotA = pick(0);
  const shotB = pick(1) ?? shotA;
  const far = pick(2) ?? shotA;
  const portrait = pick(3) ?? shotB;
  const detail = pick(4) ?? far;
  const center: HeroFrame | null = handoff ?? pick(1) ?? shotA;

  useEffect(() => {
    const scope = root.current;
    if (!scope) return;

    const q = <T extends Element = HTMLElement>(selector: string) =>
      scope.querySelector(selector) as T | null;

    const mm = gsap.matchMedia();

    const build = (mode: Mode) => () => {
      const cfg = CONFIG[mode];
      const stage = q('[data-stage]')!;
      const shot1 = q('[data-layer="shot1"]')!;
      const shot1Img = q('[data-layer="shot1"] img');
      const matte = q('[data-layer="matte"]')!;
      const wipe = q('[data-layer="shot2"]')!;
      const stroke = q<SVGPathElement>('[data-layer="stroke"] path');
      const ambient = q('[data-layer="ambient"]')!;
      const vignette = q('[data-layer="vignette"]')!;
      const intro = q('[data-layer="intro"]')!;
      const caption = q('[data-layer="caption"]')!;
      const brand = q('[data-layer="brand"]')!;
      const cue = q('[data-layer="cue"]')!;
      const cardCenter = q('[data-layer="center"]')!;
      const cardFar = q('[data-layer="far"]');
      const cardPortrait = q('[data-layer="portrait"]');
      const cardDetail = q('[data-layer="detail"]');
      const depth = cfg.depth
        ? ([cardFar, cardPortrait, cardDetail].filter(Boolean) as HTMLElement[])
        : [];

      // ---- resting state -------------------------------------------------
      gsap.set([shot1, matte], { '--fy': 0, '--fx': 0, '--fr': 0 });
      gsap.set(shot1, { scale: 1.08, transformOrigin: '50% 48%' });
      gsap.set(shot1Img, { scale: 1.06, yPercent: 0 });
      gsap.set(matte, { opacity: 0 });
      // Scene 1 typography rests visible; the entrance below only introduces it.
      gsap.set(intro, { opacity: 1, y: 0, yPercent: 0 });
      gsap.set(cue, { opacity: 0.9 });
      gsap.set(wipe, { '--wipe': 0, scale: 1.12, opacity: 1 });
      gsap.set(ambient, { opacity: 0 });
      gsap.set(brand, { opacity: 0, letterSpacing: '0.7em', yPercent: 6 });
      gsap.set(caption, { opacity: 0, y: 26 });
      gsap.set(cardCenter, { opacity: 0, scale: 0.82, x: 0, y: 60, rotate: 0 });
      if (cardFar) gsap.set(cardFar, { opacity: 0, xPercent: -18, yPercent: 12, scale: 1.1 });
      if (cardPortrait)
        gsap.set(cardPortrait, { opacity: 0, xPercent: 34, yPercent: 26, scale: 0.9, rotate: 2.2 });
      if (cardDetail)
        gsap.set(cardDetail, { opacity: 0, xPercent: -30, yPercent: 34, scale: 0.86, rotate: -3 });
      if (stroke) {
        const len = stroke.getTotalLength();
        gsap.set(stroke, { strokeDasharray: len, strokeDashoffset: len, opacity: 0 });
      }

      // ---- handoff geometry, recomputed on every refresh ------------------
      const slot = () => document.querySelector('[data-featured-slot]') as HTMLElement | null;
      const target = () => {
        const el = slot();
        const w = cardCenter.offsetWidth || 1;
        const h = cardCenter.offsetHeight || 1;
        if (!el) return { scale: mode === 'mobile' ? 1.02 : 1.06, x: 0, y: 0 };
        const rect = el.getBoundingClientRect();
        const top = window.innerHeight * (mode === 'desktop' ? 0.14 : 0.1);
        const scale = Math.min(el.offsetWidth / w, el.offsetHeight / h);
        return {
          scale,
          x: rect.left + el.offsetWidth / 2 - window.innerWidth / 2,
          y: top + el.offsetHeight / 2 - window.innerHeight / 2,
        };
      };

      const tl = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: {
          trigger: stage,
          start: 'top top',
          end: () => `+=${window.innerHeight * cfg.scroll}`,
          pin: true,
          pinSpacing: true,
          scrub: 1,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          // the pin resizes the document, so it must refresh before the
          // sequence triggers that sit below it
          refreshPriority: 10,
        },
      });

      // On-load entrance (not scrubbed) so the opening frame is composed at rest.
      const entrance = gsap
        .timeline({ defaults: { ease: 'power3.out' } })
        .fromTo(intro, { opacity: 0, y: 28 }, { opacity: 1, y: 0, duration: 1.3 }, 0.15)
        .fromTo(cue, { opacity: 0 }, { opacity: 0.9, duration: 0.8 }, 0.9);

      // SCENE 1 — memory settles
      tl.to(shot1, { scale: 1.04, duration: 6 }, 0)

        // SCENE 2 — camera push (foreground/background separation)
        .to(shot1, { scale: cfg.push, duration: 14, ease: 'power1.inOut' }, 6)
        .to(shot1Img, { yPercent: -6, scale: 1.14, duration: 14, ease: 'power1.inOut' }, 6)
        .to(intro, { yPercent: -34, opacity: 0, duration: 9, immediateRender: false }, 8)
        .to(cue, { opacity: 0, duration: 3, immediateRender: false }, 3)
        .to(vignette, { opacity: 0.85, duration: 12 }, 6)

        // SCENE 3 — the photograph becomes a physical object
        .to(
          [shot1, matte],
          {
            '--fy': mode === 'mobile' ? 16 : 13,
            '--fx': mode === 'mobile' ? 8 : 23,
            '--fr': 2,
            duration: 14,
            ease: 'power2.inOut',
          },
          20,
        )
        .to(shot1, { scale: 1, rotate: mode === 'mobile' ? 0 : -1.1, duration: 14 }, 20)
        .to(matte, { opacity: 1, duration: 8 }, 22)
        .to(ambient, { opacity: 1, duration: 12 }, 22)

        // SCENE 4 — alpona-inspired stroke draws, then becomes the reveal
        .to(stroke, { opacity: 1, duration: 1.5 }, 33)
        .to(stroke, { strokeDashoffset: 0, duration: 9, ease: 'power1.inOut' }, 34)
        .to(wipe, { '--wipe': 118, duration: 9, ease: 'power2.inOut' }, 36)
        .to(wipe, { scale: 1.02, duration: 12 }, 36)
        .to(stroke, { opacity: 0.25, duration: 4 }, 43)
        .to([shot1, matte], { opacity: 0, duration: 4 }, 43)

        // SCENE 5 — second memory
        .to(wipe, { scale: 1, duration: 8, ease: 'power1.out' }, 45)
        .to(caption, { opacity: 1, y: 0, duration: 5 }, 46)
        .to(caption, { opacity: 0, y: -22, duration: 4 }, 54);

      // SCENE 6 — memory depth
      if (cfg.depth) {
        tl.to(wipe, { scale: 1.16, opacity: 0.42, duration: 16, ease: 'power1.inOut' }, 54)
          .to(cardCenter, { opacity: 1, scale: 1, y: 0, duration: 12, ease: 'power2.out' }, 55)
          .to(depth, { opacity: 1, duration: 8 }, 56);
        if (cardFar)
          tl.to(cardFar, { xPercent: -6, yPercent: -2, scale: 1, duration: 18 }, 56);
        if (cardPortrait)
          tl.to(cardPortrait, { xPercent: 16, yPercent: 2, rotate: 1.1, scale: 1, duration: 18 }, 56);
        if (cardDetail)
          tl.to(cardDetail, { xPercent: -14, yPercent: 6, rotate: -1.6, scale: 1, duration: 18 }, 57);
        tl.to(brand, { opacity: 0.5, duration: 8 }, 60);
      } else {
        tl.to(wipe, { scale: 1.08, opacity: 0.5, duration: 12 }, 54).to(
          cardCenter,
          { opacity: 1, scale: 1, y: 0, duration: 12, ease: 'power2.out' },
          55,
        );
      }

      // SCENE 7 — brand payoff: the scattered memories resolve
      tl.to(brand, { opacity: 1, letterSpacing: '0.42em', yPercent: 0, duration: 10 }, 72);
      if (cardFar) tl.to(cardFar, { xPercent: -2, yPercent: -6, scale: 0.94, duration: 12 }, 72);
      if (cardPortrait)
        tl.to(cardPortrait, { xPercent: 10, yPercent: -4, rotate: 0, scale: 0.9, duration: 12 }, 72);
      if (cardDetail)
        tl.to(cardDetail, { xPercent: -8, yPercent: 12, rotate: 0, scale: 0.82, duration: 12 }, 72);
      tl.to(wipe, { opacity: 0.18, scale: 1.2, duration: 12 }, 72);

      // SCENE 8 — the hero photograph becomes the first Featured Wedding
      tl.to(stage, { backgroundColor: '#f4efe6', duration: 10 }, 84)
        .to([vignette, ambient], { opacity: 0, duration: 8 }, 84)
        .to(depth.length ? depth : [], { opacity: 0, duration: 8 }, 84)
        .to(brand, { opacity: 0, yPercent: -8, duration: 8 }, 86)
        .to(
          cardCenter,
          {
            scale: () => target().scale,
            x: () => target().x,
            y: () => target().y,
            duration: 14,
            ease: 'power2.inOut',
          },
          84,
        )
        .to(cardCenter, { opacity: 0, duration: 3 }, 97);

      return () => {
        entrance.kill();
        tl.scrollTrigger?.kill();
        tl.kill();
      };
    };

    const motionOk = '(prefers-reduced-motion: no-preference)';
    mm.add(`(min-width: 1024px) and ${motionOk}`, build('desktop'));
    mm.add(`(min-width: 640px) and (max-width: 1023.98px) and ${motionOk}`, build('tablet'));
    mm.add(`(max-width: 639.98px) and ${motionOk}`, build('mobile'));

    // Reduced motion: no pin, no scrub — one still, composed opening frame.
    mm.add('(prefers-reduced-motion: reduce)', () => {
      gsap.set(scope.querySelectorAll('[data-layer="intro"]'), { opacity: 1, y: 0, yPercent: 0 });
      gsap.set(scope.querySelectorAll('[data-layer="brand"]'), {
        opacity: 0.92,
        yPercent: 0,
        letterSpacing: '0.42em',
      });
      gsap.set(
        scope.querySelectorAll(
          '[data-layer="shot2"], [data-layer="matte"], [data-layer="caption"], [data-layer="cue"], [data-layer="center"], [data-layer="far"], [data-layer="portrait"], [data-layer="detail"], [data-layer="stroke"]',
        ),
        { opacity: 0 },
      );
    });

    const onLoad = () => ScrollTrigger.refresh();
    window.addEventListener('load', onLoad);

    return () => {
      window.removeEventListener('load', onLoad);
      mm.revert();
    };
  }, []);

  const Frame = ({
    frame,
    className,
    layer,
    priority = false,
    sizes,
  }: {
    frame: HeroFrame | null;
    className: string;
    layer: string;
    priority?: boolean;
    sizes?: string;
  }) => (
    <figure data-layer={layer} className={`layer absolute ${className}`}>
      {frame ? (
        /* eslint-disable-next-line @next/next/no-img-element */
        <img
          src={frame.url}
          alt={frame.alt}
          className="hero-img"
          style={{ ['--focal' as string]: frame.focal || '50% 40%' }}
          loading={priority ? 'eager' : 'lazy'}
          fetchPriority={priority ? 'high' : 'auto'}
          sizes={sizes}
          decoding="async"
        />
      ) : (
        <div className="h-full w-full bg-gradient-to-br from-char via-ink to-black" />
      )}
    </figure>
  );

  return (
    <section ref={root} className="relative bg-ink text-ivory">
      <div
        data-stage
        className="relative h-[100svh] w-full overflow-hidden bg-ink"
        style={{ perspective: '1200px' }}
      >
        {/* ambient environment revealed behind the framed photograph */}
        <div
          data-layer="ambient"
          className="layer absolute inset-0"
          style={{
            background:
              'radial-gradient(90% 70% at 50% 55%, rgba(176,141,87,0.16), rgba(10,9,8,0) 62%), linear-gradient(180deg,#100d0b,#0a0908)',
          }}
        />

        {/* SCENE 1–3: the opening photograph, which becomes an object */}
        <div data-layer="matte" className="hero-matte layer absolute inset-0 bg-ivory" />
        <div data-layer="shot1" className="hero-frame layer absolute inset-0 overflow-hidden">
          {shotA ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={shotA.url}
              alt={shotA.alt || copy.hero_title}
              className="hero-img"
              style={{ ['--focal' as string]: shotA.focal || '50% 40%' }}
              fetchPriority="high"
              decoding="async"
            />
          ) : (
            <div className="h-full w-full bg-gradient-to-b from-char to-black" />
          )}
        </div>

        {/* SCENE 4–5: alpona stroke and the memory it reveals */}
        <div data-layer="shot2" className="hero-wipe layer absolute inset-0 overflow-hidden">
          {shotB ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={shotB.url}
              alt={shotB.alt || copy.hero_title}
              className="hero-img"
              style={{ ['--focal' as string]: shotB.focal || '50% 40%' }}
              loading="eager"
              decoding="async"
            />
          ) : (
            <div className="h-full w-full bg-gradient-to-tr from-black via-char to-[#1b1613]" />
          )}
        </div>

        <svg
          data-layer="stroke"
          className="pointer-events-none absolute inset-0 h-full w-full"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          aria-hidden
        >
          {/* alpona-derived single stroke: one continuous curve, no ornament */}
          <path
            d="M-4 62 C 16 40, 30 78, 48 54 S 74 24, 104 44"
            fill="none"
            stroke="#e8d9c0"
            strokeWidth="0.45"
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
          />
        </svg>

        <div data-layer="vignette" className="hero-vignette layer pointer-events-none absolute inset-0" />

        {/* SCENE 6: memory depth */}
        <Frame
          frame={far}
          layer="far"
          className="left-[6%] top-[14%] z-10 hidden h-[52vh] w-[38vw] overflow-hidden lg:block"
          sizes="38vw"
        />
        <div
          data-layer="brand"
          className="layer pointer-events-none absolute inset-x-0 top-1/2 z-20 -translate-y-1/2 px-6 text-center"
        >
          <p className="font-display text-[7vw] uppercase leading-none tracking-wordmark sm:text-[4.4vw]">
            {studioName}
          </p>
          <p className="mx-auto mt-5 max-w-md text-sm text-ivory/60">{copy.hero_payoff_line}</p>
        </div>

        <Frame
          frame={center}
          layer="center"
          className="left-1/2 top-1/2 z-30 h-[62vh] w-[46vh] -translate-x-1/2 -translate-y-1/2 overflow-hidden shadow-[0_40px_120px_rgba(0,0,0,0.55)] sm:h-[68vh] sm:w-[51vh]"
          sizes="(min-width: 1024px) 40vw, 80vw"
        />
        <Frame
          frame={portrait}
          layer="portrait"
          className="bottom-[8%] right-[7%] z-40 hidden h-[40vh] w-[26vh] overflow-hidden shadow-[0_30px_80px_rgba(0,0,0,0.5)] sm:block"
          sizes="26vh"
        />
        <Frame
          frame={detail}
          layer="detail"
          className="bottom-[12%] left-[8%] z-[45] hidden h-[22vh] w-[30vh] overflow-hidden border border-ivory/15 lg:block"
          sizes="30vh"
        />

        {/* SCENE 1 typography — restrained, photography dominates */}
        <div
          data-layer="intro"
          className="layer absolute inset-x-0 bottom-0 z-50 px-6 pb-14 sm:px-10 sm:pb-16"
          style={{ opacity: 0, transform: 'translateY(18px)' }}
        >
          <p className="text-[10px] uppercase tracking-[0.45em] text-ivory/70">
            {copy.hero_kicker}
          </p>
          <div className="mt-4 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="font-display text-2xl leading-tight sm:text-4xl">{copy.hero_title}</h1>
              <p className="mt-2 max-w-md text-sm text-ivory/70">{copy.hero_subtitle}</p>
            </div>
            <Link
              href="/contact"
              className="w-fit border border-ivory/40 px-6 py-3 text-[11px] uppercase tracking-[0.3em] text-ivory transition-colors hover:bg-ivory hover:text-ink"
            >
              {copy.hero_cta_label}
            </Link>
          </div>
        </div>

        <p
          data-layer="caption"
          className="layer absolute inset-x-0 bottom-[16%] z-50 px-8 text-center font-display text-xl text-ivory/90 sm:text-3xl"
        >
          {copy.hero_scene_line}
        </p>

        <div
          data-layer="cue"
          className="layer absolute inset-x-0 bottom-6 z-50 text-center text-[10px] uppercase tracking-[0.4em] text-ivory/45"
        >
          Scroll
        </div>

        <div className="hero-grain pointer-events-none absolute inset-0 z-[60]" aria-hidden />
      </div>
    </section>
  );
}
