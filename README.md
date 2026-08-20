# Souradeep Sinha Photography — Stage 1 foundation

Next.js (App Router) + TypeScript + Tailwind + GSAP/ScrollTrigger/Lenis, SQLite (`better-sqlite3`),
Sharp image optimization, filesystem media. Built for a persistent Linux VPS — **not** serverless.

## Local development

```bash
cp .env.example .env.local
npm run set-password -- "your-strong-password"   # paste output into .env.local
# SESSION_SECRET: openssl rand -hex 32
npm install
npm run dev
```

Data is created automatically at `./data/site.db` and `./data/uploads/`.

## Production layout (VPS)

```text
/var/www/souradeep/           # this application
/var/www/souradeep-data/      # persistent, never inside the app dir
    site.db
    uploads/{hero,home,portfolio,services,about,videos}
```

`.env` on the server:

```env
DATA_DIR=/var/www/souradeep-data
ADMIN_USERNAME=souradeep
ADMIN_PASSWORD_HASH=scrypt:16384:...
SESSION_SECRET=...
NODE_ENV=production
```

Then `npm ci && npm run build && npm start` behind nginx (pm2/systemd for process management).
Back up `souradeep-data/` — it is the entire site content.

## Deployment

See `DEPLOYMENT.md` for the VPS setup, nginx/PM2, backups and restore procedure.

## Admin

- `/studio/login` — server-authenticated (scrypt hash in SQLite, HMAC-signed HTTP-only cookie)
- `/studio` — home copy & imagery, portfolio, services, about, why us, testimonials, FAQ, contact

## Animation foundation (Stage 2 entry points)

- `src/lib/animation/gsap.ts` — single GSAP + ScrollTrigger registration point
- `src/components/animation/SmoothScrollProvider.tsx` — one Lenis instance, synced to ScrollTrigger
- `src/lib/animation/useGsapScope.ts` — scoped `gsap.context()` with automatic cleanup

Public sections carry `data-section="hero|featured|services|why-us|testimonials|faq|cta"` hooks.
No decorative animation exists yet — motion is Stage 2.
