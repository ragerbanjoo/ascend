'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import Cookies from 'js-cookie';

type Theme = 'light' | 'dark';

const THEME_KEY = 'sjd_theme';
const THEME_COOKIE = 'sjd_theme';
const THEME_MANUAL_KEY = 'sjd_theme_manual';

interface DarkModeContextType {
  theme: Theme;
  setTheme: (t: Theme) => void;
  toggleTheme: () => void;
  isDark: boolean;
}

const DarkModeContext = createContext<DarkModeContextType | undefined>(undefined);

export function DarkModeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('light');

  useEffect(() => {
    const stored = localStorage.getItem(THEME_KEY) as Theme | null;
    const cookieVal = Cookies.get(THEME_COOKIE) as Theme | undefined;
    const hasManual = localStorage.getItem(THEME_MANUAL_KEY) === '1';

    let initial: Theme;
    if (hasManual && (stored === 'dark' || stored === 'light')) {
      // User explicitly set a preference — honour it
      initial = stored;
    } else if (!hasManual && cookieVal === 'dark') {
      initial = 'dark';
    } else {
      // No manual override — fall back to system preference
      initial = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }

    setThemeState(initial);
    document.documentElement.setAttribute('data-theme', initial);

    // Listen for OS-level changes only when no manual override exists
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handleSystem = (e: MediaQueryListEvent) => {
      if (localStorage.getItem(THEME_MANUAL_KEY) !== '1') {
        const next: Theme = e.matches ? 'dark' : 'light';
        setThemeState(next);
        document.documentElement.setAttribute('data-theme', next);
      }
    };
    mq.addEventListener('change', handleSystem);
    return () => mq.removeEventListener('change', handleSystem);
  }, []);

  const setTheme = useCallback((t: Theme) => {
    setThemeState(t);
    localStorage.setItem(THEME_KEY, t);
    localStorage.setItem(THEME_MANUAL_KEY, '1');
    Cookies.set(THEME_COOKIE, t, { expires: 365 });
    document.documentElement.setAttribute('data-theme', t);
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  }, [theme, setTheme]);

  return (
    <DarkModeContext.Provider value={{ theme, setTheme, toggleTheme, isDark: theme === 'dark' }}>
      {children}
    </DarkModeContext.Provider>
  );
}

export function useDarkMode() {
  const context = useContext(DarkModeContext);
  if (context === undefined) {
    throw new Error('useDarkMode must be used within a DarkModeProvider');
  }
  return context;
}
