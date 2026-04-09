# Claude Code Prompt — St. Juan Diego YAG × ASCEND Pilgrimage Site

> Paste everything below into Claude Code as a single prompt. All placeholders are marked `[PLACEHOLDER: ...]` so they're easy to find and fill in later.

---

**ultrathink** about the architecture, visual design, animation choreography, and information hierarchy before writing a single line of code. This site is for a sacred pilgrimage — plan it with care.

**Before you start building, read these skills:**

1. **`/mnt/skills/public/frontend-design/SKILL.md`** — required. This project lives or dies on visual design quality. Read the full skill and follow its design tokens, component patterns, typography scale, and styling constraints. The brand reference is the ASCEND Eucharistic Revival website (https://www.ascendeucharisticrevival.church/) — reverent, cinematic, gold-on-midnight. Study it before designing.
2. **`/mnt/skills/public/skill-creator/SKILL.md`** — skim only if useful for structuring your own reusable patterns across the 9 pages.

After reading the frontend-design skill, plan the full system before coding: color tokens, type scale, spacing scale, component library (nav, countdown chip, card, timeline stop, checkbox, button variants), animation primitives, and how they'll be shared across all 9 pages via `style.css` and `script.js`. Then build.

---

# Build: St. Juan Diego YAG — ASCEND Pilgrimage Itinerary Site (Multi-Page)

Build a **multi-page interactive website** as an itinerary guide for the **St. Juan Diego Young Adult Group** pilgrimage to the **ASCEND Eucharistic Revival** (Bellevue, WA) on **May 16, 2026**, and the following Sunday in Edmonds/Seattle. The audience is young adults (16–25) and their parents. It must be beautiful, trustworthy, easy to scan on mobile, and heavy on delightful animations — especially on the home page.

## Tech stack

- **Separate HTML files** sharing a common `style.css` and `script.js`. No framework, no build step. Each page opens directly in a browser.
- Vanilla JS + Tailwind via CDN (OK), or pure CSS.
- GSAP via CDN acceptable for scroll animations on the home page; keep utility pages lighter.
- **Mobile-first.** Test at 375px, 768px, 1440px.
- No backend. All state is client-side via `window.storage`.
- Respect `prefers-reduced-motion: reduce` — disable heavy animations for those users.
- Every page must be fully accessible: semantic HTML, alt text, proper contrast, keyboard navigable.

## File structure

```
/
├── index.html          (Home — cinematic landing)
├── timeline.html       (Live time-aware timeline)
├── travel.html         (Driving, route, parking)
├── hotel.html          (La Quinta Lynnwood details)
├── packing.html        (Interactive checklist)
├── whats-included.html (What's covered + what to bring money for)
├── speakers.html       (ASCEND speakers gallery)
├── sunday.html         (Latin Mass + St. James Cathedral)
├── parents.html        (Dedicated parents info)
├── style.css
├── script.js
└── assets/             (any images/icons)
```

## Global elements (on every page)

### Persistent navigation
- **Desktop**: top nav bar. Left: "St. Juan Diego YAG × ASCEND" logotype. Center: nav links. Right: live countdown chip ("2d 14h 32m").
- **Mobile**: fixed bottom nav bar (app-style) with icons + labels: Home, Timeline, Travel, Hotel, More. "More" opens a slide-up sheet with Packing, What's Included, Speakers, Sunday, Parents.
- The countdown chip in the nav is always visible and updates every second. Target: **May 16, 2026, 6:45 AM PT** (Option B departure — the recommended default). After trip start, it flips to "ON PILGRIMAGE 🚐" and counts up. After Sunday May 17 evening, it shows "Deo gratias 🙏".

### Visual style — mirror ASCEND's brand
- **Colors**: deep midnight navy `#0a1228` primary, warm gold `#c9a14a` accent (hover `#e5c06a`), off-white `#f5f1e8` text, cream parchment `#f0e9d6` for light sections.
- **Typography**: Cormorant Garamond or Playfair Display (serif, headings) + Inter or Lato (sans, body) from Google Fonts.
- **Mood**: reverent, cinematic, uplifting. Soft gold light rays, subtle particle effects, slow parallax. Think "In Him, We Rise."
- Tagline, repeated on the home page and in the footer: **"In Him, We Rise — Together."**

### Shared footer (every page)
- "St. Juan Diego Young Adult Group"
- Quick external links: [ASCEND](https://www.ascendeucharisticrevival.church/) · [North American Martyrs](https://www.northamericanmartyrs.org/) · [St. James Cathedral](https://stjames-cathedral.org/)
- Contact: Bright Minds — [PLACEHOLDER: phone/email]
- "Made with ♥ for the glory of God"
- Auto-generated "Last updated" date

---

## Page 1 — `index.html` (Home)

This is the emotional landing. Go hardest on animations here.

### Hero
- Full-viewport, dark midnight background with animated gold particles / drifting light rays (canvas preferred).
- Main headline: **"St. Juan Diego YAG × ASCEND 2026"**
- Subhead: *Pilgrimage to Bellevue & Seattle · May 16–17, 2026*
- **Large live countdown** below the subhead — Days / Hours / Minutes / Seconds, each number animates (scale or flip) on change.
- Primary CTA: **"View My Journey"** → links to `timeline.html`.
- Secondary CTA: **"Register for ASCEND"** → https://www.ascendeucharisticrevival.church/register-now/
- Scroll indicator (gold chevron, gentle bounce).

### Trip At-a-Glance (4 cards, fade + slide up on scroll)
- 📍 **Depart from:** St. Juan Diego Parish, Tieton, WA
- 🏛️ **Main Event:** ASCEND — Meydenbauer Center, Bellevue
- ⛪ **Sunday:** Latin Mass (Edmonds) + St. James Cathedral
- 💸 **Your cost:** Covered by the group — bring money only for extra food & personal items

### "I'm Going!" RSVP Wall
- User types first name, picks a saint icon from a grid (St. Juan Diego, Our Lady of Guadalupe, St. Michael, St. Therese, St. Joseph, Sacred Heart).
- Taps **"I'm going!"** → name floats up into a shared wall of attendees with a **gold confetti burst**.
- Notice beneath the form: *"Your name will be visible to everyone in the group."*
- Storage: `window.storage` key `"rsvp:attendees"` (shared: true), JSON array of `{name, icon, timestamp}`.

### Prayer Intentions Wall
- Floating cards that gently drift across the section.
- Users type an intention for the group to pray for during the pilgrimage and submit.
- Storage: `window.storage` key `"intentions:list"` (shared: true), JSON array of `{text, timestamp}`.
- Same visibility notice.

### Prayer Before We Go
- Full-width dark section, gold serif text.
- Display the **Anima Christi** (Soul of Christ, sanctify me...) or a traveler's prayer.
- Lines fade in one by one when scrolled into view.

### Quick Links Grid
- 6 tiles linking to the other pages: Timeline, Travel, Hotel, Packing, Sunday Plan, For Parents.
- Each tile has an icon, title, and one-line description.

---

## Page 2 — `timeline.html` (Live Time-Aware Timeline)

The operational centerpiece. Auto-scrolls to the current or next stop on load.

### Top: Departure Time Options (⚠️ prominent)
Two large contrasting cards side by side (stacked on mobile). User picks one → selection drives the timeline times below. Save choice in `window.storage` key `"user:departureOption"` (shared: false, default "B").

**Option A — "The Full Experience" (Early Birds)**
- Meet at St. Juan Diego: **4:30 AM**
- Depart Tieton: **5:00 AM**
- Arrive Meydenbauer: **~7:00 AM**
- You get: Full Eucharistic Adoration from 7 AM, confession window, every minute of the conference.
- Tradeoff: Very early wake-up. Requires everyone committed to the 4:30 meet.

**Option B — "The Sustainable Plan" (Recommended) ⭐**
- Meet at St. Juan Diego: **6:15 AM**
- Depart Tieton: **6:45 AM**
- Arrive Meydenbauer: **~9:30 AM**
- You get: Welcome, all plenaries, breakouts, Mass — everything except the early adoration window.
- Tradeoff: You miss 7–9 AM adoration and the early confession window, but arrive rested and alert.

Animated toggle switch between the two. Expandable **"Why these times?"** explainer:
> The drive from Tieton to Bellevue is 142 miles (~2h 20m clean). We pad it with: 20 min group loading, 15 min Snoqualmie Pass slowdown buffer, 15 min mid-drive rest stop, 20 min Seattle-area traffic, 15 min parking + check-in. Total realistic: ~3h 45m door to door.

### The Timeline
Vertical gold line down the center with pulsing dots at each stop. **Time-aware using the user's local PT time:**

- **Past stops** → dimmed, gold checkmark.
- **Currently active stop** → animated gold glow pulse + "🔴 Happening now" label.
- **Upcoming stops** → full color, with live "in X hours" / "in X minutes" label that updates each minute.
- On page load, auto-smooth-scroll to the current or next stop.
- **Before May 16:** banner at top "Pilgrimage begins in [live countdown]."
- **After May 17 evening:** all checkmarks + "Pilgrimage complete — Deo gratias" banner.

Each stop is a **clickable card** that expands to show: full address, Google Maps link, notes, what to bring to that stop.

Stops 1–4 shift based on Option A vs Option B. Stop 5 (Adoration) appears only for Option A. Everything from stop 6 onward is identical.

**Saturday, May 16, 2026**

1. **6:15 AM** (B) / **4:30 AM** (A) — **Meet at St. Juan Diego Parish, Tieton.** Morning prayer, roll call, load vehicles, final restroom break before the road.
2. **6:45 AM** (B) / **5:00 AM** (A) — **Depart Tieton.** Route: US-12 W → I-82 W → I-90 W → I-405 N → Meydenbauer. ~142 mi, ~2h 20m clean.
3. **~8:30 AM** (B) / **~6:30 AM** (A) — **Rest stop at Indian John Hill Rest Area** (I-90, near Cle Elum). 15 min — restroom, coffee, stretch, regroup the caravan.
4. **~9:30 AM** (B) / **~7:00 AM** (A) — **Arrive Meydenbauer Center**, 11100 NE 6th St, Bellevue. Park in the underground garage. Walk in together, check in, find seats as a group.
5. *(Option A only)* **7:00 AM–9:00 AM** — **Eucharistic Adoration, Confession, praise music.**
6. **9:00 AM** — **Welcome & Opening Remarks** — Fr. Nicholas Wichert & Deacon Charlie Echeverry.
7. **9:15 AM** — **Morning Plenary — Chris Stefanick.**
8. **10:45 AM** — **Breakout Sessions.** *Recommended for our group: Youth Breakout with Dr. Andrew & Sarah Swafford.* Other options: Dr. Tim Gray (English), Deacon Charlie Echeverry (Spanish).
9. **12:00 PM** — **Lunch at local Bellevue restaurants.** [PLACEHOLDER: list 3–4 walkable options + group meet-back time + note that the group covers this meal OR that members should pay their own — clarify with Bright Minds]
10. **1:30 PM** — **Program resumes** — Center Hall, 1st floor of Meydenbauer.
11. **3:30 PM** — **Afternoon Plenary — Chris Stefanick.**
12. **4:30 PM** — **Praise Music & Adoration ends — Marie Miller performs.**
13. **5:00 PM** — **Holy Mass** celebrated by **Archbishop Paul Etienne**.
14. **6:30 PM** — **Walk with One — Eucharistic Missionaries commissioning.**
15. **7:00 PM** — **ASCEND concludes.**
16. **7:30 PM** — **Depart Meydenbauer → La Quinta Lynnwood.** ~25 min drive, ~17 mi north on I-405 → I-5.
17. **8:15 PM** — **Hotel check-in — La Quinta Inn by Wyndham Lynnwood**, 4300 Alderwood Mall Blvd, Lynnwood, WA. Phone: (425) 775-7447.
18. **9:00 PM** — **Group dinner + debrief.** [PLACEHOLDER: pick a spot near hotel — Alderwood Mall area has many options]
19. **11:00 PM** — **Lights out.** Latin Mass is early tomorrow.

**Sunday, May 17, 2026**

20. **6:45 AM** — **Wake up.** Free continental breakfast at La Quinta.
21. **7:45 AM** — **Depart hotel** → North American Martyrs Parish (~15 min, ~7 mi).
22. **8:30 AM** — **Traditional Latin Mass** at **North American Martyrs Parish**, 9924 232nd St SW, Edmonds, WA 98020. *Note: NAM's Sunday Latin Mass times are 7, 8:30, 10, 11:30, and 1 — there is no 8 AM. We're taking the 8:30 Low Mass. Confirm with Bright Minds if a different Mass is preferred.* The second Yakima group traveling up Sunday morning meets us here.
23. **~9:45 AM** — **Fellowship outside church** with both groups. Group photo.
24. **10:30 AM** — **Drive to Seattle — St. James Cathedral**, 804 9th Ave, Seattle. ~25 min, ~17 mi south on I-5.
25. **11:15 AM** — **Arrive St. James Cathedral.** Visit, prayer, light candles, confession if available. Historic Seattle cathedral — plan ~1 hour.
26. **12:30 PM** — **Lunch in downtown Seattle.** [PLACEHOLDER: suggestions — Pike Place Market area is walkable]
27. **Afternoon** — [PLACEHOLDER: possible second Mass / fellowship / sightseeing — TBD by Bright Minds]
28. **~5:00 PM** — **Depart Seattle for Yakima.** ~2h 30m drive.
29. **~7:30 PM** — **Arrive home. Deo gratias.** 🙏

---

## Page 3 — `travel.html` (Driving, Route, Parking)

### Route Overview
- Embedded Google Maps iframe showing the full loop: Tieton → Meydenbauer → La Quinta Lynnwood → North American Martyrs → St. James Cathedral → Tieton.
- Total miles across the whole trip: ~320 mi.
- Time breakdown for each leg.

### Leg-by-leg cards
Each leg is a card with: start, end, distance, estimated time, notes, "Open in Google Maps" button.

1. **Tieton → Meydenbauer Center** — 142 mi, ~2h 20m. Route: US-12 W → I-82 W → I-90 W → I-405 N. Rest stop at Indian John Hill (I-90).
2. **Meydenbauer → La Quinta Lynnwood** — 17 mi, ~25 min. I-405 N → I-5 N.
3. **La Quinta → North American Martyrs** — 7 mi, ~15 min.
4. **North American Martyrs → St. James Cathedral** — 17 mi, ~25 min. I-5 S.
5. **St. James Cathedral → Tieton** — ~143 mi, ~2h 30m. I-5 S → I-90 E → I-82 E → US-12 E.

### Weather & Road Conditions Warning Box
> **Check Snoqualmie Pass the night before.** Even in May, pass conditions can slow you down. Check [WSDOT Travel Center](https://wsdot.com/travel/real-time/travel-times) and the WSDOT app. If there's snow or heavy rain, add buffer time.

### Parking
- **Meydenbauer Center**: 434 underground parking spaces. Arrive early for the group. [Venue info](https://www.ascendeucharisticrevival.church/venue/) · [Directions & parking](https://www.meydenbauer.com/convention-center/attendees/directions-parking/)
- **La Quinta Lynnwood**: Free parking on site.
- **North American Martyrs**: Free parish lot — may fill up for Sunday Mass, arrive 15 min early.
- **St. James Cathedral**: Street parking on Sundays is typically available. Metered spots downtown Seattle.

### Carpool Assignments
- [PLACEHOLDER: vehicle list, drivers, passengers, meeting point details]

---

## Page 4 — `hotel.html` (La Quinta Lynnwood Details)

### Hotel Card (large hero-style)
- **La Quinta Inn by Wyndham Lynnwood**
- Address: 4300 Alderwood Mall Blvd, Lynnwood, WA 98036
- Phone: **(425) 775-7447**
- Rating: ⭐ 4.0 (1,200+ reviews)
- Website: https://www.wyndhamhotels.com/laquinta/lynnwood-washington/la-quinta-inn-lynnwood/overview
- "Open in Google Maps" button.

### Why this hotel
- Recently renovated, very clean, well-maintained
- **Free hot breakfast** (eggs, sausage, waffles, biscuits & gravy, fruit, yogurt)
- **Free parking** on site
- Indoor pool + hot tub + gym
- Close to I-5 and Lynnwood light rail
- **Strategically located** between all three of our destinations:
  - ~20 min to Meydenbauer Center (Bellevue)
  - ~15 min to North American Martyrs (Edmonds)
  - ~20 min to St. James Cathedral (Seattle)
- Safe, affordable, reviewed as friendly staff and clean rooms

### Backup hotel (if La Quinta is booked)
**Best Western Alderwood** — 19332 36th Ave W, Lynnwood, WA 98036 · (425) 775-7600 · ⭐ 4.1 · ~1 min from La Quinta.

### Room Assignments
[PLACEHOLDER: list rooms, who's in each, guys/girls separate]

### House Rules
- Guys and girls in separate rooms, no exceptions
- Curfew: **11:00 PM** lights out (Mass is early Sunday)
- No guests in rooms
- Respect hotel quiet hours
- Damages are the responsibility of the person who caused them
- Any issues → text Bright Minds immediately

### Check-in / Check-out
- Check-in: Saturday, May 16, ~8:15 PM
- Check-out: Sunday, May 17, by 11 AM (leave earlier — we depart 7:45 AM)
- Confirmation number: [PLACEHOLDER]
- Booked under: [PLACEHOLDER]

---

## Page 5 — `packing.html` (Interactive Checklist)

### Persistent Packing Checklist
Animated checkboxes. Each item has a satisfying tick animation + gold check. State saved per user via `window.storage` key `"packing:checklist"` (shared: false). Shows a progress bar at the top ("8 of 20 packed").

### Sections

**Spiritual**
- [ ] Bible
- [ ] Rosary
- [ ] Journal & pen
- [ ] Any devotional book you like

**Mass Attire — especially for Sunday Latin Mass (important!)**
- [ ] Modest dress or skirt below the knee (ladies)
- [ ] Chapel veil (ladies — optional but traditional at Latin Mass)
- [ ] Collared shirt + dress pants (gentlemen)
- [ ] Nice shoes

**Daily Clothes**
- [ ] Saturday outfit (comfortable, modest, you'll be sitting most of the day)
- [ ] Sunday outfit (see above)
- [ ] Pajamas
- [ ] Light jacket (Seattle spring is unpredictable)
- [ ] Comfortable walking shoes

**Essentials**
- [ ] Phone + charger
- [ ] Portable battery/power bank
- [ ] Photo ID
- [ ] Any medications
- [ ] Toiletries (toothbrush, deodorant, etc.)
- [ ] Water bottle
- [ ] Snacks for the drive

**Money**
- [ ] Cash or card for **extra food** (snacks, coffee, treats beyond included meals)
- [ ] Cash or card for **personal purchases** (ASCEND merch, souvenirs, offerings)
- See **What's Included** page for full details

**Nice to have**
- [ ] Small backpack for the conference day
- [ ] Sunglasses
- [ ] Umbrella

---

## Page 6 — `whats-included.html` (What's Covered + What to Bring Money For)

This page is critical and must be crystal clear. No ambiguity.

### Hero message (large, centered, gold)
> **The group covers the big stuff.**
> You only need money for extra food and personal items.

### ✅ What the group covers
- ASCEND event registration
- Hotel stay (La Quinta Lynnwood, Saturday night)
- Transportation / gas
- [PLACEHOLDER: confirm if group dinner Saturday night is included]
- [PLACEHOLDER: confirm if any other meals are included]

### 💸 What you should bring money for
- **Extra food**: snacks on the drive, coffee stops, anything beyond group meals
- **Personal items**: ASCEND merchandise (t-shirts, rosaries, books), souvenirs from St. James Cathedral
- **Offerings**: a few dollars for the collection basket at Latin Mass and St. James
- **Suggested amount**: [PLACEHOLDER: $30–50 is typical for a weekend trip like this, but Bright Minds should confirm]

### Payment status
- Status: **✅ Paid in full by the group** — nothing owed by attendees.
- If questions: contact Bright Minds — [PLACEHOLDER: phone/email]

### FAQ
- *"What if I want to buy merch at ASCEND?"* → Bring your own money. Merch store: [ASCEND Merch Store](https://ascendmerchstore.itemorder.com/shop/home/)
- *"Are tips for restaurants covered?"* → [PLACEHOLDER: clarify]
- *"What about lunch on Saturday in Bellevue?"* → [PLACEHOLDER: clarify]

---

## Page 7 — `speakers.html` (ASCEND Speakers Gallery)

Grid of speaker cards. Each card has a photo, name, and short bio. Hover/tap flips the card. Each links to the speaker's bio page on ascendeucharisticrevival.church.

- **Chris Stefanick** → https://www.ascendeucharisticrevival.church/chris-stefanick/
- **Dr. Tim Gray** → https://www.ascendeucharisticrevival.church/tim-gray/
- **Dr. Andrew & Sarah Swafford** → https://www.ascendeucharisticrevival.church/swafford/
- **Deacon Charlie Echeverry** → https://www.ascendeucharisticrevival.church/charlie-echeverry/
- **Archbishop Paul Etienne** (Mass celebrant)
- **Fr. Nicholas Wichert** (Welcome)
- **Marie Miller** — folk singer → https://www.ascendeucharisticrevival.church/marie-miller/
- **Floriani** — sacred music vocal ensemble → https://www.ascendeucharisticrevival.church/floriani/
- **Fr. Derek Lappe**
- **Jason Shanks**

Staggered fade-in on scroll. Smooth hover lift effect.

---

## Page 8 — `sunday.html` (Latin Mass + St. James Cathedral)

This day is complex enough to deserve its own page.

### Hero
- Quiet, reverent tone. Gold serif heading: **"Sunday, May 17 — The Lord's Day"**
- Subhead: *Latin Mass at North American Martyrs · St. James Cathedral · Fellowship*

### North American Martyrs Parish (Latin Mass)
- Address: **9924 232nd St SW, Edmonds, WA 98020**
- Phone: (206) 641-6504
- Website: https://www.northamericanmartyrs.org/
- Our Mass: **8:30 AM Low Mass**
- **Full Sunday Mass schedule** (for reference): 7, 8:30, 10, 11:30, 1
- Served by the Priestly Fraternity of St. Peter (FSSP)
- Pastor: Fr. Joseph Heffernan, FSSP
- **About Latin Mass**: Brief explainer for anyone unfamiliar — the Traditional Latin Mass (Extraordinary Form) is the Roman Rite Mass as celebrated before Vatican II. It's prayed in Latin, with reverent silence and traditional chant. Missal/booklets available at the back of the church to follow along.
- **What to expect**: arrive 15 minutes early, grab a booklet, ladies may wear a chapel veil (not required), receive Communion kneeling at the altar rail.

### Meeting the Second Yakima Group
- The second group from Yakima is driving up Sunday morning to join us for Latin Mass.
- Meeting point: outside the church after the 8:30 Mass.
- [PLACEHOLDER: contact for second group's lead driver]
- Group photo after Mass!

### St. James Cathedral (Seattle)
- Address: **804 9th Ave, Seattle, WA 98104**
- Website: https://stjames-cathedral.org/
- One of the most beautiful churches in the Pacific Northwest
- Mother church of the Archdiocese of Seattle
- Our visit: **11:15 AM – 12:15 PM** approximately — prayer, light candles, confession if available, take in the architecture
- [PLACEHOLDER: check St. James Sunday Mass schedule if attending a second Mass here]

### Lunch & Afternoon
- 12:30 PM — lunch downtown Seattle. [PLACEHOLDER: recommendations — Pike Place Market is walkable from St. James]
- Afternoon — [PLACEHOLDER: fellowship / sightseeing / second Mass — TBD]

### Departure
- ~5:00 PM — depart Seattle for Yakima
- ~7:30 PM — arrive home

### Map
Embedded Google Map showing: North American Martyrs → St. James Cathedral → home route.

---

## Page 9 — `parents.html` (Dedicated Parents Info)

Calmer design — less animation, more clarity. Everything a parent needs **above the fold**.

### Hero (no animation drama — just clean info)
> **For Parents**
> Everything you need to know about your young adult's pilgrimage.

### Quick Facts Card (big, centered, at the top)
- **Departure**: Saturday, May 16, 2026, from St. Juan Diego Parish, Tieton
- **Return**: Sunday, May 17, 2026, approximately 7:30 PM
- **Lead chaperone**: Bright Minds — [PLACEHOLDER: phone]
- **Emergency contact**: [PLACEHOLDER: phone]
- **Hotel**: La Quinta Inn Lynnwood — (425) 775-7447

### What your young adult is doing
Short, plain-language summary of the trip — not the marketing copy, just the facts. "Saturday: drive to Bellevue for a Catholic conference called ASCEND, hear talks, attend Mass with the Archbishop, drive to Lynnwood to stay at a hotel. Sunday: attend Traditional Latin Mass in Edmonds, visit St. James Cathedral in Seattle, drive home."

### Where are they right now?
- Button: **"See the live timeline →"** links to `timeline.html`. The timeline shows exactly where the group should be at any given moment.

### Safety & supervision
- Chaperoned by Bright Minds throughout
- Guys and girls in separate hotel rooms
- 11 PM curfew Saturday night
- Group travels together, no one left alone
- All chaperones have phones and can be reached anytime

### Cost
- **Fully covered by the group.** Your young adult only needs pocket money for snacks and any personal purchases (merch, souvenirs). Suggested: $30–50.

### Consent / Waiver
- [PLACEHOLDER: download link for consent form]
- Please sign and return by [PLACEHOLDER: date]

### Contact Bright Minds
- Phone: [PLACEHOLDER]
- Email: [PLACEHOLDER]
- Text is preferred during the trip

### Map
Simple embedded Google Map with pins on all the locations.

---

## Animations (scoped per page)

- **index.html** (go hard): gold particles in hero, parallax scrolling, section fade+slide, staggered card entrances, confetti burst on RSVP, drifting prayer intention cards, prayer lines fade in one at a time.
- **timeline.html** (meaningful motion): pulsing dots, glowing "current" stop, smooth auto-scroll on load, countdown animations, toggle switch animation between Option A / B.
- **speakers.html**: card flip on tap, stagger fade-in on scroll.
- **travel.html, hotel.html, packing.html, whats-included.html, sunday.html, parents.html**: lighter — just gentle fade-ins on scroll and smooth hover lifts. Parents page should be calmest.
- All motion disabled under `prefers-reduced-motion: reduce`.

## Persistent storage keys
Wrap every call in try/catch. Show loading states. Handle errors gracefully.

- `"rsvp:attendees"` (shared: true) — attendee wall on home page
- `"intentions:list"` (shared: true) — prayer intentions on home page
- `"packing:checklist"` (shared: false) — each user's packing state
- `"user:departureOption"` (shared: false, "A" or "B") — timeline toggle, default "B"

## Deliverables

- All 9 HTML files + `style.css` + `script.js` + any assets
- Opens directly in a browser, no build step
- Mobile-first, fully responsive
- Accessible
- Comment block at the top of `index.html` listing **every `[PLACEHOLDER]`** across all pages so Bright Minds can fill them in one pass
- Nav bar and footer consistent across all pages
- Countdown chip visible in nav on every page, updating every second

Build it with excellence — this is for Jesus in the Eucharist, and for young souls encountering Him. Make it beautiful.
