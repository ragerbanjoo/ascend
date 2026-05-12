-- =====================================================================
-- ASCEND 2026 — Carpool & Hotel Room Assignments
-- =====================================================================
-- Run this once in the Supabase SQL editor. It creates 4 tables
-- (carpool_vehicles, carpool_riders, hotel_rooms, hotel_room_occupants),
-- wires up public-read / admin-write RLS, and seeds the confirmed
-- attendees. Re-running is idempotent (uses IF NOT EXISTS / truncate
-- before re-seed).
-- =====================================================================

-- ---------- Tables ----------
create table if not exists public.carpool_vehicles (
  id           bigserial primary key,
  label        text not null,           -- e.g. "First vehicle", "Saturday night pickup"
  driver       text not null,           -- primary driver name
  co_driver    text,                    -- secondary driver or co-pilot (nullable)
  notes        text,                    -- e.g. "Departs Tieton Sat AM"
  sort_order   int not null default 0,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create table if not exists public.carpool_riders (
  id           bigserial primary key,
  vehicle_id   bigint not null references public.carpool_vehicles(id) on delete cascade,
  name         text not null,
  sort_order   int not null default 0,
  created_at   timestamptz not null default now()
);

create table if not exists public.hotel_rooms (
  id           bigserial primary key,
  label        text not null,           -- e.g. "Room 2 · Women"
  notes        text,                    -- e.g. "Deacon Enrique & wife Patricia Galeana — married couple"
  sort_order   int not null default 0,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create table if not exists public.hotel_room_occupants (
  id           bigserial primary key,
  room_id      bigint not null references public.hotel_rooms(id) on delete cascade,
  name         text not null,
  sort_order   int not null default 0,
  created_at   timestamptz not null default now()
);

create index if not exists carpool_riders_vehicle_idx on public.carpool_riders(vehicle_id);
create index if not exists hotel_room_occupants_room_idx on public.hotel_room_occupants(room_id);

-- ---------- RLS ----------
alter table public.carpool_vehicles     enable row level security;
alter table public.carpool_riders       enable row level security;
alter table public.hotel_rooms          enable row level security;
alter table public.hotel_room_occupants enable row level security;

-- Public read (anon + authenticated)
drop policy if exists "carpool_vehicles_read"     on public.carpool_vehicles;
drop policy if exists "carpool_riders_read"       on public.carpool_riders;
drop policy if exists "hotel_rooms_read"          on public.hotel_rooms;
drop policy if exists "hotel_room_occupants_read" on public.hotel_room_occupants;

create policy "carpool_vehicles_read"     on public.carpool_vehicles     for select using (true);
create policy "carpool_riders_read"       on public.carpool_riders       for select using (true);
create policy "hotel_rooms_read"          on public.hotel_rooms          for select using (true);
create policy "hotel_room_occupants_read" on public.hotel_room_occupants for select using (true);

-- Admin write (requires profiles.is_admin = true for the calling user)
drop policy if exists "carpool_vehicles_admin_write"     on public.carpool_vehicles;
drop policy if exists "carpool_riders_admin_write"       on public.carpool_riders;
drop policy if exists "hotel_rooms_admin_write"          on public.hotel_rooms;
drop policy if exists "hotel_room_occupants_admin_write" on public.hotel_room_occupants;

create policy "carpool_vehicles_admin_write" on public.carpool_vehicles
  for all using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin = true)
  ) with check (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin = true)
  );

create policy "carpool_riders_admin_write" on public.carpool_riders
  for all using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin = true)
  ) with check (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin = true)
  );

create policy "hotel_rooms_admin_write" on public.hotel_rooms
  for all using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin = true)
  ) with check (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin = true)
  );

create policy "hotel_room_occupants_admin_write" on public.hotel_room_occupants
  for all using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin = true)
  ) with check (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin = true)
  );

-- ---------- Seed (idempotent) ----------
truncate table public.carpool_riders       restart identity cascade;
truncate table public.carpool_vehicles     restart identity cascade;
truncate table public.hotel_room_occupants restart identity cascade;
truncate table public.hotel_rooms          restart identity cascade;

-- Car 1 — Saturday morning, Cowiche (St. Juan Diego) → Bellevue
with v as (
  insert into public.carpool_vehicles (label, driver, co_driver, notes, sort_order)
  values ('Car 1', 'Deacon Enrique Alejandro Galeana', '',
          'Leaves St. Juan Diego (Cowiche) Saturday morning. Minors on board.', 1)
  returning id
)
insert into public.carpool_riders (vehicle_id, name, sort_order)
select v.id, r.name, r.ord
from v, (values
  ('Lucas', 1), ('Kevin', 2), ('Sebastian', 3), ('Kaiser', 4),
  ('Luisa', 5), ('Ruben', 6)
) as r(name, ord);

-- Car 2 — Saturday morning, Cowiche → Bellevue
with v as (
  insert into public.carpool_vehicles (label, driver, co_driver, notes, sort_order)
  values ('Car 2', 'Patricia Galeana', '',
          'Leaves St. Juan Diego (Cowiche) Saturday morning. Minors on board.', 2)
  returning id
)
insert into public.carpool_riders (vehicle_id, name, sort_order)
select v.id, r.name, r.ord
from v, (values
  ('Diana', 1), ('Sofi', 2), ('Lupita', 3), ('Meli', 4),
  ('Angie', 5), ('Gali', 6)
) as r(name, ord);

-- Car 3 — Saturday morning, Cowiche → Bellevue (adults)
with v as (
  insert into public.carpool_vehicles (label, driver, co_driver, notes, sort_order)
  values ('Car 3', 'Shayla', '',
          'Leaves St. Juan Diego (Cowiche) Saturday morning. All passengers are 18+.', 3)
  returning id
)
insert into public.carpool_riders (vehicle_id, name, sort_order)
select v.id, r.name, r.ord
from v, (values
  ('Mary', 1), ('Lydia', 2), ('Gaby', 3), ('Kole', 4)
) as r(name, ord);

-- Rooms — 5 total, gender-separated (married-couple exception for room 1)
with r as (
  insert into public.hotel_rooms (label, notes, sort_order)
  values ('Room 1 · Deacon & wife',
          'Married couple (exception to co-ed rule).', 1)
  returning id
)
insert into public.hotel_room_occupants (room_id, name, sort_order)
select r.id, o.name, o.ord
from r, (values ('Deacon Enrique', 1), ('Patricia Galeana', 2)) as o(name, ord);

with r as (
  insert into public.hotel_rooms (label, notes, sort_order)
  values ('Room 2 · Women (18+)', null, 2)
  returning id
)
insert into public.hotel_room_occupants (room_id, name, sort_order)
select r.id, o.name, o.ord
from r, (values
  ('Mary', 1), ('Lydia', 2), ('Gaby', 3), ('Shayla', 4)
) as o(name, ord);

with r as (
  insert into public.hotel_rooms (label, notes, sort_order)
  values ('Room 3 · Women (minors)', null, 3)
  returning id
)
insert into public.hotel_room_occupants (room_id, name, sort_order)
select r.id, o.name, o.ord
from r, (values
  ('Diana', 1), ('Sofi', 2), ('Lupita', 3), ('Meli', 4)
) as o(name, ord);

with r as (
  insert into public.hotel_rooms (label, notes, sort_order)
  values ('Room 4 · Women (minors)', null, 4)
  returning id
)
insert into public.hotel_room_occupants (room_id, name, sort_order)
select r.id, o.name, o.ord
from r, (values ('Angie', 1), ('Gali', 2), ('Luisa', 3)) as o(name, ord);

with r as (
  insert into public.hotel_rooms (label, notes, sort_order)
  values ('Room 5 · Men',
          'Kole (18+) plus minors.', 5)
  returning id
)
insert into public.hotel_room_occupants (room_id, name, sort_order)
select r.id, o.name, o.ord
from r, (values ('Kole', 1), ('Lucas', 2), ('Kevin', 3), ('Sebastian', 4), ('Kaiser', 5), ('Ruben', 6)) as o(name, ord);
