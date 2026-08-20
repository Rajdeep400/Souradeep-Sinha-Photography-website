import type { Metadata } from 'next';
import { ServicesScenes } from '@/components/services/ServicesScenes';
import { getHomeContent, getServices, getSettings, siteUrl } from '@/lib/content';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Wedding Photography Services | Souradeep Sinha Photography, Kolkata',
  description:
    'Bengali wedding photography, pre-wedding shoots and wedding films. Based in Kolkata, available across India.',
  alternates: { canonical: `${siteUrl()}/services` },
  openGraph: { title: 'Wedding Photography Services — Souradeep Sinha Photography' },
};

export default function ServicesPage() {
  const services = getServices();
  const home = getHomeContent();
  const settings = getSettings();

  return (
    <div className="bg-ivory">
      <section className="mx-auto w-full max-w-7xl px-5 pb-16 pt-32 sm:px-8 sm:pt-40">
        <p className="text-[10px] uppercase tracking-[0.45em] text-ink/45">{settings.locations}</p>
        <h1 className="mt-4 max-w-3xl font-display text-4xl leading-tight sm:text-6xl">
          {home.services_heading}
        </h1>
        <p className="mt-5 max-w-xl text-ink/65">{home.services_intro}</p>
      </section>

      <ServicesScenes
        services={services.map((service) => ({
          id: service.id,
          title: service.title,
          description: service.description,
          image_url: service.image_url,
          focal: service.focal,
          zoom: service.zoom,
        }))}
      />
    </div>
  );
}
