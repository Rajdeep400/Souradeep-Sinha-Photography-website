import { requireAdminPage } from '@/lib/auth';
import { COLLECTIONS } from '@/lib/collections';
import { getHomeContent, getMedia } from '@/lib/content';
import { ContentForm } from '@/components/studio/ContentForm';
import { CrudManager } from '@/components/studio/CrudManager';

export const dynamic = 'force-dynamic';

const COPY_FIELDS = [
  { name: 'hero_kicker', label: 'Hero kicker' },
  { name: 'hero_title', label: 'Hero title' },
  { name: 'hero_subtitle', label: 'Hero subtitle', multiline: true },
  { name: 'hero_cta_label', label: 'Hero button label' },
  { name: 'hero_scene_line', label: 'Hero scene line (mid sequence)' },
  { name: 'hero_payoff_line', label: 'Hero payoff line (brand reveal)' },
  { name: 'featured_heading', label: 'Featured weddings heading' },
  { name: 'featured_intro', label: 'Featured weddings intro', multiline: true },
  { name: 'services_heading', label: 'Services heading' },
  { name: 'services_intro', label: 'Services intro', multiline: true },
  { name: 'why_us_heading', label: 'Why Us heading' },
  { name: 'testimonials_heading', label: 'Testimonials heading' },
  { name: 'faq_heading', label: 'FAQ heading' },
  { name: 'cta_heading', label: 'Closing CTA heading' },
  { name: 'cta_body', label: 'Closing CTA body', multiline: true },
];

export default async function StudioHomeContent() {
  await requireAdminPage();
  const values = getHomeContent();
  const fields = COLLECTIONS.home_media.fields;

  return (
    <div className="space-y-14">
      <section>
        <h1 className="font-display text-3xl">Homepage copy</h1>
        <div className="mt-6 max-w-2xl">
          <ContentForm group="home_content" fields={COPY_FIELDS} values={values} />
        </div>
      </section>

      <section>
        <h2 className="font-display text-2xl">Hero images</h2>
        <div className="mt-6">
          <CrudManager
            resource="home_media"
            fields={fields}
            items={getMedia('hero')}
            fixed={{ section: 'hero' }}
            uploadSection="hero"
            addLabel="Add hero image"
          />
        </div>
      </section>

      <section>
        <h2 className="font-display text-2xl">Homepage images</h2>
        <div className="mt-6">
          <CrudManager
            resource="home_media"
            fields={fields}
            items={getMedia('home')}
            fixed={{ section: 'home' }}
            uploadSection="home"
            addLabel="Add homepage image"
          />
        </div>
      </section>
    </div>
  );
}
