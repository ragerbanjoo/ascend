/*
 * Generates the ASCEND 2026 Field Trip Packet for the Diocese of Yakima.
 * Follows the diocesan template (CM-Field-Trip-Packet-ENGLISH-2018.pdf):
 *   - Statement of Policy
 *   - Adult Liability Waiver
 *   - Parental/Guardian Consent Form & Liability Waiver (with medical release)
 *   - Transportation Policy
 *   - Driver Information Sheet (x3, one per Saturday vehicle)
 *   - Incident Investigation Report
 *   - Youth Trips Involving Overnight Stay
 *   - Chaperone Guidelines / Behavior Standards
 *   - Catholic Umbrella Pool II 11-15 Passenger Van Policy
 *
 * Trip-specific fields are prefilled wherever we have the information.
 * Driver-specific fields are blank — three vehicles will drive Saturday but
 * driver assignments are not finalized as of generation.
 *
 * Outputs ascend-2026-parent-consent-form.docx next to this file.
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

// --- Trip-specific data (prefilled) ----------------------------------------
const PARISH = 'St. Juan Diego Parish';
const PARISH_FULL = 'St. Juan Diego Catholic Church, 15800 Summitview Rd, Cowiche, WA 98923';
const DIOCESE = 'Yakima';
const EVENT_TITLE = 'ASCEND 2026 Eucharistic Revival Retreat';
const EVENT_DATES = 'Saturday, May 16, 2026 – Sunday, May 17, 2026';
const EVENT_LEAD = 'Gaby (lead organizer) — (509) 823-9987 — gaby@sjdyoungadults.com';
const EVENT_LEAD_SECONDARY = 'Alex — (509) 306-0440  ·  Deacon Alex (driver) — (509) 901-3126';
const HOTEL = 'La Quinta Inn by Wyndham Lynnwood · 4300 Alderwood Mall Blvd, Lynnwood, WA 98036 · (425) 775-7447';
const DEPART_TIME = 'Saturday, May 16, 2026 at 4:00 AM (meet 3:45 AM) from St. Juan Diego Parish, Cowiche, WA';
const RETURN_TIME = 'Sunday, May 17, 2026 at approximately 6:45 PM to St. Juan Diego Parish, Cowiche, WA';
const TRANSPORT = 'Three (3) private passenger vehicles. Driver names, vehicle details, and insurance information are listed on the attached Driver Information Sheets — driver assignments are still being finalized at the time this form is distributed.';
const DESTINATIONS = [
  'Meydenbauer Center, 11100 NE 6th St, Bellevue, WA 98004 (ASCEND main event, Saturday)',
  'Sizzle & Crunch Vietnamese Grill, 10438 NE 10th St, Bellevue, WA (Saturday lunch)',
  'Chick-fil-A I-5 & Alderwood, 3026 196th St SW, Lynnwood, WA (Saturday dinner)',
  'La Quinta Inn by Wyndham Lynnwood, 4300 Alderwood Mall Blvd, Lynnwood, WA 98036 (Saturday overnight)',
  'North American Martyrs Parish, 9924 232nd St SW, Edmonds, WA 98020 (Sunday 7:00 AM Traditional Latin Mass)',
  'Kona Kitchen Lynnwood, 3805 196th St SW, Lynnwood, WA (Sunday breakfast)',
  'Gas Works Park, 2101 N Northlake Way, Seattle, WA 98103 (Sunday morning)',
  'St. James Cathedral, 804 9th Ave, Seattle, WA 98104 (Sunday late morning)',
  'Pike Place Market and the Seattle Waterfront, 1531 Western Ave, Seattle, WA (Sunday afternoon, with lunch in small groups)',
];

// --- Small helpers ---------------------------------------------------------
const t = (text, opts = {}) => new TextRun({ text, ...opts });

const blank = (after = 80) => new Paragraph({ spacing: { after }, children: [new TextRun('')] });

const pageBreak = () => new Paragraph({
  pageBreakBefore: true,
  spacing: { after: 0 },
  children: [new TextRun('')],
});

const h1 = (text) => new Paragraph({
  heading: HeadingLevel.HEADING_1,
  spacing: { before: 0, after: 60 },
  alignment: AlignmentType.CENTER,
  children: [new TextRun({ text, bold: true, size: 36 })],
});

const h2 = (text, opts = {}) => new Paragraph({
  heading: HeadingLevel.HEADING_2,
  spacing: { before: opts.before ?? 320, after: opts.after ?? 140 },
  pageBreakBefore: opts.pageBreakBefore ?? false,
  alignment: opts.alignment,
  children: [new TextRun({ text, bold: true, size: 28 })],
});

const h3 = (text, opts = {}) => new Paragraph({
  spacing: { before: opts.before ?? 200, after: opts.after ?? 80 },
  children: [new TextRun({ text, bold: true, size: 22 })],
});

const para = (runs, opts = {}) => new Paragraph({
  spacing: { after: opts.after ?? 140, line: 300 },
  alignment: opts.alignment,
  indent: opts.indent,
  children: Array.isArray(runs) ? runs : [new TextRun({ text: String(runs), size: 22 })],
});

const bullet = (children, opts = {}) => new Paragraph({
  numbering: { reference: 'bullets', level: opts.level ?? 0 },
  spacing: { after: 60, line: 280 },
  children: Array.isArray(children)
    ? children
    : [new TextRun({ text: String(children), size: 22 })],
});

const numbered = (children, opts = {}) => new Paragraph({
  numbering: { reference: 'numbered', level: opts.level ?? 0 },
  spacing: { after: 80, line: 280 },
  children: Array.isArray(children)
    ? children
    : [new TextRun({ text: String(children), size: 22 })],
});

// "Label: ____________________"  (single-cell two-column table; bottom border on right cell draws the line)
function labeledLine(label, { labelWidth = 2400, value = '', italicValue = false } = {}) {
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
          children: [new Paragraph({ children: [new TextRun({ text: value, size: 20, italics: italicValue })] })],
        }),
      ],
    })],
  });
}

// Two labeled lines side-by-side
function twoUpRow(leftLabel, rightLabel, opts = {}) {
  const half = CONTENT / 2;
  const labelW = opts.labelWidth ?? 1400;
  const valW = half - labelW - 120;
  const gap = 240;
  function pair(label, widthLabel, widthValue, prefill = '') {
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
        children: [new Paragraph({ children: [new TextRun({ text: prefill, size: 20 })] })],
      }),
    ];
  }
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
        ...pair(leftLabel, cols[0], cols[1], opts.leftValue ?? ''),
        gapCell,
        ...pair(rightLabel, cols[3], cols[4], opts.rightValue ?? ''),
      ],
    })],
  });
}

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

function noticeBox(title, bodyText, fill = 'FFF7E6') {
  return new Table({
    width: { size: CONTENT, type: WidthType.DXA },
    columnWidths: [CONTENT],
    rows: [new TableRow({
      children: [new TableCell({
        borders: allThin,
        width: { size: CONTENT, type: WidthType.DXA },
        shading: { fill, type: ShadingType.CLEAR },
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

// True/False checkbox row for driver questions
function tfRow(question) {
  return new Paragraph({
    spacing: { after: 100, line: 280 },
    children: [
      new TextRun({ text: question + '   ', size: 22 }),
      new TextRun({ text: '☐ TRUE   ☐ FALSE', size: 22, bold: true }),
    ],
  });
}

// ---------------------------------------------------------------------------
// Document body
// ---------------------------------------------------------------------------
const children = [];

// ===========================================================================
// COVER PAGE
// ===========================================================================
children.push(new Paragraph({
  alignment: AlignmentType.CENTER,
  spacing: { before: 1200, after: 240 },
  children: [new TextRun({ text: 'DIOCESE OF YAKIMA', bold: true, size: 28 })],
}));
children.push(new Paragraph({
  alignment: AlignmentType.CENTER,
  spacing: { after: 480 },
  children: [new TextRun({ text: 'Field Trip — Youth Programs', italics: true, size: 24 })],
}));
children.push(h1('ASCEND 2026'));
children.push(new Paragraph({
  alignment: AlignmentType.CENTER,
  spacing: { after: 80 },
  children: [new TextRun({ text: 'Eucharistic Revival Retreat', size: 26 })],
}));
children.push(new Paragraph({
  alignment: AlignmentType.CENTER,
  spacing: { after: 80 },
  children: [new TextRun({ text: 'Bellevue & Seattle, WA', size: 24, italics: true })],
}));
children.push(new Paragraph({
  alignment: AlignmentType.CENTER,
  spacing: { after: 480 },
  children: [new TextRun({ text: EVENT_DATES, bold: true, size: 24 })],
}));

children.push(new Paragraph({
  alignment: AlignmentType.CENTER,
  spacing: { after: 80 },
  children: [new TextRun({ text: 'Hosted by', size: 22 })],
}));
children.push(new Paragraph({
  alignment: AlignmentType.CENTER,
  spacing: { after: 40 },
  children: [new TextRun({ text: 'St. Juan Diego Parish — Young Adult Group', bold: true, size: 24 })],
}));
children.push(new Paragraph({
  alignment: AlignmentType.CENTER,
  spacing: { after: 600 },
  children: [new TextRun({ text: '15800 Summitview Rd, Cowiche, WA 98923  ·  Diocese of Yakima', size: 20 })],
}));

children.push(noticeBox(
  'Forms in this packet',
  'I — Statement of Policy (informational)\n' +
  'II — Adult Liability Waiver (each adult chaperone signs)\n' +
  'III — Parental/Guardian Consent Form & Liability Waiver (each minor participant)\n' +
  'V — Driver Information Sheet (×3, one per Saturday vehicle; drivers TBD)\n' +
  'IV — Transportation Policy (informational)\n' +
  'VII — Youth Trips Involving Overnight Stay (informational)\n' +
  'VIII — Chaperone Guidelines / Behavior Standards (each chaperone acknowledges)\n' +
  'IX — Catholic Umbrella Pool II 11–15 Passenger Van Policy (informational)\n' +
  'VI — Incident Investigation Report (carried by chaperones during trip)'
));

children.push(blank(240));
children.push(noticeBox(
  'Note on transportation',
  'Three (3) private passenger vehicles will drive together from St. Juan Diego Parish in Cowiche to Bellevue on Saturday, May 16. Driver assignments and vehicle details are still being finalized at the time this packet is distributed; the Driver Information Sheets in Section V will be completed by each driver and submitted to the lead organizer prior to departure.',
  'EAF7FF'
));

// ===========================================================================
// TRIP INFORMATION SUMMARY
// ===========================================================================
children.push(pageBreak());
children.push(h1('Trip Information Summary'));
children.push(para([
  t('This page summarizes everything parents/guardians, participants, chaperones, and drivers need to know about the ASCEND 2026 retreat. Read it together with the rest of this packet before signing.', { italics: true }),
], { alignment: AlignmentType.CENTER }));

children.push(h3('Event'));
children.push(labeledLine('Event name', { value: EVENT_TITLE }));
children.push(labeledLine('Type of event', { value: 'Overnight youth retreat — Eucharistic Revival conference + Sunday Mass' }));
children.push(labeledLine('Sponsoring parish', { value: PARISH_FULL }));
children.push(labeledLine('Diocese', { value: 'Yakima' }));

children.push(h3('Dates & departure'));
children.push(labeledLine('Dates', { value: EVENT_DATES }));
children.push(labeledLine('Meet-up', { value: 'Saturday, May 16, 2026 at 3:45 AM — St. Juan Diego Parish, Cowiche' }));
children.push(labeledLine('Departure', { value: '4:00 AM Saturday from St. Juan Diego Parish' }));
children.push(labeledLine('Return', { value: 'Sunday, May 17 at approximately 6:45 PM to St. Juan Diego Parish' }));

children.push(h3('Destinations'));
DESTINATIONS.forEach((d) => children.push(bullet(d)));

children.push(h3('Lodging'));
children.push(labeledLine('Hotel', { value: HOTEL }));
children.push(para([t('Guys and girls in separate rooms — no exceptions. Married-couple chaperones (Deacon Alex and Patricia Chavez) share a room. 11:00 PM curfew Saturday night.', { size: 20, italics: true })]));

children.push(h3('Transportation'));
children.push(labeledLine('Mode', { value: 'Three (3) private passenger vehicles' }));
children.push(para([t('Driver names, vehicle details, and proof of insurance for all three vehicles are recorded on the Driver Information Sheets in Section V. Driver assignments are TBD at packet distribution.', { size: 20, italics: true })]));
children.push(labeledLine('Estimated round-trip distance', { value: '~290 miles total (Cowiche → Bellevue → Lynnwood → Edmonds → Seattle → Cowiche)' }));
children.push(labeledLine('Route', { value: 'Summitview Rd → I-82 W → I-90 W (over Snoqualmie Pass) → I-405 N (outbound); reverse with I-5 S → I-90 E inbound' }));
children.push(labeledLine('Rest stops', { value: 'Pilot Travel Center, Ellensburg (~5:00 AM Sat; ~5:30 PM Sun)' }));

children.push(h3('Leadership'));
children.push(labeledLine('Lead organizer / 24-hour emergency contact', { value: EVENT_LEAD }));
children.push(labeledLine('Secondary contacts', { value: EVENT_LEAD_SECONDARY }));
children.push(labeledLine('Chaperones', { value: 'Gaby (lead) · Deacon Alex Chavez and Patricia Chavez · Alex · Edgar' }));
children.push(para([t('All adult chaperones have completed Diocese of Yakima Safe Environment training and a criminal background check per the Bishop’s Charter for the Protection of Children and Young People.', { size: 20, italics: true })]));

children.push(h3('Cost'));
children.push(para([t('Registration, hotel, gas, and three meals (Saturday lunch at Sizzle & Crunch, Saturday dinner at Chick-fil-A Alderwood, Sunday breakfast at Kona Kitchen Lynnwood) are covered by St. Juan Diego YAG fundraising. Sunday lunch is on the participant — each small group picks a spot near Pike Place; budget ~$15–$25. Recommended personal spending money: $40–$60 total to cover Sunday lunch, snacks, merchandise, and offerings.')]));

children.push(h3('Activities'));
const ACTIVITIES = [
  'ASCEND Eucharistic Revival conference at Meydenbauer Center: keynote talks (Chris Stefanick), breakout sessions (Dr. Andrew & Sarah Swafford, Dr. Tim Gray), Eucharistic Adoration with Confession, sacred music (Marie Miller, Floriani), Holy Mass celebrated by Archbishop Paul Etienne',
  'Group meals at Sizzle & Crunch (Bellevue), Chick-fil-A (Lynnwood), and Kona Kitchen (Lynnwood)',
  'Overnight stay at La Quinta Inn Lynnwood',
  'Traditional Latin Mass at North American Martyrs Parish, Edmonds (FSSP)',
  'Visits to Gas Works Park and St. James Cathedral, Seattle',
  'Pike Place Market, the new Overlook Walk, and the Seattle Waterfront — explored in three smaller groups (Alex & Edgar group, Gaby group, adults), with optional Miner’s Landing visit',
  'Group photo at Pier 62 / Overlook Walk plaza before drive home',
];
ACTIVITIES.forEach((a) => children.push(bullet(a)));

// ===========================================================================
// SECTION I — STATEMENT OF POLICY
// ===========================================================================
children.push(pageBreak());
children.push(h1('I. Field Trip — Statement of Policy'));
children.push(para([
  t('The Diocese of Yakima and ' + PARISH + ' recognize the importance and value of trips for educational, cultural, and spiritual enrichment, and approve of these visits to places of cultural or educational significance. The following regulations are observed for any field trip:'),
]));
children.push(numbered('Adequate supervision by qualified adults, including one or more employees and/or screened volunteers of the Diocese and/or parish.'));
children.push(numbered('Waivers by all adults and all parents/guardians of participants taking any field trip of all claims against the Diocese and/or the parish for injury, accident, illness, or death occurring during, or by reason of, the field trip.'));
children.push(numbered('Proper insurance for participants, personnel, and equipment. Each participant and chaperone should be able to show evidence of medical/health insurance for any accidents/bodily injury sustained on the trip. Anyone bringing special equipment from home is responsible for providing insurance in the event of damage, theft, or other unforeseen circumstances.'));
children.push(numbered('If a fee is charged, a contingency is made for any participant who cannot afford the trip. No participant is excluded because of lack of funds.'));
children.push(numbered('Inclusion of a proper first aid kit and fire extinguisher with the group at all times during travel.'));
children.push(numbered('Permission in written form from each participant’s parent or legal guardian to provide medical treatment if necessary.'));
children.push(numbered('All youth 18 years or older that are still in high school are considered vulnerable adults. Completed field trip permission forms are required prior to attending. Any youth over the age of 18 not enrolled in high school is considered an adult volunteer and must comply with the Diocese of Yakima Safe Environment training and complete a background-check form.'));
children.push(blank());
children.push(para([
  t('Adapted from the Diocese of Yakima Field Trip — Risk Management Information packet (Catholic Mutual Group, last revised April 4, 2018). Final wording is subject to review by the Diocese of Yakima Office of Youth Ministry, Office of Safe Environment, and diocesan legal counsel.', { italics: true, size: 18, color: '555555' }),
]));

// ===========================================================================
// SECTION II — ADULT LIABILITY WAIVER
// ===========================================================================
children.push(pageBreak());
children.push(h1('II. Adult Liability Waiver'));
children.push(para([
  t('Each adult participant, including group leaders and chaperones, must complete and sign this form.', { italics: true }),
], { alignment: AlignmentType.CENTER }));

children.push(h3('Release of Liability / Medical Release'));

children.push(labeledLine('Full name (adult participant)', { labelWidth: 3000 }));
children.push(blank(120));

children.push(para([
  t('I, the undersigned adult, agree on behalf of myself, my heirs, assigns, executors, and personal representatives, to hold harmless and defend ', { size: 22 }),
  t(PARISH, { bold: true, size: 22 }),
  t(' and the ', { size: 22 }),
  t('Diocese of ' + DIOCESE, { bold: true, size: 22 }),
  t(', its officers, directors, agents, employees, or representatives, from any and all liability for illness, injury, or death arising from or in connection with my participation in the trip described above (', { size: 22 }),
  t(EVENT_TITLE + ', ' + EVENT_DATES, { italics: true, size: 22 }),
  t(').', { size: 22 }),
]));

children.push(para([
  t('In the event that I should require medical treatment and I am not able to communicate my desires to attending physicians or other medical personnel, I give permission for the necessary emergency treatment to be administered. Please advise the doctors that I have the following allergies:'),
]));
children.push(blankLines(2));

children.push(h3('Emergency Contact'));
children.push(para([t('In case of emergency and for permission for treatment beyond emergency procedures, please contact:', { size: 22 })]));
children.push(labeledLine('Name', { labelWidth: 1800 }));
children.push(labeledLine('Relationship to me', { labelWidth: 2400 }));
children.push(twoUpRow('Daytime phone', 'Night-time phone'));
children.push(labeledLine('Health insurance carrier', { labelWidth: 2600 }));
children.push(twoUpRow('Insurance ID #', 'Policy #'));

children.push(blank(160));
signatureRow('Adult participant').forEach((el) => children.push(el));

// ===========================================================================
// SECTION III — PARENTAL/GUARDIAN CONSENT FORM & LIABILITY WAIVER
// ===========================================================================
children.push(pageBreak());
children.push(h1('III. Parental / Guardian Consent Form'));
children.push(new Paragraph({
  alignment: AlignmentType.CENTER,
  spacing: { after: 80 },
  children: [new TextRun({ text: 'Medical Information & Liability Waiver', bold: true, size: 24 })],
}));
children.push(para([
  t('Required for every participant under 18, and for any youth 18+ still enrolled in high school (vulnerable adult).', { italics: true }),
], { alignment: AlignmentType.CENTER }));

children.push(h3('Participant Information'));
children.push(labeledLine('Participant’s name', { labelWidth: 2400 }));
children.push(twoUpRow('Birth date', 'Sex'));
children.push(labeledLine('Parent / guardian’s name', { labelWidth: 2800 }));
children.push(labeledLine('Home address', { labelWidth: 2400 }));
children.push(labeledLine('City, State, ZIP', { labelWidth: 2400 }));
children.push(twoUpRow('Home phone', 'Business / cell phone'));

children.push(h3('Permission'));
children.push(para([
  t('I, ', { size: 22 }),
  t('_____________________________________________ ', { underline: {} , size: 22 }),
  t(' (parent or guardian’s name), grant permission for my child, ', { size: 22 }),
  t('_____________________________________________ ', { underline: {} , size: 22 }),
  t(' (child’s name), to participate in this parish event that requires transportation to a location away from the parish site. This activity will take place under the guidance and direction of parish employees and/or volunteers from ', { size: 22 }),
  t(PARISH, { bold: true, size: 22 }),
  t('.', { size: 22 }),
]));

children.push(h3('Description of the activity'));
children.push(labeledLine('Type of event', { labelWidth: 2400, value: 'Overnight youth retreat — ' + EVENT_TITLE }));
children.push(labeledLine('Date of event', { labelWidth: 2400, value: EVENT_DATES }));
children.push(labeledLine('Destination of event', { labelWidth: 2800, value: 'Bellevue, Lynnwood, Edmonds, and Seattle, WA — see Trip Information Summary for full venue list' }));
children.push(labeledLine('Individual in charge', { labelWidth: 2800, value: EVENT_LEAD }));
children.push(labeledLine('Estimated time of departure', { labelWidth: 3200, value: DEPART_TIME }));
children.push(labeledLine('Estimated time of return', { labelWidth: 3200, value: RETURN_TIME }));
children.push(labeledLine('Mode of transportation', { labelWidth: 3200, value: TRANSPORT }));

children.push(blank(120));
children.push(para([
  t('As parent and/or legal guardian, I remain legally responsible for any personal actions taken by the above-named minor (“participant”).', { italics: true }),
]));

children.push(h3('Hold Harmless / Liability Waiver'));
children.push(para([
  t('I agree on behalf of myself, my child named herein, or our heirs, successors, and assigns, to hold harmless and defend ', { size: 22 }),
  t(PARISH, { bold: true, size: 22 }),
  t(', its officers, directors, employees and agents, and the ', { size: 22 }),
  t('Diocese of ' + DIOCESE, { bold: true, size: 22 }),
  t(', its employees and agents, chaperones, or representatives associated with the event, from any claim arising from or in connection with my child attending the event or in connection with any illness or injury (including death) or cost of medical treatment in connection therewith. I agree to compensate the parish, its officers, directors and agents, and the Diocese of ' + DIOCESE + ', its employees and agents and chaperones, or representatives associated with the event, for reasonable attorney’s fees and expenses which may be incurred in any action brought against them as a result of such injury or damage, unless such claim arises from the negligence of the parish/diocese.', { size: 22 }),
]));

signatureRow('Parent / Guardian').forEach((el) => children.push(el));

// MEDICAL MATTERS
children.push(h2('Medical Matters'));
children.push(para([
  t('I hereby warrant that to the best of my knowledge, my child is in good health, and I assume all responsibility for the health of my child. ', { bold: true }),
  t('Of the following statements pertaining to medical matters, sign only those that are applicable.', { italics: true }),
]));

children.push(h3('Emergency Medical Treatment'));
children.push(para([
  t('In the event of an emergency, I hereby give permission to transport my child to a hospital for emergency medical or surgical treatment. I wish to be advised prior to any further treatment by the hospital or doctor. In the event of an emergency, if you are unable to reach me at the above numbers, contact:'),
]));
children.push(labeledLine('Name & relationship', { labelWidth: 2600 }));
children.push(twoUpRow('Phone', 'Family doctor'));
children.push(twoUpRow('Doctor phone', 'Policy #'));
children.push(labeledLine('Family health plan carrier', { labelWidth: 2800 }));
signatureRow('Parent / Guardian — Emergency medical treatment consent').forEach((el) => children.push(el));

children.push(h3('Other Medical Treatment'));
children.push(para([
  t('In the event it comes to the attention of the parish, its officers, directors and agents, and the Diocese of ' + DIOCESE + ', chaperones, or representatives associated with the activity, that my child becomes ill with symptoms such as headache, vomiting, sore throat, fever, diarrhea, I want to be called collect (with phone charges reversed to myself).'),
]));
signatureRow('Parent / Guardian — Notify-on-illness consent').forEach((el) => children.push(el));

children.push(h3('Medications'));
children.push(para([
  t('My child is taking medication at present. My child will bring all such medications necessary, and such medications will be well-labeled. Names of medications and concise directions for seeing that the child takes such medications, including dosage and frequency of dosage, method of administration are as follows:'),
]));
children.push(blankLines(4));
signatureRow('Parent / Guardian — Medications statement').forEach((el) => children.push(el));

children.push(blank(120));
children.push(para([
  t('Sign ONE of the two options below, depending on whether chaperones may give over-the-counter medication to your child.', { italics: true, bold: true }),
]));

children.push(h3('Option A — No medication may be administered'));
children.push(para([
  t('No medication of any type, whether prescription or non-prescription, may be administered to my child unless the situation is life-threatening and emergency treatment is required.'),
]));
signatureRow('Parent / Guardian — Option A').forEach((el) => children.push(el));

children.push(h3('Option B — Non-prescription medication permitted'));
children.push(para([
  t('I hereby grant permission for non-prescription medication (i.e. non-aspirin products such as acetaminophen or ibuprofen, throat lozenges, cough syrup) to be given to my child, if deemed appropriate. I have placed a parent’s initial below next to every OTC product a chaperone is authorized to provide as needed; any line left blank withholds authorization.'),
]));
children.push(initialItem('Acetaminophen (Tylenol) — headache, fever'));
children.push(initialItem('Ibuprofen (Advil / Motrin) — pain, fever, inflammation'));
children.push(initialItem('Diphenhydramine (Benadryl) — allergic reactions'));
children.push(initialItem('Antacid (Tums / Pepcid)'));
children.push(initialItem('Dimenhydrinate (Dramamine) — motion sickness'));
children.push(initialItem('Cough drops / throat lozenges'));
children.push(initialItem('Topical antibiotic (Neosporin) and bandages'));
children.push(initialItem('Electrolyte drink / oral rehydration (Pedialyte, Gatorade)'));
signatureRow('Parent / Guardian — Option B').forEach((el) => children.push(el));

children.push(h3('Specific Medical Information'));
children.push(para([
  t('The parish will take reasonable care to see that the following information will be held in confidence.', { italics: true }),
]));
children.push(para([t('Allergic reactions (medications, foods, plants, insects, etc.):')]));
children.push(blankLines(3));
children.push(labeledLine('Date of last tetanus / diphtheria immunization', { labelWidth: 4400 }));
children.push(para([t('Does the child have a medically prescribed diet? If so, describe:')]));
children.push(blankLines(2));
children.push(para([t('Any physical limitations?')]));
children.push(blankLines(2));
children.push(para([t('Is the child subject to chronic homesickness, emotional reactions to new situations, sleepwalking, bedwetting, fainting? If so, describe:')]));
children.push(blankLines(2));
children.push(para([t('Has the child recently been exposed to contagious diseases or conditions, such as mumps, measles, chicken pox, etc.? If so, list date and disease:')]));
children.push(blankLines(2));
children.push(para([t('Anything else the chaperones should know about my child:')]));
children.push(blankLines(2));

// ===========================================================================
// SECTION V — DRIVER INFORMATION SHEETS (×3)
// ===========================================================================
function driverSheet(label) {
  const out = [];
  out.push(pageBreak());
  out.push(h1('V. Driver Information Sheet'));
  out.push(new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { after: 80 },
    children: [new TextRun({ text: label, bold: true, size: 24, color: 'C00000' })],
  }));
  out.push(para([
    t('Required for each driver of a private passenger vehicle. A signed sheet for every driver must be on file with the lead organizer prior to departure.', { italics: true }),
  ], { alignment: AlignmentType.CENTER }));

  out.push(h3('Driver'));
  out.push(twoUpRow('Driver name', 'Date of birth'));
  out.push(twoUpRow('Home phone', 'Cell phone'));
  out.push(labeledLine('Address', { labelWidth: 1800 }));
  out.push(twoUpRow('Driver’s license #', 'Date of expiration'));

  out.push(h3('Vehicle'));
  out.push(twoUpRow('Make', 'Model'));
  out.push(twoUpRow('Year', 'License plate #'));
  out.push(labeledLine('License plate expiration', { labelWidth: 2800 }));
  out.push(labeledLine('Name of vehicle owner', { labelWidth: 2800 }));
  out.push(labeledLine('Address of vehicle owner (if different from driver)', { labelWidth: 4400 }));

  out.push(h3('Insurance'));
  out.push(twoUpRow('Insurance company', 'Policy #'));
  out.push(twoUpRow('Policy expiration', 'Liability limits'));
  out.push(twoUpRow('Agent name', 'Agent phone'));
  out.push(para([
    t('Minimum acceptable liability limit for privately-owned vehicles: $100,000 per person / $300,000 per occurrence.', { italics: true, size: 20 }),
  ]));
  out.push(para([
    t('Please be aware that as a volunteer driver, your insurance is primary.', { bold: true, size: 22 }),
  ]));

  out.push(h3('Driving record'));
  out.push(para([t('In order to provide for the safety of our students or other members of the parish/school and those we serve, we must ask each volunteer driver to answer the following questions:')]));
  out.push(tfRow('1. I have NOT had a conviction for an infraction involving drugs or alcohol (such as DUI/DWI) in the last three years.'));
  out.push(tfRow('2. I have NOT had two or more convictions for an infraction involving drugs or alcohol (such as DUI/DWI) in the last seven years.'));
  out.push(tfRow('3. I have had no more than three moving violations or accidents in the last three years.'));

  out.push(h3('Certification'));
  out.push(para([
    t('I certify that the information given on this form is true and correct to the best of my knowledge. I understand that driving for Church ministry is a profound responsibility and I will exercise extreme care and due diligence while driving. I understand that as a volunteer driver, I must be 21 years of age or older, possess a valid non-probationary driver’s license, have proper and current vehicle registration, and have the required insurance coverage in effect on the vehicle used to transport participants. I agree that I will refrain from using a cell phone or any other electronic device while operating my vehicle. I agree to the daily and consecutive mileage limits in the Transportation Policy: maximum 500 miles per vehicle per day, maximum 250 consecutive miles per driver without at least a 30-minute break.'),
  ]));
  signatureRow('Driver').forEach((el) => out.push(el));
  return out;
}
driverSheet('Vehicle 1 (driver TBD)').forEach((el) => children.push(el));
driverSheet('Vehicle 2 (driver TBD)').forEach((el) => children.push(el));
driverSheet('Vehicle 3 (driver TBD)').forEach((el) => children.push(el));

// ===========================================================================
// SECTION IV — TRANSPORTATION POLICY
// ===========================================================================
children.push(pageBreak());
children.push(h1('IV. Transportation Policy'));
children.push(para([
  t('Adapted from the Diocese of Yakima / Catholic Mutual Group Field Trip packet.', { italics: true, size: 20, color: '555555' }),
], { alignment: AlignmentType.CENTER }));

children.push(para([
  t('Commercial carrier or contracted transportation is the most desirable method to be used for field trips and, whenever possible, this mode of transportation should be provided. The use of private passenger vehicles is discouraged and should be avoided if at all possible. Commercial carriers (commercial airlines, trains, or buses) require no further information; if transportation is contracted, signed contracts should be executed with an appropriate hold-harmless agreement protecting the parish and the Diocese, and the contracted carrier should provide proof of insurance with minimum limits of liability of $2,000,000 CSL (Combined Single Limit).'),
]));

children.push(h3('Leased vehicles'));
children.push(para([
  t('If a vehicle is leased, rented, or borrowed to transport participants, appropriate insurance must be obtained. Coverage can be purchased through the rental company or your local agent. ', { size: 22 }),
  t('Coverage cannot be automatically assumed for leased, rented, or borrowed vehicles.', { bold: true, size: 22 }),
]));

children.push(h3('Private passenger vehicles'));
children.push(para([t('If a private passenger vehicle must be used, the following must be supplied for each driver:')]));
children.push(numbered('The driver must be 21 years of age or older.'));
children.push(numbered('The driver must have a valid, non-probationary driver’s license and no physical disability that could in any way impair his/her ability to drive the vehicle safely.'));
children.push(numbered('The vehicle must have a valid and current registration and license plates.'));
children.push(numbered('The vehicle must be insured for the following minimum limits: $100,000 per person / $300,000 per occurrence.'));
children.push(para([t('A signed Driver Information Sheet for each driver must be obtained prior to the trip. Each driver and/or chaperone is given a copy of the approved itinerary including the route to be followed and a summary of his/her responsibilities.', { italics: true })]));

children.push(h3('Distance limitations (non-contracted transportation)'));
children.push(numbered('Daily maximum miles driven should not exceed 500 miles per vehicle.'));
children.push(numbered('Maximum number of consecutive miles driven should not exceed 250 miles per driver without at least a 30-minute break.'));

children.push(noticeBox(
  'Application to ASCEND 2026',
  'Round-trip Cowiche → Bellevue → Cowiche is approximately 290 miles total — well below the daily maximum. We will rest at Pilot Travel Center, Ellensburg in both directions to satisfy the consecutive-miles rule. No 11–15 passenger vans are used (see Section IX).',
  'EAF7FF'
));

// ===========================================================================
// SECTION VII — YOUTH TRIPS INVOLVING OVERNIGHT STAY
// ===========================================================================
children.push(pageBreak());
children.push(h1('VII. Youth Trips Involving Overnight Stay'));
children.push(para([
  t('Diocese of Yakima / Catholic Mutual Group guidance, with notes on how each item is being handled for ASCEND 2026.', { italics: true, size: 20, color: '555555' }),
], { alignment: AlignmentType.CENTER }));

children.push(h3('Preparing for the trip'));
children.push(numbered('The designated leader has researched the trip area and identified potential risks; an emergency response plan is in place. Distance to the nearest medical facility from each venue, hotel, and route segment has been confirmed.'));
children.push(numbered('Adequate facilities for housing all participants and chaperones in one location: La Quinta Inn Lynnwood, Saturday night.'));
children.push(numbered('No travel outside the United States; no Travel Alerts/Warnings apply.'));
children.push(numbered('Parents/guardians of every minor participant receive this packet in writing with all trip details, including activities, cost, departure/return dates and times, location and emergency contact information, names of chaperones, mode of transportation, accommodations, and parent/legal guardian responsibility.'));
children.push(numbered('A waiver of all claims (this Section III form) is obtained from the parent/guardian of each participant under 18 (and any vulnerable adult). All adult participants complete the Section II Adult Liability Waiver, which includes a medical release portion.'));
children.push(numbered('All adult chaperones have completed Diocese of Yakima Safe Environment training and a criminal background check, in compliance with the Bishop’s Charter for the Protection of Children and Young People.'));
children.push(numbered('Health insurance applicability has been confirmed; participants are reminded to bring insurance cards.'));
children.push(numbered('A pre-trip meeting with all participants and parents/legal guardians will fully explain the details of the trip; written behavior standards (Section VIII) will be distributed and signed.'));
children.push(numbered('Chaperones receive a copy of the Chaperone Guidelines (Section VIII).'));
children.push(numbered('Participants are reminded to bring all prescription medications and other regular health items, and to disclose them on this Section III form.'));

children.push(h3('During the trip'));
children.push(numbered('Proper supervision is provided at all times. Adult-to-participant ratio target: at least 1:6.'));
children.push(numbered('Participants are divided into smaller groups with a designated adult leader. A binder with medical-release forms and emergency contact names/numbers for each individual is carried by the lead organizer at all times.'));
children.push(numbered('No 11–15 passenger vans (see Section IX). Three private passenger vehicles only.'));
children.push(numbered('All meals are taken at established commercial restaurants; bottled water is available at all times.'));

// ===========================================================================
// SECTION VIII — CHAPERONE GUIDELINES & BEHAVIOR STANDARDS
// ===========================================================================
children.push(pageBreak());
children.push(h1('VIII. Chaperone Guidelines & Behavior Standards'));
children.push(para([
  t('Each adult chaperone reads, signs, and dates this section. A signed copy is retained by the lead organizer.', { italics: true }),
], { alignment: AlignmentType.CENTER }));

children.push(para([
  t('Chaperones should be at least 25 years of age. “Helpers” ages 18–24 are permitted, but should be supervised by an adult chaperone. Each chaperone is assigned a group of participants for whom they are responsible. Regular daily responsibilities include:'),
]));
children.push(numbered('Account for assigned participants every time transportation is used.'));
children.push(numbered('Make sure assigned participants are in their room at curfew (11:00 PM Saturday).'));
children.push(numbered('Make sure participants are awake on time.'));
children.push(numbered('Make sure participants understand the daily itinerary.'));
children.push(numbered('Observe participants for suspicious behavior that might involve breaking the rules.'));
children.push(numbered('Be on guard for participants being loud, obnoxious, and/or rude. Do not tolerate this behavior.'));
children.push(numbered('Assist in medical emergencies and contact the lead organizer (Gaby) immediately.'));
children.push(numbered('Inquire within the assigned group about any individual medical considerations.'));
children.push(numbered('No participants or chaperones should leave the group for unauthorized excursions.'));
children.push(numbered('You may search participants’ rooms at any time, with or without their permission.'));
children.push(numbered('Check luggage before the trip.'));
children.push(numbered('Check hotel rooms for any damage or things left behind at checkout.'));
children.push(numbered('Make sure participants are properly dressed at all times.'));

children.push(h3('Behavior standards'));
children.push(numbered('A “buddy system” is used by chaperones; ensure 2 adults are present at all times (1 adult and 1 helper aged 18–24 is also acceptable).'));
children.push(numbered('One-to-one contact with a participant should always occur in a public place.'));
children.push(numbered('Any verbal or nonverbal sexual behavior with any participant is inappropriate.'));
children.push(numbered('Do not touch a participant against his/her will.'));
children.push(numbered('Do not touch a participant on any portion of their body that would be covered by a bathing suit.'));
children.push(numbered('Sexual gestures or overtures a participant makes to a staff member should be reported to the appropriate personnel.'));
children.push(numbered('Do not appear in front of a participant when not appropriately clothed.'));
children.push(numbered('Do not change clothes in the same room or in view of a participant.'));
children.push(numbered('Driving alone with a participant should be avoided at all times.'));
children.push(numbered('If necessary to drive alone with a participant: do not sit close to one another in the car; do not come into physical contact with each other; do not stop the car to talk; or, if you must stop the car, turn on the inside light of the car.'));
children.push(numbered('Do not strike or touch a participant as a means of discipline.'));
children.push(numbered('Do not use derogatory language when addressing a participant.'));
children.push(numbered('Be alert for suspicious or unusual behavior.'));
children.push(numbered('All suspicions of child or sexual abuse must be reported to appropriate personnel.'));
children.push(numbered('No participant should be taken on any type of trip or excursion without the written consent of the custodial parent.'));
children.push(numbered('No participant should be allowed to visit you in your quarters.'));
children.push(numbered('No participant should be denied food, water, or shelter.'));

children.push(h3('Acknowledgment'));
children.push(para([t('I have read and understand the Chaperone Guidelines and Behavior Standards above and agree to abide by them for the duration of the ASCEND 2026 retreat.')]));
signatureRow('Chaperone').forEach((el) => children.push(el));

// ===========================================================================
// SECTION IX — CATHOLIC UMBRELLA POOL II 11-15 PAX VAN POLICY
// ===========================================================================
children.push(pageBreak());
children.push(h1('IX. 11–15 Passenger Van, Bus, and Shuttle Use Policy'));
children.push(para([
  t('Excerpt from Catholic Umbrella Pool II policy effective July 1, 2003 (and subsequent revisions).', { italics: true, size: 20, color: '555555' }),
], { alignment: AlignmentType.CENTER }));

children.push(numbered('The use of non-owned (borrowed) or short-term leased 11–15 passenger vans to transport children or adults is prohibited.'));
children.push(numbered('The use of 11–15 passenger vans to transport children or adults is totally prohibited. 11–15 passenger vans may be used for cargo hauling only if all but the two front seats are removed.'));
children.push(numbered('11–15 passenger vans cannot be purchased or leased for the intent of transporting children or adults.'));
children.push(numbered('11–15 passenger vans can be replaced with either a school bus or a Multifunction School Activity Bus (MFSAB) that complies with FMVSS 111, FMVSS 220, FMVSS 221, and FMVSS 222.'));
children.push(numbered('Mini-vans (no more than 8 total occupants) may continue to be used to transport children or adults.'));

children.push(noticeBox(
  'Application to ASCEND 2026',
  'No 11–15 passenger vans, school buses, or shuttle buses are used. Three private passenger vehicles transport the group. Each vehicle carries fewer than 8 total occupants and complies with the mini-van exception.',
  'EAF7FF'
));

// ===========================================================================
// SECTION VI — INCIDENT INVESTIGATION REPORT
// ===========================================================================
children.push(pageBreak());
children.push(h1('VI. Incident Investigation Report'));
children.push(para([
  t('Complete this report for all incidents/injuries (also for near-miss incidents/injuries). This report is for information only. All claims should be reported immediately to Catholic Mutual Group at (800) 228-6108.', { italics: true }),
], { alignment: AlignmentType.CENTER }));

children.push(labeledLine('Name of injured person', { labelWidth: 2600 }));
children.push(twoUpRow('Phone', 'Date of incident'));
children.push(twoUpRow('Time of incident', 'AM / PM'));
children.push(labeledLine('Complete address', { labelWidth: 2400 }));

children.push(h3('Witnesses'));
children.push(para([t('Names, complete addresses, and phone numbers:')]));
children.push(blankLines(3));

children.push(h3('Describe the incident'));
children.push(para([t('State what the individual was doing and all circumstances leading up to the incident. Be specific. Reconstruct the chain of events.', { italics: true })]));
children.push(para([t('Who was involved?')]));
children.push(blankLines(2));
children.push(para([t('What took place?')]));
children.push(blankLines(2));
children.push(para([t('When did it occur?')]));
children.push(blankLines(1));
children.push(para([t('Where did it happen?')]));
children.push(blankLines(2));
children.push(para([t('Why did it happen?')]));
children.push(blankLines(2));
children.push(para([t('How did it happen?')]));
children.push(blankLines(2));

children.push(h3('Corrective action'));
children.push(para([t('1. In your opinion, was this incident preventable?      ☐ Yes      ☐ No')]));
children.push(para([t('2. If yes, state why:')]));
children.push(blankLines(2));
children.push(para([t('3. What action have you taken or do you propose taking to prevent a similar incident from taking place?')]));
children.push(blankLines(3));

children.push(h3('Training'));
children.push(para([t('Have you provided any training to prevent this incident? If not, describe training to be conducted:')]));
children.push(blankLines(3));

children.push(h3('Investigator'));
signatureRow('Individual in charge').forEach((el) => children.push(el));

// ===========================================================================
// CLOSING
// ===========================================================================
children.push(pageBreak());
children.push(h1('Submit this packet to:'));
children.push(blank(120));
children.push(para([t(EVENT_LEAD)], { alignment: AlignmentType.CENTER }));
children.push(blank(120));
children.push(para([
  t('Each minor must submit a completed Section III before departure. Each adult must submit a completed Section II. Each driver must submit a completed Section V. Each chaperone must submit the signed acknowledgment in Section VIII.', { italics: true }),
], { alignment: AlignmentType.CENTER }));
children.push(blank(240));
children.push(para([
  t('Final wording is subject to review by the Diocese of Yakima Office of Youth Ministry, Office of Safe Environment, and diocesan legal counsel. Forms in this packet are adapted from the Diocese of Yakima / Catholic Mutual Group “Field Trip — Risk Management Information” packet (last revised April 4, 2018).', { italics: true, size: 18, color: '555555' }),
], { alignment: AlignmentType.CENTER }));

// ---------------------------------------------------------------------------
// Document setup
// ---------------------------------------------------------------------------
const doc = new Document({
  creator: 'St. Juan Diego YAG',
  title: 'ASCEND 2026 Field Trip Packet',
  description: 'Diocese of Yakima field trip packet for the ASCEND 2026 retreat — adapted from the diocesan template.',
  styles: {
    default: { document: { run: { font: 'Arial', size: 22 } } },
    paragraphStyles: [
      { id: 'Heading1', name: 'Heading 1', basedOn: 'Normal', next: 'Normal', quickFormat: true,
        run: { size: 36, bold: true, font: 'Arial' },
        paragraph: { spacing: { before: 240, after: 120 }, outlineLevel: 0 } },
      { id: 'Heading2', name: 'Heading 2', basedOn: 'Normal', next: 'Normal', quickFormat: true,
        run: { size: 28, bold: true, font: 'Arial', color: '1F4E78' },
        paragraph: { spacing: { before: 320, after: 140 }, outlineLevel: 1 } },
    ],
  },
  numbering: {
    config: [
      { reference: 'bullets', levels: [
        { level: 0, format: LevelFormat.BULLET, text: '•', alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 720, hanging: 360 } } } },
      ] },
      { reference: 'numbered', levels: [
        { level: 0, format: LevelFormat.DECIMAL, text: '%1.', alignment: AlignmentType.LEFT,
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
