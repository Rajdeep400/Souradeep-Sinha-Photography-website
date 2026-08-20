import { revalidatePath } from 'next/cache';
import { requireAdminApi } from '@/lib/auth';
import { getKeyValues, setKeyValues } from '@/lib/db';

const GROUPS = ['site_settings', 'home_content', 'about_content'] as const;
type Group = (typeof GROUPS)[number];

function parseGroup(value: string): Group | null {
  return (GROUPS as readonly string[]).includes(value) ? (value as Group) : null;
}

export async function GET(_req: Request, ctx: { params: Promise<{ group: string }> }) {
  const { response } = await requireAdminApi();
  if (response) return response;
  const group = parseGroup((await ctx.params).group);
  if (!group) return Response.json({ error: 'Unknown group' }, { status: 404 });
  return Response.json({ values: getKeyValues(group) });
}

export async function PUT(request: Request, ctx: { params: Promise<{ group: string }> }) {
  const { response } = await requireAdminApi();
  if (response) return response;
  const group = parseGroup((await ctx.params).group);
  if (!group) return Response.json({ error: 'Unknown group' }, { status: 404 });

  const body = await request.json().catch(() => null);
  if (!body || typeof body !== 'object') {
    return Response.json({ error: 'Invalid body' }, { status: 400 });
  }

  const values: Record<string, string> = {};
  for (const [k, v] of Object.entries(body as Record<string, unknown>)) {
    values[k] = v == null ? '' : String(v);
  }
  setKeyValues(group, values);

  revalidatePath('/', 'layout');
  return Response.json({ ok: true, values: getKeyValues(group) });
}
