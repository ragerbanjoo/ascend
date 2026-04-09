'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import Cookies from 'js-cookie';
import type { Locale, BilingualField } from '@/types';

const LANG_KEY = 'sjd_lang';
const LANG_COOKIE = 'sjd_lang';
const FIRST_VISIT_KEY = 'sjd_first_visit_done';

interface I18nContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (field: BilingualField | undefined | null, fallback?: string) => string;
  showLanguageChooser: boolean;
  dismissLanguageChooser: () => void;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

function detectBrowserLocale(): Locale {
  if (typeof navigator === 'undefined') return 'en';
  const lang = navigator.language || '';
  if (lang.startsWith('es')) return 'es';
  return 'en';
}

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>('en');
  const [showLanguageChooser, setShowLanguageChooser] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(LANG_KEY) as Locale | null;
    const cookieVal = Cookies.get(LANG_COOKIE) as Locale | undefined;
    const firstVisitDone = localStorage.getItem(FIRST_VISIT_KEY);

    if (stored) {
      setLocaleState(stored);
    } else if (cookieVal) {
      setLocaleState(cookieVal);
    } else {
      setLocaleState(detectBrowserLocale());
    }

    if (!firstVisitDone && !stored && !cookieVal) {
      setShowLanguageChooser(true);
    }

    setMounted(true);
  }, []);

  const setLocale = useCallback((newLocale: Locale) => {
    setLocaleState(newLocale);
    localStorage.setItem(LANG_KEY, newLocale);
    Cookies.set(LANG_COOKIE, newLocale, { expires: 365 });
  }, []);

  const dismissLanguageChooser = useCallback(() => {
    localStorage.setItem(FIRST_VISIT_KEY, 'true');
    setShowLanguageChooser(false);
  }, []);

  const t = useCallback(
    (field: BilingualField | undefined | null, fallback?: string): string => {
      if (!field) return fallback ?? '';
      const val = field[locale];
      if (val) return val;
      const otherLocale = locale === 'en' ? 'es' : 'en';
      return field[otherLocale as keyof BilingualField] || fallback || '';
    },
    [locale]
  );

  return (
    <I18nContext.Provider
      value={{ locale, setLocale, t, showLanguageChooser: mounted && showLanguageChooser, dismissLanguageChooser }}
    >
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (context === undefined) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
}
