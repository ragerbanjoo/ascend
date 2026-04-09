'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import Cookies from 'js-cookie';

type TextSize = 'normal' | 'large';

const TEXT_SIZE_KEY = 'sjd_text_size';
const TEXT_SIZE_COOKIE = 'sjd_text_size';

interface TextSizeContextType {
  textSize: TextSize;
  setTextSize: (size: TextSize) => void;
  toggleTextSize: () => void;
  isLarge: boolean;
}

const TextSizeContext = createContext<TextSizeContextType | undefined>(undefined);

export function TextSizeProvider({ children }: { children: React.ReactNode }) {
  const [textSize, setTextSizeState] = useState<TextSize>('normal');

  useEffect(() => {
    // Read from localStorage first, then cookie
    const stored = localStorage.getItem(TEXT_SIZE_KEY) as TextSize | null;
    const cookieVal = Cookies.get(TEXT_SIZE_COOKIE) as TextSize | undefined;

    let initial: TextSize = 'normal';
    if (stored === 'large' || stored === 'normal') {
      initial = stored;
    } else if (cookieVal === 'large' || cookieVal === 'normal') {
      initial = cookieVal;
    } else if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: no-preference)').matches) {
      // Optionally check OS large text via devicePixelRatio heuristic — skip for simplicity
      initial = 'normal';
    }

    setTextSizeState(initial);
    document.documentElement.setAttribute('data-text-size', initial);
  }, []);

  const setTextSize = useCallback((size: TextSize) => {
    setTextSizeState(size);
    localStorage.setItem(TEXT_SIZE_KEY, size);
    Cookies.set(TEXT_SIZE_COOKIE, size, { expires: 365 });
    document.documentElement.setAttribute('data-text-size', size);
  }, []);

  const toggleTextSize = useCallback(() => {
    setTextSize(textSize === 'normal' ? 'large' : 'normal');
  }, [textSize, setTextSize]);

  return (
    <TextSizeContext.Provider value={{ textSize, setTextSize, toggleTextSize, isLarge: textSize === 'large' }}>
      {children}
    </TextSizeContext.Provider>
  );
}

export function useTextSize() {
  const context = useContext(TextSizeContext);
  if (context === undefined) {
    throw new Error('useTextSize must be used within a TextSizeProvider');
  }
  return context;
}
