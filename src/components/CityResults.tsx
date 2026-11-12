import type { City } from '../types/weather';

interface CityResultsProps {
  cities: City[];
  onSelect: (city: City) => void;
}

function hasCoordinates(city: City): boolean {
  return Number.isFinite(city.latitude) && Number.isFinite(city.longitude);
}

function getLocationDetails(city: City): string {
  const details = [city.region, city.country].filter((value): value is string => Boolean(value));
  if ((!city.region || !city.country) && hasCoordinates(city)) {
    details.push(`Latitude ${city.latitude}, longitude ${city.longitude}`);
  }
  return details.join(' · ');
}

export default function CityResults({ cities, onSelect }: CityResultsProps) {
  return (
    <section aria-labelledby="city-results-heading" className="space-y-3">
      <div>
        <h2 className="text-base font-semibold" id="city-results-heading">
          Selecione uma cidade
        </h2>
        <p className="mt-1 text-sm text-white/70">
          Escolha a localidade correta para consultar o clima.
        </p>
      </div>
      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {cities.map((city) => {
          const selectable = hasCoordinates(city);
          const locationDetails = getLocationDetails(city);
          const key = `${city.id ?? city.name}-${city.latitude ?? ''}-${city.longitude ?? ''}`;
          const unavailableDescriptionId = `city-unavailable-${key}`;

          return (
            <li key={key}>
              <button
                aria-describedby={selectable ? undefined : unavailableDescriptionId}
                className="w-full rounded-xl border border-white/10 bg-white/5 p-4 text-left text-white shadow-glass backdrop-blur-md enabled:hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-400 disabled:cursor-not-allowed disabled:opacity-60"
                disabled={!selectable}
                onClick={() => onSelect(city)}
                type="button"
              >
                <span className="block font-semibold">{city.name}</span>
                {locationDetails && (
                  <span className="mt-1 block text-sm text-white/70">{locationDetails}</span>
                )}
              </button>
              {!selectable && (
                <p className="mt-1 text-sm text-white/70" id={unavailableDescriptionId}>
                  Não é possível consultar esta localidade sem coordenadas.
                </p>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
