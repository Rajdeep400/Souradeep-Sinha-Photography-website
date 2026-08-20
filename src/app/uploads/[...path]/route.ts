import fs from 'node:fs';
import path from 'node:path';
import { resolveUploadPath } from '@/lib/paths';

const TYPES: Record<string, string> = {
  '.webp': 'image/webp',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.avif': 'image/avif',
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
  '.mov': 'video/quicktime',
};

/** Serves media from the persistent data directory (outside the app bundle). */
export async function GET(_request: Request, ctx: { params: Promise<{ path: string[] }> }) {
  const segments = (await ctx.params).path ?? [];
  const abs = resolveUploadPath(segments.join('/'));
  if (!abs || !fs.existsSync(abs) || !fs.statSync(abs).isFile()) {
    return new Response('Not found', { status: 404 });
  }

  const file = await fs.promises.readFile(abs);
  return new Response(new Uint8Array(file), {
    headers: {
      'Content-Type': TYPES[path.extname(abs).toLowerCase()] ?? 'application/octet-stream',
      'Content-Length': String(file.byteLength),
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  });
}
