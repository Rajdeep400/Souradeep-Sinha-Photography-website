import crypto from 'node:crypto';

/**
 * Format: scrypt:<cost>:<salt-hex>:<hash-hex>
 * Colon-separated (not $) so the hash survives .env parsing untouched.
 * Never leaves the server.
 */
export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16);
  const derived = crypto.scryptSync(password, salt, 64);
  return `scrypt:16384:${salt.toString('hex')}:${derived.toString('hex')}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const parts = stored.split(':');
  if (parts.length !== 4 || parts[0] !== 'scrypt') return false;
  const salt = Buffer.from(parts[2], 'hex');
  const expected = Buffer.from(parts[3], 'hex');
  if (expected.length === 0) return false;
  const derived = crypto.scryptSync(password, salt, expected.length);
  return expected.length === derived.length && crypto.timingSafeEqual(expected, derived);
}
