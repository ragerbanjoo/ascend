/*
 * Generates the ASCEND 2026 Parent/Guardian Consent & Release (draft for
 * Diocese of Yakima review). Outputs ascend-2026-parent-consent-form.docx
 * next to this file.
 *
 * Run:   NODE_PATH=$(npm root -g) node generate-consent-form.js
 */

const fs = require('fs');
const path = require('path');
const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  AlignmentType, PageOrientation, LevelFormat, HeadingLevel,
  BorderStyle, WidthType, ShadingType, TabStopType, TabStopPosition,
} = require('docx');

// --- Page geometry ---------------------------------------------------------
const PAGE_W = 12240;        // US Letter width (DXA)
const PAGE_H = 15840;        // US Letter height (DXA)
const MARGIN = 1440;         // 1 inch
const CONTENT = PAGE_W - 2 * MARGIN; // 9360

// --- Borders ---------------------------------------------------------------
const LINE   = { style: BorderStyle.SINGLE, size: 6, color: '555555' };
const THIN   = { style: BorderStyle.SINGLE, size: 4, color: '888888' };
const NONE   = { style: BorderStyle.NONE,   size: 0, color: 'FFFFFF' };

const allNone    = { top: NONE, bottom: NONE, left: NONE, right: NONE };
const allThin    = { top: THIN, bottom: THIN, left: THIN, right: THIN };
const bottomOnly = { top: NONE, bottom: LINE, left: NONE, right: NONE };

// --- Small helpers ---------------------------------------------------------
const t = (text, opts = {}) => new TextRun({ text, ...opts });

const p = (text, opts = {}) => new Paragraph({
  spacing: { after: opts.after ?? 120, before: opts.before ?? 0, line: 300 },
  alignment: opts.alignment,
  children: [new TextRun({ text, bold: opts.bold, italics: opts.italics, size: opts.size ?? 22 })],
});

const blank = () => new Paragraph({ spacing: { after: 80 }, children: [new TextRun('')] });

const h1 = (text) => new Paragraph({
  heading: HeadingLevel.HEADING_1,
  spacing: { before: 0, after: 60 },
  alignment: AlignmentType.CENTER,
  children: [new TextRun({ text, bold: true, size: 36 })],
});

const h2 = (text) => new Paragraph({
  heading: HeadingLevel.HEADING_2,
  spacing: { before: 320, after: 140 },
  children: [new TextRun({ text, bold: true, size: 26 })],
});

const h3 = (text) => new Paragraph({
  spacing: { before: 180, after: 80 },
  children: [new TextRun({ text, bold: true, size: 22 })],
});

const bullet = (children, opts = {}) => new Paragraph({
  numbering: { reference: 'bullets', level: opts.level ?? 0 },
  spacing: { after: 60, line: 280 },
  children: Array.isArray(children)
    ? children
    : [new TextRun({ text: String(children), size: 22 })],
});

const para = (runs, opts = {}) => new Paragraph({
  spacing: { after: opts.after ?? 140, line: 300 },
  alignment: opts.alignment,
  children: runs,
});

// A "fillable label: ____________________" row inside a single-cell table
// Label is bold on left; the rest of the cell has a bottom border to draw the line.
function labeledLine(label, { labelWidth = 2400, value = '' } = {}) {
  const valWidth = CONTENT - labelWidth;
  return new Table({
    width: { size: CONTENT, type: WidthType.DXA },
    columnWidths: [labelWidth, valWidth],
    rows: [new TableRow({
      children: [
        new TableCell({
          borders: allNone,
          width: { size: labelWidth, type: WidthType.DXA },
          margins: { top: 80, bottom: 40, left: 0, right: 120 },
          children: [new Paragraph({ children: [new TextRun({ text: label, bold: true, size: 20 })] })],
        }),
        new TableCell({
          borders: bottomOnly,
          width: { size: valWidth, type: WidthType.DXA },
          margins: { top: 80, bottom: 40, left: 60, right: 0 },
          children: [new Paragraph({ children: [new TextRun({ text: value, size: 20 })] })],
        }),
      ],
    })],
  });
}

// Two labeled lines side-by-side on one row
function twoUpRow(leftLabel, rightLabel, opts = {}) {
  const half = CONTENT / 2;
  const labelW = opts.labelWidth ?? 1400;
  const valW = half - labelW - 120; // 120 DXA gap between pairs
  const gap = 240;

  function pair(label, widthLabel, widthValue) {
    return [
      new TableCell({
        borders: allNone,
        width: { size: widthLabel, type: WidthType.DXA },
        margins: { top: 80, bottom: 40, left: 0, right: 60 },
        children: [new Paragraph({ children: [new TextRun({ text: label, bold: true, size: 20 })] })],
      }),
      new TableCell({
        borders: bottomOnly,
        width: { size: widthValue, type: WidthType.DXA },
        margins: { top: 80, bottom: 40, left: 40, right: 0 },
        children: [new Paragraph({ children: [new TextRun({ text: '', size: 20 })] })],
      }),
    ];
  }
  // columns: labelL, valueL, gap, labelR, valueR
  const cols = [labelW, valW, gap, labelW, half - labelW - gap];
  const total = cols.reduce((a, b) => a + b, 0);
  const gapCell = new TableCell({
    borders: allNone,
    width: { size: gap, type: WidthType.DXA },
    margins: { top: 0, bottom: 0, left: 0, right: 0 },
    children: [new Paragraph('')],
  });
  return new Table({
    width: { size: total, type: WidthType.DXA },
    columnWidths: cols,
    rows: [new TableRow({
      children: [
        ...pair(leftLabel, cols[0], cols[1]),
        gapCell,
        ...pair(rightLabel, cols[3], cols[4]),
      ],
    })],
  });
}

// Blank writing space (N blank lines)
function blankLines(n = 2) {
  const rows = [];
  for (let i = 0; i < n; i++) {
    rows.push(new TableRow({
      children: [new TableCell({
        borders: { top: NONE, bottom: LINE, left: NONE, right: NONE },
        width: { size: CONTENT, type: WidthType.DXA },
        margins: { top: 180, bottom: 60, left: 0, right: 0 },
        children: [new Paragraph('')],
      })],
    }));
  }
  return new Table({
    width: { size: CONTENT, type: WidthType.DXA },
    columnWidths: [CONTENT],
    rows,
  });
}

// Table for emergency contacts / authorized pickup — N rows of (Name / Relationship / Phone)
function threeColTable(headerCells, rowCount) {
  const cols = [3800, 2400, 3160];
  const header = new TableRow({
    tableHeader: true,
    children: headerCells.map((h, i) => new TableCell({
      borders: allThin,
      width: { size: cols[i], type: WidthType.DXA },
      shading: { fill: 'EEEEEE', type: ShadingType.CLEAR },
      margins: { top: 80, bottom: 80, left: 120, right: 120 },
      children: [new Paragraph({ children: [new TextRun({ text: h, bold: true, size: 20 })] })],
    })),
  });
  const rows = [header];
  for (let i = 0; i < rowCount; i++) {
    rows.push(new TableRow({
      children: cols.map((w) => new TableCell({
        borders: allThin,
        width: { size: w, type: WidthType.DXA },
        margins: { top: 160, bottom: 160, left: 120, right: 120 },
        children: [new Paragraph('')],
      })),
    }));
  }
  return new Table({
    width: { size: CONTENT, type: WidthType.DXA },
    columnWidths: cols,
    rows,
  });
}

// Signature block: Signature / Printed Name / Date
function signatureRow(label) {
  const cols = [4200, 3300, 1860];
  const underlineCell = (w) => new TableCell({
    borders: bottomOnly,
    width: { size: w, type: WidthType.DXA },
    margins: { top: 280, bottom: 20, left: 0, right: 60 },
    children: [new Paragraph('')],
  });
  const labelCell = (text, w) => new TableCell({
    borders: allNone,
    width: { size: w, type: WidthType.DXA },
    margins: { top: 40, bottom: 120, left: 0, right: 60 },
    children: [new Paragraph({ children: [new TextRun({ text, size: 18, italics: true, color: '555555' })] })],
  });
  return [
    new Paragraph({
      spacing: { before: 120, after: 40 },
      children: [new TextRun({ text: label, bold: true, size: 22 })],
    }),
    new Table({
      width: { size: CONTENT, type: WidthType.DXA },
      columnWidths: cols,
      rows: [
        new TableRow({ children: cols.map((w) => underlineCell(w)) }),
        new TableRow({
          children: [labelCell('Signature', cols[0]), labelCell('Printed name', cols[1]), labelCell('Date', cols[2])],
        }),
      ],
    }),
  ];
}

// Initial-line item: "____  <text>"  (for OTC / photo opt-in lists)
function initialItem(text) {
  return new Paragraph({
    spacing: { after: 80, line: 280 },
    indent: { left: 360 },
    children: [
      new TextRun({ text: '_______  ', size: 22 }),
      new TextRun({ text, size: 22 }),
    ],
  });
}

// Checkbox-style item using an open square (not a bullet)
function checkItem(text) {
  return new Paragraph({
    spacing: { after: 80, line: 280 },
    indent: { left: 360 },
    children: [
      new TextRun({ text: '☐  ', size: 24 }),
      new TextRun({ text, size: 22 }),
    ],
  });
}

// Notice / callout box
function noticeBox(title, bodyText) {
  return new Table({
    width: { size: CONTENT, type: WidthType.DXA },
    columnWidths: [CONTENT],
    rows: [new TableRow({
      children: [new TableCell({
        borders: allThin,
        width: { size: CONTENT, type: WidthType.DXA },
        shading: { fill: 'FFF7E6', type: ShadingType.CLEAR },
        margins: { top: 160, bottom: 160, left: 200, right: 200 },
        children: [
          new Paragraph({
            spacing: { after: 60 },
            children: [new TextRun({ text: title, bold: true, size: 22 })],
          }),
          new Paragraph({
            spacing: { after: 0, line: 280 },
            children: [new TextRun({ text: bodyText, size: 20 })],
          }),
        ],
      })],
    })],
  });
}

// ---------------------------------------------------------------------------
// Document body
// ---------------------------------------------------------------------------
const children = [];

// --- Title block ---
children.push(h1('Parent/Guardian Consent & Release'));
children.push(new Paragraph({
  alignment: AlignmentType.CENTER,
  spacing: { after: 40 },
  children: [new TextRun({ text: 'ASCEND 2026 Retreat', bold: true, size: 28 })],
}));
children.push(new Paragraph({
  alignment: AlignmentType.CENTER,
  spacing: { after: 40 },
  children: [new TextRun({ text: 'St. Juan Diego Young Adult Group  ·  Diocese of Yakima', size: 22 })],
}));
children.push(new Paragraph({
  alignment: AlignmentType.CENTER,
  spacing: { after: 200 },
  children: [new TextRun({ text: 'May 16–17, 2026  ·  Bellevue & Seattle, WA', size: 22, italics: true })],
}));

children.push(noticeBox(
  'Instructions',
  'Required for every participant under 18. Please complete every section and return to Gaby before departure. ' +
  'This document is a draft pending review by the Diocese of Yakima Office of Youth Ministry, Office of Safe Environment, ' +
  'and diocesan legal counsel. Final wording for liability release, photo release, emergency medical consent, and Safe ' +
  'Environment acknowledgment will follow diocesan requirements.'
));

// --- 1. Event information --------------------------------------------------
children.push(h2('1.  Event Information'));
children.push(para([
  t('Event: ', { bold: true }),
  t('St. Juan Diego YAG × ASCEND 2026 — Retreat to Bellevue & Seattle'),
]));
children.push(para([
  t('Dates: ', { bold: true }),
  t('Saturday, May 16 – Sunday, May 17, 2026'),
]));
children.push(para([
  t('Primary venue: ', { bold: true }),
  t('Meydenbauer Center, 11100 NE 6th St, Bellevue, WA'),
]));
children.push(para([
  t('Sunday venues: ', { bold: true }),
  t('North American Martyrs Parish (Edmonds, WA) for 7:00 AM Traditional Latin Mass; Kona Kitchen (Lynnwood) for breakfast; Gas Works Park (Seattle); St. James Cathedral (Seattle); Pike Place Market and the Seattle waterfront; Din Tai Fung at Pacific Place (Seattle) for late lunch'),
]));
children.push(para([
  t('Lodging: ', { bold: true }),
  t('La Quinta Inn by Wyndham Lynnwood, 4300 Alderwood Mall Blvd, Lynnwood, WA 98036 · (425) 775-7447'),
]));
children.push(para([
  t('Departure: ', { bold: true }),
  t('Saturday, May 16 at 4:00 AM from St. Juan Diego Catholic Church, 15800 Summitview Rd, Cowiche, WA 98923 (meet 3:45 AM)'),
]));
children.push(para([
  t('Return: ', { bold: true }),
  t('Sunday, May 17 at approximately 6:45 PM to St. Juan Diego Catholic Church, Cowiche, WA'),
]));
children.push(para([
  t('Cost: ', { bold: true }),
  t('Registration, hotel, gas, and three meals (Saturday lunch at Sizzle & Crunch, Saturday dinner at Chick-fil-A Alderwood, Sunday breakfast at Kona Kitchen) are covered by the group. Sunday lunch at Din Tai Fung (Pacific Place) is on the participant; ~$25–$35. Participants should bring $40–$60 in total personal spending money for Sunday lunch, snacks, merchandise, and offerings.'),
]));
children.push(para([
  t('Lead organizer / 24-hour emergency contact: ', { bold: true }),
  t('Gaby — (509) 823-9987 — gaby@sjdyoungadults.com'),
]));
children.push(para([
  t('Secondary contact: ', { bold: true }),
  t('Alex (Sunday YAG) — (509) 306-0440'),
]));

// --- 2. Participant information -------------------------------------------
children.push(h2('2.  Participant Information'));
children.push(labeledLine('Legal first name', { labelWidth: 2200 }));
children.push(labeledLine('Legal middle name', { labelWidth: 2200 }));
children.push(labeledLine('Legal last name', { labelWidth: 2200 }));
children.push(labeledLine('Preferred / nickname', { labelWidth: 2200 }));
children.push(labeledLine('Date of birth (MM/DD/YYYY)', { labelWidth: 2800 }));
children.push(labeledLine('Age at event', { labelWidth: 2200 }));
children.push(labeledLine('Current grade', { labelWidth: 2200 }));
children.push(labeledLine('School', { labelWidth: 2200 }));
children.push(labeledLine('Home address', { labelWidth: 2200 }));
children.push(labeledLine('City, State, ZIP', { labelWidth: 2200 }));
children.push(labeledLine('Participant cell phone', { labelWidth: 2600 }));
children.push(labeledLine('Participant email', { labelWidth: 2200 }));
children.push(labeledLine('T-shirt size (S / M / L / XL / 2XL)', { labelWidth: 3400 }));
children.push(labeledLine('Home parish', { labelWidth: 2200 }));

// --- 3. Parent/guardian & emergency contacts -----------------------------
children.push(h2('3.  Parent / Guardian & Emergency Contacts'));

children.push(h3('Parent / Guardian #1 (primary)'));
children.push(labeledLine('Full name', { labelWidth: 2200 }));
children.push(labeledLine('Relationship to participant', { labelWidth: 2800 }));
children.push(labeledLine('Cell phone', { labelWidth: 2200 }));
children.push(labeledLine('Work / alt phone', { labelWidth: 2200 }));
children.push(labeledLine('Email', { labelWidth: 2200 }));
children.push(labeledLine('Home address (if different)', { labelWidth: 2800 }));

children.push(h3('Parent / Guardian #2 (if applicable)'));
children.push(labeledLine('Full name', { labelWidth: 2200 }));
children.push(labeledLine('Relationship to participant', { labelWidth: 2800 }));
children.push(labeledLine('Cell phone', { labelWidth: 2200 }));
children.push(labeledLine('Work / alt phone', { labelWidth: 2200 }));
children.push(labeledLine('Email', { labelWidth: 2200 }));

children.push(h3('Emergency contact not traveling with the participant'));
children.push(labeledLine('Full name', { labelWidth: 2200 }));
children.push(labeledLine('Relationship to participant', { labelWidth: 2800 }));
children.push(labeledLine('Cell phone', { labelWidth: 2200 }));
children.push(labeledLine('Alt phone', { labelWidth: 2200 }));

// --- 4. Medical information -----------------------------------------------
children.push(h2('4.  Medical Information'));
children.push(para([t('Please list all allergies (food, medication, environmental, insect) and describe any reaction. Write "NONE" if none apply.')]));
children.push(blankLines(3));

children.push(h3('Current medications (include dose and schedule)'));
children.push(blankLines(3));

children.push(h3('Chronic medical conditions (asthma, diabetes, seizures, anxiety, ADHD, etc.)'));
children.push(blankLines(3));

children.push(h3('Recent surgeries, hospitalizations, or significant injuries'));
children.push(blankLines(2));

children.push(h3('Dietary restrictions'));
children.push(blankLines(2));

children.push(h3('Health care details'));
children.push(labeledLine('Primary physician name', { labelWidth: 2600 }));
children.push(labeledLine('Physician phone', { labelWidth: 2600 }));
children.push(labeledLine('Health insurance carrier', { labelWidth: 2800 }));
children.push(labeledLine('Policy / member #', { labelWidth: 2600 }));
children.push(labeledLine('Subscriber (policy-holder) name', { labelWidth: 3200 }));
children.push(labeledLine('Last tetanus shot (month / year)', { labelWidth: 3200 }));

children.push(h3('Anything else the chaperones should know (optional)'));
children.push(blankLines(2));

// --- 5. Medication authorization ------------------------------------------
children.push(h2('5.  Medication Authorization'));
children.push(para([t('Check the option that applies to the medications listed in Section 4:')]));
children.push(checkItem('My child may self-carry and self-administer their own medications.'));
children.push(checkItem('A chaperone may hold and administer my child’s medications on the schedule listed above.'));
children.push(checkItem('My child is not taking any medications on this trip.'));

children.push(h3('Over-the-counter medication authorization'));
children.push(para([t('Place a parent initial on every OTC medication a chaperone is authorized to provide to my child as needed. Leave blank to withhold authorization.')]));
children.push(initialItem('Acetaminophen (Tylenol) — headache, fever'));
children.push(initialItem('Ibuprofen (Advil / Motrin) — pain, fever, inflammation'));
children.push(initialItem('Diphenhydramine (Benadryl) — allergic reactions'));
children.push(initialItem('Antacid (Tums / Pepcid)'));
children.push(initialItem('Dimenhydrinate (Dramamine) — motion sickness'));
children.push(initialItem('Cough drops / throat lozenges'));
children.push(initialItem('Topical antibiotic (Neosporin) and bandages'));
children.push(initialItem('Electrolyte drink / oral rehydration (Pedialyte, Gatorade)'));

// --- 6. Emergency medical authorization -----------------------------------
children.push(h2('6.  Emergency Medical Authorization'));
children.push(para([
  t('In the event of a medical emergency in which I cannot be reached, I authorize the adult chaperones accompanying my child on this trip — including Deacon Alex Chavez and the adult chaperones of St. Juan Diego Young Adult Group — to consent to any X-ray examination, medical, dental, or surgical diagnosis or treatment, and hospital care, that is deemed advisable by, and is to be rendered under the general or special supervision of, any physician or surgeon licensed to practice in the state in which care is rendered.'),
]));
children.push(para([
  t('This authorization is given in advance of any specific diagnosis, treatment, or hospital care being required, and is given to provide authority and power on the part of the above-named chaperones to give specific consent to any and all such diagnosis, treatment, or hospital care which the aforementioned physician may deem advisable in the exercise of their best judgment.'),
]));
children.push(noticeBox(
  '[DIOCESE TO REVIEW]',
  'Replace the paragraphs above with the Diocese of Yakima’s official emergency medical consent wording if one is required. Consent to treatment language varies by state and by diocesan policy.'
));

// --- 7. Transportation consent --------------------------------------------
children.push(h2('7.  Transportation Consent'));
children.push(para([
  t('I give my consent for my child to travel in private vehicles driven by volunteer parish drivers to and from the ASCEND 2026 retreat, on the arrangement listed below. I understand that my child may not leave group transportation to ride with any other person without my express written consent provided in advance to Gaby.'),
]));
children.push(h3('Saturday, May 16 (departing St. Juan Diego, Cowiche ~4:00 AM)'));
children.push(bullet('Vehicle 1 driver: Deacon Alex Chavez (with Patricia Chavez)'));
children.push(bullet([
  t('Vehicle 2 driver: '),
  t('[SECOND SATURDAY DRIVER — NAME]', { italics: true, color: 'C00000' }),
]));
children.push(bullet('Three (3) adult chaperones traveling Saturday'));

children.push(h3('Sunday, May 17 (additional vehicle and adults joining)'));
children.push(bullet([
  t('Additional driver: '),
  t('[SUNDAY DRIVER — NAME]', { italics: true, color: 'C00000' }),
]));
children.push(bullet([
  t('Two (2) additional adult chaperones joining Sunday: '),
  t('[NAMES]', { italics: true, color: 'C00000' }),
]));

children.push(h3('Route'));
children.push(para([
  t('US-12 W → I-82 W → I-90 W → I-405 N across Snoqualmie Pass. Approximately 142 miles each direction (~320 miles round-trip). One planned rest stop at the Pilot Travel Center in Ellensburg, WA.'),
]));

// --- 8. Authorized early pickup --------------------------------------------
children.push(h2('8.  Authorized Early Pickup'));
children.push(para([t('The following persons are authorized to pick up my child early from the event. Early pickup must be coordinated with Gaby in advance by phone.')]));
children.push(threeColTable(['Full name', 'Relationship', 'Phone'], 3));

// --- 9. Code of conduct ----------------------------------------------------
children.push(h2('9.  Code of Conduct'));
children.push(para([t('I have reviewed the following rules with my child and we both agree that my child will follow them throughout the retreat:')]));
children.push(bullet('No alcohol, tobacco, vaping products, cannabis, or illegal drugs.'));
children.push(bullet('Respect toward chaperones, fellow participants, venue hosts, hotel staff, and all people encountered on the trip.'));
children.push(bullet('Modest dress throughout the trip. Required attire for the Sunday 7:00 AM Traditional Latin Mass at North American Martyrs Parish: collared shirt and slacks for young men; modest dress or skirt reaching at least the knee, with shoulders covered, for young women.'),);
children.push(bullet('Young men and young women lodge in separate hotel rooms. No exceptions.'));
children.push(bullet('11:00 PM curfew with lights out at the hotel on Saturday evening.'));
children.push(bullet('Buddy system at all venues, stops, and hotel areas — no wandering off alone.'));
children.push(bullet('Phones are permitted. Participants may not photograph, video, or post about other participants without that person’s permission. Inappropriate content (illegal, sexual, or demeaning) on personal devices is grounds for removal from the event.'));
children.push(bullet('Participants remain with the group at all times unless signed out to a parent or authorized adult.'));
children.push(bullet('I understand that violation of these rules may result in my child being sent home at my expense.'));

// --- 10. Photo / video / media release -------------------------------------
children.push(h2('10.  Photo, Video & Media Release'));
children.push(para([
  t('I give my consent for photographs, video recordings, or audio recordings of my child taken during this event to be used in the following ways. Place a parent '),
  t('initial', { italics: true }),
  t(' on each use that is authorized; leave blank to withhold.'),
]));
children.push(initialItem('St. Juan Diego parish social media accounts (Instagram, Facebook, etc.)'));
children.push(initialItem('St. Juan Diego parish website and the ASCEND 2026 hub website'));
children.push(initialItem('Diocese of Yakima publications (print, web, social media)'));
children.push(initialItem('Promotional or recap video produced for the young adult group'));
children.push(initialItem('Internal use only — private group chat and event recap shared with participants and families; no public distribution'));
children.push(para([
  t('My child’s full name will not be published alongside their image without separate written consent.'),
]));
children.push(noticeBox(
  '[DIOCESE TO REVIEW]',
  'Replace with the Diocese of Yakima’s official photo / video / media release language if one is required.'
));

// --- 11. Safe Environment acknowledgment ----------------------------------
children.push(h2('11.  Safe Environment Acknowledgment'));
children.push(para([t('I acknowledge the following:')]));
children.push(bullet('All adult chaperones accompanying this trip are in compliance with the Diocese of Yakima Safe Environment policies, including VIRTUS training and current background checks.'));
children.push(bullet('The group will operate under two-deep adult leadership. No adult chaperone will be alone, one-on-one with my child, in a private space.'));
children.push(bullet('Hotel rooming is sex-segregated; no adult will share lodging with my child.'));
children.push(bullet('All adults on the trip are mandated reporters. Any suspicion of abuse or neglect will be reported to civil authorities and to the Diocese of Yakima Office of Safe Environment.'));
children.push(bullet([
  t('Diocese of Yakima Victim Assistance Coordinator: '),
  t('[PHONE / CONTACT — placeholder]', { italics: true, color: 'C00000' }),
]));
children.push(noticeBox(
  '[DIOCESE TO REVIEW]',
  'Replace or supplement with the Diocese of Yakima’s official Safe Environment acknowledgment language, and fill in the Victim Assistance Coordinator contact.'
));

// --- 12. Assumption of risk & release of liability ------------------------
children.push(h2('12.  Assumption of Risk & Release of Liability'));
children.push(para([
  t('I understand and acknowledge that the ASCEND 2026 retreat involves: travel by private vehicle over a mountain pass in variable weather; walking tours in urban environments (Seattle, Bellevue, Edmonds, Lynnwood) including Pike Place Market, the Seattle waterfront, and the Overlook Walk; and overnight lodging in a commercial hotel. I understand that these activities carry inherent risks of bodily injury, illness, or property loss, and I voluntarily consent to my child’s participation.'),
]));
children.push(para([
  t('On behalf of myself, my child, and our heirs, successors, and assigns, I release and hold harmless St. Juan Diego parish, the Diocese of Yakima, ASCEND / RISE Events and its organizers, the venues visited during the trip, and all volunteer chaperones, from any and all claims, demands, damages, causes of action, or liabilities arising from my child’s participation in this event, except those arising from gross negligence or willful misconduct.'),
]));
children.push(para([
  t('I represent that I am the legal parent or guardian of the minor named above, and that I have authority to execute this release on their behalf.'),
]));
children.push(noticeBox(
  '[DIOCESE TO REVIEW]',
  'Replace with the Diocese of Yakima’s official release and hold-harmless language. Releases of liability for minors are not enforceable in all U.S. jurisdictions; this section should be reviewed by diocesan legal counsel before use.'
));

// --- 13. Refund / cancellation --------------------------------------------
children.push(h2('13.  Refund / Cancellation'));
children.push(para([
  t('Registration, hotel, and transportation costs for this event are covered by St. Juan Diego Young Adult Group fundraising. Personal spending money is the responsibility of the participant. If my child cancels or is removed from the trip for any reason, I understand there is no monetary refund of fundraised costs. '),
  t('[REFUND / CANCELLATION POLICY — placeholder for any specific terms.]', { italics: true, color: 'C00000' }),
]));

// --- 14. Signatures --------------------------------------------------------
children.push(h2('14.  Signatures'));
children.push(para([t('By signing below, I certify that:')]));
children.push(bullet('I have read and understand every section of this form.'));
children.push(bullet('The information I have provided is accurate to the best of my knowledge.'));
children.push(bullet('I consent to my child’s participation in the ASCEND 2026 retreat under the terms stated above.'));

signatureRow('Parent / Guardian #1 (required)').forEach((el) => children.push(el));
signatureRow('Parent / Guardian #2 (if applicable)').forEach((el) => children.push(el));

children.push(new Paragraph({
  spacing: { before: 240, after: 80 },
  children: [new TextRun({ text: 'Participant assent (minor’s acknowledgment of Code of Conduct)', bold: true, size: 22 })],
}));
children.push(para([
  t('I, the undersigned participant, have read the Code of Conduct in Section 9 and agree to follow it for the entire retreat.'),
]));
signatureRow('Participant signature').forEach((el) => children.push(el));

signatureRow('Parish representative (witness — if required by diocese)').forEach((el) => children.push(el));

// ---------------------------------------------------------------------------
// Document setup
// ---------------------------------------------------------------------------
const doc = new Document({
  creator: 'St. Juan Diego YAG',
  title: 'ASCEND 2026 Parent/Guardian Consent Form',
  description: 'Draft parent/guardian consent form for ASCEND 2026 retreat, for Diocese of Yakima review.',
  styles: {
    default: { document: { run: { font: 'Arial', size: 22 } } },
    paragraphStyles: [
      { id: 'Heading1', name: 'Heading 1', basedOn: 'Normal', next: 'Normal', quickFormat: true,
        run: { size: 36, bold: true, font: 'Arial' },
        paragraph: { spacing: { before: 240, after: 120 }, outlineLevel: 0 } },
      { id: 'Heading2', name: 'Heading 2', basedOn: 'Normal', next: 'Normal', quickFormat: true,
        run: { size: 26, bold: true, font: 'Arial', color: '1F4E78' },
        paragraph: { spacing: { before: 320, after: 140 }, outlineLevel: 1 } },
    ],
  },
  numbering: {
    config: [
      { reference: 'bullets', levels: [
        { level: 0, format: LevelFormat.BULLET, text: '•', alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 720, hanging: 360 } } } },
      ] },
    ],
  },
  sections: [{
    properties: {
      page: {
        size: { width: PAGE_W, height: PAGE_H },
        margin: { top: MARGIN, right: MARGIN, bottom: MARGIN, left: MARGIN },
      },
    },
    children,
  }],
});

const outPath = path.join(__dirname, 'ascend-2026-parent-consent-form.docx');
Packer.toBuffer(doc).then((buffer) => {
  fs.writeFileSync(outPath, buffer);
  console.log('Wrote ' + outPath);
}).catch((err) => {
  console.error('Failed to generate:', err);
  process.exit(1);
});
