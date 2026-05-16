-- ============================================
-- Sunday itinerary v3: hotel block (split breakfast / chill), shorter
-- Pike Place, Bellevue Square afternoon, later arrival home.
-- ============================================

-- 23 — group photo outside church (slight retitle)
update public.stops set
  title = 'Group photo outside church',
  body  = 'Mass ends around 8:00. Quick photo on the steps before we head back to the hotel together.',
  time  = '08:15'
where id = 23;

-- 24 — back to hotel
update public.stops set
  title = 'Head back to La Quinta',
  body  = '~15 min back to the hotel together.',
  time  = '08:30'
where id = 24;

-- 25 — Hotel block (replaces "Hotel checkout")
update public.stops set
  title = 'Hotel block — breakfast or chill',
  body  = 'Two options, your call: come grab breakfast at Kona Kitchen with the group, or stay at the hotel to rest, pack, and chill until checkout. Either way we regroup at the hotel by 10:30 to load up and head out together.',
  addr  = '4300 Alderwood Mall Blvd, Lynnwood, WA 98036',
  map   = 'https://www.google.com/maps/search/?api=1&query=La+Quinta+Inn+Lynnwood+4300+Alderwood+Mall+Blvd',
  time  = '08:45'
where id = 25;

-- 26 — Kona (now optional, slightly earlier)
update public.stops set
  title = 'Breakfast — Kona Kitchen Lynnwood (optional)',
  body  = 'Hawaiian breakfast — loco moco, spam musubi, pancakes, fried rice. ~5 min from the hotel. The group still covers it for anyone who comes. Back to the hotel by 10:15 to regroup.',
  time  = '09:00'
where id = 26;

-- 27 — was "Breakfast Kona Kitchen" — repurpose as "Checkout & regroup"
update public.stops set
  title = 'Checkout & regroup',
  body  = 'Everyone meets back at the hotel. Final checkout, load the vehicles, head out together.',
  addr  = null, map = null,
  time  = '10:30'
where id = 27;

-- 28 — depart for Gas Works
update public.stops set
  title = 'Depart → Gas Works Park',
  body  = '~25–30 min south on I-5. Sunday morning traffic is light.',
  time  = '10:45'
where id = 28;

-- 29 — Gas Works (tighter)
update public.stops set
  body  = 'Iconic Seattle skyline views from the north shore of Lake Union. Walk around, take photos. ~20 min.',
  time  = '11:15'
where id = 29;

-- 30 — depart for St. James
update public.stops set time = '11:35' where id = 30;

-- 31 — St. James
update public.stops set
  body  = 'Visit, prayer, light candles. Mother church of the Archdiocese of Seattle. ~30 min.',
  time  = '11:50'
where id = 31;

-- 32 — depart for Pike Place
update public.stops set time = '12:20' where id = 32;

-- 33 — Pike Place (shorter, food + walk)
update public.stops set
  title = 'Pike Place — food + a walk',
  body  = 'Short visit — just enough time to grab lunch at Pike Place and take a quick walk through the Market and the Overlook Walk. Your small group picks where to eat near Pike Place; lunch is on you. Plan to be back at the garage by 1:50 so we can head over to Bellevue.',
  time  = '12:35'
where id = 33;

-- 34 — depart for Bellevue Square (replaces Pier 62 group photo)
update public.stops set
  title = 'Depart → Bellevue Square',
  body  = '~25 min east across I-90 to Bellevue.',
  addr  = null, map = null,
  time  = '14:00'
where id = 34;

-- 35 — Bellevue Square own time (replaces walk back to garage)
update public.stops set
  title = 'Bellevue Square — own time in small groups',
  body  = 'Hang out, shop, grab coffee — small groups do their own thing around Bellevue Square and the surrounding area. ~2 hours. Meet back at the cars by 4:30 sharp to head home.',
  addr  = '575 Bellevue Square, Bellevue, WA 98004',
  map   = 'https://www.google.com/maps/search/?api=1&query=Bellevue+Square+Bellevue+WA',
  time  = '14:30'
where id = 35;

-- 36 — depart for Cowiche
update public.stops set
  body  = 'I-90 E → I-82 E → Summitview Rd. ~2h 30m to St. Juan Diego.',
  time  = '16:30'
where id = 36;

-- 37 — arrive home (15 min later)
update public.stops set time = '19:00' where id = 37;
