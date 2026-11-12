import type { ForecastDay, Unit } from '../types/weather';
import ForecastCard from './ForecastCard';

interface ForecastListProps {
  days: ForecastDay[];
  unit: Unit;
}

export default function ForecastList({ days, unit }: ForecastListProps) {
  return (
    <section aria-labelledby="forecast-heading" className="w-full">
      <h2 className="mb-4 text-lg font-semibold text-white" id="forecast-heading">
        Previsão de 5 dias
      </h2>
      {days.length > 0 && days.length < 5 && (
        <p className="mb-3 text-sm text-white/70">Previsão incompleta.</p>
      )}
      {days.length > 0 ? (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {days.map((day) => (
            <li className="min-w-0" key={day.date}>
              <ForecastCard day={day} unit={unit} />
            </li>
          ))}
        </ul>
      ) : (
        <p className="rounded-xl border border-white/10 bg-white/5 p-4 text-sm text-white/70">
          Previsão indisponível.
        </p>
      )}
    </section>
  );
}
