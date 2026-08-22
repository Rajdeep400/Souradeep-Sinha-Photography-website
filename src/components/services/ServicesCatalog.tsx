'use client';

import { useState } from 'react';

export type PublicServicePackage = {
  id: number;
  service_id: number;
  title: string;
  subtitle: string;
  description: string;
  price: string;
  image_url: string | null;
  focal: string;
  zoom: number;
  featured: number;
};

export type PublicService = {
  id: number;
  title: string;
  description: string;
  image_url: string | null;
  focal: string;
  zoom: number;
  packages: PublicServicePackage[];
};

export function ServicesCatalog({
  services,
}: {
  services: PublicService[];
}) {
  const [filter, setFilter] = useState<number | 'all'>('all');
  const [expanded, setExpanded] = useState<number | null>(null);

  const filteredServices =
    filter === 'all'
      ? services
      : services.filter((service) => service.id === filter);

  function chooseFilter(id: number | 'all') {
    setFilter(id);

    // Clicking a category tab opens that collection immediately.
    if (id === 'all') {
      setExpanded(null);
    } else {
      setExpanded(id);
    }
  }

  function toggleService(id: number) {
    setExpanded((current) => (current === id ? null : id));
  }

  return (
    <section className="bg-ivory pb-28">
      {/* PAGE INTRO */}
      <div className="mx-auto w-full max-w-7xl px-5 pb-12 pt-28 text-center sm:px-8 sm:pt-36">
        <div className="flex items-center justify-center gap-4">
          <span className="h-px w-10 bg-gold/40" />

          <p className="text-[10px] uppercase tracking-[0.5em] text-gold">
            Tailored for you
          </p>

          <span className="h-px w-10 bg-gold/40" />
        </div>

        <h1 className="mt-5 font-display text-4xl leading-tight text-ink sm:text-6xl">
          Curated Service Collections
        </h1>

        <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-ink/55 sm:text-base">
          Thoughtfully designed photography and filmmaking collections
          created around your celebrations, traditions and memories.
        </p>
      </div>

      {/* FILTER BAR */}
      <div className="mx-auto w-full max-w-6xl px-5 sm:px-8">
        <div className="flex gap-2 overflow-x-auto rounded-[28px] border border-ink/5 bg-white/70 p-3 shadow-[0_15px_45px_rgba(26,20,15,0.06)] backdrop-blur">
          <button
            type="button"
            onClick={() => chooseFilter('all')}
            className={`shrink-0 rounded-full px-7 py-3 text-[11px] uppercase tracking-[0.18em] transition-all duration-300 ${
              filter === 'all'
                ? 'bg-ink text-ivory shadow-lg'
                : 'text-ink/55 hover:text-ink'
            }`}
          >
            All
          </button>

          {services.map((service) => (
            <button
              key={service.id}
              type="button"
              onClick={() => chooseFilter(service.id)}
              className={`shrink-0 rounded-full px-7 py-3 text-[11px] uppercase tracking-[0.18em] transition-all duration-300 ${
                filter === service.id
                  ? 'bg-ink text-ivory shadow-lg'
                  : 'text-ink/55 hover:text-ink'
              }`}
            >
              {service.title}
            </button>
          ))}
        </div>
      </div>

      {/* SERVICE COLLECTIONS */}
      <div className="mx-auto mt-10 grid w-full max-w-7xl gap-7 px-5 sm:px-8 lg:grid-cols-2">
        {filteredServices.map((service) => {
          const isExpanded = expanded === service.id;
          const packageCount = service.packages.length;

          return (
            <article
              key={service.id}
              className={`overflow-hidden rounded-[28px] border border-ink/10 bg-white/65 shadow-[0_18px_55px_rgba(26,20,15,0.055)] transition-all duration-500 ${
                isExpanded ? 'lg:col-span-2' : ''
              }`}
            >
              {/* SERVICE TOP */}
              <div className="grid gap-7 p-5 md:grid-cols-[0.9fr_1.1fr] md:p-7">
                {/* SERVICE IMAGE */}
                <div className="relative aspect-[4/3] overflow-hidden rounded-[20px] bg-ink/5">
                  {service.image_url ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={service.image_url}
                      alt={service.title}
                      className="h-full w-full object-cover"
                      style={{
                        objectPosition: service.focal || '50% 40%',
                        transform: `scale(${service.zoom || 1})`,
                        transformOrigin:
                          service.focal || '50% 40%',
                      }}
                    />
                  ) : (
                    <div className="h-full w-full bg-gradient-to-br from-gold/10 to-ink/5" />
                  )}
                </div>

                {/* SERVICE INFO */}
                <div className="flex flex-col justify-between py-1">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="h-3 w-3 rounded-full bg-gold/25" />

                      <p className="text-[9px] uppercase tracking-[0.35em] text-gold">
                        Collection
                      </p>
                    </div>

                    <h2 className="mt-3 font-display text-4xl uppercase leading-none text-ink sm:text-5xl">
                      {service.title}
                    </h2>

                    <div className="mt-3 h-px w-10 bg-gold/50" />

                    <p className="mt-6 line-clamp-3 max-w-lg text-sm leading-7 text-ink/60">
                      {service.description}
                    </p>
                  </div>

                  <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-ink/10 pt-5">
                    <button
                      type="button"
                      onClick={() => toggleService(service.id)}
                      className="group flex items-center gap-3 text-[10px] font-semibold uppercase tracking-[0.28em] text-ink"
                    >
                      {isExpanded ? 'Collapse' : 'Explore packages'}

                      <span
                        className={`text-base text-gold transition-transform duration-300 ${
                          isExpanded ? 'rotate-180' : ''
                        }`}
                      >
                        ↓
                      </span>
                    </button>

                    <span className="rounded-xl border border-gold/25 bg-ivory px-4 py-2 text-[9px] uppercase tracking-[0.15em] text-gold shadow-sm">
                      {packageCount}{' '}
                      {packageCount === 1 ? 'package' : 'packages'}
                    </span>
                  </div>
                </div>
              </div>

              {/* PACKAGE AREA */}
              <div
                className={`grid transition-all duration-700 ease-[cubic-bezier(.16,1,.3,1)] ${
                  isExpanded
                    ? 'grid-rows-[1fr] opacity-100'
                    : 'grid-rows-[0fr] opacity-0'
                }`}
              >
                <div className="overflow-hidden">
                  <div className="border-t border-ink/8 bg-white/30 p-5 sm:p-7">
                    {service.packages.length > 0 ? (
                      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                        {service.packages.map((pkg) => (
                          <article
                            key={pkg.id}
                            className="group overflow-hidden rounded-[20px] border border-ink/8 bg-ivory p-4 transition-all duration-500 hover:-translate-y-1 hover:border-gold/35 hover:shadow-[0_18px_50px_rgba(26,20,15,0.09)]"
                          >
                            {/* PACKAGE IMAGE */}
                            <div className="relative aspect-[4/3] overflow-hidden rounded-[14px] bg-ink/5">
                              {pkg.image_url ? (
                                /* eslint-disable-next-line @next/next/no-img-element */
                                <img
                                  src={pkg.image_url}
                                  alt={pkg.title}
                                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                                  style={{
                                    objectPosition:
                                      pkg.focal || '50% 40%',
                                    transformOrigin:
                                      pkg.focal || '50% 40%',
                                  }}
                                  loading="lazy"
                                  decoding="async"
                                />
                              ) : (
                                <div className="h-full w-full bg-gradient-to-br from-gold/10 to-ink/5" />
                              )}

                              {pkg.featured ? (
                                <span className="absolute left-3 top-3 rounded-full bg-ink px-3 py-1.5 text-[8px] uppercase tracking-[0.2em] text-ivory">
                                  Featured
                                </span>
                              ) : null}
                            </div>

                            <div className="pt-5">
                              <h3 className="font-display text-xl leading-tight text-ink">
                                {pkg.title}
                              </h3>

                              {pkg.subtitle ? (
                                <p className="mt-2 text-[10px] uppercase tracking-[0.16em] text-ink/45">
                                  {pkg.subtitle}
                                </p>
                              ) : null}

                              {pkg.description ? (
                                <p className="mt-4 line-clamp-4 whitespace-pre-line text-xs leading-6 text-ink/55">
                                  {pkg.description}
                                </p>
                              ) : null}

                              <div className="mt-5 flex items-end justify-between gap-3 border-t border-ink/8 pt-4">
                                {pkg.price ? (
                                  <p className="font-display text-xl text-gold">
                                    {pkg.price}
                                  </p>
                                ) : (
                                  <p className="text-[9px] uppercase tracking-[0.18em] text-ink/40">
                                    Custom quote
                                  </p>
                                )}

                                <a
                                  href="/contact"
                                  className="text-[9px] uppercase tracking-[0.2em] text-ink/60 transition hover:text-gold"
                                >
                                  Details →
                                </a>
                              </div>
                            </div>
                          </article>
                        ))}
                      </div>
                    ) : (
                      <div className="py-10 text-center">
                        <p className="font-display text-2xl text-ink/60">
                          Packages coming soon
                        </p>

                        <p className="mt-2 text-sm text-ink/40">
                          Contact us for a custom collection.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}