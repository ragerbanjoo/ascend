import type { BilingualField } from '@/types';

export type MysterySet = 'joyful' | 'sorrowful' | 'glorious' | 'luminous';

export interface Mystery {
  number: number;
  title: BilingualField;
  scripture: BilingualField;
  meditation: BilingualField;
}

export interface MysterySetData {
  key: MysterySet;
  label: BilingualField;
  mysteries: Mystery[];
}

export interface Prayer {
  key: string;
  title: BilingualField;
  text: BilingualField;
  instruction?: BilingualField;
}

export type RosaryStepType =
  | 'sign_of_cross'
  | 'apostles_creed'
  | 'our_father'
  | 'hail_mary_x3'
  | 'glory_be'
  | 'announce_mystery'
  | 'decade_our_father'
  | 'decade_hail_marys'
  | 'decade_glory_be'
  | 'fatima_prayer'
  | 'hail_holy_queen'
  | 'pray_for_us'
  | 'litany_of_loreto'
  | 'concluding_prayer'
  | 'final_sign_of_cross';

export interface RosaryStep {
  type: RosaryStepType;
  decadeIndex?: number; // 0-4 for decade steps
}

export interface RosarySettings {
  fatimaDefault: boolean;
  showConcluding: boolean;
  quietModeDefault: boolean;
  sundayNote: BilingualField;
}

// ─── Mystery Detail (CMS-ready) ─────────────────────────────────────────

export interface MysteryScriptureRef {
  passage: BilingualField;
  summary: BilingualField;
  usccbUrl?: string;
}

export interface ChurchSource {
  sourceTitle: BilingualField;
  author: BilingualField;
  excerpt: BilingualField;
  url: string;
  type: 'vatican' | 'usccb' | 'papal_letter';
}

export interface MysteryDetail {
  setKey: MysterySet;
  order: 1 | 2 | 3 | 4 | 5;
  slug: string;
  title: BilingualField;
  summary: BilingualField;
  whatItTeaches: BilingualField;
  fruit: BilingualField;
  scriptureReadings: MysteryScriptureRef[];
  churchSources: ChurchSource[];
  reflectionPrompts: { en: string[]; es: string[] };
  status: 'published' | 'draft';
}
