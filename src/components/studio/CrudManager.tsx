'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { CropField } from '@/components/studio/CropField';

export type ClientField = {
  name: string;
  label: string;
  type: 'text' | 'textarea' | 'image' | 'video' | 'number' | 'checkbox' | 'hidden' | 'crop';
  section?: string;
  required?: boolean;
  imageField?: string;
  aspect?: string;
};

type Row = Record<string, unknown> & { id: number };

/**
 * Generic CRUD + reorder + media upload UI driven by a collection's field list.
 * One component covers services, why-us, testimonials, FAQs, imagery and portfolio.
 */
export function CrudManager({
  resource,
  fields,
  items,
  ordered = true,
  fixed = {},
  uploadSection,
  addLabel = 'Add',
  childHrefBase,
}: {
  resource: string;
  fields: ClientField[];
  items: Row[];
  ordered?: boolean;
  fixed?: Record<string, string | number>;
  uploadSection?: string;
  addLabel?: string;
  /** when set, each row links to `${childHrefBase}/${row.id}` */
  childHrefBase?: string;
}) {
  const router = useRouter();
  const [rows, setRows] = useState<Row[]>(items);
  const [draft, setDraft] = useState<Record<string, unknown>>({});
  const [editing, setEditing] = useState<number | null>(null);
  const [editDraft, setEditDraft] = useState<Record<string, unknown>>({});
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const visible = fields.filter((f) => f.type !== 'hidden' && !(f.name in fixed));

  async function upload(file: File, field: ClientField) {
    const body = new FormData();
    body.append('file', file);
    body.append('section', uploadSection ?? field.section ?? 'home');
    const res = await fetch('/api/studio/media', { method: 'POST', body });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error ?? 'Upload failed');
    return data as { url: string; thumbUrl: string | null; mediumUrl: string | null };
  }

  function applyUpload(
    setter: (patch: Record<string, unknown>) => void,
    field: ClientField,
    data: { url: string; thumbUrl: string | null; mediumUrl?: string | null },
  ) {
    const patch: Record<string, unknown> = { [field.name]: data.url };
    if (data.thumbUrl && fields.some((f) => f.name === 'thumb_url')) {
      patch.thumb_url = data.thumbUrl;
    }
    if (data.mediumUrl && fields.some((f) => f.name === 'medium_url')) {
      patch.medium_url = data.mediumUrl;
    }
    setter(patch);
  }

  async function create(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError('');
    const res = await fetch(`/api/studio/collections/${resource}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...fixed, ...draft }),
    });
    const data = await res.json();
    setBusy(false);
    if (!res.ok) return setError(data.error ?? 'Could not save');
    setRows([...rows, data.item]);
    setDraft({});
    router.refresh();
  }

  async function update(id: number) {
    setBusy(true);
    setError('');
    const res = await fetch(`/api/studio/collections/${resource}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editDraft),
    });
    const data = await res.json();
    setBusy(false);
    if (!res.ok) return setError(data.error ?? 'Could not update');
    setRows(rows.map((row) => (row.id === id ? data.item : row)));
    setEditing(null);
    router.refresh();
  }

  async function remove(id: number) {
    if (!confirm('Delete this item? Uploaded files are removed too.')) return;
    const res = await fetch(`/api/studio/collections/${resource}/${id}`, { method: 'DELETE' });
    if (!res.ok) return setError('Could not delete');
    setRows(rows.filter((row) => row.id !== id));
    router.refresh();
  }

  async function move(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= rows.length) return;
    const next = [...rows];
    [next[index], next[target]] = [next[target], next[index]];
    setRows(next);
    await fetch(`/api/studio/collections/${resource}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids: next.map((row) => row.id) }),
    });
    router.refresh();
  }

  function field(
    f: ClientField,
    value: unknown,
    setter: (patch: Record<string, unknown>) => void,
    keyPrefix: string,
    record: Record<string, unknown> = {},
  ) {
    const common = 'mt-1 w-full border border-ink/20 px-3 py-2 text-sm';

    if (f.type === 'crop') {
      const src = String(record[f.imageField ?? 'url'] ?? '');
      if (!src) {
        return <p className="mt-2 text-xs text-ink/45">Upload a photograph first.</p>;
      }
      return (
        <CropField
          src={src}
          aspect={f.aspect ?? '4 / 5'}
          label={f.label}
          value={{ focal: String(value ?? '') || '50% 40%', zoom: Number(record.zoom) || 1 }}
          onChange={(next) => setter({ [f.name]: next.focal, zoom: next.zoom })}
        />
      );
    }

    if (f.type === 'textarea') {
      return (
        <textarea
          rows={4}
          className={common}
          value={String(value ?? '')}
          onChange={(e) => setter({ [f.name]: e.target.value })}
        />
      );
    }
    if (f.type === 'checkbox') {
      return (
        <input
          type="checkbox"
          className="mt-2 block h-4 w-4"
          checked={Boolean(value)}
          onChange={(e) => setter({ [f.name]: e.target.checked })}
        />
      );
    }
    if (f.type === 'image' || f.type === 'video') {
      return (
        <div className="mt-1 space-y-2">
          {value ? (
            f.type === 'image' ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img src={String(value)} alt="" className="h-24 w-24 object-cover" />
            ) : (
              <p className="text-xs text-ink/60">{String(value)}</p>
            )
          ) : null}
          <input
            key={`${keyPrefix}-${f.name}-${String(value ?? '')}`}
            type="file"
            accept={f.type === 'image' ? 'image/*' : 'video/*'}
            className="block text-xs"
            onChange={async (e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              setBusy(true);
              setError('');
              try {
                applyUpload(setter, f, await upload(file, f));
              } catch (err) {
                setError(err instanceof Error ? err.message : 'Upload failed');
              } finally {
                setBusy(false);
              }
            }}
          />
          {value ? (
            <button
              type="button"
              className="text-xs underline"
              onClick={() => setter({ [f.name]: '' })}
            >
              Clear
            </button>
          ) : null}
        </div>
      );
    }
    return (
      <input
        type={f.type === 'number' ? 'number' : 'text'}
        className={common}
        value={String(value ?? '')}
        onChange={(e) => setter({ [f.name]: e.target.value })}
      />
    );
  }

  return (
    <div className="space-y-8">
      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      <ul className="space-y-4">
        {rows.map((row, index) => {
          const isEditing = editing === row.id;
          return (
            <li key={row.id} className="border border-ink/10 p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  {typeof row.url === 'string' || typeof row.cover_url === 'string' ||
                  typeof row.image_url === 'string' ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={String(row.thumb_url || row.url || row.cover_url || row.image_url)}
                      alt=""
                      className="h-16 w-16 object-cover"
                    />
                  ) : null}
                  <div>
                    <p className="font-medium">
                      {String(
                        row.title ?? row.couple_names ?? row.name ?? row.question ?? row.alt ?? `#${row.id}`,
                      ) || `#${row.id}`}
                    </p>
                    <p className="max-w-xl text-sm text-ink/60">
                      {String(row.description ?? row.quote ?? row.answer ?? row.location ?? '')}
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-3 text-sm">
                  {ordered ? (
                    <>
                      <button type="button" onClick={() => move(index, -1)} className="underline">
                        ↑
                      </button>
                      <button type="button" onClick={() => move(index, 1)} className="underline">
                        ↓
                      </button>
                    </>
                  ) : null}
                  {childHrefBase ? (
                    <a href={`${childHrefBase}/${row.id}`} className="underline">
                      Open
                    </a>
                  ) : null}
                  <button
                    type="button"
                    className="underline"
                    onClick={() => {
                      setEditing(isEditing ? null : row.id);
                      setEditDraft(
                        Object.fromEntries(fields.map((f) => [f.name, row[f.name] ?? ''])),
                      );
                    }}
                  >
                    {isEditing ? 'Close' : 'Edit'}
                  </button>
                  <button type="button" className="text-red-600 underline" onClick={() => remove(row.id)}>
                    Delete
                  </button>
                </div>
              </div>

              {isEditing ? (
                <div className="mt-4 grid gap-4 border-t border-ink/10 pt-4 sm:grid-cols-2">
                  {visible.map((f) => (
                    <label key={f.name} className="block text-sm">
                      <span className="text-ink/70">{f.label}</span>
                      {field(
                        f,
                        editDraft[f.name],
                        (patch) => setEditDraft((prev) => ({ ...prev, ...patch })),
                        `edit-${row.id}`,
                        editDraft,
                      )}
                    </label>
                  ))}
                  <div className="sm:col-span-2">
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => update(row.id)}
                      className="bg-ink px-5 py-2 text-sm uppercase tracking-widest text-bone disabled:opacity-50"
                    >
                      {busy ? 'Saving…' : 'Save changes'}
                    </button>
                  </div>
                </div>
              ) : null}
            </li>
          );
        })}
        {rows.length === 0 ? <li className="text-sm text-ink/50">Nothing here yet.</li> : null}
      </ul>

      <form onSubmit={create} className="border border-dashed border-ink/25 p-4">
        <p className="text-sm font-medium">{addLabel}</p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {visible.map((f) => (
            <label key={f.name} className="block text-sm">
              <span className="text-ink/70">{f.label}</span>
              {field(
                f,
                draft[f.name],
                (patch) => setDraft((prev) => ({ ...prev, ...patch })),
                'new',
                draft,
              )}
            </label>
          ))}
        </div>
        <button
          type="submit"
          disabled={busy}
          className="mt-4 border border-ink px-5 py-2 text-sm uppercase tracking-widest disabled:opacity-50"
        >
          {busy ? 'Working…' : addLabel}
        </button>
      </form>
    </div>
  );
}
