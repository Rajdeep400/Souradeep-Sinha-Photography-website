import Link from 'next/link';
import { notFound } from 'next/navigation';

import { requireAdminPage } from '@/lib/auth';
import { COLLECTIONS } from '@/lib/collections';
import { one } from '@/lib/db';
import {
  getServicePackages,
} from '@/lib/content';

import { CrudManager } from '@/components/studio/CrudManager';

export const dynamic = 'force-dynamic';

type Service = {
  id: number;
  title: string;
  description: string;
  image_url: string | null;
  focal: string;
  zoom: number;
  visible: number;
  sort_order: number;
};

export default async function StudioService({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdminPage();

  const id = Number((await params).id);

  const service = Number.isFinite(id)
    ? one<Service>(
        'SELECT * FROM services WHERE id = ?',
        [id],
      )
    : undefined;

  if (!service) {
    notFound();
  }

  const packages = getServicePackages(
    service.id,
    false,
  );

  return (
    <div className="space-y-12">

      <div>
        <Link
          href="/studio/services"
          className="text-sm underline"
        >
          ← All services
        </Link>

        <h1 className="mt-3 font-display text-3xl">
          {service.title}
        </h1>

        <p className="mt-2 text-sm text-ink/60">
          Manage this service and all packages inside it.
        </p>
      </div>

      <section>
        <h2 className="font-display text-2xl">
          Service details
        </h2>

        <div className="mt-6">
          <CrudManager
            resource="services"
            fields={COLLECTIONS.services.fields}
            items={[service]}
            ordered={false}
            showCreateForm={false}
          />
        </div>
      </section>

      <section>
        <div>
          <h2 className="font-display text-2xl">
            Packages
          </h2>

          <p className="mt-2 text-sm text-ink/60">
            Add, edit, reorder or hide packages for{' '}
            {service.title}.
          </p>
        </div>

        <div className="mt-6">
          <CrudManager
            resource="service_packages"
            fields={
              COLLECTIONS.service_packages.fields
            }
            items={packages}
            fixed={{
              service_id: service.id,
            }}
            uploadSection="services"
            addLabel="Add package"
          />
        </div>
      </section>

    </div>
  );
}