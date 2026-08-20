'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

const NAV = [
  { href: '/', label: 'Home' },
  { href: '/about', label: 'About' },
  { href: '/services', label: 'Services' },
  { href: '/portfolio', label: 'Portfolio' },
  { href: '/contact', label: 'Contact' },
];

export function SiteHeader({ studioName, phone }: { studioName: string; phone: string }) {
  const pathname = usePathname();
  const overlay = pathname === '/';
  const [lifted, setLifted] = useState(!overlay);

  useEffect(() => {
    if (!overlay) {
      setLifted(true);
      return;
    }
    const onScroll = () => setLifted(window.scrollY > window.innerHeight * 0.75);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [overlay]);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-[70] transition-colors duration-500 ${
        lifted ? 'bg-ivory/90 text-ink backdrop-blur' : 'bg-transparent text-ivory'
      }`}
    >
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-5 py-3 sm:px-8">
        <Link href="/" className="flex items-center gap-3">
          {/* transparent PNG brand mark; text kept for SEO / screen readers */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logo.png"
            alt=""
            className={`h-14 w-auto max-w-full sm:h-20 ${lifted ? '' : 'brightness-0 invert'}`}
          />
          <span className="sr-only">{studioName}</span>
        </Link>
        <nav className="flex flex-wrap items-center gap-x-5 gap-y-1 text-[11px] uppercase tracking-[0.22em]">
          {NAV.map((item) => (
            <Link key={item.href} href={item.href} className="hover:text-gold">
              {item.label}
            </Link>
          ))}
          {phone ? (
            <a href={`tel:${phone}`} className="hidden text-gold sm:inline">
              {phone}
            </a>
          ) : null}
        </nav>
      </div>
    </header>
  );
}
