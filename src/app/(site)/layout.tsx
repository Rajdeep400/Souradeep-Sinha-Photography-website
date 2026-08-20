import { SmoothScrollProvider } from '@/components/animation/SmoothScrollProvider';
import { SiteFooter } from '@/components/site/SiteFooter';
import { SiteHeader } from '@/components/site/SiteHeader';
import { PhotoCursor } from '@/components/site/PhotoCursor';
import { StructuredData } from '@/components/site/StructuredData';
import { getSettings } from '@/lib/content';

export const dynamic = 'force-dynamic';

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  const settings = getSettings();

  return (
    <SmoothScrollProvider>
      <StructuredData />
      <SiteHeader studioName={settings.studio_name} phone={settings.phone} />
      <PhotoCursor />
      <main>{children}</main>
      <SiteFooter settings={settings} />
    </SmoothScrollProvider>
  );
}
