/*
 * Generates the prefilled FORMS portion of the Diocese of Yakima /
 * Catholic Mutual Group field-trip packet for ASCEND 2026.
 *
 * Scope: only the forms that participants/chaperones/drivers must fill
 * out and sign — Adult Liability Waiver (II), Parental/Guardian Consent
 * Form & Liability Waiver (III), Driver Information Sheet (V, ×3),
 * Incident Investigation Report (VI), and a chaperone acknowledgment
 * for the diocesan Chaperone Guidelines (VIII).
 *
 * The diocesan policy sections (I Statement of Policy, IV Transportation
 * Policy, VII Overnight Stay Guidelines, VIII Chaperone Guidelines,
 * IX Catholic Umbrella Pool II Policy, X Mission Works) are NOT
 * reproduced here — they remain authoritative as published in the
 * Catholic Mutual Group / Diocese of Yakima packet
 * (CM-Field-Trip-Packet-ENGLISH-2018.pdf). The cover note in this
 * document directs readers there for the full policy text.
 *
 * Output: ascend-2026-parent-consent-form.docx (next to this file)
 *
 * Run:   NODE_PATH=$(npm root -g) node generate-consent-form.js
 */

const fs = require('fs');
const path = require('path');
const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  AlignmentType, PageOrientation, LevelFormat, HeadingLevel,
  BorderStyle, WidthType, ShadingType,
} = require('docx');

// --- Page geometry ---------------------------------------------------------
const PAGE_W = 12240;
const PAGE_H = 15840;
const MARGIN = 1440;
const CONTENT = PAGE_W - 2 * MARGIN;

// --- Borders ---------------------------------------------------------------
const LINE   = { style: BorderStyle.SINGLE, size: 6, color: '555555' };
const THIN   = { style: BorderStyle.SINGLE, size: 4, color: '888888' };
const NONE   = { style: BorderStyle.NONE,   size: 0, color: 'FFFFFF' };

const allNone    = { top: NONE, bottom: NONE, left: NONE, right: NONE };
const allThin    = { top: THIN, bottom: THIN, left: THIN, right: THIN };
const bottomOnly = { top: NONE, bottom: LINE, left: NONE, right: NONE };

// --- Trip-specific prefill data --------------------------------------------
const PARISH = 'St. Juan Diego Parish';
const PARISH_ADDRESS = '15800 Summitview Rd, Cowiche, WA 98923';
const DIOCESE = 'Yakima';
const EVENT_TYPE = 'Overnight youth retreat — ASCEND 2026 Eucharistic Revival';
const EVENT_DATES = 'Saturday, May 16, 2026 – Sunday, May 17, 2026';
const EVENT_DESTINATION = 'Bellevue (Meydenbauer Center), Lynnwood (La Quinta Inn — overnight), Edmonds (North American Martyrs Parish), and Seattle (Gas Works Park, St. James Cathedral, Pike Place Market & Waterfront), WA';
const EVENT_LEAD = 'Gaby — (509) 823-9987 — gaby@sjdyoungadults.com';
const DEPART_TIME = 'Saturday, May 16, 2026 at 4:00 AM from ' + PARISH + ', ' + PARISH_ADDRESS + ' (meet at 3:45 AM)';
const RETURN_TIME = 'Sunday, May 17, 2026 at approximately 6:45 PM to ' + PARISH + ', ' + PARISH_ADDRESS;
const TRANSPORT = 'Three (3) private passenger vehicles. Car 1 driven by Deacon Enrique Galeana (passengers: Lucas, Kevin, Sebastian, Kaiser, Luisa, Ruben). Car 2 driven by Patricia Galeana (passengers: Diana, Sofi, Lupita, Meli, Angie, Gali). Car 3 driven by Shayla (passengers: Mary, Lydia, Gaby, Kole — all 18+). See attached Driver Information Sheets.';

// --- Small helpers ---------------------------------------------------------
const t = (text, opts = {}) => new TextRun({ text, ...opts });

const blank = (after = 80) => new Paragraph({ spacing: { after }, children: [new TextRun('')] });

const pageBreak = () => new Paragraph({
  pageBreakBefore: true,
  spacing: { after: 0 },
  children: [new TextRun('')],
});

const h1 = (text, opts = {}) => new Paragraph({
  heading: HeadingLevel.HEADING_1,
  spacing: { before: opts.before ?? 0, after: opts.after ?? 60 },
  alignment: AlignmentType.CENTER,
  children: [new TextRun({ text, bold: true, size: 32 })],
});

const h2 = (text, opts = {}) => new Paragraph({
  heading: HeadingLevel.HEADING_2,
  spacing: { before: opts.before ?? 320, after: opts.after ?? 140 },
  alignment: opts.alignment ?? AlignmentType.CENTER,
  children: [new TextRun({ text, bold: true, size: 26 })],
});

const h3 = (text, opts = {}) => new Paragraph({
  spacing: { before: opts.before ?? 200, after: opts.after ?? 80 },
  children: [new TextRun({ text, bold: true, size: 22 })],
});

const para = (runs, opts = {}) => new Paragraph({
  spacing: { after: opts.after ?? 140, line: 300 },
  alignment: opts.alignment,
  children: Array.isArray(runs) ? runs : [new TextRun({ text: String(runs), size: 22 })],
});

const numbered = (children, opts = {}) => new Paragraph({
  numbering: { reference: 'numbered', level: opts.level ?? 0 },
  spacing: { after: 80, line: 280 },
  children: Array.isArray(children) ? children : [new TextRun({ text: String(children), size: 22 })],
});

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

function tfRow(question) {
  return new Paragraph({
    spacing: { after: 100, line: 280 },
    children: [
      new TextRun({ text: question + '   ', size: 22 }),
      new TextRun({ text: '☐ TRUE   ☐ FALSE', size: 22, bold: true }),
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
        margins: { top: 200, bottom: 200, left: 240, right: 240 },
        children: [
          new Paragraph({
            spacing: { after: 80 },
            children: [new TextRun({ text: title, bold: true, size: 22 })],
          }),
          new Paragraph({
            spacing: { after: 0, line: 300 },
            children: [new TextRun({ text: bodyText, size: 20 })],
          }),
        ],
      })],
    })],
  });
}

// ===========================================================================
// Document body — prefilled diocesan FORMS only. The policy sections
// of the diocesan packet (I, IV, VII, VIII, IX, X) are not duplicated
// here; they remain authoritative in the original Catholic Mutual /
// Diocese of Yakima packet, which must be distributed alongside this
// document.
// ===========================================================================
const children = [];

// ---------------------------------------------------------------------------
// COVER
// ---------------------------------------------------------------------------
children.push(new Paragraph({
  alignment: AlignmentType.CENTER,
  spacing: { before: 800, after: 200 },
  children: [new TextRun({ text: 'ASCEND 2026 RETREAT', bold: true, size: 32 })],
}));
children.push(new Paragraph({
  alignment: AlignmentType.CENTER,
  spacing: { after: 80 },
  children: [new TextRun({ text: PARISH, bold: true, size: 26 })],
}));
children.push(new Paragraph({
  alignment: AlignmentType.CENTER,
  spacing: { after: 80 },
  children: [new TextRun({ text: 'Diocese of ' + DIOCESE, size: 22 })],
}));
children.push(new Paragraph({
  alignment: AlignmentType.CENTER,
  spacing: { after: 360 },
  children: [new TextRun({ text: EVENT_DATES, size: 22, italics: true })],
}));

children.push(noticeBox(
  'About this packet',
  'This document contains only the FORMS that must be completed and returned to the lead organizer for the ASCEND 2026 retreat:\n\n' +
  '   •  Adult Liability Waiver (Diocese of Yakima Form II) — every adult chaperone\n' +
  '   •  Parental/Guardian Consent Form & Liability Waiver (Form III) — every participant under 18, plus any vulnerable adult (18+ still in high school)\n' +
  '   •  Driver Information Sheet (Form V) — one per driver (three drivers for this trip)\n' +
  '   •  Chaperone Guidelines acknowledgment (Form VIII signature) — every adult chaperone\n' +
  '   •  Incident Investigation Report (Form VI) — kept blank, carried by chaperones during the trip\n\n' +
  'Trip-specific fields are prefilled.'
));

children.push(blank(160));
children.push(noticeBox(
  'For the diocesan policy sections, see the original packet',
  'The Diocese of Yakima / Catholic Mutual Group "Field Trip — Risk Management Information" packet (CM-Field-Trip-Packet-ENGLISH-2018.pdf) contains the full diocesan policy text for: I. Statement of Policy, IV. Transportation Policy, VII. Youth Trips Involving Overnight Stay, VIII. Chaperone Guidelines/Behavior Standards, IX. Catholic Umbrella Pool II 11–15 Passenger Van Policy, and X. Mission Works/Service Projects. Please distribute that original PDF alongside this document — it is the authoritative reference. Available from the Diocese of Yakima at www.yakimadiocese.net.',
  'EAF7FF'
));

children.push(blank(240));
children.push(noticeBox(
  'Lead organizer / 24-hour emergency contact',
  EVENT_LEAD + '\n\n' +
  'Secondary contacts: Alex — (509) 306-0440  ·  Deacon Enrique Galeana — (509) 901-3126',
  'F5F0E6'
));

// ---------------------------------------------------------------------------
// FORM II — ADULT LIABILITY WAIVER
// ---------------------------------------------------------------------------
children.push(pageBreak());
children.push(h1('FORM II — ADULT LIABILITY WAIVER'));
children.push(para([t('Each adult participant, including group leaders and chaperones, must complete and sign this form.', { italics: true })], { alignment: AlignmentType.CENTER }));

children.push(h3('Release of Liability / Medical Release'));
children.push(labeledLine('I, (Full Name)', { labelWidth: 2400 }));
children.push(para([
  t(', agree on behalf of myself, my heirs, assigns, executors, and personal representatives, to hold harmless and defend '),
  t(PARISH, { bold: true }),
  t(' and the Diocese of '),
  t(DIOCESE, { bold: true }),
  t(', its officers, directors, agents, employees, or representatives, from any and all liability for illness, injury or death arising from or in connection with my participation in the ASCEND 2026 retreat described above.'),
]));
children.push(para([t('In the event that I should require medical treatment and I am not able to communicate my desires to attending physicians or other medical personnel, I give permission for the necessary emergency treatment to be administered. Please advise the doctors that I have the following allergies:')]));
children.push(blankLines(2));

children.push(para([t('In case of an emergency and for permission for treatment beyond emergency procedures, please contact:')]));
children.push(twoUpRow('Name', 'Night time phone'));
children.push(twoUpRow('Relationship to me', 'Insurance Policy #'));
children.push(labeledLine('Daytime phone', { labelWidth: 1800 }));
children.push(labeledLine('Health insurance carrier', { labelWidth: 2400 }));
children.push(labeledLine('Insurance ID #', { labelWidth: 2000 }));

children.push(blank(160));
signatureRow('Adult participant').forEach((el) => children.push(el));
children.push(labeledLine('Print name', { labelWidth: 1600 }));

// ---------------------------------------------------------------------------
// FORM III — PARENTAL/GUARDIAN CONSENT FORM
// ---------------------------------------------------------------------------
children.push(pageBreak());
children.push(h1('FORM III — PARENTAL / GUARDIAN CONSENT FORM'));
children.push(h2('Medical Information & Liability Waiver', { before: 80, after: 200 }));
children.push(para([t('Required for every participant under 18, and for any youth 18+ still enrolled in high school (vulnerable adult, per Diocese of Yakima policy).', { italics: true })], { alignment: AlignmentType.CENTER }));

children.push(h3('Participant information'));
children.push(labeledLine('Participant’s name', { labelWidth: 2400 }));
children.push(twoUpRow('Birth date', 'Sex'));
children.push(labeledLine('Parent / guardian’s name', { labelWidth: 2800 }));
children.push(labeledLine('Home address', { labelWidth: 1800 }));
children.push(twoUpRow('Home phone', 'Business phone'));

children.push(blank(120));
children.push(para([
  t('I, ___________________________________________________ (parent or guardian’s name) grant permission for my child, ___________________________________________________ (child’s name), to participate in this parish event that requires transportation to a location away from the parish site. This activity will take place under the guidance and direction of parish employees and/or volunteers from '),
  t(PARISH, { bold: true }),
  t(' (' + PARISH_ADDRESS + ').'),
]));

children.push(h3('Description of the activity'));
children.push(labeledLine('Type of event', { labelWidth: 2400, value: EVENT_TYPE }));
children.push(labeledLine('Date of event', { labelWidth: 2400, value: EVENT_DATES }));
children.push(labeledLine('Destination of event', { labelWidth: 2800, value: EVENT_DESTINATION }));
children.push(labeledLine('Individual in charge', { labelWidth: 2400, value: EVENT_LEAD }));
children.push(labeledLine('Estimated time of departure', { labelWidth: 3200, value: DEPART_TIME }));
children.push(labeledLine('Estimated time of return', { labelWidth: 3200, value: RETURN_TIME }));
children.push(labeledLine('Mode of transportation', { labelWidth: 3200, value: TRANSPORT }));

children.push(blank(160));
children.push(para([t('As parent and/or legal guardian, I remain legally responsible for any personal actions taken by the above named minor (“participant”).', { italics: true })]));

children.push(h3('Hold harmless / liability waiver'));
children.push(para([
  t('I agree on behalf of myself, my child named herein, or our heirs, successors, and assigns, to hold harmless and defend '),
  t(PARISH, { bold: true }),
  t(', its officers, directors, employees and agents, and the Diocese of '),
  t(DIOCESE, { bold: true }),
  t(', its employees and agents, chaperones, or representatives associated with the event, from any claim arising from or in connection with my child attending the event or in connection with any illness or injury (including death) or cost of medical treatment in connection therewith, except claims arising from the negligence of the parish or diocese. The full hold-harmless wording in the Diocese of Yakima Form III applies in its entirety; this signature acknowledges it.'),
]));
signatureRow('Parent / Guardian').forEach((el) => children.push(el));

children.push(h2('Medical Matters', { before: 320, after: 120 }));
children.push(para([
  t('I hereby warrant that to the best of my knowledge, my child is in good health, and I assume all responsibility for the health of my child. ', { bold: true }),
  t('Of the following statements pertaining to medical matters, sign only those that are applicable.', { italics: true }),
]));

children.push(h3('Emergency Medical Treatment'));
children.push(para([t('In the event of an emergency, I give permission to transport my child to a hospital for emergency medical or surgical treatment. I wish to be advised prior to any further treatment by the hospital or doctor. If you cannot reach me at the numbers above, contact:')]));
children.push(labeledLine('Name & relationship', { labelWidth: 2600 }));
children.push(twoUpRow('Phone', 'Family doctor'));
children.push(twoUpRow('Doctor phone', 'Policy #'));
children.push(labeledLine('Family health plan carrier', { labelWidth: 2800 }));
signatureRow('Parent / Guardian').forEach((el) => children.push(el));

children.push(h3('Other Medical Treatment'));
children.push(para([t('In the event a chaperone observes that my child becomes ill (e.g. headache, vomiting, sore throat, fever, diarrhea), I want to be called collect (with phone charges reversed to myself).')]));
signatureRow('Parent / Guardian').forEach((el) => children.push(el));

children.push(h3('Medications'));
children.push(para([t('My child is taking medication at present. My child will bring all such medications necessary, and such medications will be well-labeled. Names, dosage, frequency, and method of administration are as follows:')]));
children.push(blankLines(4));
signatureRow('Parent / Guardian').forEach((el) => children.push(el));

children.push(blank(120));
children.push(para([t('Sign ONE of the next two statements (not both).', { italics: true, bold: true })]));

children.push(h3('Statement A — no medication may be administered'));
children.push(para([t('No medication of any type, whether prescription or non-prescription, may be administered to my child unless the situation is life-threatening and emergency treatment is required.')]));
signatureRow('Parent / Guardian — Statement A').forEach((el) => children.push(el));

children.push(h3('Statement B — non-prescription medication permitted'));
children.push(para([t('I grant permission for non-prescription medication (acetaminophen, ibuprofen, throat lozenges, cough syrup, antihistamines, etc.) to be given to my child if deemed appropriate by a chaperone.')]));
signatureRow('Parent / Guardian — Statement B').forEach((el) => children.push(el));

children.push(h3('Specific medical information'));
children.push(para([t('The parish will take reasonable care to see that the following information will be held in confidence.', { italics: true })]));
children.push(para([t('Allergic reactions (medications, foods, plants, insects, etc.):')]));
children.push(blankLines(3));
children.push(labeledLine('Date of last tetanus / diphtheria immunization', { labelWidth: 5600 }));
children.push(para([t('Does the child have a medically prescribed diet?')]));
children.push(blankLines(2));
children.push(para([t('Any physical limitations?')]));
children.push(blankLines(2));
children.push(para([t('Is the child subject to chronic homesickness, emotional reactions to new situations, sleepwalking, bedwetting, fainting?')]));
children.push(blankLines(2));
children.push(para([t('Has the child recently been exposed to contagious diseases or conditions (mumps, measles, chicken pox, etc.)? If so, list date and disease:')]));
children.push(blankLines(2));
children.push(para([t('Anything else the chaperones should know about my child:')]));
children.push(blankLines(2));

// ---------------------------------------------------------------------------
// FORM V — DRIVER INFORMATION SHEET × 3
// ---------------------------------------------------------------------------
function driverSheet(carLabel, driverName) {
  const out = [];
  out.push(pageBreak());
  out.push(h1('FORM V — DRIVER INFORMATION SHEET'));
  out.push(para([t(carLabel + ' — ' + driverName, { bold: true, size: 22 })], { alignment: AlignmentType.CENTER }));
  out.push(blank(160));

  out.push(twoUpRow('Driver name', 'Date of birth', { leftValue: driverName }));
  out.push(twoUpRow('Address', 'Home phone'));
  out.push(twoUpRow('Cell phone', 'Driver’s license #'));
  out.push(labeledLine('License # date of expiration', { labelWidth: 3000 }));

  out.push(blank(120));
  out.push(twoUpRow('Vehicle (make)', 'Model'));
  out.push(twoUpRow('Year', 'License plate #'));
  out.push(labeledLine('License plate expiration', { labelWidth: 2800 }));
  out.push(labeledLine('Name of vehicle owner', { labelWidth: 2800 }));
  out.push(labeledLine('Address of owner (if different)', { labelWidth: 3400 }));

  out.push(h3('Insurance information'));
  out.push(twoUpRow('Insurance company', 'Policy #'));
  out.push(twoUpRow('Date of policy expiration', 'Liability limits'));
  out.push(twoUpRow('Agent name', 'Agent phone'));
  out.push(para([t('Per Diocese of Yakima Form V, the minimum acceptable liability limit for privately-owned vehicles is $100,000 per person / $300,000 per occurrence. As a volunteer driver, your insurance is primary.', { italics: true, size: 18 })]));

  out.push(h3('Driving record certification'));
  out.push(para([t('To provide for the safety of those we serve, please certify each statement below:')]));
  out.push(tfRow('1. I have NOT had a conviction for an infraction involving drugs or alcohol (e.g. DUI/DWI) in the last three years.'));
  out.push(tfRow('2. I have NOT had two or more convictions for an infraction involving drugs or alcohol in the last seven years.'));
  out.push(tfRow('3. I have had no more than three moving violations or accidents in the last three years.'));

  out.push(h3('Certification'));
  out.push(para([t('I certify that the information given on this form is true and correct. I have read the diocesan Transportation Policy and agree to abide by it, including: I am 21 years of age or older; I hold a valid non-probationary driver’s license; my vehicle has current registration and the required minimum insurance; daily maximum 500 miles per vehicle; consecutive maximum 250 miles per driver without at least a 30-minute break; no cell phone or electronic device use while driving.')]));
  signatureRow('Driver').forEach((el) => out.push(el));
  return out;
}
driverSheet('Car 1', 'Deacon Enrique Galeana').forEach((el) => children.push(el));
driverSheet('Car 2', 'Patricia Galeana').forEach((el) => children.push(el));
driverSheet('Car 3', 'Shayla').forEach((el) => children.push(el));

// ---------------------------------------------------------------------------
// CHAPERONE ACKNOWLEDGMENT (Diocesan Form VIII signature only)
// ---------------------------------------------------------------------------
children.push(pageBreak());
children.push(h1('CHAPERONE ACKNOWLEDGMENT — FORM VIII'));
children.push(para([t('Each adult chaperone signs this acknowledgment.', { italics: true })], { alignment: AlignmentType.CENTER }));

children.push(blank(160));
children.push(para([
  t('I have read the Diocese of Yakima / Catholic Mutual Group "Chaperone Guidelines / Behavior Standards" (Section VIII of the diocesan field trip packet, CM-Field-Trip-Packet-ENGLISH-2018.pdf) and the "Youth Trips Involving Overnight Stay" guidance (Section VII). I agree to follow the diocesan requirements throughout the ASCEND 2026 retreat, including but not limited to: providing proper supervision at all times; observing the buddy system; respecting room and curfew rules; refraining from any conduct prohibited by the diocesan behavior standards; and reporting any incident or suspicion of abuse to the appropriate personnel immediately.'),
]));
children.push(para([
  t('I confirm that I have completed Diocese of Yakima Safe Environment training and a criminal background check, in compliance with the Bishop’s Charter for the Protection of Children and Young People.'),
]));
signatureRow('Chaperone').forEach((el) => children.push(el));

// ---------------------------------------------------------------------------
// FORM VI — INCIDENT INVESTIGATION REPORT (blank, carried during trip)
// ---------------------------------------------------------------------------
children.push(pageBreak());
children.push(h1('FORM VI — INCIDENT INVESTIGATION REPORT'));
children.push(para([
  t('Complete this report for any incident, injury, or near miss during the trip. Report all claims immediately to Catholic Mutual Group at (800) 228-6108.', { italics: true }),
], { alignment: AlignmentType.CENTER }));

children.push(twoUpRow('Name of injured person', 'Phone'));
children.push(labeledLine('Complete address', { labelWidth: 2400 }));
children.push(para([t('Names of witnesses (with complete addresses and phone numbers):')]));
children.push(blankLines(3));

children.push(h3('Describe the incident'));
children.push(para([t('Who was involved?')]));
children.push(blankLines(2));
children.push(para([t('What took place?')]));
children.push(blankLines(2));
children.push(twoUpRow('Date', 'Time of incident'));
children.push(para([t('☐ AM   ☐ PM')]));
children.push(para([t('Where did it happen?')]));
children.push(blankLines(2));
children.push(para([t('Why did it happen?')]));
children.push(blankLines(2));
children.push(para([t('How did it happen?')]));
children.push(blankLines(2));

children.push(h3('Corrective action'));
children.push(para([t('1. In your opinion, was this incident preventable?    ☐ Yes    ☐ No')]));
children.push(para([t('2. If yes, state why:')]));
children.push(blankLines(2));
children.push(para([t('3. What action have you taken or do you propose taking to prevent a similar incident?')]));
children.push(blankLines(3));

children.push(h3('Training'));
children.push(para([t('Have you provided any training to prevent this incident? If not, describe training to be conducted:')]));
children.push(blankLines(3));

children.push(twoUpRow('Investigation conducted by', 'Date report prepared'));
children.push(labeledLine('Signature of individual in charge', { labelWidth: 3200 }));

// ---------------------------------------------------------------------------
// Document setup
// ---------------------------------------------------------------------------
const doc = new Document({
  creator: 'St. Juan Diego YAG',
  title: 'ASCEND 2026 — Prefilled diocesan forms',
  description: 'Prefilled forms portion of the Diocese of Yakima field trip packet for ASCEND 2026. Distribute alongside the original Catholic Mutual / Diocese of Yakima policy packet.',
  styles: {
    default: { document: { run: { font: 'Arial', size: 22 } } },
    paragraphStyles: [
      { id: 'Heading1', name: 'Heading 1', basedOn: 'Normal', next: 'Normal', quickFormat: true,
        run: { size: 32, bold: true, font: 'Arial' },
        paragraph: { spacing: { before: 240, after: 120 }, outlineLevel: 0 } },
      { id: 'Heading2', name: 'Heading 2', basedOn: 'Normal', next: 'Normal', quickFormat: true,
        run: { size: 26, bold: true, font: 'Arial' },
        paragraph: { spacing: { before: 320, after: 140 }, outlineLevel: 1 } },
    ],
  },
  numbering: {
    config: [
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
