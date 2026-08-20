import Link from 'next/link';
import { getSession } from '@/lib/auth';
import { LogoutButton } from '@/components/studio/LogoutButton';

export const dynamic = 'force-dynamic';

const NAV = [
  { href: '/studio', label: 'Overview' },
  { href: '/studio/home', label: 'Home' },
  { href: '/studio/portfolio', label: 'Portfolio' },
  { href: '/studio/services', label: 'Services' },
  { href: '/studio/about', label: 'About' },
  { href: '/studio/why-us', label: 'Why Us' },
  { href: '/studio/stats', label: 'Counters' },
  { href: '/studio/testimonials', label: 'Testimonials' },
  { href: '/studio/faqs', label: 'FAQ' },
  { href: '/studio/contact', label: 'Contact' },
  { href: '/studio/enquiries', label: 'Enquiries' },
];

export default async function StudioLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session) return <>{children}</>;

  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-ink/10">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="font-display text-lg">Studio</p>
          <div className="flex items-center gap-4 text-sm">
            <Link href="/" className="underline" target="_blank">
              View site
            </Link>
            <LogoutButton />
          </div>
        </div>
        <nav className="mx-auto flex w-full max-w-6xl flex-wrap gap-x-4 gap-y-2 px-5 pb-4 text-sm">
          {NAV.map((item) => (
            <Link key={item.href} href={item.href} className="text-ink/70 hover:text-gold">
              {item.label}
            </Link>
          ))}
        </nav>
      </header>
      <div className="mx-auto w-full max-w-6xl px-5 py-8">{children}</div>
    </div>
  );
}
