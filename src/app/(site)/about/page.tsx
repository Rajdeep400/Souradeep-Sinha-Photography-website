import type { Metadata } from 'next';
import Link from 'next/link';

import {
  getAboutContent,
  getMedia,
  getSettings,
  getTestimonials,
  siteUrl,
} from '@/lib/content';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'About Souradeep Sinha | Bengali Wedding Photographer in Kolkata',
  description:
    'Souradeep Sinha photographs Bengali weddings with a documentary eye. Based in Kolkata, available across India.',
  alternates: {
    canonical: `${siteUrl()}/about`,
  },
  openGraph: {
    title: 'About Souradeep Sinha Photography',
  },
};

export default function AboutPage() {
  const about = getAboutContent();
  const images = getMedia('about');
  const settings = getSettings();
  const testimonials = getTestimonials();

  const [lead, ...rest] = images;

  return (
    <div className="bg-ivory">
      <section className="mx-auto grid w-full max-w-7xl gap-10 px-5 pb-20 pt-32 sm:px-8 sm:pt-40 md:grid-cols-[1.05fr_0.95fr] md:gap-16">
        <div>
          <p className="text-[10px] uppercase tracking-[0.45em] text-ink/45">
            {settings.locations}
          </p>

          <h1 className="mt-4 font-display text-4xl leading-tight sm:text-6xl">
            {about.heading}
          </h1>

          <p className="mt-6 max-w-xl font-display text-xl leading-relaxed text-ink/80 sm:text-2xl">
            {about.intro}
          </p>
        </div>

        {lead ? (
          <figure className="aspect-[4/5] w-full overflow-hidden bg-ink/5">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={lead.medium_url || lead.url}
              alt={
                lead.alt ||
                `${settings.studio_name} — photographer portrait`
              }
              className="hero-img"
              style={{
                ['--focal' as string]:
                  lead.focal || '50% 38%',
              }}
              fetchPriority="high"
              decoding="async"
              sizes="(min-width: 768px) 46vw, 92vw"
            />
          </figure>
        ) : null}
      </section>

      <section className="mx-auto w-full max-w-3xl px-5 pb-20 sm:px-8">
        <div className="whitespace-pre-line text-lg leading-relaxed text-ink/75">
          {about.body}
        </div>
      </section>

      {rest.length > 0 ? (
        <section className="mx-auto w-full max-w-7xl px-5 pb-24 sm:px-8">
          <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3">
            {rest.map((image, index) => (
              <figure
                key={image.id}
                className={`w-full overflow-hidden bg-ink/5 ${
                  index % 3 === 1
                    ? 'aspect-[4/5] sm:mt-12'
                    : 'aspect-[3/4]'
                }`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={image.medium_url || image.url}
                  alt={image.alt || about.heading}
                  className="hero-img"
                  style={{
                    ['--focal' as string]:
                      image.focal || '50% 40%',
                  }}
                  loading="lazy"
                  decoding="async"
                  sizes="(min-width: 768px) 30vw, 92vw"
                />
              </figure>
            ))}
          </div>
        </section>
      ) : null}

      {testimonials.length > 0 ? (
        <section
          id="reviews"
          className="scroll-mt-36 bg-ink py-24 text-ivory sm:py-32"
        >
          <div className="mx-auto w-full max-w-7xl px-5 sm:px-8">
            <div className="max-w-3xl">
              <p className="text-[10px] uppercase tracking-[0.5em] text-gold">
                From the people we photographed
              </p>

              <h2 className="mt-4 font-display text-4xl sm:text-6xl">
                Kind words
              </h2>

              <p className="mt-5 max-w-xl text-sm leading-relaxed text-ivory/60">
                Stories and notes shared by couples whose celebrations
                became part of our journey.
              </p>
            </div>

            <div className="mt-14 grid gap-5 md:grid-cols-2">
              {testimonials.map((review, index) => (
                <article
                  key={review.id}
                  className="relative overflow-hidden border border-ivory/10 bg-white/[0.035] p-7 transition duration-500 hover:-translate-y-1 hover:border-gold/40 sm:p-9"
                >
                  <div
                    className="pointer-events-none absolute inset-0 opacity-30"
                    style={{
                      background:
                        'linear-gradient(135deg, rgba(194,151,72,0.12), transparent 45%)',
                    }}
                  />

                  <div className="relative">
                    <div className="flex items-center gap-4">
                      {review.image_url ? (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img
                          src={review.image_url}
                          alt={review.name}
                          className="h-12 w-12 rounded-full border border-gold/30 object-cover"
                          loading="lazy"
                          decoding="async"
                        />
                      ) : (
                        <div className="flex h-12 w-12 items-center justify-center rounded-full border border-gold/30 font-display text-xl text-gold">
                          {review.name.charAt(0)}
                        </div>
                      )}

                      <div>
                        <p className="text-[10px] uppercase tracking-[0.3em] text-gold">
                          {review.name}
                        </p>

                        {review.rating > 0 ? (
                          <p
                            className="mt-1 text-xs tracking-[0.2em] text-gold"
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
                          </p>
                        ) : null}
                      </div>
                    </div>

                    <blockquote className="mt-7 font-display text-2xl leading-relaxed text-ivory/90">
                      “{review.quote}”
                    </blockquote>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      <section className="mx-auto w-full max-w-3xl px-5 py-28 sm:px-8">
        {about.closing ? (
          <p className="font-display text-2xl leading-relaxed text-ink/80 sm:text-3xl">
            {about.closing}
          </p>
        ) : null}

        <div className="mt-10 flex flex-wrap gap-4 text-[11px] uppercase tracking-[0.3em]">
          <Link
            href="/contact"
            className="border border-ink px-6 py-3 hover:bg-ink hover:text-ivory"
          >
            Enquire
          </Link>

          <Link
            href="/portfolio"
            className="px-4 py-3 text-ink/70 hover:text-gold"
          >
            See the weddings
          </Link>
        </div>
      </section>
    </div>
  );
}