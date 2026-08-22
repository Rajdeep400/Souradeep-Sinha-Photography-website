import type { Metadata } from 'next';

import {
  getServicePackages,
  getServices,
  siteUrl,
} from '@/lib/content';

import {
  ServicesCatalog,
  type PublicService,
} from '@/components/services/ServicesCatalog';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title:
    'Wedding Photography Services | Souradeep Sinha Photography, Kolkata',

  description:
    'Wedding photography, pre-wedding shoots and photography packages by Souradeep Sinha Photography. Based in Kolkata, available across India.',

  alternates: {
    canonical: `${siteUrl()}/services`,
  },

  openGraph: {
    title:
      'Photography Services — Souradeep Sinha Photography',
  },
};

export default function ServicesPage() {
  const services = getServices();

  const data: PublicService[] = services.map(
    (service) => ({
      id: service.id,
      title: service.title,
      description: service.description,
      image_url: service.image_url,
      focal: service.focal || '',
      zoom: service.zoom || 1,

      packages: getServicePackages(service.id).map(
        (pkg) => ({
          id: pkg.id,
          service_id: pkg.service_id,
          title: pkg.title,
          subtitle: pkg.subtitle,
          description: pkg.description,
          price: pkg.price,
          image_url: pkg.image_url,
          focal: pkg.focal || '',
          zoom: pkg.zoom || 1,
          featured: pkg.featured,
        }),
      ),
    }),
  );

  return <ServicesCatalog services={data} />;
}