import { describe, expect, it } from 'vitest';
import { formatTemperature } from '../../src/lib/temperature';

describe('formatTemperature', () => {
  it.each([
    [0, '32,0 °F'],
    [100, '212,0 °F'],
    [-40, '-40,0 °F'],
    [25.5, '77,9 °F'],
    [-10, '14,0 °F'],
  ])('converts %s °C to %s', (temperature, expected) => {
    expect(formatTemperature(temperature, 'fahrenheit')).toBe(expected);
  });

  it.each([
    [0, 'celsius', '0,0 °C'],
    [0, 'fahrenheit', '32,0 °F'],
    [25.54, 'celsius', '25,5 °C'],
    [25.56, 'celsius', '25,6 °C'],
    [25.56, 'fahrenheit', '78,0 °F'],
    [-10, 'celsius', '-10,0 °C'],
  ] as const)('formats %s °C in %s as %s', (temperature, unit, expected) => {
    expect(formatTemperature(temperature, unit)).toBe(expected);
  });

  it.each([
    undefined,
    Number.NaN,
    Number.POSITIVE_INFINITY,
    Number.NEGATIVE_INFINITY,
  ])('reports %s as unavailable for either unit', (temperature) => {
    expect(formatTemperature(temperature, 'celsius')).toBe('Indisponível');
    expect(formatTemperature(temperature, 'fahrenheit')).toBe('Indisponível');
  });

  it('does not display an infinite result if Fahrenheit conversion overflows', () => {
    expect(formatTemperature(Number.MAX_VALUE, 'fahrenheit')).toBe('Indisponível');
  });
});
