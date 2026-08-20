# Deployment — Souradeep Sinha Photography

Persistent Linux VPS. **Not** Vercel/serverless: the site depends on a local SQLite
file and a local uploads directory that must survive every redeployment.

```text
/var/www/souradeep/        # Next.js application (replaceable)
/var/www/souradeep-data/   # PERSISTENT — never delete
    site.db
    uploads/{hero,home,portfolio,services,about,videos}
```

## 1. Requirements

- Node.js 20 LTS or newer (`node -v`)
- npm 10+
- nginx (reverse proxy) + certbot (HTTPS)
- PM2 (`npm i -g pm2`) or a systemd unit

## 2. First deployment

```bash
sudo mkdir -p /var/www/souradeep /var/www/souradeep-data/uploads
sudo chown -R $USER:$USER /var/www/souradeep /var/www/souradeep-data

# copy the application (git clone, rsync or scp) into /var/www/souradeep
cd /var/www/souradeep
npm ci
```

## 3. Environment

Create `/var/www/souradeep/.env` (never commit it):

```env
NODE_ENV=production
DATA_DIR=/var/www/souradeep-data
SITE_URL=https://your-domain.com
ADMIN_USERNAME=souradeep
ADMIN_PASSWORD_HASH=        # see below
SESSION_SECRET=             # openssl rand -hex 32
PORT=3000
```

Generate the password hash (only the hash is stored; the plain password is never saved):

```bash
npm run set-password -- "a-strong-password"   # paste the printed line into .env
```

`ADMIN_PASSWORD_HASH` also accepts a plain password — it is hashed with scrypt on boot.
Changing it and restarting updates the admin login.

Permissions: the Node process user must own the data directory.

```bash
sudo chown -R www-data:www-data /var/www/souradeep-data   # if running as www-data
sudo chmod 750 /var/www/souradeep-data
```

## 4. Build and run

```bash
cd /var/www/souradeep
npm run build
pm2 start npm --name souradeep -- start
pm2 save
pm2 startup            # run the printed command once so it survives reboots
```

The database and upload folders are created automatically on first boot.

## 5. nginx + HTTPS

```nginx
server {
    server_name your-domain.com www.your-domain.com;

    client_max_body_size 60M;   # DSLR uploads via /studio

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
sudo ln -s /etc/nginx/sites-available/souradeep /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
sudo certbot --nginx -d your-domain.com -d www.your-domain.com
```

HTTPS matters beyond privacy: the session cookie is issued with the `Secure` flag in
production, so `/studio` login requires TLS.

### Serving uploaded media

Media is served by the app from `/uploads/...` (immutable cache headers), which keeps
the path-traversal guard in front of every file. Optional nginx shortcut:

```nginx
location /uploads/ {
    alias /var/www/souradeep-data/uploads/;
    add_header Cache-Control "public, max-age=31536000, immutable";
    try_files $uri @app;
}
location @app { proxy_pass http://127.0.0.1:3000; }
```

## 6. Redeployment

```bash
cd /var/www/souradeep
git pull                 # or rsync the new build
npm ci
npm run build
pm2 restart souradeep
```

`DATA_DIR` is outside the application directory, so `site.db` and `uploads/` are
untouched by a redeploy. Never run `rm -rf /var/www/souradeep-data`.

New database columns are added automatically by idempotent migrations on boot — there
is no separate migration command.

## 7. Backups — both parts are required

The client's content lives in two places: the database **and** the uploaded media.

```bash
sudo tee /usr/local/bin/souradeep-backup.sh >/dev/null <<'SH'
#!/usr/bin/env bash
set -euo pipefail
STAMP=$(date +%F-%H%M)
DEST=/var/backups/souradeep
mkdir -p "$DEST"
# safe copy of a live SQLite database (WAL-aware)
sqlite3 /var/www/souradeep-data/site.db ".backup '$DEST/site-$STAMP.db'"
tar -czf "$DEST/uploads-$STAMP.tar.gz" -C /var/www/souradeep-data uploads
find "$DEST" -type f -mtime +30 -delete
SH
sudo chmod +x /usr/local/bin/souradeep-backup.sh
sudo crontab -e     # 30 2 * * * /usr/local/bin/souradeep-backup.sh
```

Copy `/var/backups/souradeep` off the server periodically (rsync, S3, Drive).

### Restore

```bash
pm2 stop souradeep
cp /var/backups/souradeep/site-<stamp>.db /var/www/souradeep-data/site.db
rm -f /var/www/souradeep-data/site.db-wal /var/www/souradeep-data/site.db-shm
tar -xzf /var/backups/souradeep/uploads-<stamp>.tar.gz -C /var/www/souradeep-data
chown -R www-data:www-data /var/www/souradeep-data
pm2 start souradeep
```

## 8. Restart / logs / health

```bash
pm2 restart souradeep
pm2 logs souradeep --lines 100
pm2 status
curl -I https://your-domain.com
```

## 9. Security checklist

- `.env`, `.env.local` and `data/` are gitignored — keep them out of the repository
- Only the scrypt hash is stored; the password hash and session secret stay server-side
- Session cookie: HTTP-only, SameSite=Lax, Secure in production
- `/studio` and every write API check the session server-side
- Uploads are authenticated, sniffed by magic bytes, given safe random filenames, and
  resolved inside the uploads root (path traversal blocked)
- All SQL uses parameterized statements
- Enquiry form is validated, sanitized, honeypotted and rate limited (5/hour per IP)
- Keep the OS and Node patched: `sudo apt update && sudo apt upgrade`
