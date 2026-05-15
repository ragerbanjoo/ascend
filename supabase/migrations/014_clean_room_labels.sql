-- ============================================
-- Strip "(18+)" / "(minors)" / "Kole (18+) plus minors." wording from
-- the hotel-rooms data. Everyone in the trip is either an adult or a
-- minor — labeling rooms by age category was unnecessary detail.
-- ============================================

update public.hotel_rooms set label = 'Room 2 · Women' where label = 'Room 2 · Women (18+)';
update public.hotel_rooms set label = 'Room 3 · Women' where label = 'Room 3 · Women (minors)';
update public.hotel_rooms set label = 'Room 4 · Women' where label = 'Room 4 · Women (minors)';
update public.hotel_rooms set notes = null where label = 'Room 5 · Men' and notes = 'Kole (18+) plus minors.';
