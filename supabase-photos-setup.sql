-- ============================================================
-- ASCEND Photos Gallery — Supabase Setup
-- Run this in the Supabase SQL Editor (Database → SQL Editor)
-- ============================================================
--
-- ARCHITECTURE:
--   Private photos → encrypted client-side with user's CEK (AES-GCM)
--     before upload. Stored as encrypted blobs. Admin sees gibberish.
--   Group photos  → stored as plain images. Viewable by all users.
--
--   When a user "shares" a private photo, the client decrypts it
--   locally and re-uploads a plain copy to the public/ subfolder.
--   The encrypted original stays untouched in their private gallery.
--
-- STORAGE PATHS:
--   Private: {user_id}/{uuid}.enc       (encrypted blob)
--   Group:   {user_id}/public/{uuid}.ext (plain image)
--
-- ============================================================

-- 1. Create the photos table
-- ============================================================
create table if not exists public.photos (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references auth.users(id) on delete cascade,
  storage_path  text not null,
  caption       text default '',
  caption_iv    text,              -- IV for encrypted caption (null = plaintext)
  visibility    text not null default 'private'
                  check (visibility in ('private', 'group')),
  encrypted     boolean not null default true,
  iv            text,              -- AES-GCM IV for the encrypted file (null if not encrypted)
  original_name text,              -- original filename (for display)
  mime_type     text,              -- e.g. image/jpeg, image/png
  file_size     integer,           -- bytes, for quota/display
  shared_from   uuid references public.photos(id) on delete set null,
                                   -- links a group copy back to its encrypted original
  created_at    timestamptz not null default now()
);

-- Indexes
create index if not exists idx_photos_user_id    on public.photos(user_id);
create index if not exists idx_photos_visibility on public.photos(visibility);
create index if not exists idx_photos_created_at on public.photos(created_at desc);

-- 2. Enable RLS
-- ============================================================
alter table public.photos enable row level security;

-- Users can read their own photos (private + group)
create policy "Users can read own photos"
  on public.photos for select
  using (user_id = auth.uid());

-- Users can read group-visible photos from anyone
create policy "Users can read group photos"
  on public.photos for select
  using (visibility = 'group');

-- Users can insert their own photos
create policy "Users can upload photos"
  on public.photos for insert
  with check (user_id = auth.uid());

-- Users can update their own photos (caption, visibility)
create policy "Users can update own photos"
  on public.photos for update
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- Users can delete their own photos
create policy "Users can delete own photos"
  on public.photos for delete
  using (user_id = auth.uid());

-- 3. Create the photos storage bucket
-- ============================================================
-- Public bucket = anyone can READ files by URL.
-- Write/delete restricted by storage policies below.
insert into storage.buckets (id, name, public, file_size_limit)
values ('photos', 'photos', true, 10485760)   -- 10 MB max per file
on conflict (id) do nothing;

-- 4. Storage RLS policies
-- ============================================================

-- Anyone can view files (public bucket for serving images)
-- NOTE: Private photos are encrypted blobs — even though the URL
-- is technically accessible, the file contents are AES-GCM ciphertext.
-- Without the user's CEK, it's random bytes.
create policy "Public read access on photos bucket"
  on storage.objects for select
  using (bucket_id = 'photos');

-- Authenticated users can upload to their own folder
create policy "Users can upload to own folder"
  on storage.objects for insert
  with check (
    bucket_id = 'photos'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

-- Users can update (overwrite) their own files
create policy "Users can update own files"
  on storage.objects for update
  using (
    bucket_id = 'photos'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

-- Users can delete their own uploads
create policy "Users can delete own uploads"
  on storage.objects for delete
  using (
    bucket_id = 'photos'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

-- ============================================================
-- DONE!
--
-- After running this SQL, verify:
--   1. Table Editor → "photos" table exists with all columns
--   2. Storage → "photos" bucket exists (public, 10MB limit)
--   3. Authentication → Policies tab shows 5 table + 4 storage policies
--
-- HOW IT WORKS:
--
--   Upload (private):
--     1. Client encrypts file bytes with user's CEK (AES-GCM)
--     2. Client encrypts caption with CEK
--     3. Encrypted blob uploaded to: {user_id}/{uuid}.enc
--     4. Row inserted: encrypted=true, iv=<file IV>, caption_iv=<caption IV>
--
--   Share to group:
--     1. Client fetches encrypted blob from storage
--     2. Client decrypts with CEK
--     3. Plain image uploaded to: {user_id}/public/{uuid}.{ext}
--     4. New row inserted: encrypted=false, visibility='group',
--        shared_from=<original photo id>
--
--   Delete:
--     - Deleting a private photo also deletes its group copy (if any)
--     - Deleting a group copy only removes the public version
--
--   Admin perspective:
--     - Private files in storage: encrypted binary, useless without CEK
--     - Private captions in DB: encrypted base64, useless without CEK
--     - Group files: plain images (user explicitly chose to share)
--     - Group captions: plain text (user explicitly chose to share)
--
-- ============================================================
