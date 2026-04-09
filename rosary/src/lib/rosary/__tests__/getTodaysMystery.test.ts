import { describe, it, expect } from 'vitest';
import { getTodaysMystery } from '../data';

// Helper: create a Date guaranteed to be a specific day-of-week in local time
function makeDayOfWeek(dayIndex: number): Date {
  // Start from a known Sunday (2026-01-04 is a Sunday in local time via year/month/day constructor)
  const base = new Date(2026, 0, 4); // Jan 4 2026 = Sunday (day 0) in local time
  base.setDate(base.getDate() + dayIndex);
  return base;
}

describe('getTodaysMystery', () => {
  it('returns glorious for Sunday (day 0)', () => {
    expect(getTodaysMystery(makeDayOfWeek(0))).toBe('glorious');
  });

  it('returns joyful for Monday (day 1)', () => {
    expect(getTodaysMystery(makeDayOfWeek(1))).toBe('joyful');
  });

  it('returns sorrowful for Tuesday (day 2)', () => {
    expect(getTodaysMystery(makeDayOfWeek(2))).toBe('sorrowful');
  });

  it('returns glorious for Wednesday (day 3)', () => {
    expect(getTodaysMystery(makeDayOfWeek(3))).toBe('glorious');
  });

  it('returns luminous for Thursday (day 4)', () => {
    expect(getTodaysMystery(makeDayOfWeek(4))).toBe('luminous');
  });

  it('returns sorrowful for Friday (day 5)', () => {
    expect(getTodaysMystery(makeDayOfWeek(5))).toBe('sorrowful');
  });

  it('returns joyful for Saturday (day 6)', () => {
    expect(getTodaysMystery(makeDayOfWeek(6))).toBe('joyful');
  });

  it('defaults to current date when no argument', () => {
    const result = getTodaysMystery();
    expect(['joyful', 'sorrowful', 'glorious', 'luminous']).toContain(result);
  });
});
