'use client';

import React, { useState, useMemo, useCallback, useEffect, useRef, Suspense } from 'react';
import { useI18n } from '@/lib/i18n/context';
import { useTextSize } from '@/lib/textSize/context';
import { getTodaysMystery, MYSTERY_SET_LABELS } from '@/lib/rosary/data';
import type { MysterySet } from '@/lib/rosary/types';
import { useSearchParams, useRouter } from 'next/navigation';
import RosaryPray from '@/components/rosary/RosaryPray';
import RosaryLearn from '@/components/rosary/RosaryLearn';
import RosaryMysteries from '@/components/rosary/RosaryMysteries';

type Tab = 'pray' | 'learn' | 'mysteries';

function HomeContent() {
  const { t } = useI18n();
  const { isLarge, toggleTextSize } = useTextSize();
  const searchParams = useSearchParams();
  const router = useRouter();
  const prayOptionsRef = useRef<HTMLHeadingElement>(null);

  const todaysMystery = useMemo(() => getTodaysMystery(), []);
  const activeTab = (searchParams.get('tab') as Tab) || 'pray';
  const [selectedMystery, setSelectedMystery] = useState<MysterySet>(todaysMystery);
  const [beginnerMode, setBeginnerMode] = useState(false);
  const [includeFatima, setIncludeFatima] = useState(true);
  const [includeLitany, setIncludeLitany] = useState(false);
  const [includeScripture, setIncludeScripture] = useState(false);
  const [intention, setIntention] = useState('');
  const [prayingStarted, setPrayingStarted] = useState(false);
  const [prayKey, setPrayKey] = useState(0);
  const [scrollToWhatToChoose, setScrollToWhatToChoose] = useState(false);

  // Handle ?mystery= query param
  useEffect(() => {
    const mysteryParam = searchParams.get('mystery');
    if (mysteryParam && ['joyful', 'sorrowful', 'glorious', 'luminous'].includes(mysteryParam)) {
      setSelectedMystery(mysteryParam as MysterySet);
      setPrayingStarted(true);
      setPrayKey((k) => k + 1);
    }
  }, [searchParams]);

  // Navigate to Learn > What to Choose
  const handleGoToWhatToChoose = useCallback(() => {
    router.push('/?tab=learn');
    setScrollToWhatToChoose(true);
  }, [router]);

  const scrollToPrayOptions = useCallback(() => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        prayOptionsRef.current?.focus();
        if (prayOptionsRef.current) {
          const stickyHeader = document.querySelector('header');
          const headerHeight = stickyHeader instanceof HTMLElement ? stickyHeader.offsetHeight : 64;
          const topPadding = 12;
          const top = prayOptionsRef.current.getBoundingClientRect().top + window.scrollY - headerHeight - topPadding;
          window.scrollTo({ top, behavior: 'smooth' });
        }
      });
    });
  }, []);

  // Navigate back to Pray > Options
  const handleBackToPray = useCallback(() => {
    router.push('/?tab=pray');
    setScrollToWhatToChoose(false);
    scrollToPrayOptions();
  }, [router, scrollToPrayOptions]);

  const handleStartPraying = useCallback(() => {
    setPrayingStarted(true);
    setPrayKey((k) => k + 1);
  }, []);

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Today\u0027s Mystery Banner */}
      <div className="mb-8 rounded-2xl bg-gradient-to-r from-brand-700 to-brand-900 px-6 py-8 text-center text-white shadow-lg">
        <p className="text-xs font-medium uppercase tracking-widest text-brand-200">
          {t({ en: "Today's Mystery", es: 'Misterio de Hoy' })}
        </p>
        <h1 className="mt-2 font-display text-3xl font-bold sm:text-4xl" data-testid="todays-mystery-label">
          {t(MYSTERY_SET_LABELS[todaysMystery])}
        </h1>
        <p className="mx-auto mt-3 max-w-lg text-sm text-brand-100">
          {t({
            en: 'Join us in praying the Holy Rosary. This sacred tradition brings us closer to God through the intercession of the Blessed Virgin Mary.',
            es: 'Únete a nosotros para rezar el Santo Rosario. Esta sagrada tradición nos acerca a Dios a través de la intercesión de la Santísima Virgen María.',
          })}
        </p>
        <div className="mt-5">
          <button
            onClick={() => {
              router.push('/?tab=pray');
              setScrollToWhatToChoose(false);
              scrollToPrayOptions();
            }}
            className="rounded-xl bg-white px-6 py-2.5 text-sm font-bold text-brand-700 shadow-sm transition-colors hover:bg-brand-50 focus:outline-none focus:ring-4 focus:ring-brand-300"
          >
            {t({ en: 'Start Praying', es: 'Comenzar a Rezar' })}
          </button>
        </div>
      </div>

      {/* Pray tab */}
      {activeTab === 'pray' && (
        <div>
          <div id="pray-options" className="scroll-mt-24">
            {!prayingStarted && (
              <div className="mb-6 overflow-hidden rounded-2xl border-2 border-brand-600 bg-white shadow-lg">
                {/* Card header */}
                <div className="bg-brand-600 px-5 py-4 text-white">
                  <div className="flex items-center gap-3">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5 flex-shrink-0" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M10.343 3.94c.09-.542.56-.94 1.11-.94h1.093c.55 0 1.02.398 1.11.94l.149.894c.07.424.384.764.78.93.398.164.855.142 1.205-.108l.737-.527a1.125 1.125 0 011.45.12l.773.774c.39.389.44 1.002.12 1.45l-.527.737c-.25.35-.272.806-.107 1.204.165.397.505.71.93.78l.893.15c.543.09.94.56.94 1.109v1.094c0 .55-.397 1.02-.94 1.11l-.893.149c-.425.07-.765.383-.93.78-.165.398-.143.854.107 1.204l.527.738c.32.447.269 1.06-.12 1.45l-.774.773a1.125 1.125 0 01-1.449.12l-.738-.527c-.35-.25-.806-.272-1.203-.107-.397.165-.71.505-.781.929l-.149.894c-.09.542-.56.94-1.11.94h-1.094c-.55 0-1.019-.398-1.11-.94l-.148-.894c-.071-.424-.384-.764-.781-.93-.398-.164-.854-.142-1.204.108l-.738.527c-.447.32-1.06.269-1.45-.12l-.773-.774a1.125 1.125 0 01-.12-1.45l.527-.737c.25-.35.273-.806.108-1.204-.165-.397-.505-.71-.93-.78l-.894-.15c-.542-.09-.94-.56-.94-1.109v-1.094c0-.55.398-1.02.94-1.11l.894-.149c.424-.07.765-.383.93-.78.165-.398.143-.854-.107-1.204l-.527-.738a1.125 1.125 0 01.12-1.45l.773-.773a1.125 1.125 0 011.45-.12l.737.527c.35.25.807.272 1.204.107.397-.165.71-.505.78-.929l.15-.894z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <div>
                      <h3
                        ref={prayOptionsRef}
                        tabIndex={-1}
                        className="text-base font-bold leading-tight"
                      >
                        {t({ en: 'Customize Your Rosary', es: 'Personaliza Tu Rosario' })}
                      </h3>
                      <p className="mt-0.5 text-xs text-brand-100">
                        {t({ en: 'Set your options before you begin', es: 'Configura tus opciones antes de comenzar' })}
                      </p>
                      <button
                        onClick={handleGoToWhatToChoose}
                        className="mt-2 inline-flex items-center gap-1.5 text-sm font-medium text-brand-100 underline underline-offset-2 hover:text-white transition-colors focus:outline-none"
                        aria-label={t({ en: 'Learn what to select before praying', es: 'Aprende qué seleccionar antes de rezar' })}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4 flex-shrink-0" aria-hidden="true">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a.75.75 0 000 1.5h.253a.25.25 0 01.244.304l-.459 2.066A1.75 1.75 0 0010.747 15H11a.75.75 0 000-1.5h-.253a.25.25 0 01-.244-.304l.459-2.066A1.75 1.75 0 009.253 9H9z" clipRule="evenodd" />
                        </svg>
                        {t({ en: 'Not sure what to choose?', es: '¿No sabes qué elegir?' })}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Options body */}
                <div className="divide-y divide-gray-100 px-5">
                  {/* Mystery */}
                  <div className="flex items-center justify-between py-3.5">
                    <div>
                      <p className="text-sm font-semibold text-gray-800">{t({ en: 'Mystery Set', es: 'Conjunto de Misterios' })}</p>
                      <p className="text-xs text-gray-500">{t({ en: "Which mysteries to meditate on today", es: 'Qué misterios meditar hoy' })}</p>
                    </div>
                    <select
                      id="mystery-select"
                      value={selectedMystery}
                      onChange={(e) => {
                        setSelectedMystery(e.target.value as MysterySet);
                        setPrayKey((k) => k + 1);
                      }}
                      className="ml-3 rounded-lg border border-gray-200 px-3 py-1.5 text-sm font-medium focus:border-brand-500 focus:ring-2 focus:ring-brand-300 focus:outline-none"
                    >
                      {(['joyful', 'sorrowful', 'glorious', 'luminous'] as MysterySet[]).map((s) => (
                        <option key={s} value={s}>{t(MYSTERY_SET_LABELS[s])}</option>
                      ))}
                    </select>
                  </div>

                  {/* Beginner mode */}
                  <label className="flex cursor-pointer items-center justify-between py-3.5">
                    <div>
                      <p className="text-sm font-semibold text-gray-800">{t({ en: 'Beginner Mode', es: 'Modo Principiante' })}</p>
                      <p className="text-xs text-gray-500">{t({ en: 'Shows instructions and guidance', es: 'Muestra instrucciones y orientación' })}</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={beginnerMode}
                      onChange={(e) => setBeginnerMode(e.target.checked)}
                      className="ml-3 h-4 w-4 rounded border-gray-300"
                    />
                  </label>

                  {/* Fatima */}
                  <label className="flex cursor-pointer items-center justify-between py-3.5">
                    <div>
                      <p className="text-sm font-semibold text-gray-800">{t({ en: 'Fatima Prayer', es: 'Oración de Fátima' })}</p>
                      <p className="text-xs text-gray-500">{t({ en: 'After each decade of Hail Marys', es: 'Después de cada decena de Avemarías' })}</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={includeFatima}
                      onChange={(e) => setIncludeFatima(e.target.checked)}
                      className="ml-3 h-4 w-4 rounded border-gray-300"
                    />
                  </label>

                  {/* Litany */}
                  <label className="flex cursor-pointer items-center justify-between py-3.5">
                    <div>
                      <p className="text-sm font-semibold text-gray-800">{t({ en: 'Litany of Loreto', es: 'Letanías Lauretanas' })}</p>
                      <p className="text-xs text-gray-500">{t({ en: 'Closing prayer honoring Our Lady', es: 'Oración final en honor a Nuestra Señora' })}</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={includeLitany}
                      onChange={(e) => {
                        setIncludeLitany(e.target.checked);
                        setPrayKey((k) => k + 1);
                      }}
                      className="ml-3 h-4 w-4 rounded border-gray-300"
                    />
                  </label>

                  {/* Scripture */}
                  <label className="flex cursor-pointer items-center justify-between py-3.5">
                    <div>
                      <p className="text-sm font-semibold text-gray-800">{t({ en: 'Scripture Reading', es: 'Lectura bíblica' })}</p>
                      <p className="text-xs text-gray-500">{t({ en: 'Bible passage for each mystery', es: 'Pasaje bíblico para cada misterio' })}</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={includeScripture}
                      onChange={(e) => setIncludeScripture(e.target.checked)}
                      className="ml-3 h-4 w-4 rounded border-gray-300"
                    />
                  </label>

                  {/* Intention */}
                  <div className="py-3.5">
                    <div className="mb-2">
                      <p className="text-sm font-semibold text-gray-800">{t({ en: 'Intention', es: 'Intención' })}</p>
                      <p className="text-xs text-gray-500">{t({ en: 'Who or what are you praying this rosary for?', es: '¿Por quién o qué rezas este rosario?' })}</p>
                    </div>
                    <input
                      type="text"
                      value={intention}
                      onChange={(e) => setIntention(e.target.value)}
                      placeholder={t({ en: 'e.g. My family, healing for a friend…', es: 'p.ej. Mi familia, sanación de un amigo…' })}
                      className="w-full appearance-none rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-800 placeholder-gray-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-300 focus:outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-500"
                    />
                  </div>
                </div>

                {/* Text size toggle row */}
                <div className="border-t border-gray-100 px-5 py-3.5 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-gray-800">{t({ en: 'Bigger Text', es: 'Texto Grande' })}</p>
                    <p className="text-xs text-gray-500">{t({ en: 'Easier to read on screen', es: 'Más fácil de leer en pantalla' })}</p>
                  </div>
                  <button
                    onClick={toggleTextSize}
                    aria-pressed={isLarge}
                    className={`ml-3 flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                      isLarge ? 'bg-brand-50 text-brand-700' : 'border border-gray-200 text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <span aria-hidden="true" className="inline-flex items-end gap-0.5 font-display leading-none text-brand-700">
                      <span className="text-[10px]">A</span>
                      <span className="text-sm">A</span>
                    </span>
                    {isLarge ? t({ en: 'On ✓', es: 'Activado ✓' }) : t({ en: 'Off', es: 'Apagado' })}
                  </button>
                </div>

                {/* Card footer: CTA */}
                <div className="border-t border-gray-100 bg-gray-50 px-5 py-4">
                  <button
                    onClick={handleStartPraying}
                    className="w-full rounded-xl bg-brand-600 py-3.5 text-sm font-bold text-white shadow-sm transition-colors hover:bg-brand-700 focus:outline-none focus:ring-4 focus:ring-brand-300"
                  >
                    {t({ en: 'Start Praying →', es: 'Comenzar a Rezar →' })}
                  </button>
                </div>
              </div>
            )}
          </div>

          {prayingStarted && (
            <>
              <RosaryPray
                key={prayKey}
                mysterySet={selectedMystery}
                beginnerMode={beginnerMode}
                includeFatima={includeFatima}
                includeLitany={includeLitany}
                includeScripture={includeScripture}
                intention={intention}
              />
              <div className="mt-8 text-center">
                <button
                  onClick={() => {
                    setPrayingStarted(false);
                    setPrayKey((k) => k + 1);
                    requestAnimationFrame(() => {
                      if (prayOptionsRef.current) {
                        const stickyHeader = document.querySelector('header');
                        const headerHeight = stickyHeader instanceof HTMLElement ? stickyHeader.offsetHeight : 64;
                        const top = prayOptionsRef.current.getBoundingClientRect().top + window.scrollY - headerHeight - 12;
                        window.scrollTo({ top, behavior: 'smooth' });
                      }
                    });
                  }}
                  className="inline-flex items-center gap-2 rounded-xl border border-gray-200 px-5 py-2.5 text-sm font-medium text-gray-500 transition-colors hover:bg-gray-50 hover:text-gray-700"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4" aria-hidden="true">
                    <path fillRule="evenodd" d="M7.793 2.232a.75.75 0 01-.025 1.06L3.622 7.25h10.003a5.375 5.375 0 010 10.75H10.75a.75.75 0 010-1.5h2.875a3.875 3.875 0 000-7.75H3.622l4.146 3.957a.75.75 0 01-1.036 1.085l-5.5-5.25a.75.75 0 010-1.085l5.5-5.25a.75.75 0 011.06.025z" clipRule="evenodd" />
                  </svg>
                  {t({ en: 'Reset & Customize', es: 'Reiniciar y Personalizar' })}
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {activeTab === 'learn' && (
        <RosaryLearn
          onNavigateToPray={handleBackToPray}
          scrollToWhatToChoose={scrollToWhatToChoose}
        />
      )}

      {activeTab === 'mysteries' && (
        <RosaryMysteries />
      )}

    </div>
  );
}

export default function HomePage() {
  return (
    <Suspense>
      <HomeContent />
    </Suspense>
  );
}
