import Link from 'next/link';
import { requireAdminPage } from '@/lib/auth';
import {
  getEnquiries,
  getFaqs,
  getProjects,
  getServices,
  getTestimonials,
  getWhyUs,
} from '@/lib/content';

export const dynamic = 'force-dynamic';

export default async function StudioHome() {
  await requireAdminPage();

  const cards = [
    { href: '/studio/home', label: 'Home', count: 'Hero, copy & imagery' },
    { href: '/studio/portfolio', label: 'Weddings', count: `${getProjects(false).length} projects` },
    { href: '/studio/services', label: 'Services', count: `${getServices(false).length} items` },
    { href: '/studio/about', label: 'About', count: 'Text & images' },
    { href: '/studio/why-us', label: 'Why Us', count: `${getWhyUs().length} items` },
    { href: '/studio/testimonials', label: 'Testimonials', count: `${getTestimonials(false).length} items` },
    { href: '/studio/faqs', label: 'FAQ', count: `${getFaqs(false).length} questions` },
    { href: '/studio/contact', label: 'Contact', count: 'Phone, Instagram, locations' },
    { href: '/studio/enquiries', label: 'Enquiries', count: `${getEnquiries().filter((e) => !e.handled).length} new` },
  ];

  return (
    <div>
      <h1 className="font-display text-3xl">Content</h1>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 md:grid-cols-3">
        {cards.map((card) => (
          <Link
            key={card.href}
            href={card.href}
            className="border border-ink/10 p-5 hover:border-gold"
          >
            <p className="font-display text-xl">{card.label}</p>
            <p className="mt-1 text-sm text-ink/60">{card.count}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
