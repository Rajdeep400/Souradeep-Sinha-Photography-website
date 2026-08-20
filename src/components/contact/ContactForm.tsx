'use client';

import { useState } from 'react';

const EVENTS = ['Wedding', 'Pre-wedding', 'Reception', 'Engagement', 'Other'];

/** Enquiry form — posts to /api/enquiries (validated + rate limited server-side). */
export function ContactForm() {
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent'>('idle');
  const [error, setError] = useState('');

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = Object.fromEntries(new FormData(form));
    setStatus('sending');
    setError('');
    const res = await fetch('/api/enquiries', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const payload = await res.json().catch(() => ({}));
      setError(payload.error ?? 'Could not send. Please call instead.');
      setStatus('idle');
      return;
    }
    form.reset();
    setStatus('sent');
  }

  const field = 'mt-2 w-full border border-ink/20 bg-transparent px-4 py-3 text-sm';
  const label = 'block text-[10px] uppercase tracking-[0.3em] text-ink/55';

  if (status === 'sent') {
    return (
      <div className="border border-gold/40 p-8">
        <p className="font-display text-2xl">Thank you — your enquiry is in.</p>
        <p className="mt-3 text-sm text-ink/70">
          Souradeep will reply personally. For urgent dates, a call is quickest.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="grid gap-6 sm:grid-cols-2">
      <label className="sm:col-span-1">
        <span className={label}>Your name *</span>
        <input name="name" required maxLength={80} className={field} autoComplete="name" />
      </label>
      <label className="sm:col-span-1">
        <span className={label}>Phone *</span>
        <input name="phone" required maxLength={24} className={field} autoComplete="tel" inputMode="tel" />
      </label>
      <label className="sm:col-span-1">
        <span className={label}>Email (optional)</span>
        <input name="email" type="email" maxLength={120} className={field} autoComplete="email" />
      </label>
      <label className="sm:col-span-1">
        <span className={label}>Wedding date</span>
        <input name="wedding_date" maxLength={40} className={field} placeholder="e.g. Feb 2027" />
      </label>
      <label className="sm:col-span-1">
        <span className={label}>Wedding location</span>
        <input name="location" maxLength={120} className={field} placeholder="Kolkata, Santiniketan…" />
      </label>
      <label className="sm:col-span-1">
        <span className={label}>Event type</span>
        <select name="event_type" className={field} defaultValue="Wedding">
          {EVENTS.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </label>
      <label className="sm:col-span-2">
        <span className={label}>Anything you would like us to know</span>
        <textarea name="message" rows={5} maxLength={2000} className={field} />
      </label>

      {/* honeypot — hidden from people, tempting to bots */}
      <input
        name="company"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden
        className="pointer-events-none absolute h-0 w-0 opacity-0"
      />

      {error ? (
        <p className="sm:col-span-2 text-sm text-vermilion" role="alert">
          {error}
        </p>
      ) : null}

      <div className="sm:col-span-2">
        <button
          type="submit"
          disabled={status === 'sending'}
          className="border border-ink px-8 py-4 text-[11px] uppercase tracking-[0.3em] transition-colors hover:bg-ink hover:text-ivory disabled:opacity-50"
        >
          {status === 'sending' ? 'Sending…' : 'Send enquiry'}
        </button>
      </div>
    </form>
  );
}
