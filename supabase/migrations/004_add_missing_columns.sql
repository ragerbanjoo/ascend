-- Run this in your Supabase SQL Editor to add missing columns
-- that the app code expects but don't exist yet.

-- Photos: add encryption and file metadata columns
ALTER TABLE photos ADD COLUMN IF NOT EXISTS encrypted boolean DEFAULT false;
ALTER TABLE photos ADD COLUMN IF NOT EXISTS iv text;
ALTER TABLE photos ADD COLUMN IF NOT EXISTS original_name text;
ALTER TABLE photos ADD COLUMN IF NOT EXISTS mime_type text;
ALTER TABLE photos ADD COLUMN IF NOT EXISTS file_size bigint;
ALTER TABLE photos ADD COLUMN IF NOT EXISTS shared_from uuid;

-- Journal: ensure encrypted columns exist (from migration 001)
-- These should already exist if 001 was applied, but just in case:
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='journal_entries' AND column_name='title_ciphertext') THEN
    ALTER TABLE journal_entries ADD COLUMN title_ciphertext text;
    ALTER TABLE journal_entries ADD COLUMN title_iv text;
    ALTER TABLE journal_entries ADD COLUMN body_ciphertext text;
    ALTER TABLE journal_entries ADD COLUMN body_iv text;
  END IF;
END $$;

-- Journal: add rich fields from migration 002
ALTER TABLE journal_entries ADD COLUMN IF NOT EXISTS entry_type text NOT NULL DEFAULT 'journal';
ALTER TABLE journal_entries ADD COLUMN IF NOT EXISTS speaker_ciphertext text;
ALTER TABLE journal_entries ADD COLUMN IF NOT EXISTS speaker_iv text;
ALTER TABLE journal_entries ADD COLUMN IF NOT EXISTS talk_title_ciphertext text;
ALTER TABLE journal_entries ADD COLUMN IF NOT EXISTS talk_title_iv text;
ALTER TABLE journal_entries ADD COLUMN IF NOT EXISTS sort_order integer DEFAULT 0;

-- Private intentions: ensure encrypted columns exist
ALTER TABLE private_intentions ADD COLUMN IF NOT EXISTS text_ciphertext text;
ALTER TABLE private_intentions ADD COLUMN IF NOT EXISTS text_iv text;
