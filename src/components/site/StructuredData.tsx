import { getSettings, siteUrl } from '@/lib/content';

/**
 * schema.org data built only from real CMS values — no invented ratings,
 * reviews, awards, addresses or opening hours.
 */
export function StructuredData() {
  const settings = getSettings();
  const base = siteUrl();

  const data: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'ProfessionalService',
    name: settings.studio_name,
    description:
      'Bengali wedding photography and wedding films, based in Kolkata and available across India.',
    url: base,
    image: `${base}/logo.png`,
    logo: `${base}/logo.png`,
    areaServed: [
      { '@type': 'City', name: 'Kolkata' },
      { '@type': 'Country', name: 'India' },
    ],
    serviceType: 'Wedding photography',
  };

  if (settings.phone) data.telephone = settings.phone;
  if (settings.email) data.email = settings.email;
  if (settings.instagram) {
    data.sameAs = [settings.instagram_url || `https://instagram.com/${settings.instagram}`];
  }
  data.address = { '@type': 'PostalAddress', addressLocality: 'Kolkata', addressCountry: 'IN' };

  return (
    <script
      type="application/ld+json"
      // JSON.stringify output only, no user-controlled HTML
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
