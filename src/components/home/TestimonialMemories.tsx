'use client';

import { useGsapScope } from '@/lib/animation/useGsapScope';

type Testimonial = {
  id: number;
  name: string;
  quote: string;
  image_url: string | null;
  rating: number;
};

/** Testimonials treated as memories: layered photograph + quote, gentle depth. */
export function TestimonialMemories({
  heading,
  items,
}: {
  heading: string;
  items: Testimonial[];
}) {
  const scope = useGsapScope<HTMLElement>(({ gsap }) => {
    gsap.utils.toArray<HTMLElement>('[data-memory]').forEach((card, index) => {
      gsap.fromTo(
        card,
        { y: 60, opacity: 0.2, scale: 0.98 },
        {
          y: 0,
          opacity: 1,
          scale: 1,
          ease: 'power2.out',
          scrollTrigger: { trigger: card, start: 'top 88%', end: 'top 55%', scrub: 1 },
        },
      );
      const photo = card.querySelector('[data-memory-photo] img');
      if (photo) {
        gsap.fromTo(
          photo,
          { yPercent: -6 },
          {
            yPercent: 6,
            ease: 'none',
            scrollTrigger: { trigger: card, start: 'top bottom', end: 'bottom top', scrub: 1 },
          },
        );
      }
      void index;
    });
  }, [items.length]);

  if (items.length === 0) return null;

  return (
    <section ref={scope} className="bg-ink text-ivory">
      <div className="mx-auto w-full max-w-6xl px-5 py-24 sm:px-8">
        <h2 className="font-display text-3xl sm:text-5xl">{heading}</h2>

        <div className="mt-16 space-y-20">
          {items.map((item, index) => (
            <figure
              key={item.id}
              data-memory
              className={`grid items-center gap-8 md:grid-cols-[0.45fr_1fr] md:gap-12 ${
                index % 2 === 1 ? 'md:ml-[8%]' : ''
              }`}
            >
              {item.image_url ? (
                <div
                  data-memory-photo
                  className="aspect-[4/5] w-2/3 overflow-hidden md:w-full"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.image_url}
                    alt={item.name}
                    className="hero-img"
                    loading="lazy"
                    decoding="async"
                    sizes="(min-width: 768px) 24vw, 60vw"
                  />
                </div>
              ) : (
                <div className="hidden md:block" aria-hidden />
              )}
              <div>
                <blockquote className="font-display text-2xl leading-snug text-ivory/90 sm:text-4xl">
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
              </div>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
