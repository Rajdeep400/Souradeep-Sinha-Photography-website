'use client';

import { useGsapScope } from '@/lib/animation/useGsapScope';

type Item = { id: number; title: string; description: string };

/** Why Us as told through photographs and type — no icon grid, restrained parallax. */
export function WhyUsStory({
  heading,
  items,
  images,
}: {
  heading: string;
  items: Item[];
  images: { url: string; alt: string; focal?: string }[];
}) {
  const scope = useGsapScope<HTMLElement>(({ gsap, scope }) => {
    gsap.utils.toArray<HTMLElement>('[data-why-row]').forEach((row) => {
      const image = row.querySelector('[data-why-image] img');
      const text = row.querySelector('[data-why-text]');
      const tl = gsap.timeline({
        scrollTrigger: { trigger: row, start: 'top 85%', end: 'bottom 20%', scrub: 1 },
      });
      if (image) tl.fromTo(image, { yPercent: -7, scale: 1.08 }, { yPercent: 7, scale: 1 }, 0);
      if (text) tl.fromTo(text, { y: 34, opacity: 0.25 }, { y: 0, opacity: 1, duration: 0.4 }, 0);
    });
    void scope;
  }, [items.length, images.length]);

  if (items.length === 0) return null;

  return (
    <section ref={scope} className="bg-ivory">
      <div className="mx-auto w-full max-w-7xl px-5 py-20 sm:px-8">
        <h2 className="max-w-2xl font-display text-3xl sm:text-5xl">{heading}</h2>

        <div className="mt-14 space-y-16 sm:space-y-24">
          {items.map((item, index) => {
            const image = images[index % Math.max(images.length, 1)];
            return (
              <div
                key={item.id}
                data-why-row
                className={`grid items-center gap-8 md:grid-cols-[0.9fr_1.1fr] md:gap-14 ${
                  index % 2 === 1 ? 'md:[&>*:first-child]:order-2' : ''
                }`}
              >
                <div data-why-image className="aspect-[4/5] w-full overflow-hidden bg-ink/5">
                  {image ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={image.url}
                      alt={image.alt || item.title}
                      className="hero-img"
                      style={{ ['--focal' as string]: image.focal || '50% 40%' }}
                      loading="lazy"
                      decoding="async"
                      sizes="(min-width: 768px) 40vw, 92vw"
                    />
                  ) : (
                    <div className="h-full w-full bg-gradient-to-br from-ink/10 to-ink/5" />
                  )}
                </div>
                <div data-why-text>
                  <p className="text-[10px] uppercase tracking-[0.4em] text-gold">
                    {String(index + 1).padStart(2, '0')}
                  </p>
                  <h3 className="mt-4 font-display text-2xl sm:text-4xl">{item.title}</h3>
                  <p className="mt-4 max-w-md text-ink/70">{item.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
