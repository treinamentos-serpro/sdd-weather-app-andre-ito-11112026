import { describe, expect, it } from 'vitest';
import { formatDayLabel } from '../../src/lib/format';

describe('formatDayLabel', () => {
  it.each([
    ['2026-11-11', 'qua., 11 de nov.'],
    ['2026-11-12', 'qui., 12 de nov.'],
    ['2026-11-13', 'sex., 13 de nov.'],
    ['2024-02-29', 'qui., 29 de fev.'],
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
