import { requireAdminPage } from '@/lib/auth';
import { COLLECTIONS } from '@/lib/collections';
import { getAboutContent, getMedia } from '@/lib/content';
import { ContentForm } from '@/components/studio/ContentForm';
import { CrudManager } from '@/components/studio/CrudManager';

export const dynamic = 'force-dynamic';

export default async function StudioAbout() {
  await requireAdminPage();

  return (
    <div className="space-y-14">
      <section>
        <h1 className="font-display text-3xl">About</h1>
        <div className="mt-6 max-w-2xl">
          <ContentForm
            group="about_content"
            values={getAboutContent()}
            fields={[
              { name: 'heading', label: 'Heading' },
              { name: 'intro', label: 'Intro', multiline: true },
              { name: 'body', label: 'Body', multiline: true },
              { name: 'closing', label: 'Closing line', multiline: true },
            ]}
          />
        </div>
      </section>

      <section>
        <h2 className="font-display text-2xl">About images</h2>
        <div className="mt-6">
          <CrudManager
            resource="home_media"
            fields={COLLECTIONS.home_media.fields}
            items={getMedia('about')}
            fixed={{ section: 'about' }}
            uploadSection="about"
            addLabel="Add about image"
          />
        </div>
      </section>
    </div>
  );
}
