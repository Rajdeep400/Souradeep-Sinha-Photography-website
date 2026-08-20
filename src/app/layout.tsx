import type { Metadata } from 'next';
import './globals.css';
import { siteUrl } from '@/lib/content';

const title = 'Souradeep Sinha Photography | Bengali Wedding Photographer in Kolkata';
const description =
  'Bengali wedding photography and wedding films by Souradeep Sinha. Documentary, cinematic coverage — based in Kolkata, available across India.';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl()),
  title: { default: title, template: '%s | Souradeep Sinha Photography' },
  description,
  keywords: [
    'Souradeep Sinha Photography',
    'wedding photographer Kolkata',
    'Bengali wedding photographer',
    'Bengali wedding photography',
    'wedding photography Kolkata',
    'wedding photographer India',
    'destination wedding photographer India',
  ],
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    siteName: 'Souradeep Sinha Photography',
    title,
    description,
    url: '/',
    locale: 'en_IN',
    images: ['/logo.png'],
  },
  twitter: { card: 'summary_large_image', title, description },
  robots: { index: true, follow: true },
  icons: { icon: '/logo.png', apple: '/logo.png' },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
