'use client';

import { useRouter } from 'next/navigation';

export function LogoutButton() {
  const router = useRouter();

  return (
    <button
      type="button"
      className="text-ink/60 underline"
      onClick={async () => {
        await fetch('/api/studio/logout', { method: 'POST' });
        router.replace('/studio/login');
        router.refresh();
      }}
    >
      Sign out
    </button>
  );
}
