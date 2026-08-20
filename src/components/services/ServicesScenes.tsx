'use client';

import Link from 'next/link';
import { useGsapScope } from '@/lib/animation/useGsapScope';

export type Service = {
  id: number;
  title: string;
  description: string;
  image_url: string | null;
  focal: string;
  zoom: number;
};

/**
 * Scroll-driven service scenes: each service owns a sticky photographic stage
 * that reveals and drifts as it passes. Deliberately lighter than the homepage
 * hero — no pinned master timeline, one scrub per scene.
 */
export function ServicesScenes({ services }: { services: Service[] }) {
  const scope = useGsapScope<HTMLDivElement>(({ gsap }) => {
    gsap.utils.toArray<HTMLElement>('[data-scene]').forEach((scene) => {
      const image = scene.querySelector('[data-scene-image]');
      const frame = scene.querySelector('[data-scene-frame]');
      const copy = scene.querySelectorAll('[data-scene-copy] > *');

      if (frame) {
        gsap.fromTo(
          frame,
          { clipPath: 'inset(10% 8% 10% 8%)' },
          {
            clipPath: 'inset(0% 0% 0% 0%)',
            ease: 'power2.out',
            scrollTrigger: { trigger: scene, start: 'top 90%', end: 'top 30%', scrub: 1 },
          },
        );
      }
      if (image) {
        gsap.fromTo(
          image,
          { scale: 1.16, yPercent: -3 },
          {
            scale: 1,
            yPercent: 3,
            ease: 'none',
            scrollTrigger: { trigger: scene, start: 'top bottom', end: 'bottom top', scrub: 1 },
          },
        );
      }
      gsap.fromTo(
        copy,
        { y: 40, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          stagger: 0.08,
          duration: 0.9,
          ease: 'power3.out',
          scrollTrigger: { trigger: scene, start: 'top 62%' },
        },
      );
    });
  }, [services.map((s) => s.id).join(',')]);

  if (services.length === 0) {
    return <p className="mx-auto max-w-7xl px-5 text-sm text-ink/50">Services added in the studio appear here.</p>;
  }

  return (
    <div ref={scope}>
      {services.map((service, index) => (
        <section key={service.id} data-scene className="relative h-[150svh]">
          <div className="sticky top-0 h-[100svh] w-full overflow-hidden bg-ink">
            <div data-scene-frame className="absolute inset-0 overflow-hidden">
              {service.image_url ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  data-scene-image
                  src={service.image_url}
                  alt={service.title}
                  className="hero-img"
                  style={{
                    ['--focal' as string]: service.focal || '50% 40%',
                    ['--zoom' as string]: String(service.zoom || 1),
                  }}
                  loading={index === 0 ? 'eager' : 'lazy'}
                  decoding="async"
                  sizes="100vw"
                />
              ) : (
                <div className="h-full w-full bg-gradient-to-br from-char to-ink" />
              )}
              <div
                className="absolute inset-0"
                style={{
                  background:
                    'linear-gradient(180deg, rgba(8,7,6,0.45) 0%, rgba(8,7,6,0.15) 40%, rgba(8,7,6,0.88) 100%)',
                }}
                aria-hidden
              />
            </div>

            <div className="absolute inset-x-0 bottom-0 px-5 pb-16 sm:px-10 sm:pb-20">
              <div data-scene-copy className="mx-auto w-full max-w-6xl text-ivory">
                <p className="text-[10px] uppercase tracking-[0.45em] text-gold">
                  {String(index + 1).padStart(2, '0')} — Coverage
                </p>
                <h2 className="mt-4 max-w-3xl font-display text-4xl leading-tight sm:text-7xl">
                  {service.title}
                </h2>
                <p className="mt-5 max-w-xl whitespace-pre-line text-ivory/75">
                  {service.description}
                </p>
                <Link
                  href="/contact"
                  className="mt-8 inline-block border border-ivory/50 px-7 py-3 text-[11px] uppercase tracking-[0.3em] transition-colors hover:bg-ivory hover:text-ink"
                >
                  Enquire about this
                </Link>
              </div>
            </div>
          </div>
        </section>
      ))}
    </div>
  );
}
