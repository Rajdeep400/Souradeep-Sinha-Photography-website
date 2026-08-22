import Database from 'better-sqlite3';
import { DB_PATH, ensureStorage } from './paths';
import { hashPassword, verifyPassword } from './hash';

type DB = Database.Database;

let instance: DB | null = null;

const SCHEMA = `
PRAGMA journal_mode = WAL;
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS admin_user (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS site_settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL DEFAULT ''
);

CREATE TABLE IF NOT EXISTS home_content (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL DEFAULT ''
);

CREATE TABLE IF NOT EXISTS about_content (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL DEFAULT ''
);

-- hero / home / about imagery. Binaries live on disk; only paths are stored.
CREATE TABLE IF NOT EXISTS home_media (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  section TEXT NOT NULL,
  url TEXT NOT NULL,
  thumb_url TEXT,
  alt TEXT NOT NULL DEFAULT '',
  sort_order INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS portfolio_projects (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  slug TEXT NOT NULL UNIQUE,
  couple_names TEXT NOT NULL,
  location TEXT NOT NULL DEFAULT '',
  wedding_date TEXT NOT NULL DEFAULT '',
  description TEXT NOT NULL DEFAULT '',
  cover_url TEXT,
  video_url TEXT,
  published INTEGER NOT NULL DEFAULT 1,
  sort_order INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS portfolio_media (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  project_id INTEGER NOT NULL REFERENCES portfolio_projects(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  thumb_url TEXT,
  alt TEXT NOT NULL DEFAULT '',
  sort_order INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS services (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  image_url TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS service_packages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  service_id INTEGER NOT NULL REFERENCES services(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  subtitle TEXT NOT NULL DEFAULT '',
  description TEXT NOT NULL DEFAULT '',
  price TEXT NOT NULL DEFAULT '',
  image_url TEXT,
  focal TEXT NOT NULL DEFAULT '',
  zoom REAL NOT NULL DEFAULT 1,
  featured INTEGER NOT NULL DEFAULT 0,
  visible INTEGER NOT NULL DEFAULT 1,
  sort_order INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS why_us (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  sort_order INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS testimonials (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  quote TEXT NOT NULL DEFAULT '',
  image_url TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS faqs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  question TEXT NOT NULL,
  answer TEXT NOT NULL DEFAULT '',
  sort_order INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS stats (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  label TEXT NOT NULL,
  value INTEGER NOT NULL DEFAULT 0,
  prefix TEXT NOT NULL DEFAULT '',
  suffix TEXT NOT NULL DEFAULT '',
  visible INTEGER NOT NULL DEFAULT 1,
  sort_order INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS enquiries (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT NOT NULL DEFAULT '',
  wedding_date TEXT NOT NULL DEFAULT '',
  location TEXT NOT NULL DEFAULT '',
  event_type TEXT NOT NULL DEFAULT '',
  message TEXT NOT NULL DEFAULT '',
  handled INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_home_media_section ON home_media(section, sort_order);
CREATE INDEX IF NOT EXISTS idx_portfolio_media_project ON portfolio_media(project_id, sort_order);

CREATE INDEX IF NOT EXISTS idx_service_packages_service
ON service_packages(service_id, sort_order);
`;
  
const SETTINGS_DEFAULTS: Record<string, string> = {
  studio_name: 'Souradeep Sinha Photography',
  tagline: 'Bengali wedding films & photographs',
  phone: '7001048104',
  whatsapp: '7001048104',
  instagram: 'souradeep.sinha_photography',
  instagram_url: 'https://instagram.com/souradeep.sinha_photography',
  email: '',
  locations: 'Kolkata | Available Across India',
  booking_note: 'Based in Kolkata, available across India for weddings and destination celebrations.',
};

const HOME_DEFAULTS: Record<string, string> = {
  hero_kicker: 'Kolkata | Available Across India',
  hero_title: 'Weddings remembered like cinema',
  hero_subtitle: 'Bengali wedding photography with quiet, timeless emotion.',
  hero_cta_label: 'Enquire for your date',
  hero_scene_line: 'Shubho drishti — the first look, held for a lifetime.',
  hero_payoff_line: 'Based in Kolkata — available across India.',
  featured_heading: 'Featured Weddings',
  featured_intro: 'A few stories from recent seasons.',
  services_heading: 'What we photograph',
  services_intro: 'Coverage shaped around your rituals, not a template.',
  why_us_heading: 'Why couples choose us',
  testimonials_heading: 'Kind words',
  faq_heading: 'Questions, answered',
  cta_heading: 'Let us hold your day still',
  cta_body: 'Dates fill early for the Bengali wedding season. Reach out to check availability.',
};

const ABOUT_DEFAULTS: Record<string, string> = {
  heading: 'Behind the camera',
  intro: 'Souradeep Sinha is a wedding photographer based in Kolkata, available across India.',
  body:
    'We photograph Bengali weddings the way they actually feel — the shongkho, the aiburobhat, the quiet look before the shubho drishti. Documentary in approach, cinematic in finish.',
  closing: 'Based in Kolkata — available across India.',
};

function seed(db: DB) {
  const upsert = (table: string) =>
    db.prepare(`INSERT INTO ${table} (key, value) VALUES (?, ?) ON CONFLICT(key) DO NOTHING`);

  const settings = upsert('site_settings');
  for (const [k, v] of Object.entries(SETTINGS_DEFAULTS)) settings.run(k, v);
  const home = upsert('home_content');
  for (const [k, v] of Object.entries(HOME_DEFAULTS)) home.run(k, v);
  const about = upsert('about_content');
  for (const [k, v] of Object.entries(ABOUT_DEFAULTS)) about.run(k, v);

  // Admin credentials come from the environment. Only hashes are ever stored,
  // and the env value is authoritative on every boot so editing .env.local
  // (then restarting) is always enough to change the password.
  const username = process.env.ADMIN_USERNAME || 'souradeep';
  const raw = process.env.ADMIN_PASSWORD_HASH?.trim() || '';
  const plain = raw.startsWith('scrypt:') ? '' : raw || process.env.ADMIN_PASSWORD?.trim() || '';
  const envHash = raw.startsWith('scrypt:') ? raw : '';

  const existing = db
    .prepare('SELECT id, password_hash FROM admin_user WHERE username = ?')
    .get(username) as { id: number; password_hash: string } | undefined;

  if (!existing) {
    const hash = envHash || hashPassword(plain || 'change-me-now');
    db.prepare('INSERT INTO admin_user (username, password_hash) VALUES (?, ?)').run(username, hash);
  } else if (envHash && envHash !== existing.password_hash) {
    db.prepare('UPDATE admin_user SET password_hash = ? WHERE id = ?').run(envHash, existing.id);
  } else if (plain && !verifyPassword(plain, existing.password_hash)) {
    db.prepare('UPDATE admin_user SET password_hash = ? WHERE id = ?').run(
      hashPassword(plain),
      existing.id,
    );
  }

  const count = (table: string) =>
    (db.prepare(`SELECT COUNT(*) AS n FROM ${table}`).get() as { n: number }).n;

  if (count('services') === 0) {
    const stmt = db.prepare(
      'INSERT INTO services (title, description, sort_order) VALUES (?, ?, ?)',
    );
    [
      ['Wedding Photography', 'Full-day documentary coverage of every ritual.'],
      ['Pre-Wedding Shoot', 'A relaxed session to get comfortable before the wedding.'],
      ['Wedding Films', 'Cinematic edits cut from the day as it happened.'],
    ].forEach((row, i) => stmt.run(row[0], row[1], i));
  }

  if (count('why_us') === 0) {
    const stmt = db.prepare('INSERT INTO why_us (title, description, sort_order) VALUES (?, ?, ?)');
    [
      ['Bengali rituals, understood', 'We know what happens next, so nothing is missed.'],
      ['Unhurried, unposed', 'We direct lightly and let the day lead.'],
      ['Delivered with care', 'Colour-graded galleries, delivered on schedule.'],
    ].forEach((row, i) => stmt.run(row[0], row[1], i));
  }

  if (count('testimonials') === 0) {
    const stmt = db.prepare(
      'INSERT INTO testimonials (name, quote, sort_order) VALUES (?, ?, ?)',
    );
    [
      ['Ananya & Rudra', 'He felt like family by the end of the sanai.'],
      ['Priyanka & Arka', 'Every frame takes us straight back to that morning.'],
    ].forEach((row, i) => stmt.run(row[0], row[1], i));
  }

  if (count('faqs') === 0) {
    const stmt = db.prepare('INSERT INTO faqs (question, answer, sort_order) VALUES (?, ?, ?)');
    [
      ['Do you travel outside Kolkata?', 'Yes — available across India, including destination weddings.'],
      ['How do we book a date?', 'Call 7001048104 or message on Instagram to check availability.'],
      ['When do we receive our photographs?', 'A preview within a week, full gallery in 4–6 weeks.'],
    ].forEach((row, i) => stmt.run(row[0], row[1], i));
  }

  // Counter labels only — numbers stay at 0 so no unverified claim is ever published.
  if (count('stats') === 0) {
    const stmt = db.prepare(
      'INSERT INTO stats (label, value, prefix, suffix, visible, sort_order) VALUES (?, 0, ?, ?, 1, ?)',
    );
    [
      ['Client satisfaction rate', '', '%'],
      ['Successful photography sessions', '', '+'],
      ['Weddings & events covered', '', '+'],
      ['Years behind the camera', '', '+'],
    ].forEach((row, i) => stmt.run(row[0], row[1], row[2], i));
  }
}

/** Additive, idempotent migrations (safe to run on every boot). */
function migrate(db: DB) {
  const hasColumn = (table: string, column: string) =>
    (db.prepare(`PRAGMA table_info(${table})`).all() as { name: string }[]).some(
      (c) => c.name === column,
    );
  // Focal point (e.g. "50% 38%") keeps faces out of the crop when the hero
  // and sequence frames letterbox a portrait or landscape photograph.
  if (!hasColumn('home_media', 'focal')) {
    db.exec("ALTER TABLE home_media ADD COLUMN focal TEXT NOT NULL DEFAULT ''");
  }
  if (!hasColumn('portfolio_projects', 'focal')) {
    db.exec("ALTER TABLE portfolio_projects ADD COLUMN focal TEXT NOT NULL DEFAULT ''");
  }

  // Visibility switches and optional rating, so the client can hide rows
  // instead of deleting them.
  for (const table of ['services', 'testimonials', 'faqs'] as const) {
    if (!hasColumn(table, 'visible')) {
      db.exec(`ALTER TABLE ${table} ADD COLUMN visible INTEGER NOT NULL DEFAULT 1`);
    }
  }
  if (!hasColumn('testimonials', 'rating')) {
    db.exec('ALTER TABLE testimonials ADD COLUMN rating INTEGER NOT NULL DEFAULT 0');
  }
  // Medium delivery size (1400px) generated by the Sharp pipeline for galleries.
  for (const table of ['home_media', 'portfolio_media'] as const) {
    if (!hasColumn(table, 'medium_url')) {
      db.exec(`ALTER TABLE ${table} ADD COLUMN medium_url TEXT`);
    }
  }

  // Visual crop metadata (set by the drag/zoom editor in /studio, never typed).
  for (const table of ['home_media', 'portfolio_projects', 'services'] as const) {
    if (!hasColumn(table, 'focal')) {
      db.exec(`ALTER TABLE ${table} ADD COLUMN focal TEXT NOT NULL DEFAULT ''`);
    }
    if (!hasColumn(table, 'zoom')) {
      db.exec(`ALTER TABLE ${table} ADD COLUMN zoom REAL NOT NULL DEFAULT 1`);
    }
  }

  // Positioning change: Kolkata + available across India. Only rewrites rows that
  // still hold the previous seeded default, so client edits are never overwritten.
  const retire: [string, string, string, string][] = [
    ['site_settings', 'locations', 'Kolkata | Asansol', 'Kolkata | Available Across India'],
    ['home_content', 'hero_kicker', 'Kolkata | Asansol', 'Kolkata | Available Across India'],
    [
      'home_content',
      'hero_payoff_line',
      'Photographed across Kolkata, Asansol and beyond.',
      'Based in Kolkata — available across India.',
    ],
    [
      'about_content',
      'intro',
      'Souradeep Sinha is a wedding photographer based between Kolkata and Asansol.',
      'Souradeep Sinha is a wedding photographer based in Kolkata, available across India.',
    ],
  ];
  for (const [table, key, before, after] of retire) {
    db.prepare(`UPDATE ${table} SET value = ? WHERE key = ? AND value = ?`).run(after, key, before);
  }
  db.prepare('UPDATE faqs SET answer = ? WHERE answer = ?').run(
    'Yes — available across India, including destination weddings.',
    'Yes — Asansol, all of West Bengal, and destination weddings.',
  );
}

export function getDb(): DB {
  if (instance) return instance;
  ensureStorage();
  const db = new Database(DB_PATH);
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');
  db.exec(SCHEMA);
  migrate(db);
  seed(db);
  instance = db;
  return db;
}

export function all<T = Record<string, unknown>>(sql: string, params: unknown[] = []): T[] {
  return getDb().prepare(sql).all(...(params as [])) as T[];
}

export function one<T = Record<string, unknown>>(sql: string, params: unknown[] = []): T | undefined {
  return getDb().prepare(sql).get(...(params as [])) as T | undefined;
}

export function run(sql: string, params: unknown[] = []) {
  return getDb().prepare(sql).run(...(params as []));
}

/** key/value helpers for the singleton content tables */
export function getKeyValues(table: 'site_settings' | 'home_content' | 'about_content') {
  const rows = all<{ key: string; value: string }>(`SELECT key, value FROM ${table}`);
  return Object.fromEntries(rows.map((r) => [r.key, r.value])) as Record<string, string>;
}

export function setKeyValues(
  table: 'site_settings' | 'home_content' | 'about_content',
  values: Record<string, string>,
) {
  const db = getDb();
  const stmt = db.prepare(
    `INSERT INTO ${table} (key, value) VALUES (?, ?)
     ON CONFLICT(key) DO UPDATE SET value = excluded.value`,
  );
  const tx = db.transaction((entries: [string, string][]) => {
    for (const [k, v] of entries) {
      if (!/^[a-z0-9_]{1,64}$/.test(k)) continue;
      stmt.run(k, v ?? '');
    }
  });
  tx(Object.entries(values));
}
