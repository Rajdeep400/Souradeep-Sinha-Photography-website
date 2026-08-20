import { CinematicHero } from '@/components/home/CinematicHero';
import { StatsCounters } from '@/components/home/StatsCounters';
import { StickyMediaSequence } from '@/components/home/StickyMediaSequence';
import { WhyUsStory } from '@/components/home/WhyUsStory';
import { TestimonialDrum } from '@/components/home/TestimonialDrum';
import { FaqAccordion } from '@/components/home/FaqAccordion';
import { ClosingCta } from '@/components/home/ClosingCta';
import {
  getFaqs,
  getHomeContent,
  getMedia,
  getProjects,
  getServices,
  getSettings,
  getStats,
  getTestimonials,
  getWhyUs,
} from '@/lib/content';

export const dynamic = 'force-dynamic';

export default function HomePage() {
  const copy = getHomeContent();
  const settings = getSettings();
  const heroMedia = getMedia('hero');
  const homeMedia = getMedia('home');
  const projects = getProjects();
  const services = getServices();
  const whyUs = getWhyUs();
  const testimonials = getTestimonials();
  const faqs = getFaqs();

  // Hero frames come from the CMS hero set; portfolio covers backfill it so a new
  // install still animates. Swapping any image never touches animation code.
  const heroFrames = [
    ...heroMedia.map((m) => ({ url: m.url, alt: m.alt, focal: m.focal })),
    ...projects
      .filter((p) => p.cover_url)
      .map((p) => ({ url: p.cover_url as string, alt: p.couple_names, focal: p.focal })),
    ...homeMedia.map((m) => ({ url: m.url, alt: m.alt, focal: m.focal })),
  ];

  const first = projects[0];
  const handoff =
    first && first.cover_url
      ? {
          url: first.cover_url,
          alt: first.couple_names,
          focal: first.focal,
          couple: first.couple_names,
          location: first.location,
          slug: first.slug,
        }
      : null;

  return (
    <>
      <CinematicHero
        copy={copy}
        studioName={settings.studio_name}
        frames={heroFrames}
        handoff={handoff}
      />

      <div className="bg-ivory pb-16 text-center">
        <StickyMediaSequence
          isFeaturedSlot
          numbered
          eyebrow={settings.locations}
          heading={copy.featured_heading}
          intro={copy.featured_intro}
          items={projects.slice(0, 2).map((project) => ({
            id: project.id,
            title: project.couple_names,
            meta: [project.location, project.wedding_date].filter(Boolean).join(' · '),
            body: project.description,
            image: project.cover_url,
            focal: project.focal,
            href: `/portfolio/${project.slug}`,
          }))}
        />

        {projects.length > 2 ? (
          <a
            href="/portfolio"
            className="inline-block border border-ink/40 px-8 py-3 text-[11px] uppercase tracking-[0.3em] text-ink transition-all duration-300 hover:bg-ink hover:text-ivory"
          >
            View all weddings →
          </a>
        ) : null}
      </div>

      <div className="bg-ink pb-16 text-center">
        <StickyMediaSequence
          theme="ink"
          mediaSide="right"
          eyebrow="Coverage"
          heading={copy.services_heading}
          intro={copy.services_intro}
          items={services.slice(0, 2).map((service) => ({
            id: service.id,
            title: service.title,
            body: service.description,
            image: service.image_url,
          }))}
        />

        {services.length > 2 ? (
          <a
            href="/services"
            className="inline-block border border-ivory/40 px-8 py-3 text-[11px] uppercase tracking-[0.3em] text-ivory transition-all duration-300 hover:bg-ivory hover:text-ink"
          >
            View all services →
          </a>
        ) : null}
      </div>

      <StatsCounters items={getStats()} />

      <WhyUsStory
        heading={copy.why_us_heading}
        items={whyUs}
        images={
          homeMedia.length > 0
            ? homeMedia.map((m) => ({ url: m.url, alt: m.alt, focal: m.focal }))
            : heroFrames
        }
      />

      <TestimonialDrum heading={copy.testimonials_heading} items={testimonials} />

      <FaqAccordion heading={copy.faq_heading} items={faqs} />

      <ClosingCta
        heading={copy.cta_heading}
        body={copy.cta_body}
        settings={settings}
        image={heroFrames[heroFrames.length - 1] ?? null}
      />
    </>
  );
}
