'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useI18n } from '@/lib/i18n/context';
import { getMysteryDetail } from '@/lib/rosary/mysteryDetails';
import { getUsccbUrlFromPassage } from '@/lib/rosary/usccb';
import type { MysterySet, MysteryDetail, ChurchSource, MysteryScriptureRef } from '@/lib/rosary/types';

export default function MysteryDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { t, locale } = useI18n();

  const setKey = params.setKey as MysterySet;
  const slug = params.slug as string;
  const mystery = getMysteryDetail(setKey, slug);

  if (!mystery) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <h1 className="font-display text-2xl font-bold text-gray-900">
          {t({ en: 'Mystery not found', es: 'Misterio no encontrado' })}
        </h1>
        <button
          onClick={() => router.push('/')}
          className="mt-6 rounded-xl bg-brand-600 px-6 py-3 text-sm font-medium text-white hover:bg-brand-700"
        >
          {t({ en: 'Back to Rosary', es: 'Volver al Rosario' })}
        </button>
      </div>
    );
  }

  const setLabels: Record<MysterySet, { en: string; es: string }> = {
    joyful: { en: 'Joyful Mysteries', es: 'Misterios Gozosos' },
    sorrowful: { en: 'Sorrowful Mysteries', es: 'Misterios Dolorosos' },
    glorious: { en: 'Glorious Mysteries', es: 'Misterios Gloriosos' },
    luminous: { en: 'Luminous Mysteries', es: 'Misterios Luminosos' },
  };

  function handlePrayThisMystery() {
    // Navigate back to home and set the mystery
    const url = `/?mystery=${setKey}`;
    router.push(url);
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
      {/* Breadcrumb */}
      <nav className="mb-6 text-sm text-gray-500">
        <button onClick={() => router.push('/')} className="hover:text-brand-600 transition-colors">
          {t({ en: 'Rosary', es: 'Rosario' })}
        </button>
        <span className="mx-2">›</span>
        <span>{t(setLabels[setKey])}</span>
        <span className="mx-2">›</span>
        <span className="text-gray-900 font-medium">{t(mystery.title)}</span>
      </nav>

      {/* Header */}
      <div className="mb-8">
        <p className="text-xs font-medium uppercase tracking-widest text-brand-600">
          {t(setLabels[setKey])} — {mystery.order} / 5
        </p>
        <h1 className="mt-2 font-display text-3xl font-bold text-gray-900">{t(mystery.title)}</h1>
        <div className="mt-3 inline-block rounded-full bg-brand-50 px-4 py-1.5 text-sm font-medium text-brand-700">
          {t({ en: 'Fruit:', es: 'Fruto:' })} {t(mystery.fruit)}
        </div>
      </div>

      {/* Summary */}
      <section className="mb-8">
        <h2 className="mb-3 font-display text-lg font-bold text-gray-900">
          {t({ en: 'What Happens', es: 'Lo Que Sucede' })}
        </h2>
        <p className="text-base leading-relaxed text-gray-700">{t(mystery.summary)}</p>
      </section>

      {/* What it teaches */}
      <section className="mb-8">
        <h2 className="mb-3 font-display text-lg font-bold text-gray-900">
          {t({ en: 'What It Teaches Us', es: 'Lo Que Nos Enseña' })}
        </h2>
        <p className="text-base leading-relaxed text-gray-700">{t(mystery.whatItTeaches)}</p>
      </section>

      {/* Scripture Readings */}
      <section className="mb-8">
        <h2 className="mb-3 font-display text-lg font-bold text-gray-900">
          {t({ en: 'Scripture Reading', es: 'Lectura Bíblica' })}
        </h2>
        <div className="space-y-4">
          {mystery.scriptureReadings.map((reading: MysteryScriptureRef, idx: number) => {
            const passageText = t(reading.passage);
            const url = reading.usccbUrl || getUsccbUrlFromPassage(locale === 'en' ? reading.passage.en : reading.passage.en);
            return (
              <div key={idx} className="rounded-xl border border-gray-200 bg-white p-4 space-y-3">
                <p className="text-sm leading-relaxed text-gray-700">{t(reading.summary)}</p>
                <a
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-lg border border-brand-200 bg-brand-50 px-3 py-2 text-xs font-medium text-brand-700 transition-colors hover:bg-brand-100"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-3.5 w-3.5" aria-hidden="true">
                    <path fillRule="evenodd" d="M4.25 5.5a.75.75 0 00-.75.75v8.5c0 .414.336.75.75.75h8.5a.75.75 0 00.75-.75v-4a.75.75 0 011.5 0v4A2.25 2.25 0 0112.75 17h-8.5A2.25 2.25 0 012 14.75v-8.5A2.25 2.25 0 014.25 4h5a.75.75 0 010 1.5h-5zm4.943-.69l5.5-1a.75.75 0 01.882.654v5.5a.75.75 0 01-1.5 0V6.44l-5.22 5.22a.75.75 0 01-1.06-1.06l5.22-5.22h-3.524a.75.75 0 010-1.5h-.298z" clipRule="evenodd" />
                  </svg>
                  {t({ en: 'Read full passage (USCCB)', es: 'Leer el pasaje completo (USCCB)' })}
                </a>
                <p className="text-xs italic text-gray-500">— {passageText}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Church Sources */}
      <section className="mb-8">
        <h2 className="mb-3 font-display text-lg font-bold text-gray-900">
          {t({ en: 'Church Sources', es: 'Fuentes de la Iglesia' })}
        </h2>
        <div className="space-y-3">
          {mystery.churchSources.map((source: ChurchSource, idx: number) => (
            <div key={idx} className="rounded-xl border border-gray-200 bg-white p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                {t(source.author)}
              </p>
              <p className="mt-1 text-sm font-medium text-gray-900">{t(source.sourceTitle)}</p>
              <p className="mt-2 text-sm leading-relaxed text-gray-600 italic">
                &ldquo;{t(source.excerpt)}&rdquo;
              </p>
              <a
                href={source.url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-brand-600 hover:text-brand-700"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-3.5 w-3.5" aria-hidden="true">
                  <path fillRule="evenodd" d="M4.25 5.5a.75.75 0 00-.75.75v8.5c0 .414.336.75.75.75h8.5a.75.75 0 00.75-.75v-4a.75.75 0 011.5 0v4A2.25 2.25 0 0112.75 17h-8.5A2.25 2.25 0 012 14.75v-8.5A2.25 2.25 0 014.25 4h5a.75.75 0 010 1.5h-5zm4.943-.69l5.5-1a.75.75 0 01.882.654v5.5a.75.75 0 01-1.5 0V6.44l-5.22 5.22a.75.75 0 01-1.06-1.06l5.22-5.22h-3.524a.75.75 0 010-1.5h-.298z" clipRule="evenodd" />
                </svg>
                {t({ en: 'Read full source', es: 'Leer la fuente completa' })}
              </a>
            </div>
          ))}
        </div>
      </section>

      {/* Reflection Prompts */}
      <section className="mb-8">
        <h2 className="mb-3 font-display text-lg font-bold text-gray-900">
          {t({ en: 'Reflection', es: 'Reflexión' })}
        </h2>
        <div className="space-y-3 rounded-xl bg-brand-50 p-5">
          {(locale === 'en' ? mystery.reflectionPrompts.en : mystery.reflectionPrompts.es).map((prompt, idx) => (
            <p key={idx} className="flex items-start gap-2 text-sm leading-relaxed text-brand-800">
              <span className="mt-0.5 flex-shrink-0 text-brand-400">•</span>
              {prompt}
            </p>
          ))}
        </div>
      </section>

      {/* CTA */}
      <div className="rounded-2xl bg-gradient-to-r from-brand-700 to-brand-900 px-6 py-8 text-center">
        <h3 className="font-display text-xl font-bold text-white">
          {t({ en: 'Pray This Mystery', es: 'Rezar Este Misterio' })}
        </h3>
        <p className="mt-2 text-sm text-brand-100">
          {t({
            en: 'Start the guided Rosary with this mystery set selected.',
            es: 'Comienza el Rosario guiado con este conjunto de misterios seleccionado.',
          })}
        </p>
        <button
          onClick={handlePrayThisMystery}
          className="mt-4 rounded-xl bg-white px-8 py-3 text-sm font-bold text-brand-700 shadow-sm transition-colors hover:bg-brand-50"
        >
          {t({ en: 'Pray this mystery now', es: 'Rezar este misterio ahora' })}
        </button>
      </div>
    </div>
  );
}
