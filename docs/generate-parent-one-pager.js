/*
 * Renders the parent one-pager to a single US Letter PDF page using pdf-lib.
 *
 * Output: docs/ascend-2026-parent-one-pager.pdf
 *
 * Run:   NODE_PATH=$(npm root -g) node generate-parent-one-pager.js
 */

const fs = require('fs');
const path = require('path');
const { PDFDocument, StandardFonts, rgb } = require('pdf-lib');

// --- Page geometry ---------------------------------------------------------
const PAGE_W = 612;
const PAGE_H = 792;
const MARGIN_X = 48;          // ~0.67"
const MARGIN_TOP = 48;
const MARGIN_BOTTOM = 40;
const CONTENT_W = PAGE_W - 2 * MARGIN_X;

// --- Palette ---------------------------------------------------------------
const INK = rgb(0.08, 0.10, 0.16);
const GOLD = rgb(0.55, 0.42, 0.10);
const RULE = rgb(0.78, 0.78, 0.78);
const SOFT_GOLD = rgb(0.97, 0.94, 0.85);
const SOFT_BLUE = rgb(0.92, 0.95, 0.99);
const DEEP_RED = rgb(0.55, 0.10, 0.10);

(async () => {
  const pdf = await PDFDocument.create();
  const page = pdf.addPage([PAGE_W, PAGE_H]);
  const helv = await pdf.embedFont(StandardFonts.Helvetica);
  const helvBold = await pdf.embedFont(StandardFonts.HelveticaBold);
  const helvOblique = await pdf.embedFont(StandardFonts.HelveticaOblique);
  const timesItalic = await pdf.embedFont(StandardFonts.TimesRomanItalic);
  const times = await pdf.embedFont(StandardFonts.TimesRoman);

  let cursorY = PAGE_H - MARGIN_TOP;

  // Word-wrap helper: returns array of lines for the given text + font + size + maxWidth.
  function wrap(text, font, size, maxWidth) {
    const words = text.split(/\s+/);
    const lines = [];
    let current = '';
    for (const word of words) {
      const probe = current ? current + ' ' + word : word;
      const width = font.widthOfTextAtSize(probe, size);
      if (width > maxWidth && current) {
        lines.push(current);
        current = word;
      } else {
        current = probe;
      }
    }
    if (current) lines.push(current);
    return lines;
  }

  function drawLines(lines, x, y, font, size, color, lineHeight) {
    lines.forEach((line, i) => {
      page.drawText(line, {
        x, y: y - i * lineHeight,
        font, size, color,
      });
    });
    return y - lines.length * lineHeight;
  }

  function paragraph(text, opts = {}) {
    const font = opts.font || helv;
    const size = opts.size || 9;
    const color = opts.color || INK;
    const lineHeight = opts.lineHeight || size * 1.30;
    const x = opts.x ?? MARGIN_X;
    const maxWidth = opts.maxWidth ?? CONTENT_W;
    const lines = wrap(text, font, size, maxWidth);
    cursorY = drawLines(lines, x, cursorY, font, size, color, lineHeight);
    cursorY -= opts.gap ?? 6;
  }

  function heading(text, opts = {}) {
    const size = opts.size || 10.5;
    const color = opts.color || GOLD;
    page.drawText(text.toUpperCase(), {
      x: MARGIN_X, y: cursorY - size,
      font: helvBold, size,
      color,
      ...(opts.charSpacing ? { characterSpacing: opts.charSpacing } : {}),
    });
    cursorY -= size + 4;
    // Optional thin rule under heading
    page.drawLine({
      start: { x: MARGIN_X, y: cursorY },
      end:   { x: MARGIN_X + CONTENT_W, y: cursorY },
      thickness: 0.4, color: RULE,
    });
    cursorY -= 6;
  }

  // --- Title block ---
  page.drawText('ASCEND 2026 — Parent Handout', {
    x: MARGIN_X, y: cursorY - 18,
    font: helvBold, size: 18, color: INK,
  });
  cursorY -= 22;
  page.drawText('Saturday, May 16 – Sunday, May 17, 2026', {
    x: MARGIN_X, y: cursorY - 10,
    font: helv, size: 10, color: INK,
  });
  page.drawText('St. Juan Diego Parish, Cowiche  ·  Diocese of Yakima', {
    x: MARGIN_X, y: cursorY - 22,
    font: helvOblique, size: 9, color: rgb(0.40, 0.40, 0.45),
  });
  cursorY -= 36;
  page.drawLine({
    start: { x: MARGIN_X, y: cursorY },
    end:   { x: MARGIN_X + CONTENT_W, y: cursorY },
    thickness: 0.8, color: GOLD,
  });
  cursorY -= 14;

  // --- When & where ---
  heading('When & where');
  const whenRows = [
    ['Meet',    '3:45 AM Saturday at St. Juan Diego Catholic Church, 15800 Summitview Rd, Cowiche'],
    ['Depart',  '4:00 AM Saturday'],
    ['Return',  '~6:45 PM Sunday — drop-off at St. Juan Diego, Cowiche'],
    ['Hotel',   'La Quinta Inn Lynnwood, 4300 Alderwood Mall Blvd · (425) 775-7447'],
  ];
  const labelColW = 50;
  whenRows.forEach(([label, value]) => {
    page.drawText(label, {
      x: MARGIN_X, y: cursorY - 9,
      font: helvBold, size: 9, color: INK,
    });
    const valLines = wrap(value, helv, 9, CONTENT_W - labelColW - 6);
    cursorY = drawLines(valLines, MARGIN_X + labelColW, cursorY, helv, 9, INK, 11);
    cursorY -= 2;
  });
  cursorY -= 8;

  // --- Who is supervising ---
  heading('Who is supervising');
  paragraph('Gaby (lead), Deacon Enrique Alejandro Galeana and his wife Patricia Galeana, Alex, and Shayla. All chaperones have completed Diocese of Yakima Safe Environment training and a background check.', { gap: 8 });

  // --- Transportation table ---
  heading('Transportation');
  paragraph('Three private passenger vehicles drive together from Cowiche — ~290 miles round-trip via I-90 / Snoqualmie Pass, rest stop in Ellensburg.', { gap: 6 });
  // Table
  const tCols = [38, CONTENT_W - 38 - 88, 88];
  const tBorderColor = RULE;
  function tableRow(cells, opts = {}) {
    const rowHeight = opts.height || 16;
    const isHeader = opts.header;
    if (isHeader) {
      page.drawRectangle({
        x: MARGIN_X, y: cursorY - rowHeight, width: CONTENT_W, height: rowHeight,
        color: SOFT_GOLD,
      });
    }
    let x = MARGIN_X;
    cells.forEach((cell, i) => {
      page.drawText(cell, {
        x: x + 5, y: cursorY - rowHeight + 4,
        font: isHeader ? helvBold : helv,
        size: 9, color: INK,
      });
      x += tCols[i];
    });
    page.drawLine({
      start: { x: MARGIN_X, y: cursorY - rowHeight },
      end:   { x: MARGIN_X + CONTENT_W, y: cursorY - rowHeight },
      thickness: 0.4, color: tBorderColor,
    });
    cursorY -= rowHeight;
  }
  page.drawLine({
    start: { x: MARGIN_X, y: cursorY },
    end:   { x: MARGIN_X + CONTENT_W, y: cursorY },
    thickness: 0.4, color: tBorderColor,
  });
  tableRow(['Car', 'Driver', 'Riders'], { header: true });
  tableRow(['1', 'Deacon Enrique Alejandro Galeana', 'Minors']);
  tableRow(['2', 'Patricia Galeana', 'Minors']);
  tableRow(['3', 'Shayla', 'All 18+']);
  cursorY -= 10;

  // --- Cost ---
  heading('Cost');
  paragraph('Covered by the group: ASCEND registration · hotel · gas · Saturday lunch (Sizzle & Crunch) · Saturday dinner (Chick-fil-A) · Sunday breakfast (Kona Kitchen).', { gap: 3 });
  paragraph('On the attendee: Sunday lunch near Pike Place (~$15–$25), snacks, merch, offerings. Suggested personal spending money: $40–$60.', { gap: 8 });

  // --- House rules ---
  heading('House rules');
  paragraph('Guys and girls in separate hotel rooms — no exceptions  ·  11:00 PM curfew Saturday  ·  no alcohol / tobacco / vaping / drugs  ·  modest dress (especially Sunday Latin Mass)  ·  phones away during group activities  ·  group travels together at all times.', { gap: 8 });

  // --- Pack list ---
  heading('Pack list');
  paragraph('Comfortable clothes for Saturday · Sunday Mass attire (modest) · light jacket / layers · water bottle · phone charger + portable battery · $40–$60 spending money · overnight bag · all medications labeled, in carry bag (not checked) · health insurance card · signed consent forms · rosary.', { gap: 8 });

  // --- Forms to return ---
  heading('Forms to return — one of each per family');
  const formItems = [
    'Parental/Guardian Consent Form (Diocese Form III) — each minor, plus any 18+ still in high school',
    'Adult Liability Waiver (Diocese Form II) — each adult attendee',
    'Medical block fully filled in (allergies, meds, emergency contact, insurance)',
    'Signed OTC medication permission (Statement A or B)',
  ];
  formItems.forEach((item) => {
    // checkbox
    page.drawRectangle({
      x: MARGIN_X, y: cursorY - 9, width: 8, height: 8,
      borderColor: INK, borderWidth: 0.5, color: rgb(1, 1, 1),
    });
    const lines = wrap(item, helv, 9, CONTENT_W - 16);
    cursorY = drawLines(lines, MARGIN_X + 14, cursorY, helv, 9, INK, 11);
    cursorY -= 2;
  });
  paragraph('Forms are due by [DEADLINE]. Return to Gaby.', {
    font: helvOblique, size: 8.5, color: rgb(0.40, 0.40, 0.45), gap: 10,
  });

  // --- Emergency block (distinct, near the bottom) ---
  const emergencyHeight = 60;
  page.drawRectangle({
    x: MARGIN_X, y: cursorY - emergencyHeight,
    width: CONTENT_W, height: emergencyHeight,
    color: SOFT_BLUE,
    borderColor: DEEP_RED, borderWidth: 0.8,
  });
  page.drawText('IN CASE OF EMERGENCY', {
    x: MARGIN_X + 12, y: cursorY - 14,
    font: helvBold, size: 10, color: DEEP_RED,
    characterSpacing: 1,
  });
  page.drawText('Call or text Gaby first: (509) 823-9987 — 24/7 during the trip.', {
    x: MARGIN_X + 12, y: cursorY - 28,
    font: helvBold, size: 10, color: INK,
  });
  const secondaryLines = wrap(
    'Also reachable: Alex (509) 306-0440  ·  Deacon Enrique Alejandro Galeana (509) 901-3126  ·  Hotel desk (425) 775-7447. For life-threatening emergency: call 911 first, then the group leaders.',
    helv, 8.5, CONTENT_W - 24,
  );
  drawLines(secondaryLines, MARGIN_X + 12, cursorY - 40, helv, 8.5, INK, 10);
  cursorY -= emergencyHeight + 8;

  // --- Footer ---
  page.drawText('Full itinerary, packing checklist, and live timeline at sjdyoungadults.com', {
    x: MARGIN_X, y: MARGIN_BOTTOM - 6,
    font: timesItalic, size: 8, color: rgb(0.50, 0.50, 0.55),
  });

  const outPath = path.join(__dirname, 'ascend-2026-parent-one-pager.pdf');
  fs.writeFileSync(outPath, await pdf.save());
  console.log('Wrote ' + outPath);
})().catch((err) => {
  console.error('Failed:', err);
  process.exit(1);
});
