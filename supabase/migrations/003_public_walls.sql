-- ============================================
-- Public walls: RSVP + Shared Prayer Intentions
-- Readable and writable by anyone (anon key)
-- ============================================

-- RSVP "I'm going" wall
create table rsvp_wall (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 32),
  saint_icon text not null,
  created_at timestamptz default now()
);

alter table rsvp_wall enable row level security;
create policy "Anyone can read rsvp" on rsvp_wall for select using (true);
create policy "Anyone can insert rsvp" on rsvp_wall for insert with check (true);

-- Shared prayer intentions wall (plaintext, visible to everyone)
create table shared_intentions (
  id uuid primary key default gen_random_uuid(),
  intention text not null check (char_length(intention) between 1 and 240),
  created_at timestamptz default now()
);

alter table shared_intentions enable row level security;
create policy "Anyone can read intentions" on shared_intentions for select using (true);
create policy "Anyone can insert intentions" on shared_intentions for insert with check (true);
