// USCCB Bible URL builder
// Maps book names (EN + ES + abbreviations) to USCCB URL slugs

const BOOK_MAP: Record<string, string> = {
  // Genesis
  genesis: 'genesis', gn: 'genesis', 'génesis': 'genesis',
  // Exodus
  exodus: 'exodus', ex: 'exodus', 'éxodo': 'exodus',
  // Psalms
  psalms: 'psalms', ps: 'psalms', salmos: 'psalms',
  // Isaiah
  isaiah: 'isaiah', is: 'isaiah', 'isaías': 'isaiah',
  // Matthew
  matthew: 'matthew', mt: 'matthew', mateo: 'matthew',
  // Mark
  mark: 'mark', mk: 'mark', marcos: 'mark',
  // Luke
  luke: 'luke', lk: 'luke', lucas: 'luke',
  // John
  john: 'john', jn: 'john', juan: 'john',
  // Acts
  acts: 'acts', hch: 'acts', hechos: 'acts',
  // Romans
  romans: 'romans', rom: 'romans', romanos: 'romans',
  // 1 Corinthians
  '1 corinthians': '1corinthians', '1 corintios': '1corinthians',
  // 2 Corinthians
  '2 corinthians': '2corinthians', '2 corintios': '2corinthians',
  // Galatians
  galatians: 'galatians', 'gálatas': 'galatians',
  // Ephesians
  ephesians: 'ephesians', efesios: 'ephesians',
  // Philippians
  philippians: 'philippians', filipenses: 'philippians',
  // Colossians
  colossians: 'colossians', colosenses: 'colossians',
  // Hebrews
  hebrews: 'hebrews', heb: 'hebrews', hebreos: 'hebrews',
  // James
  james: 'james', santiago: 'james',
  // 1 Peter
  '1 peter': '1peter', '1 pedro': '1peter',
  // 2 Peter
  '2 peter': '2peter', '2 pedro': '2peter',
  // Revelation
  revelation: 'revelation', rv: 'revelation', rev: 'revelation',
  apocalipsis: 'revelation', ap: 'revelation',
};

/**
 * Parse a scripture reference like "Luke 1:26–27" or "Lucas 1:26–27"
 * and return a USCCB Bible URL.
 */
export function getUsccbUrlFromPassage(passageRef: string): string {
  const fallback = 'https://bible.usccb.org/bible';

  if (!passageRef || !passageRef.trim()) return fallback;

  const cleaned = passageRef.trim();

  // Match pattern: optional number prefix + book name + chapter:verse(s)
  // Examples: "Luke 1:26-27", "1 Corinthians 13:4", "Apocalipsis 12:1"
  const match = cleaned.match(/^(\d?\s*[A-Za-zÀ-ÿ]+)\s+(\d+)/);
  if (!match) return fallback;

  const rawBook = match[1].trim().toLowerCase();
  const chapter = match[2];

  const slug = BOOK_MAP[rawBook];
  if (!slug) return fallback;

  return `https://bible.usccb.org/bible/${slug}/${chapter}`;
}
