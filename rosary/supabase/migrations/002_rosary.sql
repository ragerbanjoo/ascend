-- Rosary settings table (admin-editable)
CREATE TABLE IF NOT EXISTS rosary_settings (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fatima_default      BOOLEAN NOT NULL DEFAULT true,
  show_concluding     BOOLEAN NOT NULL DEFAULT true,
  quiet_mode_default  BOOLEAN NOT NULL DEFAULT false,
  sunday_note  JSONB NOT NULL DEFAULT '{"en":"On Sundays we pray the Glorious Mysteries.","es":"Los domingos rezamos los Misterios Gloriosos."}',
  intro_text   JSONB NOT NULL DEFAULT '{"en":"","es":""}',
  learn_content JSONB NOT NULL DEFAULT '{"en":"","es":""}',
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- RLS
ALTER TABLE rosary_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read rosary_settings"
  ON rosary_settings FOR SELECT USING (true);

CREATE POLICY "Admins can update rosary_settings"
  ON rosary_settings FOR UPDATE USING (is_admin());

CREATE POLICY "Admins can insert rosary_settings"
  ON rosary_settings FOR INSERT WITH CHECK (is_admin());

-- Trigger
CREATE TRIGGER set_rosary_settings_updated_at
  BEFORE UPDATE ON rosary_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Seed default row
INSERT INTO rosary_settings (
  fatima_default, show_concluding, quiet_mode_default,
  sunday_note, intro_text, learn_content
) VALUES (
  true, true, false,
  '{"en":"On Sundays we pray the Glorious Mysteries.","es":"Los domingos rezamos los Misterios Gloriosos."}'::jsonb,
  '{"en":"","es":""}'::jsonb,
  '{"en":"","es":""}'::jsonb
);
