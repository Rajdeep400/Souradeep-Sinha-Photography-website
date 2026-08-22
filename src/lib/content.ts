import 'server-only';
import { all, getKeyValues, one } from './db';

export type MediaRow = {
  id: number;
  section?: string;
  url: string;
  thumb_url: string | null;
  medium_url?: string | null;
  alt: string;
  focal?: string;
  zoom?: number;
  sort_order: number;
};

export type Project = {
  id: number;
  slug: string;
  couple_names: string;
  location: string;
  wedding_date: string;
  description: string;
  cover_url: string | null;
  video_url: string | null;
  focal?: string;
  zoom?: number;
  published: number;
  sort_order: number;
};

export const getSettings = () => getKeyValues('site_settings');
export const getHomeContent = () => getKeyValues('home_content');
export const getAboutContent = () => getKeyValues('about_content');

export const getMedia = (section: string) =>
  all<MediaRow>(
    'SELECT * FROM home_media WHERE section = ? ORDER BY sort_order, id',
    [section],
  );

export const getServices = (onlyVisible = true) =>
  all<{
    id: number;
    title: string;
    description: string;
    image_url: string | null;
    focal: string;
    zoom: number;
    visible: number;
  }>(
    `SELECT * FROM services ${onlyVisible ? 'WHERE visible = 1' : ''} ORDER BY sort_order, id`,
  );

export type ServicePackage = {
  id: number;
  service_id: number;
  title: string;
  subtitle: string;
  description: string;
  price: string;
  image_url: string | null;
  focal: string;
  zoom: number;
  featured: number;
  visible: number;
  sort_order: number;
};

export const getServicePackages = (
  serviceId?: number,
  onlyVisible = true,
) => {
  const conditions: string[] = [];
  const params: unknown[] = [];

  if (serviceId !== undefined) {
    conditions.push('service_id = ?');
    params.push(serviceId);
  }

  if (onlyVisible) {
    conditions.push('visible = 1');
  }

  const where =
    conditions.length > 0
      ? `WHERE ${conditions.join(' AND ')}`
      : '';

  return all<ServicePackage>(
    `SELECT * FROM service_packages
     ${where}
     ORDER BY service_id, sort_order, id`,
    params,
  );
};

export const getWhyUs = () =>
  all<{ id: number; title: string; description: string }>(
    'SELECT * FROM why_us ORDER BY sort_order, id',
  );

export const getTestimonials = (onlyVisible = true) =>
  all<{
    id: number;
    name: string;
    quote: string;
    image_url: string | null;
    rating: number;
    visible: number;
  }>(
    `SELECT * FROM testimonials ${onlyVisible ? 'WHERE visible = 1' : ''} ORDER BY sort_order, id`,
  );

export const getFaqs = (onlyVisible = true) =>
  all<{ id: number; question: string; answer: string; visible: number }>(
    `SELECT * FROM faqs ${onlyVisible ? 'WHERE visible = 1' : ''} ORDER BY sort_order, id`,
  );

export type Stat = {
  id: number;
  label: string;
  value: number;
  prefix: string;
  suffix: string;
  visible: number;
  sort_order: number;
};

export const getStats = (onlyVisible = true) =>
  all<Stat>(
    `SELECT * FROM stats ${onlyVisible ? 'WHERE visible = 1' : ''} ORDER BY sort_order, id`,
  );

export const getProjects = (onlyPublished = true) =>
  all<Project>(
    `SELECT * FROM portfolio_projects ${onlyPublished ? 'WHERE published = 1' : ''} ORDER BY sort_order, id`,
  );

export const getProjectBySlug = (slug: string) =>
  one<Project>('SELECT * FROM portfolio_projects WHERE slug = ? AND published = 1', [slug]);

export const getProjectMedia = (projectId: number) =>
  all<MediaRow>(
    'SELECT * FROM portfolio_media WHERE project_id = ? ORDER BY sort_order, id',
    [projectId],
  );

export type Enquiry = {
  id: number;
  name: string;
  phone: string;
  email: string;
  wedding_date: string;
  location: string;
  event_type: string;
  message: string;
  handled: number;
  created_at: string;
};

export const getEnquiries = () =>
  all<Enquiry>('SELECT * FROM enquiries ORDER BY handled, id DESC LIMIT 200');

/** Canonical origin for metadata; set SITE_URL in production. */
export const siteUrl = () =>
  (process.env.SITE_URL || 'http://localhost:3000').replace(/\/$/, '');

/**
 * WhatsApp deep link using the studio's number. The name shown by WhatsApp itself
 * belongs to the account; this only controls the website label and prefilled text.
 */
export const whatsappUrl = (
  number: string,
  text = 'Hello Souradeep Sinha Photography, I would like to check availability for my wedding date.',
) => {
  const digits = (number || '').replace(/\D/g, '');
  if (digits.length < 8) return null;
  const phone = digits.length > 10 ? digits : `91${digits}`;
  return `https://api.whatsapp.com/send/?phone=${phone}&text=${encodeURIComponent(
    text,
  )}&type=phone_number&app_absent=0`;
};
