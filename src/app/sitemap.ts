import type { MetadataRoute } from 'next';
import { getProjects, siteUrl } from '@/lib/content';

export const dynamic = 'force-dynamic';

export default function sitemap(): MetadataRoute.Sitemap {
  const base = siteUrl();
  const now = new Date();

  const pages: MetadataRoute.Sitemap = [
    { url: `${base}/`, lastModified: now, priority: 1 },
    { url: `${base}/portfolio`, lastModified: now, priority: 0.9 },
    { url: `${base}/services`, lastModified: now, priority: 0.8 },
    { url: `${base}/about`, lastModified: now, priority: 0.7 },
    { url: `${base}/contact`, lastModified: now, priority: 0.7 },
  ];

  return pages.concat(
    getProjects().map((project) => ({
      url: `${base}/portfolio/${project.slug}`,
      lastModified: now,
      priority: 0.6,
    })),
  );
}
