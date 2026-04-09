'use client';

import React, { useRef, useEffect } from 'react';
import { useI18n } from '@/lib/i18n/context';
import { SCHEDULE_NOTE } from '@/lib/rosary/data';
import { WHAT_TO_CHOOSE_DATA } from '@/lib/rosary/learnWhatToChoose';
import type { WhatToChooseCard } from '@/lib/rosary/learnWhatToChoose';

interface RosaryLearnProps {
  onNavigateToPray?: () => void;
  scrollToWhatToChoose?: boolean;
}

export default function RosaryLearn({ onNavigateToPray, scrollToWhatToChoose }: RosaryLearnProps) {
  const { t, locale } = useI18n();
  const whatToChooseRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    if (!scrollToWhatToChoose) return;
    const doScroll = () => {
      if (!whatToChooseRef.current) return;
      whatToChooseRef.current.focus();
      const stickyHeader = document.querySelector('header');
      const stickySubnav = document.querySelector('nav[aria-label]');
      const headerH = stickyHeader instanceof HTMLElement ? stickyHeader.offsetHeight : 56;
      const subnavH = stickySubnav instanceof HTMLElement ? stickySubnav.offsetHeight : 56;
      const topPadding = 16;
      const top = whatToChooseRef.current.getBoundingClientRect().top + window.scrollY - headerH - subnavH - topPadding;
      window.scrollTo({ top, behavior: 'smooth' });
    };
    // Double rAF ensures the tab has fully rendered before measuring
    requestAnimationFrame(() => requestAnimationFrame(doScroll));
  }, [scrollToWhatToChoose]);

  const data = WHAT_TO_CHOOSE_DATA;

  const sections = [
    { id: 'what-is-rosary', label: { en: 'What is it?', es: '¿Qué es?' } },
    { id: 'why-pray', label: { en: 'Why pray it?', es: '¿Por qué rezar?' } },
    { id: 'history', label: { en: 'History', es: 'Historia' } },
    { id: 'tips', label: { en: 'Tips', es: 'Consejos' } },
    { id: 'schedule', label: { en: 'Schedule', es: 'Horario' } },
    { id: 'what-to-choose', label: { en: 'What to choose', es: 'Qué elegir' } },
  ];

  return (
    <div className="mx-auto max-w-2xl space-y-10">
      {/* Quick-nav table of contents */}
      <nav className="sticky top-[3.5rem] z-30 -mx-4 border-b border-gray-200 bg-gray-50/95 px-4 py-3 backdrop-blur-sm sm:-mx-6 sm:px-6" aria-label={t({ en: 'Jump to section', es: 'Ir a sección' })}>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
          {sections.map((s, i) => (
            <a
              key={s.id}
              href={`#${s.id}`}
              className="text-sm font-medium text-brand-600 hover:text-brand-800 hover:underline transition-colors"
            >
              {t(s.label)}{i < sections.length - 1 && <span className="ml-4 text-gray-300" aria-hidden="true">·</span>}
            </a>
          ))}
        </div>
      </nav>

      {/* What is the Rosary? */}
      <section id="what-is-rosary" className="scroll-mt-32">
        <h3 className="font-display text-2xl font-bold text-gray-900">
          {t({ en: 'What is the Rosary?', es: '¿Qué es el Rosario?' })}
        </h3>
        <p className="mt-4 leading-relaxed text-gray-700">
          {t({
            en: 'The Rosary is a traditional Catholic devotion combining vocal prayer and meditation on the mysteries of the life of Jesus Christ and the Blessed Virgin Mary. It is prayed using a set of beads that help count the prayers. The word "Rosary" comes from the Latin "rosarium," meaning "crown of roses" — each prayer offered is like a spiritual rose given to Mary.',
            es: 'El Rosario es una devoción católica tradicional que combina la oración vocal con la meditación sobre los misterios de la vida de Jesucristo y la Santísima Virgen María. Se reza utilizando un conjunto de cuentas que ayudan a contar las oraciones. La palabra "Rosario" viene del latín "rosarium," que significa "corona de rosas" — cada oración ofrecida es como una rosa espiritual entregada a María.',
          })}
        </p>
      </section>

      {/* Why do Catholics pray it? */}
      <section id="why-pray" className="scroll-mt-32">
        <h3 className="font-display text-2xl font-bold text-gray-900">
          {t({ en: 'Why Do Catholics Pray It?', es: '¿Por Qué los Católicos Rezan el Rosario?' })}
        </h3>
        <p className="mt-4 leading-relaxed text-gray-700">
          {t({
            en: 'Catholics pray the Rosary to meditate on the key events — or "mysteries" — in the lives of Jesus and Mary. It is a way to draw closer to God through Scripture-based reflection, repetitive prayer that calms the mind, and the intercession of the Blessed Virgin Mary. Many saints, popes, and apparitions of Mary (especially at Fatima in 1917) have encouraged the faithful to pray the Rosary daily for peace and conversion.',
            es: 'Los católicos rezan el Rosario para meditar sobre los eventos clave — o "misterios" — en la vida de Jesús y María. Es una manera de acercarse a Dios a través de la reflexión basada en las Escrituras, la oración repetitiva que calma la mente y la intercesión de la Santísima Virgen María. Muchos santos, papas y apariciones de María (especialmente en Fátima en 1917) han animado a los fieles a rezar el Rosario diariamente por la paz y la conversión.',
          })}
        </p>
      </section>

      {/* Short history */}
      <section id="history" className="scroll-mt-32">
        <h3 className="font-display text-2xl font-bold text-gray-900">
          {t({ en: 'A Brief History', es: 'Una Breve Historia' })}
        </h3>
        <p className="mt-4 leading-relaxed text-gray-700">
          {t({
            en: 'The Rosary as we know it developed over several centuries. Its roots go back to early monks who would recite 150 Psalms; lay people who could not read began substituting 150 Hail Marys. By the 15th century, the practice of meditating on specific mysteries was introduced. St. Dominic (13th century) is traditionally credited with promoting the Rosary, and in 2002 Pope St. John Paul II added the Luminous Mysteries to the traditional three sets — Joyful, Sorrowful, and Glorious.',
            es: 'El Rosario tal como lo conocemos se desarrolló a lo largo de varios siglos. Sus raíces se remontan a los primeros monjes que recitaban 150 Salmos; las personas laicas que no sabían leer comenzaron a sustituirlos con 150 Avemarías. Para el siglo XV, se introdujo la práctica de meditar sobre misterios específicos. Santo Domingo (siglo XIII) es tradicionalmente reconocido por promover el Rosario, y en 2002 el Papa San Juan Pablo II añadió los Misterios Luminosos a los tres conjuntos tradicionales: Gozosos, Dolorosos y Gloriosos.',
          })}
        </p>
      </section>

      {/* Tips */}
      <section id="tips" className="scroll-mt-32">
        <h3 className="font-display text-2xl font-bold text-gray-900">
          {t({ en: 'Tips for Praying', es: 'Consejos para Rezar' })}
        </h3>
        <ul className="mt-4 space-y-3">
          {[
            {
              en: 'Find a quiet place free from distractions. Even 5 minutes of focused prayer is better than a rushed full Rosary.',
              es: 'Busca un lugar tranquilo, libre de distracciones. Incluso 5 minutos de oración concentrada es mejor que un Rosario completo apresurado.',
            },
            {
              en: 'Read the Scripture passage for each mystery before starting the decade. Let the scene come alive in your imagination.',
              es: 'Lee el pasaje bíblico de cada misterio antes de comenzar la decena. Deja que la escena cobre vida en tu imaginación.',
            },
            {
              en: 'Don\'t worry if your mind wanders — gently bring it back. The repetition of the prayers is itself a form of meditation.',
              es: 'No te preocupes si tu mente divaga — suavemente regresa a la oración. La repetición de las oraciones es en sí misma una forma de meditación.',
            },
            {
              en: 'Pray with others when possible. Our group prays the Rosary together — join us!',
              es: 'Reza con otros cuando sea posible. Nuestro grupo reza el Rosario juntos — ¡únete!',
            },
            {
              en: 'Use our guided experience above. It walks you through each step, perfect for beginners and experienced alike.',
              es: 'Usa nuestra experiencia guiada arriba. Te guía paso a paso, perfecta tanto para principiantes como para quienes ya la conocen.',
            },
          ].map((tip, i) => (
            <li key={i} className="flex gap-3 text-gray-700">
              <span className="mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-brand-100 text-xs font-bold text-brand-700">
                {i + 1}
              </span>
              <span className="leading-relaxed">{t(tip)}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* Weekly schedule */}
      <section id="schedule" className="scroll-mt-32 rounded-xl bg-brand-50 p-6 text-center">
        <h4 className="font-semibold text-brand-800">
          {t({ en: 'Weekly Mystery Schedule', es: 'Horario Semanal de Misterios' })}
        </h4>
        <p className="mt-2 text-sm text-brand-700">{t(SCHEDULE_NOTE)}</p>
      </section>

      {/* ═══ What should I choose to pray? ═══ */}
      <section id="what-to-choose" className="scroll-mt-32">
        <h3
          ref={whatToChooseRef}
          tabIndex={-1}
          className="font-display text-2xl font-bold text-gray-900 outline-none"
        >
          {t(data.heading)}
        </h3>
        <p className="mt-4 leading-relaxed text-gray-700">{t(data.intro)}</p>

        <div className="mt-8 space-y-6">
          {data.cards.map((card: WhatToChooseCard) => (
            <div key={card.id} className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
              <h4 className="font-display text-lg font-bold text-gray-900">{t(card.title)}</h4>

              {/* What it is */}
              <p className="mt-3 text-sm leading-relaxed text-gray-700">{t(card.whatItIs)}</p>

              {/* When to include */}
              <div className="mt-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-brand-700">
                  {t({ en: 'When to include', es: 'Cuándo incluirla' })}
                </p>
                <ul className="mt-1.5 space-y-1">
                  {(locale === 'en' ? card.whenToInclude.en : card.whenToInclude.es).map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                      <span className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-brand-400" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              {/* When to skip */}
              <div className="mt-3">
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                  {t({ en: 'When to skip', es: 'Cuándo omitirla' })}
                </p>
                <ul className="mt-1.5 space-y-1">
                  {(locale === 'en' ? card.whenToSkip.en : card.whenToSkip.es).map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                      <span className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-gray-300" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Quick tip */}
              <div className="mt-4 rounded-lg bg-brand-50 px-4 py-3">
                <p className="text-sm text-brand-800">
                  <span className="font-semibold">{t({ en: 'Quick tip:', es: 'Tip rápido:' })}</span>{' '}
                  {t(card.quickTip)}
                </p>
              </div>

              {/* Sources */}
              {card.sources.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-3">
                  {card.sources.map((src, i) => (
                    <a
                      key={i}
                      href={src.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs font-medium text-brand-600 hover:text-brand-700 transition-colors"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-3.5 w-3.5" aria-hidden="true">
                        <path fillRule="evenodd" d="M4.25 5.5a.75.75 0 00-.75.75v8.5c0 .414.336.75.75.75h8.5a.75.75 0 00.75-.75v-4a.75.75 0 011.5 0v4A2.25 2.25 0 0112.75 17h-8.5A2.25 2.25 0 012 14.75v-8.5A2.25 2.25 0 014.25 4h5a.75.75 0 010 1.5h-5zm4.943-.69l5.5-1a.75.75 0 01.882.654v5.5a.75.75 0 01-1.5 0V6.44l-5.22 5.22a.75.75 0 01-1.06-1.06l5.22-5.22h-3.524a.75.75 0 010-1.5h-.298z" clipRule="evenodd" />
                      </svg>
                      {src.label}
                    </a>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Back to Pray */}
        {onNavigateToPray && (
          <div className="mt-8 text-center">
            <button
              onClick={onNavigateToPray}
              className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-6 py-3 text-sm font-medium text-white shadow-sm transition-colors hover:bg-brand-700 focus:outline-none focus:ring-4 focus:ring-brand-300"
              aria-label={t({ en: 'Go back to Pray tab and options', es: 'Volver a la pestaña Rezar y opciones' })}
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4" aria-hidden="true">
                <path fillRule="evenodd" d="M17 10a.75.75 0 01-.75.75H5.612l4.158 3.96a.75.75 0 11-1.04 1.08l-5.5-5.25a.75.75 0 010-1.08l5.5-5.25a.75.75 0 111.04 1.08L5.612 9.25H16.25A.75.75 0 0117 10z" clipRule="evenodd" />
              </svg>
              {t(data.backLabel)}
            </button>
          </div>
        )}
      </section>
    </div>
  );
}
