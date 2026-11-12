import { describe, expect, it } from 'vitest';
import { formatDateTime, formatDayLabel } from '../../src/lib/format';

describe('formatDayLabel', () => {
  it.each([
    ['2026-11-11', '11/11/2026'],
    ['2026-11-12', '12/11/2026'],
    ['2026-11-13', '13/11/2026'],
    ['2024-02-29', '29/02/2024'],
  ])('formats %s as %s in pt-BR', (date, expected) => {
    expect(formatDayLabel(date)).toBe(expected);
  });

  it.each([
    '',
    '11/11/2026',
    '2026-2-01',
    '2026-02-29',
    '2026-13-01',
    '2026-04-31',
  ])('returns the unavailable fallback for invalid date %s', (date) => {
    expect(formatDayLabel(date)).toBe('Data indisponível');
  });
});

describe('formatDateTime', () => {
  it.each([
    ['2026-11-11T17:05', '11/11/2026 17:05'],
    ['2026-11-11T17:05:00-03:00', '11/11/2026 17:05'],
  ])('formats %s as %s in pt-BR', (value, expected) => {
    expect(formatDateTime(value)).toBe(expected);
  });

  it.each([
    undefined,
    '',
    '2026-02-29T17:05',
    '2026-11-11T25:05',
  ])('returns the unavailable fallback for invalid date-time %s', (value) => {
    expect(formatDateTime(value)).toBe('Indisponível');
  });
});
