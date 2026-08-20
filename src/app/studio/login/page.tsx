import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import { LoginForm } from '@/components/studio/LoginForm';

export const dynamic = 'force-dynamic';

export default async function LoginPage() {
  const session = await getSession();
  if (session) redirect('/studio');

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center px-5">
      <h1 className="font-display text-3xl">Studio</h1>
      <p className="mt-1 text-sm text-ink/60">Souradeep Sinha Photography — content management.</p>
      <LoginForm />
    </div>
  );
}
