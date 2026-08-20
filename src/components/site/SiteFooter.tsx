export function SiteFooter({ settings }: { settings: Record<string, string> }) {
  return (
    <footer className="mt-24 border-t border-ink/10">
      <div className="mx-auto grid w-full max-w-6xl gap-6 px-5 py-10 text-sm sm:grid-cols-3">
        <div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="" className="h-14 w-auto max-w-full" />
          <p className="sr-only">{settings.studio_name}</p>
          <p className="mt-3 text-ink/60">{settings.locations}</p>
        </div>
        <div className="space-y-1">
          {settings.phone ? (
            <p>
              <a href={`tel:${settings.phone}`} className="hover:text-gold">
                {settings.phone}
              </a>
            </p>
          ) : null}
          {settings.instagram ? (
            <p>
              <a
                href={settings.instagram_url || `https://instagram.com/${settings.instagram}`}
                target="_blank"
                rel="noreferrer"
                className="hover:text-gold"
              >
                @{settings.instagram}
              </a>
            </p>
          ) : null}
          {settings.email ? <p className="text-ink/60">{settings.email}</p> : null}
        </div>
        <p className="text-ink/50">
          © {new Date().getFullYear()} {settings.studio_name}
        </p>
      </div>
    </footer>
  );
}
