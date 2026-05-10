-- Timeline updates (2026-05-09):
--   - Saturday lunch is now Sizzle & Crunch (Bellevue) instead of "pick a spot"
--   - Saturday dinner is now Chick-fil-A Alderwood instead of "pick a spot"
--   - Sunday breakfast is now Kona Kitchen Lynnwood
--   - Sunday afternoon: removed Topgolf, replaced with Pike Place + Seattle Waterfront
--     (split groups, group photo at Pier 62) and Din Tai Fung at Pacific Place for lunch
--
-- Run this after 006 to bring an existing seeded DB up to date.
-- These statements are idempotent — safe to re-run.

-- Saturday lunch
UPDATE public.stops SET
  title = 'Lunch — Sizzle & Crunch (Bellevue)',
  body  = 'Vietnamese fast-casual right by Meydenbauer — banh mi, vermicelli bowls, rice plates. ~5 min walk from the venue. Quick service that fits the lunch break.',
  addr  = '10438 NE 10th St, Bellevue, WA 98004',
  map   = 'https://maps.app.goo.gl/vEBRvnJ8wkT8PeFXA',
  places = '[]'::jsonb,
  updated_at = now()
WHERE id = 9;

-- Saturday dinner
UPDATE public.stops SET
  title = 'Group dinner — Chick-fil-A (Alderwood)',
  body  = 'Dinner together at Chick-fil-A — ~5 min from the hotel. Quick service so we can be back early; Latin Mass is early Sunday morning.',
  addr  = '3026 196th St SW, Lynnwood, WA 98036',
  map   = 'https://maps.app.goo.gl/h5tcqENQ6LM7pUkm9',
  places = '[]'::jsonb,
  updated_at = now()
WHERE id = 18;

-- Sunday: depart hotel → breakfast (was id 26 "Breakfast — Lynnwood area" 09:15)
UPDATE public.stops SET
  time = '09:15',
  title = 'Depart hotel → Kona Kitchen',
  body  = '~5 min, ~1.5 mi west on 196th St SW.',
  addr  = NULL,
  map   = NULL,
  places = '[]'::jsonb,
  updated_at = now()
WHERE id = 26;

-- Sunday breakfast (was id 27 "Depart → Gas Works Park" 10:00)
UPDATE public.stops SET
  time = '09:30',
  title = 'Breakfast — Kona Kitchen Lynnwood',
  body  = 'Hawaiian breakfast — loco moco, spam musubi, pancakes, fried rice. ~1 hour to eat together before heading into Seattle.',
  addr  = '3805 196th St SW, Lynnwood, WA 98036',
  map   = 'https://www.google.com/maps/search/?api=1&query=Kona+Kitchen+Lynnwood+3805+196th+St+SW',
  places = '[]'::jsonb,
  updated_at = now()
WHERE id = 27;

-- Sunday: depart → Gas Works (was id 28 "Gas Works Park" 10:30)
UPDATE public.stops SET
  time = '10:30',
  title = 'Depart → Gas Works Park',
  body  = '~25–30 min south on I-5. Sunday morning traffic is light.',
  addr  = NULL,
  map   = NULL,
  places = '[]'::jsonb,
  updated_at = now()
WHERE id = 28;

-- Sunday: Gas Works Park (was id 29 "Depart → St. James" 11:00)
UPDATE public.stops SET
  time = '11:00',
  title = 'Gas Works Park',
  body  = 'Iconic Seattle skyline views from the north shore of Lake Union. Walk around, take photos. ~30 min.',
  addr  = '2101 N Northlake Way, Seattle, WA 98103',
  map   = 'https://www.google.com/maps/search/?api=1&query=Gas+Works+Park+Seattle+WA',
  places = '[]'::jsonb,
  updated_at = now()
WHERE id = 29;

-- Sunday: depart → St. James (was id 30 "St. James Cathedral" 11:15)
UPDATE public.stops SET
  time = '11:30',
  title = 'Depart → St. James Cathedral',
  body  = '~10–15 min south via I-5. Downtown Seattle.',
  addr  = NULL,
  map   = NULL,
  places = '[]'::jsonb,
  updated_at = now()
WHERE id = 30;

-- Sunday: St. James Cathedral (was id 31 "Head to Pike Place" 11:45)
UPDATE public.stops SET
  time = '11:45',
  title = 'St. James Cathedral',
  body  = 'Visit, prayer, light candles. Mother church of the Archdiocese of Seattle. ~30 min.',
  addr  = '804 9th Ave, Seattle, WA 98104',
  map   = 'https://www.google.com/maps/search/?api=1&query=St.+James+Cathedral+Seattle',
  places = '[]'::jsonb,
  updated_at = now()
WHERE id = 31;

-- Sunday: depart → Pike Place Market PDA Garage (was id 32 "Pike Place Market & waterfront" 12:00)
UPDATE public.stops SET
  time = '12:15',
  title = 'Depart → Pike Place Market PDA Garage',
  body  = '~5–10 min west to 1531 Western Ave. Direct elevator up to MarketFront and the new Overlook Walk.',
  addr  = NULL,
  map   = NULL,
  places = '[]'::jsonb,
  updated_at = now()
WHERE id = 32;

-- Sunday: Pike Place Market & Seattle Waterfront — split groups (was id 33 "Head to Topgolf Renton" 13:00)
UPDATE public.stops SET
  time = '12:30',
  title = 'Pike Place Market & Seattle Waterfront',
  body  = E'Park at the Pike Place Market PDA Garage — safe, well-lit, with elevators straight up to MarketFront and the new Overlook Walk down to the waterfront. Walk Pike Place itself, then take the Overlook Walk down. We split into smaller groups: Alex & Edgar group · Gaby group · adults. Anyone who wants to check out Miner\'s Landing on Pier 57 (the Great Wheel and arcades) can — just stay with your group and stay in touch. ~2h 15m of free exploring.',
  addr  = '1531 Western Ave, Seattle, WA 98101 (Pike Place Market PDA Garage)',
  map   = 'https://www.google.com/maps/search/?api=1&query=Pike+Place+Market+PDA+Garage+1531+Western+Ave',
  places = '[]'::jsonb,
  updated_at = now()
WHERE id = 33;

-- Sunday: group photo at the waterfront (was id 34 "Topgolf Renton" 13:30)
UPDATE public.stops SET
  time = '14:45',
  title = 'Group photo — Seattle waterfront',
  body  = 'All three groups meet up at Pier 62 / the Overlook Walk plaza for a group photo before we head to lunch.',
  addr  = NULL,
  map   = NULL,
  places = '[]'::jsonb,
  updated_at = now()
WHERE id = 34;

-- Sunday: late lunch — Din Tai Fung Pacific Place (was id 35 "Lunch — Renton area" 15:00)
UPDATE public.stops SET
  time = '15:00',
  title = 'Late lunch — Din Tai Fung (Pacific Place)',
  body  = 'Famous Taiwanese soup dumplings. ~5 min drive from the Pike Place garage to the Pacific Place Garage — direct elevator up to Din Tai Fung on level 4. Easy parking, easy departure for the drive home.',
  addr  = '600 Pine St #403, Seattle, WA 98101',
  map   = 'https://maps.app.goo.gl/FNhqBYUW2U8sxFwH8',
  places = '[]'::jsonb,
  updated_at = now()
WHERE id = 35;

-- Sunday: depart for Yakima (was id 36 "Depart for Yakima" 16:00)
UPDATE public.stops SET
  time = '16:15',
  title = 'Depart for Yakima',
  body  = 'I-5 S → I-90 E → I-82 E → US-12 E. ~2h 30m from downtown Seattle.',
  addr  = NULL,
  map   = NULL,
  places = '[]'::jsonb,
  updated_at = now()
WHERE id = 36;

-- id 37 (Arrive home — Deo gratias, 18:45) is unchanged.
