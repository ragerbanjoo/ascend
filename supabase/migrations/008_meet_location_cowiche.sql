-- Meet location moved (2026-05-09):
--   The group now meets at St. Juan Diego Catholic Church in Cowiche, WA
--   (15800 Summitview Rd, Cowiche, WA 98923) instead of "Tieton (TBA)".
--
-- Run this after 006/007 to bring an existing seeded DB up to date.
-- Idempotent — safe to re-run.

UPDATE public.stops SET
  title = 'Meet at St. Juan Diego — Cowiche',
  body  = 'Meet at our home parish. Morning prayer, roll call, load vehicles, final restroom break before the road. Please arrive on time — we leave together.',
  addr  = '15800 Summitview Rd, Cowiche, WA 98923',
  map   = 'https://www.google.com/maps/search/?api=1&query=St.+Juan+Diego+Catholic+Church+15800+Summitview+Rd+Cowiche+WA',
  bring = 'Everything you packed. Coffee optional but recommended.',
  updated_at = now()
WHERE id = 1;

UPDATE public.stops SET
  title = 'Depart Cowiche',
  body  = 'Route: Summitview Rd → I-82 W → I-90 W → I-405 N → Meydenbauer Center. ~145 miles, ~2h 30m clean drive time.',
  updated_at = now()
WHERE id = 2;
