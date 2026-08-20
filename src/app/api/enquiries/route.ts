import crypto from 'node:crypto';
import { run } from '@/lib/db';

/** Very small in-memory limiter: 5 enquiries per hour per IP hash. */
const HITS = new Map<string, number[]>();
const WINDOW = 60 * 60 * 1000;
const MAX = 5;

function limited(key: string) {
  const now = Date.now();
  const recent = (HITS.get(key) ?? []).filter((t) => now - t < WINDOW);
  recent.push(now);
  HITS.set(key, recent);
  if (HITS.size > 5000) HITS.clear();
  return recent.length > MAX;
}

const clean = (value: unknown, max: number) =>
  String(value ?? '')
    // strip control characters, keep normal punctuation
    .replace(/[\u0000-\u001f\u007f]/g, ' ')
    .trim()
    .slice(0, max);

export async function POST(request: Request) {
  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    'unknown';
  const key = crypto.createHash('sha256').update(ip).digest('hex').slice(0, 32);
  if (limited(key)) {
    return Response.json({ error: 'Too many enquiries. Please call instead.' }, { status: 429 });
  }

  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
  if (!body) return Response.json({ error: 'Invalid request' }, { status: 400 });

  // honeypot: real visitors never fill this
  if (clean(body.company, 40)) return Response.json({ ok: true });

  const name = clean(body.name, 80);
  const phone = clean(body.phone, 24);
  const email = clean(body.email, 120);
  const message = clean(body.message, 2000);

  if (name.length < 2) return Response.json({ error: 'Please enter your name' }, { status: 400 });
  if (phone.replace(/\D/g, '').length < 8) {
    return Response.json({ error: 'Please enter a valid phone number' }, { status: 400 });
  }
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
    return Response.json({ error: 'Please check the email address' }, { status: 400 });
  }

  run(
    `INSERT INTO enquiries (name, phone, email, wedding_date, location, event_type, message)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      name,
      phone,
      email,
      clean(body.wedding_date, 40),
      clean(body.location, 120),
      clean(body.event_type, 60),
      message,
    ],
  );

  return Response.json({ ok: true });
}
