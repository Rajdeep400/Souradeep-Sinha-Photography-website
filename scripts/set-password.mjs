#!/usr/bin/env node
// Usage: npm run set-password -- "your-strong-password"
// Prints ADMIN_PASSWORD_HASH for .env, and updates the DB row if it already exists.
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const password = process.argv[2];
if (!password) {
  console.error('Usage: npm run set-password -- "your-strong-password"');
  process.exit(1);
}

const salt = crypto.randomBytes(16);
const hash = `scrypt:16384:${salt.toString('hex')}:${crypto
  .scryptSync(password, salt, 64)
  .toString('hex')}`;

console.log(`ADMIN_PASSWORD_HASH=${hash}`);

const dataDir = process.env.DATA_DIR || './data';
const dbPath = process.env.DB_PATH || path.join(dataDir, 'site.db');
if (fs.existsSync(dbPath)) {
  const { default: Database } = await import('better-sqlite3');
  const db = new Database(dbPath);
  const username = process.env.ADMIN_USERNAME || 'souradeep';
  const info = db
    .prepare('UPDATE admin_user SET password_hash = ? WHERE username = ?')
    .run(hash, username);
  if (info.changes === 0) {
    db.prepare('INSERT INTO admin_user (username, password_hash) VALUES (?, ?)').run(
      username,
      hash,
    );
  }
  console.log(`Updated admin_user "${username}" in ${dbPath}`);
}
