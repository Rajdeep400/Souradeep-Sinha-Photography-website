import { checkCredentials, createSession } from '@/lib/auth';

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const username = typeof body?.username === 'string' ? body.username.trim() : '';
  const password = typeof body?.password === 'string' ? body.password : '';

  if (!username || !password) {
    return Response.json({ error: 'Username and password are required' }, { status: 400 });
  }
  if (!checkCredentials(username, password)) {
    return Response.json({ error: 'Invalid credentials' }, { status: 401 });
  }

  await createSession(username);
  return Response.json({ ok: true });
}
