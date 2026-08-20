import { revalidatePath } from 'next/cache';
import { requireAdminApi } from '@/lib/auth';
import { all, getDb, one, run } from '@/lib/db';
import { getCollection, normalize, slugify, uniqueSlug } from '@/lib/collections';

export async function GET(request: Request, ctx: { params: Promise<{ resource: string }> }) {
  const { response } = await requireAdminApi();
  if (response) return response;

  const collection = getCollection((await ctx.params).resource);
  if (!collection) return Response.json({ error: 'Unknown collection' }, { status: 404 });

  const parentId = new URL(request.url).searchParams.get('parentId');
  const where = collection.parent && parentId ? `WHERE ${collection.parent} = ?` : '';
  const items = all(
    `SELECT * FROM ${collection.table} ${where} ORDER BY ${
      collection.ordered ? 'sort_order, ' : ''
    }id`,
    where ? [Number(parentId)] : [],
  );
  return Response.json({ items });
}

export async function POST(request: Request, ctx: { params: Promise<{ resource: string }> }) {
  const { response } = await requireAdminApi();
  if (response) return response;

  const collection = getCollection((await ctx.params).resource);
  if (!collection) return Response.json({ error: 'Unknown collection' }, { status: 404 });

  const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
  const columns: string[] = [];
  const values: unknown[] = [];

  for (const field of collection.fields) {
    if (!(field.name in body)) continue;
    columns.push(field.name);
    values.push(normalize(field.type, body[field.name]));
  }

  if (collection.slugFrom) {
    const { column, source } = collection.slugFrom;
    const idx = columns.indexOf(column);
    const provided = idx >= 0 ? String(values[idx] ?? '') : '';
    const base = slugify(provided || String(body[source] ?? ''));
    const unique = uniqueSlug(collection.table, column, base);
    if (idx >= 0) values[idx] = unique;
    else {
      columns.push(column);
      values.push(unique);
    }
  }

  if (collection.parent) {
    const parentId = Number(body[collection.parent]);
    if (!Number.isFinite(parentId)) {
      return Response.json({ error: 'Missing parent id' }, { status: 400 });
    }
    columns.push(collection.parent);
    values.push(parentId);
  }

  if (collection.ordered) {
    const next = one<{ n: number }>(
      `SELECT COALESCE(MAX(sort_order), -1) + 1 AS n FROM ${collection.table}`,
    );
    columns.push('sort_order');
    values.push(next?.n ?? 0);
  }

  if (columns.length === 0) return Response.json({ error: 'Nothing to insert' }, { status: 400 });

  const info = run(
    `INSERT INTO ${collection.table} (${columns.join(', ')}) VALUES (${columns.map(() => '?').join(', ')})`,
    values,
  );
  revalidatePath('/', 'layout');
  return Response.json({
    ok: true,
    item: one(`SELECT * FROM ${collection.table} WHERE id = ?`, [info.lastInsertRowid]),
  });
}

/** Reorder: body { ids: number[] } in the desired order. */
export async function PATCH(request: Request, ctx: { params: Promise<{ resource: string }> }) {
  const { response } = await requireAdminApi();
  if (response) return response;

  const collection = getCollection((await ctx.params).resource);
  if (!collection || !collection.ordered) {
    return Response.json({ error: 'Collection is not orderable' }, { status: 400 });
  }

  const body = (await request.json().catch(() => ({}))) as { ids?: unknown };
  const ids = Array.isArray(body.ids) ? body.ids.map(Number).filter(Number.isFinite) : [];
  if (ids.length === 0) return Response.json({ error: 'ids required' }, { status: 400 });

  const db = getDb();
  const stmt = db.prepare(`UPDATE ${collection.table} SET sort_order = ? WHERE id = ?`);
  db.transaction((list: number[]) => list.forEach((id, i) => stmt.run(i, id)))(ids);

  revalidatePath('/', 'layout');
  return Response.json({ ok: true });
}

