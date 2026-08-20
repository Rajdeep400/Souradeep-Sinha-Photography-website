import { requireAdminPage } from '@/lib/auth';
import { COLLECTIONS } from '@/lib/collections';
import { getWhyUs } from '@/lib/content';
import { CrudManager } from '@/components/studio/CrudManager';

export const dynamic = 'force-dynamic';

export default async function StudioWhyUs() {
  await requireAdminPage();

  return (
    <div>
      <h1 className="font-display text-3xl">Why Us</h1>
      <div className="mt-8">
        <CrudManager
          resource="why_us"
          fields={COLLECTIONS.why_us.fields}
          items={getWhyUs()}
          addLabel="Add item"
        />
      </div>
    </div>
  );
}
