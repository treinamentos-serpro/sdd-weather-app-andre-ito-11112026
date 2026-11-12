import { formatDayLabel } from '../lib/format';
import { formatTemperature } from '../lib/temperature';
import { getWeatherPresentation } from '../lib/weatherCodes';
import type { ForecastDay, Unit } from '../types/weather';

interface ForecastCardProps {
  day: ForecastDay;
  unit: Unit;
}

function formatPrecipitationProbability(value: number | undefined): string {
  if (value === undefined || !Number.isFinite(value)) {
    return 'Indisponível';
  }

  return `${new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 0 }).format(value)}%`;
}

export default function ForecastCard({ day, unit }: ForecastCardProps) {
  const dayLabel = formatDayLabel(day.date);
  const weather = getWeatherPresentation(day.weatherCode);

  return (
    <article
      aria-label={`Previsão para ${dayLabel}`}
      className="flex min-h-56 flex-col items-center rounded-xl border border-white/10 bg-white/5 p-4 text-center text-white shadow-glass backdrop-blur-md"
    >
      <h3 className="text-sm font-medium capitalize text-white/75">{dayLabel}</h3>
      <span aria-label={weather.condition} className="mt-3 text-4xl" role="img">
        {weather.icon}
      </span>
      <p className="mt-2 min-h-10 text-sm text-white/75">{weather.condition}</p>

      <dl className="mt-auto grid w-full grid-cols-2 gap-3 pt-4 text-sm">
        <div>
          <dt className="text-white/55">Máx.</dt>
          <dd className="mt-1 font-semibold">{formatTemperature(day.maxTemperatureC, unit)}</dd>
        </div>
        <div>
          <dt className="text-white/55">Mín.</dt>
          <dd className="mt-1 font-semibold">{formatTemperature(day.minTemperatureC, unit)}</dd>
        </div>
        <div className="col-span-2 border-t border-white/10 pt-2">
          <dt className="text-white/55">Probabilidade de chuva</dt>
          <dd className="mt-1 font-medium">
            {formatPrecipitationProbability(day.precipitationProbabilityPercent)}
          </dd>
        </div>
      </dl>
    </article>
  );
}
