import { requireAdminPage } from '@/lib/auth';
import { getSettings } from '@/lib/content';
import { ContentForm } from '@/components/studio/ContentForm';

export const dynamic = 'force-dynamic';

export default async function StudioContact() {
  await requireAdminPage();

  return (
    <div>
      <h1 className="font-display text-3xl">Contact & site details</h1>
      <div className="mt-6 max-w-2xl">
        <ContentForm
          group="site_settings"
          values={getSettings()}
          fields={[
            { name: 'studio_name', label: 'Studio name' },
            { name: 'tagline', label: 'Tagline' },
            { name: 'phone', label: 'Phone' },
            { name: 'whatsapp', label: 'WhatsApp number (blank to hide)' },
            { name: 'instagram', label: 'Instagram handle' },
            { name: 'instagram_url', label: 'Instagram URL' },
            { name: 'email', label: 'Email' },
            { name: 'locations', label: 'Locations' },
            { name: 'booking_note', label: 'Booking note', multiline: true },
          ]}
        />
      </div>
    </div>
  );
}
