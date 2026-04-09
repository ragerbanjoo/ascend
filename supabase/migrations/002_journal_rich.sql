-- Add rich journal fields: entry type (journal vs talk_note), encrypted speaker/talk metadata
ALTER TABLE journal_entries ADD COLUMN entry_type text NOT NULL DEFAULT 'journal';
ALTER TABLE journal_entries ADD COLUMN speaker_ciphertext text;
ALTER TABLE journal_entries ADD COLUMN speaker_iv text;
ALTER TABLE journal_entries ADD COLUMN talk_title_ciphertext text;
ALTER TABLE journal_entries ADD COLUMN talk_title_iv text;
ALTER TABLE journal_entries ADD COLUMN sort_order integer DEFAULT 0;
