import { requireAdminApi } from '@/lib/auth';
import { deleteUpload, saveUpload } from '@/lib/media';

export const maxDuration = 60;

export async function POST(request: Request) {
  const { response } = await requireAdminApi();
  if (response) return response;

  const form = await request.formData().catch(() => null);
  const file = form?.get('file');
  const section = String(form?.get('section') ?? '');

  if (!(file instanceof File)) {
    return Response.json({ error: 'No file provided' }, { status: 400 });
  }

  try {
    const saved = await saveUpload(file, section);
    return Response.json({ ok: true, ...saved });
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : 'Upload failed' },
      { status: 400 },
    );
  }
}

export async function DELETE(request: Request) {
  const { response } = await requireAdminApi();
  if (response) return response;

  const url = new URL(request.url).searchParams.get('url') ?? '';
  try {
    await deleteUpload(url);
    return Response.json({ ok: true });
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : 'Delete failed' },
      { status: 400 },
    );
  }
}
