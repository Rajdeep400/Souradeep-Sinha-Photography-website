'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import type { Enquiry } from '@/lib/content';

/** Minimal enquiry inbox: mark handled or delete. No CRM. */
export function EnquiryList({ items }: { items: Enquiry[] }) {
  const router = useRouter();
  const [rows, setRows] = useState(items);
  const [busy, setBusy] = useState<number | null>(null);

  async function update(id: number, handled: boolean) {
    setBusy(id);
    await fetch(`/api/studio/collections/enquiries/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ handled }),
    });
    setRows(rows.map((row) => (row.id === id ? { ...row, handled: handled ? 1 : 0 } : row)));
    setBusy(null);
    router.refresh();
  }

  async function remove(id: number) {
    if (!confirm('Delete this enquiry?')) return;
    setBusy(id);
    await fetch(`/api/studio/collections/enquiries/${id}`, { method: 'DELETE' });
    setRows(rows.filter((row) => row.id !== id));
    setBusy(null);
    router.refresh();
  }

  if (rows.length === 0) {
    return <p className="text-sm text-ink/50">No enquiries yet.</p>;
  }

  return (
    <ul className="space-y-4">
      {rows.map((row) => (
        <li
          key={row.id}
          className={`border p-4 ${row.handled ? 'border-ink/10 opacity-60' : 'border-gold/40'}`}
        >
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="font-medium">
                {row.name} · <a href={`tel:${row.phone}`} className="underline">{row.phone}</a>
                {row.email ? (
                  <>
                    {' · '}
                    <a href={`mailto:${row.email}`} className="underline">
                      {row.email}
                    </a>
                  </>
                ) : null}
              </p>
              <p className="mt-1 text-sm text-ink/60">
                {[row.event_type, row.wedding_date, row.location].filter(Boolean).join(' · ')}
              </p>
              {row.message ? (
                <p className="mt-2 max-w-2xl whitespace-pre-line text-sm text-ink/75">
                  {row.message}
                </p>
              ) : null}
              <p className="mt-2 text-xs text-ink/40">{row.created_at} UTC</p>
            </div>
            <div className="flex items-center gap-4 text-sm">
              <button
                type="button"
                disabled={busy === row.id}
                onClick={() => update(row.id, !row.handled)}
                className="underline disabled:opacity-50"
              >
                {row.handled ? 'Mark unhandled' : 'Mark handled'}
              </button>
              <button
                type="button"
                disabled={busy === row.id}
                onClick={() => remove(row.id)}
                className="text-red-600 underline disabled:opacity-50"
              >
                Delete
              </button>
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}
