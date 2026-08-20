'use client';

import Link from 'next/link';
import { useGsapScope } from '@/lib/animation/useGsapScope';

/** Emotional close: one line, one invitation, CMS contact details. */
export function ClosingCta({
  heading,
  body,
  settings,
  image,
}: {
  heading: string;
  body: string;
  settings: Record<string, string>;
  image: { url: string; alt: string; focal?: string } | null;
}) {
  const scope = useGsapScope<HTMLElement>(({ gsap, scope }) => {
    const photo = scope.querySelector('[data-cta-photo] img');
    if (photo) {
      gsap.fromTo(
        photo,
        { scale: 1.14, yPercent: -4 },
        {
          scale: 1,
          yPercent: 0,
          ease: 'none',
          scrollTrigger: { trigger: scope, start: 'top bottom', end: 'bottom bottom', scrub: 1 },
        },
      );
    }
    gsap.fromTo(
      scope.querySelectorAll('[data-cta-line]'),
      { y: 40, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        stagger: 0.12,
        duration: 1,
        ease: 'power3.out',
        scrollTrigger: { trigger: scope, start: 'top 70%' },
      },
    );
  }, []);

  // built inline: this is a client component, and lib/content is server-only
  const digits = (settings.whatsapp ?? '').replace(/\D/g, '');
  const whatsapp =
    digits.length >= 8
      ? `https://api.whatsapp.com/send/?phone=${
          digits.length > 10 ? digits : `91${digits}`
        }&text=${encodeURIComponent(
          'Hello Souradeep Sinha Photography, I would like to check availability for my wedding date.',
        )}&type=phone_number&app_absent=0`
      : null;

  return (
    <section ref={scope} className="relative overflow-hidden bg-ink text-ivory">
      <div data-cta-photo className="absolute inset-0">
        {image ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={image.url}
            alt={image.alt}
            className="hero-img opacity-35"
            style={{ ['--focal' as string]: image.focal || '50% 40%' }}
            loading="lazy"
            decoding="async"
            sizes="100vw"
          />
        ) : null}
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/80 to-ink/40" />
      </div>

      <div className="relative mx-auto w-full max-w-4xl px-5 py-32 text-center sm:px-8">
        <p data-cta-line className="text-[10px] uppercase tracking-[0.45em] text-ivory/50">
          {settings.locations}
        </p>
        <h2 data-cta-line className="mt-6 font-display text-4xl leading-tight sm:text-6xl">
          {heading}
        </h2>
        <p data-cta-line className="mx-auto mt-6 max-w-xl text-ivory/70">
          {body}
        </p>
        <div
          data-cta-line
          className="mt-12 flex flex-wrap items-center justify-center gap-4 text-[11px] uppercase tracking-[0.3em]"
        >
          <Link
            href="/contact"
            className="border border-ivory/40 px-7 py-4 transition-colors hover:bg-ivory hover:text-ink"
          >
            Enquire
          </Link>
          {settings.phone ? (
            <a href={`tel:${settings.phone}`} className="px-4 py-4 text-ivory/80 hover:text-gold">
              {settings.phone}
            </a>
          ) : null}
          {whatsapp ? (
            <a
              href={whatsapp}
              target="_blank"
              rel="noreferrer"
              aria-label="Message Souradeep Sinha Photography on WhatsApp"
              className="px-4 py-4 text-ivory/80 hover:text-gold"
            >
              WhatsApp Souradeep Sinha Photography
            </a>
          ) : null}
          {settings.instagram ? (
            <a
              href={settings.instagram_url || `https://instagram.com/${settings.instagram}`}
              target="_blank"
              rel="noreferrer"
              className="px-4 py-4 text-ivory/80 hover:text-gold"
            >
              @{settings.instagram}
            </a>
          ) : null}
        </div>
      </div>
    </section>
  );
}
