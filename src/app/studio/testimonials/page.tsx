import { requireAdminPage } from '@/lib/auth';
import { COLLECTIONS } from '@/lib/collections';
import { getTestimonials } from '@/lib/content';
import { CrudManager } from '@/components/studio/CrudManager';

export const dynamic = 'force-dynamic';

export default async function StudioTestimonials() {
  await requireAdminPage();

  return (
    <div>
      <h1 className="font-display text-3xl">Testimonials</h1>
      <div className="mt-8">
        <CrudManager
          resource="testimonials"
          fields={COLLECTIONS.testimonials.fields}
          items={getTestimonials(false)}
          addLabel="Add testimonial"
        />
      </div>
    </div>
  );
}
