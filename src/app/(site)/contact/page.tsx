import type { Metadata } from 'next';
import { ContactForm } from '@/components/contact/ContactForm';
import { getMedia, getSettings, siteUrl, whatsappUrl } from '@/lib/content';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Contact | Souradeep Sinha Photography — Wedding Photographer Kolkata',
  description:
    'Check availability for your wedding date. Call 7001048104 or message on Instagram. Based in Kolkata, available across India.',
  alternates: { canonical: `${siteUrl()}/contact` },
  openGraph: { title: 'Contact Souradeep Sinha Photography' },
};

export default function ContactPage() {
  const settings = getSettings();
  const image = getMedia('about')[0] ?? getMedia('hero')[0] ?? null;
  const whatsapp = whatsappUrl(settings.whatsapp ?? '');
  const instagramUrl = settings.instagram_url || `https://instagram.com/${settings.instagram}`;

  const actions = [
    settings.phone ? { label: 'Call', value: settings.phone, href: `tel:${settings.phone}` } : null,
    whatsapp
      ? {
          label: 'WhatsApp',
          value: 'Message Souradeep Sinha Photography',
          href: whatsapp,
        }
      : null,
    settings.instagram
      ? { label: 'Instagram', value: `@${settings.instagram}`, href: instagramUrl }
      : null,
    settings.email
      ? { label: 'Email', value: settings.email, href: `mailto:${settings.email}` }
      : null,
  ].filter(Boolean) as { label: string; value: string; href: string }[];

  return (
    <div className="bg-ivory">
      <section className="mx-auto grid w-full max-w-7xl gap-12 px-5 pb-24 pt-32 sm:px-8 sm:pt-40 md:grid-cols-[1fr_0.85fr] md:gap-20">
        <div>
          <p className="text-[10px] uppercase tracking-[0.45em] text-ink/45">{settings.locations}</p>
          <h1 className="mt-4 font-display text-4xl leading-tight sm:text-6xl">
            Let us hold your day still
          </h1>
          <p className="mt-5 max-w-lg text-ink/70">{settings.booking_note}</p>

          <dl className="mt-12 grid gap-6 sm:grid-cols-2">
            {actions.map((action) => (
              <div key={action.label} className="min-w-0 border-t border-ink/10 pt-4">
                <dt className="text-[10px] uppercase tracking-[0.3em] text-ink/50">
                  {action.label}
                </dt>
                <dd className="mt-2 min-w-0">
                  <a
                    href={action.href}
                    target={action.href.startsWith('http') ? '_blank' : undefined}
                    rel={action.href.startsWith('http') ? 'noreferrer' : undefined}
                    className="font-display text-xl break-words hover:text-gold sm:text-2xl"
                  >
                    {action.value}
                  </a>
                </dd>
              </div>
            ))}
          </dl>

          <div className="mt-16">
            <h2 className="font-display text-2xl sm:text-3xl">Tell us about your wedding</h2>
            <p className="mt-2 text-sm text-ink/60">
              Dates fill early for the Bengali wedding season.
            </p>
            <div className="mt-8">
              <ContactForm />
            </div>
          </div>
        </div>

        {image ? (
          <figure className="h-fit md:sticky md:top-28">
            <div className="aspect-[4/5] w-full overflow-hidden bg-ink/5">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={image.medium_url || image.url}
                alt={image.alt || `${settings.studio_name} wedding photography`}
                className="hero-img"
                style={{ ['--focal' as string]: image.focal || '50% 38%' }}
                loading="lazy"
                decoding="async"
                sizes="(min-width: 768px) 40vw, 92vw"
              />
            </div>
            <figcaption className="mt-4 text-[10px] uppercase tracking-[0.3em] text-ink/45">
              {settings.studio_name}
            </figcaption>
          </figure>
        ) : null}
      </section>
    </div>
  );
}
