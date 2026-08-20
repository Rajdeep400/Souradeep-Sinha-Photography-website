import { revalidatePath } from 'next/cache';
import { requireAdminApi } from '@/lib/auth';
import { one, run } from '@/lib/db';
import { getCollection, normalize, slugify, uniqueSlug } from '@/lib/collections';
import { deleteUpload } from '@/lib/media';

type Ctx = { params: Promise<{ resource: string; id: string }> };

export async function PUT(request: Request, ctx: Ctx) {
  const { response } = await requireAdminApi();
  if (response) return response;

  const { resource, id: rawId } = await ctx.params;
  const collection = getCollection(resource);
  const id = Number(rawId);
  if (!collection || !Number.isFinite(id)) {
    return Response.json({ error: 'Not found' }, { status: 404 });
  }

  const existing = one<Record<string, unknown>>(
    `SELECT * FROM ${collection.table} WHERE id = ?`,
    [id],
  );
  if (!existing) return Response.json({ error: 'Not found' }, { status: 404 });

  const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
  const sets: string[] = [];
  const values: unknown[] = [];
  const orphaned: string[] = [];

  for (const field of collection.fields) {
    if (!(field.name in body)) continue;
    let value = normalize(field.type, body[field.name]);

    if (collection.slugFrom && field.name === collection.slugFrom.column) {
      const base = slugify(String(value || body[collection.slugFrom.source] || ''));
      value = uniqueSlug(collection.table, field.name, base, id);
    }

    // replacing a media field removes the old file from disk
    if ((field.type === 'image' || field.type === 'video') && existing[field.name]) {
      const previous = String(existing[field.name]);
      if (previous && previous !== value) orphaned.push(previous);
    }

    sets.push(`${field.name} = ?`);
    values.push(value);
  }

  if (sets.length === 0) return Response.json({ error: 'Nothing to update' }, { status: 400 });

  run(`UPDATE ${collection.table} SET ${sets.join(', ')} WHERE id = ?`, [...values, id]);
  await Promise.allSettled(orphaned.map((url) => deleteUpload(url)));

  revalidatePath('/', 'layout');
  return Response.json({
    ok: true,
    item: one(`SELECT * FROM ${collection.table} WHERE id = ?`, [id]),
  });
}

export async function DELETE(_request: Request, ctx: Ctx) {
  const { response } = await requireAdminApi();
  if (response) return response;

  const { resource, id: rawId } = await ctx.params;
  const collection = getCollection(resource);
  const id = Number(rawId);
  if (!collection || !Number.isFinite(id)) {
    return Response.json({ error: 'Not found' }, { status: 404 });
  }

  const existing = one<Record<string, unknown>>(
    `SELECT * FROM ${collection.table} WHERE id = ?`,
    [id],
  );
  if (!existing) return Response.json({ error: 'Not found' }, { status: 404 });

  // cascade child media files for portfolio projects
  const files: string[] = [];
  for (const column of collection.mediaColumns ?? []) {
    const value = existing[column];
    if (typeof value === 'string' && value) files.push(value);
  }
  if (collection.table === 'portfolio_projects') {
    const children = one<{ urls: string | null }>(
      "SELECT group_concat(url, '|') AS urls FROM portfolio_media WHERE project_id = ?",
      [id],
    );
    if (children?.urls) files.push(...children.urls.split('|').filter(Boolean));
  }

  run(`DELETE FROM ${collection.table} WHERE id = ?`, [id]);
  await Promise.allSettled(files.map((url) => deleteUpload(url)));

  revalidatePath('/', 'layout');
  return Response.json({ ok: true });
}
