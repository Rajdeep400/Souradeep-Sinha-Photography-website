import { requireAdminPage } from '@/lib/auth';
import { COLLECTIONS } from '@/lib/collections';
import { getFaqs } from '@/lib/content';
import { CrudManager } from '@/components/studio/CrudManager';

export const dynamic = 'force-dynamic';

export default async function StudioFaqs() {
  await requireAdminPage();

  return (
    <div>
      <h1 className="font-display text-3xl">FAQ</h1>
      <div className="mt-8">
        <CrudManager
          resource="faqs"
          fields={COLLECTIONS.faqs.fields}
          items={getFaqs(false)}
          addLabel="Add question"
        />
      </div>
    </div>
  );
}
