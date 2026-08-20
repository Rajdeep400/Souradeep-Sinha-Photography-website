import 'server-only';
import crypto from 'node:crypto';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { one } from './db';
import { verifyPassword } from './hash';

export const SESSION_COOKIE = 'souradeep_session';
const MAX_AGE = 60 * 60 * 24 * 7; // 7 days

function secret() {
  return process.env.SESSION_SECRET?.trim() || 'dev-only-insecure-session-secret';
}

function sign(payload: string) {
  return crypto.createHmac('sha256', secret()).update(payload).digest('base64url');
}

function createToken(username: string) {
  const payload = Buffer.from(
    JSON.stringify({ u: username, exp: Date.now() + MAX_AGE * 1000 }),
  ).toString('base64url');
  return `${payload}.${sign(payload)}`;
}

function readToken(token: string | undefined): { username: string } | null {
  if (!token || !token.includes('.')) return null;
  const [payload, mac] = token.split('.');
  const expected = sign(payload);
  if (mac.length !== expected.length) return null;
  if (!crypto.timingSafeEqual(Buffer.from(mac), Buffer.from(expected))) return null;
  try {
    const data = JSON.parse(Buffer.from(payload, 'base64url').toString());
    if (typeof data.exp !== 'number' || data.exp < Date.now()) return null;
    return { username: String(data.u) };
  } catch {
    return null;
  }
}

/** Verifies credentials against the hashed password in SQLite. Server-only. */
export function checkCredentials(username: string, password: string): boolean {
  const row = one<{ password_hash: string }>(
    'SELECT password_hash FROM admin_user WHERE username = ?',
    [username],
  );
  if (!row) return false;
  return verifyPassword(password, row.password_hash);
}

export async function createSession(username: string) {
  const store = await cookies();
  store.set(SESSION_COOKIE, createToken(username), {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: MAX_AGE,
  });
}

export async function destroySession() {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
}

export async function getSession() {
  const store = await cookies();
  return readToken(store.get(SESSION_COOKIE)?.value);
}

/** Page guard: redirects to the login route. */
export async function requireAdminPage() {
  const session = await getSession();
  if (!session) redirect('/studio/login');
  return session;
}

/** API guard: returns a 401 Response when unauthenticated. */
export async function requireAdminApi() {
  const session = await getSession();
  if (!session) {
    return {
      session: null,
      response: Response.json({ error: 'Unauthorized' }, { status: 401 }),
    };
  }
  return { session, response: null };
}
