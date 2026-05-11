-- Carpool + rooms update (2026-05-11):
--   - Replace 2-vehicle layout (Vehicle 1 "First vehicle" + Vehicle 2
--     "Saturday night pickup") with the finalized 3-car Saturday roster.
--   - Rename "Deacon Alex" -> "Deacon Enrique" and use full last name
--     "Galeana" for the deacon and his wife Patricia everywhere they
--     appear in carpool/rooms data.
--   - Rebuild hotel room rosters to match the new attendee list (drop
--     Sophia, Rubi, Diego, Alex, Edgar; add Lucas, Luisa, Ruben, Mary,
--     Lydia, Sofi).
--
-- This migration deletes the prior carpool_vehicles + hotel_rooms rows
-- and re-seeds them. Run after 006/007/008/009.

BEGIN;

-- Wipe carpool roster
DELETE FROM public.carpool_riders;
DELETE FROM public.carpool_vehicles;

-- Car 1 — Saturday morning, Deacon Enrique Galeana driving
WITH v AS (
  INSERT INTO public.carpool_vehicles (label, driver, co_driver, notes, sort_order)
  VALUES ('Car 1', 'Deacon Enrique Galeana', '',
          'Leaves St. Juan Diego (Cowiche) Saturday morning. Minors on board.', 1)
  RETURNING id
)
INSERT INTO public.carpool_riders (vehicle_id, name, sort_order)
SELECT v.id, r.name, r.ord
FROM v, (VALUES
  ('Lucas', 1), ('Kevin', 2), ('Sebastian', 3), ('Kaiser', 4),
  ('Luisa', 5), ('Ruben', 6)
) AS r(name, ord);

-- Car 2 — Saturday morning, Patricia Galeana driving
WITH v AS (
  INSERT INTO public.carpool_vehicles (label, driver, co_driver, notes, sort_order)
  VALUES ('Car 2', 'Patricia Galeana', '',
          'Leaves St. Juan Diego (Cowiche) Saturday morning. Minors on board.', 2)
  RETURNING id
)
INSERT INTO public.carpool_riders (vehicle_id, name, sort_order)
SELECT v.id, r.name, r.ord
FROM v, (VALUES
  ('Diana', 1), ('Sofi', 2), ('Lupita', 3), ('Meli', 4),
  ('Angie', 5), ('Gali', 6)
) AS r(name, ord);

-- Car 3 — Saturday morning, Shayla driving (all 18+)
WITH v AS (
  INSERT INTO public.carpool_vehicles (label, driver, co_driver, notes, sort_order)
  VALUES ('Car 3', 'Shayla', '',
          'Leaves St. Juan Diego (Cowiche) Saturday morning. All passengers are 18+.', 3)
  RETURNING id
)
INSERT INTO public.carpool_riders (vehicle_id, name, sort_order)
SELECT v.id, r.name, r.ord
FROM v, (VALUES
  ('Mary', 1), ('Lydia', 2), ('Gaby', 3), ('Kole', 4)
) AS r(name, ord);

-- Wipe and rebuild hotel rooms to match new roster
DELETE FROM public.hotel_room_occupants;
DELETE FROM public.hotel_rooms;

-- Room 1: Deacon & wife
WITH r AS (
  INSERT INTO public.hotel_rooms (label, notes, sort_order)
  VALUES ('Room 1 · Deacon & wife', 'Married couple (exception to co-ed rule).', 1)
  RETURNING id
)
INSERT INTO public.hotel_room_occupants (room_id, name, sort_order)
SELECT r.id, o.name, o.ord
FROM r, (VALUES ('Deacon Enrique', 1), ('Patricia Galeana', 2)) AS o(name, ord);

-- Room 2: Women (18+)
WITH r AS (
  INSERT INTO public.hotel_rooms (label, notes, sort_order)
  VALUES ('Room 2 · Women (18+)', NULL, 2)
  RETURNING id
)
INSERT INTO public.hotel_room_occupants (room_id, name, sort_order)
SELECT r.id, o.name, o.ord
FROM r, (VALUES ('Mary', 1), ('Lydia', 2), ('Gaby', 3), ('Shayla', 4)) AS o(name, ord);

-- Room 3: Women (minors)
WITH r AS (
  INSERT INTO public.hotel_rooms (label, notes, sort_order)
  VALUES ('Room 3 · Women (minors)', NULL, 3)
  RETURNING id
)
INSERT INTO public.hotel_room_occupants (room_id, name, sort_order)
SELECT r.id, o.name, o.ord
FROM r, (VALUES ('Diana', 1), ('Sofi', 2), ('Lupita', 3), ('Meli', 4)) AS o(name, ord);

-- Room 4: Women (minors, second room)
WITH r AS (
  INSERT INTO public.hotel_rooms (label, notes, sort_order)
  VALUES ('Room 4 · Women (minors)', NULL, 4)
  RETURNING id
)
INSERT INTO public.hotel_room_occupants (room_id, name, sort_order)
SELECT r.id, o.name, o.ord
FROM r, (VALUES ('Angie', 1), ('Gali', 2), ('Luisa', 3)) AS o(name, ord);

-- Room 5: Men (Kole 18+ plus minors)
WITH r AS (
  INSERT INTO public.hotel_rooms (label, notes, sort_order)
  VALUES ('Room 5 · Men', 'Kole (18+) plus minors.', 5)
  RETURNING id
)
INSERT INTO public.hotel_room_occupants (room_id, name, sort_order)
SELECT r.id, o.name, o.ord
FROM r, (VALUES ('Kole', 1), ('Lucas', 2), ('Kevin', 3), ('Sebastian', 4), ('Kaiser', 5), ('Ruben', 6)) AS o(name, ord);

COMMIT;
