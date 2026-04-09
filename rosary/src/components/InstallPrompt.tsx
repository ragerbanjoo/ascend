'use client';

import React, { useEffect, useState } from 'react';

type Platform = 'ios' | 'android' | null;

function detectPlatform(): Platform {
  if (typeof navigator === 'undefined') return null;
  const ua = navigator.userAgent;
  const isIOS = /iPhone|iPad|iPod/.test(ua);
  const isAndroid = /Android/.test(ua);
  if (isIOS) return 'ios';
  if (isAndroid) return 'android';
  return null;
}

function isStandalone(): boolean {
  if (typeof window === 'undefined') return false;
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

export function InstallPrompt() {
  const [visible, setVisible] = useState(false);
  const [platform, setPlatform] = useState<Platform>(null);
  const [step, setStep] = useState<'ios' | 'android'>('ios');

  useEffect(() => {
    const platform = detectPlatform();
    if (!platform) return;
    if (isStandalone()) return;
    const key = 'install-prompt-seen';
    if (sessionStorage.getItem(key)) return;
    setPlatform(platform);
    setVisible(true);
  }, []);

  function dismiss() {
    sessionStorage.setItem('install-prompt-seen', '1');
    setVisible(false);
  }

  if (!visible || !platform) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-end justify-center"
      style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(3px)' }}
      onClick={dismiss}
    >
      <div
        className="w-full max-w-sm mx-3 mb-6 rounded-2xl overflow-hidden shadow-2xl"
        style={{ background: 'var(--surface-card)', border: '1px solid var(--surface-border)' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-5 py-4"
          style={{ background: 'linear-gradient(135deg, #1a5f44 0%, #144030 100%)' }}
        >
          <div className="flex items-center gap-3">
            <img src="/images/rosary-logo.png" alt="" className="h-9 w-9 rounded-xl" />
            <div>
              <p className="text-xs font-semibold text-green-200 uppercase tracking-wider">Add to Home Screen</p>
              <p className="text-sm font-bold text-white leading-tight">Holy Rosary App</p>
            </div>
          </div>
          <button
            onClick={dismiss}
            aria-label="Close"
            className="flex h-7 w-7 items-center justify-center rounded-full text-white/60 hover:text-white transition-colors"
            style={{ background: 'rgba(255,255,255,0.12)' }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Tab switcher */}
        <div className="flex border-b" style={{ borderColor: 'var(--surface-border)' }}>
          {(['ios', 'android'] as const).map((p) => (
            <button
              key={p}
              onClick={() => setStep(p)}
              className="flex-1 py-2.5 text-xs font-semibold transition-colors"
              style={{
                color: step === p ? '#1a5f44' : 'var(--text-muted)',
                borderBottom: step === p ? '2px solid #1a5f44' : '2px solid transparent',
                background: 'transparent',
              }}
            >
              {p === 'ios' ? '🍎 iPhone / iPad' : '🤖 Android'}
            </button>
          ))}
        </div>

        {/* Steps */}
        <div className="px-5 py-4 space-y-3">
          {step === 'ios' ? (
            <>
              <Step n={1} icon={DotsIcon} text={<>Tap the <strong>⋯ three dots</strong> button at the bottom-right of Safari</>} />
              <Step n={2} icon={ShareIcon} text={<>Tap the <strong>Share</strong> button (box with arrow pointing up)</>} />
              <Step n={3} icon={ScrollIcon} text={<>Scroll down and tap <strong>&quot;Add to Home Screen&quot;</strong></>} />
              <Step n={4} icon={CheckIcon} text={<>Tap <strong>&quot;Add&quot;</strong> — done! Open the app from your home screen</>} />
            </>
          ) : (
            <>
              <Step n={1} icon={DotsIcon} text={<>Tap the <strong>⋮ menu</strong> (three dots) in the top-right of Chrome</>} />
              <Step n={2} icon={HomeIcon} text={<>Tap <strong>&quot;Add to Home screen&quot;</strong></>} />
              <Step n={3} icon={CheckIcon} text={<>Tap <strong>&quot;Add&quot;</strong> — done! Open the app from your home screen</>} />
            </>
          )}
        </div>

        <div className="px-5 pb-5">
          <button
            onClick={dismiss}
            className="w-full rounded-xl py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
            style={{ background: 'linear-gradient(135deg, #1a5f44 0%, #207753 100%)' }}
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
}

function Step({ n, icon: Icon, text }: { n: number; icon: React.FC; text: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3">
      <span
        className="mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
        style={{ background: '#1a5f44' }}
      >
        {n}
      </span>
      <div className="flex items-center gap-2">
        <span className="flex-shrink-0 text-[#1a5f44]">
          <Icon />
        </span>
        <p className="text-sm leading-snug" style={{ color: 'var(--text-primary)' }}>
          {text}
        </p>
      </div>
    </div>
  );
}

function ShareIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 11l3-3m0 0l3 3m-3-3v8m0-8a9 9 0 110 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 7.5m0 0L7.5 12M12 7.5V18" />
    </svg>
  );
}

function ScrollIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m0 0l-4-4m4 4l4-4" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function DotsIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
      <circle cx="12" cy="5" r="1.5" />
      <circle cx="12" cy="12" r="1.5" />
      <circle cx="12" cy="19" r="1.5" />
    </svg>
  );
}

function HomeIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955a1.5 1.5 0 012.092 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
    </svg>
  );
}
