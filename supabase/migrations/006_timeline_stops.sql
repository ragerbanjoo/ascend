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
(1, 'sat', '03:45', 'Meet in Tieton', 'Morning prayer, roll call, load vehicles, final restroom break before the road. Please arrive on time — we leave together.', 'Tieton, WA (exact location TBA)', 'https://www.google.com/maps/search/?api=1&query=Tieton+WA', 'Everything you packed. Coffee optional but recommended.', '[]', 1),
(2, 'sat', '04:00', 'Depart Tieton', 'Route: US-12 W → I-82 W → I-90 W → I-405 N → Meydenbauer Center. Approximately 142 miles, ~2h 25m clean drive time.', NULL, NULL, NULL, '[]', 2),
(3, 'sat', '05:00', 'Rest stop — Pilot Travel Center, Ellensburg', '15 minutes — restroom, gas, coffee, stretch, regroup the caravan before Snoqualmie Pass.', '1307 N Dolarway Rd, Ellensburg, WA 98926', 'https://www.google.com/maps/search/?api=1&query=Pilot+Travel+Center+1307+N+Dolarway+Rd+Ellensburg+WA', NULL, '[]', 3),
(4, 'sat', '06:30', 'Arrive Meydenbauer Center', 'Park in the underground garage. Walk in together, check in, find seats as a group near the front if possible.', '11100 NE 6th St, Bellevue, WA', 'https://www.google.com/maps/search/?api=1&query=Meydenbauer+Center+Bellevue+WA', NULL, '[]', 4),
(5, 'sat', '07:00', 'Eucharistic Adoration · Confession · Praise Music', 'Early arrival perk — two hours of Adoration, a confession window, and praise music before the main program begins.', NULL, NULL, NULL, '[]', 5),
(6, 'sat', '09:00', 'Welcome & Opening Remarks', 'Fr. Nicholas Wichert and Deacon Charlie Echeverry open ASCEND.', NULL, NULL, NULL, '[]', 6),
(7, 'sat', '09:15', 'Morning Plenary — Chris Stefanick', 'The first of two plenary talks from Chris Stefanick.', NULL, NULL, NULL, '[]', 7),
(8, 'sat', '10:45', 'Breakout Sessions', 'Recommended for our group: the Youth Breakout with Dr. Andrew & Sarah Swafford. Other options: Dr. Tim Gray (English) or Deacon Charlie Echeverry (Spanish).', NULL, NULL, NULL, '[]', 8),
(9, 'sat', '12:00', 'Lunch — Downtown Bellevue', E'The group will pick a spot together. Here are some recommendations within walking distance of the center — but you can always change your mind once you\'re there and go wherever the group is feeling.', NULL, 'https://www.google.com/maps/search/?api=1&query=restaurants+near+Meydenbauer+Center+Bellevue+WA', NULL, '[{"name":"Facing East Noodle & Bar","desc":"Taiwanese","walk":"~8 min","url":"https://maps.apple.com/?address=10246%20Main%20St%2C%20Bellevue%2C%20WA%2098004"},{"name":"Semicolon Cafe","desc":"Coffee & bites","walk":"~5 min","url":"https://maps.app.goo.gl/6N25foCX5QCTqRNs5"},{"name":"Pagliacci Pizza","desc":"Pizza","walk":"~6 min","url":"https://maps.app.goo.gl/XckiSZt9m9jmeds58"},{"name":"The Cheesecake Factory","desc":"American","walk":"~10 min","url":"https://maps.app.goo.gl/da8zZRYzLcqi6NnbA"},{"name":"Mendocino Farms","desc":"Sandwiches & salads","walk":"~5 min","url":"https://maps.app.goo.gl/F48HfbK5d127khc99"}]', 9),
(10, 'sat', '13:30', 'Program resumes — Center Hall', '1st floor of Meydenbauer. Find your seats again.', NULL, NULL, NULL, '[]', 10),
(11, 'sat', '15:30', 'Afternoon Plenary — Chris Stefanick', 'Second plenary talk.', NULL, NULL, NULL, '[]', 11),
(12, 'sat', '16:30', 'Praise Music & Adoration — Marie Miller', 'Folk singer Marie Miller performs. Adoration closes the afternoon.', NULL, NULL, NULL, '[]', 12),
(13, 'sat', '17:00', 'Holy Mass — Archbishop Paul Etienne', 'The high point of the day. Mass celebrated by the Archbishop of Seattle.', NULL, NULL, NULL, '[]', 13),
(14, 'sat', '18:30', 'Walk with One — Eucharistic Missionaries', 'Commissioning ceremony for Eucharistic missionaries — we are sent.', NULL, NULL, NULL, '[]', 14),
(15, 'sat', '19:00', 'ASCEND concludes', 'Gather your things. Meet at the vehicles.', NULL, NULL, NULL, '[]', 15),
(16, 'sat', '19:30', 'Depart Meydenbauer → La Quinta Lynnwood', '~25 min drive, ~17 mi north on I-405 → I-5.', NULL, NULL, NULL, '[]', 16),
(17, 'sat', '20:00', 'Hotel check-in — La Quinta Inn Lynnwood', 'Check in, drop bags. Guys and girls in separate rooms.', '4300 Alderwood Mall Blvd, Lynnwood, WA · (425) 775-7447', 'https://www.google.com/maps/search/?api=1&query=La+Quinta+Inn+Lynnwood+4300+Alderwood+Mall+Blvd', NULL, '[]', 17),
(18, 'sat', '20:30', 'Group dinner + debrief', E'The group will pick a spot together. Here are some options near the hotel — but feel free to change your mind once you\'re there.', NULL, 'https://www.google.com/maps/search/?api=1&query=restaurants+near+La+Quinta+Inn+Lynnwood+WA', NULL, '[{"name":"The Cheesecake Factory","desc":"American","walk":"~5 min drive","url":"https://maps.app.goo.gl/RpB6U2LrafuNnGh86"},{"name":"Applebee''s Grill + Bar","desc":"American grill","walk":"~3 min drive","url":"https://maps.app.goo.gl/LKWSGDRm8j645Wmk8"},{"name":"P.F. Chang''s","desc":"Chinese & Asian","walk":"~5 min drive","url":"https://www.google.com/maps?cid=15890116548250234931"},{"name":"Kura Revolving Sushi Bar","desc":"Japanese sushi","walk":"~5 min drive","url":"https://www.google.com/maps/search/?api=1&query=Kura+Revolving+Sushi+Bar+3321+184th+St+SW+Lynnwood+WA"},{"name":"Shake Shack","desc":"Burgers & shakes","walk":"~3 min drive","url":"https://maps.app.goo.gl/4uFhM9PgnQrzDMaC9"},{"name":"Chick-fil-A","desc":"Chicken","walk":"~3 min drive","url":"https://maps.app.goo.gl/vyADsDpkJ2C2qX1d6"}]', 18),
(19, 'sat', '23:00', 'Lights out', 'Latin Mass is early tomorrow. Rest well.', NULL, NULL, NULL, '[]', 19),
(20, 'sun', '05:00', 'Wake up', 'No hotel breakfast this morning — we are eating after Mass. Get ready and meet in the lobby.', NULL, NULL, NULL, '[]', 20),
(21, 'sun', '06:15', 'Depart hotel → North American Martyrs Parish', '~15 min, ~7 mi. Arrive by 6:40 to settle in and get Latin Mass booklets.', NULL, NULL, NULL, '[]', 21),
(22, 'sun', '07:00', 'Traditional Latin Mass — NAM Parish, Edmonds', 'The 7:00 AM Low Mass at North American Martyrs, served by the FSSP. The second Yakima group driving up Sunday meets us here. Please arrive by 6:40 to get booklets.', '9924 232nd St SW, Edmonds, WA 98020', 'https://www.google.com/maps/search/?api=1&query=North+American+Martyrs+Parish+Edmonds+WA', NULL, '[]', 22),
(23, 'sun', '08:15', 'Fellowship outside church — group photo', 'Meet the second Yakima group. Group photo on the steps. Mass ends around 8:00.', NULL, NULL, NULL, '[]', 23),
(24, 'sun', '08:30', 'Head back to La Quinta', '~15 min back to the hotel. Lynnwood is on the way south toward Seattle.', NULL, NULL, NULL, '[]', 24),
(25, 'sun', '08:45', 'Hotel checkout', 'Change clothes, pack up, load the vehicles, and check out. Take your time — we have a few minutes.', '4300 Alderwood Mall Blvd, Lynnwood, WA 98036', 'https://www.google.com/maps/search/?api=1&query=La+Quinta+Inn+Lynnwood+4300+Alderwood+Mall+Blvd', NULL, '[]', 25),
(26, 'sun', '09:15', 'Breakfast — Lynnwood area', 'The group will pick a spot together near the hotel.', NULL, 'https://www.google.com/maps/search/?api=1&query=restaurants+near+La+Quinta+Inn+Lynnwood+WA', NULL, '[]', 26),
(27, 'sun', '10:00', 'Depart → Gas Works Park', '~25 min south on I-5. Iconic Seattle views from the north shore of Lake Union.', NULL, NULL, NULL, '[]', 27),
(28, 'sun', '10:30', 'Gas Works Park', 'One of the best views of the Seattle skyline. Walk around, take photos, enjoy the morning. ~30 min.', '2101 N Northlake Way, Seattle, WA 98103', 'https://www.google.com/maps/search/?api=1&query=Gas+Works+Park+Seattle+WA', NULL, '[]', 28),
(29, 'sun', '11:00', 'Depart → St. James Cathedral', '~15 min south via I-5.', NULL, NULL, NULL, '[]', 29),
(30, 'sun', '11:15', 'St. James Cathedral', 'Visit, prayer, light candles. Mother church of the Archdiocese of Seattle. ~30 min.', '804 9th Ave, Seattle, WA 98104', 'https://www.google.com/maps/search/?api=1&query=St.+James+Cathedral+Seattle', NULL, '[]', 30),
(31, 'sun', '11:45', 'Head to Pike Place', '~10 min west from St. James to the waterfront.', NULL, NULL, NULL, '[]', 31),
(32, 'sun', '12:00', 'Pike Place Market & waterfront', 'Walk around the new Pike Place waterfront area — take photos, enjoy the views, soak it in.', NULL, NULL, NULL, '[]', 32),
(33, 'sun', '13:00', 'Head to Topgolf Renton', '~20 min drive south from Pike Place. Time to have some fun.', '700 SW 19th St, Renton, WA 98057', 'https://www.google.com/maps/search/?api=1&query=Topgolf+Renton+WA', NULL, '[]', 33),
(34, 'sun', '13:30', 'Topgolf Renton', 'Hit some balls, hang out, friendly competition.', '700 SW 19th St, Renton, WA 98057', 'https://www.google.com/maps/search/?api=1&query=Topgolf+Renton+WA', NULL, '[]', 34),
(35, 'sun', '15:00', 'Lunch — Renton area', 'The group will pick a spot together near Topgolf before hitting the road.', NULL, 'https://www.google.com/maps/search/?api=1&query=restaurants+near+Topgolf+Renton+WA', NULL, '[]', 35),
(36, 'sun', '16:00', 'Depart for Yakima', 'I-405 S → I-90 E → I-82 E → US-12 E. ~2h 45m from Renton.', NULL, NULL, NULL, '[]', 36),
(37, 'sun', '18:45', 'Arrive home — Deo gratias', 'What a weekend. See you at Sunday YAG.', NULL, NULL, NULL, '[]', 37);

SELECT setval('stops_id_seq', 37);
