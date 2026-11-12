import { describe, expect, it } from 'vitest';
import { getWeatherPresentation } from '../../src/lib/weatherCodes';

describe('getWeatherPresentation', () => {
  it.each([
    [0, 'Céu limpo'],
    [3, 'Nublado'],
    [61, 'Chuva fraca'],
    [95, 'Trovoada'],
  ])('returns the condition and an icon for code %i', (code, condition) => {
    const presentation = getWeatherPresentation(code);
    expect(presentation.condition).toBe(condition);
    expect(presentation.icon).not.toBe('');
  });

  it.each([999, -1, undefined])('uses the unavailable fallback for %s', (code) => {
    expect(getWeatherPresentation(code)).toEqual({
      condition: 'Condição indisponível',
      icon: '🌡️',
    });
  });
});
