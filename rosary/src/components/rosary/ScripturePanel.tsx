'use client';

import React, { useState } from 'react';
import { useI18n } from '@/lib/i18n/context';
import { getScriptureForMystery } from '@/lib/rosary/scripture';
import { getUsccbUrlFromPassage } from '@/lib/rosary/usccb';
import type { MysterySet } from '@/lib/rosary/types';
import type { MysteryScripture } from '@/lib/rosary/scripture';

interface ScripturePanelProps {
  mysterySet: MysterySet;
  mysteryNumber: 1 | 2 | 3 | 4 | 5;
}

export default function ScripturePanel({ mysterySet, mysteryNumber }: ScripturePanelProps) {
  const { t, locale } = useI18n();
  const [open, setOpen] = useState(true);

  const readings = getScriptureForMystery(mysterySet, mysteryNumber);
  if (readings.length === 0) return null;

  return (
    <div className="mt-4 rounded-xl border border-brand-200 bg-brand-50/50">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between px-4 py-3 text-left text-sm font-medium text-brand-800 transition-colors hover:bg-brand-50"
        aria-expanded={open}
      >
        <span>{t({ en: 'Scripture Reading', es: 'Lectura bíblica' })}</span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          className={`h-5 w-5 transition-transform ${open ? 'rotate-180' : ''}`}
          aria-hidden="true"
        >
          <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
        </svg>
      </button>

      {open && (
        <div className="border-t border-brand-200 px-4 py-4 space-y-5">
          {readings.map((reading) => (
            <ReadingBlock key={reading.id} reading={reading} locale={locale} t={t} />
          ))}
        </div>
      )}
    </div>
  );
}

function ReadingBlock({
  reading,
  locale,
  t,
}: {
  reading: MysteryScripture;
  locale: string;
  t: (field: { en: string; es: string }) => string;
}) {
  const passage = t(reading.passage);
  const summary = t(reading.summary);
  const url = reading.usccbUrl || getUsccbUrlFromPassage(locale === 'en' ? reading.passage.en : reading.passage.en);

  return (
    <div className="space-y-3">
      <p className="text-sm leading-relaxed text-gray-700">{summary}</p>

      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 rounded-lg border border-brand-200 bg-white px-3 py-2 text-xs font-medium text-brand-700 transition-colors hover:bg-brand-50"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          className="h-3.5 w-3.5"
          aria-hidden="true"
        >
          <path fillRule="evenodd" d="M4.25 5.5a.75.75 0 00-.75.75v8.5c0 .414.336.75.75.75h8.5a.75.75 0 00.75-.75v-4a.75.75 0 011.5 0v4A2.25 2.25 0 0112.75 17h-8.5A2.25 2.25 0 012 14.75v-8.5A2.25 2.25 0 014.25 4h5a.75.75 0 010 1.5h-5zm4.943-.69l5.5-1a.75.75 0 01.882.654v5.5a.75.75 0 01-1.5 0V6.44l-5.22 5.22a.75.75 0 01-1.06-1.06l5.22-5.22h-3.524a.75.75 0 010-1.5h-.298z" clipRule="evenodd" />
        </svg>
        {t({ en: 'Read full passage (USCCB)', es: 'Leer el pasaje completo (USCCB)' })}
      </a>

      <p className="text-xs italic text-gray-500">— {passage}</p>
    </div>
  );
}
