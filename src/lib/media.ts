import 'server-only';
import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';
import { UPLOADS_DIR, ensureStorage, isUploadSection, resolveUploadPath } from './paths';

const IMAGE_MIME = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/avif']);
const VIDEO_MIME = new Set(['video/mp4', 'video/webm', 'video/quicktime']);
const VIDEO_EXT: Record<string, string> = {
  'video/mp4': '.mp4',
  'video/webm': '.webm',
  'video/quicktime': '.mov',
};

export type SavedMedia = {
  url: string;
  thumbUrl: string | null;
  mediumUrl: string | null;
  kind: 'image' | 'video';
};

/** Magic-byte sniffing — never trust the client-declared mime type alone. */
function sniff(buf: Buffer): string | null {
  if (buf.length < 12) return null;
  if (buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return 'image/jpeg';
  if (buf.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])))
    return 'image/png';
  const riff = buf.subarray(0, 4).toString('ascii');
  if (riff === 'RIFF' && buf.subarray(8, 12).toString('ascii') === 'WEBP') return 'image/webp';
  if (buf.subarray(4, 8).toString('ascii') === 'ftyp') {
    const brand = buf.subarray(8, 12).toString('ascii');
    if (brand.startsWith('avif') || brand.startsWith('avis')) return 'image/avif';
    if (brand.startsWith('qt')) return 'video/quicktime';
    return 'video/mp4';
  }
  if (buf.subarray(0, 4).equals(Buffer.from([0x1a, 0x45, 0xdf, 0xa3]))) return 'video/webm';
  return null;
}

function safeName(original: string) {
  const base = path
    .basename(original, path.extname(original))
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 48);
  return `${base || 'file'}-${crypto.randomBytes(6).toString('hex')}`;
}

export async function saveUpload(file: File, section: string): Promise<SavedMedia> {
  if (!isUploadSection(section)) throw new Error('Invalid upload section');
  ensureStorage();

  const buffer = Buffer.from(await file.arrayBuffer());
  if (buffer.length === 0) throw new Error('Empty file');

  const detected = sniff(buffer);
  if (!detected) throw new Error('Unsupported file type');

  const declared = file.type || detected;
  const isImage = IMAGE_MIME.has(detected) && (IMAGE_MIME.has(declared) || !file.type);
  const isVideo = VIDEO_MIME.has(detected) && (VIDEO_MIME.has(declared) || !file.type);
  if (!isImage && !isVideo) throw new Error(`Unsupported file type: ${detected}`);

  const stem = safeName(file.name || 'upload');

  if (isVideo) {
    const dir = path.join(UPLOADS_DIR, 'videos');
    await fs.mkdir(dir, { recursive: true });
    const filename = `${stem}${VIDEO_EXT[detected] ?? '.mp4'}`;
    await fs.writeFile(path.join(dir, filename), buffer);
    return { url: `/uploads/videos/${filename}`, thumbUrl: null, mediumUrl: null, kind: 'video' };
  }

  const dir = path.join(UPLOADS_DIR, section);
  await fs.mkdir(dir, { recursive: true });

  // Web delivery sizes: large (2400), medium (1400), thumbnail (600).
  // The original DSLR file is never served.
  const image = sharp(buffer, { failOn: 'none' }).rotate();
  const render = (width: number, quality: number) =>
    image
      .clone()
      .resize({ width, height: width, fit: 'inside', withoutEnlargement: true })
      .webp({ quality, effort: 4 })
      .toBuffer();

  const [full, medium, thumb] = await Promise.all([
    render(2400, 82),
    render(1400, 80),
    render(600, 72),
  ]);

  await Promise.all([
    fs.writeFile(path.join(dir, `${stem}.webp`), full),
    fs.writeFile(path.join(dir, `${stem}-md.webp`), medium),
    fs.writeFile(path.join(dir, `${stem}-thumb.webp`), thumb),
  ]);

  return {
    url: `/uploads/${section}/${stem}.webp`,
    thumbUrl: `/uploads/${section}/${stem}-thumb.webp`,
    mediumUrl: `/uploads/${section}/${stem}-md.webp`,
    kind: 'image',
  };
}

/** Deletes a stored file (and its thumbnail) if it lives inside the uploads root. */
export async function deleteUpload(url: string) {
  if (!url) return;
  const abs = resolveUploadPath(url);
  if (!abs) throw new Error('Refusing to delete outside the uploads directory');
  const targets = [abs];
  if (abs.endsWith('.webp') && !abs.endsWith('-thumb.webp') && !abs.endsWith('-md.webp')) {
    targets.push(abs.replace(/\.webp$/, '-thumb.webp'), abs.replace(/\.webp$/, '-md.webp'));
  }
  await Promise.all(targets.map((t) => fs.rm(t, { force: true })));
}
