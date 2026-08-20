import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { WeddingGallery } from '@/components/portfolio/WeddingGallery';
import { getProjectBySlug, getProjectMedia, getProjects, getSettings, siteUrl } from '@/lib/content';

export const dynamic = 'force-dynamic';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const project = getProjectBySlug(slug);
  if (!project) return { title: 'Wedding not found' };

  const where = project.location ? ` in ${project.location}` : '';
  const title = `${project.couple_names} — Bengali Wedding Photography${where}`;
  const description =
    project.description?.slice(0, 155) ||
    `Wedding photographs of ${project.couple_names}${where} by Souradeep Sinha Photography, Kolkata.`;
  const url = `${siteUrl()}/portfolio/${project.slug}`;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      type: 'article',
      images: project.cover_url ? [{ url: `${siteUrl()}${project.cover_url}` }] : undefined,
    },
  };
}

export default async function ProjectPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = getProjectBySlug(slug);
  if (!project) notFound();

  const media = getProjectMedia(project.id);
  const settings = getSettings();
  const published = getProjects();
  const index = published.findIndex((p) => p.id === project.id);
  const next = published[(index + 1) % published.length];
  const previous = published[(index - 1 + published.length) % published.length];
  const meta = [project.wedding_date, project.location].filter(Boolean).join(' · ');

  return (
    <article className="bg-ivory">
      {/* opening frame — the wedding's cover, no pinned timeline here */}
      <header className="relative h-[72svh] w-full overflow-hidden bg-ink">
        {project.cover_url ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={project.cover_url}
            alt={`${project.couple_names} — wedding photography${
              project.location ? ` in ${project.location}` : ''
            }`}
            className="hero-img"
            style={{ ['--focal' as string]: project.focal || '50% 36%' }}
            fetchPriority="high"
            decoding="async"
            sizes="100vw"
          />
        ) : null}
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(180deg, rgba(8,7,6,0.55) 0%, rgba(8,7,6,0.1) 45%, rgba(8,7,6,0.85) 100%)',
          }}
          aria-hidden
        />
        <div className="absolute inset-x-0 bottom-0 px-5 pb-12 text-ivory sm:px-8 sm:pb-16">
          <div className="mx-auto w-full max-w-6xl">
            <Link
              href="/portfolio"
              className="text-[10px] uppercase tracking-[0.35em] text-ivory/60 hover:text-gold"
            >
              ← All weddings
            </Link>
            <h1 className="mt-5 font-display text-4xl leading-tight sm:text-6xl">
              {project.couple_names}
            </h1>
            {meta ? (
              <p className="mt-3 text-[11px] uppercase tracking-[0.32em] text-gold">{meta}</p>
            ) : null}
          </div>
        </div>
      </header>

      <div className="mx-auto w-full max-w-6xl px-5 py-16 sm:px-8 sm:py-24">
        {project.description ? (
          <p className="max-w-2xl whitespace-pre-line font-display text-xl leading-relaxed text-ink/80 sm:text-2xl">
            {project.description}
          </p>
        ) : null}

        <div className="mt-14">
          {media.length > 0 ? (
            <WeddingGallery
              items={media.map((item) => ({
                id: item.id,
                url: item.url,
                medium_url: item.medium_url,
                thumb_url: item.thumb_url,
                alt: item.alt,
              }))}
              couple={project.couple_names}
              videoUrl={project.video_url}
              poster={project.cover_url}
            />
          ) : (
            <p className="text-sm text-ink/50">
              Photographs for this wedding are being added to the studio.
            </p>
          )}
        </div>

        {published.length > 1 ? (
          <nav className="mt-24 flex flex-wrap items-center justify-between gap-6 border-t border-ink/10 pt-8 text-sm">
            <Link href={`/portfolio/${previous.slug}`} className="group">
              <span className="block text-[10px] uppercase tracking-[0.3em] text-ink/45">
                Previous wedding
              </span>
              <span className="mt-2 block font-display text-xl group-hover:text-gold">
                {previous.couple_names}
              </span>
            </Link>
            <Link href={`/portfolio/${next.slug}`} className="group text-right">
              <span className="block text-[10px] uppercase tracking-[0.3em] text-ink/45">
                Next wedding
              </span>
              <span className="mt-2 block font-display text-xl group-hover:text-gold">
                {next.couple_names}
              </span>
            </Link>
          </nav>
        ) : null}

        <div className="mt-20 border-t border-ink/10 pt-10">
          <p className="font-display text-2xl">Planning your own wedding?</p>
          <div className="mt-5 flex flex-wrap gap-4 text-[11px] uppercase tracking-[0.3em]">
            <Link href="/contact" className="border border-ink px-6 py-3 hover:bg-ink hover:text-ivory">
              Enquire
            </Link>
            {settings.phone ? (
              <a href={`tel:${settings.phone}`} className="px-4 py-3 text-ink/70 hover:text-gold">
                {settings.phone}
              </a>
            ) : null}
          </div>
        </div>
      </div>
    </article>
  );
}
