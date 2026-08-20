import 'server-only';
import { one } from './db';

export type FieldType =
  | 'text'
  | 'textarea'
  | 'image'
  | 'video'
  | 'number'
  | 'checkbox'
  | 'hidden'
  | 'crop';

export type Field = {
  name: string;
  label: string;
  type: FieldType;
  section?: string; // upload target for image/video fields
  required?: boolean;
  /** crop fields: which column holds the image, and the public aspect ratio */
  imageField?: string;
  aspect?: string;
};

export type Collection = {
  table: string;
  label: string;
  fields: Field[];
  ordered: boolean;
  /** column whose value must be unique/slugified */
  slugFrom?: { column: string; source: string };
  /** extra column set from a query param (used for portfolio media) */
  parent?: string;
  mediaColumns?: string[]; // files to remove from disk when a row is deleted
};

export const COLLECTIONS: Record<string, Collection> = {
  services: {
    table: 'services',
    label: 'Services',
    ordered: true,
    mediaColumns: ['image_url'],
    fields: [
      { name: 'title', label: 'Title', type: 'text', required: true },
      { name: 'description', label: 'Description', type: 'textarea' },
      { name: 'image_url', label: 'Image', type: 'image', section: 'services' },
      {
        name: 'focal',
        label: 'Position the photograph',
        type: 'crop',
        imageField: 'image_url',
        aspect: '4 / 5',
      },
      { name: 'zoom', label: 'Zoom', type: 'hidden' },
      { name: 'visible', label: 'Visible', type: 'checkbox' },
    ],
  },
  why_us: {
    table: 'why_us',
    label: 'Why Us',
    ordered: true,
    fields: [
      { name: 'title', label: 'Title', type: 'text', required: true },
      { name: 'description', label: 'Description', type: 'textarea' },
    ],
  },
  testimonials: {
    table: 'testimonials',
    label: 'Testimonials',
    ordered: true,
    mediaColumns: ['image_url'],
    fields: [
      { name: 'name', label: 'Name', type: 'text', required: true },
      { name: 'quote', label: 'Quote', type: 'textarea' },
      { name: 'image_url', label: 'Photo (optional)', type: 'image', section: 'home' },
      { name: 'rating', label: 'Rating out of 5 (0 = hide)', type: 'number' },
      { name: 'visible', label: 'Visible', type: 'checkbox' },
    ],
  },
  faqs: {
    table: 'faqs',
    label: 'FAQs',
    ordered: true,
    fields: [
      { name: 'question', label: 'Question', type: 'text', required: true },
      { name: 'answer', label: 'Answer', type: 'textarea' },
      { name: 'visible', label: 'Visible', type: 'checkbox' },
    ],
  },
  stats: {
    table: 'stats',
    label: 'Counters',
    ordered: true,
    fields: [
      { name: 'label', label: 'Label', type: 'text', required: true },
      { name: 'value', label: 'Target number', type: 'number' },
      { name: 'prefix', label: 'Prefix (optional)', type: 'text' },
      { name: 'suffix', label: 'Suffix (e.g. % or +)', type: 'text' },
      { name: 'visible', label: 'Visible', type: 'checkbox' },
    ],
  },
  enquiries: {
    table: 'enquiries',
    label: 'Enquiries',
    ordered: false,
    fields: [{ name: 'handled', label: 'Handled', type: 'checkbox' }],
  },
  home_media: {
    table: 'home_media',
    label: 'Home & hero imagery',
    ordered: true,
    mediaColumns: ['url', 'thumb_url', 'medium_url'],
    fields: [
      { name: 'section', label: 'Section', type: 'hidden', required: true },
      { name: 'url', label: 'Image', type: 'image', section: 'hero' },
      { name: 'thumb_url', label: 'Thumb', type: 'hidden' },
      { name: 'medium_url', label: 'Medium', type: 'hidden' },
      { name: 'alt', label: 'Alt text', type: 'text' },
      {
        name: 'focal',
        label: 'Position the photograph',
        type: 'crop',
        imageField: 'url',
        aspect: '16 / 9',
      },
      { name: 'zoom', label: 'Zoom', type: 'hidden' },
    ],
  },
  portfolio_projects: {
    table: 'portfolio_projects',
    label: 'Weddings',
    ordered: true,
    slugFrom: { column: 'slug', source: 'couple_names' },
    mediaColumns: ['cover_url', 'video_url'],
    fields: [
      { name: 'couple_names', label: 'Couple names', type: 'text', required: true },
      { name: 'slug', label: 'URL slug (auto if blank)', type: 'text' },
      { name: 'location', label: 'Location', type: 'text' },
      { name: 'wedding_date', label: 'Wedding date', type: 'text' },
      { name: 'description', label: 'Story', type: 'textarea' },
      { name: 'cover_url', label: 'Cover image', type: 'image', section: 'portfolio' },
      {
        name: 'focal',
        label: 'Position the cover photograph',
        type: 'crop',
        imageField: 'cover_url',
        aspect: '3 / 4',
      },
      { name: 'zoom', label: 'Zoom', type: 'hidden' },
      { name: 'video_url', label: 'Film (optional)', type: 'video', section: 'videos' },
      { name: 'published', label: 'Published', type: 'checkbox' },
    ],
  },
  portfolio_media: {
    table: 'portfolio_media',
    label: 'Wedding photographs',
    ordered: true,
    parent: 'project_id',
    mediaColumns: ['url', 'thumb_url', 'medium_url'],
    fields: [
      { name: 'url', label: 'Photograph', type: 'image', section: 'portfolio' },
      { name: 'thumb_url', label: 'Thumb', type: 'hidden' },
      { name: 'medium_url', label: 'Medium', type: 'hidden' },
      { name: 'alt', label: 'Alt text', type: 'text' },
    ],
  },
};

export function getCollection(name: string): Collection | null {
  return Object.prototype.hasOwnProperty.call(COLLECTIONS, name) ? COLLECTIONS[name] : null;
}

export function normalize(type: FieldType | string, value: unknown) {
  if (type === 'number') return Number(value ?? 0);
  if (type === 'checkbox') return value ? 1 : 0;
  if (value == null || value === '') return type === 'image' || type === 'video' ? null : '';
  return String(value);
}

export function uniqueSlug(table: string, column: string, base: string, excludeId?: number) {
  let candidate = base;
  let n = 2;
  while (
    one(
      `SELECT id FROM ${table} WHERE ${column} = ?${excludeId ? ' AND id != ?' : ''}`,
      excludeId ? [candidate, excludeId] : [candidate],
    )
  ) {
    candidate = `${base}-${n++}`;
  }
  return candidate;
}

export function slugify(input: string) {
  return (
    input
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 60) || 'wedding'
  );
}
