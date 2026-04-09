'use client';

import React, { useRef, useCallback } from 'react';
import { useI18n } from '@/lib/i18n/context';
import { LITANY_OF_LORETO } from '@/lib/rosary/litany';
import type { LitanyLine } from '@/lib/rosary/litany';

interface LitanyPrayerSheetProps {
  beginnerMode: boolean;
}

export default function LitanyPrayerSheet({ beginnerMode }: LitanyPrayerSheetProps) {
  const { t } = useI18n();
  const topRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const scrollTo = useCallback((ref: React.RefObject<HTMLDivElement | null>) => {
    ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, []);

  function renderLine(line: LitanyLine, index: number) {
    const leader = t(line.leaderText);
    const response = t(line.responseText);

    if (line.type === 'heading') {
      if (!leader && !response) return <div key={index} className="h-4" />;
      return (
        <div key={index} className="col-span-full pt-4 pb-1">
          {leader && (
            <h4 className="text-center font-display text-lg font-bold text-gray-900">
              {leader}
            </h4>
          )}
          {response && (
            <p className="mt-1 text-center text-xs font-medium uppercase tracking-wide text-brand-600">
              {t({ en: 'Response:', es: 'Respuesta:' })} <span className="italic">{response}</span>
            </p>
          )}
        </div>
      );
    }

    if (line.type === 'leader') {
      return (
        <div key={index} className="col-span-full rounded-lg bg-brand-50 px-4 py-3">
          <p className="text-center text-sm leading-relaxed text-gray-700">{leader}</p>
        </div>
      );
    }

    // type === 'pair' or 'response'
    return (
      <React.Fragment key={index}>
        <div className="py-1.5 pr-2 text-sm text-gray-800">{leader}</div>
        <div className="py-1.5 pl-2 text-sm font-medium italic text-brand-700">{response}</div>
      </React.Fragment>
    );
  }

  return (
    <div className="space-y-4">
      <div ref={topRef} />

      <h3 className="text-center font-display text-xl font-bold text-gray-900">
        {t({ en: 'Litany of Loreto', es: 'Letanías de la Virgen' })}
      </h3>

      {beginnerMode && (
        <p className="rounded-lg bg-brand-50 px-4 py-3 text-center text-sm text-brand-700">
          {t({
            en: 'The Litany of Loreto is a series of prayers honoring the Blessed Virgin Mary under her many titles. A leader says each invocation, and the congregation responds.',
            es: 'Las Letanías de la Virgen son una serie de oraciones que honran a la Santísima Virgen María bajo sus muchos títulos. Un líder dice cada invocación, y la congregación responde.',
          })}
        </p>
      )}

      {/* Jump to end */}
      <div className="flex justify-center">
        <button
          onClick={() => scrollTo(bottomRef)}
          className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-500 transition-colors hover:bg-gray-50"
          aria-label={t({ en: 'Jump to end of litany', es: 'Ir al final de la letanía' })}
        >
          {t({ en: 'Jump to end ↓', es: 'Ir al final ↓' })}
        </button>
      </div>

      {/* Prayer sheet grid */}
      <div className="grid grid-cols-1 gap-x-4 gap-y-0 sm:grid-cols-[1fr_auto]">
        {LITANY_OF_LORETO.map((line, i) => renderLine(line, i))}
      </div>

      {/* Back to top */}
      <div ref={bottomRef} className="flex justify-center pt-2">
        <button
          onClick={() => scrollTo(topRef)}
          className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-500 transition-colors hover:bg-gray-50"
          aria-label={t({ en: 'Back to top of litany', es: 'Volver al inicio de la letanía' })}
        >
          {t({ en: '↑ Back to top', es: '↑ Volver al inicio' })}
        </button>
      </div>
    </div>
  );
}
