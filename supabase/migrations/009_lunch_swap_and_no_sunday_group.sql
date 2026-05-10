-- Timeline updates (2026-05-09):
--   - Saturday lunch: add Din Tai Fung Bellevue as an opt-in alternative
--     (across the street). Group only covers Sizzle & Crunch.
--   - Sunday: drop the second-Yakima-group references — there is no
--     separate Sunday-arriving group anymore. Mass copy + fellowship
--     copy reworded.
--   - Sunday afternoon: drop the Din Tai Fung Pacific Place lunch stop.
--     Lunch is now folded into the Pike Place + waterfront block (small
--     groups eat where they want, on their own dime). Stop 35 becomes
--     "walk back to garage", group photo moves to 15:45.
--   - Stop 36 retitled "Depart for Cowiche" (was "Depart for Yakima")
--     to match the new home parish drop-off.
--
-- Run this after 006/007/008. Idempotent.

UPDATE public.stops SET
  body  = E'Vietnamese fast-casual right by Meydenbauer — banh mi, vermicelli bowls, rice plates. ~5 min walk from the venue. Quick service that fits the lunch break. Anyone who would rather splurge on Din Tai Fung at Lincoln Square (700 Bellevue Way NE, right across the street) can do that instead — but Din Tai Fung is on you, not the group; the group is only covering Sizzle & Crunch.',
  updated_at = now()
WHERE id = 9;

UPDATE public.stops SET
  body  = 'The 7:00 AM Low Mass at North American Martyrs, served by the FSSP. Please arrive by 6:40 to get booklets and find seats.',
  updated_at = now()
WHERE id = 22;

UPDATE public.stops SET
  body  = 'Mass ends around 8:00. Group photo on the steps before we head back to the hotel.',
  updated_at = now()
WHERE id = 23;

UPDATE public.stops SET
  title = 'Pike Place Market & Seattle Waterfront (with lunch on your own)',
  body  = E'Park at the Pike Place Market PDA Garage — safe, well-lit, with elevators straight up to MarketFront and the new Overlook Walk down to the waterfront. Walk Pike Place itself, then take the Overlook Walk down. We split into smaller groups: Alex & Edgar group · Gaby group · adults. Each small group picks where to eat lunch near Pike Place — your meal, your call (the group is not covering Sunday lunch). Anyone who wants to check out Miner\'s Landing on Pier 57 (Great Wheel and arcades) can; just stay with your group and stay in touch. ~3h 15m of free exploring + lunch.',
  updated_at = now()
WHERE id = 33;

UPDATE public.stops SET
  time  = '15:45',
  body  = 'All three groups meet up at Pier 62 / the Overlook Walk plaza for a group photo before we head home.',
  updated_at = now()
WHERE id = 34;

UPDATE public.stops SET
  time  = '16:00',
  title = 'Walk back to Pike Place garage',
  body  = 'Head back up the Overlook Walk to the MarketFront elevator and down to the Pike Place Market PDA Garage. Load up the vehicles.',
  addr  = NULL,
  map   = NULL,
  places = '[]'::jsonb,
  updated_at = now()
WHERE id = 35;

UPDATE public.stops SET
  title = 'Depart for Cowiche',
  body  = 'I-5 S → I-90 E → I-82 E → Summitview Rd. ~2h 30m from downtown Seattle to St. Juan Diego.',
  updated_at = now()
WHERE id = 36;
