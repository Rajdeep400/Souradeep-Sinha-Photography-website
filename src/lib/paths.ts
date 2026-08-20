import fs from 'node:fs';
import path from 'node:path';

/**
 * Storage layout is env-driven so local dev (./data) and the production VPS
 * (/var/www/souradeep-data) both work without code changes.
 */
const DATA_DIR = path.resolve(process.env.DATA_DIR || './data');

export const DB_PATH = process.env.DB_PATH
  ? path.resolve(process.env.DB_PATH)
  : path.join(DATA_DIR, 'site.db');

export const UPLOADS_DIR = process.env.UPLOADS_DIR
  ? path.resolve(process.env.UPLOADS_DIR)
  : path.join(DATA_DIR, 'uploads');

export const UPLOAD_SECTIONS = [
  'hero',
  'home',
  'portfolio',
  'services',
  'about',
  'videos',
] as const;

export type UploadSection = (typeof UPLOAD_SECTIONS)[number];

export function isUploadSection(value: string): value is UploadSection {
  return (UPLOAD_SECTIONS as readonly string[]).includes(value);
}

export function ensureStorage() {
  fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
  for (const section of UPLOAD_SECTIONS) {
    fs.mkdirSync(path.join(UPLOADS_DIR, section), { recursive: true });
  }
}

/** Resolve a stored public url (/uploads/x/y.webp) to an absolute path, blocking traversal. */
export function resolveUploadPath(relative: string): string | null {
  const cleaned = relative.replace(/^\/+/, '').replace(/^uploads\//, '');
  if (!cleaned || cleaned.includes('\0')) return null;
  const abs = path.resolve(UPLOADS_DIR, cleaned);
  const root = path.resolve(UPLOADS_DIR);
  if (abs !== root && !abs.startsWith(root + path.sep)) return null;
  return abs;
}
