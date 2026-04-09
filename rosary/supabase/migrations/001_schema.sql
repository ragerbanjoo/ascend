-- ============================================================
-- St. Juan Diego YAG — Full Schema Migration
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- PROFILES
-- ============================================================
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  is_admin BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- SITES (global settings — single row)
-- ============================================================
CREATE TABLE IF NOT EXISTS sites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  brand_name JSONB NOT NULL DEFAULT '{"en":"St. Juan Diego YAG","es":"San Juan Diego YAG"}',
  tagline JSONB NOT NULL DEFAULT '{"en":"Young Adult Group","es":"Grupo de Jóvenes Adultos"}',
  phone_primary TEXT NOT NULL DEFAULT '509-678-4164',
  phone_secondary TEXT NOT NULL DEFAULT '509-678-4165',
  email TEXT NOT NULL DEFAULT 'info@stjuandiegoyoungadults.com',
  address JSONB NOT NULL DEFAULT '{"en":"15800 Summitview Road, Cowiche, WA 98923","es":"15800 Summitview Road, Cowiche, WA 98923"}',
  socials JSONB NOT NULL DEFAULT '{}',
  primary_cta JSONB NOT NULL DEFAULT '{"type":"call","value":"5096784164","label":{"en":"Call Us","es":"Llámanos"}}',
  footer_text JSONB NOT NULL DEFAULT '{"en":"© St. Juan Diego Young Adult Group. All rights reserved.","es":"© Grupo de Jóvenes Adultos San Juan Diego. Todos los derechos reservados."}',
  announcement_banner JSONB NOT NULL DEFAULT '{"enabled":false,"text":{"en":"","es":""},"link":""}',
  meeting_time JSONB NOT NULL DEFAULT '{"en":"Mondays at 6:00 PM","es":"Lunes a las 6:00 PM"}',
  leadership JSONB NOT NULL DEFAULT '{"en":"Gaby Gomez + team","es":"Gaby Gomez + equipo"}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- PAGES
-- ============================================================
CREATE TABLE IF NOT EXISTS pages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug TEXT NOT NULL UNIQUE,
  nav_label JSONB NOT NULL DEFAULT '{"en":"","es":""}',
  seo JSONB NOT NULL DEFAULT '{"title":{"en":"","es":""},"description":{"en":"","es":""}}',
  og JSONB NOT NULL DEFAULT '{"title":{"en":"","es":""},"description":{"en":"","es":""},"image":""}',
  "order" INT NOT NULL DEFAULT 0,
  is_in_nav BOOLEAN NOT NULL DEFAULT true,
  status TEXT NOT NULL DEFAULT 'published' CHECK (status IN ('draft','published')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- SECTIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS sections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  page_id UUID NOT NULL REFERENCES pages(id) ON DELETE CASCADE,
  key TEXT NOT NULL,
  title JSONB NOT NULL DEFAULT '{"en":"","es":""}',
  "order" INT NOT NULL DEFAULT 0,
  variant TEXT NOT NULL DEFAULT 'default',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(page_id, key)
);

-- ============================================================
-- FIELDS
-- ============================================================
CREATE TABLE IF NOT EXISTS fields (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  section_id UUID NOT NULL REFERENCES sections(id) ON DELETE CASCADE,
  key TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'text' CHECK (type IN ('text','richtext','image','link','list','boolean')),
  value JSONB NOT NULL DEFAULT '{"en":"","es":""}',
  meta JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(section_id, key)
);

-- ============================================================
-- MEDIA
-- ============================================================
CREATE TABLE IF NOT EXISTS media (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  storage_path TEXT NOT NULL,
  alt JSONB NOT NULL DEFAULT '{"en":"","es":""}',
  width INT,
  height INT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- POSTS (Reflections / Reflexiones)
-- ============================================================
CREATE TABLE IF NOT EXISTS posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug TEXT NOT NULL UNIQUE,
  title JSONB NOT NULL DEFAULT '{"en":"","es":""}',
  excerpt JSONB NOT NULL DEFAULT '{"en":"","es":""}',
  content JSONB NOT NULL DEFAULT '{"en":"","es":""}',
  cover_image_id UUID REFERENCES media(id) ON DELETE SET NULL,
  tags JSONB NOT NULL DEFAULT '[]',
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','published')),
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- REVISIONS (version history)
-- ============================================================
CREATE TABLE IF NOT EXISTS revisions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  entity_type TEXT NOT NULL,
  entity_id UUID NOT NULL,
  snapshot JSONB NOT NULL DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'snapshot',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_revisions_entity ON revisions(entity_type, entity_id);

-- ============================================================
-- CONTACT SETTINGS
-- ============================================================
CREATE TABLE IF NOT EXISTS contact_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  recipient_email TEXT NOT NULL DEFAULT 'info@stjuandiegoyoungadults.com',
  subject_template TEXT NOT NULL DEFAULT 'New Contact Form Submission from {{name}}',
  success_message JSONB NOT NULL DEFAULT '{"en":"Thank you for your message! We will get back to you soon.","es":"¡Gracias por tu mensaje! Nos pondremos en contacto contigo pronto."}',
  fail_message JSONB NOT NULL DEFAULT '{"en":"Something went wrong. Please try again later.","es":"Algo salió mal. Por favor intenta de nuevo más tarde."}',
  spam_toggles JSONB NOT NULL DEFAULT '{"captcha_enabled":false,"rate_limiting_enabled":false}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- CONTACT SUBMISSIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS contact_submissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  payload JSONB NOT NULL DEFAULT '{}',
  ip_hash TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

-- Helper function: check if current user is admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles
    WHERE user_id = auth.uid()
    AND is_admin = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- PROFILES
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read own profile" ON profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can read all profiles" ON profiles FOR SELECT USING (is_admin());
CREATE POLICY "Admins can manage profiles" ON profiles FOR ALL USING (is_admin());

-- SITES
ALTER TABLE sites ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can read sites" ON sites FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admins can manage sites" ON sites FOR ALL USING (is_admin());

-- PAGES
ALTER TABLE pages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can read published pages" ON pages FOR SELECT TO anon, authenticated USING (status = 'published');
CREATE POLICY "Admins can manage pages" ON pages FOR ALL USING (is_admin());

-- SECTIONS
ALTER TABLE sections ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can read sections of published pages" ON sections FOR SELECT TO anon, authenticated
  USING (EXISTS (SELECT 1 FROM pages WHERE pages.id = sections.page_id AND pages.status = 'published'));
CREATE POLICY "Admins can manage sections" ON sections FOR ALL USING (is_admin());

-- FIELDS
ALTER TABLE fields ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can read fields of published pages" ON fields FOR SELECT TO anon, authenticated
  USING (EXISTS (
    SELECT 1 FROM sections
    JOIN pages ON pages.id = sections.page_id
    WHERE sections.id = fields.section_id
    AND pages.status = 'published'
  ));
CREATE POLICY "Admins can manage fields" ON fields FOR ALL USING (is_admin());

-- MEDIA
ALTER TABLE media ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can read media" ON media FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admins can manage media" ON media FOR ALL USING (is_admin());

-- POSTS
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can read published posts" ON posts FOR SELECT TO anon, authenticated USING (status = 'published');
CREATE POLICY "Admins can manage posts" ON posts FOR ALL USING (is_admin());

-- REVISIONS
ALTER TABLE revisions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can read revisions" ON revisions FOR SELECT USING (is_admin());
CREATE POLICY "Admins can manage revisions" ON revisions FOR ALL USING (is_admin());

-- CONTACT SETTINGS
ALTER TABLE contact_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can read contact settings" ON contact_settings FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admins can manage contact settings" ON contact_settings FOR ALL USING (is_admin());

-- CONTACT SUBMISSIONS
ALTER TABLE contact_submissions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can insert submissions" ON contact_submissions FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Admins can read submissions" ON contact_submissions FOR SELECT USING (is_admin());
CREATE POLICY "Admins can manage submissions" ON contact_submissions FOR ALL USING (is_admin());

-- ============================================================
-- Updated_at trigger
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER sites_updated_at BEFORE UPDATE ON sites FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER pages_updated_at BEFORE UPDATE ON pages FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER posts_updated_at BEFORE UPDATE ON posts FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER contact_settings_updated_at BEFORE UPDATE ON contact_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at();
