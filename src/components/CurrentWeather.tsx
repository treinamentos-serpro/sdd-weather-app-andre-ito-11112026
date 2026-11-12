import { formatDateTime } from '../lib/format';
import { formatTemperature } from '../lib/temperature';
import { getWeatherPresentation } from '../lib/weatherCodes';
import type { City, CurrentWeather as CurrentWeatherData, Unit } from '../types/weather';

interface CurrentWeatherProps {
  city: City;
  current: CurrentWeatherData;
  unit: Unit;
}

function formatMetric(value: number | undefined, unit: string): string {
  if (value === undefined || !Number.isFinite(value)) {
    return 'Indisponível';
  }

  const formattedValue = new Intl.NumberFormat('pt-BR', {
    maximumFractionDigits: 1,
  }).format(value);

  return `${formattedValue} ${unit}`;
}

export default function CurrentWeather({ city, current, unit }: CurrentWeatherProps) {
  const weather = getWeatherPresentation(current.weatherCode);
  const metrics = [
    { label: 'Sensação térmica', value: formatTemperature(current.apparentTemperatureC, unit) },
    { label: 'Umidade', value: formatMetric(current.humidityPercent, '%') },
    { label: 'Vento', value: formatMetric(current.windSpeedKmh, 'km/h') },
    { label: 'Precipitação', value: formatMetric(current.precipitationMm, 'mm') },
    { label: 'Pressão', value: formatMetric(current.pressureHpa, 'hPa') },
  ];

  return (
    <section
      aria-label={`Clima atual em ${city.name}`}
      className="w-full rounded-2xl border border-white/10 bg-white/5 p-5 shadow-glass backdrop-blur-md text-white sm:p-7"
    >
      <div className="flex flex-col items-center gap-3 text-center sm:flex-row sm:justify-between sm:text-left">
        <div>
          <h2 className="text-lg font-medium text-white/75">{city.name}</h2>
          <p className="mt-1 text-sm text-white/60">Clima atual</p>
          {current.time && (
            <p className="mt-1 text-sm text-white/60">
              Atualizado em <time dateTime={current.time}>{formatDateTime(current.time)}</time>
            </p>
          )}
        </div>
        <div className="flex flex-col items-center gap-3 sm:flex-row sm:gap-5">
          <span aria-label={weather.condition} className="text-5xl" role="img">
            {weather.icon}
          </span>
          <div>
            <p className="text-6xl font-semibold leading-none tracking-tight sm:text-7xl">
              {formatTemperature(current.temperatureC, unit)}
            </p>
            <p className="mt-3 text-base text-white/75">{weather.condition}</p>
          </div>
        </div>
      </div>

      <dl className="mt-7 grid grid-cols-2 gap-3 border-t border-white/10 pt-5 sm:grid-cols-4">
        {metrics.map((metric) => (
          <div className="rounded-xl border border-white/10 bg-night-800/60 p-3" key={metric.label}>
            <dt className="text-sm text-white/60">{metric.label}</dt>
            <dd className="mt-1 text-lg font-medium text-white">{metric.value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
