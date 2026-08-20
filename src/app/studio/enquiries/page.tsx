import { requireAdminPage } from '@/lib/auth';
import { getEnquiries } from '@/lib/content';
import { EnquiryList } from '@/components/studio/EnquiryList';

export const dynamic = 'force-dynamic';

export default async function StudioEnquiries() {
  await requireAdminPage();
  const items = getEnquiries();

  return (
    <div>
      <h1 className="font-display text-3xl">Enquiries</h1>
      <p className="mt-2 text-sm text-ink/60">
        Submitted through the contact page. {items.filter((i) => !i.handled).length} awaiting reply.
      </p>
      <div className="mt-8">
        <EnquiryList items={items} />
      </div>
    </div>
  );
}
