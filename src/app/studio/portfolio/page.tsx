import { requireAdminPage } from '@/lib/auth';
import { COLLECTIONS } from '@/lib/collections';
import { getProjects } from '@/lib/content';
import { CrudManager } from '@/components/studio/CrudManager';

export const dynamic = 'force-dynamic';

export default async function StudioPortfolio() {
  await requireAdminPage();

  return (
    <div>
      <h1 className="font-display text-3xl">Weddings</h1>
      <p className="mt-2 text-sm text-ink/60">
        Open a wedding to manage its photographs and ordering.
      </p>
      <div className="mt-8">
        <CrudManager
          resource="portfolio_projects"
          fields={COLLECTIONS.portfolio_projects.fields}
          items={getProjects(false)}
          addLabel="Add wedding"
          childHrefBase="/studio/portfolio"
        />
      </div>
    </div>
  );
}
