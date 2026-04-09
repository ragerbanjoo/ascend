'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useI18n } from '@/lib/i18n/context';
import { MYSTERY_SETS, SCHEDULE_NOTE } from '@/lib/rosary/data';
import { getMysteryDetailsBySet } from '@/lib/rosary/mysteryDetails';
import type { MysterySet } from '@/lib/rosary/types';

export default function RosaryMysteries() {
  const { t } = useI18n();
  const [expandedSet, setExpandedSet] = useState<MysterySet | null>(null);

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="text-center">
        <h2 className="font-display text-2xl font-bold text-gray-900">
          {t({ en: 'Explore the Mysteries', es: 'Explora los Misterios' })}
        </h2>
        <p className="mt-2 text-sm text-gray-500">
          {t({ en: 'Learn more about each set of mysteries and the individual meditations within them.', es: 'Conoce más sobre cada conjunto de misterios y las meditaciones individuales dentro de ellos.' })}
        </p>
      </div>

      <p className="text-center text-sm text-gray-500">{t(SCHEDULE_NOTE)}</p>

      {MYSTERY_SETS.map((set) => {
        const isExpanded = expandedSet === set.key;
        const details = getMysteryDetailsBySet(set.key);
        return (
          <div key={set.key} className="overflow-hidden rounded-xl border border-gray-200 bg-white">
            <button
              onClick={() => setExpandedSet(isExpanded ? null : set.key)}
              className={`flex w-full items-center justify-between px-5 py-4 text-left transition-colors ${
                isExpanded ? 'bg-brand-50' : 'hover:bg-gray-50'
              }`}
              aria-expanded={isExpanded}
            >
              <h3 className={`font-display text-lg font-bold ${isExpanded ? 'text-brand-700' : 'text-gray-900'}`}>{t(set.label)}</h3>
              <svg
                className={`h-5 w-5 transition-transform ${isExpanded ? 'rotate-180 text-brand-600' : 'text-gray-400'}`}
                fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
              </svg>
            </button>

            {isExpanded && (
              <div className="border-t border-brand-100 px-5 pb-4 pt-2">
                <div className="space-y-2">
                  {set.mysteries.map((m, idx) => {
                    const detail = details.find((d) => d.order === m.number);
                    const href = detail ? `/mysteries/${set.key}/${detail.slug}` : '#';
                    return (
                      <Link
                        key={idx}
                        href={href}
                        className="flex items-start gap-3 rounded-lg px-3 py-2.5 transition-colors hover:bg-brand-50 group"
                      >
                        <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-brand-100 text-xs font-bold text-brand-700">
                          {m.number}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 group-hover:text-brand-700">{t(m.title)}</p>
                          <p className="text-xs text-gray-500">{t(m.scripture)}</p>
                          <span className="mt-1.5 inline-flex items-center gap-1 text-xs font-medium text-brand-600 group-hover:text-brand-700 transition-colors">
                            {t({ en: 'Learn more', es: 'Conoce más' })} →
                          </span>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
