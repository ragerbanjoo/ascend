-- Timeline stops table
-- Stores the schedule stops that power the timeline page.
-- Admins can edit via the admin panel; everyone can read.

CREATE TABLE public.stops (
  id          SERIAL PRIMARY KEY,
  day         TEXT NOT NULL CHECK (day IN ('sat', 'sun')),
  time        TEXT NOT NULL,
  title       TEXT NOT NULL,
  body        TEXT NOT NULL DEFAULT '',
  addr        TEXT,
  map         TEXT,
  bring       TEXT,
  places      JSONB DEFAULT '[]'::JSONB,
  sort_order  INTEGER NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_stops_day_sort ON public.stops(day, sort_order);

ALTER TABLE public.stops ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read stops" ON public.stops
  FOR SELECT USING (true);

CREATE POLICY "Admins can insert stops" ON public.stops
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
  );

CREATE POLICY "Admins can update stops" ON public.stops
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
  );

CREATE POLICY "Admins can delete stops" ON public.stops
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
  );

-- Seed data from hardcoded STOPS array
INSERT INTO public.stops (id, day, time, title, body, addr, map, bring, places, sort_order) VALUES
(1, 'sat', '03:45', 'Meet at St. Juan Diego — Cowiche', 'Meet at our home parish. Morning prayer, roll call, load vehicles, final restroom break before the road. Please arrive on time — we leave together.', '15800 Summitview Rd, Cowiche, WA 98923', 'https://www.google.com/maps/search/?api=1&query=St.+Juan+Diego+Catholic+Church+15800+Summitview+Rd+Cowiche+WA', 'Everything you packed. Coffee optional but recommended.', '[]', 1),
(2, 'sat', '04:00', 'Depart Cowiche', 'Route: Summitview Rd → I-82 W → I-90 W → I-405 N → Meydenbauer Center. ~145 miles, ~2h 30m clean drive time.', NULL, NULL, NULL, '[]', 2),
(3, 'sat', '05:00', 'Rest stop — Pilot Travel Center, Ellensburg', '15 minutes — restroom, gas, coffee, stretch, regroup the caravan before Snoqualmie Pass.', '1307 N Dolarway Rd, Ellensburg, WA 98926', 'https://www.google.com/maps/search/?api=1&query=Pilot+Travel+Center+1307+N+Dolarway+Rd+Ellensburg+WA', NULL, '[]', 3),
(4, 'sat', '06:30', 'Arrive Meydenbauer Center', 'Park in the underground garage. Walk in together, check in, find seats as a group near the front if possible.', '11100 NE 6th St, Bellevue, WA', 'https://www.google.com/maps/search/?api=1&query=Meydenbauer+Center+Bellevue+WA', NULL, '[]', 4),
(5, 'sat', '07:00', 'Eucharistic Adoration · Confession · Praise Music', 'Early arrival perk — two hours of Adoration, a confession window, and praise music before the main program begins.', NULL, NULL, NULL, '[]', 5),
(6, 'sat', '09:00', 'Welcome & Opening Remarks', 'Fr. Nicholas Wichert and Deacon Charlie Echeverry open ASCEND.', NULL, NULL, NULL, '[]', 6),
(7, 'sat', '09:15', 'Morning Plenary — Chris Stefanick', 'The first of two plenary talks from Chris Stefanick.', NULL, NULL, NULL, '[]', 7),
(8, 'sat', '10:45', 'Breakout Sessions', 'Recommended for our group: the Youth Breakout with Dr. Andrew & Sarah Swafford. Other options: Dr. Tim Gray (English) or Deacon Charlie Echeverry (Spanish).', NULL, NULL, NULL, '[]', 8),
(9, 'sat', '12:00', 'Lunch — Sizzle & Crunch (Bellevue)', E'Vietnamese fast-casual right by Meydenbauer — banh mi, vermicelli bowls, rice plates. ~5 min walk from the venue. Quick service that fits the lunch break. Anyone who would rather splurge on Din Tai Fung at Lincoln Square (700 Bellevue Way NE, right across the street) can do that instead — but Din Tai Fung is on you, not the group; the group is only covering Sizzle & Crunch.', '10438 NE 10th St, Bellevue, WA 98004', 'https://maps.app.goo.gl/vEBRvnJ8wkT8PeFXA', NULL, '[]', 9),
(10, 'sat', '13:30', 'Program resumes — Center Hall', '1st floor of Meydenbauer. Find your seats again.', NULL, NULL, NULL, '[]', 10),
(11, 'sat', '15:30', 'Afternoon Plenary — Chris Stefanick', 'Second plenary talk.', NULL, NULL, NULL, '[]', 11),
(12, 'sat', '16:30', 'Praise Music & Adoration — Marie Miller', 'Folk singer Marie Miller performs. Adoration closes the afternoon.', NULL, NULL, NULL, '[]', 12),
(13, 'sat', '17:00', 'Holy Mass — Archbishop Paul Etienne', 'The high point of the day. Mass celebrated by the Archbishop of Seattle.', NULL, NULL, NULL, '[]', 13),
(14, 'sat', '18:30', 'Walk with One — Eucharistic Missionaries', 'Commissioning ceremony for Eucharistic missionaries — we are sent.', NULL, NULL, NULL, '[]', 14),
(15, 'sat', '19:00', 'ASCEND concludes', 'Gather your things. Meet at the vehicles.', NULL, NULL, NULL, '[]', 15),
(16, 'sat', '19:30', 'Depart Meydenbauer → La Quinta Lynnwood', '~25 min drive, ~17 mi north on I-405 → I-5.', NULL, NULL, NULL, '[]', 16),
(17, 'sat', '20:00', 'Hotel check-in — La Quinta Inn Lynnwood', 'Check in, drop bags. Guys and girls in separate rooms.', '4300 Alderwood Mall Blvd, Lynnwood, WA · (425) 775-7447', 'https://www.google.com/maps/search/?api=1&query=La+Quinta+Inn+Lynnwood+4300+Alderwood+Mall+Blvd', NULL, '[]', 17),
(18, 'sat', '20:30', 'Group dinner — Chick-fil-A (Alderwood)', 'Dinner together at Chick-fil-A — ~5 min from the hotel. Quick service so we can be back early; Latin Mass is early Sunday morning.', '3026 196th St SW, Lynnwood, WA 98036', 'https://maps.app.goo.gl/h5tcqENQ6LM7pUkm9', NULL, '[]', 18),
(19, 'sat', '23:00', 'Lights out', 'Latin Mass is early tomorrow. Rest well.', NULL, NULL, NULL, '[]', 19),
(20, 'sun', '05:00', 'Wake up', 'No hotel breakfast this morning — we are eating after Mass. Get ready and meet in the lobby.', NULL, NULL, NULL, '[]', 20),
(21, 'sun', '06:15', 'Depart hotel → North American Martyrs Parish', '~15 min, ~7 mi. Arrive by 6:40 to settle in and get Latin Mass booklets.', NULL, NULL, NULL, '[]', 21),
(22, 'sun', '07:00', 'Traditional Latin Mass — NAM Parish, Edmonds', 'The 7:00 AM Low Mass at North American Martyrs, served by the FSSP. Please arrive by 6:40 to get booklets and find seats.', '9924 232nd St SW, Edmonds, WA 98020', 'https://www.google.com/maps/search/?api=1&query=North+American+Martyrs+Parish+Edmonds+WA', NULL, '[]', 22),
(23, 'sun', '08:15', 'Fellowship outside church — group photo', 'Mass ends around 8:00. Group photo on the steps before we head back to the hotel.', NULL, NULL, NULL, '[]', 23),
(24, 'sun', '08:30', 'Head back to La Quinta', '~15 min back to the hotel. Lynnwood is on the way south toward Seattle.', NULL, NULL, NULL, '[]', 24),
(25, 'sun', '08:45', 'Hotel checkout', 'Change clothes, pack up, load the vehicles, and check out. Take your time — we have a few minutes.', '4300 Alderwood Mall Blvd, Lynnwood, WA 98036', 'https://www.google.com/maps/search/?api=1&query=La+Quinta+Inn+Lynnwood+4300+Alderwood+Mall+Blvd', NULL, '[]', 25),
(26, 'sun', '09:15', 'Depart hotel → Kona Kitchen', '~5 min, ~1.5 mi west on 196th St SW.', NULL, NULL, NULL, '[]', 26),
(27, 'sun', '09:30', 'Breakfast — Kona Kitchen Lynnwood', 'Hawaiian breakfast — loco moco, spam musubi, pancakes, fried rice. ~1 hour to eat together before heading into Seattle.', '3805 196th St SW, Lynnwood, WA 98036', 'https://www.google.com/maps/search/?api=1&query=Kona+Kitchen+Lynnwood+3805+196th+St+SW', NULL, '[]', 27),
(28, 'sun', '10:30', 'Depart → Gas Works Park', '~25–30 min south on I-5. Sunday morning traffic is light.', NULL, NULL, NULL, '[]', 28),
(29, 'sun', '11:00', 'Gas Works Park', 'Iconic Seattle skyline views from the north shore of Lake Union. Walk around, take photos. ~30 min.', '2101 N Northlake Way, Seattle, WA 98103', 'https://www.google.com/maps/search/?api=1&query=Gas+Works+Park+Seattle+WA', NULL, '[]', 29),
(30, 'sun', '11:30', 'Depart → St. James Cathedral', '~10–15 min south via I-5. Downtown Seattle.', NULL, NULL, NULL, '[]', 30),
(31, 'sun', '11:45', 'St. James Cathedral', 'Visit, prayer, light candles. Mother church of the Archdiocese of Seattle. ~30 min.', '804 9th Ave, Seattle, WA 98104', 'https://www.google.com/maps/search/?api=1&query=St.+James+Cathedral+Seattle', NULL, '[]', 31),
(32, 'sun', '12:15', 'Depart → Pike Place Market PDA Garage', '~5–10 min west to 1531 Western Ave. Direct elevator up to MarketFront and the new Overlook Walk.', NULL, NULL, NULL, '[]', 32),
(33, 'sun', '12:30', 'Pike Place Market & Seattle Waterfront (with lunch on your own)', E'Park at the Pike Place Market PDA Garage — safe, well-lit, with elevators straight up to MarketFront and the new Overlook Walk down to the waterfront. Walk Pike Place itself, then take the Overlook Walk down. We split into smaller groups: Alex & Edgar group · Gaby group · adults. Each small group picks where to eat lunch near Pike Place — your meal, your call (the group is not covering Sunday lunch). Anyone who wants to check out Miner\'s Landing on Pier 57 (Great Wheel and arcades) can; just stay with your group and stay in touch. ~3h 15m of free exploring + lunch.', '1531 Western Ave, Seattle, WA 98101 (Pike Place Market PDA Garage)', 'https://www.google.com/maps/search/?api=1&query=Pike+Place+Market+PDA+Garage+1531+Western+Ave', NULL, '[]', 33),
(34, 'sun', '15:45', 'Group photo — Seattle waterfront', 'All three groups meet up at Pier 62 / the Overlook Walk plaza for a group photo before we head home.', NULL, NULL, NULL, '[]', 34),
(35, 'sun', '16:00', 'Walk back to Pike Place garage', 'Head back up the Overlook Walk to the MarketFront elevator and down to the Pike Place Market PDA Garage. Load up the vehicles.', NULL, NULL, NULL, '[]', 35),
(36, 'sun', '16:15', 'Depart for Cowiche', 'I-5 S → I-90 E → I-82 E → Summitview Rd. ~2h 30m from downtown Seattle to St. Juan Diego.', NULL, NULL, NULL, '[]', 36),
(37, 'sun', '18:45', 'Arrive home — Deo gratias', 'What a weekend. See you at Sunday YAG.', NULL, NULL, NULL, '[]', 37);

SELECT setval('stops_id_seq', 37);
