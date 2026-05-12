-- Deacon's full name update (2026-05-11):
--   Car 1 driver "Deacon Enrique Galeana" → "Deacon Enrique Alejandro Galeana"
--   in the live carpool table. Run after 010.
-- Idempotent.

UPDATE public.carpool_vehicles
SET driver = 'Deacon Enrique Alejandro Galeana',
    updated_at = now()
WHERE driver = 'Deacon Enrique Galeana';
