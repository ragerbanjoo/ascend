-- ============================================
-- Journal entries and private intentions: drop client-side encryption.
-- Privacy is now enforced solely by RLS (each user can only read their own).
-- Existing rows cannot be migrated because the values are AES-GCM ciphertext
-- packed as "iv:ciphertext" and unreadable without each user's password-
-- derived key — we WIPE them.
--
-- Idempotent: safe to run on any historical schema (the live prod schema
-- already had `title`/`body`/`text` columns even though 001 named them
-- `*_ciphertext`).
-- ============================================

-- 1. WIPE existing encrypted rows.
truncate table journal_entries;
truncate table private_intentions;

-- 2. journal_entries: drop legacy encryption columns if they exist, ensure
--    plain text columns exist.
alter table journal_entries drop column if exists title_ciphertext;
alter table journal_entries drop column if exists title_iv;
alter table journal_entries drop column if exists body_ciphertext;
alter table journal_entries drop column if exists body_iv;
alter table journal_entries drop column if exists speaker_ciphertext;
alter table journal_entries drop column if exists speaker_iv;
alter table journal_entries drop column if exists talk_title_ciphertext;
alter table journal_entries drop column if exists talk_title_iv;
alter table journal_entries add column if not exists title text;
alter table journal_entries add column if not exists body text;

-- 3. private_intentions: drop legacy encryption columns, ensure plain `text`.
alter table private_intentions drop column if exists text_ciphertext;
alter table private_intentions drop column if exists text_iv;
alter table private_intentions add column if not exists text text;

-- 4. profiles: drop the wrapped-key / recovery-phrase columns.
alter table profiles drop column if exists salt;
alter table profiles drop column if exists cek_password_wrapped;
alter table profiles drop column if exists cek_password_iv;
alter table profiles drop column if exists cek_phrase_wrapped;
alter table profiles drop column if exists cek_phrase_iv;
alter table profiles drop column if exists phrase_salt;

-- RLS policies on journal_entries / private_intentions are unchanged —
-- "Own journal only" and "Own intentions" already restrict access to the
-- owning user, which is the only privacy guarantee we now rely on.
