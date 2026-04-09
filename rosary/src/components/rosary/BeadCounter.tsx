'use client';

import React from 'react';

interface BeadCounterProps {
  total: number;
  current: number;
  onTap: () => void;
  label: string;
}

export default function BeadCounter({ total, current, onTap, label }: BeadCounterProps) {
  const pct = total > 0 ? current / total : 0;
  const size = 120;
  const stroke = 8;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - pct);

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Progress ring + tap button */}
      <div className="relative">
        <svg className="h-28 w-28" viewBox={`0 0 ${size} ${size}`} aria-hidden="true">
          <circle cx={size / 2} cy={size / 2} r={radius} fill="none" className="stroke-gray-200" strokeWidth={stroke} />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth={stroke}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className="text-brand-600 transition-all duration-300"
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
          />
        </svg>
        <button
          onClick={onTap}
          disabled={current >= total}
          className="absolute inset-0 flex flex-col items-center justify-center rounded-full focus:outline-none focus:ring-4 focus:ring-brand-300 disabled:opacity-50"
          aria-label={label}
        >
          <span className="text-3xl font-bold text-gray-900">{current}</span>
          <span className="text-xs text-gray-500">/ {total}</span>
        </button>
      </div>

      {/* Bead dots */}
      <div className="flex flex-wrap justify-center gap-1.5" aria-hidden="true">
        {Array.from({ length: total }, (_, i) => (
          <span
            key={i}
            className={`inline-block h-2.5 w-2.5 rounded-full transition-colors duration-200 ${
              i < current ? 'bg-brand-600' : 'bg-gray-200'
            }`}
          />
        ))}
      </div>

      <p className="text-center text-sm text-gray-500">{label}</p>
    </div>
  );
}
