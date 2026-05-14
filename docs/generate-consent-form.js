/*
 * Loads the Diocese of Yakima / Catholic Mutual Group field-trip packet
 * (docs/CM-Field-Trip-Packet-ENGLISH-2018.pdf), uses pdfjs-dist to extract
 * the exact position of each form label, and uses pdf-lib to overlay our
 * trip-specific prefill values directly next to each label.
 *
 * The diocesan PDF content is not modified — text is drawn on top so the
 * form looks exactly like the diocese's template, just with our values
 * filled in.
 *
 * Pages prefilled:
 *   - Page 4: II. Adult Liability Waiver  (parish + diocese)
 *   - Page 5: III. Parental/Guardian Consent Form  (parish + diocese +
 *            type/date/destination/lead/depart-return/transportation)
 *   - Page 6: III continued — Other Medical Treatment paragraph (diocese)
 *   - Page 8: V. Driver Information Sheet (×3, one per car — driver name)
 *
 * Output: docs/ascend-2026-prefilled-diocesan-packet.pdf
 *
 * Run:   NODE_PATH=$(npm root -g) node generate-consent-form.js
 */

const fs = require('fs');
const path = require('path');

// --- Prefill values --------------------------------------------------------
const PARISH = 'St. Juan Diego Parish';
const DIOCESE = 'Yakima';
const TYPE_OF_EVENT = 'Overnight youth retreat — ASCEND 2026 Eucharistic Revival';
const DATE_OF_EVENT = 'Saturday, May 16, 2026 – Sunday, May 17, 2026';
const DESTINATION = 'Bellevue, Lynnwood, Edmonds, and Seattle, WA — see itinerary';
const INDIVIDUAL_IN_CHARGE = 'Deacon Enrique Alejandro Galeana — (509) 901-3126';
const DEPART_RETURN = 'Depart 4:00 AM Sat May 16 / Return ~6:45 PM Sun May 17';
// Only minor-carrying vehicles are listed for the parental consent form —
// Car 3 carries only adults (18+) and is on the separate Driver Info Sheet.
const TRANSPORT = 'Two (2) private passenger vehicles: Car 1 (Deacon Enrique Alejandro Galeana) + Car 2 (Patricia Galeana). See attached Driver Information Sheets.';

const DRIVERS = [
  { car: 'Car 1', name: 'Deacon Enrique Alejandro Galeana' },
  { car: 'Car 2', name: 'Patricia Galeana' },
  { car: 'Car 3', name: 'Shayla' },
];

const FONT_SIZE = 9;

// --- Main ------------------------------------------------------------------
(async () => {
  const { PDFDocument, StandardFonts, rgb } = require('pdf-lib');
  // pdfjs-dist v5 is ESM-only and installed in a global NODE_PATH that ESM
  // resolution doesn't honor — use a file:// URL to import it directly.
  const url = require('url');
  const pdfjsPath = path.join(
    require.resolve('pdf-lib'), '..', '..', '..', 'pdfjs-dist', 'legacy', 'build', 'pdf.mjs'
  );
  const pdfjsLib = await import(url.pathToFileURL(pdfjsPath).href);

  const inPath = path.join(__dirname, 'CM-Field-Trip-Packet-ENGLISH-2018.pdf');
  const outPath = path.join(__dirname, 'ascend-2026-prefilled-diocesan-packet.pdf');
  const buffer = fs.readFileSync(inPath);

  // --- pdfjs-dist: extract text positions per page ---
  const pdfjsDoc = await pdfjsLib.getDocument({
    data: new Uint8Array(buffer),
    useSystemFonts: true,
  }).promise;

  const pageCache = {};
  async function getItems(pageNum /* 1-indexed */) {
    if (!pageCache[pageNum]) {
      const page = await pdfjsDoc.getPage(pageNum);
      const tc = await page.getTextContent();
      pageCache[pageNum] = tc.items.map((item) => ({
        str: item.str,
        x: item.transform[4],
        y: item.transform[5],
        width: item.width,
        height: item.height,
      }));
    }
    return pageCache[pageNum];
  }

  // Find first text item whose str matches (string substring or regex)
  function findFirst(items, pattern) {
    if (typeof pattern === 'string') {
      return items.find((i) => i.str.includes(pattern));
    }
    return items.find((i) => pattern.test(i.str));
  }
  // Find all items whose str matches
  function findAll(items, pattern) {
    if (typeof pattern === 'string') {
      return items.filter((i) => i.str.includes(pattern));
    }
    return items.filter((i) => pattern.test(i.str));
  }

  // --- pdf-lib: load PDF for overlay ---
  const pdfDoc = await PDFDocument.load(buffer);
  const helv = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const helvBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  const PREFILL_COLOR = rgb(0.0, 0.0, 0.55); // dark blue

  function drawAt(page, x, y, text, opts = {}) {
    page.drawText(text, {
      x, y,
      size: opts.size ?? FONT_SIZE,
      font: opts.font ?? helv,
      color: opts.color ?? PREFILL_COLOR,
      maxWidth: opts.maxWidth,
      lineHeight: (opts.size ?? FONT_SIZE) * 1.15,
    });
  }

  // ====================================================================
  // PAGE 5 — Form III, Parental/Guardian Consent Form
  // ====================================================================
  const p5 = await getItems(5);
  const p5page = pdfDoc.getPages()[4];

  // For each "Label:" → place value right after the label
  const fieldsAfterColon = [
    ['Type of event:',                              TYPE_OF_EVENT],
    ['Date of event:',                              DATE_OF_EVENT],
    ['Destination of event:',                       DESTINATION],
    ['Individual in charge:',                       INDIVIDUAL_IN_CHARGE],
    ['Estimated time of departure and return:',     DEPART_RETURN],
    ['Mode of transportation to and from event:',   TRANSPORT],
  ];
  for (const [label, value] of fieldsAfterColon) {
    const item = findFirst(p5, label);
    if (!item) { console.warn('  ! not found on page 5:', label); continue; }
    drawAt(p5page, item.x + item.width + 4, item.y, value, { maxWidth: 612 - item.x - item.width - 30 });
    console.log(`  P5 "${label}" → x=${(item.x + item.width + 4).toFixed(1)} y=${item.y.toFixed(1)}`);
  }

  // "Name of parish" centered label is BELOW the underline blank.
  // Place PARISH ABOVE the label (on the underline).
  {
    const lbl = findFirst(p5, 'Name of parish');
    if (lbl) {
      drawAt(p5page, lbl.x, lbl.y + 12, PARISH);
      console.log(`  P5 "Name of parish" → x=${lbl.x.toFixed(1)} y=${(lbl.y + 12).toFixed(1)}`);
    } else {
      console.warn('  ! not found on page 5: Name of parish');
    }
  }

  // Inline hold-harmless blanks:
  // (1) "...hold harmless and defend ___ , its officers..."
  // (2) "...and the Arch/Diocese of ___ , its employees and agents, chaperons..."
  // (3) "...Arch/Diocese of ___, its employees and agents and chaperons..."
  // Find anchors and place values just after each anchor.
  {
    const defend = findFirst(p5, 'harmless and defend');
    if (defend) {
      drawAt(p5page, defend.x + defend.width + 4, defend.y, PARISH);
      console.log(`  P5 "harmless and defend" → x=${(defend.x + defend.width + 4).toFixed(1)} y=${defend.y.toFixed(1)}`);
    } else {
      console.warn('  ! not found on page 5: harmless and defend');
    }

    const arches = findAll(p5, /Arch\/Diocese of/);
    arches.forEach((item, i) => {
      drawAt(p5page, item.x + item.width + 4, item.y, DIOCESE);
      console.log(`  P5 "Arch/Diocese of" (${i + 1}/${arches.length}) → x=${(item.x + item.width + 4).toFixed(1)} y=${item.y.toFixed(1)}`);
    });
  }

  // ====================================================================
  // PAGE 4 — Form II, Adult Liability Waiver
  // ====================================================================
  const p4 = await getItems(4);
  const p4page = pdfDoc.getPages()[3];

  // "Parish/School" and "(Arch) Diocese" labels are BELOW their respective
  // blanks — place values above each label.
  {
    const parishLbl = findFirst(p4, 'Parish/School');
    if (parishLbl) {
      drawAt(p4page, parishLbl.x, parishLbl.y + 12, PARISH);
      console.log(`  P4 "Parish/School" → x=${parishLbl.x.toFixed(1)} y=${(parishLbl.y + 12).toFixed(1)}`);
    } else { console.warn('  ! not found on page 4: Parish/School'); }

    const archLbl = findFirst(p4, '(Arch) Diocese');
    if (archLbl) {
      drawAt(p4page, archLbl.x, archLbl.y + 12, DIOCESE);
      console.log(`  P4 "(Arch) Diocese" → x=${archLbl.x.toFixed(1)} y=${(archLbl.y + 12).toFixed(1)}`);
    } else { console.warn('  ! not found on page 4: (Arch) Diocese'); }
  }

  // ====================================================================
  // PAGE 6 — Form III continued (Other Medical Treatment)
  // ====================================================================
  const p6 = await getItems(6);
  const p6page = pdfDoc.getPages()[5];
  {
    const arch = findFirst(p6, /Arch\/Diocese of/);
    if (arch) {
      drawAt(p6page, arch.x + arch.width + 4, arch.y, DIOCESE);
      console.log(`  P6 "Arch/Diocese of" → x=${(arch.x + arch.width + 4).toFixed(1)} y=${arch.y.toFixed(1)}`);
    } else { console.warn('  ! not found on page 6: Arch/Diocese of'); }
  }

  // ====================================================================
  // PAGE 8 — Form V, Driver Information Sheet (×3 copies)
  // ====================================================================
  // Duplicate page 8 twice so we have three sheets total.
  const [dupA, dupB] = await pdfDoc.copyPages(pdfDoc, [7, 7]);
  pdfDoc.insertPage(8, dupA);
  pdfDoc.insertPage(9, dupB);

  const p8 = await getItems(8);
  // Find the "Driver" label (the top-left label on the driver info sheet).
  // pdfjs may return it as just "Driver" or as part of a larger string.
  const driverLabel = p8.find((i) => /^\s*Driver\s*$/.test(i.str))
    || findFirst(p8, 'Driver');

  if (driverLabel) {
    const pagesAfterInsert = pdfDoc.getPages();
    DRIVERS.forEach((driver, idx) => {
      const page = pagesAfterInsert[7 + idx];
      drawAt(page, driverLabel.x + driverLabel.width + 8, driverLabel.y, driver.name);
      // Small "Car N" tag in the upper-right of each duplicate
      page.drawText(driver.car, {
        x: 470, y: 720, size: 13,
        font: helvBold, color: rgb(0.6, 0, 0),
      });
      console.log(`  P${8 + idx} Driver "${driver.name}" (${driver.car}) → x=${(driverLabel.x + driverLabel.width + 8).toFixed(1)} y=${driverLabel.y.toFixed(1)}`);
    });
  } else {
    console.warn('  ! not found on page 8: Driver');
  }

  // --- Save ---
  const outBytes = await pdfDoc.save();
  fs.writeFileSync(outPath, outBytes);
  console.log('Wrote ' + outPath);
})().catch((err) => {
  console.error('Failed:', err);
  process.exit(1);
});
