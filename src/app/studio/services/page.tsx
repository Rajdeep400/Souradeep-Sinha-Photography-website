import { requireAdminPage } from '@/lib/auth';
import { COLLECTIONS } from '@/lib/collections';
import { getServices } from '@/lib/content';
import { CrudManager } from '@/components/studio/CrudManager';

export const dynamic = 'force-dynamic';

export default async function StudioServices() {
  await requireAdminPage();

  return (
    <div>
      <h1 className="font-display text-3xl">Services</h1>
      <div className="mt-8">
        <CrudManager
          resource="services"
          fields={COLLECTIONS.services.fields}
          items={getServices(false)}
          addLabel="Add service"
          childHrefBase="/studio/services"
        />
      </div>
    </div>
  );
}
