/*
 * Renders the parent-meeting agenda to a printable multi-page PDF using pdf-lib.
 *
 * Output: docs/ascend-2026-parent-meeting-agenda.pdf
 *
 * Run:   NODE_PATH=$(npm root -g) node generate-parent-meeting-agenda.js
 */

const fs = require('fs');
const path = require('path');
const { PDFDocument, StandardFonts, rgb } = require('pdf-lib');

// --- Page geometry ---------------------------------------------------------
const PAGE_W = 612;
const PAGE_H = 792;
const MARGIN_X = 54;
const MARGIN_TOP = 54;
const MARGIN_BOTTOM = 56;
const CONTENT_W = PAGE_W - 2 * MARGIN_X;
const PAGE_BOTTOM_LIMIT = MARGIN_BOTTOM + 14;

// --- Palette ---------------------------------------------------------------
const INK = rgb(0.08, 0.10, 0.16);
const SUBTLE = rgb(0.40, 0.40, 0.45);
const GOLD = rgb(0.55, 0.42, 0.10);
const GOLD_SOFT = rgb(0.97, 0.94, 0.85);
const RULE = rgb(0.78, 0.78, 0.78);
const SOFT_BLUE = rgb(0.92, 0.95, 0.99);
const DEEP_RED = rgb(0.55, 0.10, 0.10);

(async () => {
  const pdf = await PDFDocument.create();
  const helv = await pdf.embedFont(StandardFonts.Helvetica);
  const helvBold = await pdf.embedFont(StandardFonts.HelveticaBold);
  const helvOblique = await pdf.embedFont(StandardFonts.HelveticaOblique);
  const timesItalic = await pdf.embedFont(StandardFonts.TimesRomanItalic);

  // --- Renderer state ---
  let page = pdf.addPage([PAGE_W, PAGE_H]);
  let pageNum = 1;
  let cursorY = PAGE_H - MARGIN_TOP;

  function drawPageFooter(p, n) {
    p.drawText(`ASCEND 2026 — Parent Meeting Agenda  ·  page ${n}`, {
      x: MARGIN_X, y: 32,
      font: timesItalic, size: 8, color: SUBTLE,
    });
  }

  function newPage() {
    drawPageFooter(page, pageNum);
    page = pdf.addPage([PAGE_W, PAGE_H]);
    pageNum += 1;
    cursorY = PAGE_H - MARGIN_TOP;
  }

  function ensureRoom(needed) {
    if (cursorY - needed < PAGE_BOTTOM_LIMIT) newPage();
  }

  function wrap(text, font, size, maxWidth) {
    const words = String(text).split(/\s+/);
    const lines = [];
    let current = '';
    for (const word of words) {
      const probe = current ? current + ' ' + word : word;
      const w = font.widthOfTextAtSize(probe, size);
      if (w > maxWidth && current) {
        lines.push(current);
        current = word;
      } else {
        current = probe;
      }
    }
    if (current) lines.push(current);
    return lines;
  }

  function drawLinesAt(lines, x, startY, font, size, color, lineHeight) {
    let y = startY;
    for (const line of lines) {
      // Page break mid-paragraph if needed
      if (y < PAGE_BOTTOM_LIMIT + lineHeight) {
        drawPageFooter(page, pageNum);
        page = pdf.addPage([PAGE_W, PAGE_H]);
        pageNum += 1;
        y = PAGE_H - MARGIN_TOP;
      }
      page.drawText(line, { x, y, font, size, color });
      y -= lineHeight;
    }
    return y;
  }

  function paragraph(text, opts = {}) {
    const font = opts.font || helv;
    const size = opts.size ?? 10;
    const color = opts.color || INK;
    const lineHeight = opts.lineHeight ?? size * 1.35;
    const indent = opts.indent ?? 0;
    const x = MARGIN_X + indent;
    const maxWidth = CONTENT_W - indent;
    const lines = wrap(text, font, size, maxWidth);
    ensureRoom(lines.length * lineHeight);
    cursorY = drawLinesAt(lines, x, cursorY - size, font, size, color, lineHeight);
    cursorY -= opts.gap ?? 6;
  }

  function bigTitle(text, subtitle) {
    ensureRoom(50);
    page.drawText(text, {
      x: MARGIN_X, y: cursorY - 22,
      font: helvBold, size: 22, color: INK,
    });
    cursorY -= 28;
    if (subtitle) {
      page.drawText(subtitle, {
        x: MARGIN_X, y: cursorY - 11,
        font: helvOblique, size: 10.5, color: SUBTLE,
      });
      cursorY -= 16;
    }
    page.drawLine({
      start: { x: MARGIN_X, y: cursorY },
      end:   { x: MARGIN_X + CONTENT_W, y: cursorY },
      thickness: 1.0, color: GOLD,
    });
    cursorY -= 14;
  }

  function sectionHeading(num, text) {
    ensureRoom(28);
    const label = `${num}. ${text}`;
    page.drawText(label.toUpperCase(), {
      x: MARGIN_X, y: cursorY - 11,
      font: helvBold, size: 11, color: GOLD,
      characterSpacing: 0.8,
    });
    cursorY -= 15;
    page.drawLine({
      start: { x: MARGIN_X, y: cursorY },
      end:   { x: MARGIN_X + CONTENT_W, y: cursorY },
      thickness: 0.4, color: RULE,
    });
    cursorY -= 8;
  }

  function bullet(text, opts = {}) {
    const size = opts.size ?? 10;
    const lineHeight = size * 1.35;
    const lines = wrap(text, helv, size, CONTENT_W - 14);
    ensureRoom(lines.length * lineHeight + 2);
    // dot
    page.drawCircle({
      x: MARGIN_X + 4, y: cursorY - size + 3,
      size: 1.4, color: GOLD,
    });
    cursorY = drawLinesAt(lines, MARGIN_X + 14, cursorY - size, helv, size, INK, lineHeight);
    cursorY -= 3;
  }

  function keyValue(label, value, opts = {}) {
    const size = opts.size ?? 10;
    const labelW = opts.labelW ?? 70;
    const lineHeight = size * 1.35;
    const valueLines = wrap(value, helv, size, CONTENT_W - labelW - 6);
    ensureRoom(Math.max(lineHeight, valueLines.length * lineHeight) + 2);
    page.drawText(label, {
      x: MARGIN_X, y: cursorY - size,
      font: helvBold, size, color: INK,
    });
    cursorY = drawLinesAt(valueLines, MARGIN_X + labelW, cursorY - size, helv, size, INK, lineHeight);
    cursorY -= 3;
  }

  function checkboxItem(text, opts = {}) {
    const size = opts.size ?? 10;
    const lineHeight = size * 1.35;
    const lines = wrap(text, helv, size, CONTENT_W - 18);
    ensureRoom(lines.length * lineHeight + 4);
    // empty checkbox
    page.drawRectangle({
      x: MARGIN_X, y: cursorY - size - 1,
      width: 9, height: 9,
      borderColor: INK, borderWidth: 0.6, color: rgb(1, 1, 1),
    });
    cursorY = drawLinesAt(lines, MARGIN_X + 16, cursorY - size, helv, size, INK, lineHeight);
    cursorY -= 4;
  }

  function table(headers, rows, opts = {}) {
    const colWidths = opts.colWidths;
    const rowHeight = opts.rowHeight ?? 18;
    if (!colWidths || colWidths.length !== headers.length) {
      throw new Error('table requires colWidths to match headers length');
    }
    ensureRoom((rows.length + 1) * rowHeight + 4);
    // Header bg
    page.drawRectangle({
      x: MARGIN_X, y: cursorY - rowHeight,
      width: CONTENT_W, height: rowHeight,
      color: GOLD_SOFT,
    });
    let x = MARGIN_X;
    headers.forEach((h, i) => {
      page.drawText(h, {
        x: x + 6, y: cursorY - rowHeight + 5,
        font: helvBold, size: 10, color: INK,
      });
      x += colWidths[i];
    });
    page.drawLine({
      start: { x: MARGIN_X, y: cursorY }, end: { x: MARGIN_X + CONTENT_W, y: cursorY },
      thickness: 0.4, color: RULE,
    });
    page.drawLine({
      start: { x: MARGIN_X, y: cursorY - rowHeight }, end: { x: MARGIN_X + CONTENT_W, y: cursorY - rowHeight },
      thickness: 0.4, color: RULE,
    });
    cursorY -= rowHeight;
    rows.forEach((row) => {
      let xx = MARGIN_X;
      row.forEach((cell, i) => {
        const lines = wrap(cell, helv, 10, colWidths[i] - 12);
        drawLinesAt(lines, xx + 6, cursorY - 10, helv, 10, INK, 11);
        xx += colWidths[i];
      });
      cursorY -= rowHeight;
      page.drawLine({
        start: { x: MARGIN_X, y: cursorY }, end: { x: MARGIN_X + CONTENT_W, y: cursorY },
        thickness: 0.3, color: RULE,
      });
    });
    cursorY -= 8;
  }

  function calloutBox(title, body, opts = {}) {
    const padding = 14;
    const fontSizeBody = 10;
    const lineHeightBody = fontSizeBody * 1.4;
    const lines = wrap(body, helv, fontSizeBody, CONTENT_W - padding * 2);
    const height = padding + 16 + lines.length * lineHeightBody + padding - 4;
    ensureRoom(height + 10);
    page.drawRectangle({
      x: MARGIN_X, y: cursorY - height,
      width: CONTENT_W, height,
      color: opts.fill ?? SOFT_BLUE,
      borderColor: opts.border ?? DEEP_RED,
      borderWidth: opts.borderWidth ?? 0.8,
    });
    page.drawText(title.toUpperCase(), {
      x: MARGIN_X + padding, y: cursorY - padding - 8,
      font: helvBold, size: 10.5, color: opts.border ?? DEEP_RED,
      characterSpacing: 1,
    });
    drawLinesAt(
      lines,
      MARGIN_X + padding,
      cursorY - padding - 8 - 14,
      helv, fontSizeBody, INK, lineHeightBody,
    );
    cursorY -= height + 10;
  }

  // ====================================================================
  // CONTENT
  // ====================================================================
  bigTitle(
    'ASCEND 2026 — Parent Meeting Agenda',
    'Saturday, May 16 – Sunday, May 17, 2026  ·  St. Juan Diego Parish, Cowiche  ·  Diocese of Yakima',
  );
  paragraph(
    'Use this as a meeting script or a parent handout. Each section is a talking point with the answer baked in so the meeting moves quickly.',
    { font: helvOblique, color: SUBTLE, size: 9.5, gap: 12 },
  );

  // 1. Who's running the trip
  sectionHeading(1, "Who's running the trip");
  bullet('Gaby — trip lead and planner (point of contact before and after the trip; not a chaperone)');
  bullet('Deacon Enrique Alejandro Galeana — chaperone and driver; 24-hour emergency contact during the trip');
  bullet('Patricia Galeana — chaperone and driver (Deacon Enrique’s wife)');
  bullet('Alex — chaperone and secondary contact');
  bullet('Shayla — chaperone and driver');
  bullet('All adult chaperones have completed Diocese of Yakima Safe Environment training and a criminal background check, per the Bishop’s Charter for the Protection of Children and Young People.');
  cursorY -= 4;

  // 2. What ASCEND is
  sectionHeading(2, 'What ASCEND is');
  paragraph(
    'ASCEND is a one-day Eucharistic Revival gathering — part of the broader National Eucharistic Revival movement — at Meydenbauer Center in Bellevue. The day includes talks (Chris Stefanick, Dr. Andrew & Sarah Swafford, Dr. Tim Gray), extended Eucharistic Adoration with a Confession window, sacred music (Marie Miller, Floriani), and Holy Mass celebrated by Archbishop Paul Etienne.',
  );
  paragraph(
    'The retreat continues Sunday with a Traditional Latin Mass at North American Martyrs Parish (Edmonds), prayer at St. James Cathedral, and a fellowship afternoon in Seattle.',
    { gap: 10 },
  );

  // 3. When and where
  sectionHeading(3, 'When and where');
  keyValue('Meet-up',       'Saturday, May 16 · 3:45 AM at St. Juan Diego Catholic Church, 15800 Summitview Rd, Cowiche, WA 98923');
  keyValue('Depart',        '4:00 AM Saturday');
  keyValue('Saturday venue','Meydenbauer Center, 11100 NE 6th St, Bellevue');
  keyValue('Saturday lodging','La Quinta Inn Lynnwood, 4300 Alderwood Mall Blvd · (425) 775-7447');
  keyValue('Sunday Mass',   'North American Martyrs Parish, 9924 232nd St SW, Edmonds — 7:00 AM Traditional Latin Mass (FSSP)');
  keyValue('Sunday afternoon','Gas Works Park › St. James Cathedral › Pike Place Market & Seattle Waterfront');
  keyValue('Return',        'Sunday, May 17 at approximately 6:45 PM — drop-off back at St. Juan Diego Catholic Church, Cowiche');
  cursorY -= 6;

  // 4. Transportation
  sectionHeading(4, 'Transportation');
  paragraph(
    'Three private passenger vehicles drive together from Cowiche Saturday morning — ~290 miles round-trip via I-90 over Snoqualmie Pass, with a planned rest stop at the Pilot Travel Center in Ellensburg in both directions.',
  );
  table(
    ['Car', 'Driver', 'Notes'],
    [
      ['1', 'Deacon Enrique Alejandro Galeana', 'Minors on board'],
      ['2', 'Patricia Galeana', 'Minors on board'],
      ['3', 'Shayla', 'All passengers 18+'],
    ],
    { colWidths: [36, CONTENT_W - 36 - 130, 130] },
  );
  paragraph(
    'Each driver has completed a Diocese of Yakima Driver Information Sheet (Section V) with their license, vehicle, and insurance details on file. Minimum liability coverage per driver is $100,000 / $300,000, per diocesan policy. We follow the diocesan distance limits (no more than 250 consecutive miles per driver without a 30-minute break; daily max 500 miles per vehicle).',
    { gap: 10 },
  );

  // 5. Lodging & house rules
  sectionHeading(5, 'Lodging & house rules');
  bullet('La Quinta Inn Lynnwood, Saturday night only');
  bullet('Guys and girls in separate hotel rooms — no exceptions. Deacon Enrique and Patricia Galeana share a room (married-couple exception).');
  bullet('11:00 PM curfew Saturday night (early Mass Sunday)');
  bullet('No alcohol, tobacco, vaping, or drugs');
  bullet('Modest dress, especially for the Sunday Latin Mass: collared shirt + slacks for guys; modest dress or skirt past the knee with shoulders covered for girls');
  bullet('Phones away during group activities');
  bullet('Damages are the responsibility of the person who caused them');
  bullet('Any issues, text Gaby immediately');
  cursorY -= 4;

  // 6. Meals & cost
  sectionHeading(6, 'Meals & cost');
  paragraph('Covered by the group:', { font: helvBold, size: 10, gap: 2 });
  bullet('ASCEND registration');
  bullet('La Quinta hotel');
  bullet('Gas');
  bullet('Saturday lunch — Sizzle & Crunch (Bellevue)');
  bullet('Saturday dinner — Chick-fil-A Alderwood');
  bullet('Sunday breakfast — Kona Kitchen Lynnwood');
  cursorY -= 4;
  paragraph('On the attendee:', { font: helvBold, size: 10, gap: 2 });
  bullet('Sunday lunch — each small group picks a spot near Pike Place; budget ~$15–$25');
  bullet('(Optional) Saturday lunch upgrade — Din Tai Fung at Lincoln Square is across the street from Sizzle & Crunch. The group only covers Sizzle & Crunch; anyone who wants the splurge pays their own way.');
  bullet('Snacks at rest stops, ASCEND merch, collection-basket offerings');
  paragraph('Suggested personal spending money: $40–$60 per attendee.', { font: helvBold, size: 10, gap: 10 });

  // 7. Safety & supervision
  sectionHeading(7, 'Safety & supervision');
  bullet('Adult-to-attendee ratio: well above the minimums set by the Diocese of Yakima');
  bullet('Group travels together at all times; no solo excursions');
  bullet('Sunday Pike Place / waterfront free time is in three smaller chaperoned groups (Deacon Enrique Galeana group · Patricia Galeana group · Gaby/Shayla group)');
  bullet('A first-aid kit, attendee medical-release binder, and emergency contact list are with the lead chaperone at all times');
  bullet('Behavior expectations follow the diocesan Chaperone Guidelines (Section VIII)');
  bullet('Diocese of Yakima Safe Environment compliance for every adult');
  cursorY -= 4;

  // 8. Medical & emergency
  sectionHeading(8, 'Medical & emergency');
  bullet('Each minor’s parent/guardian completes the Diocese’s Parental/Guardian Consent Form (Section III), including the medical block: allergies, medications, last tetanus, special conditions, and the emergency-treatment consent');
  bullet('Each adult attendee completes the Adult Liability Waiver (Section II)');
  bullet('Bring a health insurance card (or a photo of it) to the trip');
  bullet('Bring all medications labeled in the carry bag, not checked luggage');
  bullet('Optional OTC medication permission (acetaminophen / ibuprofen / Benadryl / Tums / Dramamine / cough drops / Neosporin / electrolyte drink) — initial each one parents authorize');
  cursorY -= 4;
  calloutBox(
    'Emergency contact during the trip',
    'Gaby — (509) 823-9987 — available 24/7 during the trip. For a life-threatening emergency: call 911 first, then the group leaders. Secondary contacts: Alex (509) 306-0440 · Deacon Enrique Alejandro Galeana (509) 901-3126 · Hotel front desk (425) 775-7447.',
  );

  // 9. Required paperwork
  sectionHeading(9, 'Required paperwork — what every family must turn in');
  paragraph(
    'Distribute the Diocese of Yakima field trip packet (CM-Field-Trip-Packet-ENGLISH-2018.pdf) and the prefilled forms (ascend-2026-prefilled-diocesan-packet.pdf). Each family returns:',
    { gap: 4 },
  );
  checkboxItem('Section III — Parental/Guardian Consent Form (one per minor; one per vulnerable adult 18+ still in high school)');
  checkboxItem('Section II — Adult Liability Waiver (one per adult attendee / chaperone)');
  checkboxItem('Medical info filled in (Section III medical block)');
  checkboxItem('Signed Statement A or Statement B for OTC medication (one of two)');
  checkboxItem('Copy of health insurance card (or insurance carrier + policy # filled into the form)');
  cursorY -= 2;
  paragraph(
    'Already on file (parents don’t fill these out): Section V Driver Information Sheets — one per driver, filled out by the three drivers and held by the lead organizer. Section VIII Chaperone Acknowledgments — one per chaperone.',
    { font: helvOblique, size: 9.5, color: SUBTLE, gap: 8 },
  );
  paragraph(
    'Deadline to return signed forms: [DATE — suggest 1–2 weeks before departure].',
    { font: helvBold, size: 10.5, color: DEEP_RED, gap: 10 },
  );

  // 10. What attendees should bring
  sectionHeading(10, 'What attendees should bring');
  paragraph('Direct parents to the packing checklist on the site (hub.html) and the parent overview on parents.html. Highlights:', { gap: 4 });
  bullet('Comfortable clothes for Saturday (sitting through talks all day)');
  bullet('Sunday Mass attire (modest; see house rules)');
  bullet('A light jacket / layers — Bellevue and Seattle are cool in May');
  bullet('Water bottle, phone charger, portable battery');
  bullet('$40–$60 personal spending money');
  bullet('Overnight bag for one night');
  bullet('All medications in the carry bag, labeled');
  bullet('A rosary if they have one');
  cursorY -= 4;

  // 11. Likely questions
  sectionHeading(11, 'Likely parent questions (and the short answers)');
  function qa(q, a) {
    paragraph(q, { font: helvBold, size: 10, gap: 2 });
    paragraph(a, { gap: 6 });
  }
  qa('Why so early Saturday?', 'We arrive at Meydenbauer at 6:30 AM so we can be in Eucharistic Adoration and Confession from 7:00 AM before the program opens at 9:00.');
  qa('My child isn’t Catholic — can they still come?', 'Yes. ASCEND is open to everyone. During Mass, non-Catholics are invited forward for a blessing.');
  qa('What if my child has dietary restrictions?', 'Tell Gaby ahead of time. All meal stops (Sizzle & Crunch, Chick-fil-A, Kona Kitchen, anywhere they choose near Pike Place) have allergy-friendly options.');
  qa('What about Snoqualmie Pass?', 'We check WSDOT pass conditions the night before and adjust departure if needed. Mid-May is typically clear, but we always pad the schedule.');
  qa('Can my child bring their own car?', 'No. The group travels together in the three pre-vetted vehicles.');
  qa('Can my child be picked up early?', 'Only by a parent/guardian or an adult listed on the Section III "Authorized Early Pickup" line, coordinated with Gaby in advance by phone.');
  qa('What if there’s a financial hardship?', 'Talk to Gaby — money is never the reason someone misses this trip.');
  cursorY -= 4;

  // --- Meeting close
  sectionHeading('Close', 'Confirm before parents leave');
  checkboxItem('Every family has the diocesan packet + prefilled forms');
  checkboxItem('Every parent has Gaby’s phone number saved');
  checkboxItem('Forms are due by [DATE]');
  checkboxItem('Parents know how to reach the chaperones during the trip');
  checkboxItem('Sunday-evening drop-off plan is clear (~6:45 PM, St. Juan Diego in Cowiche)');
  checkboxItem('Photo release / Safe Environment language has been signed if the diocese requires it separately');

  // Final page footer
  drawPageFooter(page, pageNum);

  const outPath = path.join(__dirname, 'ascend-2026-parent-meeting-agenda.pdf');
  fs.writeFileSync(outPath, await pdf.save());
  console.log('Wrote ' + outPath + ` (${pageNum} page${pageNum > 1 ? 's' : ''})`);
})().catch((err) => {
  console.error('Failed:', err);
  process.exit(1);
});
