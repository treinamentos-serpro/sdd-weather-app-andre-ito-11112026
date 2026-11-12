import type { Unit } from '../types/weather';

export function formatTemperature(temperatureC: number | undefined, unit: Unit): string {
  if (temperatureC === undefined || !Number.isFinite(temperatureC)) {
    return 'Indisponível';
  }

  const temperature = unit === 'fahrenheit' ? (temperatureC * 9) / 5 + 32 : temperatureC;
  if (!Number.isFinite(temperature)) {
    return 'Indisponível';
  }
  const formattedTemperature = new Intl.NumberFormat('pt-BR', {
    maximumFractionDigits: 1,
    minimumFractionDigits: 1,
  }).format(temperature);
  const unitLabel = unit === 'celsius' ? '°C' : '°F';

  return `${formattedTemperature} ${unitLabel}`;
}
