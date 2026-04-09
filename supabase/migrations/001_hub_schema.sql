-- ============================================
-- SJD YAG x ASCEND Pilgrim Hub Schema
-- Includes client-side encryption fields
-- ============================================

-- profiles: extends auth.users, stores wrapped encryption key
create table profiles (
  id uuid primary key references auth.users on delete cascade,
  username text unique not null,
  display_name text,
  saint_icon text,
  is_admin boolean default false,
  last_seen_at timestamptz default now(),
  created_at timestamptz default now(),
  -- encryption metadata
  salt text,                    -- base64 PBKDF2 salt for password
  cek_password_wrapped text,    -- CEK encrypted with password-derived key
  cek_password_iv text,         -- IV for password wrap
  cek_phrase_wrapped text,      -- CEK encrypted with recovery-phrase-derived key
  cek_phrase_iv text,           -- IV for phrase wrap
  phrase_salt text              -- base64 salt for phrase derivation
);
create index on profiles(username);

-- sharing_preferences
create table sharing_preferences (
  user_id uuid primary key references auth.users on delete cascade,
  share_profile boolean default false,
  share_packing_progress boolean default false,
  share_photos boolean default false,
  updated_at timestamptz default now()
);

-- packing_items (plaintext)
create table packing_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users on delete cascade,
  item_key text not null,
  checked boolean default false,
  updated_at timestamptz default now(),
  unique(user_id, item_key)
);

-- journal_entries (ENCRYPTED)
create table journal_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users on delete cascade,
  title_ciphertext text,
  title_iv text,
  body_ciphertext text,
  body_iv text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- talk_notes (plaintext)
create table talk_notes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users on delete cascade,
  speaker text,
  talk_title text,
  notes text,
  created_at timestamptz default now()
);

-- prayer_log (plaintext)
create table prayer_log (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users on delete cascade,
  prayer_type text,
  detail text,
  prayed_at timestamptz default now()
);

-- private_intentions (ENCRYPTED)
create table private_intentions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users on delete cascade,
  text_ciphertext text not null,
  text_iv text not null,
  answered boolean default false,
  created_at timestamptz default now()
);

-- photos
create table photos (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users on delete cascade,
  storage_path text not null,
  caption text,
  visibility text not null check (visibility in ('private', 'group')),
  created_at timestamptz default now()
);
create index on photos(user_id);
create index on photos(visibility);

-- failed_logins
create table failed_logins (
  id uuid primary key default gen_random_uuid(),
  username text not null,
  attempted_at timestamptz default now(),
  ip_hash text
);
create index on failed_logins(username, attempted_at);

-- scheduled_deletions (soft delete with 7-day grace)
create table scheduled_deletions (
  user_id uuid primary key references auth.users on delete cascade,
  scheduled_for timestamptz not null,
  requested_at timestamptz default now()
);

-- admin_access_log (audit trail)
create table admin_access_log (
  id uuid primary key default gen_random_uuid(),
  admin_user_id uuid references auth.users,
  admin_username text,
  action text not null,
  target_user_id uuid,
  target_username text,
  details text,
  created_at timestamptz default now()
);
create index on admin_access_log(target_user_id);
create index on admin_access_log(created_at);

-- ============================================
-- Row Level Security
-- ============================================

alter table profiles enable row level security;
alter table sharing_preferences enable row level security;
alter table packing_items enable row level security;
alter table journal_entries enable row level security;
alter table talk_notes enable row level security;
alter table prayer_log enable row level security;
alter table private_intentions enable row level security;
alter table photos enable row level security;
alter table failed_logins enable row level security;
alter table scheduled_deletions enable row level security;
alter table admin_access_log enable row level security;

-- profiles
create policy "Own profile" on profiles for select using (auth.uid() = id);
create policy "Shared profiles visible" on profiles for select
  using (
    exists (select 1 from sharing_preferences where user_id = profiles.id and share_profile = true)
    and auth.role() = 'authenticated'
  );
create policy "Admins see all profiles" on profiles for select
  using (exists (select 1 from profiles p where p.id = auth.uid() and p.is_admin = true));
create policy "Own profile update" on profiles for update using (auth.uid() = id);
create policy "Own profile insert" on profiles for insert with check (auth.uid() = id);
create policy "Admin delete profiles" on profiles for delete
  using (exists (select 1 from profiles p where p.id = auth.uid() and p.is_admin = true));

create policy "Own sharing prefs" on sharing_preferences for all using (auth.uid() = user_id);

create policy "Own packing" on packing_items for all using (auth.uid() = user_id);
create policy "Shared packing visible" on packing_items for select
  using (
    exists (select 1 from sharing_preferences where user_id = packing_items.user_id and share_packing_progress = true)
    and auth.role() = 'authenticated'
  );

create policy "Own journal only" on journal_entries for all using (auth.uid() = user_id);
create policy "Own talk notes" on talk_notes for all using (auth.uid() = user_id);
create policy "Own prayer log" on prayer_log for all using (auth.uid() = user_id);
create policy "Own intentions" on private_intentions for all using (auth.uid() = user_id);

create policy "Own photos" on photos for all using (auth.uid() = user_id);
create policy "Group photos visible" on photos for select
  using (visibility = 'group' and auth.role() = 'authenticated');
create policy "Shared individual photos" on photos for select
  using (
    visibility = 'private'
    and exists (select 1 from sharing_preferences where user_id = photos.user_id and share_photos = true)
    and auth.role() = 'authenticated'
  );

create policy "Admin reads failed logins" on failed_logins for select
  using (exists (select 1 from profiles p where p.id = auth.uid() and p.is_admin = true));
create policy "Insert failed logins" on failed_logins for insert with check (true);

create policy "Own deletion" on scheduled_deletions for all using (auth.uid() = user_id);
create policy "Admin sees deletions" on scheduled_deletions for select
  using (exists (select 1 from profiles p where p.id = auth.uid() and p.is_admin = true));

create policy "Admin writes log" on admin_access_log for insert
  with check (exists (select 1 from profiles p where p.id = auth.uid() and p.is_admin = true));
create policy "User reads own audit log" on admin_access_log for select using (auth.uid() = target_user_id);
create policy "Admin reads all logs" on admin_access_log for select
  using (exists (select 1 from profiles p where p.id = auth.uid() and p.is_admin = true));

-- ============================================
-- Storage bucket for photos
-- ============================================

insert into storage.buckets (id, name, public) values ('photos', 'photos', false);

create policy "Users upload own photos" on storage.objects for insert
  with check (bucket_id = 'photos' and auth.uid()::text = (storage.foldername(name))[1]);
create policy "Users read own photos" on storage.objects for select
  using (bucket_id = 'photos' and auth.uid()::text = (storage.foldername(name))[1]);
create policy "Authenticated read group photos" on storage.objects for select
  using (
    bucket_id = 'photos'
    and auth.role() = 'authenticated'
    and exists (select 1 from photos where storage_path = storage.objects.name and visibility = 'group')
  );
create policy "Users delete own photos" on storage.objects for delete
  using (bucket_id = 'photos' and auth.uid()::text = (storage.foldername(name))[1]);
