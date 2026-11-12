import { useEffect, useRef, useState } from 'react';
import CityResults from './components/CityResults';
import CurrentWeather from './components/CurrentWeather';
import ForecastList from './components/ForecastList';
import SearchBar from './components/SearchBar';
import EmptyState from './components/states/EmptyState';
import ErrorState from './components/states/ErrorState';
import LoadingState from './components/states/LoadingState';
import UnitToggle from './components/UnitToggle';
import { useWeather } from './hooks/useWeather';
import type { Unit } from './types/weather';

export default function App() {
  const [unit, setUnit] = useState<Unit>('celsius');
  const resultRef = useRef<HTMLDivElement>(null);

  const { status, data, cities, error, query, search, selectCity, retry } = useWeather();

  useEffect(() => {
    const activeElement = document.activeElement;
    if (
      (status === 'results' || status === 'success' || status === 'empty') &&
      (activeElement === document.body ||
        activeElement?.matches(':disabled') ||
        activeElement?.closest('form[role="search"]'))
    ) {
      resultRef.current?.focus();
    }
  }, [status]);

  function renderWeatherState() {
    switch (status) {
      case 'idle':
        return (
          <EmptyState
            hint="Digite o nome de uma cidade para consultar a previsão do tempo."
            title="Busque uma cidade"
          />
        );
      case 'loading':
        return null;
      case 'results':
        return <CityResults cities={cities} onSelect={selectCity} />;
      case 'empty':
        if (data) {
          return (
            <EmptyState
              hint={`Não há dados meteorológicos disponíveis para ${data.city.name}.`}
              title="Clima indisponível"
            />
          );
        }
        return (
          <EmptyState
            hint={`Não encontramos “${query}”. Confira o nome e tente novamente.`}
            title="Nenhuma cidade encontrada"
          />
        );
      case 'error':
        return (
          <ErrorState
            message={error ?? 'Não foi possível carregar os dados do clima. Tente novamente.'}
            onRetry={retry}
          />
        );
      case 'success':
        if (!data) return null;
        return (
          <div className="space-y-6">
            {data.current ? (
              <CurrentWeather city={data.city} current={data.current} unit={unit} />
            ) : (
              <EmptyState
                hint="Os dados atuais não estão disponíveis para esta cidade."
                title="Clima atual indisponível"
              />
            )}
            <ForecastList days={data.forecastDays} unit={unit} />
          </div>
        );
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-night-800 to-night-900 text-white">
      <header className="border-b border-white/10 bg-night-900/40 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl flex-col gap-5 px-4 py-5 sm:px-6 lg:flex-row lg:items-center lg:justify-between">
          <a
            aria-label="Clima — início"
            className="flex items-center gap-3 self-start rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-400 focus-visible:ring-offset-2 focus-visible:ring-offset-night-900"
            href="#main"
          >
            <span
              aria-hidden="true"
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent-500 text-xl font-bold text-night-900"
            >
              C
            </span>
            <span className="text-lg font-semibold tracking-wide">Clima</span>
          </a>

          <div className="grid w-full gap-3 sm:grid-cols-[minmax(0,1fr)_auto] lg:max-w-3xl">
            <SearchBar disabled={status === 'loading'} onSearch={search} />
            <div className="flex items-center justify-start sm:justify-end">
              <UnitToggle onChange={setUnit} unit={unit} />
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10" id="main">
        <div className="mb-6">
          <p className="text-sm font-medium uppercase text-accent-400">Previsão local</p>
          <h1 className="mt-2 text-2xl font-semibold sm:text-3xl">Clima da sua cidade</h1>
        </div>
        {status === 'loading' && <LoadingState message="Buscando previsão do tempo..." />}
        <div
          aria-busy={status === 'loading'}
          aria-label="Resultado da previsão"
          className="min-h-40 rounded-md focus:outline-none focus:ring-2 focus:ring-accent-400"
          ref={resultRef}
          role="region"
          tabIndex={-1}
        >
          {renderWeatherState()}
        </div>
      </main>
    </div>
  );
}
