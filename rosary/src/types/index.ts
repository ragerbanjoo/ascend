export type Locale = 'en' | 'es';

export interface BilingualField {
  en: string;
  es: string;
}

export interface SeoData {
  title: BilingualField;
  description: BilingualField;
}

export interface OgData {
  title: BilingualField;
  description: BilingualField;
  image?: string;
}

export interface Page {
  id: string;
  slug: string;
  nav_label: BilingualField;
  seo: SeoData;
  og: OgData;
  order: number;
  is_in_nav: boolean;
  created_at: string;
  updated_at: string;
}

export interface Section {
  id: string;
  page_id: string;
  key: string;
  title: BilingualField;
  order: number;
  variant: string;
  created_at: string;
}

export interface Field {
  id: string;
  section_id: string;
  key: string;
  type: 'text' | 'richtext' | 'image' | 'link' | 'list' | 'boolean';
  value: {
    en?: string;
    es?: string;
    data?: unknown;
  };
  meta: Record<string, unknown>;
  created_at: string;
}

export interface Post {
  id: string;
  slug: string;
  title: BilingualField;
  excerpt: BilingualField;
  content: BilingualField;
  cover_image_id: string | null;
  tags: string[];
  status: 'draft' | 'published';
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Media {
  id: string;
  storage_path: string;
  alt: BilingualField;
  width: number | null;
  height: number | null;
  created_at: string;
}

export interface Revision {
  id: string;
  entity_type: string;
  entity_id: string;
  snapshot: Record<string, unknown>;
  status: string;
  created_at: string;
  created_by: string | null;
}

export interface SiteSettings {
  id: string;
  brand_name: BilingualField;
  tagline: BilingualField;
  phone_primary: string;
  phone_secondary: string;
  email: string;
  address: BilingualField;
  socials: Record<string, string>;
  primary_cta: {
    type: 'call' | 'text' | 'email' | 'link';
    value: string;
    label: BilingualField;
  };
  footer_text: BilingualField;
  announcement_banner: {
    enabled: boolean;
    text: BilingualField;
    link?: string;
  };
  meeting_time: BilingualField;
  leadership: BilingualField;
}

export interface ContactSettings {
  id: string;
  recipient_email: string;
  subject_template: string;
  success_message: BilingualField;
  fail_message: BilingualField;
  spam_toggles: {
    captcha_enabled: boolean;
    rate_limiting_enabled: boolean;
  };
}
