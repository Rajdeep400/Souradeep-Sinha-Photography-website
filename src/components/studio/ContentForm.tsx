'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

export type ContentField = { name: string; label: string; multiline?: boolean };

/** Editor for the key/value content tables (home_content, about_content, site_settings). */
export function ContentForm({
  group,
  fields,
  values,
}: {
  group: 'home_content' | 'about_content' | 'site_settings';
  fields: ContentField[];
  values: Record<string, string>;
}) {
  const router = useRouter();
  const [draft, setDraft] = useState<Record<string, string>>(() =>
    Object.fromEntries(fields.map((f) => [f.name, values[f.name] ?? ''])),
  );
  const [status, setStatus] = useState('');
  const [busy, setBusy] = useState(false);

  async function save(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setStatus('');
    const res = await fetch(`/api/studio/content/${group}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(draft),
    });
    setBusy(false);
    setStatus(res.ok ? 'Saved' : 'Could not save');
    if (res.ok) router.refresh();
  }

  return (
    <form onSubmit={save} className="space-y-4">
      {fields.map((field) => (
        <label key={field.name} className="block text-sm">
          <span className="text-ink/70">{field.label}</span>
          {field.multiline ? (
            <textarea
              rows={5}
              className="mt-1 w-full border border-ink/20 px-3 py-2"
              value={draft[field.name] ?? ''}
              onChange={(e) => setDraft({ ...draft, [field.name]: e.target.value })}
            />
          ) : (
            <input
              className="mt-1 w-full border border-ink/20 px-3 py-2"
              value={draft[field.name] ?? ''}
              onChange={(e) => setDraft({ ...draft, [field.name]: e.target.value })}
            />
          )}
        </label>
      ))}
      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={busy}
          className="bg-ink px-5 py-2 text-sm uppercase tracking-widest text-bone disabled:opacity-50"
        >
          {busy ? 'Saving…' : 'Save'}
        </button>
        {status ? <span className="text-sm text-ink/60">{status}</span> : null}
      </div>
    </form>
  );
}
