'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import { InstallPrompt } from '@/components/InstallPrompt';
import { I18nProvider } from '@/lib/i18n/context';
import { usePathname, useSearchParams, useRouter } from 'next/navigation';
import { useI18n } from '@/lib/i18n/context';
import { TextSizeProvider, useTextSize } from '@/lib/textSize/context';
import { DarkModeProvider, useDarkMode } from '@/lib/darkMode/context';

function LangToggle() {
  const { locale, setLocale } = useI18n();
  return (
    <button
      onClick={() => setLocale(locale === 'en' ? 'es' : 'en')}
      className="rounded-lg border bg-transparent px-3 py-1.5 text-xs font-medium transition-colors"
      style={{ borderColor: 'var(--nav-pill-border)', color: 'var(--nav-text)' }}
      aria-label={locale === 'en' ? 'Switch to Spanish' : 'Cambiar a inglés'}
    >
      {locale === 'en' ? 'Español' : 'English'}
    </button>
  );
}

function NavMenu() {
  const { t } = useI18n();
  const { isLarge, toggleTextSize } = useTextSize();
  const { isDark, toggleTheme } = useDarkMode();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  const navLinks = [
    { href: '/?tab=pray', label: { en: 'Pray', es: 'Rezar' } },
    { href: '/?tab=learn', label: { en: 'Learn', es: 'Aprender' } },
    { href: '/?tab=mysteries', label: { en: 'Mysteries', es: 'Misterios' } },
  ];

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex h-9 w-9 items-center justify-center rounded-lg border bg-transparent transition-colors"
        style={{ borderColor: 'var(--nav-pill-border)', color: 'var(--nav-text)' }}
        aria-label={t({ en: 'Open menu', es: 'Abrir menú' })}
        aria-expanded={open}
      >
        {open ? (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
          </svg>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-11 z-50 min-w-[180px] overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xl">
          <div className="border-b border-gray-100 px-4 py-2">
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
              {t({ en: 'Navigate', es: 'Navegar' })}
            </p>
          </div>
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-700 transition-colors hover:bg-brand-50 hover:text-brand-700"
            >
              {t(link.label)}
            </a>
          ))}
          <div className="border-t border-gray-100 px-4 py-3 space-y-1">
            <button
              onClick={() => { toggleTextSize(); setOpen(false); }}
              className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                isLarge
                  ? 'bg-brand-50 text-brand-700'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
              aria-pressed={isLarge}
            >
              <span aria-hidden="true" className="inline-flex items-end gap-0.5 font-display leading-none text-brand-700">
                <span className="text-[10px]">A</span>
                <span className="text-sm">A</span>
              </span>
              {isLarge
                ? t({ en: 'Bigger text ✓', es: 'Texto grande ✓' })
                : t({ en: 'Bigger text', es: 'Texto grande' })}
            </button>
            <button
              onClick={() => { toggleTheme(); setOpen(false); }}
              className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                isDark
                  ? 'bg-brand-50 text-brand-700'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
              aria-pressed={isDark}
            >
              {isDark ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />
                </svg>
              )}
              {isDark
                ? t({ en: 'Dark mode ✓', es: 'Modo oscuro ✓' })
                : t({ en: 'Dark mode', es: 'Modo oscuro' })}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function SiteFooter() {
  const { t } = useI18n();
  return (
    <footer className="border-t border-gray-200 bg-white pb-28 pt-6 text-center text-xs text-gray-600">
      <p className="flex items-center justify-center gap-2 italic text-gray-500">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-3.5 w-3.5" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v18M8 7h8" />
        </svg>
        <span>Benedictus sis, Deo volente</span>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-3.5 w-3.5" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v18M8 7h8" />
        </svg>
      </p>
      <p className="mt-1 text-gray-500">
        <a
          href="https://hihello.com/p/3e649a22-f827-498d-a282-f51aa5de3dde"
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:text-brand-600 transition-colors"
        >
          {t({ en: 'designed by alex :)', es: 'diseñado por alex :)' })}
        </a>
      </p>
    </footer>
  );
}

type Tab = 'pray' | 'learn' | 'mysteries';

function BottomTabBar() {
  const { t } = useI18n();
  const searchParams = useSearchParams();
  const router = useRouter();
  const activeTab = (searchParams.get('tab') as Tab) || 'pray';

  const tabs: { key: Tab; label: { en: string; es: string }; icon: React.ReactNode }[] = [
    {
      key: 'pray',
      label: { en: 'Pray', es: 'Rezar' },
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
          <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
        </svg>
      ),
    },
    {
      key: 'learn',
      label: { en: 'Learn', es: 'Aprender' },
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
          <path d="M11.25 4.533A9.707 9.707 0 006 3a9.735 9.735 0 00-3.25.555.75.75 0 00-.5.707v14.25a.75.75 0 001 .707A8.237 8.237 0 016 18.75c1.995 0 3.823.707 5.25 1.886V4.533zM12.75 20.636A8.214 8.214 0 0118 18.75c.966 0 1.89.166 2.75.47a.75.75 0 001-.708V4.262a.75.75 0 00-.5-.707A9.735 9.735 0 0018 3a9.707 9.707 0 00-5.25 1.533v16.103z" />
        </svg>
      ),
    },
    {
      key: 'mysteries',
      label: { en: 'Mysteries', es: 'Misterios' },
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
          <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm8.706-1.442c1.146-.573 2.437.463 2.126 1.706l-.709 2.836.042-.02a.75.75 0 01.67 1.34l-.04.022c-1.147.573-2.438-.463-2.127-1.706l.71-2.836-.042.02a.75.75 0 11-.671-1.34l.041-.022zM12 9a.75.75 0 100-1.5.75.75 0 000 1.5z" clipRule="evenodd" />
        </svg>
      ),
    },
  ];

  return (
    <div
      className="fixed bottom-5 left-0 right-0 z-50 flex justify-center pointer-events-none"
      aria-label={t({ en: 'Main navigation', es: 'Navegación principal' })}
    >
      <nav
        className="pointer-events-auto flex items-center gap-1 rounded-full px-2 py-2"
        style={{
          background: 'transparent',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid var(--bottom-nav-pill-border)',
          boxShadow: '0 4px 24px rgba(0,0,0,0.10)',
        }}
      >
        {tabs.map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => router.push(`/?tab=${tab.key}`)}
              className="relative flex flex-col items-center gap-0.5 rounded-full px-5 py-2 text-[10px] font-semibold transition-all duration-200"
              style={{
                color: isActive ? 'var(--bottom-nav-text)' : 'var(--bottom-nav-text-muted)',
                background: isActive ? 'var(--bottom-nav-pill-active-bg)' : 'transparent',
              }}
              aria-current={isActive ? 'page' : undefined}
            >
              <span className={`transition-transform duration-200 ${isActive ? 'scale-110' : 'scale-100'}`}>
                {tab.icon}
              </span>
              <span className="tracking-wide">{t(tab.label)}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}

function SiteShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith('/admin');

  if (isAdmin) return <>{children}</>;

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <header className="sticky top-0 z-40 shadow-md backdrop-blur-md" style={{background: 'var(--nav-bg)', borderBottom: '1px solid var(--nav-border)'}}>
        <div className="mx-auto flex max-w-4xl items-center justify-between gap-2 px-4 py-3 sm:px-6">
          <a href="/" className="min-w-0 flex-1 font-display text-sm font-bold tracking-wide sm:text-base transition-colors" style={{ color: 'var(--nav-text)' }}>
            St. Juan Diego Young Adult Group
          </a>
          <div className="flex flex-shrink-0 items-center gap-2">
            <LangToggle />
            <NavMenu />
          </div>
        </div>
      </header>
      <main className="flex-1 pb-28">{children}</main>
      <SiteFooter />
      <Suspense fallback={null}>
        <BottomTabBar />
      </Suspense>
      <InstallPrompt />
    </div>
  );
}

export function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <I18nProvider>
      <TextSizeProvider>
        <DarkModeProvider>
          <SiteShell>{children}</SiteShell>
        </DarkModeProvider>
      </TextSizeProvider>
    </I18nProvider>
  );
}
