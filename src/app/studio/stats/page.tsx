import { requireAdminPage } from '@/lib/auth';
import { COLLECTIONS } from '@/lib/collections';
import { getStats } from '@/lib/content';
import { CrudManager } from '@/components/studio/CrudManager';

export const dynamic = 'force-dynamic';

export default async function StudioStats() {
  await requireAdminPage();

  return (
    <div>
      <h1 className="font-display text-3xl">Counters</h1>
      <p className="mt-2 max-w-xl text-sm text-ink/60">
        Shown on the homepage above “Why couples choose us”. Numbers count up from zero when the
        section scrolls into view. Leave a number at 0 or untick Visible to hide a counter.
      </p>
      <div className="mt-8">
        <CrudManager
          resource="stats"
          fields={COLLECTIONS.stats.fields}
          items={getStats(false)}
          addLabel="Add counter"
        />
      </div>
    </div>
  );
}
