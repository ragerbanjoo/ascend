'use client';

import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { useI18n } from '@/lib/i18n/context';
import { PRAYERS, getMysterySet, buildStepSequence } from '@/lib/rosary/data';
import type { MysterySet, RosaryStep, MysterySetData } from '@/lib/rosary/types';
import BeadCounter from './BeadCounter';
import LitanyPrayerSheet from './LitanyPrayerSheet';
import ScripturePanel from './ScripturePanel';

interface RosaryPrayProps {
  mysterySet: MysterySet;
  beginnerMode: boolean;
  includeFatima: boolean;
  includeLitany: boolean;
  includeScripture: boolean;
  intention?: string;
}

export default function RosaryPray({ mysterySet, beginnerMode, includeFatima, includeLitany, includeScripture, intention }: RosaryPrayProps) {
  const { t } = useI18n();
  const setData: MysterySetData = useMemo(() => getMysterySet(mysterySet), [mysterySet]);
  const steps = useMemo(() => buildStepSequence(includeFatima, includeLitany), [includeFatima, includeLitany]);

  const [stepIndex, setStepIndex] = useState(0);
  const [beadCount, setBeadCount] = useState(0);
  const progressRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (progressRef.current) {
      const stickyHeader = document.querySelector('header');
      const headerHeight = stickyHeader instanceof HTMLElement ? stickyHeader.offsetHeight : 64;
      const topPadding = 16;
      const top = progressRef.current.getBoundingClientRect().top + window.scrollY - headerHeight - topPadding;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  }, [stepIndex]);

  const currentStep: RosaryStep = steps[stepIndex];
  const totalSteps = steps.length;
  const overallProgress = ((stepIndex + 1) / totalSteps) * 100;

  const mystery = currentStep.decadeIndex !== undefined
    ? setData.mysteries[currentStep.decadeIndex]
    : null;

  const goNext = useCallback(() => {
    if (stepIndex < totalSteps - 1) {
      setStepIndex((i) => i + 1);
      setBeadCount(0);
    }
  }, [stepIndex, totalSteps]);

  const goPrev = useCallback(() => {
    if (stepIndex > 0) {
      setStepIndex((i) => i - 1);
      setBeadCount(0);
    }
  }, [stepIndex]);

  const handleBeadTap = useCallback(() => {
    const target = currentStep.type === 'decade_hail_marys' ? 10 : 3;
    if (beadCount < target) {
      setBeadCount((c) => c + 1);
    }
  }, [beadCount, currentStep.type]);

  function renderStepContent() {
    const step = currentStep;

    switch (step.type) {
      case 'sign_of_cross':
      case 'final_sign_of_cross':
        return renderPrayer('sign_of_cross');
      case 'apostles_creed':
        return renderPrayer('apostles_creed');
      case 'our_father':
      case 'decade_our_father':
        return renderPrayer('our_father');
      case 'glory_be':
      case 'decade_glory_be':
        return renderPrayer('glory_be');
      case 'fatima_prayer':
        return renderPrayer('fatima_prayer');
      case 'hail_holy_queen':
        return renderPrayer('hail_holy_queen');
      case 'pray_for_us':
        return renderPrayer('pray_for_us');
      case 'litany_of_loreto':
        return <LitanyPrayerSheet beginnerMode={beginnerMode} />;
      case 'concluding_prayer':
        return renderPrayer('concluding_prayer');
      case 'hail_mary_x3':
        return renderBeadPrayer('hail_mary', 3);
      case 'decade_hail_marys':
        return renderBeadPrayer('hail_mary', 10);
      case 'announce_mystery':
        return renderMysteryAnnouncement();
      default:
        return null;
    }
  }

  function renderPrayer(prayerKey: string) {
    const prayer = PRAYERS[prayerKey];
    if (!prayer) return null;
    return (
      <div className="space-y-4">
        <h3 className="text-center font-display text-xl font-bold text-gray-900">
          {t(prayer.title)}
        </h3>
        {beginnerMode && prayer.instruction && (
          <p className="rounded-lg bg-brand-50 px-4 py-3 text-center text-sm text-brand-700">
            {t(prayer.instruction)}
          </p>
        )}
        <p className="whitespace-pre-line text-center text-base leading-relaxed text-gray-700">
          {t(prayer.text)}
        </p>
      </div>
    );
  }

  function renderBeadPrayer(prayerKey: string, total: number) {
    const prayer = PRAYERS[prayerKey];
    if (!prayer) return null;
    const done = beadCount >= total;
    return (
      <div className="space-y-6">
        <h3 className="text-center font-display text-xl font-bold text-gray-900">
          {t(prayer.title)}
          {total === 3 && (
            <span className="ml-2 text-base font-normal text-gray-500">
              ({t({ en: 'Opening', es: 'Apertura' })})
            </span>
          )}
        </h3>
        {beginnerMode && (
          <p className="text-center text-sm text-gray-500">
            {t({
              en: `Tap the circle to count each ${prayer.title.en}. (${total} total)`,
              es: `Toca el círculo para contar cada ${prayer.title.es}. (${total} en total)`,
            })}
          </p>
        )}
        <BeadCounter
          total={total}
          current={beadCount}
          onTap={handleBeadTap}
          label={done
            ? t({ en: 'Complete!', es: '¡Completo!' })
            : t({ en: `Tap to pray (${beadCount}/${total})`, es: `Toca para rezar (${beadCount}/${total})` })
          }
        />
        {!done && (
          <p className="whitespace-pre-line text-center text-sm leading-relaxed text-gray-600">
            {t(prayer.text)}
          </p>
        )}
      </div>
    );
  }

  function renderMysteryAnnouncement() {
    if (!mystery) return null;
    const decadeNum = (currentStep.decadeIndex ?? 0) + 1;
    return (
      <div className="space-y-4 text-center">
        <p className="text-sm font-medium uppercase tracking-wide text-brand-600">
          {t({ en: `Decade ${decadeNum} of 5`, es: `Decena ${decadeNum} de 5` })}
        </p>
        <h3 className="font-display text-2xl font-bold text-gray-900">
          {t(mystery.title)}
        </h3>
        <p className="text-sm text-gray-500">{t(mystery.scripture)}</p>
        <p className="mx-auto max-w-md text-base leading-relaxed text-gray-700">
          {t(mystery.meditation)}
        </p>
        {beginnerMode && (
          <p className="rounded-lg bg-brand-50 px-4 py-3 text-sm text-brand-700">
            {t({
              en: 'Reflect on this mystery as you pray the following prayers for this decade.',
              es: 'Reflexiona sobre este misterio mientras rezas las siguientes oraciones de esta decena.',
            })}
          </p>
        )}
        {includeScripture && (
          <ScripturePanel
            mysterySet={mysterySet}
            mysteryNumber={(decadeNum) as 1 | 2 | 3 | 4 | 5}
          />
        )}
      </div>
    );
  }

  const isComplete = stepIndex === totalSteps - 1 && currentStep.type === 'final_sign_of_cross';
  const isBeadStep = currentStep.type === 'decade_hail_marys' || currentStep.type === 'hail_mary_x3';
  const beadTarget = currentStep.type === 'decade_hail_marys' ? 10 : 3;
  const beadsDone = !isBeadStep || beadCount >= beadTarget;

  return (
    <div className="mx-auto max-w-lg" ref={progressRef}>
      {/* Intention banner */}
      {intention && intention.trim() && !isComplete && (
        <div className="mb-4 flex items-center gap-2 rounded-xl border border-brand-200 bg-brand-50 px-4 py-2.5">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4 flex-shrink-0 text-brand-500" aria-hidden="true">
            <path d="M9.653 16.915l-.005-.003-.019-.01a20.759 20.759 0 01-1.162-.682 22.045 22.045 0 01-2.582-2.046C4.463 12.962 3 11.217 3 9a5 5 0 0110 0c0 2.217-1.463 3.962-2.885 5.174a22.043 22.043 0 01-2.582 2.046 20.764 20.764 0 01-1.162.682l-.019.01-.005.003h-.002a.739.739 0 01-.69 0l-.002-.001z" />
          </svg>
          <p className="text-xs font-medium text-brand-700">
            {t({ en: 'Praying for:', es: 'Rezando por:' })}{' '}
            <span className="font-semibold">{intention.trim()}</span>
          </p>
        </div>
      )}

      {/* Progress bar */}
      <div className="mb-6">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>{t({ en: 'Progress', es: 'Progreso' })}</span>
          <span>{Math.round(overallProgress)}%</span>
        </div>
        <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-gray-200">
          <div
            className="h-full rounded-full bg-brand-600 transition-all duration-500"
            style={{ width: `${overallProgress}%` }}
          />
        </div>
      </div>

      {/* Decade / mystery indicator */}
      {!isComplete && mystery && currentStep.type !== 'announce_mystery' && (
        <p className="mb-4 text-center text-xs font-medium uppercase tracking-wide text-brand-500">
          {t(setData.label)} — {t(mystery.title)}
        </p>
      )}

      {/* Step content */}
      <div className="min-h-[280px] rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        {isComplete ? (
          <div className="rounded-2xl bg-gradient-to-br from-brand-700 to-brand-900 px-6 py-8 text-center text-white shadow-lg">
            <p className="text-2xl">🙏</p>
            <h3 className="mt-3 font-display text-xl font-bold">
              {t({ en: 'Rosary Complete', es: 'Rosario Completo' })}
            </h3>
            <p className="mt-2 text-sm text-brand-100">
              {t({ en: 'God bless you. May Our Lady intercede for you.', es: 'Dios te bendiga. Que Nuestra Señora interceda por ti.' })}
            </p>
            {intention && intention.trim() && (
              <p className="mt-3 rounded-lg bg-white/10 px-4 py-2 text-sm font-medium text-white">
                {t({ en: 'You prayed for:', es: 'Rezaste por:' })}{' '}
                <span className="font-bold">{intention.trim()}</span>
              </p>
            )}
            <div className="mt-5 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
              <a
                href="/?tab=mysteries"
                className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-bold text-brand-700 shadow-sm transition-colors hover:bg-brand-50"
              >
                {t({ en: 'Explore the Mysteries', es: 'Explorar los Misterios' })} →
              </a>
              <a
                href="/?tab=pray"
                className="inline-flex items-center gap-2 rounded-xl border border-white/30 bg-white/10 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-white/20"
              >
                {t({ en: 'Pray Again', es: 'Rezar de Nuevo' })}
              </a>
            </div>
          </div>
        ) : (
          renderStepContent()
        )}
      </div>

      {/* Navigation */}
      {!isComplete && (
        <div className="mt-6 flex items-center justify-between gap-4">
          <button
            onClick={goPrev}
            disabled={stepIndex === 0}
            className="rounded-xl border border-gray-200 px-5 py-3 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50 disabled:opacity-30"
            aria-label={t({ en: 'Previous step', es: 'Paso anterior' })}
          >
            ← {t({ en: 'Back', es: 'Atrás' })}
          </button>

          <button
            onClick={goNext}
            disabled={!beadsDone}
            className="rounded-xl bg-brand-600 px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-brand-700 disabled:opacity-40"
            aria-label={t({ en: 'Next step', es: 'Siguiente paso' })}
          >
            {t({ en: 'Next', es: 'Siguiente' })} →
          </button>
        </div>
      )}
    </div>
  );
}
