'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

export function LoginForm() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError('');
    const res = await fetch('/api/studio/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    setBusy(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? 'Login failed');
      return;
    }
    router.replace('/studio');
    router.refresh();
  }

  return (
    <form onSubmit={submit} className="mt-8 space-y-4">
      <label className="block text-sm">
        Username
        <input
          className="mt-1 w-full border border-ink/20 bg-white px-3 py-2"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          autoComplete="username"
          required
        />
      </label>
      <label className="block text-sm">
        Password
        <input
          type="password"
          className="mt-1 w-full border border-ink/20 bg-white px-3 py-2"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
          required
        />
      </label>
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      <button
        type="submit"
        disabled={busy}
        className="w-full bg-ink px-4 py-3 text-sm uppercase tracking-widest text-bone disabled:opacity-50"
      >
        {busy ? 'Signing in…' : 'Sign in'}
      </button>
    </form>
  );
}
