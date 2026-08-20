import Link from 'next/link';
import { notFound } from 'next/navigation';
import { requireAdminPage } from '@/lib/auth';
import { COLLECTIONS } from '@/lib/collections';
import { one } from '@/lib/db';
import { getProjectMedia } from '@/lib/content';
import type { Project } from '@/lib/content';
import { CrudManager } from '@/components/studio/CrudManager';

export const dynamic = 'force-dynamic';

export default async function StudioProject({ params }: { params: Promise<{ id: string }> }) {
  await requireAdminPage();
  const id = Number((await params).id);
  const project = Number.isFinite(id)
    ? one<Project>('SELECT * FROM portfolio_projects WHERE id = ?', [id])
    : undefined;
  if (!project) notFound();

  return (
    <div className="space-y-10">
      <div>
        <Link href="/studio/portfolio" className="text-sm underline">
          ← All weddings
        </Link>
        <h1 className="mt-3 font-display text-3xl">{project.couple_names}</h1>
        <p className="text-sm text-ink/60">
          /portfolio/{project.slug} · {project.location}
        </p>
      </div>

      <section>
        <h2 className="font-display text-2xl">Wedding details</h2>
        <div className="mt-6">
          <CrudManager
            resource="portfolio_projects"
            fields={COLLECTIONS.portfolio_projects.fields}
            items={[project as unknown as Record<string, unknown> & { id: number }]}
            ordered={false}
            addLabel="Add another wedding"
          />
        </div>
      </section>

      <section>
        <h2 className="font-display text-2xl">Photographs</h2>
        <div className="mt-6">
          <CrudManager
            resource="portfolio_media"
            fields={COLLECTIONS.portfolio_media.fields}
            items={getProjectMedia(project.id)}
            fixed={{ project_id: project.id }}
            uploadSection="portfolio"
            addLabel="Add photograph"
          />
        </div>
      </section>
    </div>
  );
}
